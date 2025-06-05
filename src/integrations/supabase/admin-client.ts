import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getConfig } from '../../lib/config';

// ⚠️ WARNING: SECURITY RISK ⚠️
// This admin client bypasses Row Level Security (RLS) policies using the service role key.
// ONLY import this client in:
//   1. Server-side code (API routes, Edge functions)
//   2. Admin-specific pages that are protected by authentication
// NEVER import this in general components or pages accessible to all users
// NEVER use this client in client-side code that runs for all visitors
// Misuse could expose sensitive data or allow unauthorized database operations

// Actual Supabase admin client instance
let adminClient: any = null;
let isInitializing = false;

// Initialize admin client synchronously
function getSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }
  
  if (!isInitializing) {
    isInitializing = true;
    
    // Start initialization in background
    initializeAdminClientAsync().then(client => {
      adminClient = client;
      isInitializing = false;
    }).catch(error => {
      console.error('Failed to initialize Supabase admin client:', error);
      isInitializing = false;
    });
  }
  
  // Return a temporary client that will be replaced once initialization is complete
  return createTemporaryAdminClient();
}

// Function to create a temporary admin client that logs errors but doesn't break the app
function createTemporaryAdminClient() {
  // Create a proxy that logs errors for all operations until the real client is ready
  return new Proxy({}, {
    get(target, prop) {
      // For most properties, return a function that logs but doesn't break
      if (prop === 'auth') {
        return createAdminAuthProxy();
      } else if (prop === 'from') {
        return function() {
          return createAdminQueryProxy();
        };
      } else {
        return function() {
          console.log(`Supabase admin client not ready yet, operation '${String(prop)}' queued`);
          return Promise.resolve({ data: null, error: new Error('Admin client not initialized') });
        };
      }
    }
  });
}

// Special proxy for admin auth operations
function createAdminAuthProxy() {
  return new Proxy({}, {
    get(target, prop) {
      return function() {
        console.log(`Supabase admin auth not ready yet, operation '${String(prop)}' queued`);
        return Promise.resolve({ data: { session: null, user: null }, error: null });
      };
    }
  });
}

// Special proxy for admin query operations
function createAdminQueryProxy() {
  return new Proxy({}, {
    get(target, prop) {
      return function() {
        console.log(`Supabase admin query not ready yet, operation '${String(prop)}' queued`);
        return createAdminQueryProxy(); // Return another proxy for chaining
      };
    }
  });
}

// Initialize admin client asynchronously
async function initializeAdminClientAsync() {
  try {
    const config = await getConfig();
    const SUPABASE_URL = config.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = config.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    // Validation to ensure environment variables are loaded
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'Missing Supabase admin environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set.'
      );
    }

    return createClient<Database>(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false, // Don't persist admin sessions in browser
          storageKey: 'therapist-app-admin-auth',
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
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error);
    throw error;
  }
}

// Export the admin client directly - it will initialize lazily
export const supabaseAdmin = getSupabaseAdminClient(); 