-- Set up permissions for business_leads collection

BEGIN;

-- Create permissions for Public role to create business leads
INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
VALUES (
    'business_leads',
    'create',
    '{}',
    '{}',
    '[]',
    '["*"]',
    (SELECT id FROM directus_policies WHERE name = '$t:public_label')
) ON CONFLICT DO NOTHING;

-- Create permissions for Public role to read business leads (their own only)
INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
VALUES (
    'business_leads',
    'read',
    '{}',
    '{}',
    '[]',
    '["*"]',
    (SELECT id FROM directus_policies WHERE name = '$t:public_label')
) ON CONFLICT DO NOTHING;

-- Create full permissions for Administrator role
INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
VALUES (
    'business_leads',
    'create',
    '{}',
    '{}',
    '[]',
    '["*"]',
    (SELECT id FROM directus_policies WHERE name = 'Administrator')
) ON CONFLICT DO NOTHING;

INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
VALUES (
    'business_leads',
    'read',
    '{}',
    '{}',
    '[]',
    '["*"]',
    (SELECT id FROM directus_policies WHERE name = 'Administrator')
) ON CONFLICT DO NOTHING;

INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
VALUES (
    'business_leads',
    'update',
    '{}',
    '{}',
    '[]',
    '["*"]',
    (SELECT id FROM directus_policies WHERE name = 'Administrator')
) ON CONFLICT DO NOTHING;

INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
VALUES (
    'business_leads',
    'delete',
    '{}',
    '{}',
    '[]',
    '["*"]',
    (SELECT id FROM directus_policies WHERE name = 'Administrator')
) ON CONFLICT DO NOTHING;

COMMIT;
