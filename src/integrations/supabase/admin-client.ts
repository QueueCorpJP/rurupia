import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ⚠️ WARNING: SECURITY RISK ⚠️
// This admin client bypasses Row Level Security (RLS) policies using the service role key.
// ONLY import this client in:
//   1. Server-side code (API routes, Edge functions)
//   2. Admin-specific pages that are protected by authentication
// NEVER import this in general components or pages accessible to all users
// NEVER use this client in client-side code that runs for all visitors
// Misuse could expose sensitive data or allow unauthorized database operations

// Admin client for unrestricted database access using the service role key
// This bypasses Row Level Security (RLS) policies
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validation to ensure environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing Supabase admin environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set.'
  );
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