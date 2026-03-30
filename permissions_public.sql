-- Grant Public Permissions for Salon Marketplace
-- Policy: abf8a154-5b1c-4a46-ac9c-7300570f4f17 ($t:public_label)

BEGIN;

DELETE FROM directus_permissions WHERE policy = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

-- Read Permissions (All Public Data)
INSERT INTO directus_permissions (policy, collection, action, fields, permissions, validation, presets) VALUES 
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendors', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'categories', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'locations', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employees', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_services', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_schedules', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'working_hours', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendor_categories', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'reviews', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'directus_files', 'read', '*', '{}', '{}', '{}');

-- Create Permissions (Bookings)
INSERT INTO directus_permissions (policy, collection, action, fields, permissions, validation, presets) VALUES 
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'bookings', 'create', 'booker_email,booker_name,employee_id,employee_service_id,start_datetime,end_datetime,notes', '{}', '{}', '{}');

COMMIT;
