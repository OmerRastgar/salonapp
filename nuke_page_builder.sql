
-- NUKE PAGE BUILDER (M2A Blocks)
-- 1. Drop Tables
DROP TABLE IF EXISTS pages_blocks_1 CASCADE;
DROP TABLE IF EXISTS pages_blocks CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS block_hero CASCADE;
DROP TABLE IF EXISTS block_features CASCADE;
DROP TABLE IF EXISTS block_text CASCADE;
DROP TABLE IF EXISTS block_categories CASCADE;
DROP TABLE IF EXISTS block_cities CASCADE;
DROP TABLE IF EXISTS block_live_activity CASCADE;
DROP TABLE IF EXISTS block_business_form CASCADE;

-- 2. Clear Metadata
DELETE FROM directus_fields WHERE collection IN ('pages', 'pages_blocks', 'block_hero', 'block_features', 'block_text', 'block_categories', 'block_cities', 'block_live_activity', 'block_business_form');
DELETE FROM directus_relations WHERE many_collection IN ('pages', 'pages_blocks', 'block_hero', 'block_features', 'block_text', 'block_categories', 'block_cities', 'block_live_activity', 'block_business_form') OR one_collection IN ('pages', 'pages_blocks', 'block_hero', 'block_features', 'block_text', 'block_categories', 'block_cities', 'block_live_activity', 'block_business_form');
DELETE FROM directus_permissions WHERE collection IN ('pages', 'pages_blocks', 'block_hero', 'block_features', 'block_text', 'block_categories', 'block_cities', 'block_live_activity', 'block_business_form');
DELETE FROM directus_collections WHERE collection IN ('pages', 'pages_blocks', 'block_hero', 'block_features', 'block_text', 'block_categories', 'block_cities', 'block_live_activity', 'block_business_form');

-- Remove the group
DELETE FROM directus_collections WHERE collection = 'page_builder';
