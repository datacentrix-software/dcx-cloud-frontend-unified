import { NextRequest, NextResponse } from 'next/server';

// VM Types and Pricing (based on Datacentrix pricing)
const VM_TYPES = {
  'micro': { cpu: 1, memory: 1, storage: 20, cpuSpeed: '1GHz', storageType: 'Standard' },
  'small': { cpu: 1, memory: 2, storage: 50, cpuSpeed: '2GHz', storageType: 'Standard' },
  'medium': { cpu: 2, memory: 4, storage: 100, cpuSpeed: '2GHz', storageType: 'Premium' },
  'large': { cpu: 4, memory: 8, storage: 200, cpuSpeed: '2GHz', storageType: 'Premium' },
  'xlarge': { cpu: 8, memory: 16, storage: 500, cpuSpeed: '2GHz', storageType: 'Premium' },
  'database': { cpu: 4, memory: 16, storage: 1000, cpuSpeed: '2GHz', storageType: 'Premium' },
  'web': { cpu: 2, memory: 8, storage: 150, cpuSpeed: '2GHz', storageType: 'Premium' }
};

// Company profiles with realistic business patterns
const COMPANY_PROFILES = {
  'adcock-org-id': {
    name: 'Adcock Ingram',
    billingType: 'credit_card',
    sector: 'Healthcare/Pharmaceutical',
    vmPattern: 'steady_growth',
    businessHours: 'business_hours',
    seasonality: 'none'
  },
  'vodacom-org-id': {
    name: 'Vodacom',
    billingType: 'invoice',
    sector: 'Telecommunications',
    vmPattern: 'high_utilization',
    businessHours: '24x7',
    seasonality: 'high_december'
  },
  'manchest-org-id': {
    name: 'Manchester University',
    billingType: 'credit_card',
    sector: 'Education',
    vmPattern: 'academic_calendar',
    businessHours: 'academic_hours',
    seasonality: 'low_december_january'
  },
  'capitec-org-id': {
    name: 'Capitec Bank',
    billingType: 'invoice',
    sector: 'Financial Services',
    vmPattern: 'high_availability',
    businessHours: '24x7',
    seasonality: 'month_end_peaks'
  },
  'sanlam-org-id': {
    name: 'Sanlam',
    billingType: 'invoice', 
    sector: 'Financial Services',
    vmPattern: 'compliance_driven',
    businessHours: 'business_hours',
    seasonality: 'quarter_end_peaks'
  }
};

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
  balanceAfter: number;
  category: 'deposit' | 'vm_provision' | 'vm_hourly' | 'vm_resize' | 'vm_terminate' | 'disk_provision' | 'auto_topup' | 'invoice_payment' | 'rollover_credit' | 'penalty' | 'refund';
  vmId?: string;
  vmType?: string;
  metadata?: any;
}

function calculateVMCosts(vmConfig: any) {
  const vcpuCost = vmConfig.cpu * (vmConfig.cpuSpeed === '2GHz' ? 155 : 78);
  const ramCost = vmConfig.memory * 38;
  const diskCost = (vmConfig.storage / 100) * (vmConfig.storageType === 'Premium' ? 275 : 180);
  
  return {
    monthlyCost: vcpuCost + ramCost + diskCost,
    hourlyCost: (vcpuCost + ramCost) / 744,
    diskCost: diskCost,
    immediate: diskCost
  };
}

