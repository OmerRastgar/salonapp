"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { SimpleDirectusService } from "@/lib/directus-simple";
import { BreadcrumbEntry, SiteBreadcrumbs } from "@/components/site-breadcrumbs";

interface VendorSummary {
  id: string;
  name: string;
  slug: string;
}

interface EmployeeSummary {
  id: string;
  name: string;
}

interface ServiceSummary {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

function BookingConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const vendorSlug = searchParams.get("vendor");
  const employeeId = searchParams.get("employee");
  const serviceId = searchParams.get("service");
  const slotValue = searchParams.get("slot");
  const returnTo = searchParams.get("returnTo");

  const [vendor, setVendor] = useState<VendorSummary | null>(null);
  const [employee, setEmployee] = useState<EmployeeSummary | null>(null);
  const [service, setService] = useState<ServiceSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedSlot = slotValue ? new Date(slotValue) : null;
  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbEntry[] = [{ label: "Home", href: "/" }];

    if (returnTo) {
      items.push({ label: "Search", href: returnTo });
    }

    if (vendorSlug && vendor?.name) {
      items.push({ label: vendor.name, href: `/vendor/${vendorSlug}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}` });
    }

    items.push({ label: "Confirm Booking" });
    return items;
  }, [returnTo, vendor?.name, vendorSlug]);

  useEffect(() => {
    const loadBookingContext = async () => {
      if (!vendorSlug || !employeeId || !serviceId || !selectedSlot || Number.isNaN(selectedSlot.getTime())) {
        setLoading(false);
        return;
      }

      try {
        const vendorData = await SimpleDirectusService.getVendorBySlug(vendorSlug);
        const employeeData = await SimpleDirectusService.getEmployeeWithVendor(employeeId);
        const employeeServices = await SimpleDirectusService.getEmployeeServices(employeeId);
        const serviceData = employeeServices.find((item) => item.id === serviceId) || null;

        if (vendorData) {
          setVendor({
            id: vendorData.id,
            name: vendorData.name,
            slug: vendorData.slug,
          });
        }

        if (employeeData) {
          setEmployee({
            id: employeeData.id,
            name: employeeData.name,
          });
        }

        if (serviceData) {
          setService({
            id: serviceData.id,
            name: serviceData.name,
            price: Number(serviceData.price),
            duration_minutes: serviceData.duration_minutes,
          });
        }
      } catch (error) {
        console.error("Error loading booking confirmation context:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookingContext();
  }, [vendorSlug, employeeId, serviceId, selectedSlot]);

  const handleBooking = async () => {
    if (!vendor || !employee || !service || !selectedSlot || !customerName || !customerEmail) {
      alert("Please fill in all required fields");
      return;
    }

    setIsBooking(true);
    try {
      const endTime = new Date(selectedSlot.getTime() + service.duration_minutes * 60000);

      await SimpleDirectusService.createBooking({
        employee_id: employee.id,
        vendor_id: vendor.id,
        employee_service_id: service.id,
        booker_name: customerName,
        booker_email: customerEmail,
        start_datetime: selectedSlot.toISOString(),
        end_datetime: endTime.toISOString(),
        amount: service.price,
        notes: notes || undefined,
      });

      const successParams = new URLSearchParams({
        vendor: vendor.slug,
        vendorName: vendor.name,
      });

      if (returnTo) {
        successParams.set("returnTo", returnTo);
      }

      router.push(`/booking/success?${successParams.toString()}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      alert(error.message || "Failed to create booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (!vendorSlug || !employeeId || !serviceId || !selectedSlot || Number.isNaN(selectedSlot.getTime())) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Booking Details Missing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Please choose a professional, service, date, and time slot before confirming your booking.
            </p>
            <Button onClick={() => router.push("/search")} variant="outline">
              Back to search
            </Button>
          </CardContent>
        </Card>
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <SiteBreadcrumbs items={breadcrumbs} className="mb-4" />
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="rounded-3xl border-gray-100 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Confirm Booking</CardTitle>
            <p className="text-sm text-gray-600">
              Review your appointment first, then add your details to finish the booking.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-purple-600" />
                  <span><strong>Professional:</strong> {employee?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span><strong>Service:</strong> {service?.name} - Rs.{service?.price}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span><strong>Date:</strong> {format(selectedSlot, "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span><strong>Time:</strong> {format(selectedSlot, "h:mm a")} ({service?.duration_minutes} min)</span>
                </div>
                <p><strong>Vendor:</strong> {vendor?.name}</p>
              </div>
            </div>

            {!showForm ? (
              <div className="flex justify-center">
                <Button
                  className="rounded-2xl bg-purple-600 shadow-sm hover:bg-purple-700"
                  onClick={() => setShowForm(true)}
                >
                  Add Details
                </Button>
              </div>
            ) : (
              <div className="mx-auto max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="Any special requests or notes..."
                  />
                </div>
                <Button
                  className="w-full rounded-2xl bg-purple-600 shadow-sm hover:bg-purple-700"
                  onClick={handleBooking}
                  disabled={isBooking || !customerName || !customerEmail}
                >
                  {isBooking ? "Creating Booking..." : "Confirm Booking"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BookingConfirmContent />
    </Suspense>
  );
}
