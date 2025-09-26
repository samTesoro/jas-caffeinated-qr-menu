-- Sample data for testing the QR Menu system
-- Run this to populate your database with sample data

-- Insert sample menu items
INSERT INTO menuitem (name, category, price, status, thumbnail, favorites, estimatedTime, description) VALUES
-- Meals
('Fried Chicken', 'Meals', 250.00, 'Available', '/images/fried-chicken.jpg', 'Yes', 15, 'Crispy golden fried chicken served with rice and vegetables'),
('Beef Steak', 'Meals', 350.00, 'Available', '/images/beef-steak.jpg', 'Yes', 20, 'Tender beef steak grilled to perfection with mashed potatoes'),
('Fish Fillet', 'Meals', 280.00, 'Available', '/images/fish-fillet.jpg', 'No', 12, 'Fresh fish fillet with lemon butter sauce and steamed vegetables'),
('Pasta Carbonara', 'Meals', 220.00, 'Available', '/images/pasta-carbonara.jpg', 'Yes', 10, 'Creamy pasta with bacon and parmesan cheese'),
('Chicken Adobo', 'Meals', 200.00, 'Available', '/images/chicken-adobo.jpg', 'Yes', 18, 'Traditional Filipino chicken adobo with rice'),

-- Coffee
('Americano', 'Coffee', 120.00, 'Available', '/images/americano.jpg', 'No', 3, 'Strong black coffee, perfect for coffee lovers'),
('Cappuccino', 'Coffee', 150.00, 'Available', '/images/cappuccino.jpg', 'Yes', 5, 'Espresso with steamed milk and foam art'),
('Latte', 'Coffee', 160.00, 'Available', '/images/latte.jpg', 'Yes', 5, 'Smooth espresso with steamed milk'),
('Mocha', 'Coffee', 180.00, 'Available', '/images/mocha.jpg', 'Yes', 6, 'Rich chocolate coffee with whipped cream'),
('Espresso', 'Coffee', 100.00, 'Available', '/images/espresso.jpg', 'No', 2, 'Pure and strong espresso shot'),

-- Drinks
('Fresh Orange Juice', 'Drinks', 80.00, 'Available', '/images/orange-juice.jpg', 'No', 2, 'Freshly squeezed orange juice'),
('Iced Tea', 'Drinks', 60.00, 'Available', '/images/iced-tea.jpg', 'Yes', 2, 'Refreshing iced tea with lemon'),
('Mango Shake', 'Drinks', 120.00, 'Available', '/images/mango-shake.jpg', 'Yes', 4, 'Thick and creamy mango shake'),
('Soda (Coke/Sprite)', 'Drinks', 50.00, 'Available', '/images/soda.jpg', 'No', 1, 'Ice-cold soda drinks'),
('Bottled Water', 'Drinks', 30.00, 'Available', '/images/water.jpg', 'No', 1, 'Purified bottled water');

-- Insert sample customers
INSERT INTO customer (table_num, is_active) VALUES
(1, true),
(2, true),
(3, false),
(4, true),
(5, true);

-- Insert sample notes (for tutorial)
INSERT INTO notes (title, content) VALUES
('Welcome Note', 'Welcome to JAS Caffeinated QR Menu System!'),
('System Info', 'This is a demo note for the tutorial system.');

-- Note: You'll need to manually create admin users through Supabase Auth
-- Then insert their permissions into adminusers table like this:
-- INSERT INTO adminusers (user_id, view_menu, view_orders, view_super, view_history, view_reviews, is_blocked) 
-- VALUES ('your-auth-user-uuid', true, true, true, true, true, false);