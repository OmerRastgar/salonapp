const { overlappingBookings } = require('../../fixtures/test-data');

describe('Booking Overlap Detection', () => {
  const checkOverlap = (booking1, booking2) => {
    const start1 = new Date(booking1.start_datetime);
    const end1 = new Date(booking1.end_datetime);
    const start2 = new Date(booking2.start_datetime);
    const end2 = new Date(booking2.end_datetime);

    // Check if bookings overlap
    return (
      (start1 < end2 && end1 > start2) ||
      (start2 < end1 && end2 > start1)
    );
  };

  describe('when bookings overlap', () => {
    test('should detect overlap when second booking starts during first booking', () => {
      const booking1 = overlappingBookings[0];
      const booking2 = overlappingBookings[1];
      
      const hasOverlap = checkOverlap(booking1, booking2);
      
      expect(hasOverlap).toBe(true);
    });

    test('should detect overlap when bookings are identical', () => {
      const booking1 = overlappingBookings[0];
      const booking2 = { ...overlappingBookings[0] };
      
      const hasOverlap = checkOverlap(booking1, booking2);
      
      expect(hasOverlap).toBe(true);
    });

    test('should detect overlap when one booking completely contains another', () => {
      const booking1 = {
        start_datetime: '2024-01-15T09:00:00Z',
        end_datetime: '2024-01-15T12:00:00Z'
      };
      const booking2 = {
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T11:00:00Z'
      };
      
      const hasOverlap = checkOverlap(booking1, booking2);
      
      expect(hasOverlap).toBe(true);
    });
  });

  describe('when bookings do not overlap', () => {
    test('should not detect overlap when bookings are separate', () => {
      const booking1 = overlappingBookings[0];
      const booking2 = overlappingBookings[2];
      
      const hasOverlap = checkOverlap(booking1, booking2);
      
      expect(hasOverlap).toBe(false);
    });

    test('should not detect overlap when first booking ends exactly when second starts', () => {
      const booking1 = {
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };
      const booking2 = {
        start_datetime: '2024-01-15T10:30:00Z',
        end_datetime: '2024-01-15T11:00:00Z'
      };
      
      const hasOverlap = checkOverlap(booking1, booking2);
      
      expect(hasOverlap).toBe(false);
    });

    test('should not detect overlap when bookings are on different days', () => {
      const booking1 = {
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };
      const booking2 = {
        start_datetime: '2024-01-16T10:00:00Z',
        end_datetime: '2024-01-16T10:30:00Z'
      };
      
      const hasOverlap = checkOverlap(booking1, booking2);
      
      expect(hasOverlap).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle zero-duration bookings', () => {
      const booking1 = {
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:00:00Z'
      };
      const booking2 = {
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };
      
      const hasOverlap = checkOverlap(booking1, booking2);
      
      expect(hasOverlap).toBe(false);
    });

    test('should handle invalid dates gracefully', () => {
      const booking1 = {
        start_datetime: 'invalid-date',
        end_datetime: '2024-01-15T10:30:00Z'
      };
      const booking2 = {
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };
      
      // The function should return false for invalid dates rather than throwing
      const hasOverlap = checkOverlap(booking1, booking2);
      expect(hasOverlap).toBe(false);
    });
  });
});
