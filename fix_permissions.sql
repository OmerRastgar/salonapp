-- FIX_PERMISSIONS.SQL
-- Run this to restore Public access to the marketplace without a full reseed.

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
    
    target_policy_id uuid;
    v_id_type text;
    coll text;
BEGIN
    -- 1. DETECT PERMISSION TABLE SCHEMA (UUID vs Integer)
    SELECT data_type INTO v_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'directus_permissions' AND column_name = 'id';

    -- 2. IDENTIFY PUBLIC POLICY
    SELECT a.policy INTO target_policy_id
    FROM directus_access a
    LEFT JOIN directus_roles r ON a.role = r.id
    WHERE r.name = 'Public' OR r.id = '192df901-9d32-45ec-9b4e-60faf5feac5c'
    LIMIT 1;

    -- Fallback
    IF target_policy_id IS NULL THEN
        SELECT id INTO target_policy_id FROM directus_policies WHERE admin_access = false AND app_access = false LIMIT 1;
    END IF;

    IF target_policy_id IS NOT NULL THEN
        RAISE NOTICE 'Targeting Policy: %', target_policy_id;

        -- Cleanup existing to avoid duplicates
        DELETE FROM directus_permissions WHERE policy = target_policy_id AND collection = ANY(read_collections);

        -- Grant Read
        FOREACH coll IN ARRAY read_collections LOOP
            IF v_id_type = 'integer' THEN
                INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
                VALUES (target_policy_id, coll, 'read', '{}', '{}', ARRAY['*']);
            ELSE
                INSERT INTO directus_permissions (id, policy, collection, action, permissions, validation, fields)
                VALUES (gen_random_uuid(), target_policy_id, coll, 'read', '{}', '{}', ARRAY['*']);
            END IF;
        END LOOP;

        -- Grant Create
        FOREACH coll IN ARRAY create_collections LOOP
            IF v_id_type = 'integer' THEN
                INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
                VALUES (target_policy_id, coll, 'create', '{}', '{}', ARRAY['*']);
            ELSE
                INSERT INTO directus_permissions (id, policy, collection, action, permissions, validation, fields)
                VALUES (gen_random_uuid(), target_policy_id, coll, 'create', '{}', '{}', ARRAY['*']);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Success: Permissions granted to policy %', target_policy_id;
    ELSE
        RAISE WARNING 'Could not identify a Public policy to repair.';
    END IF;
END $$;
