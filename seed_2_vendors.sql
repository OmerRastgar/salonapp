-- SEED 2: Vendors & Categories
INSERT INTO categories (id, name, slug, image, status) VALUES
('c1111111-1111-4000-a001-000000000001', 'Hair Salon', 'hair-salon', 'f1111111-1234-4321-8888-111111111111', 'active'),
('c1111111-1111-4000-a002-000000000002', 'Barber', 'barber', 'f2222222-1234-4321-8888-222222222222', 'active'),
('c1111111-1111-4000-a003-000000000003', 'Spa', 'spa', 'f3333333-1234-4321-8888-333333333333', 'active'),
('c1111111-1111-4000-a004-000000000004', 'Nail Salon', 'nail-salon', 'f4444444-1234-4321-8888-444444444444', 'active');

INSERT INTO locations (id, name, slug, status) VALUES ('l1111111-1111-4000-a001-000000000001', 'Karachi', 'karachi', 'active');

INSERT INTO directus_files (id, storage, filename_disk, filename_download, title, type) VALUES
('69cc18eb-4ea2-6028-ed15-6713bb10d0cb', 'local', 'modern-barber-interior.png', 'modern-barber-interior.png', 'Barber Shop Interior', 'image/png'),
('79b2b8d5-9a06-bd20-2a06-bd202a06bd20', 'local', 'luxury-hair-salon.png', 'luxury-hair-salon.png', 'Hair Salon Interior', 'image/png'),
('36c1442c-1762-7790-336c-1442c1762779', 'local', 'serene-spa-interior.png', 'serene-spa-interior.png', 'Spa Interior', 'image/png'),
('4d3cd477-c091-5dd4-c091-5dd4c0915dd4', 'local', 'nail-salon-interior.png', 'nail-salon-interior.png', 'Nail Lab Interior', 'image/png'),
('f1111111-1234-4321-8888-111111111111', 'local', 'hair-salon-cat.png', 'hair-salon-cat.png', 'Hair Icon', 'image/png'),
('f2222222-1234-4321-8888-222222222222', 'local', 'barber-cat.png', 'barber-cat.png', 'Barber Icon', 'image/png'),
('f3333333-1234-4321-8888-333333333333', 'local', 'spa-cat.png', 'spa-cat.png', 'Spa Icon', 'image/png'),
('f4444444-1234-4321-8888-444444444444', 'local', 'nail-salon-cat.png', 'nail-salon-cat.png', 'Nail Icon', 'image/png')
ON CONFLICT (id) DO UPDATE SET filename_disk = EXCLUDED.filename_disk;

INSERT INTO vendors (id, name, slug, description, cover_image, city, area, address, latitude, longitude, is_featured, is_verified, status) VALUES
('v1111111-1111-4000-c001-000000000001', 'Capital Barber Studio', 'barber-studio', 'Premium grooming services for the modern gentleman. Experience traditional barbering with contemporary techniques.', '69cc18eb-4ea2-6028-ed15-6713bb10d0cb', 'Karachi', 'Clifton', 'Block 5, Clifton, Karachi', 24.8136, 67.0482, true, true, 'active'),
('v2222222-1111-4000-c002-000000000002', 'Luxe Hair Studio', 'luxe-hair', 'Premier hair styling and coloring services. Our expert stylists create the perfect look for you.', '79b2b8d5-9a06-bd20-2a06-bd202a06bd20', 'Karachi', 'Defence', 'Phase 5, Defence Housing Authority, Karachi', 24.8268, 67.0845, true, true, 'active'),
('v3331111-1111-4000-c003-000000000003', 'Serenity Wellness', 'serene-spa', 'Zen spa sanctuary offering complete relaxation and rejuvenation therapies.', '36c1442c-1762-7790-336c-1442c1762779', 'Karachi', 'Gulshan', 'Gulshan-e-Iqbal, Block 13, Karachi', 24.9336, 67.1124, true, true, 'active'),
('v4441111-1111-4000-c004-000000000004', 'Oasis Nail Bar', 'oasis-nail-bar', 'Artisan nail art and premium manicure/pedicure services in a luxurious setting.', '4d3cd477-c091-5dd4-c091-5dd4c0915dd4', 'Karachi', 'Bahadurabad', 'Bahadurabad Commercial Area, Karachi', 24.8637, 67.0589, true, true, 'active');

INSERT INTO vendor_categories (vendors_id, categories_id) VALUES
('v1111111-1111-4000-c001-000000000001', 'c1111111-1111-4000-a002-000000000002'),
('v2222222-1111-4000-c002-000000000002', 'c1111111-1111-4000-a001-000000000001');
