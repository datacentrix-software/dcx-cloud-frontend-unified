const express = require('express');
const cors = require('cors');
const app = express();
const port = 8003;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Complete Multi-Reseller Hierarchy: Datacentrix -> 6 Resellers -> Their Customers
const mockOrganizations = [
  // Root organization
  {
    id: "datacentrix-root",
    name: "Datacentrix Cloud",
    type: "internal",
    isReseller: false,
    parent_id: null,
    createdAt: new Date().toISOString(),
    status: "active",
    totalRevenue: 2500000,
    resellerCount: 6,
    totalCustomers: 14
  },
  
  // === 6 RESELLERS UNDER DATACENTRIX ===
  
  // 1. CloudTech Resellers Demo (Original)
  {
    id: "cloudtech-reseller-demo-001",
    name: "CloudTech Resellers Demo",
    type: "reseller",
    isReseller: true,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active",
    totalRevenue: 450000,
    monthlyCommission: 45000,
    customerCount: 2
  },
  
  // 2. TechPro Solutions  
  {
    id: "techpro-reseller-001",
    name: "TechPro Solutions",
    type: "reseller", 
    isReseller: true,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active",
    totalRevenue: 380000,
    monthlyCommission: 38000,
    customerCount: 2
  },
  
  // 3. AfricaTech Partners
  {
    id: "africatech-partners-001",
    name: "AfricaTech Partners",
    type: "reseller",
    isReseller: true,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active",
    totalRevenue: 520000,
    monthlyCommission: 52000,
    customerCount: 3
  },
  
  // 4. Cape Digital Solutions
  {
    id: "cape-digital-001",
    name: "Cape Digital Solutions",
    type: "reseller",
    isReseller: true,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active",
    totalRevenue: 350000,
    monthlyCommission: 35000,
    customerCount: 2
  },
  
  // 5. Joburg Cloud Services
  {
    id: "joburg-cloud-001",
    name: "Joburg Cloud Services",
    type: "reseller",
    isReseller: true,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active",
    totalRevenue: 470000,
    monthlyCommission: 47000,
    customerCount: 3
  },
  
  // 6. KZN Technology Hub
  {
    id: "kzn-tech-001",
    name: "KZN Technology Hub",
    type: "reseller",
    isReseller: true,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active",
    totalRevenue: 330000,
    monthlyCommission: 33000,
    customerCount: 2
  },
  
  // === CUSTOMERS UNDER CLOUDTECH RESELLERS ===
  
  {
    id: "vodacom-id",
    name: "Vodacom",
    type: "customer",
    isReseller: false,
    parent_id: "cloudtech-reseller-demo-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "mtn-id",
    name: "MTN", 
    type: "customer",
    isReseller: false,
    parent_id: "cloudtech-reseller-demo-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  
  // === CUSTOMERS UNDER TECHPRO SOLUTIONS ===
  
  {
    id: "discovery-id",
    name: "Discovery Health",
    type: "customer",
    isReseller: false,
    parent_id: "techpro-reseller-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "capitec-id",
    name: "Capitec Bank",
    type: "customer",
    isReseller: false,
    parent_id: "techpro-reseller-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  
  // === CUSTOMERS UNDER AFRICATECH PARTNERS ===
  
  {
    id: "fnb-corporate-id",
    name: "FNB Corporate",
    type: "customer",
    isReseller: false,
    parent_id: "africatech-partners-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "old-mutual-id",
    name: "Old Mutual",
    type: "customer",
    isReseller: false,
    parent_id: "africatech-partners-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "pick-n-pay-id",
    name: "Pick n Pay",
    type: "customer",
    isReseller: false,
    parent_id: "africatech-partners-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  
  // === CUSTOMERS UNDER CAPE DIGITAL SOLUTIONS ===
  
  {
    id: "shoprite-id",
    name: "Shoprite Holdings",
    type: "customer",
    isReseller: false,
    parent_id: "cape-digital-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "woolworths-id",
    name: "Woolworths SA",
    type: "customer",
    isReseller: false,
    parent_id: "cape-digital-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  
  // === CUSTOMERS UNDER JOBURG CLOUD SERVICES ===
  
  {
    id: "standard-bank-id",
    name: "Standard Bank",
    type: "customer",
    isReseller: false,
    parent_id: "joburg-cloud-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "absa-corporate-id",
    name: "ABSA Corporate",
    type: "customer",
    isReseller: false,
    parent_id: "joburg-cloud-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "nedbank-business-id",
    name: "Nedbank Business",
    type: "customer",
    isReseller: false,
    parent_id: "joburg-cloud-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  
  // === CUSTOMERS UNDER KZN TECHNOLOGY HUB ===
  
  {
    id: "mr-price-id",
    name: "Mr Price Group",
    type: "customer",
    isReseller: false,
    parent_id: "kzn-tech-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "tongaat-hulett-id",
    name: "Tongaat Hulett",
    type: "customer",
    isReseller: false,
    parent_id: "kzn-tech-001",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  
  // === DIRECT CUSTOMERS (NO RESELLER) ===
  
  {
    id: "sasol-direct-id",
    name: "Sasol (Direct)",
    type: "customer",
    isReseller: false,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "eskom-direct-id",
    name: "Eskom (Direct)",
    type: "customer",
    isReseller: false,
    parent_id: "datacentrix-root",
    createdAt: new Date().toISOString(),
    status: "active"
  }
];

const mockUsers = [
  {
    id: "customer-admin-demo-001",
    email: "john.demo@vodacom.co.za",
    firstName: "John",
    lastName: "Customer",
    userType: "external",
    organizationId: "vodacom-id"
  }
];

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Backend API running', timestamp: new Date().toISOString() });
});

// Helper function to get organizations by user type and reseller
const getOrganizationsByScope = (userType, resellerId = null) => {
  if (userType === 'internal') {
    // Internal users see everything
    return mockOrganizations;
  } else if (userType === 'reseller') {
    // Resellers see themselves and their customers
    const reseller = mockOrganizations.find(org => org.id === resellerId);
    if (!reseller) return [];
    
    const resellerCustomers = mockOrganizations.filter(org => org.parent_id === resellerId);
    return [reseller, ...resellerCustomers];
  } else {
    // Customers see only their own organization
    return mockOrganizations.filter(org => org.id === resellerId);
  }
};

// Reseller API endpoints with security checks
app.get('/api/organisation/reseller/customers', (req, res) => {
  console.log('GET /api/organisation/reseller/customers called');
  
  const resellerId = req.query.resellerId || 'cloudtech-reseller-demo-001';
  const requestingUserId = req.query.requestingUserId || req.headers['user-type'];
  
  // Security check - prevent unauthorized cross-reseller access
  if (requestingUserId && requestingUserId !== 'internal' && requestingUserId !== resellerId) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized access',
      message: 'You can only access your own customers'
    });
  }
  
  // Get only customers belonging to this reseller
  const resellerCustomers = mockOrganizations.filter(org => 
    org.parent_id === resellerId && org.type === 'customer'
  );
  
  res.json({
    success: true,
    data: resellerCustomers,
    message: `Retrieved ${resellerCustomers.length} customers for reseller`,
    resellerId: resellerId
  });
});

// Get all resellers (for testing purposes)
app.get('/api/resellers', (req, res) => {
  console.log('GET /api/resellers called');
  
  const resellers = mockOrganizations.filter(org => org.type === 'reseller');
  
  res.json({
    success: true,
    data: resellers,
    message: 'All resellers retrieved successfully'
  });
});

// User management endpoints
app.get('/api/users', (req, res) => {
  console.log('GET /api/users called');
  res.json({
    success: true,
    data: mockUsers,
    message: 'Users retrieved successfully'
  });
});

// Organization endpoints with scope-based filtering
app.get('/api/organisations', (req, res) => {
  console.log('GET /api/organisations called');
  
  const userType = req.query.userType || 'internal';
  const resellerId = req.query.resellerId;
  
  const scopedOrganizations = getOrganizationsByScope(userType, resellerId);
  
  res.json({
    success: true,
    data: scopedOrganizations,
    message: `Organizations for ${userType} user`,
    scope: { userType, resellerId }
  });
});

// Get organization hierarchy
app.get('/api/organisations/hierarchy', (req, res) => {
  console.log('GET /api/organisations/hierarchy called');
  
  const buildHierarchy = (parentId = null) => {
    return mockOrganizations
      .filter(org => org.parent_id === parentId)
      .map(org => ({
        ...org,
        children: buildHierarchy(org.id)
      }));
  };
  
  res.json({
    success: true,
    data: buildHierarchy(),
    message: 'Organization hierarchy retrieved successfully'
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Mock Backend API running on http://localhost:${port}`);
  console.log('📊 Available endpoints:');
  console.log('  GET / - Health check');
  console.log('  GET /api/organisation/reseller/customers - Reseller customers');
  console.log('  GET /api/users - Users list');
  console.log('  GET /api/organisations - Organizations list');
});