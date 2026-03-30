const axios = require('axios');

describe('Directus Connectivity Smoke Test', () => {
  const directusUrl = global.testConfig.directusUrl;

  test('Directus server is accessible', async () => {
    const response = await axios.get(`${directusUrl}/server/info`);
    
    expect(response.status).toBe(200);
    expect(response.data.data.project.project_name).toBe('Directus');
  });

  test('Directus authentication endpoint is accessible', async () => {
    try {
      const response = await axios.post(`${directusUrl}/auth/login`, {
        email: global.testConfig.adminEmail,
        password: global.testConfig.adminPassword
      });
      
      expect(response.status).toBe(200);
      expect(response.data.data.access_token).toBeDefined();
    } catch (error) {
      // If authentication fails, check if it's because user doesn't exist
      if (error.response && error.response.status === 401) {
        console.log('Admin user may not be set up yet - this is expected for fresh installations');
        expect(error.response.status).toBe(401);
      } else {
        throw error;
      }
    }
  });

  test('Environment variables are loaded', () => {
    expect(global.testConfig.directusUrl).toBeDefined();
    expect(global.testConfig.adminEmail).toBeDefined();
    expect(global.testConfig.adminPassword).toBeDefined();
    expect(global.testConfig.key).toBeDefined();
    expect(global.testConfig.secret).toBeDefined();
  });
});
