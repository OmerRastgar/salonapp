
-- Grant public read access to pages and block collections
-- Public Role ID: 1192df901-9d32-45ec-9b4e-60faf5feac5c
-- Administrator Policy ID: 8688db16-4f8a-48bf-9272-35d5399d2c15

-- In Directus 11+, permissions are policy-based. The Public Role has a policy.
-- Let's find the policy ID assigned to the Public Role.
WITH public_policy AS (
    SELECT policy FROM directus_access WHERE role = '192df901-9d32-45ec-9b4e-60faf5feac5c' LIMIT 1
)
INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
SELECT (SELECT policy FROM public_policy), c, 'read', '{}', '{}', '*'
FROM (VALUES 
    ('pages'), 
    ('pages_blocks'), 
    ('block_hero'), 
    ('block_features'), 
    ('block_categories'), 
    ('block_cities'), 
    ('block_live_activity'), 
    ('block_business_form'),
    ('directus_files')
) AS collections(c)
ON CONFLICT (policy, collection, action) DO NOTHING;
