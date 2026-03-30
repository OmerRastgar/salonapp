# Salon Marketplace Test Suite

This directory contains the comprehensive test suite for the Salon Marketplace Booking System.

## Test Structure

```
tests/
├── package.json              # Test dependencies and scripts
├── jest.setup.js             # Jest configuration and globals
├── README.md                 # This file
├── fixtures/                 # Test data fixtures
│   └── test-data.js         # Reusable test data
├── utils/                    # Test utilities and helpers
│   └── test-client.js       # Directus test client
├── unit/                     # Unit tests
│   └── booking/
│       └── overlap-detection.test.js
├── integration/              # Integration tests
│   ├── api/
│   │   └── bookings.test.js
│   └── policies/
│       └── access-control.test.js
└── e2e/                      # End-to-end tests (to be added)
```

## Running Tests

### Prerequisites

1. Ensure Directus is running and accessible at `http://localhost:8055`
2. Environment variables are properly configured in `.env`
3. Test database is available (uses the same database as development)

### Installation

```bash
cd tests
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests (when implemented)
npm run test:e2e
```

## Test Categories

### Unit Tests
- **Overlap Detection**: Tests booking conflict detection logic
- **Business Logic**: Core business rules and calculations
- **Utilities**: Helper functions and utilities

### Integration Tests
- **API Tests**: Directus collection CRUD operations
- **Policy Tests**: Access control and permission enforcement
- **Flow Tests**: Directus Flow execution and automation

### End-to-End Tests
- **Booking Flow**: Complete customer booking journey
- **Dashboard Tests**: Vendor and employee dashboard functionality
- **Multi-tenancy**: Cross-vendor data isolation

## Key Test Scenarios

### Critical Business Rules
1. **No Overlapping Bookings**: Same employee cannot have overlapping time slots
2. **Price Freezing**: Booking prices are frozen at creation time
3. **Vendor Isolation**: Vendors can only access their own data
4. **Permission Enforcement**: Role-based access control works correctly

### Access Control Tests
- **Vendor Admin**: Full access to own vendor data
- **Employee**: Limited access to own schedule and bookings
- **Public**: Read-only access to listings, booking creation only

### API Integration Tests
- CRUD operations on all collections
- Field-level permissions
- Relationship integrity
- Data validation

## Test Data

The `fixtures/test-data.js` file contains reusable test data:
- Sample vendors, employees, and services
- Test booking scenarios
- User accounts for different roles
- Overlapping booking examples

## Environment Configuration

Tests use the following environment variables from `.env`:
- `PUBLIC_URL`: Directus instance URL
- `ADMIN_EMAIL`: Admin user email
- `ADMIN_PASSWORD`: Admin user password
- `KEY`: Directus API key
- `SECRET`: Directus API secret

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Tests clean up their own data using `testClient.cleanupTestData()`
3. **Authentication**: Tests authenticate as different roles to test permissions
4. **Error Handling**: Tests verify both success and failure scenarios
5. **Coverage**: Aim for high coverage of business-critical functionality

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Verify Directus is running and credentials are correct
2. **Database Connection**: Ensure PostgreSQL is accessible
3. **Permission Errors**: Check that policies and roles are properly configured
4. **Test Timeouts**: Increase timeout in `jest.setup.js` if needed

### Debugging

- Use `console.log` statements (they're mocked but will show in test output)
- Run tests with `--verbose` flag for detailed output
- Check Directus logs for additional error information
- Verify test data creation and cleanup in each test

## Adding New Tests

When adding new functionality:

1. Create unit tests for business logic
2. Add integration tests for API endpoints
3. Include access control tests for new permissions
4. Add E2E tests for complete user workflows
5. Update test fixtures if new data structures are needed

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- They use environment variables for configuration
- Clean up test data automatically
- Have reasonable timeouts
- Provide clear output for debugging
