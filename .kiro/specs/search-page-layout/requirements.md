# Requirements: Search Page Layout

## Introduction

The search page (`/search`) is the primary discovery surface of the marketplace. It displays a list of vendors on the left and an optional interactive map on the right. The layout must feel like a native app — no full-page scroll, the map fills the viewport, and only the vendor list scrolls independently.

## Glossary

- **Search Page**: The `/search` route that lists vendors and optionally shows a map.
- **Vendor List**: The left-side scrollable column showing `VenueCard` components.
- **Map Panel**: The right-side full-height Leaflet map, visible on desktop when toggled.
- **Map Toggle**: The "Show Map / Hide Map" button in the header (desktop only).
- **Viewport Lock**: The outer container uses `h-screen overflow-hidden` so the browser never shows a page-level scrollbar.

---

## Requirements

### Requirement 1: Viewport Lock

**User Story:** As a user, I want the search page to feel like a native app, so that the browser scrollbar never appears at the page level.

#### Acceptance Criteria

1. THE Search_Page outer wrapper SHALL use `h-screen` and `overflow-hidden` so no page-level scroll ever appears.
2. THE Search_Page header SHALL use `flex-shrink-0` so it never collapses when content grows.
3. THE Search_Page main content area SHALL use `flex flex-1 overflow-hidden` to fill the remaining viewport height exactly.

---

### Requirement 2: Scrollable Vendor List

**User Story:** As a user, I want to scroll through vendor results independently of the map, so that I can browse vendors while the map stays fixed.

#### Acceptance Criteria

1. THE Vendor_List column SHALL use `overflow-y-auto` so only the vendor cards scroll.
2. WHEN the Map Panel is hidden, THE Vendor_List SHALL occupy the full width (`w-full`).
3. WHEN the Map Panel is visible on desktop, THE Vendor_List SHALL shrink to `lg:w-[50%] xl:w-[45%]` with a `transition-all duration-500` animation.
4. THE Vendor_List width transition SHALL use `ease-in-out` for a smooth feel.

---

### Requirement 3: Full-Height Sticky Map Panel (Desktop)

**User Story:** As a user on desktop, I want the map to fill the full height of the viewport beside the vendor list, so that I can see all vendor locations without scrolling.

#### Acceptance Criteria

1. THE Map_Panel SHALL only be visible on `lg` breakpoint and above (`hidden lg:block`).
2. THE Map_Panel SHALL use `flex-shrink-0` so it never compresses when the vendor list grows.
3. THE Map_Panel SHALL use `h-full` to fill the exact remaining viewport height set by the parent `<main>`.
4. THE Map_Panel width SHALL be `w-[50%] xl:w-[55%]`.
5. WHEN the Map_Panel mounts, THE Leaflet map SHALL call `invalidateSize()` at 550ms and 900ms after mount to account for the entry animation.
6. THE Map_Panel map div SHALL have a `min-height: 500px` fallback so Leaflet never initialises against a zero-height container.

---

### Requirement 4: Map Entry Animation

**User Story:** As a user, I want the map to slide in smoothly when I click "Show Map", so that the transition feels polished.

#### Acceptance Criteria

1. WHEN the Map Toggle is clicked on desktop, THE Map_Panel SHALL animate in with `opacity: 0 → 1` and `x: 60 → 0` over `0.4s`.
2. WHEN the Map Toggle is clicked again, THE Map_Panel SHALL animate out with the reverse transition.
3. THE animation SHALL use `AnimatePresence` from `motion/react` to handle mount/unmount correctly.

---

### Requirement 5: Mobile Map Overlay

**User Story:** As a user on mobile, I want to toggle a fullscreen map overlay, so that I can see vendor locations without leaving the search results.

#### Acceptance Criteria

1. THE Map_Toggle button on mobile SHALL be `fixed bottom-10 left-1/2` and only visible below the `lg` breakpoint (`lg:hidden`).
2. WHEN the Map_Toggle is tapped on mobile, THE Map_Overlay SHALL animate in from the bottom (`y: 100% → 0`).
3. THE Map_Overlay SHALL be `fixed inset-0 z-50` and cover the full screen.
4. WHEN the Map_Toggle is tapped again, THE Map_Overlay SHALL animate out downward.

---

### Requirement 6: Map Marker Rendering

**User Story:** As a user, I want to see vendor location pins on the map, so that I can understand where salons are geographically.

#### Acceptance Criteria

1. THE Map SHALL render a `circleMarker` for each vendor that has valid `latitude` and `longitude` coordinates.
2. IF a vendor has coordinates of `0, 0` or near-zero, THE Map SHALL exclude that vendor from the marker layer.
3. WHEN markers are placed, THE Map SHALL call `fitBounds` with `padding: [60, 60]` and `maxZoom: 13` to frame all markers.
4. WHEN a marker is clicked, THE Map SHALL show a popup with the vendor name, address, and a "View Salon" link.

---

## Layout Rules (Critical — Read Before Any UI Change)

> These rules MUST be preserved whenever the search page layout is modified.

| Rule | Class / Value | Why |
|------|--------------|-----|
| Outer wrapper | `h-screen overflow-hidden` | Prevents page-level scroll |
| Header | `flex-shrink-0` | Prevents header collapse |
| `<main>` | `flex flex-1 overflow-hidden` | Fills remaining height, clips children |
| Vendor list | `overflow-y-auto h-full` | Only this element scrolls |
| Map container | `flex-shrink-0 h-full` | Map fills full height, never compresses |
| Map div | `min-height: 500px` | Leaflet needs real dimensions on init |
| `invalidateSize` | Called at 550ms + 900ms | Fixes markers after animation completes |
