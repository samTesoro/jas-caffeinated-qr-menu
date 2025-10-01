# QR Menu Database Setup Instructions

## Overview
This folder contains SQL scripts to recreate the complete QR Menu System database in Supabase.

## Files Description

1. **01_create_tables.sql** - Creates all the main tables with proper relationships
2. **02_create_indexes.sql** - Adds performance indexes
3. **03_create_policies.sql** - Sets up Row Level Security (RLS) policies
4. **04_sample_data.sql** - Inserts sample menu items and test data
5. **05_functions_triggers.sql** - Adds helpful functions and triggers
6. **cleanup-open-carts.sql** - Utility script for cleaning up old carts

## Setup Instructions

### Step 1: Create Tables
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the content from `01_create_tables.sql`
3. Click "Run" to create all tables

### Step 2: Add Indexes (Optional but Recommended)
1. Copy and paste the content from `02_create_indexes.sql`
2. Click "Run" to create performance indexes

### Step 3: Set Up Security Policies
1. Copy and paste the content from `03_create_policies.sql`
2. Click "Run" to enable RLS and create policies

### Step 4: Add Sample Data (Optional)
1. Copy and paste the content from `04_sample_data.sql`
2. Click "Run" to insert sample menu items and test data

### Step 5: Add Functions and Triggers (Optional)
1. Copy and paste the content from `05_functions_triggers.sql`
2. Click "Run" to add automation functions

## Important Notes

### Authentication Setup
After running the SQL scripts, you need to:

1. **Create Admin Users**: Use Supabase Auth to create user accounts
2. **Set Admin Permissions**: Insert records into the `adminusers` table:
   ```sql
   INSERT INTO adminusers (user_id, view_menu, view_orders, view_super, view_history, view_reviews, is_blocked) 
   VALUES ('your-auth-user-uuid', true, true, true, true, true, false);
   ```

### Environment Variables
Make sure your Next.js app has these environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Storage Setup (Optional)
If using image uploads for menu items:
1. Go to Supabase Storage
2. Create a bucket called "menu-images"
3. Set appropriate policies for public read access

## Database Schema Summary

### Core Tables:
- **menuitem**: Store menu items (meals, coffee, drinks)
- **cart**: Session-based shopping carts
- **cartitem**: Items within each cart
- **order**: Completed orders
- **customer**: Customer/table information
- **adminusers**: Admin user permissions
- **notes**: Tutorial/demo content

### Key Features:
- Session-based cart management
- Order status tracking (pending, finished, cancelled)
- Role-based admin permissions
- Table number tracking
- Payment method support (GCash, Cash/Card)
- Automatic cart total calculation
- Timestamp tracking for all records

## Maintenance

### Regular Cleanup
Run this query periodically to clean up old unchecked carts:
```sql
SELECT cleanup_old_carts();
```

Or use the provided script: `cleanup-open-carts.sql`

### Backup Recommendations
- Regular database backups through Supabase Dashboard
- Export menu items before major updates
- Keep environment variables secure and backed up

## Troubleshooting

### Common Issues:
1. **RLS Policies**: If you get permission errors, check RLS policies
2. **Foreign Key Errors**: Ensure parent records exist before inserting child records
3. **Auth Errors**: Verify user authentication and adminusers table entries

### Performance:
- The provided indexes should handle most queries efficiently
- For large datasets, consider additional indexes based on query patterns
- Monitor query performance in Supabase Dashboard

## Support
If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify all environment variables are set correctly
3. Ensure RLS policies match your application's needs