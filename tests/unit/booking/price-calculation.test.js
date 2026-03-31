/**
 * Price Calculation and Freezing Unit Tests
 * Tests for booking price calculation logic and price freezing at creation time
 */

describe('Price Calculation', () => {
  describe('Base Price Calculation', () => {
    test('should calculate correct base price for single service', () => {
      const service = {
        price: 50.00,
        duration: 60
      };
      const booking = {
        service_id: service,
        quantity: 1
      };
      
      const expectedPrice = 50.00;
      const calculatedPrice = calculateBasePrice(booking);
      
      expect(calculatedPrice).toBe(expectedPrice);
    });

    test('should calculate correct price for multiple quantities', () => {
      const service = {
        price: 30.00,
        duration: 45
      };
      const booking = {
        service_id: service,
        quantity: 3
      };
      
      const expectedPrice = 90.00;
      const calculatedPrice = calculateBasePrice(booking);
      
      expect(calculatedPrice).toBe(expectedPrice);
    });

    test('should handle zero quantity gracefully', () => {
      const service = {
        price: 50.00,
        duration: 60
      };
      const booking = {
        service_id: service,
        quantity: 0
      };
      
      const expectedPrice = 0.00;
      const calculatedPrice = calculateBasePrice(booking);
      
      expect(calculatedPrice).toBe(expectedPrice);
    });
  });

  describe('Discount Calculation', () => {
    test('should apply percentage discount correctly', () => {
      const basePrice = 100.00;
      const discount = {
        type: 'percentage',
        value: 10
      };
      
      const expectedPrice = 90.00;
      const calculatedPrice = applyDiscount(basePrice, discount);
      
      expect(calculatedPrice).toBe(expectedPrice);
    });

    test('should apply fixed amount discount correctly', () => {
      const basePrice = 100.00;
      const discount = {
        type: 'fixed',
        value: 15.00
      };
      
      const expectedPrice = 85.00;
      const calculatedPrice = applyDiscount(basePrice, discount);
      
      expect(calculatedPrice).toBe(expectedPrice);
    });

    test('should not allow discount to exceed 100%', () => {
      const basePrice = 100.00;
      const discount = {
        type: 'percentage',
        value: 150
      };
      
      const expectedPrice = 0.00;
      const calculatedPrice = applyDiscount(basePrice, discount);
      
      expect(calculatedPrice).toBe(expectedPrice);
    });

    test('should not allow fixed discount to exceed base price', () => {
      const basePrice = 50.00;
      const discount = {
        type: 'fixed',
        value: 75.00
      };
      
      const expectedPrice = 0.00;
      const calculatedPrice = applyDiscount(basePrice, discount);
      
      expect(calculatedPrice).toBe(expectedPrice);
    });
  });

  describe('Tax Calculation', () => {
    test('should calculate tax correctly for standard rate', () => {
      const netPrice = 80.00;
      const taxRate = 0.08; // 8%
      
      const expectedTax = 6.40;
      const calculatedTax = calculateTax(netPrice, taxRate);
      
      expect(calculatedTax).toBe(expectedTax);
    });

    test('should handle zero tax rate', () => {
      const netPrice = 100.00;
      const taxRate = 0;
      
      const expectedTax = 0.00;
      const calculatedTax = calculateTax(netPrice, taxRate);
      
      expect(calculatedTax).toBe(expectedTax);
    });

    test('should round tax to 2 decimal places', () => {
      const netPrice = 33.33;
      const taxRate = 0.0825; // 8.25%
      
      const expectedTax = 2.75; // 33.33 * 0.0825 = 2.749725, rounded to 2.75
      const calculatedTax = calculateTax(netPrice, taxRate);
      
      expect(calculatedTax).toBe(expectedTax);
    });
  });

  describe('Total Price Calculation', () => {
    test('should calculate total price with all components', () => {
      const booking = {
        service_id: {
          price: 100.00,
          duration: 60
        },
        quantity: 2,
        discount: {
          type: 'percentage',
          value: 10
        }
      };
      const taxRate = 0.08;
      
      const expectedTotal = 194.40; // (200 - 20) + (180 * 0.08) = 180 + 14.40
      const calculatedTotal = calculateTotalPrice(booking, taxRate);
      
      expect(calculatedTotal).toBe(expectedTotal);
    });

    test('should handle booking without discount', () => {
      const booking = {
        service_id: {
          price: 75.00,
          duration: 45
        },
        quantity: 1
      };
      const taxRate = 0.08;
      
      const expectedTotal = 81.00; // 75 + (75 * 0.08)
      const calculatedTotal = calculateTotalPrice(booking, taxRate);
      
      expect(calculatedTotal).toBe(expectedTotal);
    });
  });
});

