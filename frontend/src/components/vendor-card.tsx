import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SimpleDirectusService, Vendor } from "@/lib/directus-simple";

interface VendorCardProps {
  vendor: Vendor;
  showCategory?: boolean;
}

export function VendorCard({ vendor, showCategory = true }: VendorCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewServices = (vendor.services || []).slice(0, 3);
  const returnTo = typeof window !== "undefined"
    ? `${window.location.pathname}${window.location.search}`
    : `/search${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const vendorHref = `/vendor/${vendor.slug}?returnTo=${encodeURIComponent(returnTo)}`;
  const bookingHref = `/booking?vendor=${vendor.slug}&returnTo=${encodeURIComponent(returnTo)}`;

  const formatTime = (value?: string) => {
    if (!value) return "";
    const [hours = "0", minutes = "00"] = value.split(":");
    const hourNumber = Number(hours);
    const suffix = hourNumber >= 12 ? "PM" : "AM";
    const twelveHour = hourNumber % 12 || 12;
    return `${twelveHour}:${minutes} ${suffix}`;
  };

  const formatWorkingHours = () => {
    if (!vendor.working_hours || vendor.working_hours.length === 0) return "Hours not available";
    
    const today = new Date().getDay();
    const todayHours = vendor.working_hours.find(wh => wh.day_of_week === today);
    
    if (!todayHours || todayHours.is_closed) return "Closed today";
    
    return `${formatTime(todayHours.open_time)} - ${formatTime(todayHours.close_time)}`;
  };

  const getCategoryName = () => {
    if (vendor.categories && vendor.categories.length > 0) {
      const cat = vendor.categories[0] as any;
      // Handle both direct category objects and junction objects
      return cat.name || cat.categories_id?.name || "Salon";
    }
    return "Salon";
  };

  return (
    <Card className="group h-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Cover Image */}
      <div className="relative h-44 bg-gray-200 sm:h-48">
        {vendor.cover_image ? (
          <img
            src={SimpleDirectusService.getAssetUrl(vendor.cover_image) || '/placeholder-vendor.jpg'}
            alt={vendor.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-4xl">💇‍♀️</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {vendor.is_featured && (
          <Badge className="absolute top-3 left-3 rounded-full bg-yellow-500 px-3 py-1 hover:bg-yellow-600">
            Featured
          </Badge>
        )}
        
        {/* Women Only Badge */}
        {vendor.women_only && (
          <Badge className="absolute top-3 right-3 rounded-full bg-pink-500 px-3 py-1 hover:bg-pink-600">
            Women Only
          </Badge>
        )}
        
        {/* Verified Badge */}
        {vendor.is_verified && (
          <div className="absolute bottom-3 right-3 rounded-full bg-white/95 p-1 shadow-sm">
            <span className="text-green-600 text-sm">✓</span>
          </div>
        )}
      </div>

      <CardContent className="flex h-full flex-col p-4 sm:p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 line-clamp-2 text-lg font-semibold leading-tight">{vendor.name}</h3>
            {showCategory && (
              <Badge variant="secondary" className="max-w-full text-xs">
                {getCategoryName()}
              </Badge>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 font-medium">{Number(vendor.rating || 0).toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({vendor.reviews_count} reviews)
          </span>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-start gap-2">
          <MapPin className="size-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="min-w-0 break-words text-sm text-gray-600 line-clamp-2">
            {vendor.address}, {vendor.area}, {vendor.city}
          </span>
        </div>

        {/* Working Hours */}
        <div className="mb-4 flex items-start gap-2">
          <Clock className="mt-0.5 size-4 flex-shrink-0 text-gray-400" />
          <span className="min-w-0 break-words text-sm text-gray-600">
            {formatWorkingHours()}
          </span>
        </div>

        {/* Services Preview */}
        {previewServices.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Services</p>
              <Link
                href={vendorHref}
                className="shrink-0 text-xs text-purple-700 hover:text-purple-800"
              >
                See more
              </Link>
            </div>
            <div className="space-y-2">
              {previewServices.map(service => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-gray-50/70 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 break-words">{service.name}</span>
                  <span className="shrink-0 font-medium text-gray-900">Rs.{service.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Link href={vendorHref} className="w-full sm:flex-1">
            <Button variant="outline" className="h-10 w-full rounded-xl border-gray-200">
              Details
            </Button>
          </Link>
          <Button 
            className="h-10 w-full rounded-xl bg-purple-600 text-white shadow-sm hover:bg-purple-700 sm:flex-1"
            onClick={() => {
              router.push(bookingHref);
            }}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
