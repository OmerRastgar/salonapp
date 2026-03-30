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
