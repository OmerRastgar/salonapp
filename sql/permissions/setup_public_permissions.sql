-- Setup Public Permissions for Salon Marketplace
-- This creates the public policy and assigns it to the Public role

BEGIN;

-- Create or update the Public Policy
INSERT INTO directus_policies (id, name, icon, description, users, roles, ip_addresses, permissions, entity_permissions) 
VALUES (
    'abf8a154-5b1c-4a46-ac9c-7300570f4f17',
    'Public Access',
    'public',
    'Public access for marketplace frontend',
    '{}',
    '{"c6c7b2a1-8f4e-4d7a-b3e2-9a8f7c6d5e4f"}',  -- Public Role ID
    '{}',
    '{}',
    '{}'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    roles = EXCLUDED.roles;

-- Clear existing permissions for this policy
DELETE FROM directus_permissions WHERE policy = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

-- Grant Read Permissions for Public Collections
INSERT INTO directus_permissions (policy, collection, action, fields, permissions, validation, presets) VALUES 
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendors', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'categories', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'locations', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employees', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_services', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_schedules', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_reviews', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'working_hours', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendor_categories', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'reviews', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'directus_files', 'read', '*', '{}', '{}', '{}');

-- Grant Create Permissions for Public Forms
INSERT INTO directus_permissions (policy, collection, action, fields, permissions, validation, presets) VALUES 
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'bookings', 'create', 'vendor_id,booker_email,booker_name,employee_id,employee_service_id,start_datetime,end_datetime,notes', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'reviews', 'create', 'vendor_id,customer_name,customer_email,rating,comment,is_verified,status', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_reviews', 'create', 'employee_id,customer_name,customer_email,rating,comment,is_verified,status', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'business_leads', 'create', 'business_name,contact_person,phone,email,category,city,status,notes', '{}', '{}', '{}');

COMMIT;
