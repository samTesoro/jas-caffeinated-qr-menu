-- Alternative adminusers table with built-in authentication
-- Use this if you want username/password stored in the database instead of Supabase Auth

-- Drop the existing adminusers table if it exists
DROP TABLE IF EXISTS adminusers CASCADE;

-- Create adminusers table with username/password authentication
CREATE TABLE IF NOT EXISTS adminusers (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, never plain text
    full_name VARCHAR(255),
    
    -- Permission columns
    view_menu BOOLEAN DEFAULT false,
    view_orders BOOLEAN DEFAULT false,
    view_super BOOLEAN DEFAULT false,
    view_history BOOLEAN DEFAULT false,
    view_reviews BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    
    -- Session management
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES adminusers(user_id),
    updated_by INTEGER REFERENCES adminusers(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_adminusers_username ON adminusers(username);
CREATE INDEX IF NOT EXISTS idx_adminusers_email ON adminusers(email);
CREATE INDEX IF NOT EXISTS idx_adminusers_is_blocked ON adminusers(is_blocked);

-- Add check constraints
ALTER TABLE adminusers ADD CONSTRAINT check_username_length 
    CHECK (LENGTH(username) >= 3);

ALTER TABLE adminusers ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- RLS Policy for self-contained system
ALTER TABLE adminusers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own record and superusers can see all
CREATE POLICY "Admin users can manage based on permissions" ON adminusers
    FOR ALL USING (
        user_id = (current_setting('app.current_user_id', true))::INTEGER 
        OR 
        (SELECT view_super FROM adminusers WHERE user_id = (current_setting('app.current_user_id', true))::INTEGER) = true
    );

-- Function to create initial super admin (run once during setup)
CREATE OR REPLACE FUNCTION create_initial_admin(
    p_username VARCHAR(50),
    p_email VARCHAR(255),
    p_password_hash VARCHAR(255),
    p_full_name VARCHAR(255) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    new_user_id INTEGER;
BEGIN
    -- Check if any admin users exist
    IF EXISTS (SELECT 1 FROM adminusers LIMIT 1) THEN
        RAISE EXCEPTION 'Admin users already exist. Use regular admin creation process.';
    END IF;
    
    -- Create the first super admin
    INSERT INTO adminusers (
        username, 
        email, 
        password_hash, 
        full_name,
        view_menu, 
        view_orders, 
        view_super, 
        view_history, 
        view_reviews,
        is_blocked
    ) VALUES (
        p_username,
        p_email,
        p_password_hash,
        p_full_name,
        true, 
        true, 
        true, 
        true, 
        true,
        false
    ) RETURNING user_id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data: Create initial super admin
-- Note: In a real application, hash the password properly using bcrypt or similar
-- This is just for demonstration - replace with your actual admin credentials
SELECT create_initial_admin(
    'superadmin',
    'admin@jascaffeinated.com',
    '$2b$12$example_hashed_password_here', -- Replace with actual bcrypt hash
    'Super Administrator'
);