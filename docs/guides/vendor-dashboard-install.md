# Vendor Dashboard Installation Guide

## Overview
This guide walks you through setting up the vendor dashboard for your Directus-based salon marketplace.

## Prerequisites
- Directus instance running and accessible
- Admin access to Directus
- Database access (PostgreSQL)
- Existing vendors and bookings data

## Installation Steps

### Step 1: Database Setup

1. **Run the SQL setup script:**
   ```bash
   # Connect to your Directus database
   docker-compose exec -T database psql -U admin -d postgres -f vendor-dashboard-sql.sql
   ```

2. **Verify the setup:**
   - Check that the `vendor` role was created in Directus
   - Verify the `vendor_id` column was added to `directus_users`
   - Confirm the views `vendor_revenue` and `vendor_appointments` exist

### Step 2: Create Vendor Users

1. **Create vendor users in Directus:**
   - Go to Directus Admin: http://localhost:8055
   - Navigate to Settings → Roles & Permissions
   - Create a new user with the "Vendor" role
   - Link the user to their vendor record using the `vendor_id` field

2. **Or create users programmatically:**
   ```sql
   -- Example: Create a vendor user
   INSERT INTO directus_users (
     first_name, 
     last_name, 
     email, 
     password, 
     role, 
     vendor_id
   ) VALUES (
     'John', 
     'Doe', 
     'john@salon.com', 
     '$2a$12$properly_hashed_password_here',  -- Use Directus to hash passwords
     (SELECT id FROM directus_roles WHERE name = 'Vendor'),
     (SELECT id FROM vendors WHERE email = 'john@salon.com' LIMIT 1)
   );
   ```

### Step 3: Set Up Dashboard Interface

1. **Create the interface extension:**
   ```bash
   # Create extensions directory if it doesn't exist
   mkdir -p extensions/dashboard/interfaces
   
   # Copy the interface file
   cp vendor-dashboard-interface.js extensions/dashboard/interfaces/vendor-dashboard.js
   ```

2. **Register the interface in Directus:**
   - In Directus Admin, go to Settings → Project Settings → Interfaces
   - Add the new vendor dashboard interface
   - Configure it to appear for users with the "Vendor" role

### Step 4: Configure Navigation

1. **Create custom navigation for vendors:**
   - Go to Settings → Project Settings → Navigation
   - Create a new navigation set for the "Vendor" role
   - Add these items:
     - Dashboard (root)
     - Appointments (bookings collection)
     - Revenue (vendor_revenue view)
     - Employees (employees collection)
     - Services (employee_services collection)
     - Reviews (reviews collection)

### Step 5: Test the Dashboard

1. **Create a test vendor user:**
   - Sign up as a vendor or create one in admin
   - Assign them to the "Vendor" role
   - Link them to an existing vendor record

2. **Test access:**
   - Log in as the vendor user
   - Verify they can only see their own data
   - Check that the dashboard displays correctly
   - Test appointment and revenue views

## Configuration Options

### Customizing the Dashboard

1. **Modify the interface file** (`vendor-dashboard-interface.js`):
   - Change the layout and styling
   - Add new statistics or charts
   - Customize the data displayed

2. **Adjust permissions:**
   - Modify the SQL script to change what vendors can access
   - Update Directus permissions for fine-grained control

### Adding New Features

1. **New dashboard panels:**
   - Add new sections to the interface
   - Create additional database views for complex queries
   - Set up new flows for real-time data

2. **Custom reports:**
   - Create additional aggregation views
   - Add export functionality
   - Implement date range filters

## Troubleshooting

### Common Issues

1. **Vendor can't see their data:**
   - Check that the `vendor_id` field is properly set on the user
   - Verify permissions are correctly configured
   - Ensure the user has the "Vendor" role

2. **Dashboard not loading:**
   - Check browser console for JavaScript errors
   - Verify the interface extension is properly registered
   - Ensure all API endpoints are accessible

3. **Permission errors:**
   - Review the SQL permissions setup
   - Check Directus role permissions
   - Verify the user is linked to the correct vendor

### Debugging Steps

1. **Check database views:**
   ```sql
   -- Test vendor revenue view
   SELECT * FROM vendor_revenue LIMIT 5;
   
   -- Test vendor appointments view
   SELECT * FROM vendor_appointments WHERE vendor_id = 'your-vendor-id' LIMIT 5;
   ```

2. **Verify permissions:**
   ```sql
   -- Check user permissions
   SELECT * FROM directus_permissions WHERE role = (SELECT id FROM directus_roles WHERE name = 'Vendor');
   ```

3. **Test API access:**
   - Use Directus API Explorer to test endpoints
   - Verify filters are working correctly
   - Check that data is being returned as expected

## Security Considerations

1. **Data Isolation:**
   - Vendors should only access their own data
   - Verify all filters use `$CURRENT_USER.vendor_id`
   - Test with multiple vendor accounts

2. **Access Control:**
   - Regularly review vendor permissions
   - Monitor for permission escalation attempts
   - Keep vendor role permissions minimal

3. **Data Privacy:**
   - Ensure customer data is properly protected
   - Consider additional encryption for sensitive data
   - Implement audit logging if needed

## Maintenance

1. **Regular Updates:**
   - Keep Directus updated to latest version
   - Review and update permissions periodically
   - Monitor dashboard performance

2. **Backup Strategy:**
   - Regular database backups
   - Export vendor dashboard configuration
   - Document any custom modifications

## Support

If you encounter issues:

1. Check Directus documentation for interface extensions
2. Review the SQL setup script for any database-specific issues
3. Test with different user roles to isolate permission problems
4. Use browser developer tools to debug interface issues

## Next Steps

After installation:

1. Train vendors on using the dashboard
2. Gather feedback for improvements
3. Consider adding advanced features like:
   - Customer communication tools
   - Advanced reporting
   - Mobile app integration
   - Automated notifications
