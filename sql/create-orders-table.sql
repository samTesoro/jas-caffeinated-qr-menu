-- Create orders table used by the app
-- Note: This is a guideline SQL. Modify datatypes to match your existing DB conventions.

CREATE TABLE IF NOT EXISTS "order" (
  order_id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customer(customer_id),
  cart_id BIGINT REFERENCES cart(cart_id),
  date_ordered DATE NOT NULL,
  time_ordered TIME NOT NULL,
  payment_type TEXT,
  isfinished BOOLEAN DEFAULT FALSE,
  iscancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON "order" (customer_id);
CREATE INDEX IF NOT EXISTS idx_order_time_ordered ON "order" (time_ordered);
