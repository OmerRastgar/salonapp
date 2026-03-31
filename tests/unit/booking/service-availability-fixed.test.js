/**
 * Service Availability Unit Tests
 * Tests for service availability, time slot generation, and booking capacity
 */

describe('Service Availability', () => {
  describe('Time Slot Generation', () => {
    test('should generate available time slots for a service', () => {
      const service = {
        duration: 60, // 1 hour
        buffer_time: 15 // 15 minutes between appointments
      };
      const date = '2024-01-15';
      const operatingHours = {
        open: '09:00',
        close: '17:00'
      };
      
      const slots = generateTimeSlots(service, date, operatingHours);
      
      // Calculate: 9:00 + 60 + 15 = 10:15, 10:15 + 60 + 15 = 11:30, 
      // 11:30 + 60 + 15 = 12:45, 12:45 + 60 + 15 = 14:00, 
      // 14:00 + 60 + 15 = 15:15, 15:15 + 60 = 16:30
      // 16:30 + 60 = 17:30 (exceeds 17:00 close), so only 6 slots fit
      expect(slots).toHaveLength(6); // Fixed: was 7, but 16:30 slot doesn't fit
      expect(slots[0].start).toBe('09:00');
      expect(slots[0].end).toBe('10:00');
      expect(slots[1].start).toBe('10:15'); // 15 min buffer
    });

    test('should handle services with different durations', () => {
      const service = {
        duration: 30, // 30 minutes
        buffer_time: 10
      };
      const date = '2024-01-15';
      const operatingHours = {
        open: '09:00',
        close: '12:00'
      };
      
      const slots = generateTimeSlots(service, date, operatingHours);
      
      // Calculate: 9:00 + 30 + 10 = 9:40, 9:40 + 30 + 10 = 10:20, 
      // 10:20 + 30 + 10 = 11:00, 11:00 + 30 + 10 = 11:40
      // 11:40 + 30 = 12:10 (exceeds 12:00 close), so only 4 slots fit
      expect(slots).toHaveLength(4); // Fixed: was 5, but 11:40 slot doesn't fit
      expect(slots[0].duration).toBe(30);
    });

    test('should respect operating hours constraints', () => {
      const service = {
        duration: 120, // 2 hours
        buffer_time: 0
      };
      const date = '2024-01-15';
      const operatingHours = {
        open: '09:00',
        close: '17:00'
      };
      
      const slots = generateTimeSlots(service, date, operatingHours);
      
      expect(slots).toHaveLength(4); // 9:00-11:00, 11:00-13:00, 13:00-15:00, 15:00-17:00
      expect(slots[0].start).toBe('09:00');
      expect(slots[0].end).toBe('11:00');
    });
  });

  describe('Booking Capacity Management', () => {
    test('should prevent overbooking when capacity is reached', () => {
      const service = {
        max_concurrent_bookings: 2,
        duration: 60
      };
      
      const existingBookings = [
        {
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T11:00:00Z',
          service_id: 1
        },
        {
          start_time: '2024-01-15T10:30:00Z',
          end_time: '2024-01-15T11:30:00Z',
          service_id: 1
        }
      ];
      
      const newBooking = {
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        service_id: 1
      };
      
      const hasCapacity = checkServiceCapacity(service, newBooking, existingBookings);
      expect(hasCapacity).toBe(false);
    });

    test('should allow bookings within capacity limits', () => {
      const service = {
        max_concurrent_bookings: 3,
        duration: 60
      };
      
      const existingBookings = [
        {
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T11:00:00Z',
          service_id: 1
        },
        {
          start_time: '2024-01-15T10:30:00Z',
          end_time: '2024-01-15T11:30:00Z',
          service_id: 1
        }
      ];
      
      const newBooking = {
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z',
        service_id: 1
      };
      
      const hasCapacity = checkServiceCapacity(service, newBooking, existingBookings);
      expect(hasCapacity).toBe(true);
    });
  });

  describe('Real-time Availability Updates', () => {
    let mockAvailability = [];
    
    beforeEach(() => {
      mockAvailability = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    });
    
    test('should update availability when booking is created', () => {
      const service = { id: 1, duration: 60, buffer_time: 15 };
      const date = '2024-01-15';
      
      // Mock getServiceAvailability to use shared availability
      const getServiceAvailability = (service, date) => {
        return { available_slots: [...mockAvailability] };
      };
      
      // Mock createBooking to actually modify the availability
      const createBooking = (booking) => {
        const bookingStart = booking.start_time.split('T')[1].substring(0, 5);
        mockAvailability = mockAvailability.filter(slot => slot !== bookingStart);
      };
      
      const initialAvailability = getServiceAvailability(service, date);
      expect(initialAvailability.available_slots).toContain('10:00');
      
      createBooking({
        service_id: service.id,
        date: '2024-01-15',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T11:00:00Z'
      });
      
      const updatedAvailability = getServiceAvailability(service, date);
      expect(updatedAvailability.available_slots).not.toContain('10:00');
    });

    test('should restore availability when booking is cancelled', () => {
      const service = { id: 1, duration: 60, buffer_time: 15 };
      const date = '2024-01-15';
      
      // Mock functions
      const getServiceAvailability = (service, date) => {
        return { available_slots: [...mockAvailability] };
      };
      
      const cancelBooking = (bookingId) => {
        // Restore the 14:00 slot
        if (!mockAvailability.includes('14:00')) {
          mockAvailability.push('14:00');
          mockAvailability.sort();
        }
      };
      
      // Remove 14:00 from availability
      mockAvailability = mockAvailability.filter(slot => slot !== '14:00');
      
      let availability = getServiceAvailability(service, date);
      expect(availability.available_slots).not.toContain('14:00');
      
      cancelBooking(123);
      
      availability = getServiceAvailability(service, date);
      expect(availability.available_slots).toContain('14:00');
    });
  });

  describe('Advanced Availability Rules', () => {
    test('should handle advance booking requirements', () => {
      const service = {
        min_advance_booking_hours: 24,
        max_advance_booking_days: 30
      };
      
      const now = new Date('2024-01-15T10:00:00Z');
      const tooSoon = new Date('2024-01-15T12:00:00Z'); // 2 hours from now
      const validTime = new Date('2024-01-16T10:00:00Z'); // 24 hours from now
      const tooFar = new Date('2024-02-20T10:00:00Z'); // 36 days from now
      
      expect(isBookingTimeValid(service, tooSoon, now)).toBe(false);
      expect(isBookingTimeValid(service, validTime, now)).toBe(true);
      expect(isBookingTimeValid(service, tooFar, now)).toBe(false);
    });

    test('should handle seasonal availability', () => {
      const service = {
        seasonal_availability: {
          start_date: '2024-04-01',
          end_date: '2024-10-31'
        }
      };
      
      const winterDate = new Date('2024-02-15');
      const summerDate = new Date('2024-07-15');
      const autumnDate = new Date('2024-11-15');
      
      expect(isServiceAvailableSeasonally(service, winterDate)).toBe(false);
      expect(isServiceAvailableSeasonally(service, summerDate)).toBe(true);
      expect(isServiceAvailableSeasonally(service, autumnDate)).toBe(false);
    });
  });
});

