import { createClient } from '@supabase/supabase-js'

// These values are automatically injected by Lovable when connected to Supabase
const supabaseUrl = 'https://YOUR_PROJECT_URL.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please make sure you have connected your Supabase project in Lovable.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)