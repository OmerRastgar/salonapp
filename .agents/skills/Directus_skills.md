# Skill: Set up Salon Marketplace Booking System with Directus MCP

## Overview
This skill provides a step‑by‑step guide to configure a Directus instance as the single backend for a salon marketplace. The final setup includes collections for employees, services, schedules, and bookings, plus **policies** (permission sets), **roles**, dashboards, and automation flows. Use the **Directus MCP** tools to execute the steps.

**Prerequisites**
- A running Directus instance (admin access).
- Directus MCP server connected.
- Familiarity with the project context (see `agent.md`).

## Step 1: Create Collections
Use `directus_create_collection` for each new collection. Apply appropriate meta settings.

**Employees**
```json
{
  "collection": "employees",
  "meta": {
    "icon": "person",
    "display_template": "{{name}}",
    "accountability": "all"
  }
}
Employee Services

json
{
  "collection": "employee_services",
  "meta": {
    "icon": "local_offer",
    "display_template": "{{name}} ({{duration_minutes}}min - {{price}})",
    "accountability": "all",
    "archive_app": true,
    "archive_field": "is_active",
    "archive_value": false
  }
}
Employee Schedules

json
{
  "collection": "employee_schedules",
  "meta": {
    "icon": "schedule",
    "display_template": "{{day_of_week}}: {{start_time}} - {{end_time}}",
    "accountability": "all"
  }
}
Bookings

json
{
  "collection": "bookings",
  "meta": {
    "icon": "event",
    "display_template": "{{employee.name}} - {{employee_service.name}} @ {{start_datetime}}",
    "accountability": "all",
    "archive_app": true,
    "archive_field": "status",
    "archive_value": "cancelled"
  }
}
Step 2: Add Fields
Use directus_create_field for each field. Follow the schema in the specification.

employees
Field	Type	Options
id	UUID	primary
vendor_id	M2O	relation: vendors
name	string	–
email	string	–
photo	file	–
bio	text	–
timezone	string	default: "UTC"
employee_services
Field	Type	Options
id	UUID	primary
employee_id	M2O	relation: employees
name	string	–
price	decimal	precision: 10, scale: 2
duration_minutes	integer	–
is_active	boolean	default: true
sort	integer	default: 0
employee_schedules
Field	Type	Options
id	UUID	primary
employee_id	M2O	relation: employees
day_of_week	integer	min: 0, max: 6
start_time	time	–
end_time	time	–
bookings
Field	Type	Options
id	UUID	primary
employee_id	M2O	relation: employees
vendor_id	M2O	relation: vendors
employee_service_id	M2O	relation: employee_services
booker_email	string	–
booker_name	string	–
start_datetime	datetime	–
end_datetime	datetime	–
status	status	statuses: pending, confirmed, cancelled with colors
amount	decimal	precision: 10, scale: 2
notes	text	–
Extend vendors
Add fields:

slug (string) – unique identifier for URL.

status (string) – e.g., active, archived.

Extend directus_users
Add fields:

vendor_id (M2O to vendors) – links user to vendor (for vendor admins).

employee_id (M2O to employees) – links user to employee (for employee access).

Step 3: Configure Collection Settings (Meta)
Use directus_update_collection to set additional meta:

Display templates as shown above.

Archiving for employee_services (using is_active) and bookings (using status with cancelled).

Manual sorting for employee_services and employee_schedules (enable the sort field).

Step 4: Create Policies and Roles (Access Control)
We'll create three policies and assign them to roles. Use directus_create_policy and directus_create_role. If MCP lacks these tools, fall back to directus_request with the appropriate endpoints.

4.1 Create Policies
Policy 1: Vendor Admin Policy

json
{
  "name": "Vendor Admin",
  "icon": "storefront",
  "description": "Full access to all vendor-owned data",
  "admin_access": false,
  "app_access": true,
  "permissions": [
    {
      "collection": "employees",
      "action": "create",
      "fields": ["*"],
      "item_rules": { "vendor_id": { "_eq": "$CURRENT_USER.vendor_id" } }
    },
    {
      "collection": "employees",
      "action": "read",
      "fields": ["*"],
      "item_rules": { "vendor_id": { "_eq": "$CURRENT_USER.vendor_id" } }
    },
    {
      "collection": "employees",
      "action": "update",
      "fields": ["*"],
      "item_rules": { "vendor_id": { "_eq": "$CURRENT_USER.vendor_id" } }
    },
    {
      "collection": "employees",
      "action": "delete",
      "fields": ["*"],
      "item_rules": { "vendor_id": { "_eq": "$CURRENT_USER.vendor_id" } }
    },
    // Repeat for employee_services, employee_schedules, bookings with same item rule
    // For bookings, also allow create/read/update/delete with vendor_id filter
    {
      "collection": "vendors",
      "action": "read",
      "fields": ["*"],
      "item_rules": { "id": { "_eq": "$CURRENT_USER.vendor_id" } }
    }
  ]
}
Policy 2: Employee Policy

json
{
  "name": "Employee",
  "icon": "badge",
  "description": "View own schedule and bookings",
  "admin_access": false,
  "app_access": true,
  "permissions": [
    {
      "collection": "employee_schedules",
      "action": "read",
      "fields": ["*"],
      "item_rules": { "employee_id": { "_eq": "$CURRENT_USER.employee_id" } }
    },
    {
      "collection": "employee_schedules",
      "action": "update",
      "fields": ["*"],
      "item_rules": { "employee_id": { "_eq": "$CURRENT_USER.employee_id" } }
    },
    {
      "collection": "bookings",
      "action": "read",
      "fields": ["*"],
      "item_rules": { "employee_id": { "_eq": "$CURRENT_USER.employee_id" } }
    },
    {
      "collection": "employee_services",
      "action": "read",
      "fields": ["*"],
      "item_rules": { "employee_id": { "_eq": "$CURRENT_USER.employee_id" } }
    }
  ]
}
Policy 3: Public Policy

json
{
  "name": "Public",
  "icon": "public",
  "description": "Read-only access for public listing and booking creation",
  "admin_access": false,
  "app_access": false,
  "permissions": [
    {
      "collection": "employees",
      "action": "read",
      "fields": ["*"],
      "item_rules": null
    },
    {
      "collection": "employee_services",
      "action": "read",
      "fields": ["*"],
      "item_rules": null
    },
    {
      "collection": "employee_schedules",
      "action": "read",
      "fields": ["*"],
      "item_rules": null
    },
    {
      "collection": "bookings",
      "action": "create",
      "fields": ["booker_email", "booker_name", "employee_id", "employee_service_id", "start_datetime", "end_datetime", "notes"],
      "item_rules": null
    }
  ]
}
4.2 Create Roles
Create roles using directus_create_role:

Vendor Admin Role

json
{
  "name": "Vendor Admin",
  "icon": "storefront",
  "description": "Salon owners who manage their business",
  "policies": ["<policy_id_of_vendor_admin>"]
}
Employee Role

json
{
  "name": "Employee",
  "icon": "badge",
  "description": "Salon staff with personal dashboard",
  "policies": ["<policy_id_of_employee>"]
}
Public Role (may already exist; if not, create it)

json
{
  "name": "Public",
  "icon": "public",
  "description": "Unauthenticated users",
  "policies": ["<policy_id_of_public>"]
}
4.3 Assign Policies to Roles
When creating roles, include the policies array with the policy IDs. If you need to assign a policy to an existing role, use PATCH /roles/{id} with the policy IDs.

Step 5: Create Dashboards (Insights)
Note: If MCP does not have dashboard/panel creation tools, provide instructions for manual creation in Directus UI after the setup. If tools exist, use them.

Vendor Dashboard
Name: "Vendor Portal"

Panels (Insights):

Metric: Total Appointments → count(bookings)
Metric: Total Revenue → sum(bookings.amount)
Metric: Active Employees → count(employees)
Metric: Active Services → count(employee_services)
Bar chart: Appointments per Employee
Bar chart: Revenue per Employee
Bar chart: Bookings by Service Type
Line chart: Bookings by Date (last 30 days)
Data table: Recent Bookings (with status)
Data table: Top Services (by booking count)
All panels filtered by vendor_id.

Employee Dashboard
Name: "My Schedule"

Panels:

Calendar Layout on bookings (start=start_datetime, end=end_datetime)
Metric: My Appointments → count(bookings where employee_id matches)
Metric: Upcoming (next 7 days) → count(bookings with start_datetime in next 7 days)
Metric: My Revenue → sum(amount)
Data table: Upcoming Bookings (with service name, price, date)
All panels filtered by employee_id.

Step 6: Create Flows
Use directus_create_flow and directus_create_operation.

Flow: Booking Created
Trigger: event = items.create on collection bookings.

Operations:

Read Item (type read) – fetch the service using employee_service_id to get price and duration_minutes.
Update Item (type update) – set amount to service price, and calculate end_datetime = start_datetime + duration_minutes (optional; frontend may already send end_datetime).
Run Script (type script) – overlap check:
javascript
const existing = await $directus.items('bookings').readByQuery({
  filter: {
    employee_id: { _eq: payload.employee_id },
    start_datetime: { _lt: payload.end_datetime },
    end_datetime: { _gt: payload.start_datetime },
    status: { _neq: 'cancelled' }
  }
});
if (existing.data.length > 0) {
  throw new Error('Slot no longer available');
}
Send Email (type email) – send to booker_email and to employee's email (lookup from employees using employee_id).
Update Item (type update) – set status = "confirmed".
Flow: Booking Cancelled (optional)
Trigger: event = items.update on bookings with condition: status changed to "cancelled".

Operation: Send Email – notify booker and employee.

Step 7: Final Checks
Verify that all collections and fields are created.

Ensure relationships are correct (M2O).

Test policies by creating users with the assigned roles and checking their API access.

Manually create a test booking to see if Flow executes.

Notes for MCP Usage
If any MCP tool is unavailable, fall back to generating raw API requests (using directus_request with appropriate method/path) or provide manual instructions.

Always use the latest Directus API version. The MCP should handle authentication automatically.

For policies, the permissions array must follow the structure described in the Permissions API. Use directus_create_permission if available, or combine policy creation with permissions in one call as shown above.

This completes the Directus configuration. The custom Next.js frontend can now be built to consume these collections and provide the customer booking experience.

text

---

These files now incorporate the official Directus documentation on access control, using policies and roles as the building blocks. They are ready for use with the Directus MCP.