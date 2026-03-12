// src/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Read environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug log to check if environment variables are loaded correctly
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'Missing')

// Throw error early if missing (prevents blank page issues)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not found!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey)
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or Netlify environment variables.'
  )
}

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Optional: helper to check connection (for debugging only)
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('your_table_name').select('*').limit(1)
    if (error) {
      console.error('Supabase test query error:', error)
    } else {
      console.log('Supabase test query success:', data)
    }
  } catch (err) {
    console.error('Supabase test connection failed:', err)
  }
}