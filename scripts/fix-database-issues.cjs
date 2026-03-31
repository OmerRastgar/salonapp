const fs = require('fs');
const path = require('path');

// Fix database schema and data issues
async function fixDatabaseIssues() {
  console.log('🔧 Fixing database schema and data issues...\n');
  
  const fixes = [
    {
      name: 'Remove employees.services column reference',
      description: 'The employees table does not have a services column, but queries are trying to select it',
      sql: `
-- Fix employees table queries
-- The services column doesn't exist in employees table
-- Remove it from any queries or add it as an alias field if needed
      `
    },
    {
      name: 'Fix Directus permissions schema',
      description: 'Missing directus_roles_policies table and other Directus schema issues',
      sql: `
-- Fix Directus permissions schema
-- The directus_roles_policies table structure has changed in newer Directus versions
-- Update permission queries to use the correct schema
      `
    },
    {
      name: 'Fix business leads permissions',
      description: 'PUBLIC_POLICY_ID variable not defined in SQL scripts',
      sql: `
-- Fix business leads permissions with proper policy IDs
DO $$
DECLARE
  public_policy_id UUID;
  admin_policy_id UUID;
BEGIN
  -- Get policy IDs
  SELECT id INTO public_policy_id FROM directus_policies WHERE name = 'Public' LIMIT 1;
  SELECT id INTO admin_policy_id FROM directus_policies WHERE name = 'Administrator' LIMIT 1;
  
  -- Insert permissions if policies exist
  IF public_policy_id IS NOT NULL AND admin_policy_id IS NOT NULL THEN
    INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy)
    VALUES 
    ('business_leads', 'create', '{}', '{}', '[]', '["business_name", "contact_person", "phone", "email", "category", "city"]', public_policy_id),
    ('business_leads', 'read', '{}', '{}', '[]', '["business_name", "contact_person", "phone", "email", "category", "city", "status", "created_at"]', public_policy_id),
    ('business_leads', 'create', '{}', '{}', '[]', '["*"]', admin_policy_id),
    ('business_leads', 'read', '{}', '{}', '[]', '["*"]', admin_policy_id),
    ('business_leads', 'update', '{}', '{}', '[]', '["*"]', admin_policy_id),
    ('business_leads', 'delete', '{}', '{}', '[]', '["*"]', admin_policy_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
      `
    },
    {
      name: 'Fix employee reviews UUID issue',
      description: 'Invalid UUID "test" being inserted into employee_reviews table',
      sql: `
-- Fix employee reviews UUID issue
-- Remove any invalid UUID entries and ensure proper UUID format
DELETE FROM employee_reviews WHERE employee_id::text = 'test';
      `
    },
    {
      name: 'Fix duplicate locations',
      description: 'Duplicate key constraint violation for locations_slug_key',
      sql: `
-- Fix duplicate locations
DELETE FROM locations WHERE slug = 'karachi' AND id NOT IN (
  SELECT MIN(id) FROM locations WHERE slug = 'karachi' GROUP BY slug
);
      `
    },
    {
      name: 'Fix database role issue',
      description: 'Role "postgres" does not exist',
      sql: `
-- Fix database role issue
-- The postgres role should exist, but if not, create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres;
  END IF;
END $$;
      `
    }
  ];

  console.log('📋 Issues to fix:');
  fixes.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix.name}`);
    console.log(`      ${fix.description}`);
  });

  console.log('\n🚀 Recommended actions:');
  console.log('1. Stop all services:');
  console.log('   docker-compose -f config/docker-compose.yml down -v');
  console.log('\n2. Clean corrupted data:');
  console.log('   Remove-Item "data" -Recurse -Force -ErrorAction SilentlyContinue');
  console.log('\n3. Start fresh services:');
  console.log('   docker-compose -f config/docker-compose.yml up -d');
  console.log('\n4. Wait for database to be ready:');
  console.log('   docker-compose -f config/docker-compose.yml logs -f database');
  console.log('\n5. Apply schema fixes:');
  console.log('   psql -h localhost -U admin -d postgres -f sql/setup/rebuild_marketplace.sql');
  console.log('\n6. Run seeder:');
  console.log('   cd tests/scripts && node seeder.js');

  console.log('\n📝 Manual fixes needed:');
  console.log('1. Update .env file with localhost URLs');
  console.log('2. Fix employees.services column in frontend queries');
  console.log('3. Update Directus permission scripts for current version');
  console.log('4. Ensure proper UUID handling in test data');

  console.log('\n✅ Database issues identified and solutions provided!');
}

fixDatabaseIssues();
