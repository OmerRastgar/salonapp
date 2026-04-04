-- ULTIMATE SEED v7.7 (GEO-FIXED + RICH DATA + SCHEDULES)
BEGIN;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image uuid;

-- 1. CLEAN
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE working_hours CASCADE;
TRUNCATE TABLE employee_services CASCADE;
TRUNCATE TABLE employee_schedules CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE vendor_categories CASCADE;
TRUNCATE TABLE vendors CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE locations CASCADE;

-- 2. INFRASTRUCTURE & ASSETS
INSERT INTO directus_files (id, storage, filename_disk, filename_download, title, type, filesize) VALUES
('f1111111-1234-4321-8888-111111111111', 'local', 'hair-salon-cat.png', 'hair-salon-cat.png', 'Hair Salon Icon', 'image/png', 707850),
('f2222222-1234-4321-8888-222222222222', 'local', 'barber-cat.png', 'barber-cat.png', 'Barber Icon', 'image/png', 856802),
('f3333333-1234-4321-8888-333333333333', 'local', 'spa-cat.png', 'spa-cat.png', 'Spa Icon', 'image/png', 870538),
('f4444444-1234-4321-8888-444444444444', 'local', 'nail-salon-cat.png', 'nail-salon-cat.png', 'Nail Salon Icon', 'image/png', 734207),
('69cc18eb-4ea2-6028-ed15-6713bb10d0cb', 'local', 'modern-barber-interior.png', 'modern-barber-interior.png', 'Modern Barber Interior', 'image/png', 906657),
('79b2b8d5-9a06-bd20-2a06-bd202a06bd20', 'local', 'luxury-hair-salon.png', 'luxury-hair-salon.png', 'Luxury Hair Salon', 'image/png', 820943),
('36c1442c-1762-7790-336c-1442c1762779', 'local', 'serene-spa-interior.png', 'serene-spa-interior.png', 'Serene Spa Interior', 'image/png', 759622),
('4d3cd477-c091-5dd4-c091-5dd4c0915dd4', 'local', 'nail-salon-interior.png', 'nail-salon-interior.png', 'Nail Salon Interior', 'image/png', 885274),
('e1111111-1234-4321-8888-111111111111', 'local', 'barber-1.png', 'barber-1.png', 'Barber Profile 1', 'image/png', 767690),
('e2222222-1234-4321-8888-222222222222', 'local', 'stylist-1.png', 'stylist-1.png', 'Stylist Profile 1', 'image/png', 736350),
('e3333333-1234-4321-8888-333333333333', 'local', 'therapist-1.png', 'therapist-1.png', 'Therapist Profile 1', 'image/png', 700154),
('e4444444-1234-4321-8888-444444444444', 'local', 'aesthetician-1.png', 'aesthetician-1.png', 'Nail Artist Profile 1', 'image/png', 645709),
-- GALLERY PLACEHOLDERS (Hardcoded in frontend VenueGallery.tsx)
('bf1e5cc1-dcfd-4867-b6dc-337192b3427c', 'local', 'glamour-salon-interior.jpg', 'glamour-salon-interior.jpg', 'Glamour Interior', 'image/jpeg', 2036362),
('060814e7-a997-4c9a-8b4f-6cac367003c5', 'local', 'modern-barber-shop.jpg', 'modern-barber-shop.jpg', 'Modern Barber Shop', 'image/jpeg', 2242382),
('48bbad28-4fca-47f5-9e6d-fd84be1f31a4', 'local', 'royal-beauty-lounge.jpg', 'royal-beauty-lounge.jpg', 'Royal Beauty Lounge', 'image/jpeg', 2890179),
('90238b8c-5931-4c60-9a52-a6f7e4399adb', 'local', 'glamour-salon-spa.jpg', 'glamour-salon-spa.jpg', 'Glamour Spa Interior', 'image/jpeg', 2036362),
('bd750759-f528-4961-8a50-370df6913738', 'local', 'luxury-beauty-studio.jpg', 'luxury-beauty-studio.jpg', 'Luxe Hair Interior', 'image/jpeg', 2890179)
ON CONFLICT (id) DO UPDATE SET filename_disk = EXCLUDED.filename_disk, filesize = EXCLUDED.filesize;

