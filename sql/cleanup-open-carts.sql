-- Delete all but the latest open cart for each session_id
DELETE FROM cart
WHERE checked_out = false
  AND cart_id NOT IN (
    SELECT MAX(cart_id)
    FROM cart
    WHERE checked_out = false
    GROUP BY session_id
  );

-- To run: Copy this SQL into your Supabase SQL editor and execute.
-- You can schedule this script or run it manually as needed.
