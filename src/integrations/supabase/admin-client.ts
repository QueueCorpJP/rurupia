import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Admin client for unrestricted database access using the service role key
// This bypasses Row Level Security (RLS) policies
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Import this client for admin operations like this:
// import { supabaseAdmin } from "@/integrations/supabase/admin-client";

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false, // Don't persist admin sessions
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        // Add a custom header to identify admin requests
        'x-admin-auth': 'true'
      }
    }
  }
); 