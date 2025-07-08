/**
 * DCX Cloud Puppeteer Automation Service
 * Comprehensive automation for dashboard metrics, wallet operations, VM management, and reporting
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

export interface AutomationConfig {
  baseUrl: string;
  credentials: {
    email: string;
    password: string;
  };
  headless?: boolean;
  timeout?: number;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface DashboardMetrics {
  totalVMs: number;
  totalCPUs: number;
  totalRAM: number;
  totalStorage: number;
  activeCustomers: number;
  monthlyRevenue: string;
  topCustomers: Array<{
    name: string;
    usage: string;
    revenue: string;
  }>;
}

export interface WalletReport {
  organizationName: string;
  billingType: string;
  currentBalance: string;
  totalCredits: string;
  totalDebits: string;
  recentTransactions: Array<{
    type: string;
    description: string;
    amount: string;
    date: string;
  }>;
}

export interface VMDetails {
  vmId: string;
  name: string;
  status: string;
  cpu: string;
  memory: string;
  storage: string;
  organization: string;
  cost: string;
}

export class DCXAutomationService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: AutomationConfig;

  constructor(config: AutomationConfig) {
    this.config = {
      headless: true,
      timeout: 30000,
      viewport: { width: 1920, height: 1080 },
      ...config
    };
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport(this.config.viewport!);
      await this.page.setDefaultTimeout(this.config.timeout!);

      // Set user agent to avoid detection
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      console.log('🤖 DCX Automation Service initialized');
    } catch (error) {
      console.error('Failed to initialize automation service:', error);
      throw error;
    }
  }

  async authenticate(): Promise<boolean> {
    if (!this.page) throw new Error('Service not initialized');

    try {
      console.log('🔐 Authenticating user...');
      
      // Navigate to login page
      await this.page.goto(`${this.config.baseUrl}/auth/login`, { 
        waitUntil: 'networkidle2' 
      });

      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

      // Fill credentials
      await this.page.type('input[type="email"], input[name="email"]', this.config.credentials.email);
      await this.page.type('input[type="password"], input[name="password"]', this.config.credentials.password);

      // Submit form
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
        this.page.click('button[type="submit"], .login-button, [data-testid="login-button"]')
      ]);

      // Verify successful login
      const isAuthenticated = await this.page.evaluate(() => {
        return !window.location.href.includes('/auth/login') && 
               !document.querySelector('.error-message, .alert-error');
      });

      if (isAuthenticated) {
        console.log('✅ Authentication successful');
        return true;
      } else {
        console.log('❌ Authentication failed');
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async captureDashboardMetrics(): Promise<DashboardMetrics> {
    if (!this.page) throw new Error('Service not initialized');

    try {
      console.log('📊 Capturing dashboard metrics...');

      // Navigate to dashboard
      await this.page.goto(`${this.config.baseUrl}/nlu/dashboards/customer`, {
        waitUntil: 'networkidle2'
      });

      // Wait for metrics to load
      await this.page.waitForSelector('[data-testid="dashboard-metrics"], .dashboard-card, .metric-card', {
        timeout: 15000
      });

      // Extract metrics
      const metrics = await this.page.evaluate(() => {
        const getTextContent = (selector: string): string => {
          const element = document.querySelector(selector);
          return element?.textContent?.trim() || '0';
        };

        const getMetricValue = (label: string): string => {
          const elements = Array.from(document.querySelectorAll('*'));
          const labelElement = elements.find(el => 
            el.textContent?.toLowerCase().includes(label.toLowerCase())
          );
          
          if (labelElement) {
            const parent = labelElement.closest('.metric-card, .dashboard-card, .card');
            const valueElement = parent?.querySelector('.metric-value, .value, h1, h2, h3, .number');
            return valueElement?.textContent?.trim() || '0';
          }
          return '0';
        };

        return {
          totalVMs: parseInt(getMetricValue('total vm').replace(/[^\d]/g, '') || '0'),
          totalCPUs: parseInt(getMetricValue('cpu').replace(/[^\d]/g, '') || '0'),
          totalRAM: parseInt(getMetricValue('ram').replace(/[^\d]/g, '') || '0'),
          totalStorage: parseInt(getMetricValue('storage').replace(/[^\d]/g, '') || '0'),
          activeCustomers: parseInt(getMetricValue('customer').replace(/[^\d]/g, '') || '0'),
          monthlyRevenue: getMetricValue('revenue'),
          topCustomers: Array.from(document.querySelectorAll('.customer-row, .top-customer')).slice(0, 5).map(row => ({
            name: row.querySelector('.customer-name, .name')?.textContent?.trim() || '',
            usage: row.querySelector('.usage, .cpu, .memory')?.textContent?.trim() || '',
            revenue: row.querySelector('.revenue, .cost, .amount')?.textContent?.trim() || ''
          }))
        };
      });

      console.log('✅ Dashboard metrics captured:', metrics);
      return metrics;
    } catch (error) {
      console.error('Error capturing dashboard metrics:', error);
      throw error;
    }
  }

  async generateWalletReport(organizationId: string): Promise<WalletReport> {
    if (!this.page) throw new Error('Service not initialized');

    try {
      console.log(`💰 Generating wallet report for organization: ${organizationId}`);

      // Navigate to wallet demo with specific organization
      await this.page.goto(`${this.config.baseUrl}/nlu/wallet/demo`, {
        waitUntil: 'networkidle2'
      });

      // Wait for wallet demo to load
      await this.page.waitForSelector('.customer-card, [data-testid="customer-selector"]', {
        timeout: 15000
      });

      // Select the specific organization if customer selector exists
      const hasCustomerSelector = await this.page.$('.customer-card');
      if (hasCustomerSelector) {
        // Click on the organization card based on organizationId or name
        const organizationCards = await this.page.$$('.customer-card');
        for (const card of organizationCards) {
          const cardText = await card.evaluate(el => el.textContent);
          if (cardText?.includes(organizationId) || 
              cardText?.toLowerCase().includes('adcock') ||
              cardText?.toLowerCase().includes('vodacom')) {
            await card.click();
            break;
          }
        }
      }

      // Wait for wallet statement to load
      await this.page.waitForSelector('.wallet-statement, [data-testid="wallet-statement"]', {
        timeout: 10000
      });

      // Extract wallet data
      const walletReport = await this.page.evaluate(() => {
        const getTextByLabel = (label: string): string => {
          const elements = Array.from(document.querySelectorAll('*'));
          const labelElement = elements.find(el => 
            el.textContent?.toLowerCase().includes(label.toLowerCase())
          );
          
          if (labelElement) {
            const parent = labelElement.closest('.card, .summary-card, .wallet-card');
            const valueElement = parent?.querySelector('.value, .amount, .balance');
            return valueElement?.textContent?.trim() || '';
          }
          return '';
        };

        // Get organization info
        const orgName = document.querySelector('h5, .organization-name')?.textContent?.trim() || '';
        const billingType = document.querySelector('.billing-type, [data-testid="billing-type"]')?.textContent?.trim() || '';

        // Get balance info
        const currentBalance = getTextByLabel('current balance') || 
                              document.querySelector('.current-balance, [data-testid="current-balance"]')?.textContent?.trim() || '';
        const totalCredits = getTextByLabel('total credits') ||
                            document.querySelector('.total-credits, [data-testid="total-credits"]')?.textContent?.trim() || '';
        const totalDebits = getTextByLabel('total debits') ||
                           document.querySelector('.total-debits, [data-testid="total-debits"]')?.textContent?.trim() || '';

        // Get recent transactions
        const transactionRows = Array.from(document.querySelectorAll('tbody tr, .transaction-row')).slice(0, 10);
        const recentTransactions = transactionRows.map(row => {
          const cells = row.querySelectorAll('td, .transaction-cell');
          return {
            type: cells[0]?.textContent?.trim() || '',
            description: cells[1]?.textContent?.trim() || '',
            amount: cells[2]?.textContent?.trim() || '',
            date: cells[4]?.textContent?.trim() || ''
          };
        });

        return {
          organizationName: orgName,
          billingType: billingType,
          currentBalance: currentBalance,
          totalCredits: totalCredits,
          totalDebits: totalDebits,
          recentTransactions: recentTransactions
        };
      });

      console.log('✅ Wallet report generated:', walletReport);
      return walletReport;
    } catch (error) {
      console.error('Error generating wallet report:', error);
      throw error;
    }
  }

  async captureVMInventory(): Promise<VMDetails[]> {
    if (!this.page) throw new Error('Service not initialized');

    try {
      console.log('🖥️ Capturing VM inventory...');

      // Navigate to VM management page
      await this.page.goto(`${this.config.baseUrl}/nlu/customer/virtual-machines`, {
        waitUntil: 'networkidle2'
      });

      // Wait for VM list to load
      await this.page.waitForSelector('.vm-list, .virtual-machine-card, [data-testid="vm-list"]', {
        timeout: 15000
      });

      // Extract VM details
      const vmInventory = await this.page.evaluate(() => {
        const vmElements = Array.from(document.querySelectorAll('.vm-card, .virtual-machine-card, .vm-row, tbody tr'));
        
        return vmElements.map((vmElement, index) => {
          const getText = (selector: string): string => {
            return vmElement.querySelector(selector)?.textContent?.trim() || '';
          };

          return {
            vmId: getText('.vm-id, [data-testid="vm-id"]') || `vm-${index + 1}`,
            name: getText('.vm-name, .name, h3, h4') || `VM-${index + 1}`,
            status: getText('.status, .vm-status, .badge') || 'Unknown',
            cpu: getText('.cpu, .vcpu, [data-testid="cpu"]') || '',
            memory: getText('.memory, .ram, [data-testid="memory"]') || '',
            storage: getText('.storage, .disk, [data-testid="storage"]') || '',
            organization: getText('.organization, .customer, [data-testid="organization"]') || '',
            cost: getText('.cost, .price, .amount, [data-testid="cost"]') || ''
          };
        });
      });

      console.log(`✅ VM inventory captured: ${vmInventory.length} VMs found`);
      return vmInventory;
    } catch (error) {
      console.error('Error capturing VM inventory:', error);
      throw error;
    }
  }

  async captureFullScreenshot(filename?: string): Promise<string> {
    if (!this.page) throw new Error('Service not initialized');

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = filename || `screenshots/dcx-cloud-${timestamp}.png`;
      
      // Ensure screenshots directory exists
      await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });

      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  }

  async generatePDFReport(url?: string, filename?: string): Promise<string> {
    if (!this.page) throw new Error('Service not initialized');

    try {
      if (url) {
        await this.page.goto(url, { waitUntil: 'networkidle2' });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const pdfPath = filename || `reports/dcx-cloud-report-${timestamp}.pdf`;
      
      // Ensure reports directory exists
      await fs.mkdir(path.dirname(pdfPath), { recursive: true });

      await this.page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      console.log(`📄 PDF report generated: ${pdfPath}`);
      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  async runComprehensiveAudit(): Promise<{
    dashboard: DashboardMetrics;
    walletReports: WalletReport[];
    vmInventory: VMDetails[];
    screenshots: string[];
    timestamp: string;
  }> {
    try {
      console.log('🔍 Running comprehensive DCX Cloud audit...');
      
      const timestamp = new Date().toISOString();
      const auditResults = {
        dashboard: {} as DashboardMetrics,
        walletReports: [] as WalletReport[],
        vmInventory: [] as VMDetails[],
        screenshots: [] as string[],
        timestamp
      };

      // Authenticate first
      const isAuthenticated = await this.authenticate();
      if (!isAuthenticated) {
        throw new Error('Authentication failed');
      }

      // Capture dashboard metrics
      auditResults.dashboard = await this.captureDashboardMetrics();
      auditResults.screenshots.push(await this.captureFullScreenshot(`screenshots/dashboard-${timestamp.replace(/[:.]/g, '-')}.png`));

      // Generate wallet reports for key organizations
      const organizations = ['adcock-org-id', 'vodacom-org-id', 'manchest-org-id'];
      for (const orgId of organizations) {
        try {
          const walletReport = await this.generateWalletReport(orgId);
          auditResults.walletReports.push(walletReport);
          auditResults.screenshots.push(await this.captureFullScreenshot(`screenshots/wallet-${orgId}-${timestamp.replace(/[:.]/g, '-')}.png`));
        } catch (error) {
          console.warn(`Failed to generate wallet report for ${orgId}:`, error);
        }
      }

      // Capture VM inventory
      auditResults.vmInventory = await this.captureVMInventory();
      auditResults.screenshots.push(await this.captureFullScreenshot(`screenshots/vm-inventory-${timestamp.replace(/[:.]/g, '-')}.png`));

      console.log('✅ Comprehensive audit completed successfully');
      return auditResults;
    } catch (error) {
      console.error('Error during comprehensive audit:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log('🔒 DCX Automation Service closed');
    }
  }
}

// Utility function to create automation service with default config
export function createDCXAutomation(credentials: { email: string; password: string }, options?: Partial<AutomationConfig>): DCXAutomationService {
  const config: AutomationConfig = {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://dev.frontend.test.daas.datacentrix.cloud'
      : 'http://localhost:3001',
    credentials,
    headless: process.env.NODE_ENV === 'production',
    timeout: 30000,
    viewport: { width: 1920, height: 1080 },
    ...options
  };

  return new DCXAutomationService(config);
}