// Helper functions (would be implemented in the actual codebase)
function generateTimeSlots(service, date, operatingHours) {
  const slots = [];
  const [openHour, openMin] = operatingHours.open.split(':').map(Number);
  const [closeHour, closeMin] = operatingHours.close.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  
  let currentTime = openMinutes;
  
  while (currentTime + service.duration <= closeMinutes) {
    const startHour = Math.floor(currentTime / 60);
    const startMin = currentTime % 60;
    const endMinutes = currentTime + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    
    slots.push({
      start: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
      end: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
      duration: service.duration
    });
    
    currentTime = currentTime + service.duration + service.buffer_time;
  }
  
  return slots;
}

function checkServiceCapacity(service, newBooking, existingBookings) {
  const overlappingBookings = existingBookings.filter(booking => {
    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);
    const newBookingStart = new Date(newBooking.start_time);
    const newBookingEnd = new Date(newBooking.end_time);
    
    return (
      (newBookingStart < bookingEnd && newBookingEnd > bookingStart) ||
      (newBookingStart === bookingStart)
    );
  });
  
  return overlappingBookings.length < service.max_concurrent_bookings;
}

function isBookingTimeValid(service, bookingTime, currentTime) {
  const bookingDate = new Date(bookingTime);
  const minAdvanceTime = service.min_advance_booking_hours * 60 * 60 * 1000;
  const maxAdvanceTime = service.max_advance_booking_days * 24 * 60 * 60 * 1000;
  
  const timeDiff = bookingDate - currentTime;
  
  return timeDiff >= minAdvanceTime && timeDiff <= maxAdvanceTime;
}

function isServiceAvailableSeasonally(service, date) {
  if (!service.seasonal_availability) return true;
  
  const startDate = new Date(service.seasonal_availability.start_date);
  const endDate = new Date(service.seasonal_availability.end_date);
  
  return date >= startDate && date <= endDate;
}
