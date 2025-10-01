-- Allow multiple carts per session_id historically, but enforce only one open cart per session
-- Safe to run multiple times (IF NOT EXISTS)

-- 1) Drop the strict unique constraint on session_id (if it exists)
ALTER TABLE IF EXISTS public.cart
  DROP CONSTRAINT IF EXISTS cart_session_id_key;

-- 2) Ensure there can be only one open (checked_out = false) cart per session_id
-- This allows multiple historical carts with the same session_id once they're checked_out = true
CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_cart_per_session
  ON public.cart (session_id)
  WHERE (checked_out IS FALSE);

-- 3) Helpful index for frequent lookups by (session_id, checked_out) and ordering by time_created
CREATE INDEX IF NOT EXISTS idx_cart_session_checked_out_created
  ON public.cart (session_id, checked_out, time_created DESC);

-- Optional verification queries (run manually if needed):
-- SELECT session_id, COUNT(*)
-- FROM public.cart
-- WHERE checked_out IS FALSE
-- GROUP BY session_id
-- HAVING COUNT(*) > 1;  -- should return 0 rows once index is in place
