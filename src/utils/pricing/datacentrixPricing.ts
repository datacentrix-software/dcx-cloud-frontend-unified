/**
 * Datacentrix Cloud VM Pricing Calculator
 * Official pricing model for Datacentrix Cloud Platform
 */

export interface VMSpecification {
  id?: string;
  name?: string;
  cpu: number;
  cpuSpeed?: '2GHz' | '1.8GHz';
  memory: number; // GB
  storage: number; // GB
  storageType?: 'Standard' | 'Premium';
  network?: string;
  os?: 'Windows' | 'Linux';
  backup?: boolean;
  monitoring?: boolean;
}

export interface PricingBreakdown {
  // Base VM pricing
  basePrice: number;
  
  // CPU pricing
  cpuCost: number;
  vcpuCost: number;
  
  // Memory pricing
  memoryCost: number;
  ramCost: number;
  
  // Storage pricing (immediate charge)
  diskCost: number;
  
  // Additional services
  networkCost: number;
  osCost: number;
  backupCost: number;
  monitoringCost: number;
  
  // Rate calculations
  totalHourlyRate: number;
  hourlyRate: number;
  totalMonthlyRate: number;
  totalMonthlyCost: number;
  
  // Billing model charges
  immediateCharge: number; // Disk costs charged immediately
  
  currency: 'ZAR';
}

export interface MultiVMPricing extends PricingBreakdown {
  vmCount: number;
  individualVMs: PricingBreakdown[];
}

/**
 * Datacentrix Pricing Structure (ZAR)
 */
const PRICING_CONFIG = {
  // CPU Pricing (per vCPU per month)
  CPU: {
    '2GHz': 155, // High performance CPU
    '1.8GHz': 78  // Standard CPU
  },
  
  // Memory Pricing (per GB per month)  
  MEMORY: 38,
  
  // Storage Pricing (per 100GB immediate charge)
  STORAGE: {
    'Standard': 180,
    'Premium': 275
  },
  
  // Operating System Licensing (per month)
  OS: {
    'Windows': 89,
    'Linux': 0
  },
  
  // Additional Services (per month)
  BACKUP: 45,
  MONITORING: 25,
  NETWORK_BASE: 15,
  
  // Conversion factors
  HOURS_PER_MONTH: 744, // 31 days average
  STORAGE_UNIT: 100 // Pricing per 100GB
};

/**
 * Calculate VM pricing breakdown
 */
export function calculateVMPricing(vm: VMSpecification): PricingBreakdown {
  // CPU Cost calculation
  const cpuSpeed = vm.cpuSpeed || '2GHz';
  const vcpuCost = vm.cpu * PRICING_CONFIG.CPU[cpuSpeed];
  
  // Memory Cost calculation  
  const ramCost = vm.memory * PRICING_CONFIG.MEMORY;
  
  // Storage Cost calculation (immediate charge)
  const storageType = vm.storageType || 'Standard';
  const storageUnits = Math.ceil(vm.storage / PRICING_CONFIG.STORAGE_UNIT);
  const diskCost = storageUnits * PRICING_CONFIG.STORAGE[storageType];
  
  // Operating System Cost
  const os = vm.os || 'Linux';
  const osCost = PRICING_CONFIG.OS[os];
  
  // Additional Services
  const backupCost = vm.backup ? PRICING_CONFIG.BACKUP : 0;
  const monitoringCost = vm.monitoring ? PRICING_CONFIG.MONITORING : 0;
  const networkCost = PRICING_CONFIG.NETWORK_BASE;
  
  // Monthly compute costs (CPU + Memory + OS + Services)
  const monthlyComputeCost = vcpuCost + ramCost + osCost + backupCost + monitoringCost + networkCost;
  
  // Hourly rate calculation
  const hourlyRate = monthlyComputeCost / PRICING_CONFIG.HOURS_PER_MONTH;
  
  const pricing: PricingBreakdown = {
    basePrice: 0, // No base price in Datacentrix model
    cpuCost: vcpuCost,
    vcpuCost: vcpuCost,
    memoryCost: ramCost, 
    ramCost: ramCost,
    diskCost: diskCost,
    networkCost: networkCost,
    osCost: osCost,
    backupCost: backupCost,
    monitoringCost: monitoringCost,
    totalHourlyRate: hourlyRate,
    hourlyRate: hourlyRate,
    totalMonthlyRate: monthlyComputeCost,
    totalMonthlyCost: monthlyComputeCost + diskCost, // Total includes immediate disk charge
    immediateCharge: diskCost, // Disk charged immediately at provisioning
    currency: 'ZAR'
  };
  
  return pricing;
}

/**
 * Calculate pricing for multiple VMs
 */
