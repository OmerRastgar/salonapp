# Marketplace Memory Log

## Entry 1 - 2026-03-30

### Incident: Directus 500/403 – Corrupted v10 Metadata on v11 Instance
- **Description**: Attempting to import a Directus v10 SQL backup into a fresh v11 instance caused 500 errors on login and 403 on all API endpoints.
- **Root Cause**: The v10 `directus_fields.type` column schema differs from v11. Importing the old backup corrupted system metadata.
- **Solution**: Full volume wipe (`docker-compose down -v`), clean Directus 11 init, manual schema recreation via SQL.
- **Prevention**: Never import v10 backups into v11. Store future backups OUTSIDE the `data/` Docker volume directory.

---

## Entry 2 - 2026-03-30

### Incident: Book Button Goes to Non-Existent URL
- **Description**: The "Book Appointment" buttons on the vendor detail page (`/vendor/[slug]`) had no `onClick` handlers — clicking them did nothing or navigated to a broken URL.
- **Root Cause**: The buttons were added without routing logic during initial frontend scaffolding.
- **Solution**: Added `onClick={() => router.push('/booking?vendor=${vendor.slug}')}` to the header, sidebar, and per-service "Book Now" buttons.
- **Prevention**: Always wire navigation on CTAs during component creation, not as an afterthought.

---

## Entry 3 - 2026-03-30

### Incident: Booking Page Vendors List Blank
- **Description**: The `/booking` page showed no vendors in Step 1 (Vendor Selection), despite vendors existing in Directus.
- **Root Cause**: `SimpleDirectusService.getVendors()` returns `{ data: Vendor[], meta: null }` but the booking page's `loadVendors` called `setVendors(data)` directly, setting state to the wrapper object instead of the array.
- **Solution**: Changed `setVendors(data)` to `setVendors(Array.isArray(result) ? result : (result as any).data || [])`.
- **Prevention**: Always check return type when calling service methods — SDK wrappers often return `{ data, meta }`, not raw arrays.

---

## Entry 4 - 2026-03-30

### Issue: Directus MCP "Invalid Credentials"
- **Description**: MCP Directus tools (read-fields, read-flows, etc.) return `Invalid user credentials` even though Directus is running.
- **Root Cause**: The MCP server's stored credentials (likely from a previous install) do not match the admin credentials in the fresh `.env` file.
- **Solution**: Use PostgreSQL MCP directly for schema inspection, or re-initialize Directus MCP with updated credentials.
- **Prevention**: After any Directus password reset or fresh install, update the MCP server config with new credentials.

---

## Entry 5 - 2026-03-30

### Incident: CORS 8080 Error & Missing Service Display
- **Description**: "Book Now" on employee cards attempted to load `localhost:8080`, and the "Services" list on vendor pages was empty even though data existed in Directus.
- **Root Cause**: 
    1. EmployeeCard had hardcoded `localhost:8080` URL for booking.
    2. Missing `one_field` mapping in `directus_relations` for `employees -> services`.
    3. Missing `services` alias field in `directus_fields`.
    4. 403 Forbidden on the newly created `services` field due to `Public` role only having `*` (which excludes non-column aliases).
- **Solution**: 
    1. Updated `EmployeeCard.tsx` to use internal `/booking` routing.
    2. Registered `services` relationship in `directus_relations`.
    3. Created `services` alias field in `directus_fields` via API.
    4. Explicitly granted `*,services` read permissions to the `Public` role in `directus_permissions`.
    5. Performed a "Nuclear" cache purge on `.next` and restarted containers to refresh metadata.
- **Prevention**: Always register O2M relationships in both `relations` and `fields` metadata. Use internal routing for all frontend navigation. Explicitly list alias fields in public permissions.

---

## Entry 6 - 2026-03-31

### Incident: CORS Preflight Access-Control-Allow-Origin Blocked
- **Description**: The Next.js frontend was blocked from fetching data from `http://localhost:8055` (Directus) with the error: "Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present".
- **Root Cause**: The `docker-compose-simple.yml` had mapped `CORS_ORIGIN` but was missing the mandatory `CORS_ENABLED: 'true'` environment variable, meaning Directus 11 completely ignored the origin mappings.
- **Solution**: Added `CORS_ENABLED: 'true'`, `CORS_CREDENTIALS`, `CORS_METHODS`, and `CORS_ALLOWED_HEADERS` to the Directus environment configuration and restarted Docker containers.
- **Prevention**: Always include `CORS_ENABLED: 'true'` when defining `CORS_ORIGIN` in the Directus `docker-compose` setup.
