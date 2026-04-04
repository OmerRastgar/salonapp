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
('f1111111-1234-4321-8888-111111111111', 'local', 'hair-salon-cat.png', 'hair-salon-cat.png', 'Hair Salon Icon', 'image/png', 400000),
('f2222222-1234-4321-8888-222222222222', 'local', 'barber-cat.png', 'barber-cat.png', 'Barber Icon', 'image/png', 400000),
('f3333333-1234-4321-8888-333333333333', 'local', 'spa-cat.png', 'spa-cat.png', 'Spa Icon', 'image/png', 400000),
('f4444444-1234-4321-8888-444444444444', 'local', 'nail-salon-cat.png', 'nail-salon-cat.png', 'Nail Salon Icon', 'image/png', 400000),
('69cc18eb-4ea2-6028-ed15-6713bb10d0cb', 'local', 'modern-barber-interior.png', 'modern-barber-interior.png', 'Modern Barber Interior', 'image/png', 1000000),
('79b2b8d5-9a06-bd20-2a06-bd202a06bd20', 'local', 'luxury-hair-salon.png', 'luxury-hair-salon.png', 'Luxury Hair Salon', 'image/png', 1000000),
('36c1442c-1762-7790-336c-1442c1762779', 'local', 'serene-spa-interior.png', 'serene-spa-interior.png', 'Serene Spa Interior', 'image/png', 1000000),
('4d3cd477-c091-5dd4-c091-5dd4c0915dd4', 'local', 'nail-salon-interior.png', 'nail-salon-interior.png', 'Nail Salon Interior', 'image/png', 1000000),
('e1111111-1234-4321-8888-111111111111', 'local', 'barber-portrait-1.png', 'barber-portrait-1.png', 'Barber Profile 1', 'image/png', 400000),
('e2222222-1234-4321-8888-222222222222', 'local', 'stylist-portrait-1.png', 'stylist-portrait-1.png', 'Stylist Profile 1', 'image/png', 400000),
('e3333333-1234-4321-8888-333333333333', 'local', 'therapist-portrait-1.png', 'therapist-portrait-1.png', 'Therapist Profile 1', 'image/png', 400000),
('e4444444-1234-4321-8888-444444444444', 'local', 'aesthetician-portrait-1.png', 'aesthetician-portrait-1.png', 'Nail Artist Profile 1', 'image/png', 400000)
ON CONFLICT (id) DO UPDATE SET filename_disk = EXCLUDED.filename_disk;

INSERT INTO categories (id, name, slug, image, status) VALUES
('c1111111-1111-4000-a001-000000000001', 'Hair Salon', 'hair-salon', 'f1111111-1234-4321-8888-111111111111', 'active'),
('c1111111-1111-4000-a002-000000000002', 'Barber', 'barber', 'f2222222-1234-4321-8888-222222222222', 'active'),
('c1111111-1111-4000-a003-000000000003', 'Spa', 'spa', 'f3333333-1234-4321-8888-333333333333', 'active'),
('c1111111-1111-4000-a004-000000000004', 'Nail Salon', 'nail-salon', 'f4444444-1234-4321-8888-444444444444', 'active');

INSERT INTO locations (id, name, slug, status) VALUES
('d1111111-1111-4000-f001-000000000001', 'Karachi', 'karachi', 'active'),
('d1111111-1111-4000-f002-000000000002', 'Lahore', 'lahore', 'active'),
('d1111111-1111-4000-f003-000000000003', 'Islamabad', 'islamabad', 'active');

-- 3. VENDORS (STRICT COORDINATES + RICH DATA)
INSERT INTO vendors (id, name, slug, description, cover_image, city, area, address, latitude, longitude, is_featured, is_verified, status, rating, reviews_count) VALUES
('fb000000-0000-4000-0001-000000000001', 'Capital Barber Studio', 'barber-studio', 'Capital Barber Studio is Lahore’s premier destination for traditional grooming with a modern edge. Our master barbers specialize in signature fades and professional beard grooming. We pride ourselves on creating a social sanctuary where style meets relaxation for the modern gentleman.', '69cc18eb-4ea2-6028-ed15-6713bb10d0cb', 'Lahore', 'Johar Town', 'Block H-3, Johar Town', 31.4697, 74.2728, true, true, 'active', 4.9, 120),
('fb000000-0000-4000-0002-000000000002', 'Luxe Hair & Style', 'luxe-hair', 'Luxe Hair & Style sets the standard for high-fashion salon experiences in Islamabad. Using only the finest international products, our boutique salon offers hair coloring, transformative cutting techniques, and luxury styling. Our team of stylists is dedicated to perfecting your unique look.', '79b2b8d5-9a06-bd20-2a06-bd202a06bd20', 'Islamabad', 'F-7', 'F-7 Markaz', 33.7200, 73.0600, true, true, 'active', 5.0, 85),
('fb000000-0000-4000-0003-000000000003', 'Serene Wellness Spa', 'serene-spa', 'Escape the city at Serene Wellness Spa, Karachi’s ultimate zen sanctuary. Our spa offers a comprehensive range of traditional and modern wellness therapies, from deep-tissue Swedish massages to revitalizing facials. Experience true serenity in an atmosphere designed to rejuvenate the body and mind.', '36c1442c-1762-7790-336c-1442c1762779', 'Karachi', 'DHA', 'Phase 6, DHA', 24.8100, 67.0500, true, true, 'active', 4.8, 200),
('fb000000-0000-4000-0004-000000000004', 'Oasis Nail Bar', 'oasis-nails', 'Oasis Nail Bar brings luxury nail artistry to the heart of Clifton. From professional manicures to custom-painted nail art, our technicians provide a pampering experience that focuses on health and beauty. We use non-toxic, premium lacquers to ensure a flawless finish every time.', '4d3cd477-c091-5dd4-c091-5dd4c0915dd4', 'Karachi', 'Clifton', 'Block 5, Clifton', 24.8138, 67.0267, true, true, 'active', 4.9, 45);

