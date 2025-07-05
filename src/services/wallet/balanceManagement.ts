/**
 * Wallet Balance Management and Top-up Logic
 * Advanced wallet operations for balance tracking, auto top-up, and payment processing
 */

import { prisma } from '../../utils';
import { VMSpecification } from '../../utils/pricing/datacentrixPricing';
import { calculateRequiredTopup } from './vmProvisioningValidation';

export interface WalletBalance {
  organisationId: string;
  balance: number;
  balanceInCurrency: number;
  currency: string;
  lastUpdated: Date;
  autoTopupEnabled: boolean;
  autoTopupThreshold?: number;
  autoTopupAmount?: number;
}

export interface TopupRequest {
  organisationId: string;
  amount: number;
  paymentMethod?: 'manual' | 'auto' | 'card';
  reference?: string;
  notes?: string;
}

export interface TopupResult {
  success: boolean;
  transactionId?: string;
  newBalance: number;
  chargedAmount: number;
  paymentReference?: string;
  message: string;
}

export interface AutoTopupConfig {
  organisationId: string;
  enabled: boolean;
  threshold: number;
  topupAmount: number;
  paymentMethodId?: string;
}

export interface BalanceMonitoringAlert {
  organisationId: string;
  alertType: 'low_balance' | 'negative_balance' | 'auto_topup_triggered' | 'auto_topup_failed';
  currentBalance: number;
  threshold?: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: Date;
}

/**
 * Get comprehensive wallet balance information
 */
export async function getWalletBalance(organisationId: string): Promise<WalletBalance | null> {
  const wallet = await prisma.organisationWallet.findUnique({
    where: { organisationId }
  });

  if (!wallet) {
    return null;
  }

  const balanceInCurrency = wallet.balance / (+process.env.TO_CENTS_FACTOR! || 100);

  return {
    organisationId: wallet.organisationId,
    balance: wallet.balance,
    balanceInCurrency,
    currency: wallet.currency,
    lastUpdated: wallet.updatedAt,
    autoTopupEnabled: wallet.enabled,
    autoTopupThreshold: wallet.threshold ? wallet.threshold / (+process.env.TO_CENTS_FACTOR! || 100) : undefined,
    autoTopupAmount: wallet.topupAmount ? wallet.topupAmount / (+process.env.TO_CENTS_FACTOR! || 100) : undefined
  };
}

/**
 * Process manual wallet top-up
 */
