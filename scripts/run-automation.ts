#!/usr/bin/env ts-node

/**
 * DCX Cloud Automation CLI Script
 * Run comprehensive automation testing and reporting
 * 
 * Usage:
 * npm run automation -- --email=user@example.com --password=pass --type=comprehensive
 * npm run automation -- --email=user@example.com --password=pass --type=dashboard
 * npm run automation -- --email=user@example.com --password=pass --type=wallet --org=adcock-org-id
 */

import { createDCXAutomation } from '../src/services/automation/puppeteer-service';
import fs from 'fs/promises';
import path from 'path';

interface CLIArgs {
  email?: string;
  password?: string;
  type?: string;
  org?: string;
  headless?: boolean;
  output?: string;
  help?: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      switch (key) {
        case 'email':
          args.email = value;
          break;
        case 'password':
          args.password = value;
          break;
        case 'type':
          args.type = value;
          break;
        case 'org':
        case 'organization':
          args.org = value;
          break;
        case 'headless':
          args.headless = value !== 'false';
          break;
        case 'output':
          args.output = value;
          break;
        case 'help':
        case 'h':
          args.help = true;
          break;
      }
    }
  });
  
  return args;
}

function showHelp() {
  console.log(`
🤖 DCX Cloud Automation CLI

Usage: npm run automation -- [options]

Options:
  --email=<email>          User email for authentication (required)
  --password=<password>    User password for authentication (required)
  --type=<type>           Automation type (default: comprehensive)
                          Options: comprehensive, dashboard, wallet, vm-inventory
  --org=<orgId>           Organization ID for wallet reports
  --headless=<bool>       Run in headless mode (default: true)
  --output=<path>         Output directory for reports
  --help                  Show this help message

Examples:
  # Run comprehensive audit
  npm run automation -- --email=user@example.com --password=mypass --type=comprehensive

  # Capture dashboard metrics only
  npm run automation -- --email=user@example.com --password=mypass --type=dashboard

  # Generate wallet report for specific organization
  npm run automation -- --email=user@example.com --password=mypass --type=wallet --org=adcock-org-id

  # Run with visible browser (non-headless)
  npm run automation -- --email=user@example.com --password=mypass --headless=false

Available Organization IDs for wallet reports:
  - adcock-org-id (Adcock Ingram - PAYG/Credit Card)
  - vodacom-org-id (Vodacom - Invoice Customer)
  - manchest-org-id (Manchester University - Education)
  - capitec-org-id (Capitec Bank - Financial Services)
  - sanlam-org-id (Sanlam - Insurance)
  `);
}

async function saveResults(results: any, outputPath?: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = outputPath || `automation-results-${timestamp}.json`;
  
  await fs.mkdir(path.dirname(filename), { recursive: true }).catch(() => {});
  await fs.writeFile(filename, JSON.stringify(results, null, 2));
  
  return filename;
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.email || !args.password) {
    console.error('❌ Error: Email and password are required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  const automationType = args.type || 'comprehensive';
  
  console.log(`🚀 Starting DCX Cloud automation: ${automationType}`);
  console.log(`📧 Email: ${args.email}`);
  console.log(`🎭 Headless: ${args.headless !== false}`);
  
  if (args.org) {
    console.log(`🏢 Organization: ${args.org}`);
  }

  // Create automation service
  const automation = createDCXAutomation(
    { 
      email: args.email, 
      password: args.password 
    },
    { 
      headless: args.headless !== false,
      baseUrl: process.env.DCX_BASE_URL || 'https://dev.frontend.test.daas.datacentrix.cloud'
    }
  );

  try {
    // Initialize
    console.log('🔧 Initializing automation service...');
    await automation.initialize();

    // Authenticate
    console.log('🔐 Authenticating...');
    const isAuthenticated = await automation.authenticate();
    
    if (!isAuthenticated) {
      throw new Error('Authentication failed - please check your credentials');
    }

    console.log('✅ Authentication successful');

    let results: any = {
      type: automationType,
      timestamp: new Date().toISOString(),
      success: true
    };

    // Run automation based on type
    switch (automationType) {
      case 'dashboard':
        console.log('📊 Capturing dashboard metrics...');
        results.dashboard = await automation.captureDashboardMetrics();
        results.screenshot = await automation.captureFullScreenshot();
        break;

      case 'wallet':
        const orgId = args.org || 'adcock-org-id';
        console.log(`💰 Generating wallet report for ${orgId}...`);
        results.wallet = await automation.generateWalletReport(orgId);
        results.screenshot = await automation.captureFullScreenshot();
        break;

      case 'vm-inventory':
        console.log('🖥️ Capturing VM inventory...');
        results.vmInventory = await automation.captureVMInventory();
        results.screenshot = await automation.captureFullScreenshot();
        break;

      case 'comprehensive':
      default:
        console.log('🔍 Running comprehensive audit...');
        results.audit = await automation.runComprehensiveAudit();
        break;
    }

    // Save results
    const outputFile = await saveResults(results, args.output);
    
    console.log('✅ Automation completed successfully!');
    console.log(`📄 Results saved to: ${outputFile}`);
    
    // Print summary
    if (results.dashboard) {
      console.log(`\n📊 Dashboard Summary:`);
      console.log(`   Total VMs: ${results.dashboard.totalVMs}`);
      console.log(`   Total CPUs: ${results.dashboard.totalCPUs}`);
      console.log(`   Total RAM: ${results.dashboard.totalRAM}GB`);
      console.log(`   Active Customers: ${results.dashboard.activeCustomers}`);
    }
    
    if (results.wallet) {
      console.log(`\n💰 Wallet Summary:`);
      console.log(`   Organization: ${results.wallet.organizationName}`);
      console.log(`   Billing Type: ${results.wallet.billingType}`);
      console.log(`   Current Balance: ${results.wallet.currentBalance}`);
      console.log(`   Total Credits: ${results.wallet.totalCredits}`);
      console.log(`   Total Debits: ${results.wallet.totalDebits}`);
    }
    
    if (results.vmInventory) {
      console.log(`\n🖥️ VM Inventory Summary:`);
      console.log(`   Total VMs: ${results.vmInventory.length}`);
    }
    
    if (results.audit) {
      console.log(`\n🔍 Comprehensive Audit Summary:`);
      console.log(`   Dashboard Metrics: ✅`);
      console.log(`   Wallet Reports: ${results.audit.walletReports.length} organizations`);
      console.log(`   VM Inventory: ${results.audit.vmInventory.length} VMs`);
      console.log(`   Screenshots: ${results.audit.screenshots.length} files`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Automation failed:', error);
    process.exit(1);
  } finally {
    await automation.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as runAutomation };