import { NextRequest, NextResponse } from 'next/server';

// Mock transaction data that simulates both PAYG/Credit Card and Invoice customers
const mockWalletData = {
  // Credit Card Customer (Adcock)
  'adcock-org-id': {
    organizationName: 'Adcock',
    billingType: 'credit_card',
    paymentMethod: 'credit_card',
    currentBalance: 15420, // R154.20 in cents
    creditLimit: null,
    autoTopupEnabled: true,
    transactions: [
      {
        id: 'tx-001',
        amount: -900, // R9.00 VM hourly charge
        type: 'debit',
        description: 'Hourly VM usage - vm-prod-001 - 2vCPU/4GB - Rate: 0.2094/hr',
        createdAt: '2025-07-07T08:30:00Z',
        balanceAfter: 15420
      },
      {
        id: 'tx-002', 
        amount: 50000, // R500.00 auto top-up
        type: 'credit',
        description: 'Auto top-up via Credit Card ****1234',
        createdAt: '2025-07-07T07:00:00Z',
        balanceAfter: 16320
      },
      {
        id: 'tx-003',
        amount: -27500, // R275.00 disk provisioning
        type: 'debit',
        description: 'VM Disk Provisioning - 100GB Premium Storage - vm-prod-001',
        createdAt: '2025-07-06T14:22:00Z',
        balanceAfter: -33680
      },
      {
        id: 'tx-004',
        amount: -15500, // R155.00 vCPU monthly reservation
        type: 'debit', 
        description: 'VM Billing Setup - Monthly vCPU reservation - 1x2GHz vCPU',
        createdAt: '2025-07-06T14:22:00Z',
        balanceAfter: -6180
      }
    ]
  },
  
  // Invoice Customer (Vodacom)
  'vodacom-org-id': {
    organizationName: 'Vodacom',
    billingType: 'invoice',
    paymentMethod: null,
    currentBalance: -8750, // R87.50 negative (using credit)
    creditLimit: 10000000, // R100,000 credit limit
    creditUsed: 8750,
    paymentTerms: 'net30',
    autoTopupEnabled: false,
    transactions: [
      {
        id: 'tx-101',
        amount: -1860, // R18.60 VM hourly charges
        type: 'debit',
        description: 'Hourly VM usage - vm-prod-web-01 - 4vCPU/8GB - Rate: 0.4187/hr',
        createdAt: '2025-07-07T09:00:00Z',
        balanceAfter: -8750
      },
      {
        id: 'tx-102',
        amount: -2280, // R22.80 VM hourly charges
        type: 'debit', 
        description: 'Hourly VM usage - vm-prod-db-01 - 8vCPU/16GB - Rate: 0.8375/hr',
        createdAt: '2025-07-07T09:00:00Z',
        balanceAfter: -6890
      },
      {
        id: 'tx-103',
        amount: 12500, // R125.00 rollover credit from previous month
        type: 'credit',
        description: 'Month-end rollover credit - 2025-06 - Unused compute reservation: 125.00',
        createdAt: '2025-07-01T00:00:00Z',
        balanceAfter: -4610
      },
      {
        id: 'tx-104',
        amount: -55000, // R550.00 multiple VM setup
        type: 'debit',
        description: 'VM Disk Provisioning - 200GB Premium Storage - vm-prod-web-01 & vm-prod-db-01',
        createdAt: '2025-06-28T16:45:00Z',
        balanceAfter: -17110
      },
      {
        id: 'tx-105',
        amount: -46500, // R465.00 monthly vCPU reservations
        type: 'debit',
        description: 'VM Billing Setup - Monthly vCPU reservation - 3x2GHz vCPU (web+db servers)',
        createdAt: '2025-06-28T16:45:00Z',
        balanceAfter: 37890
      },
      {
        id: 'tx-106',
        amount: 25000, // R250.00 invoice payment
        type: 'credit',
        description: 'Invoice Payment - INV-2025-06-001 - Paid via EFT',
        createdAt: '2025-06-25T10:30:00Z',
        balanceAfter: 84390
      }
    ]
  },

  // Another Credit Card Customer (Manchest U)
  'manchest-org-id': {
    organizationName: 'Manchest U',
    billingType: 'credit_card',
    paymentMethod: 'credit_card', 
    currentBalance: 0, // Empty wallet - needs top-up
    creditLimit: null,
    autoTopupEnabled: false,
    lowBalanceAlerts: true,
    transactions: [
      {
        id: 'tx-201',
        amount: -750, // R7.50 failed charge (insufficient funds)
        type: 'debit',
        description: 'Failed: Hourly VM usage - vm-test-001 - 1vCPU/2GB - Insufficient balance',
        createdAt: '2025-07-07T10:15:00Z',
        balanceAfter: 0,
        status: 'failed'
      },
      {
        id: 'tx-202',
        amount: -18000, // R180.00 disk charge that depleted wallet
        type: 'debit',
        description: 'VM Disk Provisioning - 100GB Standard Storage - vm-test-001',
        createdAt: '2025-07-05T11:20:00Z',
        balanceAfter: 0
      },
      {
        id: 'tx-203',
        amount: 20000, // R200.00 manual top-up
        type: 'credit',
        description: 'Manual top-up via Credit Card ****5678',
        createdAt: '2025-07-05T09:00:00Z',
        balanceAfter: 18000
      }
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const transactionType = searchParams.get('type'); // 'credit', 'debit', or null for all

    if (!organizationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Organization ID is required' 
      }, { status: 400 });
    }

    // Get mock data for the organization
    const walletData = mockWalletData[organizationId as keyof typeof mockWalletData];
    
    if (!walletData) {
      return NextResponse.json({
        success: false,
        error: 'Wallet not found for organization'
      }, { status: 404 });
    }

    // Filter transactions by type if specified
    let transactions = walletData.transactions;
    if (transactionType) {
      transactions = transactions.filter(tx => tx.type === transactionType);
    }

    // Apply pagination
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    // Calculate summary statistics
    const totalCredits = transactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const totalDebits = transactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return NextResponse.json({
      success: true,
      data: {
        organization: {
          name: walletData.organizationName,
          billingType: walletData.billingType,
          paymentMethod: walletData.paymentMethod,
          paymentTerms: walletData.paymentTerms
        },
        wallet: {
          currentBalance: walletData.currentBalance,
          creditLimit: walletData.creditLimit,
          creditUsed: walletData.creditUsed,
          autoTopupEnabled: walletData.autoTopupEnabled,
          formattedBalance: `R${(Math.abs(walletData.currentBalance) / 100).toFixed(2)}`,
          balanceStatus: walletData.currentBalance >= 0 ? 'positive' : 'negative'
        },
        transactions: paginatedTransactions.map(tx => ({
          ...tx,
          formattedAmount: `R${(Math.abs(tx.amount) / 100).toFixed(2)}`,
          amountColor: tx.type === 'credit' ? 'success' : 'error',
          relativeTime: getRelativeTime(tx.createdAt)
        })),
        summary: {
          totalTransactions: transactions.length,
          totalCredits: `R${(totalCredits / 100).toFixed(2)}`,
          totalDebits: `R${(totalDebits / 100).toFixed(2)}`,
          netMovement: `R${((totalCredits - totalDebits) / 100).toFixed(2)}`
        },
        pagination: {
          limit,
          offset,
          hasMore: (offset + limit) < transactions.length,
          total: transactions.length
        }
      }
    });

  } catch (error) {
    console.error('Wallet statement API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}