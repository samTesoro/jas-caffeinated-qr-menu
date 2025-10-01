-- Sample data for the QR Menu system
-- Run this after creating the tables with complete_schema.sql

-- Insert sample admin users (passwords should be hashed in production)
INSERT INTO public.adminusers (username, password, view_orders, view_history, view_menu, view_super, view_reviews, is_blocked) VALUES
('admin', 'admin123', true, true, true, true, true, false),
('manager', 'manager123', true, true, true, false, true, false),
('staff', 'staff123', false, false, true, false, false, false);

-- Insert sample menu items
INSERT INTO public.menuitem (name, category, price, status, thumbnail, description, is_favorites, est_time) VALUES
-- Meals
('Fried Chicken', 'Meals', 250.00, 'Available', '/images/fried-chicken.jpg', 'Crispy golden fried chicken served with rice and vegetables', true, 15),
('Beef Steak', 'Meals', 350.00, 'Available', '/images/beef-steak.jpg', 'Tender beef steak grilled to perfection with mashed potatoes', true, 20),
('Fish Fillet', 'Meals', 280.00, 'Available', '/images/fish-fillet.jpg', 'Fresh fish fillet with lemon butter sauce and steamed vegetables', false, 12),
('Pasta Carbonara', 'Meals', 220.00, 'Available', '/images/pasta-carbonara.jpg', 'Creamy pasta with bacon and parmesan cheese', true, 10),
('Chicken Adobo', 'Meals', 200.00, 'Available', '/images/chicken-adobo.jpg', 'Traditional Filipino chicken adobo with rice', true, 18),

-- Coffee
('Americano', 'Coffee', 120.00, 'Available', '/images/americano.jpg', 'Strong black coffee, perfect for coffee lovers', false, 3),
('Cappuccino', 'Coffee', 150.00, 'Available', '/images/cappuccino.jpg', 'Espresso with steamed milk and foam art', true, 5),
('Latte', 'Coffee', 160.00, 'Available', '/images/latte.jpg', 'Smooth espresso with steamed milk', true, 5),
('Mocha', 'Coffee', 180.00, 'Available', '/images/mocha.jpg', 'Rich chocolate coffee with whipped cream', true, 6),
('Espresso', 'Coffee', 100.00, 'Available', '/images/espresso.jpg', 'Pure and strong espresso shot', false, 2),

-- Drinks
('Fresh Orange Juice', 'Drinks', 80.00, 'Available', '/images/orange-juice.jpg', 'Freshly squeezed orange juice', false, 2),
('Iced Tea', 'Drinks', 60.00, 'Available', '/images/iced-tea.jpg', 'Refreshing iced tea with lemon', true, 2),
('Mango Shake', 'Drinks', 120.00, 'Available', '/images/mango-shake.jpg', 'Thick and creamy mango shake', true, 4),
('Soda (Coke/Sprite)', 'Drinks', 50.00, 'Available', '/images/soda.jpg', 'Ice-cold soda drinks', false, 1),
('Bottled Water', 'Drinks', 30.00, 'Available', '/images/water.jpg', 'Purified bottled water', false, 1);

-- Insert sample customers
INSERT INTO public.customer (table_num, is_active) VALUES
(1, true),
(2, true),
(3, false),
(4, true),
(5, true),
(6, true),
(7, false),
(8, true);

-- Sample cart (for testing - normally created by the application)
INSERT INTO public.cart (session_id, total_price, checked_out, table_number) VALUES
('sample-session-123', 0.0, false, 1);

-- Note: Orders and cart items are typically created through the application
-- The above provides a foundation for testing the system