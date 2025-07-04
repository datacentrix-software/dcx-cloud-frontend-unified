/**
 * Prisma Script to Insert Dummy Data for Reseller Testing
 * 
 * Run with: npx tsx scripts/insert-dummy-data.ts
 * Or: node --loader ts-node/esm scripts/insert-dummy-data.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const DUMMY_PASSWORD = 'TestPass123!';

async function main() {
  console.log('🚀 Inserting dummy data for reseller testing...');
  
  const hashedPassword = await bcrypt.hash(DUMMY_PASSWORD, 10);
  
  try {
    // 1. Create Organizations
    console.log('📁 Creating organizations...');
    
    // Internal org
    await prisma.organisation.upsert({
      where: { id: 'datacentrix-internal-001' },
      update: {},
      create: {
        id: 'datacentrix-internal-001',
        organisation_name: 'Datacentrix Cloud (Internal)',
        organisation_type: 'internal',
        organisation_status: 'active',
        isReseller: false,
        country: 'South Africa',
        registered_address: '123 Business Park, Johannesburg',
        billing_contact_email: 'billing@datacentrix.co.za'
      }
    });
    
    // Reseller orgs
    await prisma.organisation.upsert({
      where: { id: 'cloudtech-reseller-001' },
      update: {},
      create: {
        id: 'cloudtech-reseller-001',
        organisation_name: 'CloudTech Resellers',
        organisation_type: 'reseller',
        organisation_status: 'active',
        isReseller: true,
        country: 'South Africa',
        registered_address: '456 Tech Hub, Cape Town',
        billing_contact_email: 'billing@cloudtech.co.za'
      }
    });
    
    await prisma.organisation.upsert({
      where: { id: 'netsolutions-reseller-001' },
      update: {},
      create: {
        id: 'netsolutions-reseller-001',
        organisation_name: 'NetSolutions Partners',
        organisation_type: 'reseller',
        organisation_status: 'active',
        isReseller: true,
        country: 'South Africa',
        registered_address: '789 Innovation Drive, Durban',
        billing_contact_email: 'accounts@netsolutions.co.za'
      }
    });
    
    // Customer orgs
    await prisma.organisation.upsert({
      where: { id: 'startupcorp-customer-001' },
      update: {},
      create: {
        id: 'startupcorp-customer-001',
        organisation_name: 'StartupCorp',
        organisation_type: 'customer',
        organisation_status: 'active',
        isReseller: false,
        parent_id: 'cloudtech-reseller-001',
        country: 'South Africa',
        registered_address: '101 Startup Street, Stellenbosch',
        billing_contact_email: 'finance@startupcorp.com'
      }
    });
    
    await prisma.organisation.upsert({
      where: { id: 'retailchain-customer-001' },
      update: {},
      create: {
        id: 'retailchain-customer-001',
        organisation_name: 'RetailChain SA',
        organisation_type: 'customer',
        organisation_status: 'active',
        isReseller: false,
        parent_id: 'cloudtech-reseller-001',
        country: 'South Africa',
        registered_address: '202 Retail Plaza, Johannesburg',
        billing_contact_email: 'it@retailchain.co.za'
      }
    });
    
    await prisma.organisation.upsert({
      where: { id: 'manufacturing-customer-001' },
      update: {},
      create: {
        id: 'manufacturing-customer-001',
        organisation_name: 'ManufacturingCo',
        organisation_type: 'customer',
        organisation_status: 'active',
        isReseller: false,
        parent_id: 'netsolutions-reseller-001',
        country: 'South Africa',
        registered_address: '404 Industrial Park, Port Elizabeth',
        billing_contact_email: 'it@manufacturingco.co.za'
      }
    });
    
    // 2. Create Additional Roles
    console.log('👔 Creating additional roles...');
    
    const roles = [
      { id: 'org-admin-role-001', name: 'Organization Admin', description: 'Can manage users and settings within their organization' },
      { id: 'reseller-admin-role-001', name: 'Reseller Admin', description: 'Can manage all customer organizations under their reseller account' },
      { id: 'billing-admin-role-001', name: 'Billing Admin', description: 'Can manage billing, payments, and financial reports' },
      { id: 'readonly-user-role-001', name: 'Read Only User', description: 'Can view dashboards and reports but cannot make changes' },
      { id: 'support-role-001', name: 'Support', description: 'Internal support team with limited admin access' }
    ];
    
    for (const role of roles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: {},
        create: role
      });
    }
    
    // 3. Create Users
    console.log('👥 Creating users...');
    
    const users = [
      // Internal users
      {
        id: 'john-admin-internal-001',
        firstName: 'John',
        lastName: 'Admin',
        email: 'john.admin@datacentrix.co.za',
        userType: 'internal',
        orgId: 'datacentrix-internal-001',
        roleName: 'Root',
        scope: 'global'
      },
      {
        id: 'sarah-engineer-internal-001',
        firstName: 'Sarah',
        lastName: 'Engineer',
        email: 'sarah.engineer@datacentrix.co.za',
        userType: 'internal',
        orgId: 'datacentrix-internal-001',
        roleName: 'Engineer',
        scope: 'global'
      },
      
      // Reseller users
      {
        id: 'alex-reseller-cloudtech-001',
        firstName: 'Alex',
        lastName: 'Reseller',
        email: 'alex@cloudtech.co.za',
        userType: 'external',
        orgId: 'cloudtech-reseller-001',
        roleName: 'Reseller Admin',
        scope: 'reseller_estate'
      },
      {
        id: 'david-reseller-netsolutions-001',
        firstName: 'David',
        lastName: 'Partner',
        email: 'david@netsolutions.co.za',
        userType: 'external',
        orgId: 'netsolutions-reseller-001',
        roleName: 'Reseller Admin',
        scope: 'reseller_estate'
      },
      
      // Customer users
      {
        id: 'tom-startup-admin-001',
        firstName: 'Tom',
        lastName: 'Startup',
        email: 'tom@startupcorp.com',
        userType: 'external',
        orgId: 'startupcorp-customer-001',
        roleName: 'Organization Admin',
        scope: 'organisation'
      },
      {
        id: 'jane-startup-dev-001',
        firstName: 'Jane',
        lastName: 'Developer',
        email: 'jane@startupcorp.com',
        userType: 'external',
        orgId: 'startupcorp-customer-001',
        roleName: 'Engineer',
        scope: 'organisation'
      },
      {
        id: 'mary-retail-manager-001',
        firstName: 'Mary',
        lastName: 'Manager',
        email: 'mary@retailchain.co.za',
        userType: 'external',
        orgId: 'retailchain-customer-001',
        roleName: 'Organization Admin',
        scope: 'organisation'
      }
    ];
    
    for (const userData of users) {
      // Create user
      await prisma.user.upsert({
        where: { id: userData.id },
        update: {},
        create: {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          userType: userData.userType as any,
          isVerified: true,
          isFirstLogin: false
        }
      });
      
      // Find the role
      let role;
      if (userData.roleName === 'Root' || userData.roleName === 'Engineer' || userData.roleName === 'Administrator') {
        role = await prisma.role.findFirst({ where: { name: userData.roleName } });
      } else {
        // Map new role names to IDs
        const roleMap: Record<string, string> = {
          'Organization Admin': 'org-admin-role-001',
          'Reseller Admin': 'reseller-admin-role-001',
          'Billing Admin': 'billing-admin-role-001',
          'Read Only User': 'readonly-user-role-001',
          'Support': 'support-role-001'
        };
        role = await prisma.role.findFirst({ where: { id: roleMap[userData.roleName] } });
      }
      
      if (role) {
        // Create user role assignment
        await prisma.userRole.upsert({
          where: { id: `userrole-${userData.id}-001` },
          update: {},
          create: {
            id: `userrole-${userData.id}-001`,
            userId: userData.id,
            roleId: role.id,
            orgId: userData.orgId,
            scopeType: userData.scope as any,
            assignedAt: new Date()
          }
        });
      }
    }
    
    // 4. Create Organization Wallets
    console.log('💰 Creating organization wallets...');
    
    const wallets = [
      { id: 'wallet-cloudtech-001', orgId: 'cloudtech-reseller-001', balance: 15000.00 },
      { id: 'wallet-netsolutions-001', orgId: 'netsolutions-reseller-001', balance: 25000.00 },
      { id: 'wallet-startupcorp-001', orgId: 'startupcorp-customer-001', balance: 5000.00 },
      { id: 'wallet-retailchain-001', orgId: 'retailchain-customer-001', balance: 8000.00 },
      { id: 'wallet-manufacturing-001', orgId: 'manufacturing-customer-001', balance: 12000.00 }
    ];
    
    for (const wallet of wallets) {
      await prisma.organisationWallet.upsert({
        where: { id: wallet.id },
        update: {},
        create: {
          id: wallet.id,
          organisationId: wallet.orgId,
          balance: wallet.balance,
          currency: 'ZAR'
        }
      });
    }
    
    console.log('✅ Dummy data inserted successfully!');
    console.log('');
    console.log('🧪 Test Users (all have password: TestPass123!):');
    console.log('- john.admin@datacentrix.co.za (Internal God Mode)');
    console.log('- alex@cloudtech.co.za (Reseller Admin)');
    console.log('- tom@startupcorp.com (Customer Admin)');
    console.log('- jane@startupcorp.com (Customer Engineer)');
    console.log('');
    console.log('🏢 Organization Hierarchy Created:');
    console.log('- Datacentrix (Internal)');
    console.log('- CloudTech Resellers');
    console.log('  └── StartupCorp');
    console.log('  └── RetailChain SA');
    console.log('- NetSolutions Partners');
    console.log('  └── ManufacturingCo');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Activate reseller functionality in backend');
    console.log('2. Test login with different user types');
    console.log('3. Verify organization access isolation');
    
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });