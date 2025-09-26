-- QR Menu System Database Schema
-- Run this in Supabase SQL Editor to recreate all tables

-- 1. Customer table
CREATE TABLE IF NOT EXISTS customer (
    customer_id SERIAL PRIMARY KEY,
    table_num INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Menu Items table
CREATE TABLE IF NOT EXISTS menuitem (
    menuitem_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Meals', 'Coffee', 'Drinks')),
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Unavailable')),
    thumbnail TEXT,
    favorites VARCHAR(10) DEFAULT 'No' CHECK (favorites IN ('Yes', 'No')),
    estimatedTime INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cart table
CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    checked_out BOOLEAN DEFAULT false,
    table_number INTEGER,
    time_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Cart Items table
CREATE TABLE IF NOT EXISTS cartitem (
    cartitem_id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    menuitem_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (menuitem_id) REFERENCES menuitem(menuitem_id) ON DELETE CASCADE
);

-- 5. Orders table
CREATE TABLE IF NOT EXISTS "order" (
    order_id SERIAL PRIMARY KEY,
    date_ordered DATE NOT NULL DEFAULT CURRENT_DATE,
    time_ordered TIME NOT NULL DEFAULT CURRENT_TIME,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('GCash', 'Cash/Card')),
    isfinished BOOLEAN DEFAULT false,
    iscancelled BOOLEAN DEFAULT false,
    customer_id INTEGER,
    cart_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE
);

-- 6. Admin Users table (for permissions)
CREATE TABLE IF NOT EXISTS adminusers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    view_menu BOOLEAN DEFAULT false,
    view_orders BOOLEAN DEFAULT false,
    view_super BOOLEAN DEFAULT false,
    view_history BOOLEAN DEFAULT false,
    view_reviews BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notes table (for tutorial/demo purposes)
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);