INSERT INTO categories (id, name, slug, image, status) VALUES
('c1111111-1111-4000-a001-000000000001', 'Hair Salon', 'hair-salon', 'f1111111-1234-4321-8888-111111111111', 'active'),
('c1111111-1111-4000-a002-000000000002', 'Barber', 'barber', 'f2222222-1234-4321-8888-222222222222', 'active'),
('c1111111-1111-4000-a003-000000000003', 'Spa', 'spa', 'f3333333-1234-4321-8888-333333333333', 'active'),
('c1111111-1111-4000-a004-000000000004', 'Nail Salon', 'nail-salon', 'f4444444-1234-4321-8888-444444444444', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, slug, status) VALUES
('d1111111-1111-4000-f001-000000000001', 'Karachi', 'karachi', 'active'),
('d1111111-1111-4000-f002-000000000002', 'Lahore', 'lahore', 'active'),
('d1111111-1111-4000-f003-000000000003', 'Islamabad', 'islamabad', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. VENDORS (STRICT COORDINATES + RICH DATA)
INSERT INTO vendors (id, name, slug, description, cover_image, city, area, address, latitude, longitude, is_featured, is_verified, status, rating, reviews_count) VALUES
('fb000000-0000-4000-0001-000000000001', 'Capital Barber Studio', 'barber-studio', 'Capital Barber Studio is Lahore’s premier destination for traditional grooming and precision **Hair Cut** services with a modern edge. Our master barbers specialize in signature fades, professional beard grooming, and classic shaves. We pride ourselves on creating a social sanctuary where style meets relaxation for the modern gentleman.', '69cc18eb-4ea2-6028-ed15-6713bb10d0cb', 'Lahore', 'Johar Town', 'Block H-3, Johar Town', 31.4697, 74.2728, true, true, 'active', 4.9, 120),
('fb000000-0000-4000-0002-000000000002', 'Luxe Hair & Style', 'luxe-hair', 'Luxe Hair & Style sets the standard for high-fashion salon experiences in Islamabad. Using only the finest international products, our boutique salon offers expert **Hair Cut**, **Hair Coloring**, transformative cutting techniques, and luxury styling. Our team of stylists is dedicated to perfecting your unique look.', '79b2b8d5-9a06-bd20-2a06-bd202a06bd20', 'Islamabad', 'F-7', 'F-7 Markaz', 33.7200, 73.0600, true, true, 'active', 5.0, 85),
('fb000000-0000-4000-0003-000000000003', 'Serene Wellness Spa', 'serene-spa', 'Escape the city at Serene Wellness Spa, Karachi’s ultimate zen sanctuary. Our spa offers a comprehensive range of traditional and modern wellness therapies, from professional **Massage**, deep-tissue Swedish treatments to revitalizing **Facial** care. Experience true serenity in an atmosphere designed to rejuvenate the body and mind.', '36c1442c-1762-7790-336c-1442c1762779', 'Karachi', 'DHA', 'Phase 6, DHA', 24.8100, 67.0500, true, true, 'active', 4.8, 200),
('fb000000-0000-4000-0004-000000000004', 'Oasis Nail Bar', 'oasis-nails', 'Oasis Nail Bar brings luxury nail artistry to the heart of Clifton. From professional **Manicure** to custom-painted nail art and **Pedicure**, our technicians provide a pampering experience that focuses on health and beauty. We use non-toxic, premium lacquers to ensure a flawless finish every time.', '4d3cd477-c091-5dd4-c091-5dd4c0915dd4', 'Karachi', 'Clifton', 'Block 5, Clifton', 24.8138, 67.0267, true, true, 'active', 4.9, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendor_categories (vendors_id, categories_id) VALUES
('fb000000-0000-4000-0001-000000000001', 'c1111111-1111-4000-a002-000000000002'),
('fb000000-0000-4000-0002-000000000002', 'c1111111-1111-4000-a001-000000000001'),
('fb000000-0000-4000-0003-000000000003', 'c1111111-1111-4000-a003-000000000003'),
('fb000000-0000-4000-0004-000000000004', 'c1111111-1111-4000-a004-000000000004')
ON CONFLICT DO NOTHING;

INSERT INTO working_hours (id, vendor_id, day_of_week, open_time, close_time, is_closed) 
SELECT gen_random_uuid(), v.id, d, '09:00:00', '21:00:00', false FROM vendors v, generate_series(0, 6) d
ON CONFLICT DO NOTHING;

-- 4. STAFF & SERVICES
INSERT INTO employees (id, vendor_id, name, photo, bio, status, sort_order, rating, reviews_count) VALUES
('fe000000-0000-4000-e001-000000000001', 'fb000000-0000-4000-0001-000000000001', 'Ahmed', 'e1111111-1234-4321-8888-111111111111', 'Master Barber Ahmed brings over 10 years of experience in razor-sharp fades and traditional hot-towel shaves. He specializes in bespoke grooming for the modern entrepreneur.', 'active', 1, 4.9, 50),
('fe000000-0000-4000-e002-000000000002', 'fb000000-0000-4000-0002-000000000002', 'Sarah', 'e2222222-1234-4321-8888-222222222222', 'Sarah is a certified stylist and colorist known for her creative balayage and luxury bridal styling. She has trained at top international academies to bring the best to Islamabad.', 'active', 1, 5.0, 40),
('fe000000-0000-4000-e003-000000000003', 'fb000000-0000-4000-0003-000000000003', 'Omar', 'e3333333-1234-4321-8888-333333333333', 'Expert message therapist Omar specializes in Deep Tissue and Remedial therapies. His hollistic approach focuses on tension relief and muscular recovery for long-term health.', 'active', 1, 4.8, 30),
('fe000000-0000-4000-e004-000000000004', 'fb000000-0000-4000-0004-000000000004', 'Elena', 'e4444444-1234-4321-8888-444444444444', 'Elena is an award-winning nail artist and aesthetician. With an eye for detail, she creates unique hand-painted art and ensures the highest standards of nail health.', 'active', 1, 4.9, 20)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employee_services (id, employee_id, name, price, duration_minutes, is_active) VALUES
(gen_random_uuid(), 'fe000000-0000-4000-e001-000000000001', 'Signature Cut', 2000, 45, true),
(gen_random_uuid(), 'fe000000-0000-4000-e002-000000000002', 'Luxury Styling', 3000, 60, true),
(gen_random_uuid(), 'fe000000-0000-4000-e003-000000000003', 'Swedish Massage', 5000, 60, true),
(gen_random_uuid(), 'fe000000-0000-4000-e004-000000000004', 'Royal Pedicure', 4000, 60, true);

-- 5. FUNCTIONAL BOOKING (ENHANCED AVAILABILITY)
INSERT INTO employee_schedules (id, employee_id, day_of_week, start_time, end_time, is_closed)
SELECT gen_random_uuid(), e.id, d, '09:00:00', '21:00:00', false FROM employees e cross join generate_series(0, 6) d;

-- 6. PERMISSIONS (FAIL-SAFE PUBLIC RESET)
DO $$ 
DECLARE
    -- Collections that must be PUBLICLY READABLE
    read_collections text[] := ARRAY[
        'vendors', 'categories', 'employees', 'locations', 'reviews', 
        'working_hours', 'directus_files', 'directus_folders', 
        'vendor_categories', 'employee_services', 'employee_schedules', 'bookings'
    ];
    -- Collections that must be PUBLICLY CREATABLE
    create_collections text[] := ARRAY['reviews', 'employee_reviews', 'bookings', 'contacts'];
    
    public_policy_id uuid;
    public_role_id uuid;
    coll text;
BEGIN
    -- 1. IDENTIFY OR CREATE THE PUBLIC POLICY
    SELECT id INTO public_policy_id FROM directus_policies WHERE name = 'Marketplace Public' LIMIT 1;
    
    IF public_policy_id IS NULL THEN
        public_policy_id := gen_random_uuid();
        INSERT INTO directus_policies (id, name, icon, description, ip_access, enforce_tfa, admin_access, app_access)
        VALUES (public_policy_id, 'Marketplace Public', 'public', 'Unrestricted read-only access for the marketplace', NULL, false, false, false);
        RAISE NOTICE 'CREATED new fail-safe Public Policy: %', public_policy_id;
    ELSE
        RAISE NOTICE 'VERIFIED existing Marketplace Public policy: %', public_policy_id;
    END IF;

    -- 2. IDENTIFY THE PUBLIC ROLE
    SELECT id INTO public_role_id FROM directus_roles WHERE name = 'Public' LIMIT 1;

    -- 3. FORCE-LINK THE POLICY TO THE PUBLIC ROLE
    IF public_role_id IS NOT NULL THEN
        -- Link the policy to the Public role specifically
        -- We delete first to ensure we don't have overlapping policies for the Public role
        DELETE FROM directus_access WHERE role = public_role_id;
        INSERT INTO directus_access (id, policy, role)
        VALUES (gen_random_uuid(), public_policy_id, public_role_id);
        
        -- Also link it to "No Role" (Anonymous) if applicable
        DELETE FROM directus_access WHERE role IS NULL AND "user" IS NULL;
        INSERT INTO directus_access (id, policy, role)
        VALUES (gen_random_uuid(), public_policy_id, NULL);
        
        RAISE NOTICE 'LINKED Public Role (%) to Policy (%)', public_role_id, public_policy_id;
    ELSE
        -- Fallback: Link to anonymous access only
        DELETE FROM directus_access WHERE role IS NULL AND "user" IS NULL;
        INSERT INTO directus_access (id, policy, role)
        VALUES (gen_random_uuid(), public_policy_id, NULL);
        RAISE WARNING 'Public Role not found! Linked policy to anonymous only.';
    END IF;

    -- 4. CLEANUP AND RESTORE PERMISSIONS (FULL REVEAL)
    DELETE FROM directus_permissions WHERE policy = public_policy_id AND collection = ANY(read_collections) AND action = 'read';
    DELETE FROM directus_permissions WHERE policy = public_policy_id AND collection = ANY(create_collections) AND action = 'create';

    FOREACH coll IN ARRAY read_collections LOOP
        INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
        VALUES (public_policy_id, coll, 'read', '{}', '{}', ARRAY['*']);
    END LOOP;
    
    FOREACH coll IN ARRAY create_collections LOOP
        INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
        VALUES (public_policy_id, coll, 'create', '{}', '{}', ARRAY['*']);
    END LOOP;

    -- 5. ENSURE ACTIVE STATUS
    UPDATE vendors SET status = 'active' WHERE status IS NULL OR status != 'active';
    UPDATE categories SET status = 'active' WHERE status IS NULL OR status != 'active';
    
    RAISE NOTICE 'SUCCESS: Public permissions restored for all collections.';
END $$;

-- Locations Seeding
INSERT INTO locations (id, name, slug, status, sort_order) VALUES
('d1111111-1111-4000-f001-000000000001', 'Karachi', 'karachi', 'active', 1),
('d1111111-1111-4000-f002-000000000002', 'Lahore', 'lahore', 'active', 2),
('d1111111-1111-4000-f003-000000000003', 'Islamabad', 'islamabad', 'active', 3)
ON CONFLICT (id) DO NOTHING;

COMMIT;
