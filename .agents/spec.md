Specification: Simple Multi-Tenant Booking System
Cal.com‑style scheduler integrated with Directus Marketplace
Version 1.2 – 30 March 2026

1. Overview
Build a minimal, production‑ready booking experience where:

Vendors manage employees, services, and schedules.

Customers book a service (haircut, shave, etc.) with a specific employee.

Availability is computed live – no stored slots.

Multiple employees can be booked at the exact same time (parallel bookings allowed).

Everything lives inside the existing Directus instance.

Vendors & employees use only Directus dashboards (no extra frontend).

Core principle: 95%+ of all processing, validation, automation, and dashboards run natively inside Directus.
The only custom code is the customer‑facing booking page (date picker + available slots).

2. Data Model (Directus Collections)
2.1 New Collections to Create
Collection	Purpose	Key Fields	Relations	Directus‑Native Features
employees	Vendor staff	id (UUID), vendor_id, name, email, photo, bio, timezone	M2O → vendors	Display Template, Icon/Color, Accountability
employee_services	Services per employee	id (UUID), employee_id, name, price (decimal), duration_minutes (int), is_active (bool), sort (int)	M2O → employees	Display Template, Archiving, Manual Sort
employee_schedules	Recurring weekly availability	id (UUID), employee_id, day_of_week (0‑6), start_time (time), end_time (time)	M2O → employees	Display Template, Manual Sort
bookings	All appointments	id (UUID), employee_id, vendor_id, employee_service_id, booker_email, booker_name, start_datetime (datetime UTC), end_datetime (datetime UTC), status (status field), amount (decimal), notes	M2O → employees
M2O → vendors
M2O → employee_services	Archiving (soft delete), Display Template, Accountability (revisions + activity)
2.2 Existing Collections to Extend
Collection	Additions
vendors	slug (string), status (string, e.g. active/archived)
directus_users	vendor_id (M2O to vendors), employee_id (M2O to employees)
2.3 Recommended Collection‑Wide Settings (Apply to All)
Icon & Color – visual identity in Data Studio.

Display Template – e.g. for bookings: {{employee.name}} – {{employee_service.name}} @ {{start_datetime}}.

Accountability – track revisions and activity (built‑in audit log).

Archiving – on bookings (cancelled ones hidden by default but can be queried).

3. What Directus Handles Natively (Zero Custom Code)
Feature	Directus Feature Used	Details
Multi‑tenancy & row‑level security	Roles + Permission Filters + Presets	vendor_id = $CURRENT_USER.vendor_id on all vendor‑owned collections. Employees see only employee_id = $CURRENT_USER.employee_id.
Service definition	M2O relation + Display Template	Each employee can have multiple services with distinct price and duration.
Availability schedules	employee_schedules collection	Recurring weekly data stored cleanly; uses native time fields.
Booking creation & validation	Flows (Trigger: Item Create on bookings)	See section 5 for the detailed Flow.
Price copying from service	Flows + Read Item operation	Automatically sets amount = employee_services.price at creation.
Overlap prevention (backend)	Flows + Run Script + Query	Server‑side check that the slot is still free.
Dashboards & analytics	Dashboards + Insights Panels	Native aggregations: sum revenue, count bookings, group by employee/service.
Calendar view for employees	Calendar Layout on bookings	Uses start_datetime and end_datetime. Exactly as described in the Directus docs.
Emails & notifications	Flows + Send Email operation	Triggered on booking creation.
Audit & history	Accountability (revisions + activity)	Built‑in, no extra tables.
Soft delete	Archiving on bookings	Cancelled bookings hidden but preserved.
Default values & presets	Advanced Field Creation Mode + Presets	e.g. set status = “confirmed” on create.
4. Dashboards (100% Inside Directus)
4.1 Vendor Dashboard – “Vendor Portal”
Access: Role Vendor Admin
Filter: vendor_id = $CURRENT_USER.vendor_id on all underlying data.

Top Metrics (Insights Panels):

Total Appointments

Total Revenue (sum(amount))

Active Employees

Active Services

Charts (Insights Panels):

Appointments per Employee (Bar)

Revenue per Employee (Bar)

Bookings by Service Type (Bar)

Bookings by Date (Line – last 30 days)

Lists (Data Model Panel):

Recent Bookings (with Display Template)

Top Performing Services

4.2 Employee Dashboard – “My Schedule”
Access: Role Employee
Filter: employee_id = $CURRENT_USER.employee_id

Calendar Layout Panel on bookings (shows own appointments).