describe('Price Freezing', () => {
  describe('Price Storage', () => {
    test('should store all price components at booking creation', () => {
      const bookingData = {
        service_id: { id: 1, price: 50.00 },
        quantity: 2,
        discount: { type: 'percentage', value: 10 },
        tax_rate: 0.08
      };
      
      const booking = createBookingWithFrozenPrices(bookingData);
      
      expect(booking.base_price).toBe(100.00);
      expect(booking.discount_amount).toBe(10.00);
      expect(booking.tax_amount).toBe(7.20);
      expect(booking.total_price).toBe(97.20);
      expect(booking.price_frozen_at).toBeDefined();
    });

    test('should not recalculate prices after creation', () => {
      const originalServicePrice = 50.00;
      const bookingData = {
        service_id: { id: 1, price: originalServicePrice },
        quantity: 1,
        tax_rate: 0.08
      };
      
      const booking = createBookingWithFrozenPrices(bookingData);
      
      // Simulate service price change
      bookingData.service_id.price = 75.00;
      
      // Booking price should remain frozen
      const recalculatedPrice = calculateTotalPrice(bookingData, 0.08);
      expect(booking.total_price).not.toBe(recalculatedPrice);
      expect(booking.total_price).toBe(54.00); // 50 + (50 * 0.08)
    });
  });

  describe('Price Integrity', () => {
    test('should validate frozen price components', () => {
      const booking = {
        base_price: 100.00,
        discount_amount: 10.00,
        tax_amount: 7.20,
        total_price: 97.20
      };
      
      const isValid = validateFrozenPrices(booking);
      expect(isValid).toBe(true);
    });

    test('should detect corrupted price data', () => {
      const booking = {
        base_price: 100.00,
        discount_amount: 10.00,
        tax_amount: 7.20,
        total_price: 95.00 // Should be 97.20
      };
      
      const isValid = validateFrozenPrices(booking);
      expect(isValid).toBe(false);
    });
  });
});

// Helper functions (would be implemented in the actual codebase)
function calculateBasePrice(booking) {
  if (!booking.service_id || !booking.service_id.price) return 0;
  const quantity = booking.quantity !== undefined ? booking.quantity : 1;
  return booking.service_id.price * quantity;
}

function applyDiscount(basePrice, discount) {
  if (!discount) return basePrice;
  
  if (discount.type === 'percentage') {
    const discountAmount = basePrice * (Math.min(discount.value, 100) / 100);
    return Math.max(0, basePrice - discountAmount);
  } else if (discount.type === 'fixed') {
    return Math.max(0, basePrice - Math.min(discount.value, basePrice));
  }
  
  return basePrice;
}

function calculateTax(netPrice, taxRate) {
  return Math.round((netPrice * taxRate) * 100) / 100;
}

function calculateTotalPrice(booking, taxRate = 0) {
  const basePrice = calculateBasePrice(booking);
  const discountedPrice = applyDiscount(basePrice, booking.discount);
  const taxAmount = calculateTax(discountedPrice, taxRate);
  
  return Math.round((discountedPrice + taxAmount) * 100) / 100;
}

function createBookingWithFrozenPrices(bookingData) {
  const basePrice = calculateBasePrice(bookingData);
  const discountedPrice = applyDiscount(basePrice, bookingData.discount);
  const taxAmount = calculateTax(discountedPrice, bookingData.tax_rate || 0);
  const totalPrice = discountedPrice + taxAmount;
  
  return {
    ...bookingData,
    base_price: basePrice,
    discount_amount: basePrice - discountedPrice,
    tax_amount: taxAmount,
    total_price: Math.round(totalPrice * 100) / 100,
    price_frozen_at: new Date().toISOString()
  };
}

function validateFrozenPrices(booking) {
  const expectedTotal = booking.base_price - booking.discount_amount + booking.tax_amount;
  const actualTotal = Math.round(expectedTotal * 100) / 100;
  return booking.total_price === actualTotal;
}
