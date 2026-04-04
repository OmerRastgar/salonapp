"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useVendor } from "@/hooks/useDirectus";
import { SimpleDirectusService, Vendor, Employee } from "@/lib/directus-simple";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { ReviewModal } from "@/components/review-modal";
import { CheckCircle, MapPin, Map } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import VenueHero from "@/components/venue/VenueHero";
import VenueGallery from "@/components/venue/VenueGallery";
import VenueServices from "@/components/venue/VenueServices";
import VenueTeam from "@/components/venue/VenueTeam";
import VenueReviews from "@/components/venue/VenueReviews";
import VenueBookingSidebar from "@/components/venue/VenueBookingSidebar";
import { SearchResultsMap } from "@/components/search-results-map";

export default function VendorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const returnTo = searchParams.get("returnTo");
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [employeeRefreshKey, setEmployeeRefreshKey] = useState(0);
  const { data: vendor, loading, error } = useVendor(slug, refreshKey);
  const [employees, setEmployees] = useState<(Employee & { services: any[] })[]>([]);
  
  useEffect(() => {
    if (vendor) {
      console.log(`[VendorPage] RAW VENDOR DATA:`, JSON.stringify(vendor, (key, value) => key === 'description' ? '...' : value, 2));
    }
  }, [vendor]);

  useEffect(() => {
    if (employees.length > 0) {
      console.log(`[VendorPage] RAW EMPLOYEES DATA:`, JSON.stringify(employees, null, 2));
    }
  }, [employees]);

  useEffect(() => {
    if (vendor?.id) {
      SimpleDirectusService.getVendorEmployees(vendor.id).then(setEmployees);
    }
  }, [vendor?.id, employeeRefreshKey]);

  const [isVendorReviewOpen, setIsVendorReviewOpen] = useState(false);
  const [isEmployeeReviewOpen, setIsEmployeeReviewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (vendor?.id) {
      SimpleDirectusService.getVendorEmployees(vendor.id).then(setEmployees);
    }
  }, [vendor?.id, employeeRefreshKey]);

  const breadcrumbs = useMemo(() => {
    const items: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];
    if (returnTo) items.push({ label: "Search", href: returnTo });
    if (vendor?.name) items.push({ label: vendor.name });
    return items as any;
  }, [returnTo, vendor?.name]);

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
    } catch (ShareError) {
      console.error("Error sharing vendor page:", ShareError);
    }
  };

  const serviceCategories = useMemo(() => {
    if (!vendor?.services) return [];
    return [{
       name: 'Services',
       services: vendor.services
    }];
  }, [vendor?.services]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-muted/20 rounded-3xl border border-dashed border-border/50">
          <h1 className="text-2xl font-bold mb-4 font-display">Vendor Not Found</h1>
          <p className="text-muted-foreground mb-6">The vendor you&apos;re looking for doesn&apos;t exist.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Search Header / Breadcrumbs */}
      <div className="hidden md:block bg-white/50 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <SiteBreadcrumbs items={breadcrumbs} />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Hero & Identity */}
        <VenueHero venue={vendor} onShare={handleShare} />
        
        {/* Gallery Bento */}
        <VenueGallery 
          images={[
            vendor.cover_image 
              ? SimpleDirectusService.getAssetUrl(vendor.cover_image)! 
              : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200'
          ]} 
        />

        {/* Main Content + Sidebar Split */}
        <div className="mt-8 md:mt-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
          {/* Left Side: Services, About, Team, Map, Reviews */}
          <div className="flex-1 min-w-0 space-y-12 md:space-y-20">
            <div id="services-section">
                <VenueServices 
                    categories={serviceCategories} 
                    onBook={(s) => {
                        const q = new URLSearchParams({ vendor: vendor.slug, service: s.id });
                        if (returnTo) q.set("returnTo", returnTo);
                        router.push(`/booking?${q.toString()}`);
                    }}
                />
            </div>

            <VenueAbout sectionAbout={vendor.description} />
            
            <VenueTeam 
              team={employees} 
              onRate={(emp) => {
                setSelectedEmployee(emp);
                setIsEmployeeReviewOpen(true);
              }}
            />

            <VenueMap venue={vendor} />

            <VenueReviews 
                rating={vendor.rating} 
                total={vendor.reviews_count} 
                reviews={vendor.reviews || []}
                onWriteReview={() => setIsVendorReviewOpen(true)}
            />
          </div>

          {/* Right Side: Sticky Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-24">
            <VenueBookingSidebar venue={vendor} />
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border/40 p-4 pb-10 flex justify-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
         <button 
            className="w-full max-w-sm py-4 bg-primary text-primary-foreground rounded-full font-black text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all"
            onClick={() => {
                const el = document.getElementById('services-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
         >
            Book Appointment
         </button>
      </div>

      {/* Modals */}
      <ReviewModal
        isOpen={isVendorReviewOpen}
        onClose={() => setIsVendorReviewOpen(false)}
        title={`Review ${vendor.name}`}
        subtitle="Share your experience with other customers"
        onSubmit={async (data) => {
          try {
            console.log(`[SimpleDirectusService] Final processed vendor object for "${vendor.name}":`, JSON.stringify({ 
              id: vendor.id, 
              services_count: vendor.services?.length || 0,
              employees_count: employees.length 
            }, null, 2));
            await SimpleDirectusService.createVendorReview({
              vendor_id: vendor.id,
              customer_name: data.name,
              rating: data.rating,
              comment: data.comment
            });
            setReviewSuccess('Vendor review submitted successfully!');
            setIsVendorReviewOpen(false);
            setRefreshKey(prev => prev + 1);
            setTimeout(() => setReviewSuccess(null), 3000);
          } catch (e) {
            console.error('Error submitting vendor review:', e);
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
            setTimeout(() => setEmployeeRefreshKey(prev => prev + 1), 500);
            setTimeout(() => setReviewSuccess(null), 3000);
          } catch (e) {
            console.error('Error submitting employee review:', e);
          }
        }}
      />

      {/* Success Notification */}
      <AnimatePresence>
        {reviewSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 right-8 z-[200] flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-primary/20"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle className="size-5" />
            </div>
            <span className="font-bold text-foreground">{reviewSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for About section
function VenueAbout({ sectionAbout }: { sectionAbout?: string }) {
    if (!sectionAbout) return null;
    return (
        <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">About</h2>
            <div className="bg-purple-50/30 p-8 rounded-3xl border border-purple-100/50 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
                <p className="text-lg text-muted-foreground leading-relaxed italic relative z-10">
                    {sectionAbout}
                </p>
            </div>
        </section>
    );
}

// Sub-component for Map section
function VenueMap({ venue }: { venue: Vendor }) {
    const lat = Number(venue.latitude);
    const lng = Number(venue.longitude);
    
    // Ensure accurate geographic detection
    const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    if (!hasCoords) return null;

    return (
        <section className="mt-16 bg-white rounded-3xl border border-border/40 overflow-hidden shadow-sm relative z-0">
            <div className="p-8 border-b border-border/40">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">Location</h2>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <MapPin className="size-4" />
                            <span className="text-sm">{venue.address}, {venue.area}, {venue.city}</span>
                        </div>
                    </div>
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                    >
                         Get Directions
                    </a>
                </div>
            </div>
            <div className="h-[400px] w-full bg-muted/20 relative overflow-hidden">
                <SearchResultsMap vendors={[venue]} fullBleed={true} />
            </div>
        </section>
    );
}
