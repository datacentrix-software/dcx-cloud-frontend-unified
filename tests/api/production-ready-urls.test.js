// Test-Driven Development: Production-Ready URL Configuration
const axios = require('axios');

describe('Production-Ready API URL Configuration', () => {
  test('should proxy API calls to correct backend domain', async () => {
    // Test that frontend proxy forwards to correct backend
    try {
      const response = await axios.get('http://localhost:3000/api/users', {
        timeout: 5000,
        validateStatus: () => true // Accept all status codes
      });
      
      // Should get 401 (auth required) not 404 (not found)
      expect(response.status).toBe(401);
      expect(response.data).toBeDefined();
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Frontend not proxying to correct backend URL');
      }
      throw error;
    }
  });

  test('should handle cross-origin requests in production', async () => {
    // Test CORS headers are present
    const response = await axios.get('http://localhost:3000/api/users', {
      timeout: 5000,
      validateStatus: () => true
    });
    
    expect(response.headers['access-control-allow-origin']).toBeDefined();
    expect(response.headers['access-control-allow-credentials']).toBeDefined();
  });
});
