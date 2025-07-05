/**
 * Single Customer VM Provisioning Flow
 * End-to-end workflow for VM provisioning with wallet validation
 */

import { prisma } from '../../utils';
import { 
  validateVMProvisioning,
  processVMProvisioningCharges,
  getWalletProvisioningStatus,
  calculateRequiredTopup,
  VMProvisioningRequest
} from './vmProvisioningValidation';
import { VMSpecification } from '../../utils/pricing/datacentrixPricing';

export interface CustomerVMRequest {
  organisationId: string;
  customerName?: string;
  projectName?: string;
  vms: VMSpecification[];
  notes?: string;
}

export interface VMProvisioningWorkflow {
  step: 'wallet_check' | 'validation' | 'provisioning' | 'billing' | 'completion';
  status: 'success' | 'error' | 'requires_topup';
  message: string;
  data?: any;
  nextAction?: string;
}

export interface CompletedProvisioningFlow {
  workflowId: string;
  organisationId: string;
  customerName?: string;
  projectName?: string;
  vmCount: number;
  totalCost: number;
  immediateCharge: number;
  hourlyRate: number;
  transactionId: string;
  provisionedAt: Date;
  vcenterPlaceholders: string[];
}

/**
 * Execute complete single customer VM provisioning flow
 */
export async function executeSingleCustomerFlow(
  request: CustomerVMRequest
): Promise<VMProvisioningWorkflow[]> {
  
  const workflowId = `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const workflow: VMProvisioningWorkflow[] = [];

  try {
    // Step 1: Check wallet exists and get status
    workflow.push({
      step: 'wallet_check',
      status: 'success',
      message: 'Checking wallet status...'
    });

    const walletStatus = await getWalletProvisioningStatus(request.organisationId);
    
    if (!walletStatus.hasWallet) {
      workflow.push({
        step: 'wallet_check',
        status: 'error',
        message: 'No wallet found for organisation',
        nextAction: 'Setup wallet first using /api/wallet/setup endpoint'
      });
      return workflow;
    }

    workflow[0] = {
      step: 'wallet_check',
      status: 'success',
      message: `Wallet found with balance: ZAR ${walletStatus.balanceInCurrency.toFixed(2)}`,
      data: { 
        currentBalance: walletStatus.balanceInCurrency,
        autoTopupEnabled: walletStatus.autoTopupEnabled 
      }
    };

    // Step 2: Validate VM provisioning
    workflow.push({
      step: 'validation',
      status: 'success',
      message: 'Validating VM provisioning request...'
    });

    const validation = await validateVMProvisioning({
      organisationId: request.organisationId,
      vms: request.vms
    });

    if (!validation.isValid) {
      const requiredTopup = calculateRequiredTopup(validation.currentBalance, request.vms);
      
      workflow[1] = {
        step: 'validation',
        status: 'requires_topup',
        message: `Insufficient funds: Need ZAR ${validation.totalCost.totalMonthlyCost.toFixed(2)}, have ZAR ${validation.currentBalance.toFixed(2)}`,
        data: {
          shortfall: validation.shortfall,
          requiredTopup: requiredTopup,
          breakdown: validation.totalCost
        },
        nextAction: `Top up wallet with at least ZAR ${requiredTopup} to proceed`
      };
      return workflow;
    }

    workflow[1] = {
      step: 'validation',
      status: 'success',
      message: `Validation successful: ${request.vms.length} VM(s) can be provisioned`,
      data: {
        totalCost: validation.totalCost,
        immediateCharge: validation.immediateCharge,
        reservedAmount: validation.reservedAmount
      }
    };

    // Step 3: Process provisioning and billing
    workflow.push({
      step: 'provisioning',
      status: 'success',
      message: 'Processing VM provisioning...'
    });

    const transaction = await processVMProvisioningCharges({
      organisationId: request.organisationId,
      vms: request.vms
    });

    workflow[2] = {
      step: 'provisioning',
      status: 'success',
      message: `VMs provisioned successfully. Immediate charge: ZAR ${transaction.totalCost.immediateCharge.toFixed(2)}`,
      data: {
        transactionId: transaction.transactionId,
        chargedAmount: transaction.totalCost.immediateCharge
      }
    };

    // Step 4: Update billing records
    workflow.push({
      step: 'billing',
      status: 'success',
      message: 'Creating billing records...'
    });

    // Create VM billing tracking records
    const vmBillingRecords = await createVMBillingRecords({
      workflowId,
      organisationId: request.organisationId,
      customerName: request.customerName,
      projectName: request.projectName,
      vms: request.vms,
      transaction,
      notes: request.notes
    });

    workflow[3] = {
      step: 'billing',
      status: 'success',
      message: `Billing records created for ${request.vms.length} VM(s)`,
      data: {
        billingRecords: vmBillingRecords.length,
        hourlyBillingActive: true
      }
    };

    // Step 5: Complete workflow
    workflow.push({
      step: 'completion',
      status: 'success',
      message: `Single customer flow completed successfully for ${request.vms.length} VM(s)`,
      data: {
        workflowId,
        summary: {
          vmCount: request.vms.length,
          immediateCharge: transaction.totalCost.immediateCharge,
          monthlyReserved: transaction.totalCost.vcpuCost + transaction.totalCost.ramCost,
          hourlyRate: transaction.totalCost.hourlyRate
        }
      }
    });

    return workflow;

  } catch (error) {
    const errorStep = workflow.length > 0 ? workflow[workflow.length - 1].step : 'wallet_check';
    
    workflow.push({
      step: errorStep,
      status: 'error',
      message: `Error in ${errorStep}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: { error: error instanceof Error ? error.message : error }
    });

    return workflow;
  }
}

