/**
 * Hourly Billing and Month-End Reconciliation Service
 * Handles continuous VM billing based on actual usage and vCenter integration
 */

import { prisma } from '../../utils';
import { VMSpecification, calculateVMPricing } from '../../utils/pricing/datacentrixPricing';

export interface VMBillingRecord {
  id: string;
  organisationId: string;
  vmSpecification: VMSpecification;
  vcenterInstanceUuid?: string;
  hourlyRate: number;
  reservedMonthlyAmount: number;
  actualUsageThisMonth: number;
  hoursUsedThisMonth: number;
  status: 'active' | 'terminated' | 'suspended';
  createdAt: Date;
  lastBilledAt: Date;
}

export interface HourlyBillingCycle {
  cycleId: string;
  organisationId: string;
  billingPeriod: Date;
  vmsBilled: number;
  totalHourlyCharges: number;
  successfulCharges: number;
  failedCharges: number;
  errors: string[];
  completedAt: Date;
}

export interface MonthEndReconciliation {
  reconciliationId: string;
  organisationId: string;
  month: string; // YYYY-MM format
  totalReservedAmount: number;
  totalActualUsage: number;
  rolloverCredit: number;
  adjustmentAmount: number;
  vmReconciliations: VMReconciliationDetail[];
  reconciledAt: Date;
}

export interface VMReconciliationDetail {
  vmId: string;
  vcenterInstanceUuid?: string;
  reservedAmount: number;
  actualUsage: number;
  hoursUsed: number;
  totalHoursInMonth: number;
  utilizationPercentage: number;
  rolloverAmount: number;
}

export interface VCenterIntegrationData {
  vmInstanceUuid: string;
  powerState: 'POWERED_ON' | 'POWERED_OFF' | 'SUSPENDED';
  powerStateChangeTime: Date;
  vcpuCount: number;
  memoryMB: number;
  diskCapacityGB: number;
}

/**
 * Process hourly billing for all active VMs across all organisations
 */
export async function processHourlyBillingCycle(): Promise<HourlyBillingCycle[]> {
  const cycleId = `billing-cycle-${Date.now()}`;
  const billingPeriod = new Date();
  
  console.log(`Starting hourly billing cycle: ${cycleId} at ${billingPeriod.toISOString()}`);

  // Get all organisations with active VM billing records
  const organisations = await getOrganisationsWithActiveVMs();
  const cycles: HourlyBillingCycle[] = [];

  for (const orgId of organisations) {
    try {
      const cycle = await processOrganisationHourlyBilling(orgId, cycleId, billingPeriod);
      cycles.push(cycle);
    } catch (error) {
      console.error(`Hourly billing failed for organisation ${orgId}:`, error);
      cycles.push({
        cycleId,
        organisationId: orgId,
        billingPeriod,
        vmsBilled: 0,
        totalHourlyCharges: 0,
        successfulCharges: 0,
        failedCharges: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        completedAt: new Date()
      });
    }
  }

  console.log(`Hourly billing cycle completed: ${cycles.length} organisations processed`);
  return cycles;
}

/**
 * Process hourly billing for a single organisation
 */
