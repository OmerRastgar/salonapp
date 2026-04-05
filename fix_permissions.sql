-- NUCLEAR PERMISSION REPAIR
-- This script grants full read access to all marketplace collections for EVERY non-admin policy.
-- Run this if you are still getting 403 Forbidden errors.

DO $$ 
DECLARE
    -- Collections that form the core of the Marketplace
    read_collections text[] := ARRAY[
        'vendors', 'categories', 'employees', 'locations', 'reviews', 
        'working_hours', 'directus_files', 'directus_folders', 
        'vendor_categories', 'employee_services', 'employee_schedules', 'bookings',
        'directus_collections', 'directus_fields', 'directus_relations', 'directus_presets'
    ];
    -- Interactions permitted for public visitors
    create_collections text[] := ARRAY['reviews', 'bookings'];
    
    p record;
    v_id_type text;
    coll text;
BEGIN
    -- 1. DETECT PERMISSION TABLE SCHEMA
    SELECT data_type INTO v_id_type FROM information_schema.columns 
    WHERE table_name = 'directus_permissions' AND column_name = 'id';

    -- 2. LOOP THROUGH ALL NON-ADMIN POLICIES
    FOR p IN SELECT id, name FROM directus_policies WHERE admin_access = false LOOP
        RAISE NOTICE 'Repairing Policy: % (%)', p.name, p.id;

        -- Cleanup existing to avoid duplicates
        DELETE FROM directus_permissions WHERE policy = p.id AND collection = ANY(read_collections);

        -- Grant Read
        FOREACH coll IN ARRAY read_collections LOOP
            IF v_id_type = 'integer' THEN
                INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
                VALUES (p.id, coll, 'read', '{}', '{}', ARRAY['*']);
            ELSE
                INSERT INTO directus_permissions (id, policy, collection, action, permissions, validation, fields)
                VALUES (gen_random_uuid(), p.id, coll, 'read', '{}', '{}', ARRAY['*']);
            END IF;
        END LOOP;

        -- Grant Create
        FOREACH coll IN ARRAY create_collections LOOP
            IF v_id_type = 'integer' THEN
                INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
                VALUES (p.id, coll, 'create', '{}', '{}', ARRAY['*']);
            ELSE
                INSERT INTO directus_permissions (id, policy, collection, action, permissions, validation, fields)
                VALUES (gen_random_uuid(), p.id, coll, 'create', '{}', '{}', ARRAY['*']);
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Success: Nuclear permission repair complete for all active policies.';
END $$;
