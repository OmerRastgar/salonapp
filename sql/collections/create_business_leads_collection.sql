-- Create business_leads collection and register it in Directus

BEGIN;

-- Create the table
CREATE TABLE IF NOT EXISTS business_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Register the collection in Directus metadata
DELETE FROM directus_collections WHERE collection = 'business_leads';

INSERT INTO directus_collections (collection, icon, display_template, accountability, archive_app_filter, archive_field, archive_value, unarchive_value) VALUES 
('business_leads', 'contact_page', '{{business_name}} - {{contact_person}}', 'all', true, 'status', 'rejected', 'pending');

-- Register fields for the collection
DELETE FROM directus_fields WHERE collection = 'business_leads';

INSERT INTO directus_fields (collection, field, special, interface, options, display, display_options, readonly, hidden, sort, width, translations, note, conditions, required, "group", validation, validation_message) VALUES 
-- Primary key
('business_leads', 'id', 'uuid', 'input', NULL, NULL, NULL, false, true, 1, 'full', NULL, NULL, NULL, false, NULL, NULL, NULL),

-- Business information
('business_leads', 'business_name', NULL, 'input', NULL, NULL, NULL, false, false, 2, 'full', NULL, NULL, NULL, true, NULL, NULL, NULL),
('business_leads', 'contact_person', NULL, 'input', NULL, NULL, NULL, false, false, 3, 'full', NULL, NULL, NULL, true, NULL, NULL, NULL),
('business_leads', 'phone', NULL, 'input', NULL, NULL, NULL, false, false, 4, 'full', NULL, NULL, NULL, true, NULL, NULL, NULL),
('business_leads', 'email', NULL, 'input', NULL, NULL, NULL, false, false, 5, 'full', NULL, NULL, NULL, true, NULL, NULL, NULL),

-- Category and location
('business_leads', 'category', NULL, 'select-dropdown', '{"choices":[{"value":"Barber","text":"Barber"},{"value":"Hair Salon","text":"Hair Salon"},{"value":"Spa","text":"Spa"},{"value":"Nail Salon","text":"Nail Salon"},{"value":"Beauty Salon","text":"Beauty Salon"}]}', NULL, NULL, false, false, 6, 'full', NULL, NULL, NULL, true, NULL, NULL, NULL),
('business_leads', 'city', NULL, 'select-dropdown', '{"choices":[{"value":"Karachi","text":"Karachi"},{"value":"Lahore","text":"Lahore"},{"value":"Islamabad","text":"Islamabad"},{"value":"Rawalpindi","text":"Rawalpindi"}]}', NULL, NULL, false, false, 7, 'full', NULL, NULL, NULL, true, NULL, NULL, NULL),

-- Status and notes
('business_leads', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"pending","text":"Pending"},{"value":"contacted","text":"Contacted"},{"value":"approved","text":"Approved"},{"value":"rejected","text":"Rejected"}]}', NULL, NULL, false, false, 8, 'full', NULL, NULL, NULL, false, NULL, NULL, NULL),
('business_leads', 'notes', NULL, 'textarea', NULL, NULL, NULL, false, false, 9, 'full', NULL, NULL, NULL, false, NULL, NULL, NULL),

-- Timestamps
('business_leads', 'created_at', 'timestamp-with-timezone', 'datetime', NULL, NULL, NULL, true, true, 10, 'full', NULL, NULL, NULL, false, NULL, NULL, NULL),
('business_leads', 'updated_at', 'timestamp-with-timezone', 'datetime', NULL, NULL, NULL, true, true, 11, 'full', NULL, NULL, NULL, false, NULL, NULL, NULL);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_business_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_business_leads_updated_at ON business_leads;
CREATE TRIGGER trigger_business_leads_updated_at
    BEFORE UPDATE ON business_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_business_leads_updated_at();

COMMIT;
