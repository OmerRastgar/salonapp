-- Check and Fix Public Permissions for Salon Marketplace
-- This script checks the current public role and fixes permissions

BEGIN;

-- First, let's see what roles exist
DO $$
DECLARE
    public_role_id UUID;
    public_policy_id UUID;
BEGIN
    -- Get the actual Public role ID
    SELECT id INTO public_role_id FROM directus_roles WHERE name = 'Public';
    
    IF public_role_id IS NULL THEN
        RAISE NOTICE 'Public role not found, creating it...';
        INSERT INTO directus_roles (id, name, icon, description, users_access, app_access, enforce_two_factor) 
        VALUES (gen_random_uuid(), 'Public', 'public', 'Public access for unauthenticated users', false, false, false)
        RETURNING id INTO public_role_id;
    END IF;
    
    RAISE NOTICE 'Public role ID: %', public_role_id;
    
    -- Create or update the Public Policy
    INSERT INTO directus_policies (id, name, icon, description, users, roles, ip_addresses, permissions, entity_permissions) 
    VALUES (
        gen_random_uuid(),
        'Public Access',
        'public',
        'Public access for marketplace frontend',
        '{}',
        jsonb_build_array(public_role_id),
        '{}',
        '{}',
        '{}'
    ) 
    ON CONFLICT (name) DO UPDATE SET
        icon = EXCLUDED.icon,
        description = EXCLUDED.description,
        roles = jsonb_build_array(public_role_id)
    RETURNING id INTO public_policy_id;
    
    RAISE NOTICE 'Public policy ID: %', public_policy_id;
    
    -- Clear existing permissions for this policy
    DELETE FROM directus_permissions WHERE policy = public_policy_id;
    
    -- Grant Read Permissions for Public Collections
    INSERT INTO directus_permissions (policy, collection, action, fields, permissions, validation, presets) VALUES 
    (public_policy_id, 'vendors', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'categories', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'locations', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'employees', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'employee_services', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'employee_schedules', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'employee_reviews', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'working_hours', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'vendor_categories', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'reviews', 'read', '*', '{}', '{}', '{}'),
    (public_policy_id, 'directus_files', 'read', '*', '{}', '{}', '{}');
    
    -- Grant Create Permissions for Public Forms
    INSERT INTO directus_permissions (policy, collection, action, fields, permissions, validation, presets) VALUES 
    (public_policy_id, 'bookings', 'create', 'vendor_id,booker_email,booker_name,employee_id,employee_service_id,start_datetime,end_datetime,notes', '{}', '{}', '{}'),
    (public_policy_id, 'reviews', 'create', 'vendor_id,customer_name,customer_email,rating,comment,is_verified,status', '{}', '{}', '{}'),
    (public_policy_id, 'employee_reviews', 'create', 'employee_id,customer_name,customer_email,rating,comment,is_verified,status', '{}', '{}', '{}'),
    (public_policy_id, 'business_leads', 'create', 'business_name,contact_person,phone,email,category,city,status,notes', '{}', '{}', '{}');
    
END $$;

COMMIT;
