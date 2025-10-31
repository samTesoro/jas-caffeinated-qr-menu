// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Use environment variables so local/hosted setups behave the same.
// Browser-accessible vars must be NEXT_PUBLIC_ prefixed.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

export const supabase = createClient(supabaseUrl, supabaseKey)