INSERT INTO vendor_categories (vendors_id, categories_id) VALUES
('fb000000-0000-4000-0001-000000000001', 'c1111111-1111-4000-a002-000000000002'),
('fb000000-0000-4000-0002-000000000002', 'c1111111-1111-4000-a001-000000000001'),
('fb000000-0000-4000-0003-000000000003', 'c1111111-1111-4000-a003-000000000003'),
('fb000000-0000-4000-0004-000000000004', 'c1111111-1111-4000-a004-000000000004');

INSERT INTO working_hours (id, vendor_id, day_of_week, open_time, close_time, is_closed) 
SELECT gen_random_uuid(), v.id, d, '09:00:00', '21:00:00', false FROM vendors v, generate_series(0, 6) d;

-- 4. STAFF & SERVICES
INSERT INTO employees (id, vendor_id, name, photo, bio, status, sort_order, rating, reviews_count) VALUES
('fe000000-0000-4000-e001-000000000001', 'fb000000-0000-4000-0001-000000000001', 'Ahmed', 'e1111111-1234-4321-8888-111111111111', 'Master Barber Ahmed brings over 10 years of experience in razor-sharp fades and traditional hot-towel shaves. He specializes in bespoke grooming for the modern entrepreneur.', 'active', 1, 4.9, 50),
('fe000000-0000-4000-e002-000000000002', 'fb000000-0000-4000-0002-000000000002', 'Sarah', 'e2222222-1234-4321-8888-222222222222', 'Sarah is a certified stylist and colorist known for her creative balayage and luxury bridal styling. She has trained at top international academies to bring the best to Islamabad.', 'active', 1, 5.0, 40),
('fe000000-0000-4000-e003-000000000003', 'fb000000-0000-4000-0003-000000000003', 'Omar', 'e3333333-1234-4321-8888-333333333333', 'Expert message therapist Omar specializes in Deep Tissue and Remedial therapies. His hollistic approach focuses on tension relief and muscular recovery for long-term health.', 'active', 1, 4.8, 30),
('fe000000-0000-4000-e004-000000000004', 'fb000000-0000-4000-0004-000000000004', 'Elena', 'e4444444-1234-4321-8888-444444444444', 'Elena is an award-winning nail artist and aesthetician. With an eye for detail, she creates unique hand-painted art and ensures the highest standards of nail health.', 'active', 1, 4.9, 20);

INSERT INTO employee_services (id, employee_id, name, price, duration_minutes, is_active) VALUES
(gen_random_uuid(), 'fe000000-0000-4000-e001-000000000001', 'Signature Cut', 2000, 45, true),
(gen_random_uuid(), 'fe000000-0000-4000-e002-000000000002', 'Luxury Styling', 3000, 60, true),
(gen_random_uuid(), 'fe000000-0000-4000-e003-000000000003', 'Swedish Massage', 5000, 60, true),
(gen_random_uuid(), 'fe000000-0000-4000-e004-000000000004', 'Royal Pedicure', 4000, 60, true);

-- 5. FUNCTIONAL BOOKING (ENHANCED AVAILABILITY)
INSERT INTO employee_schedules (id, employee_id, day_of_week, start_time, end_time, is_closed)
SELECT gen_random_uuid(), e.id, d, '09:00:00', '21:00:00', false FROM employees e cross join generate_series(0, 6) d;

-- 6. PERMISSIONS (PUBLIC READ)
DO $$ 
DECLARE
    target_collections text[] := ARRAY['vendors', 'categories', 'employees', 'locations', 'reviews', 'working_hours', 'directus_files', 'vendor_categories', 'employee_services', 'employee_schedules'];
    coll text;
    p record;
BEGIN
    -- 1. WIPE THE SLATE (Global cleanup of any conflicting marketplace rules)
    DELETE FROM directus_permissions WHERE collection = ANY(target_collections) AND action = 'read';

    -- 2. "GLOBAL REVEAL" (Force every policy to show everything)
    FOR p IN SELECT id FROM directus_policies LOOP
        -- Ensure policy is active
        UPDATE directus_policies SET status = 'active' WHERE id = p.id;
        
        FOREACH coll IN ARRAY target_collections LOOP
            -- We inject the permission with '*' to cover simple string versions
            INSERT INTO directus_permissions (policy, collection, action, permissions, validation, fields)
            VALUES (p.id, coll, 'read', '{}', '{}', '*')
            ON CONFLICT DO NOTHING;
            
            -- And we update it to an array '{*}' to cover Directus 11 array versions
            UPDATE directus_permissions SET fields = ARRAY['*'] WHERE policy = p.id AND collection = coll AND action = 'read';
        END LOOP;
    END LOOP;
    
    -- 3. ENSURE ACTIVE STATUS: Force all salons to be visible
    UPDATE vendors SET status = 'active';
END $$;

-- Locations Seeding
INSERT INTO locations (id, name, slug, status, sort_order) VALUES
('d1111111-1111-4000-f001-000000000001', 'Karachi', 'karachi', 'active', 1),
('d1111111-1111-4000-f002-000000000002', 'Lahore', 'lahore', 'active', 2),
('d1111111-1111-4000-f003-000000000003', 'Islamabad', 'islamabad', 'active', 3)
ON CONFLICT (id) DO NOTHING;

COMMIT;