/**
 * Create VM billing tracking records for hourly billing
 */
async function createVMBillingRecords(params: {
  workflowId: string;
  organisationId: string;
  customerName?: string;
  projectName?: string;
  vms: VMSpecification[];
  transaction: any;
  notes?: string;
}) {
  const records = [];

  // Note: In a real implementation, this would integrate with your VM management system
  // For now, we'll create placeholder records that can be linked to vCenter data
  
  for (let i = 0; i < params.vms.length; i++) {
    const vm = params.vms[i];
    const vmId = `${params.workflowId}-vm-${i + 1}`;
    
    // This would typically be stored in a VM billing table
    // For this test, we'll use wallet transactions as audit trail
    const billingRecord = await prisma.walletTransactions.create({
      data: {
        walletId: (await prisma.organisationWallet.findUnique({
          where: { organisationId: params.organisationId }
        }))!.id,
        amount: 0, // Placeholder - actual hourly charges will be separate
        type: 'adjustment',
        description: `VM Billing Setup - ${vmId} - ${vm.cpuCores}vCPU/${vm.memoryGB}GB/${vm.diskSizeGB}GB - Project: ${params.projectName || 'Default'} - Customer: ${params.customerName || 'N/A'}`
      }
    });
    
    records.push({
      vmId,
      billingRecordId: billingRecord.id,
      spec: vm,
      hourlyRate: (vm.cpuCores * 155 + vm.memoryGB * 38) / 744,
      status: 'active'
    });
  }

  return records;
}

/**
 * Get single customer flow status
 */
export async function getSingleCustomerFlowStatus(organisationId: string) {
  const walletStatus = await getWalletProvisioningStatus(organisationId);
  
  // Get recent VM provisioning transactions
  const recentVMTransactions = walletStatus.recentTransactions?.filter(
    tx => tx.description?.includes('VM provisioning') || tx.description?.includes('VM Billing')
  ) || [];

  return {
    wallet: {
      balance: walletStatus.balanceInCurrency,
      canProvision: walletStatus.canProvision,
      autoTopupEnabled: walletStatus.autoTopupEnabled,
      autoTopupThreshold: walletStatus.autoTopupThreshold,
      autoTopupAmount: walletStatus.autoTopupAmount
    },
    recentVMActivity: recentVMTransactions.map(tx => ({
      date: tx.createdAt,
      amount: tx.amount,
      description: tx.description,
      type: tx.type
    })),
    activeVMs: recentVMTransactions.filter(tx => 
      tx.description?.includes('VM Billing Setup')
    ).length,
    canProvisionNewVMs: walletStatus.canProvision
  };
}

/**
 * Simulate customer VM usage patterns for testing
 */
export function generateCustomerVMScenarios() {
  const scenarios = [
    {
      name: "Startup Development Environment",
      customerName: "TechCorp Startup",
      projectName: "Development Stack",
      vms: [
        { cpu: 2, cpuSpeed: '1GHz' as const, memory: 4, storage: 100, storageType: 'Standard' as const },
        { cpu: 1, cpuSpeed: '1GHz' as const, memory: 2, storage: 50, storageType: 'Standard' as const }
      ]
    },
    {
      name: "Banking Production Environment", 
      customerName: "SecureBank Ltd",
      projectName: "Core Banking System",
      vms: [
        { cpu: 8, cpuSpeed: '2GHz' as const, memory: 32, storage: 500, storageType: 'Premium' as const },
        { cpu: 4, cpuSpeed: '2GHz' as const, memory: 16, storage: 200, storageType: 'Premium' as const },
        { cpu: 2, cpuSpeed: '2GHz' as const, memory: 8, storage: 100, storageType: 'Premium' as const }
      ]
    },
    {
      name: "E-commerce Peak Season",
      customerName: "OnlineShop SA",
      projectName: "Holiday Traffic Scaling",
      vms: [
        { cpu: 4, cpuSpeed: '2GHz' as const, memory: 16, storage: 200, storageType: 'Standard' as const },
        { cpu: 4, cpuSpeed: '2GHz' as const, memory: 16, storage: 200, storageType: 'Standard' as const },
        { cpu: 2, cpuSpeed: '1GHz' as const, memory: 8, storage: 150, storageType: 'Standard' as const }
      ]
    },
    {
      name: "Mining Analytics Workload",
      customerName: "GoldFields Analytics", 
      projectName: "Geological Data Processing",
      vms: [
        { cpu: 16, cpuSpeed: '2GHz' as const, memory: 64, storage: 1000, storageType: 'Premium' as const },
        { cpu: 8, cpuSpeed: '2GHz' as const, memory: 32, storage: 500, storageType: 'Premium' as const }
      ]
    },
    {
      name: "SMB Basic Setup",
      customerName: "Local Business SA",
      projectName: "Basic Infrastructure", 
      vms: [
        { cpu: 1, cpuSpeed: '1GHz' as const, memory: 2, storage: 100, storageType: 'Standard' as const }
      ]
    }
  ];

  return scenarios;
}