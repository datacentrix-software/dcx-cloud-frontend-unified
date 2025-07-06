// Test-Driven Development: API Communication Tests
const axios = require('axios');

describe('Frontend-Backend API Communication Tests', () => {
  const FRONTEND_URL = 'http://localhost:3000';
  const BACKEND_URL = 'http://localhost:5001';  // Backend runs on 5001
  let authToken = null;

  // Test 1: Verify backend health endpoint
  test('should connect to backend health endpoint', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/health`);
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    } catch (error) {
      // If no health endpoint, try a known endpoint
      if (error.response?.status === 404) {
        console.log('No health endpoint, trying users endpoint...');
        const response = await axios.get(`${BACKEND_URL}/api/users`);
        // Should get 401 without auth, not 404
        expect(error.response.status).toBe(401);
      } else {
        throw error;
      }
    }
  });

  // Test 2: Verify authentication endpoint  
  test('should authenticate successfully with valid credentials', async () => {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'cjinganje@datacentrix.co.za',
      password: 'Platform.2023'
    });
    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
    authToken = response.data.token;
  });

  // Test 3: Verify VM endpoint with auth
  test('should fetch VMs with valid auth token', async () => {
    expect(authToken).toBeDefined();
    
    const response = await axios.get(`${BACKEND_URL}/api/vmwareintegration`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // Test 4: Verify frontend API proxy configuration
  test('should proxy API calls from frontend to backend', async () => {
    expect(authToken).toBeDefined();
    
    const response = await axios.get(`${FRONTEND_URL}/api/vmwareintegration`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
