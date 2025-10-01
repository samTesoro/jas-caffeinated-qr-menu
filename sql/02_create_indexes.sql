-- Indexes for better performance
-- Run this after creating the tables

-- Indexes for cart table
CREATE INDEX IF NOT EXISTS idx_cart_session_id ON cart(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_checked_out ON cart(checked_out);
CREATE INDEX IF NOT EXISTS idx_cart_time_created ON cart(time_created);

-- Indexes for cartitem table
CREATE INDEX IF NOT EXISTS idx_cartitem_cart_id ON cartitem(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_menuitem_id ON cartitem(menuitem_id);

-- Indexes for menuitem table
CREATE INDEX IF NOT EXISTS idx_menuitem_category ON menuitem(category);
CREATE INDEX IF NOT EXISTS idx_menuitem_status ON menuitem(status);
CREATE INDEX IF NOT EXISTS idx_menuitem_favorites ON menuitem(favorites);

-- Indexes for order table
CREATE INDEX IF NOT EXISTS idx_order_date_ordered ON "order"(date_ordered);
CREATE INDEX IF NOT EXISTS idx_order_time_ordered ON "order"(time_ordered);
CREATE INDEX IF NOT EXISTS idx_order_isfinished ON "order"(isfinished);
CREATE INDEX IF NOT EXISTS idx_order_iscancelled ON "order"(iscancelled);
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "order"(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_cart_id ON "order"(cart_id);

-- Indexes for customer table
CREATE INDEX IF NOT EXISTS idx_customer_table_num ON customer(table_num);
CREATE INDEX IF NOT EXISTS idx_customer_is_active ON customer(is_active);

-- Indexes for adminusers table
CREATE INDEX IF NOT EXISTS idx_adminusers_is_blocked ON adminusers(is_blocked);