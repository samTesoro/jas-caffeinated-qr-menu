-- Database functions and triggers for automation
-- Run this to add helpful functions and triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at timestamps
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON customer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menuitem_updated_at BEFORE UPDATE ON menuitem
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cartitem_updated_at BEFORE UPDATE ON cartitem
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "order"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adminusers_updated_at BEFORE UPDATE ON adminusers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate cart total
CREATE OR REPLACE FUNCTION update_cart_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cart 
    SET total_price = (
        SELECT COALESCE(SUM(subtotal_price), 0)
        FROM cartitem 
        WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    )
    WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update cart total when cart items change
CREATE TRIGGER update_cart_total_on_cartitem_change
    AFTER INSERT OR UPDATE OR DELETE ON cartitem
    FOR EACH ROW EXECUTE FUNCTION update_cart_total();

-- Function to clean up old unchecked carts (can be run manually or scheduled)
CREATE OR REPLACE FUNCTION cleanup_old_carts()
RETURNS void AS $$
BEGIN
    -- Delete carts older than 24 hours that haven't been checked out
    DELETE FROM cart 
    WHERE checked_out = false 
    AND time_created < NOW() - INTERVAL '24 hours';
END;
$$ language 'plpgsql';

-- Function to get order summary
CREATE OR REPLACE FUNCTION get_order_summary(order_id_param INTEGER)
RETURNS TABLE (
    order_id INTEGER,
    table_number INTEGER,
    total_amount DECIMAL(10,2),
    item_count INTEGER,
    order_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_id,
        c.table_number,
        c.total_price,
        COUNT(ci.cartitem_id)::INTEGER as item_count,
        CASE 
            WHEN o.iscancelled THEN 'Cancelled'
            WHEN o.isfinished THEN 'Finished'
            ELSE 'Pending'
        END as order_status
    FROM "order" o
    JOIN cart c ON o.cart_id = c.cart_id
    LEFT JOIN cartitem ci ON c.cart_id = ci.cart_id
    WHERE o.order_id = order_id_param
    GROUP BY o.order_id, c.table_number, c.total_price, o.iscancelled, o.isfinished;
END;
$$ language 'plpgsql';