-- Register Collections in Directus Metadata (Directus 11 Version)

BEGIN;

DELETE FROM directus_collections WHERE collection IN ('vendors', 'categories', 'locations', 'employees', 'employee_services', 'employee_schedules', 'working_hours', 'bookings', 'reviews', 'employee_reviews', 'vendor_categories', 'app_metrics', 'business_leads');
DELETE FROM directus_fields WHERE collection = 'employees' AND field = 'services';

INSERT INTO directus_collections (collection, icon, display_template, accountability, archive_app_filter, archive_field, archive_value, unarchive_value) VALUES 
('vendors', 'storefront', '{{name}}', 'all', false, NULL, NULL, NULL),
('categories', 'category', '{{name}}', 'all', false, NULL, NULL, NULL),
('locations', 'place', '{{name}}', 'all', false, NULL, NULL, NULL),
('employees', 'person', '{{name}}', 'all', false, NULL, NULL, NULL),
('employee_services', 'local_offer', '{{name}} ({{duration_minutes}}min - {{price}})', 'all', true, 'is_active', 'false', 'true'),
('employee_schedules', 'schedule', '{{day_of_week}}: {{start_time}} - {{end_time}}', 'all', false, NULL, NULL, NULL),
('working_hours', 'timer', '{{day_of_week}}: {{open_time}} - {{close_time}}', 'all', false, NULL, NULL, NULL),
('bookings', 'event', '{{employee_id.name}} - {{booker_name}} ({{start_datetime}})', 'all', true, 'status', 'cancelled', 'confirmed'),
('reviews', 'star', '{{customer_name}} ({{rating}}/5)', 'all', false, NULL, NULL, NULL),
('employee_reviews', 'reviews', '{{customer_name}} ({{rating}}/5)', 'all', false, NULL, NULL, NULL),
('vendor_categories', 'settings_input_component', '{{vendors_id.name}} - {{categories_id.name}}', 'all', false, NULL, NULL, NULL),
('app_metrics', 'query_stats', '{{metric_key}}: {{appointments_booked}}', 'all', false, NULL, NULL, NULL),
('business_leads', 'contact_page', '{{business_name}} - {{contact_person}}', 'all', true, 'status', 'rejected', 'pending');

COMMIT;