async function processOrganisationHourlyBilling(
  organisationId: string,
  cycleId: string,
  billingPeriod: Date
): Promise<HourlyBillingCycle> {
  
  // Get active VM billing records for this organisation
  const activeVMs = await getActiveVMBillingRecords(organisationId);
  
  let totalHourlyCharges = 0;
  let successfulCharges = 0;
  let failedCharges = 0;
  const errors: string[] = [];

  for (const vm of activeVMs) {
    try {
      // Check if VM is currently powered on (would integrate with vCenter data)
      const isPoweredOn = await checkVMPowerState(vm.vcenterInstanceUuid);
      
      if (isPoweredOn) {
        // Charge hourly rate
        const chargeResult = await chargeVMHourlyUsage(organisationId, vm);
        
        if (chargeResult.success) {
          totalHourlyCharges += vm.hourlyRate;
          successfulCharges++;
          
          // Update VM billing record
          await updateVMBillingRecord(vm.id, {
            actualUsageThisMonth: vm.actualUsageThisMonth + vm.hourlyRate,
            hoursUsedThisMonth: vm.hoursUsedThisMonth + 1,
            lastBilledAt: billingPeriod
          });
        } else {
          failedCharges++;
          errors.push(`VM ${vm.id}: ${chargeResult.error}`);
        }
      }
    } catch (error) {
      failedCharges++;
      errors.push(`VM ${vm.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    cycleId,
    organisationId,
    billingPeriod,
    vmsBilled: activeVMs.length,
    totalHourlyCharges,
    successfulCharges,
    failedCharges,
    errors,
    completedAt: new Date()
  };
}

/**
 * Charge hourly VM usage to wallet
 */
async function chargeVMHourlyUsage(
  organisationId: string,
  vm: VMBillingRecord
): Promise<{ success: boolean; error?: string }> {
  
  try {
    const amountInCents = vm.hourlyRate * (+process.env.TO_CENTS_FACTOR! || 100);
    
    const result = await prisma.$transaction(async (tx) => {
      // Check wallet balance
      const wallet = await tx.organisationWallet.findUnique({
        where: { organisationId }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balance < amountInCents) {
        throw new Error(`Insufficient balance: need ${vm.hourlyRate.toFixed(2)}, have ${(wallet.balance / 100).toFixed(2)}`);
      }

      // Debit wallet
      await tx.organisationWallet.update({
        where: { organisationId },
        data: { balance: { decrement: amountInCents } }
      });

      // Create transaction record
      await tx.walletTransactions.create({
        data: {
          walletId: wallet.id,
          amount: -vm.hourlyRate,
          type: 'debit',
          description: `Hourly VM usage - ${vm.id} - ${vm.vmSpecification.cpuCores}vCPU/${vm.vmSpecification.memoryGB}GB - Rate: ${vm.hourlyRate.toFixed(4)}/hr`
        }
      });

      return { success: true };
    });

    return result;

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Process month-end reconciliation for all organisations
 */
export async function processMonthEndReconciliation(
  targetMonth?: string // YYYY-MM format, defaults to previous month
): Promise<MonthEndReconciliation[]> {
  
  const reconciliationMonth = targetMonth || getPreviousMonth();
  console.log(`Starting month-end reconciliation for ${reconciliationMonth}`);

  const organisations = await getOrganisationsWithBillingActivity(reconciliationMonth);
  const reconciliations: MonthEndReconciliation[] = [];

  for (const orgId of organisations) {
    try {
      const reconciliation = await processOrganisationReconciliation(orgId, reconciliationMonth);
      reconciliations.push(reconciliation);
    } catch (error) {
      console.error(`Month-end reconciliation failed for organisation ${orgId}:`, error);
    }
  }

  console.log(`Month-end reconciliation completed: ${reconciliations.length} organisations processed`);
  return reconciliations;
}

/**
 * Process month-end reconciliation for a single organisation
 */
async function processOrganisationReconciliation(
  organisationId: string,
  month: string
): Promise<MonthEndReconciliation> {
  
  const reconciliationId = `recon-${month}-${organisationId}-${Date.now()}`;
  
  // Get all VM billing records for this organisation for the month
  const vmBillingRecords = await getVMBillingRecordsForMonth(organisationId, month);
  
  let totalReservedAmount = 0;
  let totalActualUsage = 0;
  const vmReconciliations: VMReconciliationDetail[] = [];

  for (const vm of vmBillingRecords) {
    // Calculate reserved amount for this VM for the month
    const reservedAmount = vm.reservedMonthlyAmount;
    
    // Get actual usage from vCenter data (simulated for testing)
    const actualHours = await getVMActualHoursForMonth(month, vm.vcenterInstanceUuid);
    const actualUsage = actualHours * vm.hourlyRate;
    
    const totalHoursInMonth = getDaysInMonth(month) * 24;
    const utilizationPercentage = (actualHours / totalHoursInMonth) * 100;
    const rolloverAmount = reservedAmount - actualUsage;

    totalReservedAmount += reservedAmount;
    totalActualUsage += actualUsage;

    vmReconciliations.push({
      vmId: vm.id,
      vcenterInstanceUuid: vm.vcenterInstanceUuid,
      reservedAmount,
      actualUsage,
      hoursUsed: actualHours,
      totalHoursInMonth,
      utilizationPercentage,
      rolloverAmount
    });
  }

  const rolloverCredit = totalReservedAmount - totalActualUsage;
  
  // Apply rollover credit to wallet if positive
  let adjustmentAmount = 0;
  if (rolloverCredit > 0) {
    adjustmentAmount = await applyRolloverCredit(organisationId, rolloverCredit, month);
  }

  return {
    reconciliationId,
    organisationId,
    month,
    totalReservedAmount,
    totalActualUsage,
    rolloverCredit,
    adjustmentAmount,
    vmReconciliations,
    reconciledAt: new Date()
  };
}

/**
 * Apply rollover credit to organisation wallet
 */
async function applyRolloverCredit(
  organisationId: string,
  creditAmount: number,
  month: string
): Promise<number> {
  
  const creditInCents = creditAmount * (+process.env.TO_CENTS_FACTOR! || 100);
  
  try {
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.organisationWallet.findUnique({
        where: { organisationId }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Credit wallet with rollover amount
      await tx.organisationWallet.update({
        where: { organisationId },
        data: { balance: { increment: creditInCents } }
      });

      // Create transaction record
      await tx.walletTransactions.create({
        data: {
          walletId: wallet.id,
          amount: creditAmount,
          type: 'credit',
          description: `Month-end rollover credit - ${month} - Unused compute reservation: ${creditAmount.toFixed(2)}`
        }
      });
    });

    return creditAmount;

  } catch (error) {
    console.error(`Failed to apply rollover credit for ${organisationId}:`, error);
    return 0;
  }
}

/**
 * Get VM billing records for a specific month
 */
async function getVMBillingRecordsForMonth(
  organisationId: string,
  month: string
): Promise<VMBillingRecord[]> {
  
  // This would query your VM billing tracking table
  // For now, we'll simulate with wallet transactions
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  const transactions = await prisma.walletTransactions.findMany({
    where: {
      organisationwallet: { organisationId },
      description: { contains: 'VM Billing Setup' },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Convert transactions to VM billing records (simplified)
  return transactions.map(tx => {
    const vmSpec: VMSpecification = {
      cpuCores: 2, // Would parse from description
      memoryGB: 4,
      diskSizeGB: 150,
      diskType: 'ssd',
      networkTier: 'premium',
      backup: false,
      monitoring: false,
      operatingSystem: 'linux'
    };
    
    const pricing = calculateVMPricing(vmSpec);
    
    return {
      id: tx.id,
      organisationId,
      vmSpecification: vmSpec,
      vcenterInstanceUuid: `simulated-vm-${tx.id}`,
      hourlyRate: pricing.hourlyRate,
      reservedMonthlyAmount: pricing.vcpuCost + pricing.ramCost,
      actualUsageThisMonth: 0,
      hoursUsedThisMonth: 0,
      status: 'active' as const,
      createdAt: tx.createdAt,
      lastBilledAt: tx.createdAt
    };
  });
}

/**
 * Helper functions for testing and simulation
 */

async function getOrganisationsWithActiveVMs(): Promise<string[]> {
  // Get organisations that have VM billing records
  const wallets = await prisma.organisationWallet.findMany({
    where: {
      wallet_transactions: {
        some: {
          description: { contains: 'VM Billing Setup' }
        }
      }
    },
    select: { organisationId: true }
  });

  return wallets.map(w => w.organisationId);
}

async function getActiveVMBillingRecords(organisationId: string): Promise<VMBillingRecord[]> {
  // Simulate active VM records from recent billing setup transactions
  const recentTransactions = await prisma.walletTransactions.findMany({
    where: {
      organisationwallet: { organisationId },
      description: { contains: 'VM Billing Setup' },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    take: 10
  });

  return recentTransactions.map(tx => {
    const vmSpec: VMSpecification = {
      cpuCores: 2,
      memoryGB: 4,
      diskSizeGB: 150,
      diskType: 'ssd',
      networkTier: 'premium',
      backup: false,
      monitoring: false,
      operatingSystem: 'linux'
    };
    
    const pricing = calculateVMPricing(vmSpec);
    
    return {
      id: tx.id,
      organisationId,
      vmSpecification: vmSpec,
      vcenterInstanceUuid: `vm-${tx.id}`,
      hourlyRate: pricing.hourlyRate,
      reservedMonthlyAmount: pricing.vcpuCost + pricing.ramCost,
      actualUsageThisMonth: 0,
      hoursUsedThisMonth: 0,
      status: 'active',
      createdAt: tx.createdAt,
      lastBilledAt: tx.createdAt
    };
  });
}

async function checkVMPowerState(vcenterInstanceUuid?: string): Promise<boolean> {
  // In real implementation, this would query vCenter API
  // For testing, simulate 70% uptime
  if (process.env.NODE_ENV === 'test' || process.env.SIMULATE_VCENTER === 'true') {
    return Math.random() < 0.7; // 70% chance VM is powered on
  }
  
  // Real vCenter integration would go here
  return true;
}

async function updateVMBillingRecord(vmId: string, updates: Partial<VMBillingRecord>): Promise<void> {
  // In real implementation, this would update VM billing table
  // For testing, we'll log the update
  console.log(`VM ${vmId} billing updated:`, updates);
}

async function getOrganisationsWithBillingActivity(month: string): Promise<string[]> {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  const wallets = await prisma.organisationWallet.findMany({
    where: {
      wallet_transactions: {
        some: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          OR: [
            { description: { contains: 'VM' } },
            { type: 'debit' }
          ]
        }
      }
    },
    select: { organisationId: true }
  });

  return wallets.map(w => w.organisationId);
}

async function getVMActualHoursForMonth(month: string, vcenterInstanceUuid?: string): Promise<number> {
  // In real implementation, this would query vCenter power state logs
  // For testing, simulate variable usage (40-90% of month)
  const daysInMonth = getDaysInMonth(month);
  const totalHours = daysInMonth * 24;
  const utilizationRate = 0.4 + (Math.random() * 0.5); // 40-90%
  
  return Math.floor(totalHours * utilizationRate);
}

function getPreviousMonth(): string {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(month: string): number {
  const [year, monthNum] = month.split('-').map(Number);
  return new Date(year, monthNum, 0).getDate();
}

/**
 * Get comprehensive billing summary for an organisation
 */
export async function getBillingSummary(
  organisationId: string,
  month?: string
): Promise<{
  currentMonth: {
    activeVMs: number;
    totalReservedAmount: number;
    actualUsageToDate: number;
    projectedMonthlyUsage: number;
  };
  lastReconciliation?: MonthEndReconciliation;
  recentHourlyCharges: number;
}> {
  
  const currentMonth = month || new Date().toISOString().slice(0, 7);
  
  // Get current active VMs
  const activeVMs = await getActiveVMBillingRecords(organisationId);
  
  const totalReservedAmount = activeVMs.reduce((sum, vm) => sum + vm.reservedMonthlyAmount, 0);
  const actualUsageToDate = activeVMs.reduce((sum, vm) => sum + vm.actualUsageThisMonth, 0);
  
  // Project monthly usage based on current rate
  const daysInMonth = getDaysInMonth(currentMonth);
  const dayOfMonth = new Date().getDate();
  const projectedMonthlyUsage = (actualUsageToDate / dayOfMonth) * daysInMonth;

  // Get recent hourly charges (last 24 hours)
  const recentCharges = await prisma.walletTransactions.findMany({
    where: {
      organisationwallet: { organisationId },
      description: { contains: 'Hourly VM usage' },
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  });
  
  const recentHourlyCharges = Math.abs(recentCharges.reduce((sum, tx) => sum + tx.amount, 0));

  return {
    currentMonth: {
      activeVMs: activeVMs.length,
      totalReservedAmount,
      actualUsageToDate,
      projectedMonthlyUsage
    },
    recentHourlyCharges
  };
}