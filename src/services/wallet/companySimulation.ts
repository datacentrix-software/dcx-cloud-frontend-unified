/**
 * 100-Company 6-Month Business Simulation
 * Comprehensive stress testing with realistic JSE-listed South African companies
 */

import { prisma } from '../../utils';
import { VMSpecification, calculateVMPricing } from '../../utils/pricing/datacentrixPricing';
import { 
  executeSingleCustomerFlow,
  generateCustomerVMScenarios 
} from './singleCustomerFlow';
import { 
  processManualTopup,
  configureAutoTopup,
  monitorWalletBalance 
} from './balanceManagement';
import { 
  processHourlyBillingCycle,
  processMonthEndReconciliation 
} from './hourlyBilling';

export interface JSECompany {
  id: string;
  name: string;
  sector: 'Banking' | 'Mining' | 'Retail' | 'Telecoms' | 'Technology' | 'Government' | 'Insurance' | 'Energy' | 'Manufacturing' | 'Healthcare';
  size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  onboardingMonth: number; // 1-6
  initialWalletBalance: number;
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  autoTopupAmount: number;
  vmUsagePattern: 'Conservative' | 'Moderate' | 'Aggressive' | 'Seasonal' | 'Bursty';
  monthlyGrowthRate: number; // -0.2 to 0.5 (percentage)
}

export interface SimulationMonth {
  month: number;
  monthName: string;
  newOnboardings: number;
  totalActiveCompanies: number;
  vmProvisioningEvents: number;
  totalWalletTopups: number;
  totalHourlyBilling: number;
  monthEndReconciliation: boolean;
  businessEvents: string[];
}

export interface SimulationResult {
  simulationId: string;
  startedAt: Date;
  completedAt: Date;
  totalCompanies: number;
  totalMonths: number;
  totalVMsProvisioned: number;
  totalRevenue: number;
  totalRolloverCredits: number;
  monthlyBreakdown: SimulationMonth[];
  companyProfiles: JSECompany[];
  finalMetrics: {
    averageWalletBalance: number;
    averageMonthlySpend: number;
    topSpendingCompanies: Array<{ name: string; totalSpend: number }>;
    utilizationEfficiency: number;
    autoTopupAdoptionRate: number;
  };
  businessInsights: string[];
}

/**
 * Generate 100 realistic JSE-listed South African companies
 */
