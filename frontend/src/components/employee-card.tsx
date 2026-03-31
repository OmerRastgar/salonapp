import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, MessageSquare } from "lucide-react";
import { SimpleDirectusService } from "@/lib/directus-simple";

export interface Employee {
  id: string | number;
  name: string;
  role?: string;
  bio?: string;
  intro?: string;
  image?: string;
  rating?: number | string;
}

interface EmployeeCardProps {
  employee: Employee;
  vendorSlug?: string;
  bookingHref?: string;
  onSelect?: (employee: Employee) => void;
  onRate?: (employee: Employee) => void;
  selected?: boolean;
}

export function EmployeeCard({ 
  employee, 
  vendorSlug,
  bookingHref,
  onSelect, 
  onRate,
  selected = false
}: EmployeeCardProps) {
  const router = useRouter();
  return (
    <Card 
      className={`transition-all ${
        selected 
          ? 'border-purple-600 bg-purple-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <CardContent className="p-4" onClick={() => onSelect?.(employee)}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 bg-purple-100 rounded-xl overflow-hidden flex-shrink-0">
            {employee.image ? (
              <img
                src={SimpleDirectusService.getAssetUrl(employee.image) || ""}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="size-10 text-purple-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-bold text-xl text-gray-900 leading-tight">{employee.name}</h3>
                <p className="text-sm font-medium text-purple-600 mt-0.5">{employee.role || "Professional"}</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-sm flex-shrink-0 ml-2">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-yellow-700">{Number(employee.rating || 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Intro */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {employee.bio || employee.intro || "No bio available."}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 text-xs gap-1.5 h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onRate?.(employee);
                }}
              >
                <MessageSquare className="size-3.5" />
                Rate
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  if (bookingHref) {
                    router.push(`${bookingHref}${bookingHref.includes("?") ? "&" : "?"}employee=${employee.id}`);
                  } else if (vendorSlug) {
                    router.push(`/booking?vendor=${vendorSlug}&employee=${employee.id}`);
                  } else {
                    router.push(`/booking?employee=${employee.id}`);
                  }
                }}
              >
                Book
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