function generateVMLifecycleEvents(organizationId: string, startDate: Date, endDate: Date): Transaction[] {
  const profile = COMPANY_PROFILES[organizationId];
  const transactions: Transaction[] = [];
  let currentBalance = 0;
  let vmCounter = 1;
  let transactionId = 1;

  const activeVMs = new Map<string, { 
    type: string, 
    config: any, 
    costs: any, 
    provisionedAt: Date,
    lastBilled: Date,
    totalHours: number 
  }>();

  // Opening deposit
  const openingDeposit = profile.billingType === 'credit_card' ? 
    (Math.random() * 50000 + 100000) : // R1000-1500 for credit card
    (Math.random() * 200000 + 500000); // R5000-7000 for invoice

  currentBalance += openingDeposit;
  transactions.push({
    id: `tx-${String(transactionId++).padStart(4, '0')}`,
    amount: openingDeposit,
    type: 'credit',
    description: profile.billingType === 'credit_card' ? 
      'Opening deposit via Credit Card' : 
      'Opening credit facility - Initial deposit',
    createdAt: startDate.toISOString(),
    balanceAfter: currentBalance,
    category: 'deposit'
  });

  const current = new Date(startDate);
  const vmTypes = Object.keys(VM_TYPES);

  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    // VM Provisioning events (2-8 per month based on company size)
    const vmEvents = getVMEventsForMonth(profile, current.getMonth());
    
    for (let event = 0; event < vmEvents.provision; event++) {
      const vmType = vmTypes[Math.floor(Math.random() * vmTypes.length)];
      const vmConfig = VM_TYPES[vmType];
      const costs = calculateVMCosts(vmConfig);
      const vmId = `vm-${profile.name.toLowerCase().replace(/\s+/g, '-')}-${String(vmCounter++).padStart(3, '0')}`;
      
      const provisionDate = new Date(monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime()));
      
      // Immediate disk charge
      currentBalance -= costs.immediate * 100; // Convert to cents
      transactions.push({
        id: `tx-${String(transactionId++).padStart(4, '0')}`,
        amount: -costs.immediate * 100,
        type: 'debit',
        description: `VM Disk Provisioning - ${vmConfig.storage}GB ${vmConfig.storageType} Storage - ${vmId}`,
        createdAt: provisionDate.toISOString(),
        balanceAfter: currentBalance,
        category: 'disk_provision',
        vmId: vmId,
        vmType: vmType,
        metadata: { vmConfig, costs }
      });

      // Monthly compute reservation charge
      const monthlyCompute = (costs.monthlyCost - costs.diskCost) * 100;
      currentBalance -= monthlyCompute;
      transactions.push({
        id: `tx-${String(transactionId++).padStart(4, '0')}`,
        amount: -monthlyCompute,
        type: 'debit',
        description: `VM Compute Reservation - ${vmConfig.cpu}x${vmConfig.cpuSpeed} vCPU, ${vmConfig.memory}GB RAM - ${vmId}`,
        createdAt: provisionDate.toISOString(),
        balanceAfter: currentBalance,
        category: 'vm_provision',
        vmId: vmId,
        vmType: vmType
      });

      activeVMs.set(vmId, {
        type: vmType,
        config: vmConfig,
        costs: costs,
        provisionedAt: provisionDate,
        lastBilled: provisionDate,
        totalHours: 0
      });

      // CRITICAL: Check for low balance and trigger top-up for credit card customers
      // Credit card customers must NEVER have negative balances
      if (profile.billingType === 'credit_card' && currentBalance < 50000) { // Top up when below R500
        const deficit = Math.abs(Math.min(0, currentBalance)); // How much we're in the red
        const topupAmount = deficit + 100000 + Math.random() * 50000; // Deficit + R1000-1500 buffer
        currentBalance += topupAmount;
        transactions.push({
          id: `tx-${String(transactionId++).padStart(4, '0')}`,
          amount: topupAmount,
          type: 'credit',
          description: profile.name.includes('University') ? 
            'Manual top-up via Credit Card ****1234' : 
            'Auto top-up via Credit Card ****5678',
          createdAt: new Date(provisionDate.getTime() + Math.random() * 7200000).toISOString(), // Within 2 hours
          balanceAfter: currentBalance,
          category: 'auto_topup'
        });
      }
    }

    // VM Resize events (1-3 per month)
    const activeVMList = Array.from(activeVMs.entries());
    for (let resize = 0; resize < Math.min(vmEvents.resize, activeVMList.length); resize++) {
      const [vmId, vmData] = activeVMList[Math.floor(Math.random() * activeVMList.length)];
      const newVmTypes = vmTypes.filter(t => t !== vmData.type);
      const newVmType = newVmTypes[Math.floor(Math.random() * newVmTypes.length)];
      const newConfig = VM_TYPES[newVmType];
      const newCosts = calculateVMCosts(newConfig);
      const oldCosts = vmData.costs;
      
      const resizeDate = new Date(monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime()));
      const costDifference = (newCosts.monthlyCost - oldCosts.monthlyCost) * 100;
      
      if (costDifference !== 0) {
        currentBalance -= costDifference;
        transactions.push({
          id: `tx-${String(transactionId++).padStart(4, '0')}`,
          amount: -Math.abs(costDifference),
          type: costDifference > 0 ? 'debit' : 'credit',
          description: `VM Resize - ${vmData.type} → ${newVmType} - ${vmId} - ${costDifference > 0 ? 'Upgrade' : 'Downgrade'} adjustment`,
          createdAt: resizeDate.toISOString(),
          balanceAfter: currentBalance,
          category: 'vm_resize',
          vmId: vmId,
          vmType: newVmType,
          metadata: { 
            oldType: vmData.type, 
            newType: newVmType, 
            costDifference: costDifference / 100 
          }
        });

        // Update VM data
        activeVMs.set(vmId, {
          ...vmData,
          type: newVmType,
          config: newConfig,
          costs: newCosts
        });
      }
    }

    // VM Termination events (0-2 per month)
    for (let terminate = 0; terminate < Math.min(vmEvents.terminate, activeVMList.length); terminate++) {
      const [vmId, vmData] = activeVMList[Math.floor(Math.random() * activeVMList.length)];
      const terminateDate = new Date(monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime()));
      
      // Partial refund for unused monthly allocation
      const daysUsed = Math.max(1, (terminateDate.getTime() - vmData.provisionedAt.getTime()) / (1000 * 60 * 60 * 24));
      const monthlyDays = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      const refundRatio = Math.max(0, Math.min(0.95, (monthlyDays - daysUsed) / monthlyDays)); // Cap at 95%
      const refundAmount = (vmData.costs.monthlyCost - vmData.costs.diskCost) * refundRatio * 100;
      
      if (refundAmount > 100) { // Only refund if > R1
        currentBalance += refundAmount;
        transactions.push({
          id: `tx-${String(transactionId++).padStart(4, '0')}`,
          amount: refundAmount,
          type: 'credit',
          description: `VM Termination Refund - Unused compute allocation - ${vmId} - ${Math.round(refundRatio * 100)}% of month unused`,
          createdAt: terminateDate.toISOString(),
          balanceAfter: currentBalance,
          category: 'refund',
          vmId: vmId,
          metadata: { daysUsed: Math.round(daysUsed), refundRatio }
        });
      }

      transactions.push({
        id: `tx-${String(transactionId++).padStart(4, '0')}`,
        amount: 0,
        type: 'debit',
        description: `VM Terminated - ${vmId} - Total runtime: ${Math.round(daysUsed)} days`,
        createdAt: terminateDate.toISOString(),
        balanceAfter: currentBalance,
        category: 'vm_terminate',
        vmId: vmId,
        metadata: { totalDays: Math.round(daysUsed) }
      });

      activeVMs.delete(vmId);
    }

    // Monthly invoice payment for invoice customers
    if (profile.billingType === 'invoice' && current.getDate() === 25) {
      const monthlyCharges = transactions
        .filter(t => t.type === 'debit' && 
          new Date(t.createdAt).getMonth() === current.getMonth() - 1)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      if (monthlyCharges > 0) {
        currentBalance += monthlyCharges * 0.95; // Pay 95% of charges
        transactions.push({
          id: `tx-${String(transactionId++).padStart(4, '0')}`,
          amount: monthlyCharges * 0.95,
          type: 'credit',
          description: `Invoice Payment - INV-${current.getFullYear()}-${String(current.getMonth()).padStart(2, '0')}-001 - EFT Transfer`,
          createdAt: current.toISOString(),
          balanceAfter: currentBalance,
          category: 'invoice_payment'
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  // Sort transactions chronologically and recalculate running balances
  const sortedTransactions = transactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  // Recalculate balances to ensure accuracy
  let runningBalance = 0;
  sortedTransactions.forEach(tx => {
    runningBalance += tx.amount;
    tx.balanceAfter = runningBalance;
  });

  // FINAL VALIDATION: Credit card customers must NEVER end with negative balance
  if (profile.billingType === 'credit_card' && runningBalance < 0) {
    const finalTopupAmount = Math.abs(runningBalance) + 50000 + Math.random() * 30000; // Ensure positive final balance
    const finalTopup = {
      id: `tx-${String(transactionId++).padStart(4, '0')}`,
      amount: finalTopupAmount,
      type: 'credit' as const,
      description: 'Emergency auto top-up via Credit Card ****5678 - Balance correction',
      createdAt: endDate.toISOString(),
      balanceAfter: runningBalance + finalTopupAmount,
      category: 'auto_topup' as const,
      formattedAmount: `R${(finalTopupAmount / 100).toFixed(2)}`,
      amountColor: 'success' as const,
      relativeTime: 'Today'
    };
    
    sortedTransactions.push(finalTopup);
    runningBalance += finalTopupAmount;
    
    // Update the last transaction's balance
    sortedTransactions[sortedTransactions.length - 1].balanceAfter = runningBalance;
  }

  return sortedTransactions;
}

function getVMEventsForMonth(profile: any, month: number): { provision: number, resize: number, terminate: number } {
  let base = { provision: 3, resize: 1, terminate: 1 };
  
  // Adjust based on company pattern
  switch (profile.vmPattern) {
    case 'high_utilization':
      base = { provision: 8, resize: 3, terminate: 2 };
      break;
    case 'steady_growth':
      base = { provision: 5, resize: 2, terminate: 1 };
      break;
    case 'academic_calendar':
      // Higher activity in Feb-May, Aug-Nov
      base = [2, 6, 8, 8, 6, 1, 1, 6, 8, 8, 6, 2][month];
      base = { provision: base, resize: Math.floor(base/2), terminate: Math.floor(base/3) };
      break;
    case 'compliance_driven':
      base = { provision: 4, resize: 1, terminate: 0 }; // Less termination
      break;
  }

  // Apply seasonality
  switch (profile.seasonality) {
    case 'high_december':
      if (month === 11) base.provision *= 1.5;
      break;
    case 'low_december_january':
      if (month === 11 || month === 0) base.provision *= 0.3;
      break;
    case 'quarter_end_peaks':
      if ([2, 5, 8, 11].includes(month)) base.provision *= 1.3;
      break;
    case 'month_end_peaks':
      base.provision += 2; // Consistent monthly peaks
      break;
  }

  return {
    provision: Math.floor(base.provision),
    resize: Math.floor(base.resize),
    terminate: Math.floor(base.terminate)
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const months = parseInt(searchParams.get('months') || '6');
    
    if (!organizationId || !COMPANY_PROFILES[organizationId]) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid organization ID' 
      }, { status: 400 });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = generateVMLifecycleEvents(organizationId, startDate, endDate);
    const profile = COMPANY_PROFILES[organizationId];

    // Calculate summary stats
    const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const currentBalance = transactions[transactions.length - 1]?.balanceAfter || 0;

    const vmStats = {
      provisioned: transactions.filter(t => t.category === 'vm_provision').length,
      resized: transactions.filter(t => t.category === 'vm_resize').length,
      terminated: transactions.filter(t => t.category === 'vm_terminate').length,
      activeEstimate: transactions.filter(t => t.category === 'vm_provision').length - 
                     transactions.filter(t => t.category === 'vm_terminate').length
    };

    return NextResponse.json({
      success: true,
      data: {
        organization: {
          name: profile.name,
          billingType: profile.billingType,
          sector: profile.sector,
          pattern: profile.vmPattern
        },
        simulation: {
          periodMonths: months,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalTransactions: transactions.length
        },
        wallet: {
          currentBalance,
          formattedBalance: `R${(Math.abs(currentBalance) / 100).toFixed(2)}`,
          balanceStatus: currentBalance >= 0 ? 'positive' : 'negative'
        },
        transactions: transactions.map(tx => ({
          ...tx,
          formattedAmount: `R${(Math.abs(tx.amount) / 100).toFixed(2)}`,
          amountColor: tx.type === 'credit' ? 'success' : 'error',
          relativeTime: getRelativeTime(tx.createdAt)
        })),
        summary: {
          totalCredits: `R${(totalCredits / 100).toFixed(2)}`,
          totalDebits: `R${(totalDebits / 100).toFixed(2)}`,
          netMovement: `R${((totalCredits - totalDebits) / 100).toFixed(2)}`,
          vmStats
        }
      }
    });

  } catch (error) {
    console.error('Wallet simulation error:', error);
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
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays/7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays/30)}mo ago`;
  return `${Math.floor(diffDays/365)}y ago`;
}