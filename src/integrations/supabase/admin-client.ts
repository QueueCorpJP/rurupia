import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Admin client for unrestricted database access using the service role key
// This bypasses Row Level Security (RLS) policies
const SUPABASE_URL = "https://vvwkuqnotnilsbcswfqu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d2t1cW5vdG5pbHNiY3N3ZnF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjEyNjg2MywiZXhwIjoyMDU3NzAyODYzfQ.8nBw2_MVOjojRhPqWHLFKVK6zfuQfQJy031kcKRK3bQ";

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