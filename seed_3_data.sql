-- SEED 3: Hours & Services
INSERT INTO working_hours (id, vendor_id, day_of_week, open_time, close_time, is_closed) VALUES
(gen_random_uuid(), 'v1111111-1111-4000-c001-000000000001', 1, '10:00:00', '21:00:00', false),
(gen_random_uuid(), 'v2222222-1111-4000-c002-000000000002', 1, '10:00:00', '21:00:00', false),
(gen_random_uuid(), 'v3331111-1111-4000-c003-000000000003', 1, '10:00:00', '21:00:00', false),
(gen_random_uuid(), 'v4441111-1111-4000-c004-000000000004', 1, '10:00:00', '21:00:00', false);

INSERT INTO employees (id, vendor_id, name, photo, status) VALUES
('e1111111-1111-4000-e001-000000000001', 'v1111111-1111-4000-c001-000000000001', 'Siddiq Ali', 'e1111111-1234-4321-b001-111111111111', 'active');

INSERT INTO employee_services (id, employee_id, name, price, duration_minutes, is_active) VALUES
(gen_random_uuid(), 'e1111111-1111-4000-e001-000000000001', 'Signature Cut', 1200, 45, true);

INSERT INTO reviews (id, vendor_id, customer_name, rating, comment, status) VALUES
(gen_random_uuid(), 'v1111111-1111-4000-c001-000000000001', 'Ali Hassan', 5, 'Great fade!', 'published');
