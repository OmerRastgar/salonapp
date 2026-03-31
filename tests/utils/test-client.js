const axios = require('axios');

class TestClient {
  constructor() {
    this.directusUrl = global.testConfig.directusUrl;
    this.adminToken = null;
  }

  async authenticateAdmin() {
    try {
      const response = await axios.post(`${this.directusUrl}/auth/login`, {
        email: global.testConfig.adminEmail,
        password: global.testConfig.adminPassword
      });
      
      const result = response.data.data;
      console.log('Auth successful, token exists:', !!result.access_token);
      this.adminToken = result.access_token;
      return this.adminToken;
    } catch (error) {
      console.error('Auth error details:', error.response?.data || error.message);
      throw new Error(`Admin authentication failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async ensureAdminToken() {
    if (!this.adminToken) {
      await this.authenticateAdmin();
    }
    return this.adminToken;
  }

  getAuthHeaders(token = null) {
    const authToken = token || this.adminToken;
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }

  // Generic CRUD operations using REST API
  async createItem(collection, data, token = null) {
    await this.ensureAdminToken();
    const response = await axios.post(
      `${this.directusUrl}/items/${collection}`,
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.data;
  }

  async getItems(collection, params = {}, token = null) {
    await this.ensureAdminToken();
    const response = await axios.get(
      `${this.directusUrl}/items/${collection}`,
      { 
        params,
        headers: this.getAuthHeaders(token)
      }
    );
    return response.data.data;
  }

  async getItem(collection, id, params = {}, token = null) {
    await this.ensureAdminToken();
    const response = await axios.get(
      `${this.directusUrl}/items/${collection}/${id}`,
      { 
        params,
        headers: this.getAuthHeaders(token)
      }
    );
    return response.data.data;
  }

  async updateItem(collection, id, data, token = null) {
    await this.ensureAdminToken();
    const response = await axios.patch(
      `${this.directusUrl}/items/${collection}/${id}`,
      data,
      { headers: this.getAuthHeaders(token) }
    );
    return response.data.data;
  }

  async deleteItem(collection, id, token = null) {
    await this.ensureAdminToken();
    await axios.delete(
      `${this.directusUrl}/items/${collection}/${id}`,
      { headers: this.getAuthHeaders(token) }
    );
    return true;
  }

  // Authentication helpers
  async authenticate(credentials) {
    try {
      const response = await axios.post(`${this.directusUrl}/auth/login`, credentials);
      return {
        user: response.data.data.user,
        token: response.data.data.access_token,
        refresh_token: response.data.data.refresh_token,
        expires_at: response.data.data.expires
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${this.directusUrl}/auth/refresh`, {
        refresh_token: refreshToken
      });
      return {
        user: response.data.data.user,
        token: response.data.data.access_token,
        refresh_token: response.data.data.refresh_token,
        expires_at: response.data.data.expires
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async getUserToken(email, password) {
    const authResult = await this.authenticate({ email, password });
    return authResult.token;
  }

  async requestPasswordReset(email) {
    try {
      const response = await axios.post(`${this.directusUrl}/auth/password/request`, {
        email
      });
      return {
        token: response.data.data.token,
        expires_at: response.data.data.expires
      };
    } catch (error) {
      throw new Error(`Password reset request failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      await axios.post(`${this.directusUrl}/auth/password/reset`, {
        token,
        password: newPassword
      });
      return true;
    } catch (error) {
      throw new Error(`Password reset failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  async changePassword(email, currentPassword, newPassword) {
    try {
      await axios.post(`${this.directusUrl}/users/password/change`, {
        email,
        current_password: currentPassword,
        password: newPassword
      });
      return true;
    } catch (error) {
      throw new Error(`Password change failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Preflight request helper for CORS testing
  async preflightRequest(path, options = {}) {
    try {
      const response = await axios.options(`${this.directusUrl}${path}`, {
        headers: options.headers || {}
      });
      return {
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      throw new Error(`Preflight request failed: ${error.message}`);
    }
  }

  // Cleanup test data
  async cleanupTestData() {
    try {
      await this.ensureAdminToken();
      
      // Clean up test data from various collections
      const collections = ['bookings', 'reviews', 'employees', 'services', 'vendors'];
      
      for (const collection of collections) {
        try {
          const items = await this.getItems(collection, {
            filter: {
              name: { _contains: 'Test' }
            }
          });
          
          for (const item of items) {
            await this.deleteItem(collection, item.id);
          }
        } catch (error) {
          console.warn(`Cleanup warning for ${collection}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  // Token expiration helper
  setTokenExpired(token) {
    // Mock token expiration for testing
    this.expiredToken = token;
  }
}

module.exports = TestClient;
