#!/usr/bin/env node

/**
 * Dummy Data Setup Script for Reseller Testing
 * 
 * This script creates a comprehensive set of dummy data to test:
 * - Multi-tenant organization hierarchy
 * - Reseller → Customer relationships  
 * - Role-based access control
 * - Internal "god mode" access
 * 
 * Run with: node scripts/setup-dummy-data.js
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Common password for all dummy users (development only!)
const DUMMY_PASSWORD = 'TestPass123!';

async function generateData() {
  const hashedPassword = await bcrypt.hash(DUMMY_PASSWORD, 10);
  
  console.log('🔐 Generated password hash for dummy users:', hashedPassword);
  console.log('📝 All dummy users have password:', DUMMY_PASSWORD);
  console.log('');
  
  const data = {
    // Organizations
    organizations: [
      {
        id: 'datacentrix-internal-001',
        name: 'Datacentrix Cloud (Internal)',
        type: 'internal',
        isReseller: false,
        parentId: null
      },
      {
        id: 'cloudtech-reseller-001', 
        name: 'CloudTech Resellers',
        type: 'reseller',
        isReseller: true,
        parentId: null
      },
      {
        id: 'netsolutions-reseller-001',
        name: 'NetSolutions Partners', 
        type: 'reseller',
        isReseller: true,
        parentId: null
      },
      {
        id: 'startupcorp-customer-001',
        name: 'StartupCorp',
        type: 'customer', 
        isReseller: false,
        parentId: 'cloudtech-reseller-001'
      },
      {
        id: 'retailchain-customer-001',
        name: 'RetailChain SA',
        type: 'customer',
        isReseller: false, 
        parentId: 'cloudtech-reseller-001'
      },
      {
        id: 'manufacturing-customer-001',
        name: 'ManufacturingCo',
        type: 'customer',
        isReseller: false,
        parentId: 'netsolutions-reseller-001'
      }
    ],
    
    // Users with proper password hashing
    users: [
      // Internal users
      {
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Admin', 
        email: 'john.admin@datacentrix.co.za',
        password: hashedPassword,
        userType: 'internal',
        orgId: 'datacentrix-internal-001',
        role: 'Root',
        scope: 'global'
      },
      {
        id: uuidv4(),
        firstName: 'Sarah',
        lastName: 'Engineer',
        email: 'sarah.engineer@datacentrix.co.za', 
        password: hashedPassword,
        userType: 'internal',
        orgId: 'datacentrix-internal-001',
        role: 'Engineer', 
        scope: 'global'
      },
      
      // Reseller users
      {
        id: uuidv4(),
        firstName: 'Alex',
        lastName: 'Reseller',
        email: 'alex@cloudtech.co.za',
        password: hashedPassword,
        userType: 'external',
        orgId: 'cloudtech-reseller-001',
        role: 'Reseller Admin',
        scope: 'reseller_estate'
      },
      {
        id: uuidv4(),
        firstName: 'David', 
        lastName: 'Partner',
        email: 'david@netsolutions.co.za',
        password: hashedPassword,
        userType: 'external',
        orgId: 'netsolutions-reseller-001', 
        role: 'Reseller Admin',
        scope: 'reseller_estate'
      },
      
      // Customer users
      {
        id: uuidv4(),
        firstName: 'Tom',
        lastName: 'Startup',
        email: 'tom@startupcorp.com',
        password: hashedPassword,
        userType: 'external',
        orgId: 'startupcorp-customer-001',
        role: 'Organization Admin',
        scope: 'organisation'
      },
      {
        id: uuidv4(),
        firstName: 'Jane',
        lastName: 'Developer',
        email: 'jane@startupcorp.com',
        password: hashedPassword,
        userType: 'external', 
        orgId: 'startupcorp-customer-001',
        role: 'Engineer',
        scope: 'organisation'
      },
      {
        id: uuidv4(),
        firstName: 'Mary',
        lastName: 'Manager', 
        email: 'mary@retailchain.co.za',
        password: hashedPassword,
        userType: 'external',
        orgId: 'retailchain-customer-001',
        role: 'Organization Admin',
        scope: 'organisation'
      }
    ]
  };
  
  return data;
}

// Test scenarios this enables
const testScenarios = [
  {
    user: 'john.admin@datacentrix.co.za',
    description: 'Internal God Mode - Should see ALL organizations',
    expectedAccess: ['All organizations', 'All customer data', 'Full admin rights']
  },
  {
    user: 'alex@cloudtech.co.za', 
    description: 'Reseller Access - Should see CloudTech + their customers',
    expectedAccess: ['CloudTech org', 'StartupCorp', 'RetailChain', 'NOT NetSolutions customers']
  },
  {
    user: 'tom@startupcorp.com',
    description: 'Customer Access - Should ONLY see StartupCorp',
    expectedAccess: ['StartupCorp only', 'Cannot see other customers', 'Can manage StartupCorp users']
  },
  {
    user: 'david@netsolutions.co.za',
    description: 'Different Reseller - Should see NetSolutions + their customers',
    expectedAccess: ['NetSolutions org', 'ManufacturingCo', 'NOT CloudTech customers']
  }
];

async function main() {
  console.log('🚀 DCX Cloud Services - Dummy Data Generator');
  console.log('============================================');
  console.log('');
  
  const data = await generateData();
  
  console.log('📊 Generated Data Summary:');
  console.log(`- Organizations: ${data.organizations.length}`);
  console.log(`- Users: ${data.users.length}`);
  console.log('');
  
  console.log('🏢 Organization Hierarchy:');
  data.organizations.forEach(org => {
    const indent = org.parentId ? '  └── ' : '';
    console.log(`${indent}${org.name} (${org.type})`);
  });
  console.log('');
  
  console.log('👥 Users by Organization:');
  data.users.forEach(user => {
    const org = data.organizations.find(o => o.id === user.orgId);
    console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`  Role: ${user.role} | Scope: ${user.scope} | Org: ${org?.name}`);
  });
  console.log('');
  
  console.log('🧪 Test Scenarios Enabled:');
  testScenarios.forEach((scenario, i) => {
    console.log(`${i + 1}. ${scenario.user}`);
    console.log(`   ${scenario.description}`);
    console.log(`   Expected: ${scenario.expectedAccess.join(', ')}`);
    console.log('');
  });
  
  console.log('📝 Next Steps:');
  console.log('1. Import this data into your local database');
  console.log('2. Activate reseller functionality in backend code');
  console.log('3. Test login with any of the dummy users');
  console.log('4. Verify organization access matches expectations');
  console.log('');
  console.log('🔐 All users have password:', DUMMY_PASSWORD);
  
  // Save to file for easy database import
  fs.writeFileSync('./scripts/dummy-data-output.json', JSON.stringify(data, null, 2));
  console.log('💾 Data saved to: ./scripts/dummy-data-output.json');
}

main().catch(console.error);

export { generateData, testScenarios };