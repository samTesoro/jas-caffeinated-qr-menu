-- Add a unique session_id to customer to bind a session to only one customer
-- Safe to run multiple times

ALTER TABLE IF EXISTS public.customer
  ADD COLUMN IF NOT EXISTS session_id text;

-- Make session_id unique across customers when provided
CREATE UNIQUE INDEX IF NOT EXISTS uniq_customer_session_id
  ON public.customer (session_id)
  WHERE session_id IS NOT NULL;

-- Helpful index for active customers by table
CREATE INDEX IF NOT EXISTS idx_customer_active_table
  ON public.customer (table_num)
  WHERE is_active IS TRUE;
