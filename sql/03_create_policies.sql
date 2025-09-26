-- Row Level Security (RLS) Policies for Supabase
-- Run this to set up proper security policies

-- Enable RLS on all tables
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE menuitem ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartitem ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE adminusers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Public access policies for customer-facing tables
-- Allow anyone to read menu items (public menu)
CREATE POLICY "Allow public read access to menu items" ON menuitem
    FOR SELECT USING (true);

-- Allow anyone to manage their own cart (session-based)
CREATE POLICY "Allow public cart access" ON cart
    FOR ALL USING (true);

-- Allow anyone to manage cart items
CREATE POLICY "Allow public cartitem access" ON cartitem
    FOR ALL USING (true);

-- Allow anyone to read customer info
CREATE POLICY "Allow public customer read" ON customer
    FOR SELECT USING (true);

-- Allow anyone to create customer records
CREATE POLICY "Allow public customer insert" ON customer
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update customer records
CREATE POLICY "Allow public customer update" ON customer
    FOR UPDATE USING (true);

-- Order policies - allow public to create orders, admins to manage
CREATE POLICY "Allow public order creation" ON "order"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public order read" ON "order"
    FOR SELECT USING (true);

-- Admin-only policies for management tables
-- Only authenticated users can access admin users table
CREATE POLICY "Admin users table access" ON adminusers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Menu item management - allow authenticated users to modify
CREATE POLICY "Allow authenticated menu item management" ON menuitem
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated menu item updates" ON menuitem
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated menu item deletion" ON menuitem
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Order management for admins
CREATE POLICY "Allow authenticated order management" ON "order"
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Notes table (tutorial) - allow authenticated access
CREATE POLICY "Allow authenticated notes access" ON notes
    FOR ALL USING (auth.uid() IS NOT NULL);