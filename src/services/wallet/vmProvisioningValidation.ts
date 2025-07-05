/**
 * VM Provisioning Wallet Validation Service
 * Core logic for validating wallet balance before VM provisioning
 */

import { prisma } from '../../utils';
import { 
  calculateVMPricing, 
  calculateMultiVMPricing, 
  VMSpecification, 
  PricingBreakdown,
  MultiVMPricing
} from '../../utils/pricing/datacentrixPricing';

export interface VMProvisioningRequest {
  organisationId: string;
  vms: VMSpecification[];
  vcenterInstanceUuid?: string; // For integration with existing vCenter data
}

export interface WalletValidationResult {
  isValid: boolean;
  totalCost: PricingBreakdown | MultiVMPricing;
  currentBalance: number;
  shortfall?: number;
  immediateCharge: number;
  reservedAmount: number;
  message: string;
}

export interface VMProvisioningTransaction {
  organisationId: string;
  vmSpecifications: VMSpecification[];
  totalCost: PricingBreakdown | MultiVMPricing;
  vcenterInstanceUuid?: string;
  transactionId: string;
}

/**
 * Validate wallet balance for VM provisioning
 * Implements Datacentrix billing model: immediate disk charge + compute reservation
 */
export async function validateVMProvisioning(
  request: VMProvisioningRequest
): Promise<WalletValidationResult> {
  
  // Get current wallet balance
  const wallet = await prisma.organisationWallet.findUnique({
    where: { organisationId: request.organisationId }
  });

  if (!wallet) {
    return {
      isValid: false,
      totalCost: { 
        basePrice: 0,
        cpuCost: 0,
        vcpuCost: 0, 
        memoryCost: 0,
        ramCost: 0, 
        diskCost: 0, 
        networkCost: 0,
        osCost: 0,
        backupCost: 0,
        monitoringCost: 0,
        totalHourlyRate: 0,
        hourlyRate: 0,
        totalMonthlyRate: 0,
        totalMonthlyCost: 0, 
        immediateCharge: 0, 
        currency: 'ZAR'
      },
      currentBalance: 0,
      immediateCharge: 0,
      reservedAmount: 0,
      message: 'Organisation does not have a wallet. Please set up wallet first.'
    };
  }

  // Calculate total provisioning cost
  const totalCost = request.vms.length === 1 
    ? calculateVMPricing(request.vms[0])
    : calculateMultiVMPricing(request.vms);

  // Convert balance from cents to currency
  const currentBalanceInCurrency = wallet.balance / (+process.env.TO_CENTS_FACTOR! || 100);
  
  // Validate sufficient balance for full monthly cost
  const isValid = currentBalanceInCurrency >= totalCost.totalMonthlyCost;
  
  const result: WalletValidationResult = {
    isValid,
    totalCost,
    currentBalance: currentBalanceInCurrency,
    immediateCharge: totalCost.immediateCharge,
    reservedAmount: totalCost.vcpuCost + totalCost.ramCost,
    message: isValid 
      ? `Wallet validation successful. Ready to provision ${request.vms.length} VM(s).`
      : `Insufficient funds. Need ${totalCost.totalMonthlyCost.toFixed(2)} ZAR, have ${currentBalanceInCurrency.toFixed(2)} ZAR.`
  };

  if (!isValid) {
    result.shortfall = totalCost.totalMonthlyCost - currentBalanceInCurrency;
  }

  return result;
}

/**
 * Process VM provisioning charges
 * Charges immediate disk costs and sets up compute billing
 */
export async function processVMProvisioningCharges(
  request: VMProvisioningRequest
): Promise<VMProvisioningTransaction> {
  
  // First validate the provisioning
  const validation = await validateVMProvisioning(request);
  
  if (!validation.isValid) {
    throw new Error(`VM provisioning validation failed: ${validation.message}`);
  }

  const transactionId = `vm-provision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Start database transaction
  const result = await prisma.$transaction(async (tx) => {
    
    // 1. Charge immediate disk costs
    const immediateChargeInCents = validation.immediateCharge * (+process.env.TO_CENTS_FACTOR! || 100);
    
    await tx.organisationWallet.update({
      where: { organisationId: request.organisationId },
      data: { balance: { decrement: immediateChargeInCents } }
    });

    // 2. Log the immediate charge transaction
    await tx.walletTransactions.create({
      data: {
        walletId: (await tx.organisationWallet.findUnique({
          where: { organisationId: request.organisationId }
        }))!.id,
        amount: -validation.immediateCharge,
        type: 'debit',
        description: `VM provisioning immediate disk charge - ${request.vms.length} VM(s) - Transaction: ${transactionId}`
      }
    });

    // 3. Create VM provisioning record for hourly billing tracking
    // Note: This would integrate with your existing vCenter data structure
    // For now, we'll create a placeholder that can be linked via vcenterInstanceUuid
    
    return {
      organisationId: request.organisationId,
      vmSpecifications: request.vms,
      totalCost: validation.totalCost,
      vcenterInstanceUuid: request.vcenterInstanceUuid,
      transactionId
    };
  });

  return result;
}

/**
 * Get wallet status for VM provisioning dashboard
 */
export async function getWalletProvisioningStatus(organisationId: string) {
  const wallet = await prisma.organisationWallet.findUnique({
    where: { organisationId },
    include: {
      wallet_transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!wallet) {
    return {
      hasWallet: false,
      balance: 0,
      balanceInCurrency: 0,
      canProvision: false,
      recentTransactions: []
    };
  }

  const balanceInCurrency = wallet.balance / (+process.env.TO_CENTS_FACTOR! || 100);
  
  return {
    hasWallet: true,
    balance: wallet.balance,
    balanceInCurrency,
    canProvision: balanceInCurrency > 0,
    autoTopupEnabled: wallet.enabled,
    autoTopupThreshold: wallet.threshold ? wallet.threshold / (+process.env.TO_CENTS_FACTOR! || 100) : null,
    autoTopupAmount: wallet.topupAmount ? wallet.topupAmount / (+process.env.TO_CENTS_FACTOR! || 100) : null,
    recentTransactions: wallet.wallet_transactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      createdAt: tx.createdAt
    }))
  };
}

/**
 * Calculate minimum wallet top-up needed for VM provisioning
 */
export function calculateRequiredTopup(
  currentBalance: number, 
  vmSpecs: VMSpecification[]
): number {
  const totalCost = vmSpecs.length === 1 
    ? calculateVMPricing(vmSpecs[0])
    : calculateMultiVMPricing(vmSpecs);
    
  const shortfall = totalCost.totalMonthlyCost - currentBalance;
  
  // Add 10% buffer for safety
  return shortfall > 0 ? Math.ceil(shortfall * 1.1) : 0;
}