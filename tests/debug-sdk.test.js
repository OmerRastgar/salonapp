const { createDirectus } = require('@directus/sdk');
const axios = require('axios');

describe('Directus SDK Debug Test', () => {
  test('should create Directus client and authenticate', async () => {
    const directusUrl = global.testConfig.directusUrl;
    
    // Test basic client creation
    const client = createDirectus(directusUrl);
    expect(client).toBeDefined();
    
    // Test authentication with axios
    const authResponse = await axios.post(`${directusUrl}/auth/login`, {
      email: global.testConfig.adminEmail,
      password: global.testConfig.adminPassword
    });
    
    expect(authResponse.status).toBe(200);
    expect(authResponse.data.data.access_token).toBeDefined();
    
    const token = authResponse.data.data.access_token;
    
    // Test setting token on client
    console.log('Testing client.setToken method...');
    console.log('Client methods:', Object.getOwnPropertyNames(client));
    console.log('Client prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
    
    // Try different methods to set token
    try {
      if (typeof client.setToken === 'function') {
        client.setToken(token);
        console.log('✓ client.setToken works');
      } else if (typeof client.withToken === 'function') {
        const clientWithToken = client.withToken(token);
        console.log('✓ client.withToken works');
      } else {
        console.log('❌ No token method found');
      }
    } catch (error) {
      console.log('Token setting error:', error.message);
    }
  });
});
