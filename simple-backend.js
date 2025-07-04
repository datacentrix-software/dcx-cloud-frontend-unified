import express from 'express';
import cors from 'cors';
const app = express();
const port = 8003;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock data for testing
const mockCustomers = [
  {
    id: "vodacom-id",
    name: "Vodacom",
    type: "customer",
    isReseller: false,
    createdAt: new Date().toISOString(),
    status: "active"
  },
  {
    id: "mtn-id", 
    name: "MTN",
    type: "customer",
    isReseller: false,
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

// Reseller API endpoints
app.get('/api/organisation/reseller/customers', (req, res) => {
  console.log('GET /api/organisation/reseller/customers called');
  res.json({
    success: true,
    data: mockCustomers,
    message: 'Reseller customers retrieved successfully'
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

// Organization endpoints
app.get('/api/organisations', (req, res) => {
  console.log('GET /api/organisations called');
  res.json({
    success: true,
    data: mockCustomers,
    message: 'Organizations retrieved successfully'
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