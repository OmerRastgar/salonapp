"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbEntry, SiteBreadcrumbs } from "@/components/site-breadcrumbs";

function BookingSuccessContent() {
  const searchParams = useSearchParams();

  const vendorName = searchParams.get("vendorName") || "the salon";
  const vendorSlug = searchParams.get("vendor");
  const returnTo = searchParams.get("returnTo");

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbEntry[] = [{ label: "Home", href: "/" }];

    if (returnTo) {
      items.push({ label: "Search", href: returnTo });
    }

    if (vendorSlug && vendorName) {
      items.push({ label: vendorName, href: `/vendor/${vendorSlug}` });
    }

    items.push({ label: "Booking Confirmed" });
    return items;
  }, [returnTo, vendorName, vendorSlug]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <SiteBreadcrumbs items={breadcrumbs} className="mb-6" />

        <Card className="rounded-3xl border-gray-100 shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600">
              <CheckCircle2 className="size-10" />
            </div>
            <CardTitle className="text-3xl">Thank you for booking</CardTitle>
            <p className="max-w-xl text-sm text-gray-600">
              Your appointment request has been sent successfully. We will contact you on WhatsApp and through email to confirm the final details.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700 sm:grid-cols-2">
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="size-4 text-purple-600" />
                WhatsApp follow-up
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="size-4 text-purple-600" />
                Email confirmation
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {vendorSlug && (
                <Link href={`/vendor/${vendorSlug}`}>
                  <Button variant="outline" className="w-full rounded-2xl border-gray-200 sm:w-auto">
                    Back to vendor
                  </Button>
                </Link>
              )}
              <Link href={returnTo || "/"}>
                <Button className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 sm:w-auto">
                  {returnTo ? "Back to results" : "Back to home"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BookingSuccessContent />
    </Suspense>
  );
}
