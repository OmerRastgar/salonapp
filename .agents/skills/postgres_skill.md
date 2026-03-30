Skill: PostgreSQL Database Management with MCP
Overview
This skill provides a comprehensive guide for using PostgreSQL MCP (Model Context Protocol) tools to manage the database layer of your salon marketplace. PostgreSQL is the underlying database for Directus, and direct database access may be needed for:

Initial database setup and schema creation

Running migrations

Debugging data inconsistencies

Performing bulk operations

Optimizing queries with indexes

Backup and restore operations

Note: Most database operations should be handled through Directus. Only use direct PostgreSQL access when:

Setting up the initial database for Directus

Performing low-level maintenance

Debugging issues that cannot be resolved via Directus

Creating custom indexes for performance optimization

Prerequisites
PostgreSQL server running (as per your docker-compose.yml)

PostgreSQL MCP server installed and configured

Connection string or credentials (from your environment)

Understanding of the database schema (see directus-data-structure.md)

Database Connection Configuration
Connection String Format
text
postgresql://username:password@host:port/database
For your setup (from docker-compose.yml):

Host: postgres (container name) or localhost (if accessing from host)

Port: 5432

Database: directus (or directory_db if using separate DB)

Username: directus (or as configured)

Password: As defined in your .env file

Example:

text
postgresql://directus:your_password@localhost:5432/directus
Core PostgreSQL MCP Operations
1. Database Inspection
List All Databases
sql
SELECT datname FROM pg_database WHERE datistemplate = false;
List All Tables in Current Database
sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
Describe Table Structure
sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;
List All Relationships (Foreign Keys)
sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
2. Schema Management
Create a Collection Table (for Directus)
sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    photo VARCHAR(255),
    bio TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_employees_vendor_id ON employees(vendor_id);
CREATE INDEX idx_employees_email ON employees(email);
Add a Column to Existing Table
sql
ALTER TABLE bookings ADD COLUMN notes TEXT;
Add a Constraint
sql
ALTER TABLE employee_services 
ADD CONSTRAINT positive_price CHECK (price >= 0);
Create Composite Index for Common Queries
sql
-- For checking overlapping bookings
CREATE INDEX idx_bookings_employee_time 
ON bookings(employee_id, start_datetime, end_datetime);
3. Data Operations
Insert Test Data
sql
-- Insert test vendor
INSERT INTO vendors (id, name, slug, status) 
VALUES (gen_random_uuid(), 'Test Salon', 'test-salon', 'active');

-- Insert test employee
INSERT INTO employees (id, vendor_id, name, email, timezone)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM vendors WHERE slug = 'test-salon'),
    'Jane Smith',
    'jane@testsalon.com',
    'America/New_York'
);
Query with Joins (for debugging)
sql
SELECT 
    b.id,
    e.name AS employee_name,
    s.name AS service_name,
    b.start_datetime,
    b.status,
    b.amount
FROM bookings b
JOIN employees e ON b.employee_id = e.id
JOIN employee_services s ON b.employee_service_id = s.id
WHERE b.status = 'confirmed'
ORDER BY b.start_datetime DESC
LIMIT 10;
Bulk Update (Use with caution)
sql
-- Example: Update all bookings with a certain status
UPDATE bookings 
SET status = 'cancelled' 
WHERE start_datetime < CURRENT_DATE 
AND status = 'pending';
4. Performance Optimization
Analyze Query Performance
sql
EXPLAIN ANALYZE 
SELECT * FROM bookings 
WHERE employee_id = 'some-uuid' 
AND start_datetime >= NOW() 
ORDER BY start_datetime;
Find Missing Indexes
sql
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC
LIMIT 10;
Vacuum and Analyze
sql
-- Clean up dead rows and update statistics
VACUUM ANALYZE bookings;
5. Backup and Restore
Create Database Backup (using pg_dump)
bash
pg_dump -h localhost -U directus -d directus > backup_$(date +%Y%m%d).sql
Restore from Backup
bash
psql -h localhost -U directus -d directus < backup_20260330.sql
Export Table to CSV
sql
COPY bookings TO '/tmp/bookings_export.csv' 
WITH (FORMAT CSV, HEADER true);
Import from CSV
sql
COPY bookings(id, employee_id, start_datetime, status) 
FROM '/tmp/bookings_import.csv' 
DELIMITER ',' CSV HEADER;
6. Monitoring and Debugging
Check Active Connections
sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'directus';
Kill a Stuck Connection
sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE pid = 12345;
Check Table Sizes
sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.' || tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC;
Find Locking Issues
sql
SELECT 
    locked.pid AS locked_pid,
    locked.query AS locked_query,
    blocking.pid AS blocking_pid,
    blocking.query AS blocking_query
