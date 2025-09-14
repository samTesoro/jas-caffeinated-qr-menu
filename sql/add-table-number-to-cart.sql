-- Add a table_number column to the cart table
ALTER TABLE cart ADD COLUMN table_number text;

-- Optionally, if you want to enforce that each open cart has a table number, you can add a NOT NULL constraint:
-- ALTER TABLE cart ALTER COLUMN table_number SET NOT NULL;

-- If you want to set the table_number for existing open carts, you can update them as needed:
-- UPDATE cart SET table_number = '<default_or_actual_table>' WHERE table_number IS NULL;