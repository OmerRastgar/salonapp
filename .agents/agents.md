# Agent Context: Salon Marketplace Booking System with Directus

## Role
You are an AI assistant helping to build a **salon & beauty service marketplace** where:
- Vendors (salon owners) manage their employees, services, and schedules.
- make sure all the passwords and secrets are always in the .env file. and docker contains only the values from the .env file.
- Customers discover salons and book services (haircuts, shaves, massages, etc.) directly through a custom Next.js frontend.
- Everything is powered by a **single Directus instance** (no external schedulers like Cal.com).
- The customer booking flow (choose salon → employee → service → date/time) is built in the Next.js frontend.
- you will use spec.md file for the specification of the project.
- make sure to use the spec.md file for the specification of the project.
Your job is to configure the Directus backend using the **Directus MCP** tools, ensuring it supports multi‑tenancy, service‑based pricing/durations, availability schedules, and robust booking logic.
you can also use postgres_skill.md file for the postgresql database management.

## Project Overview (Current Architecture)
The marketplace is a custom‑built Next.js 14 application (App Router) that replaces the previous `9d8dev/directory` template. All data lives in Directus. The system is deployed with Docker (see `docker-compose.yml`), and the frontend communicates with Directus via its REST API.

**Key characteristics:**
- **Domain**: Salons / beauty services (hair, nails, massage, etc.)
- **Multi‑tenancy**: Each vendor (salon) has its own employees, services, and schedules.
- **Services**: Each employee can offer multiple services, each with its own price and duration (e.g., “Haircut – 30 min – $20”).
- **Schedules**: Recurring weekly working hours per employee (e.g., Mon–Fri 9am–5pm).
- **Booking logic**: Customers pick a service, then see available time slots based on the service duration and existing bookings.
- **Parallel bookings**: Different employees can be booked at the same time – no global conflicts.
- **Vendor & employee dashboards**: Provided natively by Directus (Insights panels, calendar layout).
- **Automation**: Directus Flows handle booking validation, price copying, and email notifications.

## Directus MCP Usage
The `directus-mcp` server gives you tools to interact with the Directus API. You will use it to:
- Create collections, fields, relations.
- Create policies (permission sets) and roles.
- Assign policies to roles and/or users.
- Build dashboards and flows.
- Manage presets and other settings.

## Best Practices & Guidelines

### Clean Up After Yourself
- If you create temporary files (e.g., test scripts, JSON exports) during the process, ensure they are deleted after use.
- Keep the workspace clean – no leftover test artifacts.

### Issue Logging
- If you encounter a major issue (role/permission misconfiguration, Flow failure, system crash, or any recurring problem), **record it in a file named `memory.md`**.
- The entry should include:
  - **Date & Time** of the incident.
  - **Description** of the issue.
  - **Root cause** (if determined).
  - **Solution applied**.
  - **How to prevent recurrence**.
- This file will be used for future troubleshooting to avoid repeating mistakes.

### Test Creation
- Whenever you create a new feature or fix a bug, **evaluate whether adequate tests exist**.
- If tests are missing or insufficient, **create them**.
- Tests should cover the functionality at the API level (using Directus API calls) and, where relevant, verify access control, overlap prevention, and Flow execution.
- Keep tests in a `tests/` directory (e.g., `tests/booking_test.js`) and ensure they can be run automatically.
- After successful verification, clean up any temporary test data.

## Specification Summary (Salon‑Optimized)

### Collections (to create/extend)

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **employees** | Salon staff | `id` (UUID), `vendor_id` (M2O → vendors), `name`, `email`, `photo`, `bio`, `timezone` |
| **employee_services** | Services offered by each employee | `id`, `employee_id` (M2O → employees), `name`, `price` (decimal), `duration_minutes` (int), `is_active` (bool), `sort` (int) |
| **employee_schedules** | Recurring availability | `id`, `employee_id` (M2O → employees), `day_of_week` (0‑6), `start_time` (time), `end_time` (time) |
| **bookings** | All appointments | `id`, `employee_id`, `vendor_id`, `employee_service_id`, `booker_email`, `booker_name`, `start_datetime`, `end_datetime`, `status` (pending/confirmed/cancelled), `amount` (decimal), `notes` |

**Existing collections to extend:**
- **vendors**: add `slug` (for friendly URLs) and `status` (active/archived).
- **directus_users**: add `vendor_id` (M2O → vendors) and `employee_id` (M2O → employees) to link user accounts to vendor or employee records.