Metrics: My Appointments, Upcoming (next 7 days), My Revenue.

List: Upcoming bookings (shows service name + price via Display Template).

5. Flows (Directus‑Native Processing)
Create these Flows to centralise business logic.

5.1 Flow: Booking Created
Trigger: Item Create on bookings

Operation	Type	Details
1	Read Item	Fetch the linked employee_service record using employee_service_id.
2	Set Amount	If amount is not set in the request, set it to employee_service.price.
3	Run Script	Overlap check: query bookings for same employee with overlapping time. If any, throw an error.
4	Send Email	Notify employee (email from employees) and booker (email from request).
5	Update Item	Set status = “confirmed” (if not already set).
Example Run Script (JavaScript)

javascript
const existing = await $directus.items('bookings').readByQuery({
  filter: {
    employee_id: { _eq: payload.employee_id },
    start_datetime: { _lt: payload.end_datetime },
    end_datetime: { _gt: payload.start_datetime }
  }
});
if (existing.data.length > 0) {
  throw new Error('Slot is no longer available');
}
5.2 Flow: Booking Cancelled
Trigger: Item Update → status changes to “cancelled”

Send cancellation email (optional).

Optionally archive the booking (if archiving is enabled, this happens automatically).

6. Customer‑Facing Booking Page (Only Custom Frontend Needed)
This is the only part that requires code in your marketplace. Build a page (React / Next.js / Vue etc.) that follows this flow:

Select Vendor → Select Employee → Select Service

Pick Date (left column)

See Available Slots (right column) – computed live using:

employee_schedules for the chosen day

Service duration_minutes

Existing bookings for that employee on that date

Book → POST to Directus bookings endpoint (Flow handles the rest).

Key Logic (Pseudo‑code)

javascript
// 1. Fetch schedule for selected day
const schedule = getEmployeeSchedule(employeeId, selectedDate.getDay());
// 2. Generate slots based on service.duration_minutes
const allSlots = generateSlots(schedule.start_time, schedule.end_time, service.duration);
// 3. Fetch existing bookings for that day
const existingBookings = getBookings(employeeId, selectedDate);
// 4. Remove occupied slots
const freeSlots = allSlots.filter(slot => !existingBookings.includes(slot));
Directus API endpoints used:

GET /items/employees (with nested services & schedules)

GET /items/bookings?filter[employee_id][_eq]=X&filter[start_datetime][_gte]=...

7. Implementation Order (Total ~1 Day)
Step	Effort	Description
1. Create/update collections & fields	20 min	Use Directus UI – add employees, employee_services, employee_schedules, bookings. Set relations, Display Templates, Archiving, etc.
2. Set up roles & permission filters	15 min	Create roles “Vendor Admin” and “Employee”. Apply row‑level filters.
3. Create dashboards	20 min	Build Vendor and Employee dashboards using Insights panels and Data Model panels.
4. Create Flows	15 min	Set up the two Flows (Booking Created, Booking Cancelled).
5. Build customer booking page	4 hours	Implement the frontend component in your marketplace (React/Next.js).
6. Test end‑to‑end	1 hour	Test with 2 vendors, 2 employees each, multiple services, and overlapping bookings.
8. Constraints & Limitations
No native “generate slots” API – slots are computed on the frontend (acceptable; matches Cal.com pattern).

Race conditions – theoretically possible if two customers book the same slot in the same second. Mitigated by the server‑side overlap check in the Flow.

Timezones – store all datetimes in UTC. Convert to employee’s timezone only in the frontend.

No external calendar sync – all data stays inside Directus (as requested).

No advanced Cal.com features – no round‑robin, no buffers, no minimum notice, no team scheduling.

One employee = one booking at a time – enforced by the Flow.

Price is frozen at booking time – amount is copied from service price at creation, so later price changes do not affect past bookings.

9. Appendix: Directus Documentation References
Collections Guide – used for structuring all data models.

Fields & Relationships – for M2O and other relations.

Permissions & Roles – for multi‑tenancy filters.

Flows – for backend validation, price copying, and email.

Dashboards & Panels – for vendor/employee analytics.

Calendar Layout – as you mentioned, for viewing bookings.

This specification is complete. All business logic, automation, and reporting reside inside Directus. Only the customer‑facing booking page requires custom frontend development.

Would you like me to now produce any of the following:

JSON import files for the collections and fields

Flow JSON configurations for direct import

Ready‑to‑paste React booking page code (with service selection and slot logic)