export async function processManualTopup(request: TopupRequest): Promise<TopupResult> {
  if (request.amount <= 0) {
    return {
      success: false,
      newBalance: 0,
      chargedAmount: 0,
      message: 'Top-up amount must be greater than 0'
    };
  }

  const amountInCents = request.amount * (+process.env.TO_CENTS_FACTOR! || 100);
  const transactionId = `topup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get current wallet
      const wallet = await tx.organisationWallet.findUnique({
        where: { organisationId: request.organisationId }
      });

      if (!wallet) {
        throw new Error('Organisation wallet not found');
      }

      // Update wallet balance
      const updatedWallet = await tx.organisationWallet.update({
        where: { organisationId: request.organisationId },
        data: { balance: { increment: amountInCents } }
      });

      // Create transaction record
      await tx.walletTransactions.create({
        data: {
          walletId: wallet.id,
          amount: request.amount,
          type: 'topup',
          description: `Manual wallet top-up - ${request.paymentMethod || 'manual'} - ${request.reference || transactionId}${request.notes ? ` - ${request.notes}` : ''}`
        }
      });

      return {
        newBalance: updatedWallet.balance / (+process.env.TO_CENTS_FACTOR! || 100),
        transactionId
      };
    });

    return {
      success: true,
      transactionId: result.transactionId,
      newBalance: result.newBalance,
      chargedAmount: request.amount,
      paymentReference: request.reference,
      message: `Successfully topped up wallet with ${request.amount.toFixed(2)} ${await getWalletCurrency(request.organisationId)}`
    };

  } catch (error) {
    console.error('Manual top-up error:', error);
    return {
      success: false,
      newBalance: 0,
      chargedAmount: 0,
      message: `Top-up failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Configure auto top-up settings
 */
export async function configureAutoTopup(config: AutoTopupConfig): Promise<{ success: boolean; message: string }> {
  if (config.enabled && (config.threshold <= 0 || config.topupAmount <= 0)) {
    return {
      success: false,
      message: 'Auto top-up threshold and amount must be greater than 0 when enabled'
    };
  }

  try {
    const thresholdInCents = config.enabled ? config.threshold * (+process.env.TO_CENTS_FACTOR! || 100) : null;
    const topupAmountInCents = config.enabled ? config.topupAmount * (+process.env.TO_CENTS_FACTOR! || 100) : null;

    await prisma.organisationWallet.update({
      where: { organisationId: config.organisationId },
      data: {
        enabled: config.enabled,
        threshold: thresholdInCents,
        topupAmount: topupAmountInCents
      }
    });

    return {
      success: true,
      message: config.enabled 
        ? `Auto top-up configured: ${config.threshold} threshold, ${config.topupAmount} top-up amount`
        : 'Auto top-up disabled'
    };

  } catch (error) {
    console.error('Auto top-up configuration error:', error);
    return {
      success: false,
      message: `Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if auto top-up should be triggered and execute if needed
 */
export async function checkAndTriggerAutoTopup(organisationId: string): Promise<BalanceMonitoringAlert | null> {
  const wallet = await prisma.organisationWallet.findUnique({
    where: { organisationId }
  });

  if (!wallet || !wallet.enabled || !wallet.threshold || !wallet.topupAmount) {
    return null;
  }

  const currentBalance = wallet.balance / (+process.env.TO_CENTS_FACTOR! || 100);
  const threshold = wallet.threshold / (+process.env.TO_CENTS_FACTOR! || 100);

  // Check if balance is below threshold
  if (currentBalance > threshold) {
    return null;
  }

  // Trigger auto top-up
  const topupAmount = wallet.topupAmount / (+process.env.TO_CENTS_FACTOR! || 100);
  
  try {
    const topupResult = await processAutoTopup(organisationId, topupAmount);
    
    if (topupResult.success) {
      return {
        organisationId,
        alertType: 'auto_topup_triggered',
        currentBalance: topupResult.newBalance,
        threshold,
        severity: 'info',
        message: `Auto top-up successful: Added ${topupAmount} to wallet. New balance: ${topupResult.newBalance.toFixed(2)}`,
        triggeredAt: new Date()
      };
    } else {
      return {
        organisationId,
        alertType: 'auto_topup_failed',
        currentBalance,
        threshold,
        severity: 'critical',
        message: `Auto top-up failed: ${topupResult.message}`,
        triggeredAt: new Date()
      };
    }

  } catch (error) {
    return {
      organisationId,
      alertType: 'auto_topup_failed',
      currentBalance,
      threshold,
      severity: 'critical',
      message: `Auto top-up error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      triggeredAt: new Date()
    };
  }
}

/**
 * Process automatic top-up using stored payment method
 */
async function processAutoTopup(organisationId: string, amount: number): Promise<TopupResult> {
  // This would integrate with your payment gateway
  // For testing purposes, we'll simulate a successful payment
  
  const simulatePaymentGateway = process.env.NODE_ENV === 'test' || process.env.SIMULATE_PAYMENTS === 'true';
  
  if (simulatePaymentGateway) {
    // Simulate successful payment
    return await processManualTopup({
      organisationId,
      amount,
      paymentMethod: 'auto',
      reference: `auto-topup-${Date.now()}`,
      notes: 'Automatic top-up via stored payment method'
    });
  }

  // Real implementation would call payment gateway here
  // For now, return a placeholder
  return {
    success: false,
    newBalance: 0,
    chargedAmount: 0,
    message: 'Auto top-up not implemented - payment gateway integration required'
  };
}

/**
 * Monitor wallet balance and generate alerts
 */
export async function monitorWalletBalance(organisationId: string): Promise<BalanceMonitoringAlert[]> {
  const alerts: BalanceMonitoringAlert[] = [];
  const wallet = await getWalletBalance(organisationId);

  if (!wallet) {
    return alerts;
  }

  const currentBalance = wallet.balanceInCurrency;

  // Check for negative balance
  if (currentBalance < 0) {
    alerts.push({
      organisationId,
      alertType: 'negative_balance',
      currentBalance,
      severity: 'critical',
      message: `CRITICAL: Wallet balance is negative (${currentBalance.toFixed(2)}). Immediate top-up required.`,
      triggeredAt: new Date()
    });
  }

  // Check for low balance (if auto top-up is configured)
  if (wallet.autoTopupEnabled && wallet.autoTopupThreshold) {
    if (currentBalance <= wallet.autoTopupThreshold && currentBalance >= 0) {
      alerts.push({
        organisationId,
        alertType: 'low_balance',
        currentBalance,
        threshold: wallet.autoTopupThreshold,
        severity: 'warning',
        message: `Low balance warning: Current balance (${currentBalance.toFixed(2)}) is at or below threshold (${wallet.autoTopupThreshold.toFixed(2)})`,
        triggeredAt: new Date()
      });
    }
  }

  // Check for auto top-up trigger
  const autoTopupAlert = await checkAndTriggerAutoTopup(organisationId);
  if (autoTopupAlert) {
    alerts.push(autoTopupAlert);
  }

  return alerts;
}

/**
 * Calculate optimal top-up amount based on usage patterns
 */
export async function calculateOptimalTopup(
  organisationId: string, 
  plannedVMs?: VMSpecification[]
): Promise<{
  recommendedAmount: number;
  reasoning: string;
  breakdown: {
    currentBalance: number;
    plannedVMCost?: number;
    bufferAmount: number;
    totalRecommended: number;
  };
}> {
  const wallet = await getWalletBalance(organisationId);
  const currentBalance = wallet?.balanceInCurrency || 0;

  // Get recent spending patterns (last 30 days)
  const recentTransactions = await prisma.walletTransactions.findMany({
    where: {
      organisationwallet: {
        organisationId
      },
      type: 'debit',
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const monthlySpending = Math.abs(recentTransactions.reduce((sum, tx) => sum + tx.amount, 0));
  const averageDailySpending = monthlySpending / 30;

  let recommendedAmount = 0;
  let reasoning = '';
  let plannedVMCost = 0;

  // Calculate for planned VMs if provided
  if (plannedVMs && plannedVMs.length > 0) {
    plannedVMCost = calculateRequiredTopup(currentBalance, plannedVMs);
    recommendedAmount += plannedVMCost;
    reasoning += `Planned VM provisioning requires ${plannedVMCost.toFixed(2)}. `;
  }

  // Add buffer based on spending patterns
  const bufferDays = 15; // 15-day buffer
  const bufferAmount = averageDailySpending * bufferDays;
  recommendedAmount += bufferAmount;

  // Ensure minimum top-up amount
  const minimumTopup = 100; // Minimum 100 ZAR
  if (recommendedAmount < minimumTopup) {
    recommendedAmount = minimumTopup;
    reasoning += `Minimum top-up amount applied (${minimumTopup}). `;
  }

  reasoning += `Based on average daily spending of ${averageDailySpending.toFixed(2)}, recommending ${bufferDays}-day buffer of ${bufferAmount.toFixed(2)}.`;

  return {
    recommendedAmount: Math.ceil(recommendedAmount),
    reasoning,
    breakdown: {
      currentBalance,
      plannedVMCost: plannedVMs ? plannedVMCost : undefined,
      bufferAmount,
      totalRecommended: Math.ceil(recommendedAmount)
    }
  };
}

/**
 * Get wallet currency
 */
async function getWalletCurrency(organisationId: string): Promise<string> {
  const wallet = await prisma.organisationWallet.findUnique({
    where: { organisationId },
    select: { currency: true }
  });
  return wallet?.currency || 'ZAR';
}

/**
 * Get detailed wallet transaction history
 */
export async function getWalletTransactionHistory(
  organisationId: string,
  limit: number = 50,
  offset: number = 0
) {
  const wallet = await prisma.organisationWallet.findUnique({
    where: { organisationId }
  });

  if (!wallet) {
    return { transactions: [], total: 0 };
  }

  const [transactions, total] = await Promise.all([
    prisma.walletTransactions.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.walletTransactions.count({
      where: { walletId: wallet.id }
    })
  ]);

  return {
    transactions: transactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      createdAt: tx.createdAt,
      isCredit: tx.amount > 0,
      isDebit: tx.amount < 0
    })),
    total
  };
}