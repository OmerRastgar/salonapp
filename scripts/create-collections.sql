
-- Create collections and register them in Directus
BEGIN;

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(255),
    area VARCHAR(255),
    rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    women_only BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    bio TEXT,
    timezone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_categories junction table
CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendors_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    categories_id UUID REFERENCES categories(id) ON DELETE CASCADE
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Register collections in Directus metadata
INSERT INTO directus_collections (collection, icon, display_template) VALUES 
('locations', 'place', '{{name}}'),
('categories', 'category', '{{name}}'),
('vendors', 'store', '{{name}}'),
('employees', 'person', '{{name}}'),
('vendor_categories', 'link', '{{vendors_id}} - {{categories_id}}'),
('reviews', 'comment', '{{vendor_id}}')
ON CONFLICT (collection) DO NOTHING;

-- Register fields for locations
INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
('locations', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
('locations', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
('locations', 'slug', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
('locations', 'sort_order', NULL, 'numeric', NULL, NULL, false, false, 4, 'half', false),
('locations', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 5, 'half', false)
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for categories
INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
('categories', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
('categories', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
('categories', 'slug', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
('categories', 'sort_order', NULL, 'numeric', NULL, NULL, false, false, 4, 'half', false),
('categories', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 5, 'half', false)
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for vendors
INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
('vendors', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
('vendors', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
('vendors', 'slug', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
('vendors', 'description', NULL, 'textarea', NULL, NULL, false, false, 4, 'full', false),
('vendors', 'email', NULL, 'input', NULL, NULL, false, false, 5, 'half', true),
('vendors', 'phone', NULL, 'input', NULL, NULL, false, false, 6, 'half', true),
('vendors', 'address', NULL, 'textarea', NULL, NULL, false, false, 7, 'full', false),
('vendors', 'city', NULL, 'input', NULL, NULL, false, false, 8, 'half', false),
('vendors', 'area', NULL, 'input', NULL, NULL, false, false, 9, 'half', false),
('vendors', 'rating', NULL, 'numeric', NULL, NULL, false, false, 10, 'half', false),
('vendors', 'reviews_count', NULL, 'numeric', NULL, NULL, false, false, 11, 'half', false),
('vendors', 'is_featured', NULL, 'toggle', NULL, NULL, false, false, 12, 'half', false),
('vendors', 'is_verified', NULL, 'toggle', NULL, NULL, false, false, 13, 'half', false),
('vendors', 'women_only', NULL, 'toggle', NULL, NULL, false, false, 14, 'half', false),
('vendors', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 15, 'half', false)
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for employees
INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
('employees', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
('employees', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
('employees', 'email', NULL, 'input', NULL, NULL, false, false, 3, 'half', true),
('employees', 'bio', NULL, 'textarea', NULL, NULL, false, false, 4, 'full', false),
('employees', 'timezone', NULL, 'input', NULL, NULL, false, false, 5, 'half', false),
('employees', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 6, 'half', false),
('employees', 'sort_order', NULL, 'numeric', NULL, NULL, false, false, 7, 'half', false)
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for vendor_categories
INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
('vendor_categories', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
('vendor_categories', 'vendors_id', NULL, 'relation', '{"collection":"vendors"}', NULL, false, false, 2, 'half', true),
('vendor_categories', 'categories_id', NULL, 'relation', '{"collection":"categories"}', NULL, false, false, 3, 'half', true)
ON CONFLICT (collection, field) DO NOTHING;

-- Register fields for reviews
INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
('reviews', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
('reviews', 'vendor_id', NULL, 'relation', '{"collection":"vendors"}', NULL, false, false, 2, 'half', true),
('reviews', 'customer_name', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
('reviews', 'customer_email', NULL, 'input', NULL, NULL, false, false, 4, 'half', false),
('reviews', 'rating', NULL, 'numeric', NULL, NULL, false, false, 5, 'half', true),
('reviews', 'comment', NULL, 'textarea', NULL, NULL, false, false, 6, 'full', true),
('reviews', 'is_verified', NULL, 'toggle', NULL, NULL, false, false, 7, 'half', false),
('reviews', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 8, 'half', false)
ON CONFLICT (collection, field) DO NOTHING;

COMMIT;
