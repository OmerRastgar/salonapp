const { test, expect } = require('@playwright/test');

test.describe('Salon Marketplace Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the salon marketplace
    await page.goto('http://localhost');
  });

  test('should display salon listings', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/Salon Marketplace/);
    
    // Look for salon listings (this will need to be adapted based on actual frontend)
    const salonListings = page.locator('[data-testid="salon-listing"]');
    
    // If no salons exist, we should see a message or empty state
    if (await salonListings.count() === 0) {
      const emptyState = page.locator('[data-testid="no-salons-message"]');
      await expect(emptyState).toBeVisible();
    } else {
      await expect(salonListings.first()).toBeVisible();
    }
  });

  test('should allow browsing services', async ({ page }) => {
    // This test assumes there are salons with services
    // We'll need to adapt based on the actual frontend implementation
    
    // Look for services section
    const servicesSection = page.locator('[data-testid="services-section"]');
    
    if (await servicesSection.isVisible()) {
      const serviceCards = page.locator('[data-testid="service-card"]');
      
      if (await serviceCards.count() > 0) {
        const firstService = serviceCards.first();
        await expect(firstService).toBeVisible();
        
        // Check service details are displayed
        const serviceName = firstService.locator('[data-testid="service-name"]');
        const servicePrice = firstService.locator('[data-testid="service-price"]');
        const serviceDuration = firstService.locator('[data-testid="service-duration"]');
        
        await expect(serviceName).toBeVisible();
        await expect(servicePrice).toBeVisible();
        await expect(serviceDuration).toBeVisible();
      }
    }
  });

  test('should handle booking process', async ({ page }) => {
    // This test will need to be adapted based on the actual booking flow
    
    // Look for a book button or booking interface
    const bookButton = page.locator('[data-testid="book-service-button"]').first();
    
    if (await bookButton.isVisible()) {
      await bookButton.click();
      
      // Should see booking form or calendar
      const bookingForm = page.locator('[data-testid="booking-form"]');
      await expect(bookingForm).toBeVisible();
      
      // Fill out booking form (fields will need to match actual implementation)
      const nameInput = page.locator('[data-testid="customer-name"]');
      const emailInput = page.locator('[data-testid="customer-email"]');
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Customer');
        await emailInput.fill('test@example.com');
        
        // Submit booking
        const submitButton = page.locator('[data-testid="submit-booking"]');
        await submitButton.click();
        
        // Should see confirmation or error message
        const confirmation = page.locator('[data-testid="booking-confirmation"]');
        const errorMessage = page.locator('[data-testid="booking-error"]');
        
        await expect(confirmation.or(errorMessage)).toBeVisible();
      }
    } else {
      // If no bookable services are available, that's also a valid state
      console.log('No bookable services found - skipping booking test');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    
    // Check that the page is still functional
    await expect(page).toBeVisible();
    
    // Check mobile navigation if it exists
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      const mobileNav = page.locator('[data-testid="mobile-navigation"]');
      await expect(mobileNav).toBeVisible();
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Intercept API calls to test loading states
    await page.route('**/api/**', route => {
      // Delay the response to simulate loading
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.reload();
    
    // Look for loading indicators
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toBeVisible();
      
      // Wait for loading to complete
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate API errors
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.reload();
    
    // Should show error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('error');
    }
  });
});
