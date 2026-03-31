/**
 * Debug Directus Connection Test
 * Test to verify Directus API connectivity and available collections
 */

require('dotenv').config({ path: '../.env' });
const { createDirectus, rest, readItems, createDirectusToken } = require('@directus/sdk');

describe('Directus Connection Debug', () => {
  let directus;
  
  beforeAll(() => {
    directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055').with(rest());
  });

  test('should connect to Directus server', async () => {
    try {
      const response = await directus.request(
        readItems('directus_collections')
      );
      console.log('Collections found:', response.length);
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    } catch (error) {
      console.error('Connection error:', error.message);
      throw error;
    }
  });

  test('should authenticate with admin credentials', async () => {
    try {
      const response = await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
      console.log('Auth successful, token length:', response.access_token.length);
      expect(response.access_token).toBeDefined();
      expect(response.access_token.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Auth error:', error.message);
      throw error;
    }
  });

  test('should list available collections', async () => {
    try {
      await directus.login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
      
      const collections = await directus.request(
        readItems('directus_collections')
      );
      
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.collection}`);
      });
      
      expect(collections.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Collections error:', error.message);
      throw error;
    }
  });
});
