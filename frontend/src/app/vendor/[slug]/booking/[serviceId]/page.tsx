"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useVendor } from "@/hooks/useDirectus";
import { Vendor, Service } from "@/lib/directus-simple";

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  specialization: string[];
  rating: number;
  bio?: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const serviceId = params.serviceId as string;
  
  const { data: vendor, loading, error } = useVendor(slug);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [step, setStep] = useState(1);

  // Mock employees data - in real app, this would come from Directus
  const mockEmployees: Employee[] = [
    {
      id: "emp-001",
      name: "Sarah Ahmed",
      specialization: ["Hair Styling", "Coloring"],
      rating: 4.8,
      bio: "5+ years of experience in modern hair styling"
    },
    {
      id: "emp-002", 
      name: "Ayesha Khan",
      specialization: ["Makeup", "Bridal"],
      rating: 4.9,
      bio: "Specialized in bridal and party makeup"
    },
    {
      id: "emp-003",
      name: "Fatima Sheikh", 
      specialization: ["Nail Art", "Manicure"],
      rating: 4.7,
      bio: "Creative nail artist with 3+ years experience"
    }
  ];

  const service = vendor?.services?.find(s => s.id === serviceId);

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"
  ];

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleBooking = () => {
    // Here you would integrate with Cal.com or your booking system
    alert(`Booking confirmed!\nVendor: ${vendor?.name}\nService: ${service?.name}\nDate: ${selectedDate}\nTime: ${selectedTime}\nEmployee: ${selectedEmployee}`);
    router.push(`/vendor/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !vendor || !service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The service you're trying to book doesn't exist.</p>
          <Link href={`/vendor/${slug}`}>
            <Button>Back to Vendor</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Book Appointment</h1>
                <p className="text-sm text-gray-600">{vendor.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1 rounded-full ${
                    s <= step ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Service Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="size-4" />
                    <span>{service.duration} minutes</span>
                  </div>
                  {service.is_popular && (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  Rs.{service.price}
                </div>
                {service.original_price && service.original_price > service.price && (
                  <div className="text-sm text-gray-500 line-through">
                    Rs.{service.original_price}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Date & Time */}
          <div className="space-y-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {generateDateOptions().map((date) => (
                    <button
                      key={formatDate(date)}
                      onClick={() => {
                        setSelectedDate(formatDate(date));
                        setStep(1);
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        selectedDate === formatDate(date)
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{formatDisplayDate(date)}</div>
                      {formatDate(date) === formatDate(new Date()) && (
                        <div className="text-xs text-purple-600">Today</div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setStep(2);
                        }}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          selectedTime === time
                            ? 'border-purple-600 bg-purple-50 text-purple-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Please select a date first
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Employee Selection */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Select Professional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedEmployee === employee.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="size-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{employee.name}</h4>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-yellow-500">★</span>
                              <span>{employee.rating}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {employee.specialization.map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                          {employee.bio && (
                            <p className="text-sm text-gray-600">{employee.bio}</p>
                          )}
                        </div>
                        {selectedEmployee === employee.id && (
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <Check className="size-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Summary & Confirmation */}
        {selectedDate && selectedTime && selectedEmployee && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Professional:</span>
                  <span className="font-medium">
                    {mockEmployees.find(e => e.id === selectedEmployee)?.name}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-purple-600">Rs.{service.price}</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleBooking}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                Confirm Booking
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
