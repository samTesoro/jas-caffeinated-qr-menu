-- Remove the old UNIQUE constraint on session_id (if it exists)
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_session_id_key;

-- Create a partial unique index so only one open cart per session is allowed
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_cart_per_session
ON cart(session_id)
WHERE checked_out = false;
