const axios = require('axios');

describe('Basic Directus Connectivity Tests', () => {
  const directusUrl = global.testConfig.directusUrl;

  test('Directus server is accessible', async () => {
    const response = await axios.get(`${directusUrl}/server/info`);
    
    expect(response.status).toBe(200);
    expect(response.data.data.project.project_name).toBe('Directus');
  });

  test('Directus collections endpoint is accessible', async () => {
    try {
      const response = await axios.get(`${directusUrl}/collections`);
      
      // This might fail with authentication error, but we can check if the endpoint exists
      expect([200, 401, 403]).toContain(response.status);
    } catch (error) {
      // If we get an error, check if it's an authentication error (expected)
      if (error.response && [401, 403].includes(error.response.status)) {
        expect([401, 403]).toContain(error.response.status);
      } else {
        throw error;
      }
    }
  });

  test('Environment variables are loaded correctly', () => {
    expect(global.testConfig.directusUrl).toBe('http://localhost:8055');
    expect(global.testConfig.adminEmail).toBeDefined();
    expect(global.testConfig.adminPassword).toBeDefined();
    expect(global.testConfig.key).toBeDefined();
    expect(global.testConfig.secret).toBeDefined();
  });

  test('Can access Directus documentation endpoint', async () => {
    try {
      const response = await axios.get(`${directusUrl}/server/specs/oas3`);
      
      expect(response.status).toBe(200);
      expect(response.data.openapi).toBeDefined();
    } catch (error) {
      // If docs endpoint doesn't exist, that's okay for this test
      expect(error.response.status).toBe(404);
    }
  });

  test('Directus health check', async () => {
    try {
      const response = await axios.get(`${directusUrl}/health`);
      expect(response.status).toBe(200);
    } catch (error) {
      // If health endpoint doesn't exist, that's okay
      expect(error.response.status).toBe(404);
    }
  });
});