### Business Rules (Constraints)
- **One employee = one booking at a time** – enforced by a server‑side overlap check in a Directus Flow.
- **Price is frozen** at booking time (copy from `employee_services.price` to `bookings.amount`).
- **Duration‑based slots**: Available times are computed on the frontend using the chosen service’s duration.
- **No overlapping bookings** for the same employee.
- **Vendors can manage** employees, services, and schedules.
- **Employees can only view** their own schedule and bookings (no write access to services).
- **Public (customers)** can read employees, services, schedules, and create bookings.

### Access Control (Policies + Roles)
Following Directus 11+ best practices, we create **policies** (reusable permission sets) and assign them to **roles**.

**Policies to create:**

1. **Vendor Admin Policy** (for salon owners)
   - App Access: yes (full Data Studio access)
   - Admin Access: no
   - Collection permissions (all actions) on: `employees`, `employee_services`, `employee_schedules`, `bookings`
   - Item rule for all these collections: `vendor_id = $CURRENT_USER.vendor_id`
   - Field rules: allow all fields (vendor can see everything they own)

2. **Employee Policy** (for staff)
   - App Access: yes (can log in to see their own dashboard)
   - Admin Access: no
   - Permissions:
     - `employee_schedules`: read, update (own) – item rule: `employee_id = $CURRENT_USER.employee_id`
     - `bookings`: read (own) – item rule: `employee_id = $CURRENT_USER.employee_id`
     - `employee_services`: read (own) – item rule: `employee_id = $CURRENT_USER.employee_id`
   - Field rules: allow all relevant fields

3. **Public Policy** (unauthenticated users)
   - App Access: no (cannot log in)
   - Admin Access: no
   - Permissions:
     - `employees`: read (all) – no item rule
     - `employee_services`: read (all)
     - `employee_schedules`: read (all)
     - `bookings`: create (only) – restrict fields: allow `booker_email`, `booker_name`, `employee_id`, `employee_service_id`, `start_datetime`, `end_datetime`, `notes`. Disallow `status`, `amount`, `vendor_id` (set via Flow).

**Roles to create:**
- **Vendor Admin**: assign the Vendor Admin Policy.
- **Employee**: assign the Employee Policy.
- **Public**: assign the Public Policy (or use the built‑in Public role and assign the policy there).

**Additional considerations:**
- The built‑in **Administrator** role remains unchanged (full access).
- For junction tables (e.g., if you later add many‑to‑many relations), restrict permissions to prevent unwanted relationships.
- IP restrictions can be added to policies if needed (e.g., restrict vendor admin to office IPs).
- Enforce TFA on policies if required.

### Dashboards (Directus native)
- **Vendor Dashboard**: metrics (total appointments, revenue, active employees, services), charts (appointments/revenue per employee, bookings per service), recent bookings list.
- **Employee Dashboard**: calendar view of own bookings, metrics (my appointments, upcoming, my revenue), list of upcoming bookings.

### Flows (Automation)
1. **Booking Created Flow**:
   - Fetch the linked service to get price.
   - Set `amount` to that price.
   - Run script to check for overlapping bookings (same employee, overlapping times).
   - Send email notifications to booker and employee.
   - Update status to “confirmed”.
2. **Booking Cancelled Flow** (optional):
   - Send cancellation email.

## Implementation Steps (via MCP)
1. Create/update collections and fields.
2. Set up relationships (M2O).
3. Configure collection settings (display templates, archiving, accountability, manual sorting).
4. Create policies and roles.
5. Assign policies to roles.
6. Build dashboards (Insights panels).
7. Create Flows with the required operations.
8. Create tests for critical functionality (overlap prevention, access control, Flow execution).
9. Verify everything works and clean up any temporary test data.

## Constraints & Domain Considerations
- **Service durations**: Must be stored in minutes; used by the frontend to generate slots.
- **Timezone**: All datetimes stored in UTC; frontend converts to employee’s timezone for display.
- **Slug for vendors**: Used for clean URLs (e.g., `/salons/awesome-salon`).
- **Parallel bookings**: Allowed across different employees – no global lock.
- **Soft delete**: Use archiving for cancelled bookings; they remain for history but are not shown in dashboards by default.
- **Audit trail**: Accountability enabled on `employees` and `bookings` for compliance.

You now have the full context. Proceed to configure Directus using MCP tools, following the guidelines above.