import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SimpleDirectusService, Vendor } from "@/lib/directus-simple";

interface VendorCardProps {
  vendor: Vendor;
  showCategory?: boolean;
}

export function VendorCard({ vendor, showCategory = true }: VendorCardProps) {
  const router = useRouter();

  const formatWorkingHours = () => {
    if (!vendor.working_hours || vendor.working_hours.length === 0) return "Hours not available";
    
    const today = new Date().getDay();
    const todayHours = vendor.working_hours.find(wh => wh.day_of_week === today);
    
    if (!todayHours || todayHours.is_closed) return "Closed today";
    
    return `Open until ${todayHours.close_time.slice(0, 5)}`;
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200">
        {vendor.cover_image ? (
          <img
            src={SimpleDirectusService.getAssetUrl(vendor.cover_image) || '/placeholder-vendor.jpg'}
            alt={vendor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-4xl">💇‍♀️</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {vendor.is_featured && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 hover:bg-yellow-600">
            Featured
          </Badge>
        )}
        
        {/* Women Only Badge */}
        {vendor.women_only && (
          <Badge className="absolute top-3 right-3 bg-pink-500 hover:bg-pink-600">
            Women Only
          </Badge>
        )}
        
        {/* Verified Badge */}
        {vendor.is_verified && (
          <div className="absolute bottom-3 right-3 bg-white rounded-full p-1">
            <span className="text-green-600 text-sm">✓</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{vendor.name}</h3>
            {showCategory && (
              <Badge variant="secondary" className="text-xs">
                {getCategoryName()}
              </Badge>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 font-medium">{Number(vendor.rating || 0).toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({vendor.reviews_count} reviews)
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="size-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600 line-clamp-2">
            {vendor.address}, {vendor.area}, {vendor.city}
          </span>
        </div>

        {/* Working Hours */}
        <div className="flex items-center gap-2 mb-3">
          <Clock className="size-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatWorkingHours()}
          </span>
        </div>

        {/* Services Preview */}
        {vendor.services && vendor.services.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Popular Services:</p>
            <div className="flex flex-wrap gap-1">
              {vendor.services
                .filter(service => service.is_popular)
                .slice(0, 3)
                .map(service => (
                  <Badge key={service.id} variant="outline" className="text-xs">
                    {service.name} - Rs.{service.price}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/vendor/${vendor.slug}`} className="flex-1">
            <Button variant="outline" className="w-full h-10">
              Details
            </Button>
          </Link>
          <Button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 h-10 text-white"
            onClick={() => {
              router.push(`/booking?vendor=${vendor.slug}`);
            }}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
