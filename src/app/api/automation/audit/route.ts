import { NextRequest, NextResponse } from 'next/server';
import { createDCXAutomation } from '@/services/automation/puppeteer-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, type = 'comprehensive' } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    console.log(`🤖 Starting DCX Cloud automation audit: ${type}`);

    // Create automation service
    const automation = createDCXAutomation({ email, password });

    try {
      // Initialize and authenticate
      await automation.initialize();

      let results;

      switch (type) {
        case 'dashboard':
          const isAuth = await automation.authenticate();
          if (!isAuth) {
            throw new Error('Authentication failed');
          }
          results = {
            type: 'dashboard',
            data: await automation.captureDashboardMetrics(),
            screenshot: await automation.captureFullScreenshot(),
            timestamp: new Date().toISOString()
          };
          break;

        case 'wallet':
          const isAuthWallet = await automation.authenticate();
          if (!isAuthWallet) {
            throw new Error('Authentication failed');
          }
          const orgId = body.organizationId || 'adcock-org-id';
          results = {
            type: 'wallet',
            data: await automation.generateWalletReport(orgId),
            screenshot: await automation.captureFullScreenshot(),
            timestamp: new Date().toISOString()
          };
          break;

        case 'vm-inventory':
          const isAuthVM = await automation.authenticate();
          if (!isAuthVM) {
            throw new Error('Authentication failed');
          }
          results = {
            type: 'vm-inventory',
            data: await automation.captureVMInventory(),
            screenshot: await automation.captureFullScreenshot(),
            timestamp: new Date().toISOString()
          };
          break;

        case 'comprehensive':
        default:
          results = {
            type: 'comprehensive',
            data: await automation.runComprehensiveAudit(),
            timestamp: new Date().toISOString()
          };
          break;
      }

      return NextResponse.json({
        success: true,
        results
      });

    } finally {
      await automation.close();
    }

  } catch (error) {
    console.error('Automation audit error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'DCX Cloud Automation Service',
    endpoints: {
      'POST /api/automation/audit': {
        description: 'Run automated audit of DCX Cloud system',
        parameters: {
          email: 'string (required) - User email for authentication',
          password: 'string (required) - User password for authentication',
          type: 'string (optional) - Audit type: comprehensive, dashboard, wallet, vm-inventory',
          organizationId: 'string (optional) - For wallet audits, specific organization ID'
        },
        examples: {
          comprehensive: {
            email: 'user@example.com',
            password: 'password',
            type: 'comprehensive'
          },
          dashboard: {
            email: 'user@example.com',
            password: 'password',
            type: 'dashboard'
          },
          wallet: {
            email: 'user@example.com',
            password: 'password',
            type: 'wallet',
            organizationId: 'adcock-org-id'
          }
        }
      }
    }
  });
}