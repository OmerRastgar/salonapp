"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import { SimpleDirectusService } from "@/lib/directus-simple";
import { format, addDays, startOfWeek, addWeeks, isSameDay, setHours, setMinutes } from "date-fns";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  area: string;
  logo?: string;
  cover_image?: string;
}

interface Employee {
  id: string;
  vendor_id: string;
  name: string;
  email?: string;
  photo?: string;
  bio?: string;
  timezone?: string;
  status: string;
}

interface EmployeeService {
  id: string;
  employee_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
  is_active: boolean;
}

interface EmployeeSchedule {
  id: string;
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_closed: boolean;
}

interface Booking {
  id: string;
  employee_id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial params from URL
  const vendorSlug = searchParams.get('vendor');
  const employeeId = searchParams.get('employee');
  const serviceId = searchParams.get('service');

  // State management
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [services, setServices] = useState<EmployeeService[]>([]);
  const [selectedService, setSelectedService] = useState<EmployeeService | null>(null);
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  
  // Date and time selection
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  
  // Booking form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadVendors();
  }, []);

  // Load employees when vendor is selected
  useEffect(() => {
    if (selectedVendor) {
      loadEmployees(selectedVendor.id);
      if (vendorSlug && !employeeId) {
        router.push(`/booking?vendor=${selectedVendor.slug}`);
      }
    }
  }, [selectedVendor]);

  // Load services when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      loadServices(selectedEmployee.id);
      loadSchedules(selectedEmployee.id);
      if (vendorSlug && employeeId && !serviceId) {
        router.push(`/booking?vendor=${selectedVendor?.slug}&employee=${selectedEmployee.id}`);
      }
    }
  }, [selectedEmployee]);

  // Load bookings when employee and date are selected
  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      loadBookings(selectedEmployee.id, selectedDate);
    }
  }, [selectedEmployee, selectedDate]);

  // Generate available slots when we have schedules, service, and existing bookings
  useEffect(() => {
    if (selectedEmployee && selectedService && selectedDate && schedules.length > 0) {
      generateAvailableSlots();
    }
  }, [selectedEmployee, selectedService, selectedDate, schedules, existingBookings]);

  // Initialize from URL params
  useEffect(() => {
    if (vendors.length > 0 && vendorSlug) {
      const vendor = vendors.find(v => v.slug === vendorSlug);
      if (vendor) {
        setSelectedVendor(vendor);
      }
    }
  }, [vendors, vendorSlug]);

  useEffect(() => {
    if (employees.length > 0 && employeeId) {
      const employee = employees.find(e => e.id === employeeId);
      if (employee) {
        setSelectedEmployee(employee);
      }
    }
  }, [employees, employeeId]);

  useEffect(() => {
    if (services.length > 0 && serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [services, serviceId]);

  const loadVendors = async () => {
    try {
      const result = await SimpleDirectusService.getVendors();
      // getVendors returns { data: Vendor[], meta: null }
      setVendors(Array.isArray(result) ? result : (result as any).data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async (vendorId: string) => {
    try {
      const data = await SimpleDirectusService.getEmployees(vendorId);
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadServices = async (employeeId: string) => {
    try {
      const data = await SimpleDirectusService.getEmployeeServices(employeeId);
      setServices(data.filter(s => s.is_active));
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadSchedules = async (employeeId: string) => {
    try {
      const data = await SimpleDirectusService.getEmployeeSchedules(employeeId);
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadBookings = async (employeeId: string, date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const data = await SimpleDirectusService.getBookings(employeeId, startOfDay, endOfDay);
      setExistingBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const generateAvailableSlots = () => {
    if (!selectedDate || !selectedService || schedules.length === 0) return;

    const dayOfWeek = selectedDate.getDay();
    const schedule = schedules.find(s => s.day_of_week === dayOfWeek && !s.is_closed);
    
    if (!schedule) {
      setAvailableSlots([]);
      return;
    }

    // Parse schedule times
    const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

    // Generate slots
    const slots: Date[] = [];
    let currentTime = setMinutes(setHours(selectedDate, startHour), startMinute);
    const endTime = setMinutes(setHours(selectedDate, endHour), endMinute);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + selectedService.duration_minutes * 60000);
      
      if (slotEnd <= endTime) {
        // Check if slot is available (no overlap with existing bookings)
        const isAvailable = !existingBookings.some(booking => {
          const bookingStart = new Date(booking.start_datetime);
          const bookingEnd = new Date(booking.end_datetime);
          return (
            (currentTime < bookingEnd && slotEnd > bookingStart) ||
            (currentTime >= bookingStart && currentTime < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd)
          );
        });

        if (isAvailable) {
          slots.push(new Date(currentTime));
        }
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
    }

    setAvailableSlots(slots);
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday start
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSelectedEmployee(null);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    router.push(`/booking?vendor=${vendor.slug}`);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    router.push(`/booking?vendor=${selectedVendor?.slug}&employee=${employee.id}`);
  };

  const handleServiceSelect = (service: EmployeeService) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedSlot(null);
    router.push(`/booking?vendor=${selectedVendor?.slug}&employee=${selectedEmployee?.id}&service=${service.id}`);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: Date) => {
    setSelectedSlot(slot);
  };

  const handleBooking = async () => {
    if (!selectedVendor || !selectedEmployee || !selectedService || !selectedSlot || !customerName || !customerEmail) {
      alert('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    try {
      const endTime = new Date(selectedSlot.getTime() + selectedService.duration_minutes * 60000);
      
      await SimpleDirectusService.createBooking({
        employee_id: selectedEmployee.id,
        vendor_id: selectedVendor.id,
        employee_service_id: selectedService.id,
        booker_name: customerName,
        booker_email: customerEmail,
        start_datetime: selectedSlot.toISOString(),
        end_datetime: endTime.toISOString(),
        notes: notes || undefined
      });

      alert('Booking confirmed! You will receive a confirmation email shortly.');
      router.push('/');
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Select a vendor, professional, service, and time slot</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Selection Steps */}
          <div className="space-y-6">
            {/* Step 1: Vendor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  1. Select Vendor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vendors.map((vendor) => (
                    <Button
                      key={vendor.id}
                      variant={selectedVendor?.id === vendor.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleVendorSelect(vendor)}
                    >
                      {vendor.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Employee Selection */}
            {selectedVendor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    2. Select Professional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <Button
                          key={employee.id}
                          variant={selectedEmployee?.id === employee.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          {employee.name}
                        </Button>
                      ))
                    ) : (
                      <p className="text-gray-500">No professionals available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Service Selection */}
            {selectedEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    3. Select Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <Button
                          key={service.id}
                          variant={selectedService?.id === service.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleServiceSelect(service)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="text-sm">Rs.{service.price}</span>
                          </div>
                        </Button>
                      ))
                    ) : (
                      <p className="text-gray-500">No services available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Middle Column - Date Selection */}
          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  4. Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium">
                      {format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'MMM d')} - {format(addDays(startOfWeek(currentWeek, { weekStartsOn: 0 }), 6), 'MMM d, yyyy')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    {getWeekDays().map((date) => {
                      const dayOfWeek = date.getDay();
                      const hasSchedule = schedules.some(s => s.day_of_week === dayOfWeek && !s.is_closed);
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      const isPast = date < new Date().setHours(0, 0, 0, 0);

                      return (
                        <Button
                          key={date.toISOString()}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          disabled={!hasSchedule || isPast}
                          className={`h-12 ${!hasSchedule || isPast ? 'opacity-50' : ''}`}
                          onClick={() => handleDateSelect(date)}
                        >
                          <div className="text-center">
                            <div className="text-lg">{format(date, 'd')}</div>
                            {hasSchedule && !isPast && (
                              <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-1"></div>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Right Column - Time Slots & Booking */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  5. Select Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedSlot && slot.getTime() === selectedSlot.getTime() ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {format(slot, 'h:mm a')}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No available slots for this date</p>
                  )}

                  {/* Booking Form */}
                  {selectedSlot && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium">Your Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name *</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email *</label>
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={3}
                            placeholder="Any special requests or notes..."
                          />
                        </div>
                      </div>

                      {/* Booking Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Booking Summary</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Vendor:</strong> {selectedVendor?.name}</p>
                          <p><strong>Professional:</strong> {selectedEmployee?.name}</p>
                          <p><strong>Service:</strong> {selectedService?.name}</p>
                          <p><strong>Duration:</strong> {selectedService?.duration_minutes} minutes</p>
                          <p><strong>Date:</strong> {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</p>
                          <p><strong>Time:</strong> {selectedSlot && format(selectedSlot, 'h:mm a')}</p>
                          <p><strong>Price:</strong> Rs.{selectedService?.price}</p>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={handleBooking}
                        disabled={isBooking || !customerName || !customerEmail}
                      >
                        {isBooking ? 'Creating Booking...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
