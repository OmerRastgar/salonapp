"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-white z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-purple-600 transition-colors hover:text-purple-700">
            Clyp
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/list-business">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6"
              >
                List Your Business
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
