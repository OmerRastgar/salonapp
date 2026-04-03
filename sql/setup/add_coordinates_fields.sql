-- Add latitude/longitude fields to vendors table
ALTER TABLE vendors 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Register the new fields in Directus
INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
('vendors', 'latitude', NULL, 'numeric', NULL, NULL, false, false, 16, 'half', false),
('vendors', 'longitude', NULL, 'numeric', NULL, NULL, false, false, 17, 'half', false)
ON CONFLICT (collection, field) DO NOTHING;