export function calculateMultiVMPricing(vms: VMSpecification[]): MultiVMPricing {
  const individualVMs = vms.map(vm => calculateVMPricing(vm));
  
  // Sum all costs
  const totals = individualVMs.reduce((acc, vm) => ({
    basePrice: acc.basePrice + vm.basePrice,
    cpuCost: acc.cpuCost + vm.cpuCost,
    vcpuCost: acc.vcpuCost + vm.vcpuCost,
    memoryCost: acc.memoryCost + vm.memoryCost,
    ramCost: acc.ramCost + vm.ramCost,
    diskCost: acc.diskCost + vm.diskCost,
    networkCost: acc.networkCost + vm.networkCost,
    osCost: acc.osCost + vm.osCost,
    backupCost: acc.backupCost + vm.backupCost,
    monitoringCost: acc.monitoringCost + vm.monitoringCost,
    totalHourlyRate: acc.totalHourlyRate + vm.totalHourlyRate,
    hourlyRate: acc.hourlyRate + vm.hourlyRate,
    totalMonthlyRate: acc.totalMonthlyRate + vm.totalMonthlyRate,
    totalMonthlyCost: acc.totalMonthlyCost + vm.totalMonthlyCost,
    immediateCharge: acc.immediateCharge + vm.immediateCharge
  }), {
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
    immediateCharge: 0
  });
  
  return {
    ...totals,
    currency: 'ZAR',
    vmCount: vms.length,
    individualVMs
  };
}

/**
 * Get VM pricing breakdown formatted for display
 */
export function getVMPricingDisplay(vm: VMSpecification) {
  const pricing = calculateVMPricing(vm);
  
  return {
    vm: {
      cpu: `${vm.cpu} vCPU @ ${vm.cpuSpeed || '2GHz'}`,
      memory: `${vm.memory} GB RAM`,
      storage: `${vm.storage} GB ${vm.storageType || 'Standard'}`,
      os: vm.os || 'Linux'
    },
    costs: {
      cpu: `R${pricing.vcpuCost.toFixed(2)}/month`,
      memory: `R${pricing.ramCost.toFixed(2)}/month`,
      storage: `R${pricing.diskCost.toFixed(2)} immediate`,
      os: `R${pricing.osCost.toFixed(2)}/month`,
      backup: vm.backup ? `R${pricing.backupCost.toFixed(2)}/month` : 'Not included',
      monitoring: vm.monitoring ? `R${pricing.monitoringCost.toFixed(2)}/month` : 'Not included'
    },
    totals: {
      immediate: `R${pricing.immediateCharge.toFixed(2)}`,
      monthly: `R${pricing.totalMonthlyRate.toFixed(2)}`,
      hourly: `R${pricing.hourlyRate.toFixed(4)}`,
      total: `R${pricing.totalMonthlyCost.toFixed(2)}`
    }
  };
}

/**
 * Calculate cost difference between VM configurations
 */
export function calculateVMUpgradeCost(
  currentVM: VMSpecification, 
  newVM: VMSpecification
): {
  costDifference: number;
  immediateCharge: number;
  monthlyDifference: number;
  breakdown: {
    cpu: number;
    memory: number;
    storage: number;
    os: number;
  };
} {
  const currentPricing = calculateVMPricing(currentVM);
  const newPricing = calculateVMPricing(newVM);
  
  const breakdown = {
    cpu: newPricing.vcpuCost - currentPricing.vcpuCost,
    memory: newPricing.ramCost - currentPricing.ramCost,
    storage: newPricing.diskCost - currentPricing.diskCost,
    os: newPricing.osCost - currentPricing.osCost
  };
  
  return {
    costDifference: newPricing.totalMonthlyCost - currentPricing.totalMonthlyCost,
    immediateCharge: newPricing.immediateCharge - currentPricing.immediateCharge,
    monthlyDifference: newPricing.totalMonthlyRate - currentPricing.totalMonthlyRate,
    breakdown
  };
}

/**
 * Validate VM specification for pricing
 */
export function validateVMSpecification(vm: VMSpecification): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // CPU validation
  if (!vm.cpu || vm.cpu < 1 || vm.cpu > 64) {
    errors.push('CPU count must be between 1 and 64');
  }
  
  // Memory validation
  if (!vm.memory || vm.memory < 1 || vm.memory > 512) {
    errors.push('Memory must be between 1 GB and 512 GB');
  }
  
  // Storage validation
  if (!vm.storage || vm.storage < 20 || vm.storage > 10000) {
    errors.push('Storage must be between 20 GB and 10 TB');
  }
  
  // Warnings for performance
  if (vm.memory && vm.cpu && vm.memory / vm.cpu < 2) {
    warnings.push('Low memory-to-CPU ratio may impact performance');
  }
  
  if (vm.memory && vm.cpu && vm.memory / vm.cpu > 16) {
    warnings.push('High memory-to-CPU ratio may be inefficient');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get recommended VM configurations
 */
export function getRecommendedVMConfigs(): VMSpecification[] {
  return [
    {
      name: 'Small Development',
      cpu: 1,
      cpuSpeed: '2GHz',
      memory: 2,
      storage: 50,
      storageType: 'Standard',
      os: 'Linux'
    },
    {
      name: 'Medium Production',
      cpu: 2,
      cpuSpeed: '2GHz', 
      memory: 4,
      storage: 100,
      storageType: 'Standard',
      os: 'Linux'
    },
    {
      name: 'Large Database',
      cpu: 4,
      cpuSpeed: '2GHz',
      memory: 8,
      storage: 200,
      storageType: 'Premium',
      os: 'Linux',
      backup: true,
      monitoring: true
    },
    {
      name: 'Enterprise Application',
      cpu: 8,
      cpuSpeed: '2GHz',
      memory: 16,
      storage: 500,
      storageType: 'Premium',
      os: 'Windows',
      backup: true,
      monitoring: true
    }
  ];
}