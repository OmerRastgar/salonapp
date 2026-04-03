
-- RESET PUBLIC PERMISSIONS
-- Policy: abf8a154-5b1c-4a46-ac9c-7300570f4f17 (for Public role)

-- 1. Delete Existing Public Permissions for Marketplace Collections
DELETE FROM directus_permissions WHERE policy = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17' AND collection IN ('vendors', 'categories', 'locations', 'reviews', 'employees', 'employee_services', 'vendor_categories', 'working_hours', 'directus_files');

-- 2. Grant Read Access
INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields) VALUES
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendors', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'categories', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'locations', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'reviews', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employees', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_services', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendor_categories', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'working_hours', 'read', '{}', '{}', '*'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'directus_files', 'read', '{}', '{}', '*');
