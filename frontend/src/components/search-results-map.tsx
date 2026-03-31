"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Vendor } from "@/lib/directus-simple";

interface SearchResultsMapProps {
  vendors: Vendor[];
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

interface VendorWithCoordinates extends Vendor {
  latitude: number;
  longitude: number;
}

declare global {
  interface Window {
    L?: any;
  }
}

function getCoordinate(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ensureLeafletAssets() {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  const existingStylesheet = document.querySelector('link[data-leaflet="true"]');
  if (!existingStylesheet) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.leaflet = "true";
    document.head.appendChild(link);
  }

  if (window.L) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector('script[data-leaflet="true"]') as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Leaflet.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.dataset.leaflet = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet."));
    document.body.appendChild(script);
  });
}

export function SearchResultsMap({ vendors, userLocation }: SearchResultsMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const vendorsWithCoordinates = useMemo(
    () =>
      vendors
        .map((vendor) => {
          const latitude = getCoordinate(vendor.latitude);
          const longitude = getCoordinate(vendor.longitude);

          if (latitude === null || longitude === null) {
            return null;
          }

          return {
            ...vendor,
            latitude,
            longitude,
          };
        })
        .filter((vendor): vendor is VendorWithCoordinates => vendor !== null),
    [vendors]
  );

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!mapRef.current || vendorsWithCoordinates.length === 0) {
        return;
      }

      await ensureLeafletAssets();

      if (cancelled || !mapRef.current || !window.L) {
        return;
      }

      const L = window.L;

      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current, {
          scrollWheelZoom: true,
          dragging: true,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(leafletMapRef.current);
      }

      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      } else {
        markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
      }

      const bounds = L.latLngBounds([]);

      vendorsWithCoordinates.forEach((vendor) => {
        const marker = L.circleMarker([vendor.latitude, vendor.longitude], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          fillColor: "#7c3aed",
          fillOpacity: 1,
        });

        marker.bindPopup(
          `<div style="min-width:180px">
            <strong>${vendor.name}</strong><br/>
            <span>${vendor.address}, ${vendor.area}, ${vendor.city}</span><br/>
            <a href="/vendor/${vendor.slug}" style="color:#7c3aed;font-weight:600">Open vendor</a>
          </div>`
        );
        marker.bindTooltip(vendor.name, {
          direction: "top",
          offset: [0, -10],
          opacity: 0.95,
        });
        markersLayerRef.current.addLayer(marker);
        bounds.extend([vendor.latitude, vendor.longitude]);
      });

      if (
        userLocation &&
        Number.isFinite(userLocation.latitude) &&
        Number.isFinite(userLocation.longitude)
      ) {
        const userMarker = L.circleMarker([userLocation.latitude, userLocation.longitude], {
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor: "#2563eb",
          fillOpacity: 1,
        });
        userMarker.bindTooltip("You are here", {
          direction: "top",
          offset: [0, -10],
          opacity: 0.95,
        });
        userMarker.bindPopup("<strong>Your location</strong>");
        markersLayerRef.current.addLayer(userMarker);
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }

      if (vendorsWithCoordinates.length === 1) {
        leafletMapRef.current.setView([vendorsWithCoordinates[0].latitude, vendorsWithCoordinates[0].longitude], 14);
      } else {
        leafletMapRef.current.fitBounds(bounds, {
          padding: [32, 32],
          maxZoom: 13,
        });
      }
    }

    setupMap().catch((error) => {
      console.error("Failed to initialize search results map:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [vendorsWithCoordinates]);

  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  if (vendorsWithCoordinates.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        No map coordinates are available for these results yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Result map</h2>
        <p className="text-xs text-gray-500">Pins stay fixed to the exact location. Hover or click a pin to see the vendor name.</p>
      </div>

      <div ref={mapRef} className="h-[420px] w-full bg-gray-100" />

      <div className="space-y-2 border-t border-gray-100 px-4 py-3">
        {vendorsWithCoordinates.slice(0, 5).map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendor/${vendor.slug}`}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{vendor.name}</p>
              <p className="truncate text-xs text-gray-500">
                {vendor.address}, {vendor.area}, {vendor.city}
              </p>
            </div>
            <span className="shrink-0 text-xs text-purple-700">
              <MapPin className="inline size-3" /> View
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
