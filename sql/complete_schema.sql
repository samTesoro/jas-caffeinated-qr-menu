-- Complete QR Menu System Database Schema
-- Based on the actual production schema
-- Run this in Supabase SQL Editor to recreate all tables

-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS cart_cart_id_seq;
CREATE SEQUENCE IF NOT EXISTS cartitem_cartitem_id_seq;
CREATE SEQUENCE IF NOT EXISTS customer_customer_id_seq;
CREATE SEQUENCE IF NOT EXISTS order_order_id_seq;

-- 1. Admin Users table (with username/password authentication)
CREATE TABLE IF NOT EXISTS public.adminusers (
    user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    username text NOT NULL UNIQUE,
    password text NOT NULL,
    view_orders boolean NOT NULL DEFAULT false,
    view_history boolean NOT NULL DEFAULT false,
    view_menu boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    view_super boolean DEFAULT false,
    view_reviews boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    CONSTRAINT adminusers_pkey PRIMARY KEY (user_id)
);

-- 2. Menu Items table
CREATE TABLE IF NOT EXISTS public.menuitem (
    menuitem_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    price real NOT NULL,
    status text NOT NULL,
    thumbnail text,
    description text,
    is_favorites boolean DEFAULT false, 
    est_time smallint,
    CONSTRAINT menuitem_pkey PRIMARY KEY (menuitem_id)
);

-- 3. Customer table
CREATE TABLE IF NOT EXISTS public.customer (
    customer_id integer NOT NULL DEFAULT nextval('customer_customer_id_seq'::regclass),
    table_num integer NOT NULL,
    timestamp timestamp without time zone NOT NULL DEFAULT now(),
    is_active boolean DEFAULT true,
    CONSTRAINT customer_pkey PRIMARY KEY (customer_id)
);

-- 4. Order table (created before cart due to foreign key reference)
CREATE TABLE IF NOT EXISTS public.order (
    order_id integer NOT NULL DEFAULT nextval('order_order_id_seq'::regclass),
    date_ordered date NOT NULL,
    time_ordered time without time zone NOT NULL,
    payment_type character varying NOT NULL,
    isfinished boolean DEFAULT false,
    iscancelled boolean DEFAULT false,
    customer_id integer,
    cart_id integer,
    CONSTRAINT order_pkey PRIMARY KEY (order_id),
    CONSTRAINT order_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id)
);

-- 5. Cart table (references order table)
CREATE TABLE IF NOT EXISTS public.cart (
    cart_id integer NOT NULL DEFAULT nextval('cart_cart_id_seq'::regclass),
    time_created timestamp without time zone NOT NULL DEFAULT now(),
    total_price double precision NOT NULL DEFAULT 0.0,
    order_id integer,
    checked_out boolean DEFAULT false,
    session_id text UNIQUE,
    table_number smallint,
    CONSTRAINT cart_pkey PRIMARY KEY (cart_id),
    CONSTRAINT cart_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.order(order_id)
);

-- 6. Cart Items table
CREATE TABLE IF NOT EXISTS public.cartitem (
    cartitem_id integer NOT NULL DEFAULT nextval('cartitem_cartitem_id_seq'::regclass),
    quantity integer NOT NULL,
    subtotal_price double precision NOT NULL,
    menuitem_id integer,
    cart_id integer,
    CONSTRAINT cartitem_pkey PRIMARY KEY (cartitem_id),
    CONSTRAINT cartitem_menuitem_id_fkey FOREIGN KEY (menuitem_id) REFERENCES public.menuitem(menuitem_id),
    CONSTRAINT cartitem_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(cart_id)
);

-- Add the missing foreign key constraint to order table (cart_id reference)
-- Note: This creates a circular reference, so we add it after cart table exists
ALTER TABLE public.order 
ADD CONSTRAINT order_cart_id_fkey 
FOREIGN KEY (cart_id) REFERENCES public.cart(cart_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_session_id ON public.cart(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_checked_out ON public.cart(checked_out);
CREATE INDEX IF NOT EXISTS idx_cart_time_created ON public.cart(time_created);
CREATE INDEX IF NOT EXISTS idx_cartitem_cart_id ON public.cartitem(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_menuitem_id ON public.cartitem(menuitem_id);
CREATE INDEX IF NOT EXISTS idx_menuitem_category ON public.menuitem(category);
CREATE INDEX IF NOT EXISTS idx_menuitem_status ON public.menuitem(status);
CREATE INDEX IF NOT EXISTS idx_order_date_ordered ON public.order(date_ordered);
CREATE INDEX IF NOT EXISTS idx_order_isfinished ON public.order(isfinished);
CREATE INDEX IF NOT EXISTS idx_order_iscancelled ON public.order(iscancelled);
CREATE INDEX IF NOT EXISTS idx_customer_table_num ON public.customer(table_num);
CREATE INDEX IF NOT EXISTS idx_customer_is_active ON public.customer(is_active);
CREATE INDEX IF NOT EXISTS idx_adminusers_username ON public.adminusers(username);
CREATE INDEX IF NOT EXISTS idx_adminusers_is_blocked ON public.adminusers(is_blocked);