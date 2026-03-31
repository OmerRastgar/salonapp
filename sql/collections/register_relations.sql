-- Register Relations in Directus Metadata (Directus 11 Version)

BEGIN;

DELETE FROM directus_relations WHERE many_collection IN ('vendor_categories', 'employees', 'employee_services', 'employee_schedules', 'working_hours', 'bookings', 'reviews', 'employee_reviews');

-- M2O: employees -> vendors
INSERT INTO directus_relations (many_collection, many_field, one_collection) VALUES 
('employees', 'vendor_id', 'vendors');

-- M2O: employee_services -> employees
INSERT INTO directus_relations (many_collection, many_field, one_collection) VALUES 
('employee_services', 'employee_id', 'employees');

-- M2O: employee_schedules -> employees
INSERT INTO directus_relations (many_collection, many_field, one_collection) VALUES 
('employee_schedules', 'employee_id', 'employees');

-- M2O: working_hours -> vendors
INSERT INTO directus_relations (many_collection, many_field, one_collection) VALUES 
('working_hours', 'vendor_id', 'vendors');

-- M2O: bookings
INSERT INTO directus_relations (many_collection, many_field, one_collection) VALUES 
('bookings', 'vendor_id', 'vendors'),
('bookings', 'employee_id', 'employees'),
('bookings', 'employee_service_id', 'employee_services');

-- M2O: reviews -> vendors
INSERT INTO directus_relations (many_collection, many_field, one_collection) VALUES 
('reviews', 'vendor_id', 'vendors');

-- M2O: employee_reviews -> employees
INSERT INTO directus_relations (many_collection, many_field, one_collection) VALUES
('employee_reviews', 'employee_id', 'employees');

-- M2M: vendors <-> categories (via vendor_categories)
-- One side: categories
INSERT INTO directus_relations (many_collection, many_field, one_collection, junction_field) VALUES 
('vendor_categories', 'categories_id', 'categories', 'vendors_id');

-- Other side: vendors
-- In Directus, the "M2M" field is often virtual but requires a relation entry.
-- We'll just define the junction relations.
INSERT INTO directus_relations (many_collection, many_field, one_collection, junction_field) VALUES 
('vendor_categories', 'vendors_id', 'vendors', 'categories_id');

COMMIT;
