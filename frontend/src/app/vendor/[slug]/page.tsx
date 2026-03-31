"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone, Mail, Users, CheckCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useVendor } from "@/hooks/useDirectus";
import { EmployeeCard, Employee } from "@/components/employee-card";
import { ReviewModal } from "@/components/review-modal";
import { SimpleDirectusService, Vendor as VendorType } from "@/lib/directus-simple";
import { BreadcrumbEntry, SiteBreadcrumbs } from "@/components/site-breadcrumbs";

export default function VendorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const returnTo = searchParams.get("returnTo");
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [employeeRefreshKey, setEmployeeRefreshKey] = useState(0);
  const { data: vendor, loading, error } = useVendor(slug, refreshKey);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isVendorReviewOpen, setIsVendorReviewOpen] = useState(false);
  const [isEmployeeReviewOpen, setIsEmployeeReviewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: vendor?.name,
          text: `Check out ${vendor?.name} on Clyp`,
          url: shareUrl
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setReviewSuccess("Vendor link copied to clipboard.");
      setTimeout(() => setReviewSuccess(null), 3000);
    } catch (error) {
      console.error("Error sharing vendor page:", error);
      setReviewSuccess("Unable to share right now. Please try again.");
      setTimeout(() => setReviewSuccess(null), 3000);
    }
  };

  useEffect(() => {
    if (vendor?.id) {
      SimpleDirectusService.getVendorEmployees(vendor.id).then(setEmployees);
    }
  }, [vendor?.id, employeeRefreshKey]);

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbEntry[] = [{ label: "Home", href: "/" }];

    if (returnTo) {
      items.push({ label: "Search", href: returnTo });
    }

    if (vendor?.name) {
      items.push({ label: vendor.name });
    }
    return items;
  }, [returnTo, vendor?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatWorkingHours = () => {
    if (!vendor?.working_hours || vendor.working_hours.length === 0) return null;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return vendor.working_hours
      .sort((a, b) => a.day_of_week - b.day_of_week)
      .map(wh => ({
        day: days[wh.day_of_week],
        hours: wh.is_closed ? 'Closed' : `${wh.open_time.slice(0, 5)} - ${wh.close_time.slice(0, 5)}`,
        isToday: wh.day_of_week === new Date().getDay()
      }));
  };

  const workingHours = formatWorkingHours();
  const bookingBaseHref = `/booking?vendor=${slug}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <SiteBreadcrumbs items={breadcrumbs} />
      </div>

      {/* Vendor Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 bg-gray-200">
          {vendor.cover_image ? (
            <img
              src={SimpleDirectusService.getAssetUrl(vendor.cover_image) || "/placeholder-vendor.jpg"}
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <span className="text-6xl">💇‍♀️</span>
            </div>
          )}
        </div>

        {/* Vendor Info Overlay */}
        <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {vendor.logo ? (
                  <img
                    src={SimpleDirectusService.getAssetUrl(vendor.logo) || "/placeholder-vendor.jpg"}
                    alt={vendor.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">🏢</span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="ml-1 font-semibold">{Number(vendor.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">({vendor.reviews_count} reviews)</span>
                      </div>
                      {vendor.is_verified && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          ✓ Verified
                        </Badge>
                      )}
                      {vendor.women_only && (
                        <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
                          Women Only
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                    >
                      <Share2 className="size-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Categories */}
                {vendor.categories && vendor.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vendor.categories.map((vc: any) => (
                      <Badge key={vc.categories_id?.id || vc.id} variant="secondary">
                        {vc.categories_id?.name || 'Category'}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="size-4 mt-1 flex-shrink-0" />
                  <span>{vendor.address}, {vendor.area}, {vendor.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">
                {vendor.description || 'No description available.'}
              </p>
            </section>

            {/* Services */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Services</h2>
              {(() => {
                const allServices = employees.flatMap(e => 
                  ((e as any).services || []).map((s: any) => ({ ...s, employeeId: e.id, employeeName: e.name }))
                );
                
                if (allServices.length > 0) {
                  return (
                    <div className="space-y-4">
                      {allServices.map((service: any) => (
                        <Card key={service.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                                {service.description && (
                                  <p className="text-gray-600 mb-2">{service.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    <span>{service.duration_minutes} minutes</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="size-4" />
                                    <span>with {service.employeeName}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-purple-600">
                                  Rs.{Number(service.price).toLocaleString()}
                                </div>
                                <Button 
                                  className="mt-2 w-full bg-purple-600 hover:bg-purple-700" 
                                  size="sm"
                                  onClick={() => {
                                    const params = new URLSearchParams({
                                      vendor: vendor.slug,
                                      employee: service.employeeId,
                                      service: service.id,
                                    });
                                    if (returnTo) {
                                      params.set("returnTo", returnTo);
                                    }
                                    router.push(`/booking?${params.toString()}`);
                                  }}
                                >
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                }
                
                return (
                  <div className="text-center py-10 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No services available for this vendor.</p>
                  </div>
                );
              })()}
            </section>

            {/* Employees Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Our Professionals</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <EmployeeCard
                      key={`${employee.id}-${employeeRefreshKey}`}
                      employee={employee}
                      vendorSlug={slug}
                      bookingHref={bookingBaseHref}
                      onRate={(emp) => {
                        setSelectedEmployee(emp);
                        setIsEmployeeReviewOpen(true);
                      }}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full">No professionals listed yet.</p>
                )}
              </div>
            </section>

            {/* Location Map */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Location</h2>
              <Card 
                className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group"
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${vendor.latitude},${vendor.longitude}`;
                  window.open(url, '_blank');
                }}
              >
                <div className="h-64 bg-gray-100 relative">
                  {/* OpenStreetMap Embed (No API Key Required) */}
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(vendor.longitude || 0) - 0.005},${Number(vendor.latitude || 0) - 0.005},${Number(vendor.longitude || 0) + 0.005},${Number(vendor.latitude || 0) + 0.005}&layer=mapnik&marker=${vendor.latitude},${vendor.longitude}`}
                    className="pointer-events-none"
                  ></iframe>
                  {/* Overlay to catch clicks and open full Google Maps for navigation */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-medium transform group-hover:scale-105 transition-transform">
                      <MapPin className="size-4 text-purple-600" />
                      View on Google Maps
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-gray-400" />
                      <span className="text-sm font-medium">{vendor.address}, {vendor.area}</span>
                    </div>
                    <Button variant="link" className="text-purple-600 p-0 h-auto">Get Directions</Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <Button 
                  onClick={() => setIsVendorReviewOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Write a Review
                </Button>
              </div>
              {vendor.reviews && vendor.reviews.length > 0 ? (
                <div className="space-y-4">
                  {vendor.reviews
                    .filter(review => review.status === 'published' || review.status === 'active')
                    .slice(0, 5)
                    .map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{review.customer_name}</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-gray-400" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-gray-400" />
                    <span>{vendor.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Working Hours</h3>
                {workingHours ? (
                  <div className="space-y-2">
                    {workingHours.map((wh, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center ${
                          wh.isToday ? 'font-semibold text-purple-600' : ''
                        }`}
                      >
                        <span>{wh.day}</span>
                        <span>{wh.hours}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Working hours not available.</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      const params = new URLSearchParams({ vendor: vendor.slug });
                      if (returnTo) {
                        params.set("returnTo", returnTo);
                      }
                      router.push(`/booking?${params.toString()}`);
                    }}
                  >
                    Book Appointment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = `tel:${vendor.phone}`}
                  >
                    <Phone className="size-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${vendor.latitude},${vendor.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <MapPin className="size-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Modals */}
      <ReviewModal
        isOpen={isVendorReviewOpen}
        onClose={() => setIsVendorReviewOpen(false)}
        title={`Review ${vendor.name}`}
        subtitle="Share your experience with other customers"
        onSubmit={async (data) => {
          try {
            await SimpleDirectusService.createVendorReview({
              vendor_id: vendor.id,
              customer_name: data.name,
              rating: data.rating,
              comment: data.comment,
              status: 'published'
            });
            setReviewSuccess('Vendor review submitted successfully!');
            setIsVendorReviewOpen(false);
            // Refresh vendor data to show new review
            setRefreshKey(prev => prev + 1);
            // Clear success message after 3 seconds
            setTimeout(() => setReviewSuccess(null), 3000);
          } catch (error) {
            console.error('Error submitting vendor review:', error);
            setReviewSuccess('Failed to submit review. Please try again.');
          }
        }}
      />

      <ReviewModal
        isOpen={isEmployeeReviewOpen}
        onClose={() => setIsEmployeeReviewOpen(false)}
        title={`Review ${selectedEmployee?.name}`}
        subtitle={`Rate the service provided by ${selectedEmployee?.name}`}
        onSubmit={async (data) => {
          if (!selectedEmployee) return;
          try {
            await SimpleDirectusService.createEmployeeReview({
              employee_id: selectedEmployee.id,
              customer_name: data.name,
              rating: data.rating,
              comment: data.comment,
              status: 'published'
            });
            setReviewSuccess('Employee review submitted successfully!');
            setIsEmployeeReviewOpen(false);
            // Refresh employees data to update ratings
            if (vendor?.id) {
              // Add small delay to ensure database is updated
              setTimeout(() => {
                setEmployeeRefreshKey(prev => prev + 1);
              }, 500);
            }
            // Clear success message after 3 seconds
            setTimeout(() => setReviewSuccess(null), 3000);
          } catch (error) {
            console.error('Error submitting employee review:', error);
            setReviewSuccess('Failed to submit review. Please try again.');
          }
        }}
      />

      {/* Success Notification */}
      {reviewSuccess && (
        <div className="fixed top-4 right-4 z-[110] flex items-center gap-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle className="size-5" />
          <span className="font-medium">{reviewSuccess}</span>
        </div>
      )}
    </div>
  );
}
