-- SEED 4: Permissions (Public Access Policy)
-- Ensure the policy abf8a154-5b1c-4a46-ac9c-7300570f4f17 (Public) can read all necessary items.
INSERT INTO directus_permissions (policy, collection, action, permissions, validation) VALUES
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendors', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'categories', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'vendor_categories', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'directus_files', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'working_hours', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employees', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_services', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'reviews', 'read', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'reviews', 'create', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'employee_reviews', 'create', '{}', '{}')
ON CONFLICT DO NOTHING;
