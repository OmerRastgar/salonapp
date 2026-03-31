// Jest setup file
require('dotenv').config({ path: '../.env' });

// Global test timeout
jest.setTimeout(30000);

// Test database configuration
global.testConfig = {
  directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  key: process.env.KEY,
  secret: process.env.SECRET
};

// Mock console methods during tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error
};
