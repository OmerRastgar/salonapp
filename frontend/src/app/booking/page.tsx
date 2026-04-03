"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { SimpleDirectusService } from "@/lib/directus-simple";
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, startOfMonth, addMonths } from "date-fns";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";

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

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial params from URL
  const vendorSlug = searchParams.get('vendor');
  const employeeId = searchParams.get('employee');
  const serviceId = searchParams.get('service');
  const returnTo = searchParams.get('returnTo');

  // State management
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [services, setServices] = useState<EmployeeService[]>([]);
  const [selectedService, setSelectedService] = useState<EmployeeService | null>(null);
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  
  // Date and time selection
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(returnTo ? [{ label: "Search", href: returnTo }] : []),
    ...(selectedVendor ? [{ label: selectedVendor.name, href: `/vendor/${selectedVendor.slug}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}` }] : []),
    { label: "Book Appointment" },
  ];

  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorSlug && !employeeId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setVendorError(null);
      setSelectedVendor(null);
      setSelectedEmployee(null);
      setSelectedService(null);
      setEmployees([]);
      setServices([]);
      setSchedules([]);
      setExistingBookings([]);
      setSelectedDate(null);
      setSelectedSlot(null);

      let slugToUse = vendorSlug;

      if (!slugToUse && employeeId) {
        const employee = await SimpleDirectusService.getEmployeeWithVendor(employeeId);
        const vendorRelation = (employee?.vendor_id as any);
        if (vendorRelation && typeof vendorRelation === 'object' && vendorRelation.slug) {
          slugToUse = vendorRelation.slug;
        }
      }

      if (!slugToUse) {
        const missingVendorMessage = employeeId
          ? "We couldn't resolve that professional's salon. Please return to the vendor profile before booking."
          : "Please start the booking flow from a vendor profile.";
        setVendorError(missingVendorMessage);
        setLoading(false);
        return;
      }

      try {
        const vendor = await SimpleDirectusService.getVendorBySlug(slugToUse);
        if (vendor) {
          setSelectedVendor(vendor);
        } else {
          setVendorError("Vendor not found. Please return to the vendor page and try again.");
        }
      } catch (error) {
        console.error('Error loading vendor:', error);
        setVendorError("Unable to load the requested vendor. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorSlug, employeeId]);

  // Load employees when vendor is selected
  useEffect(() => {
      if (selectedVendor) {
      loadEmployees(selectedVendor.id);
      if (vendorSlug && !employeeId) {
        const params = new URLSearchParams({ vendor: selectedVendor.slug });
        if (returnTo) {
          params.set("returnTo", returnTo);
        }
        router.push(`/booking?${params.toString()}`);
      }
    }
  }, [selectedVendor, vendorSlug, employeeId, returnTo, router]);

  // Load services when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      loadServices(selectedEmployee.id);
      loadSchedules(selectedEmployee.id);
      if (vendorSlug && employeeId && !serviceId) {
        const params = new URLSearchParams({
          vendor: selectedVendor?.slug || "",
          employee: selectedEmployee.id,
        });
        if (returnTo) {
          params.set("returnTo", returnTo);
        }
        router.push(`/booking?${params.toString()}`);
      }
    }
  }, [selectedEmployee, vendorSlug, employeeId, serviceId, selectedVendor?.slug, returnTo, router]);

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
    const schedule = (schedules as any[]).find(s => s.day_of_week === dayOfWeek && !s.is_closed);
    
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

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const days = [];
    for (let i = 0; i < 28; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    const params = new URLSearchParams({
      vendor: selectedVendor?.slug || "",
      employee: employee.id,
    });
    if (returnTo) {
      params.set("returnTo", returnTo);
    }
    router.push(`/booking?${params.toString()}`);
  };

  const handleServiceSelect = (service: EmployeeService) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedSlot(null);
    const params = new URLSearchParams({
      vendor: selectedVendor?.slug || "",
      employee: selectedEmployee?.id || "",
      service: service.id,
    });
    if (returnTo) {
      params.set("returnTo", returnTo);
    }
    router.push(`/booking?${params.toString()}`);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: Date) => {
    setSelectedSlot(slot);
  };

  const handleContinueToConfirmation = () => {
    if (!selectedVendor || !selectedEmployee || !selectedService || !selectedSlot) {
      return;
    }

    const params = new URLSearchParams({
      vendor: selectedVendor.slug,
      employee: selectedEmployee.id,
      service: selectedService.id,
      slot: selectedSlot.toISOString(),
    });
    if (returnTo) {
      params.set("returnTo", returnTo);
    }

    router.push(`/booking/confirm?${params.toString()}`);
  };

  if (!vendorSlug && !employeeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-600">
            Start the booking flow from a vendor profile so we know which salon you are booking with.
          </p>
          <Button variant="outline" className="mx-auto" onClick={() => router.push("/search")}>
            Browse vendors
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (vendorError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white border border-red-200 rounded-2xl p-10 text-center shadow-sm space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-red-600">{vendorError}</p>
          <Button variant="outline" className="mx-auto" onClick={() => router.push("/search")}>
            Back to vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SiteBreadcrumbs items={breadcrumbs} className="mb-4" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">
            Booking with {selectedVendor?.name || "this vendor"}. Choose a professional, service, date, and time slot.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Selection Steps */}
          <div className="space-y-6">
            {/* Step 1: Professional Selection */}
            {selectedVendor && (
              <Card className="rounded-3xl border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    1. Select Professional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <Button
                          key={employee.id}
                          variant={selectedEmployee?.id === employee.id ? "default" : "outline"}
                          className="h-11 w-full justify-start rounded-2xl border-gray-200"
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
              <Card className="rounded-3xl border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    2. Select Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <Button
                          key={service.id}
                          variant={selectedService?.id === service.id ? "default" : "outline"}
                          className="h-11 w-full justify-start rounded-2xl border-gray-200"
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
            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  3. Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
                    {getCalendarDays().map((date) => {
                      const dayOfWeek = date.getDay();
                      const hasSchedule = schedules.some(s => s.day_of_week === dayOfWeek && !s.is_closed);
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      const startOfToday = new Date();
                      startOfToday.setHours(0, 0, 0, 0);
                      const isPast = date.getTime() < startOfToday.getTime();
                      const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();

                      return (
                        <Button
                          key={date.toISOString()}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          disabled={!hasSchedule || isPast}
                          className={`h-16 rounded-2xl border-gray-200 ${!hasSchedule || isPast ? 'opacity-50' : ''} ${isOutsideMonth ? 'text-gray-400' : ''}`}
                          onClick={() => handleDateSelect(date)}
                        >
                          <div className="text-center">
                            <div className="text-[10px] uppercase tracking-wide">{format(date, 'MMM')}</div>
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
            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  4. Select Time Slot
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
                        className="rounded-2xl border-gray-200"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {format(slot, 'h:mm a')}
                      </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No available slots for this date</p>
                  )}

                  {selectedSlot && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <h4 className="font-medium mb-2">Selected Appointment</h4>
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
                        className="w-full rounded-2xl bg-purple-600 shadow-sm hover:bg-purple-700"
                        onClick={handleContinueToConfirmation}
                      >
                        Continue to Confirm Booking
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

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BookingPageContent />
    </Suspense>
  );
}