FROM pg_locks locked
JOIN pg_stat_activity locked_activity 
    ON locked.pid = locked_activity.pid
JOIN pg_locks blocking 
    ON locked.locktype = blocking.locktype 
    AND locked.relation = blocking.relation
    AND locked.pid != blocking.pid
JOIN pg_stat_activity blocking_activity 
    ON blocking.pid = blocking_activity.pid
WHERE NOT locked.granted;
Integration with Directus Setup
1. Initial Database Setup
When setting up Directus for the first time, you may need to:

Create the database if it doesn't exist

Ensure proper encoding (UTF8)

Set up the correct timezone

sql
-- Create database
CREATE DATABASE directus 
WITH ENCODING 'UTF8' 
LC_COLLATE='en_US.utf8' 
LC_CTYPE='en_US.utf8';

-- Create user if needed
CREATE USER directus WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE directus TO directus;
2. After Directus Migration
After creating collections through Directus, you may want to add custom indexes:

sql
-- Add composite index for booking availability queries
CREATE INDEX CONCURRENTLY idx_bookings_availability 
ON bookings(employee_id, start_datetime, status) 
WHERE status != 'cancelled';

-- Add index for vendor revenue reports
CREATE INDEX idx_bookings_vendor_amount 
ON bookings(vendor_id, amount, start_datetime);
3. Data Integrity Checks
Run these after major operations:

sql
-- Check for orphaned records (bookings without valid employees)
SELECT b.* 
FROM bookings b
LEFT JOIN employees e ON b.employee_id = e.id
WHERE e.id IS NULL;

-- Check for duplicate active schedules (same employee, same day)
SELECT employee_id, day_of_week, COUNT(*)
FROM employee_schedules
GROUP BY employee_id, day_of_week
HAVING COUNT(*) > 1;
Testing Strategy
1. Create Test Database
sql
CREATE DATABASE directus_test 
WITH TEMPLATE directus;
2. Run Integration Tests
sql
-- Setup test data
BEGIN;
INSERT INTO test_data...;
-- Run test queries
ROLLBACK; -- Clean up after test
3. Performance Testing
sql
-- Measure query performance before and after index creation
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM bookings 
WHERE employee_id = 'test-uuid' 
AND start_datetime BETWEEN '2026-04-01' AND '2026-04-30';
Best Practices
Transaction Management
Always wrap data modifications in transactions:

sql
BEGIN;
-- Your modifications here
COMMIT; -- or ROLLBACK if something goes wrong
Use Prepared Statements (for repeated queries)
sql
PREPARE get_employee_bookings (UUID, DATE) AS
SELECT * FROM bookings 
WHERE employee_id = $1 
AND start_datetime::DATE = $2;

EXECUTE get_employee_bookings('some-uuid', '2026-04-01');
DEALLOCATE get_employee_bookings;
Clean Up Temporary Data
After running tests or one-off operations:

sql
-- Drop temporary tables
DROP TABLE IF EXISTS temp_import_data;

-- Clean up test data (with verification)
DELETE FROM bookings 
WHERE booker_email LIKE '%@test.com';
Log Major Operations
Record significant changes in memory.md:

markdown
## [2026-03-30 14:30] - Database Index Added

**Operation**: Added composite index idx_bookings_availability
**Reason**: Improve booking availability query performance
**Command**: 
CREATE INDEX CONCURRENTLY idx_bookings_availability 
ON bookings(employee_id, start_datetime, status) 
WHERE status != 'cancelled';
**Verification**: Query time reduced from 450ms to 25ms
Troubleshooting Common Issues
Issue: Connection Refused
Verify PostgreSQL container is running: docker ps | grep postgres

Check connection string and port

Ensure user has proper permissions

Issue: Permission Denied
Check user privileges: \du

Grant necessary permissions: GRANT ALL PRIVILEGES ON DATABASE directus TO directus;

Issue: Table Doesn't Exist
Verify table exists: \dt

Check schema: SET search_path TO public;

Issue: Lock Timeout
Increase timeout: SET lock_timeout = '10s';

Identify blocking transactions and kill them

PostgreSQL MCP Tool Reference
If your PostgreSQL MCP provides specific tools, typical commands include:

Tool	Purpose
postgres_query	Execute SQL query and return results
postgres_list_tables	List all tables in database
postgres_describe_table	Show table schema
postgres_create_table	Create new table
postgres_run_migration	Execute migration file
postgres_backup	Create database backup
postgres_restore	Restore from backup
Example usage:

javascript
// Execute a query
postgres_query({
  query: "SELECT * FROM employees WHERE vendor_id = $1",
  params: ["vendor-uuid-here"]
});

// List all tables
postgres_list_tables();

// Describe table structure
postgres_describe_table({ table: "bookings" });