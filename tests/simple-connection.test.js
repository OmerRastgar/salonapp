/**
 * Simple Directus Connection Test
 */

require('dotenv').config({ path: '../.env' });

describe('Simple Connection Test', () => {
  test('should load environment variables', () => {
    expect(process.env.DIRECTUS_URL).toBeDefined();
    expect(process.env.ADMIN_EMAIL).toBeDefined();
    expect(process.env.ADMIN_PASSWORD).toBeDefined();
  });

  test('should reach Directus server', async () => {
    const axios = require('axios');
    
    try {
      const response = await axios.get(`${process.env.DIRECTUS_URL}/server/info`);
      console.log('Directus server reachable:', response.status);
      expect(response.status).toBe(200);
    } catch (error) {
      console.error('Server not reachable:', error.message);
      throw error;
    }
  });

  test('should authenticate via REST API', async () => {
    const axios = require('axios');
    
    try {
      const response = await axios.post(`${process.env.DIRECTUS_URL}/auth/login`, {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
      
      console.log('Auth successful, token exists:', !!response.data.data.access_token);
      expect(response.data.data.access_token).toBeDefined();
      expect(response.data.data.access_token.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Auth failed:', error.response?.data || error.message);
      throw error;
    }
  });
});
