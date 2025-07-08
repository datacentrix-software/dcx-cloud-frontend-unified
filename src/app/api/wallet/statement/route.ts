import { NextRequest, NextResponse } from 'next/server';

/**
 * Wallet Statement API - Powered by Advanced Simulation Engine
 * Provides comprehensive wallet transaction history with mathematical accuracy
 */

// Import simulation data from simulation route
async function getSimulationData(organizationId: string, months: number = 6) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
    : 'http://localhost:3000';
    
  const response = await fetch(`${baseUrl}/api/wallet/simulation?organizationId=${organizationId}&months=${months}`);
  if (!response.ok) {
    throw new Error(`Simulation API failed: ${response.status}`);
  }
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const transactionType = searchParams.get('type'); // 'credit', 'debit', or null for all
    const months = parseInt(searchParams.get('months') || '6');

    if (!organizationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Organization ID is required' 
      }, { status: 400 });
    }

    // Get simulation data which has the comprehensive transaction history
    let simulationResult;
    try {
      simulationResult = await getSimulationData(organizationId, months);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to load wallet simulation data'
      }, { status: 404 });
    }

    if (!simulationResult.success) {
      return NextResponse.json({
        success: false,
        error: simulationResult.error || 'Wallet not found for organization'
      }, { status: 404 });
    }

    const simulationData = simulationResult.data;
    
    // Filter transactions by type if specified
    let transactions = simulationData.transactions;
    if (transactionType) {
      transactions = transactions.filter(tx => tx.type === transactionType);
    }

    // Sort transactions by date (most recent first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    // Calculate summary statistics from ALL transactions (not just paginated)
    const totalCredits = transactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const totalDebits = transactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Extract organization profile from simulation
    const organizationData = simulationData.organization;
    const walletData = simulationData.wallet;

    // Determine payment method and terms based on billing type
    const paymentMethod = organizationData.billingType === 'credit_card' ? 'credit_card' : null;
    const paymentTerms = organizationData.billingType === 'invoice' ? 'net30' : null;
    const creditLimit = organizationData.billingType === 'invoice' ? 10000000 : null; // R100,000 credit limit for invoice customers
    const creditUsed = organizationData.billingType === 'invoice' && walletData.currentBalance < 0 
      ? Math.abs(walletData.currentBalance) : 0;

    return NextResponse.json({
      success: true,
      data: {
        organization: {
          name: organizationData.name,
          billingType: organizationData.billingType,
          paymentMethod: paymentMethod,
          paymentTerms: paymentTerms,
          sector: organizationData.sector,
          pattern: organizationData.pattern
        },
        wallet: {
          currentBalance: walletData.currentBalance,
          creditLimit: creditLimit,
          creditUsed: creditUsed,
          autoTopupEnabled: organizationData.billingType === 'credit_card',
          formattedBalance: walletData.formattedBalance,
          balanceStatus: walletData.balanceStatus
        },
        transactions: paginatedTransactions.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          createdAt: tx.createdAt,
          balanceAfter: tx.balanceAfter,
          category: tx.category,
          vmId: tx.vmId,
          vmType: tx.vmType,
          metadata: tx.metadata,
          status: tx.status || 'completed',
          formattedAmount: tx.formattedAmount,
          amountColor: tx.amountColor,
          relativeTime: tx.relativeTime
        })),
        summary: {
          totalTransactions: transactions.length,
          totalCredits: `R${(totalCredits / 100).toFixed(2)}`,
          totalDebits: `R${(totalDebits / 100).toFixed(2)}`,
          netMovement: `R${((totalCredits - totalDebits) / 100).toFixed(2)}`,
          vmStats: simulationData.summary.vmStats,
          simulationPeriod: `${months} months`
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