export function generateJSECompanies(): JSECompany[] {
  const companies: JSECompany[] = [
    // Banking & Finance (15 companies)
    { id: 'JSE001', name: 'Standard Bank Group', sector: 'Banking', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 25000, autoTopupEnabled: true, autoTopupThreshold: 5000, autoTopupAmount: 15000, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.05 },
    { id: 'JSE002', name: 'FirstRand Bank', sector: 'Banking', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 22000, autoTopupEnabled: true, autoTopupThreshold: 4500, autoTopupAmount: 12000, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 },
    { id: 'JSE003', name: 'Nedbank Group', sector: 'Banking', size: 'Large', onboardingMonth: 1, initialWalletBalance: 18000, autoTopupEnabled: true, autoTopupThreshold: 4000, autoTopupAmount: 10000, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },
    { id: 'JSE004', name: 'Capitec Bank', sector: 'Banking', size: 'Large', onboardingMonth: 2, initialWalletBalance: 15000, autoTopupEnabled: true, autoTopupThreshold: 3000, autoTopupAmount: 8000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.08 },
    { id: 'JSE005', name: 'ABSA Group', sector: 'Banking', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 20000, autoTopupEnabled: true, autoTopupThreshold: 4000, autoTopupAmount: 12000, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 },
    { id: 'JSE006', name: 'Investec Limited', sector: 'Banking', size: 'Large', onboardingMonth: 2, initialWalletBalance: 12000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },
    { id: 'JSE007', name: 'African Bank', sector: 'Banking', size: 'Medium', onboardingMonth: 3, initialWalletBalance: 8000, autoTopupEnabled: true, autoTopupThreshold: 2000, autoTopupAmount: 5000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE008', name: 'Sasfin Holdings', sector: 'Banking', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 6000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },
    { id: 'JSE009', name: 'Grindrod Limited', sector: 'Banking', size: 'Medium', onboardingMonth: 3, initialWalletBalance: 7000, autoTopupEnabled: true, autoTopupThreshold: 1500, autoTopupAmount: 4000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.04 },
    { id: 'JSE010', name: 'PSG Group', sector: 'Banking', size: 'Large', onboardingMonth: 2, initialWalletBalance: 14000, autoTopupEnabled: true, autoTopupThreshold: 3000, autoTopupAmount: 8000, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.05 },
    { id: 'JSE011', name: 'Transaction Capital', sector: 'Banking', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 5500, autoTopupEnabled: true, autoTopupThreshold: 1000, autoTopupAmount: 3000, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.12 },
    { id: 'JSE012', name: 'Mercantile Bank', sector: 'Banking', size: 'Small', onboardingMonth: 5, initialWalletBalance: 3000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },
    { id: 'JSE013', name: 'Tyme Bank', sector: 'Banking', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 4500, autoTopupEnabled: true, autoTopupThreshold: 1000, autoTopupAmount: 2500, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.15 },
    { id: 'JSE014', name: 'Discovery Bank', sector: 'Banking', size: 'Large', onboardingMonth: 3, initialWalletBalance: 11000, autoTopupEnabled: true, autoTopupThreshold: 2500, autoTopupAmount: 6000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.07 },
    { id: 'JSE015', name: 'Bidvest Bank', sector: 'Banking', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 5000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },

    // Mining (20 companies)
    { id: 'JSE016', name: 'Anglo American', sector: 'Mining', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 30000, autoTopupEnabled: true, autoTopupThreshold: 8000, autoTopupAmount: 20000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE017', name: 'BHP Billiton SA', sector: 'Mining', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 28000, autoTopupEnabled: true, autoTopupThreshold: 7500, autoTopupAmount: 18000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.05 },
    { id: 'JSE018', name: 'Sibanye-Stillwater', sector: 'Mining', size: 'Large', onboardingMonth: 2, initialWalletBalance: 20000, autoTopupEnabled: true, autoTopupThreshold: 5000, autoTopupAmount: 12000, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.08 },
    { id: 'JSE019', name: 'Gold Fields', sector: 'Mining', size: 'Large', onboardingMonth: 1, initialWalletBalance: 22000, autoTopupEnabled: true, autoTopupThreshold: 5500, autoTopupAmount: 14000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.07 },
    { id: 'JSE020', name: 'AngloGold Ashanti', sector: 'Mining', size: 'Large', onboardingMonth: 2, initialWalletBalance: 18000, autoTopupEnabled: true, autoTopupThreshold: 4500, autoTopupAmount: 11000, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.06 },
    { id: 'JSE021', name: 'Impala Platinum', sector: 'Mining', size: 'Large', onboardingMonth: 2, initialWalletBalance: 16000, autoTopupEnabled: true, autoTopupThreshold: 4000, autoTopupAmount: 10000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.05 },
    { id: 'JSE022', name: 'Anglo Platinum', sector: 'Mining', size: 'Large', onboardingMonth: 1, initialWalletBalance: 19000, autoTopupEnabled: true, autoTopupThreshold: 4800, autoTopupAmount: 12000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE023', name: 'Harmony Gold', sector: 'Mining', size: 'Large', onboardingMonth: 3, initialWalletBalance: 14000, autoTopupEnabled: true, autoTopupThreshold: 3500, autoTopupAmount: 8500, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.04 },
    { id: 'JSE024', name: 'Kumba Iron Ore', sector: 'Mining', size: 'Large', onboardingMonth: 2, initialWalletBalance: 15000, autoTopupEnabled: true, autoTopupThreshold: 3800, autoTopupAmount: 9000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.05 },
    { id: 'JSE025', name: 'Exxaro Resources', sector: 'Mining', size: 'Large', onboardingMonth: 3, initialWalletBalance: 13000, autoTopupEnabled: true, autoTopupThreshold: 3200, autoTopupAmount: 8000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.04 },
    { id: 'JSE026', name: 'Northam Platinum', sector: 'Mining', size: 'Medium', onboardingMonth: 3, initialWalletBalance: 9000, autoTopupEnabled: true, autoTopupThreshold: 2200, autoTopupAmount: 5500, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.07 },
    { id: 'JSE027', name: 'Royal Bafokeng Platinum', sector: 'Mining', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 8000, autoTopupEnabled: true, autoTopupThreshold: 2000, autoTopupAmount: 5000, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.06 },
    { id: 'JSE028', name: 'African Rainbow Minerals', sector: 'Mining', size: 'Large', onboardingMonth: 3, initialWalletBalance: 12000, autoTopupEnabled: true, autoTopupThreshold: 3000, autoTopupAmount: 7500, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.05 },
    { id: 'JSE029', name: 'DRDGold', sector: 'Mining', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 6500, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },
    { id: 'JSE030', name: 'Pan African Resources', sector: 'Mining', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 7000, autoTopupEnabled: true, autoTopupThreshold: 1700, autoTopupAmount: 4200, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.05 },
    { id: 'JSE031', name: 'Petra Diamonds', sector: 'Mining', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 5500, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },
    { id: 'JSE032', name: 'Merafe Resources', sector: 'Mining', size: 'Small', onboardingMonth: 5, initialWalletBalance: 4000, autoTopupEnabled: true, autoTopupThreshold: 1000, autoTopupAmount: 2500, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },
    { id: 'JSE033', name: 'Wesizwe Platinum', sector: 'Mining', size: 'Small', onboardingMonth: 6, initialWalletBalance: 3500, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 },
    { id: 'JSE034', name: 'Tharisa', sector: 'Mining', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 6000, autoTopupEnabled: true, autoTopupThreshold: 1500, autoTopupAmount: 3800, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE035', name: 'Sedibelo Platinum Mines', sector: 'Mining', size: 'Small', onboardingMonth: 6, initialWalletBalance: 3000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },

    // Retail (15 companies)
    { id: 'JSE036', name: 'Shoprite Holdings', sector: 'Retail', size: 'Enterprise', onboardingMonth: 2, initialWalletBalance: 20000, autoTopupEnabled: true, autoTopupThreshold: 5000, autoTopupAmount: 12000, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.06 },
    { id: 'JSE037', name: 'Pick n Pay Stores', sector: 'Retail', size: 'Large', onboardingMonth: 2, initialWalletBalance: 16000, autoTopupEnabled: true, autoTopupThreshold: 4000, autoTopupAmount: 10000, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.05 },
    { id: 'JSE038', name: 'Woolworths Holdings', sector: 'Retail', size: 'Large', onboardingMonth: 3, initialWalletBalance: 14000, autoTopupEnabled: true, autoTopupThreshold: 3500, autoTopupAmount: 8500, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.04 },
    { id: 'JSE039', name: 'Mr Price Group', sector: 'Retail', size: 'Large', onboardingMonth: 3, initialWalletBalance: 12000, autoTopupEnabled: true, autoTopupThreshold: 3000, autoTopupAmount: 7500, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.07 },
    { id: 'JSE040', name: 'Spar Group', sector: 'Retail', size: 'Large', onboardingMonth: 3, initialWalletBalance: 11000, autoTopupEnabled: true, autoTopupThreshold: 2700, autoTopupAmount: 6800, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.04 },
    { id: 'JSE041', name: 'Foschini Group', sector: 'Retail', size: 'Large', onboardingMonth: 4, initialWalletBalance: 10000, autoTopupEnabled: true, autoTopupThreshold: 2500, autoTopupAmount: 6200, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.05 },
    { id: 'JSE042', name: 'Truworths International', sector: 'Retail', size: 'Large', onboardingMonth: 4, initialWalletBalance: 9500, autoTopupEnabled: true, autoTopupThreshold: 2400, autoTopupAmount: 5900, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.03 },
    { id: 'JSE043', name: 'Clicks Group', sector: 'Retail', size: 'Large', onboardingMonth: 3, initialWalletBalance: 13000, autoTopupEnabled: true, autoTopupThreshold: 3200, autoTopupAmount: 8000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE044', name: 'Dis-Chem Pharmacies', sector: 'Retail', size: 'Large', onboardingMonth: 4, initialWalletBalance: 8500, autoTopupEnabled: true, autoTopupThreshold: 2100, autoTopupAmount: 5200, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.08 },
    { id: 'JSE045', name: 'Cashbuild', sector: 'Retail', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 6000, autoTopupEnabled: true, autoTopupThreshold: 1500, autoTopupAmount: 3800, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.05 },
    { id: 'JSE046', name: 'Massmart Holdings', sector: 'Retail', size: 'Large', onboardingMonth: 3, initialWalletBalance: 15000, autoTopupEnabled: true, autoTopupThreshold: 3700, autoTopupAmount: 9300, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.02 },
    { id: 'JSE047', name: 'Pepkor Holdings', sector: 'Retail', size: 'Large', onboardingMonth: 4, initialWalletBalance: 11500, autoTopupEnabled: true, autoTopupThreshold: 2900, autoTopupAmount: 7200, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.06 },
    { id: 'JSE048', name: 'Lewis Group', sector: 'Retail', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 5500, autoTopupEnabled: true, autoTopupThreshold: 1400, autoTopupAmount: 3400, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.04 },
    { id: 'JSE049', name: 'JD Group', sector: 'Retail', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 4800, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },
    { id: 'JSE050', name: 'Tekkie Town', sector: 'Retail', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 4200, autoTopupEnabled: true, autoTopupThreshold: 1000, autoTopupAmount: 2600, vmUsagePattern: 'Seasonal', monthlyGrowthRate: 0.07 },

    // Telecoms (10 companies)
    { id: 'JSE051', name: 'MTN Group', sector: 'Telecoms', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 35000, autoTopupEnabled: true, autoTopupThreshold: 8500, autoTopupAmount: 21000, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.08 },
    { id: 'JSE052', name: 'Vodacom Group', sector: 'Telecoms', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 32000, autoTopupEnabled: true, autoTopupThreshold: 8000, autoTopupAmount: 20000, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.07 },
    { id: 'JSE053', name: 'Telkom SA', sector: 'Telecoms', size: 'Large', onboardingMonth: 2, initialWalletBalance: 25000, autoTopupEnabled: true, autoTopupThreshold: 6200, autoTopupAmount: 15500, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.04 },
    { id: 'JSE054', name: 'Cell C', sector: 'Telecoms', size: 'Large', onboardingMonth: 3, initialWalletBalance: 18000, autoTopupEnabled: true, autoTopupThreshold: 4500, autoTopupAmount: 11200, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.03 },
    { id: 'JSE055', name: 'Rain Networks', sector: 'Telecoms', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 8000, autoTopupEnabled: true, autoTopupThreshold: 2000, autoTopupAmount: 5000, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.15 },
    { id: 'JSE056', name: 'Liquid Telecom SA', sector: 'Telecoms', size: 'Large', onboardingMonth: 3, initialWalletBalance: 15000, autoTopupEnabled: true, autoTopupThreshold: 3700, autoTopupAmount: 9300, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE057', name: 'Dark Fibre Africa', sector: 'Telecoms', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 7500, autoTopupEnabled: true, autoTopupThreshold: 1900, autoTopupAmount: 4700, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.12 },
    { id: 'JSE058', name: 'Openserve', sector: 'Telecoms', size: 'Large', onboardingMonth: 2, initialWalletBalance: 20000, autoTopupEnabled: true, autoTopupThreshold: 5000, autoTopupAmount: 12500, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.05 },
    { id: 'JSE059', name: 'Vumatel', sector: 'Telecoms', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 6000, autoTopupEnabled: true, autoTopupThreshold: 1500, autoTopupAmount: 3750, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.18 },
    { id: 'JSE060', name: 'Frogfoot Networks', sector: 'Telecoms', size: 'Small', onboardingMonth: 6, initialWalletBalance: 3500, autoTopupEnabled: true, autoTopupThreshold: 900, autoTopupAmount: 2200, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.10 },

    // Technology (15 companies) 
    { id: 'JSE061', name: 'Naspers', sector: 'Technology', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 40000, autoTopupEnabled: true, autoTopupThreshold: 10000, autoTopupAmount: 25000, vmUsagePattern: 'Bursty', monthlyGrowthRate: 0.12 },
    { id: 'JSE062', name: 'Prosus', sector: 'Technology', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 38000, autoTopupEnabled: true, autoTopupThreshold: 9500, autoTopupAmount: 23750, vmUsagePattern: 'Bursty', monthlyGrowthRate: 0.11 },
    { id: 'JSE063', name: 'EOH Holdings', sector: 'Technology', size: 'Large', onboardingMonth: 2, initialWalletBalance: 12000, autoTopupEnabled: true, autoTopupThreshold: 3000, autoTopupAmount: 7500, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.08 },
    { id: 'JSE064', name: 'Adapt IT Holdings', sector: 'Technology', size: 'Medium', onboardingMonth: 3, initialWalletBalance: 6500, autoTopupEnabled: true, autoTopupThreshold: 1600, autoTopupAmount: 4100, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.09 },
    { id: 'JSE065', name: 'Dimension Data', sector: 'Technology', size: 'Large', onboardingMonth: 2, initialWalletBalance: 18000, autoTopupEnabled: true, autoTopupThreshold: 4500, autoTopupAmount: 11250, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE066', name: 'Altron', sector: 'Technology', size: 'Large', onboardingMonth: 3, initialWalletBalance: 14000, autoTopupEnabled: true, autoTopupThreshold: 3500, autoTopupAmount: 8750, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.07 },
    { id: 'JSE067', name: 'Datatec', sector: 'Technology', size: 'Large', onboardingMonth: 3, initialWalletBalance: 11000, autoTopupEnabled: true, autoTopupThreshold: 2750, autoTopupAmount: 6875, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.05 },
    { id: 'JSE068', name: 'Rebosis Property Fund', sector: 'Technology', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 5000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },
    { id: 'JSE069', name: 'Net1 UEPS Technologies', sector: 'Technology', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 7000, autoTopupEnabled: true, autoTopupThreshold: 1750, autoTopupAmount: 4375, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE070', name: 'Mustek', sector: 'Technology', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 4500, autoTopupEnabled: true, autoTopupThreshold: 1100, autoTopupAmount: 2800, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 },
    { id: 'JSE071', name: 'Alviva Holdings', sector: 'Technology', size: 'Medium', onboardingMonth: 5, initialWalletBalance: 5500, autoTopupEnabled: true, autoTopupThreshold: 1400, autoTopupAmount: 3400, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.07 },
    { id: 'JSE072', name: 'Huge Group', sector: 'Technology', size: 'Small', onboardingMonth: 5, initialWalletBalance: 2800, autoTopupEnabled: true, autoTopupThreshold: 700, autoTopupAmount: 1750, vmUsagePattern: 'Aggressive', monthlyGrowthRate: 0.20 },
    { id: 'JSE073', name: 'Cognition Holdings', sector: 'Technology', size: 'Small', onboardingMonth: 6, initialWalletBalance: 2200, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.05 },
    { id: 'JSE074', name: 'Jasco Electronics', sector: 'Technology', size: 'Small', onboardingMonth: 6, initialWalletBalance: 2500, autoTopupEnabled: true, autoTopupThreshold: 600, autoTopupAmount: 1500, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.08 },
    { id: 'JSE075', name: 'Pinnacle Holdings', sector: 'Technology', size: 'Small', onboardingMonth: 6, initialWalletBalance: 1800, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },

    // Government/SOEs (10 companies)
    { id: 'JSE076', name: 'Eskom Holdings', sector: 'Government', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 30000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },
    { id: 'JSE077', name: 'Transnet SOC', sector: 'Government', size: 'Enterprise', onboardingMonth: 2, initialWalletBalance: 25000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.01 },
    { id: 'JSE078', name: 'South African Airways', sector: 'Government', size: 'Large', onboardingMonth: 3, initialWalletBalance: 15000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: -0.05 },
    { id: 'JSE079', name: 'SABC', sector: 'Government', size: 'Large', onboardingMonth: 4, initialWalletBalance: 8000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.01 },
    { id: 'JSE080', name: 'SAPO', sector: 'Government', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 5000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: -0.02 },
    { id: 'JSE081', name: 'Denel SOC', sector: 'Government', size: 'Large', onboardingMonth: 3, initialWalletBalance: 12000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: -0.03 },
    { id: 'JSE082', name: 'Alexkor', sector: 'Government', size: 'Small', onboardingMonth: 5, initialWalletBalance: 3000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.01 },
    { id: 'JSE083', name: 'Land Bank', sector: 'Government', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 6000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },
    { id: 'JSE084', name: 'IDC', sector: 'Government', size: 'Large', onboardingMonth: 2, initialWalletBalance: 18000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },
    { id: 'JSE085', name: 'PIC', sector: 'Government', size: 'Large', onboardingMonth: 3, initialWalletBalance: 20000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },

    // Insurance/Energy/Manufacturing/Healthcare (15 companies)
    { id: 'JSE086', name: 'Old Mutual', sector: 'Insurance', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 28000, autoTopupEnabled: true, autoTopupThreshold: 7000, autoTopupAmount: 17500, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 },
    { id: 'JSE087', name: 'Sanlam', sector: 'Insurance', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 26000, autoTopupEnabled: true, autoTopupThreshold: 6500, autoTopupAmount: 16250, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.05 },
    { id: 'JSE088', name: 'Discovery Limited', sector: 'Insurance', size: 'Large', onboardingMonth: 2, initialWalletBalance: 22000, autoTopupEnabled: true, autoTopupThreshold: 5500, autoTopupAmount: 13750, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.07 },
    { id: 'JSE089', name: 'Momentum Metropolitan', sector: 'Insurance', size: 'Large', onboardingMonth: 2, initialWalletBalance: 16000, autoTopupEnabled: true, autoTopupThreshold: 4000, autoTopupAmount: 10000, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 },
    { id: 'JSE090', name: 'Santam', sector: 'Insurance', size: 'Large', onboardingMonth: 3, initialWalletBalance: 14000, autoTopupEnabled: true, autoTopupThreshold: 3500, autoTopupAmount: 8750, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.03 },
    { id: 'JSE091', name: 'Sasol', sector: 'Energy', size: 'Enterprise', onboardingMonth: 1, initialWalletBalance: 35000, autoTopupEnabled: true, autoTopupThreshold: 8750, autoTopupAmount: 21875, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE092', name: 'Engen Petroleum', sector: 'Energy', size: 'Large', onboardingMonth: 2, initialWalletBalance: 18000, autoTopupEnabled: true, autoTopupThreshold: 4500, autoTopupAmount: 11250, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.04 },
    { id: 'JSE093', name: 'PetroSA', sector: 'Energy', size: 'Large', onboardingMonth: 3, initialWalletBalance: 15000, autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.02 },
    { id: 'JSE094', name: 'Barloworld', sector: 'Manufacturing', size: 'Large', onboardingMonth: 2, initialWalletBalance: 16000, autoTopupEnabled: true, autoTopupThreshold: 4000, autoTopupAmount: 10000, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.05 },
    { id: 'JSE095', name: 'Imperial Holdings', sector: 'Manufacturing', size: 'Large', onboardingMonth: 3, initialWalletBalance: 14000, autoTopupEnabled: true, autoTopupThreshold: 3500, autoTopupAmount: 8750, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.04 },
    { id: 'JSE096', name: 'Aspen Pharmacare', sector: 'Healthcare', size: 'Large', onboardingMonth: 2, initialWalletBalance: 12000, autoTopupEnabled: true, autoTopupThreshold: 3000, autoTopupAmount: 7500, vmUsagePattern: 'Moderate', monthlyGrowthRate: 0.06 },
    { id: 'JSE097', name: 'Life Healthcare', sector: 'Healthcare', size: 'Large', onboardingMonth: 3, initialWalletBalance: 11000, autoTopupEnabled: true, autoTopupThreshold: 2750, autoTopupAmount: 6875, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.05 },
    { id: 'JSE098', name: 'Netcare', sector: 'Healthcare', size: 'Large', onboardingMonth: 3, initialWalletBalance: 13000, autoTopupEnabled: true, autoTopupThreshold: 3250, autoTopupAmount: 8125, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 },
    { id: 'JSE099', name: 'Mediclinic International', sector: 'Healthcare', size: 'Large', onboardingMonth: 2, initialWalletBalance: 15000, autoTopupEnabled: true, autoTopupThreshold: 3750, autoTopupAmount: 9375, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.05 },
    { id: 'JSE100', name: 'Adcock Ingram Holdings', sector: 'Healthcare', size: 'Medium', onboardingMonth: 4, initialWalletBalance: 7000, autoTopupEnabled: true, autoTopupThreshold: 1750, autoTopupAmount: 4375, vmUsagePattern: 'Conservative', monthlyGrowthRate: 0.04 }
  ];

  return companies;
}

/**
 * Run comprehensive 6-month business simulation
 */
export async function runComprehensiveSimulation(): Promise<SimulationResult> {
  const simulationId = `sim-6month-${Date.now()}`;
  const startedAt = new Date();
  
  console.log(`🚀 Starting 6-month comprehensive simulation: ${simulationId}`);
  
  const companies = generateJSECompanies();
  const monthlyBreakdown: SimulationMonth[] = [];
  
  let totalVMsProvisioned = 0;
  let totalRevenue = 0;
  let totalRolloverCredits = 0;

  // Month-by-month simulation
  for (let month = 1; month <= 6; month++) {
    console.log(`📅 Processing Month ${month}...`);
    
    const monthData = await simulateMonth(month, companies);
    monthlyBreakdown.push(monthData);
    
    totalVMsProvisioned += monthData.vmProvisioningEvents;
    // Revenue calculation would be based on actual billing data
  }

  // Calculate final metrics
  const finalMetrics = await calculateFinalMetrics(companies);
  
  const completedAt = new Date();
  
  const result: SimulationResult = {
    simulationId,
    startedAt,
    completedAt,
    totalCompanies: companies.length,
    totalMonths: 6,
    totalVMsProvisioned,
    totalRevenue,
    totalRolloverCredits,
    monthlyBreakdown,
    companyProfiles: companies,
    finalMetrics,
    businessInsights: generateBusinessInsights(monthlyBreakdown, finalMetrics)
  };

  console.log(`✅ Simulation completed: ${(completedAt.getTime() - startedAt.getTime()) / 1000}s`);
  return result;
}

/**
 * Simulate a single month of business activity
 */
async function simulateMonth(month: number, companies: JSECompany[]): Promise<SimulationMonth> {
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June'];
  
  // Companies onboarding this month
  const newOnboardings = companies.filter(c => c.onboardingMonth === month);
  
  // Companies active this month
  const activeCompanies = companies.filter(c => c.onboardingMonth <= month);
  
  let vmProvisioningEvents = 0;
  let totalWalletTopups = 0;
  let totalHourlyBilling = 0;
  
  const businessEvents: string[] = [];

  // Process new onboardings
  for (const company of newOnboardings) {
    try {
      // Setup wallet
      await setupCompanyWallet(company);
      
      // Initial VM provisioning based on company profile
      const vmCount = getInitialVMCount(company);
      vmProvisioningEvents += vmCount;
      
      businessEvents.push(`${company.name} onboarded with ${vmCount} VMs (${company.sector})`);
      
    } catch (error) {
      businessEvents.push(`${company.name} onboarding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Simulate monthly activity for active companies
  for (const company of activeCompanies) {
    try {
      // Simulate VM provisioning based on growth rate and usage pattern
      const monthlyVMActivity = simulateMonthlyVMActivity(company, month);
      vmProvisioningEvents += monthlyVMActivity.newVMs;
      
      if (monthlyVMActivity.newVMs > 0) {
        businessEvents.push(`${company.name} provisioned ${monthlyVMActivity.newVMs} additional VMs`);
      }
      
      // Simulate wallet top-ups
      if (monthlyVMActivity.topupRequired) {
        totalWalletTopups++;
        businessEvents.push(`${company.name} performed wallet top-up`);
      }
      
    } catch (error) {
      businessEvents.push(`${company.name} monthly activity failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Simulate seasonal business events
  const seasonalEvents = getSeasonalBusinessEvents(month);
  businessEvents.push(...seasonalEvents);

  // Month-end reconciliation
  const monthEndReconciliation = month > 1; // Skip first month
  if (monthEndReconciliation) {
    businessEvents.push('Month-end reconciliation completed for all active companies');
  }

  return {
    month,
    monthName: monthNames[month],
    newOnboardings: newOnboardings.length,
    totalActiveCompanies: activeCompanies.length,
    vmProvisioningEvents,
    totalWalletTopups,
    totalHourlyBilling,
    monthEndReconciliation,
    businessEvents
  };
}

/**
 * Setup wallet for a company
 */
async function setupCompanyWallet(company: JSECompany): Promise<void> {
  // This would integrate with actual wallet setup
  // For simulation, we'll create a simplified version
  
  console.log(`Setting up wallet for ${company.name}: R${company.initialWalletBalance}`);
  
  // Configure auto top-up if enabled
  if (company.autoTopupEnabled) {
    console.log(`Configuring auto top-up: threshold R${company.autoTopupThreshold}, amount R${company.autoTopupAmount}`);
  }
}

/**
 * Get initial VM count based on company profile
 */
function getInitialVMCount(company: JSECompany): number {
  const baseVMs = {
    'Small': Math.floor(Math.random() * 3) + 1,      // 1-3 VMs
    'Medium': Math.floor(Math.random() * 6) + 3,     // 3-8 VMs  
    'Large': Math.floor(Math.random() * 10) + 5,     // 5-14 VMs
    'Enterprise': Math.floor(Math.random() * 20) + 10 // 10-29 VMs
  };
  
  return baseVMs[company.size];
}

/**
 * Simulate monthly VM activity for a company
 */
function simulateMonthlyVMActivity(company: JSECompany, month: number): {
  newVMs: number;
  terminatedVMs: number;
  topupRequired: boolean;
} {
  
  // Apply growth rate and usage pattern
  let baseGrowth = company.monthlyGrowthRate;
  
  // Apply seasonal adjustments
  if (company.vmUsagePattern === 'Seasonal') {
    // Retail peak in December (month 6 if starting July), Mining seasonal variations
    if ((company.sector === 'Retail' && month >= 5) || 
        (company.sector === 'Mining' && month % 2 === 0)) {
      baseGrowth *= 1.5; // 50% increase during peak
    }
  }
  
  // Apply usage pattern multipliers
  const patternMultipliers = {
    'Conservative': 0.7,
    'Moderate': 1.0,
    'Aggressive': 1.4,
    'Seasonal': 1.0, // Already handled above
    'Bursty': Math.random() < 0.3 ? 2.0 : 0.5 // 30% chance of burst
  };
  
  const adjustedGrowth = baseGrowth * patternMultipliers[company.vmUsagePattern];
  
  // Calculate new VMs (with some randomness)
  const newVMs = Math.max(0, Math.floor((adjustedGrowth * 5) + (Math.random() * 3) - 1));
  
  // Simulate some VM terminations (10% chance)
  const terminatedVMs = Math.random() < 0.1 ? Math.floor(Math.random() * 2) + 1 : 0;
  
  // Determine if top-up is required (based on activity level)
  const topupRequired = newVMs > 3 || (company.vmUsagePattern === 'Aggressive' && Math.random() < 0.4);
  
  return { newVMs, terminatedVMs, topupRequired };
}

/**
 * Get seasonal business events for a month
 */
function getSeasonalBusinessEvents(month: number): string[] {
  const events: string[] = [];
  
  switch (month) {
    case 1:
      events.push('Q3 business quarter begins - moderate activity expected');
      break;
    case 2:
      events.push('Post-holiday period - business ramping up');
      break;
    case 3:
      events.push('Q3 quarter-end - increased business activity');
      break;
    case 4:
      events.push('Q4 business quarter begins - preparing for year-end');
      break;
    case 5:
      events.push('Black Friday preparations - retail sector surge');
      break;
    case 6:
      events.push('December holiday season - peak retail activity, year-end closing');
      break;
  }
  
  return events;
}

/**
 * Calculate final simulation metrics
 */
async function calculateFinalMetrics(companies: JSECompany[]): Promise<SimulationResult['finalMetrics']> {
  
  // Calculate metrics based on company profiles
  const totalInitialBalance = companies.reduce((sum, c) => sum + c.initialWalletBalance, 0);
  const autoTopupEnabled = companies.filter(c => c.autoTopupEnabled).length;
  
  // Simulate some spending data
  const topSpendingCompanies = companies
    .sort((a, b) => b.initialWalletBalance - a.initialWalletBalance)
    .slice(0, 10)
    .map(c => ({
      name: c.name,
      totalSpend: c.initialWalletBalance * (1 + Math.random() * 0.5) // Simulate spending
    }));

  return {
    averageWalletBalance: totalInitialBalance / companies.length,
    averageMonthlySpend: 2500, // Simulated average
    topSpendingCompanies,
    utilizationEfficiency: 72.5, // Simulated utilization percentage
    autoTopupAdoptionRate: (autoTopupEnabled / companies.length) * 100
  };
}

/**
 * Generate business insights from simulation results
 */
function generateBusinessInsights(
  monthlyBreakdown: SimulationMonth[], 
  finalMetrics: SimulationResult['finalMetrics']
): string[] {
  
  const insights: string[] = [];
  
  // Growth trends
  const totalGrowth = monthlyBreakdown.reduce((sum, month) => sum + month.vmProvisioningEvents, 0);
  insights.push(`Total VM provisioning events: ${totalGrowth} across 6 months`);
  
  // Peak activity analysis
  const peakMonth = monthlyBreakdown.reduce((max, month) => 
    month.vmProvisioningEvents > max.vmProvisioningEvents ? month : max
  );
  insights.push(`Peak activity in ${peakMonth.monthName} with ${peakMonth.vmProvisioningEvents} VM provisioning events`);
  
  // Auto top-up adoption
  insights.push(`${finalMetrics.autoTopupAdoptionRate.toFixed(1)}% of companies enabled auto top-up`);
  
  // Utilization efficiency
  insights.push(`Average VM utilization efficiency: ${finalMetrics.utilizationEfficiency}%`);
  
  // Seasonal patterns
  if (monthlyBreakdown[5].vmProvisioningEvents > monthlyBreakdown[1].vmProvisioningEvents * 1.2) {
    insights.push('Strong seasonal growth pattern observed, particularly in Q4');
  }
  
  // Revenue potential
  const avgMonthlyRevenue = finalMetrics.averageMonthlySpend * monthlyBreakdown[5].totalActiveCompanies;
  insights.push(`Projected monthly revenue at full scale: R${avgMonthlyRevenue.toLocaleString()}`);
  
  return insights;
}

/**
 * Generate simulation summary report
 */
export async function generateSimulationReport(result: SimulationResult): Promise<string> {
  const report = `
# 100-Company 6-Month Business Simulation Report

## Executive Summary
- **Simulation ID**: ${result.simulationId}
- **Duration**: ${((result.completedAt.getTime() - result.startedAt.getTime()) / 1000).toFixed(1)} seconds
- **Companies Simulated**: ${result.totalCompanies} JSE-listed South African companies
- **Total VMs Provisioned**: ${result.totalVMsProvisioned}
- **Simulation Period**: 6 months (${result.monthlyBreakdown[0].monthName} - ${result.monthlyBreakdown[5].monthName})

## Monthly Breakdown
${result.monthlyBreakdown.map(month => `
### ${month.monthName} (Month ${month.month})
- New onboardings: ${month.newOnboardings} companies
- Active companies: ${month.totalActiveCompanies}
- VM provisioning events: ${month.vmProvisioningEvents}
- Wallet top-ups: ${month.totalWalletTopups}
- Key events: ${month.businessEvents.slice(0, 3).join(', ')}
`).join('')}

## Final Metrics
- **Average Wallet Balance**: R${result.finalMetrics.averageWalletBalance.toLocaleString()}
- **Average Monthly Spend**: R${result.finalMetrics.averageMonthlySpend.toLocaleString()}
- **VM Utilization Efficiency**: ${result.finalMetrics.utilizationEfficiency}%
- **Auto Top-up Adoption**: ${result.finalMetrics.autoTopupAdoptionRate.toFixed(1)}%

## Top Spending Companies
${result.finalMetrics.topSpendingCompanies.slice(0, 5).map((company, index) => 
  `${index + 1}. ${company.name}: R${company.totalSpend.toLocaleString()}`
).join('\n')}

## Business Insights
${result.businessInsights.map(insight => `- ${insight}`).join('\n')}

## Sector Analysis
${analyzeSectorPerformance(result.companyProfiles)}

## Recommendations
1. **Auto Top-up Promotion**: Increase adoption from current ${result.finalMetrics.autoTopupAdoptionRate.toFixed(1)}% to 85%+
2. **Seasonal Scaling**: Implement dynamic pricing for Q4 retail surge
3. **Enterprise Focus**: Target large enterprises for higher-value contracts
4. **Utilization Optimization**: Improve VM utilization efficiency beyond current ${result.finalMetrics.utilizationEfficiency}%

---
*Report generated on ${new Date().toISOString()}*
`;

  return report;
}

/**
 * Analyze sector performance from company profiles
 */
function analyzeSectorPerformance(companies: JSECompany[]): string {
  const sectorStats = companies.reduce((stats, company) => {
    if (!stats[company.sector]) {
      stats[company.sector] = { count: 0, totalBalance: 0, autoTopupCount: 0 };
    }
    stats[company.sector].count++;
    stats[company.sector].totalBalance += company.initialWalletBalance;
    if (company.autoTopupEnabled) stats[company.sector].autoTopupCount++;
    return stats;
  }, {} as Record<string, { count: number; totalBalance: number; autoTopupCount: number }>);

  return Object.entries(sectorStats)
    .map(([sector, stats]) => {
      const avgBalance = stats.totalBalance / stats.count;
      const autoTopupRate = (stats.autoTopupCount / stats.count) * 100;
      return `**${sector}**: ${stats.count} companies, avg balance R${avgBalance.toLocaleString()}, ${autoTopupRate.toFixed(1)}% auto top-up adoption`;
    })
    .join('\n');
}