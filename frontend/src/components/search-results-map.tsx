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
  fullBleed?: boolean;
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
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function ensureLeafletAssets() {
  if (typeof document === "undefined") return Promise.resolve();

  const existingStylesheet = document.querySelector('link[data-leaflet="true"]');
  if (!existingStylesheet) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.leaflet = "true";
    document.head.appendChild(link);
  }

  if (window.L) return Promise.resolve();

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

export function SearchResultsMap({ vendors, userLocation, fullBleed }: SearchResultsMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const vendorsWithCoordinates = useMemo(
    () =>
      vendors
        .map((vendor) => {
          // Robust extraction checking for common variations
          const latitude = getCoordinate(vendor.latitude ?? (vendor as any).lat);
          const longitude = getCoordinate(vendor.longitude ?? (vendor as any).lng);
          
          // Explicitly ignore 0,0 or near-0,0 (Africa/displacement)
          const isInvalid = !latitude || !longitude || 
                           (Math.abs(latitude) < 0.01 && Math.abs(longitude) < 0.01);
          
          if (isInvalid) {
            console.warn(`[Map Debug] Vendor ${vendor.name} has invalid coordinates:`, { latitude, longitude });
            return null;
          }

          console.log(`[Map Debug] Mapping vendor ${vendor.name}:`, { latitude, longitude });
          return { ...vendor, latitude, longitude };
        })
        .filter((vendor): vendor is VendorWithCoordinates => vendor !== null),
    [vendors]
  );

  useEffect(() => {
    let cancelled = false;

      async function setupMap() {
        if (!mapRef.current || vendorsWithCoordinates.length === 0) return;
        await ensureLeafletAssets();
        if (cancelled || !mapRef.current || !window.L) return;

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
          
          // NEW: Watch for container size changes (fix for sliding animation)
          const resizeObserver = new ResizeObserver(() => {
            if (leafletMapRef.current) {
              console.log("[Map Debug] Container resized, invalidating map size");
              leafletMapRef.current.invalidateSize();
            }
          });
          resizeObserver.observe(mapRef.current);
        }

        // Mandatory size refresh for animated containers
        leafletMapRef.current.invalidateSize();

        if (markersLayerRef.current) {
          markersLayerRef.current.clearLayers();
        } else {
          markersLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
        }

        const bounds = L.latLngBounds([]);
        vendorsWithCoordinates.forEach((vendor) => {
          console.log(`[Map Debug] Placing marker for ${vendor.name} at ${vendor.latitude}, ${vendor.longitude}`);
          const marker = L.circleMarker([vendor.latitude, vendor.longitude], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#7c3aed",
            fillOpacity: 1,
          });

          marker.bindPopup(
            `<div style="min-width:180px">
              <strong style="color:#111;display:block;margin-bottom:4px">${vendor.name}</strong>
              <span style="color:#666;font-size:12px">${vendor.address}, ${vendor.area}, ${vendor.city}</span><br/>
              <div style="margin-top:8px">
                <a href="/vendor/${vendor.slug}" style="background:#7c3aed;color:#fff;padding:4px 12px;border-radius:99px;text-decoration:none;font-size:12px;font-weight:600">View Salon</a>
              </div>
            </div>`
          );
          marker.bindTooltip(vendor.name, { direction: "top", offset: [0, -10], opacity: 0.95 });
          markersLayerRef.current.addLayer(marker);
          bounds.extend([vendor.latitude, vendor.longitude]);
        });

        // Increase delay to allow container transition to fully finish
        setTimeout(() => {
            if (cancelled || !leafletMapRef.current) return;
            
            leafletMapRef.current.invalidateSize();

            if (vendorsWithCoordinates.length === 1) {
              leafletMapRef.current.setView([vendorsWithCoordinates[0].latitude, vendorsWithCoordinates[0].longitude], 14, { animate: true });
            } else if (vendorsWithCoordinates.length > 1) {
              leafletMapRef.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 13, animate: true });
            }
        }, 500); 
      }

      setupMap().catch((error) => console.error("Failed to map:", error));
    return () => { cancelled = true; };
  }, [vendorsWithCoordinates, userLocation]);

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
      <div className="flex h-full min-h-[400px] items-center justify-center bg-muted/10 p-6 text-center text-sm text-muted-foreground">
        No map coordinates available.
      </div>
    );
  }

  if (fullBleed) {
    return (
      <div ref={mapRef} className="h-full w-full bg-gray-100 z-0" />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border/40 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Result map</h2>
        <p className="text-xs text-muted-foreground">Pins stay fixed to the exact location.</p>
      </div>
      <div ref={mapRef} className="h-[420px] w-full bg-muted/10" />
    </div>
  );
}
