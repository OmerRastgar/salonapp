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
- **Prevention**: ---

## Entry 7 - 2026-04-02

### Incident: Directus 11 "Administrator" 403 Lockout & Field/Schema Null Errors
- **Description**: The Directus Admin UI began throwing 403 Forbidden errors on core system endpoints (`/translations`, `/fields`, `/roles`) even for the primary admin user. This led to "TypeError: Cannot read properties of null (reading 'field')" crashes in the Vue frontend.
- **Root Cause**: The **Administrator Policy** (which in Directus 11 contains the actual permissions for the Admin role) became corrupted or had its `admin_access` and `app_access` flags set to `false`. This effectively stripped the Administrator role of its system privileges.
- **Solution**: 
    1. Direct Database Repair: Updated the `directus_policies` table via SQL to set `admin_access = true` and `app_access = true` for the 'Administrator' policy.
    2. Full Reset: Performed a volume wipe (`docker-compose down -v`) and re-initialized the database using `scripts/execute-rebuild.cjs` and `scripts/seed-essential.cjs` to ensure a clean metadata state.
- **Prevention**: Avoid manual alterations to system policies in Directus 11 without backups. If a lockout occurs, use `docker-compose exec database psql` to verify the `admin_access` flag in the `directus_policies` table.

---

## Entry 9 - 2026-04-05

### Incident: Vendors/Categories Invisible to Logged-Out Users (403 on Public Role)
- **Description**: Vendors and categories were completely invisible on the site unless the user was already logged into Directus in another tab. The browser console showed `GET /items/vendors 403` and `GET /items/categories 403` for anonymous users.
- **Root Cause**: Three compounding issues:
    1. `DIRECTUS_TOKEN` in `.env` was a made-up value never registered in the Directus database. Directus rejected it with `Invalid user credentials`.
    2. `DIRECTUS_TOKEN` was not passed into the frontend container in `docker-compose.yml` (missing env var), so all Next.js API proxy routes ran without auth.
    3. The frontend SDK client in `directus-simple.ts` called Directus directly from the browser (client-side) as an anonymous user, making all reads dependent on the Public role having correct permissions. When the Public role lacked permissions, everything broke for logged-out users.
    4. `NEXT_PUBLIC_DIRECTUS_URL` had `:8055` instead of port 80, bypassing Nginx entirely.
- **Solution**:
    1. Registered a real static token in the database: `UPDATE directus_users SET token = 'salonapp-static-token-2026' WHERE email = 'admin@saloonmarketplace.com'`.
    2. Added `DIRECTUS_TOKEN=${DIRECTUS_TOKEN}` to the `frontend` service in `docker-compose.yml`.
    3. Created Next.js API proxy routes (`/api/vendors`, `/api/vendors/enrichment`, `/api/categories`, `/api/locations`) that use the server-side token. The browser never calls Directus directly for reads.
    4. Fixed `NEXT_PUBLIC_DIRECTUS_URL` to use port 80 (Nginx gateway).
    5. Updated `directus-simple.ts` to route all client-side reads through the proxy routes instead of calling Directus directly.
- **Prevention**:
    - Always verify `DIRECTUS_TOKEN` works with `curl -s http://localhost:8055/users/me -H "Authorization: Bearer <token>"` before deploying.
    - Never rely on the Directus Public role for data visibility — always proxy reads through authenticated Next.js API routes.
    - After any `.env` change, run `docker compose exec frontend env | grep DIRECTUS_TOKEN` to confirm the container actually has the new value. If not, run `sed -i` directly on the VPS to update the file, then `docker compose up -d --force-recreate frontend`.
    - `NEXT_PUBLIC_DIRECTUS_URL` must always point to the Nginx gateway (port 80), never directly to Directus (port 8055).

---

## Entry 8 - 2026-04-05

### Incident: Persistent 403 Forbidden & "Integer vs UUID" Schema Mismatch
- **Description**: The marketplace search page experienced intermittent 403 Forbidden errors for vendors and categories, while the reseed script crashed with "column id is of type integer but expression is of type uuid."
- **Root Cause**: The project was using a "hybrid" logic—trying to force Directus v10 Role IDs (`192df901...`) and integer-based permission IDs into a Directus v11 instance. Directus 11's mandatory Policy-based permission system conflicted with these legacy hardcoded IDs.
- **Solution**: Initiated "Pure Directus 11 Modernization":
    1. Purged all hardcoded Directus v10 Role and Policy IDs from the codebase.
    2. Transitioned to a **Schema-Agnostic Seeder** that dynamically detects ID types (Integer vs UUID) on the fly.
    3. Reconstructed the permission system around the built-in Directus 11 **Policy** structure, targeting the anonymous access bridge directly.
    4. Verified all frontend SDK calls (`v18+`) are using modern `rest()` and `readItems()` patterns.
- **Prevention**: Never assume a fixed ID for system roles (Public/Admin) across Directus versions. Always use dynamic lookups for Policies. Maintain a clean, version-native schema without mixing v10 and v11 logic.
