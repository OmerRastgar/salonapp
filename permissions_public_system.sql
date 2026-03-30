-- Grant Public Permissions for Salon Marketplace (Extended for System Metadata)
-- Policy: abf8a154-5b1c-4a46-ac9c-7300570f4f17 ($t:public_label)

BEGIN;

-- System Collections (Necessary for relational discovery and display templates)
INSERT INTO directus_permissions (policy, collection, action, fields, permissions, validation, presets) VALUES 
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'directus_collections', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'directus_fields', 'read', '*', '{}', '{}', '{}'),
('abf8a154-5b1c-4a46-ac9c-7300570f4f17', 'directus_relations', 'read', '*', '{}', '{}', '{}');

COMMIT;
