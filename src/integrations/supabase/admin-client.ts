import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getConfig } from '../../lib/config';
import { getSupabaseAuth } from './auth';

// ⚠️ WARNING: SECURITY RISK ⚠️
// This admin client bypasses Row Level Security (RLS) policies using the service role key.
// ONLY import this client in:
//   1. Server-side code (API routes, Edge functions)
//   2. Admin-specific pages that are protected by authentication
// NEVER import this in general components or pages accessible to all users
// NEVER use this client in client-side code that runs for all visitors
// Misuse could expose sensitive data or allow unauthorized database operations

// Admin client singleton - uses service role key for admin operations
let adminClient: any = null;

// Initialize admin client with service role key
async function initializeAdminClient() {
  if (adminClient) {
    return adminClient;
  }
  
  try {
    const config = await getConfig();
    const SUPABASE_URL = config.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = config.VITE_SUPABASE_SERVICE_ROLE_KEY;

    // Validation to ensure environment variables are loaded
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'Missing Supabase admin environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set.'
      );
    }

    adminClient = createClient<Database>(
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

    return adminClient;
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error);
    throw error;
  }
}

// For admin operations, we need service role privileges, so use admin client
// But provide synchronous interface like the regular client
export const supabaseAdmin = {
  from: (table: string) => {
    // Return an object that provides the query builder interface for admin operations
    return {
      select: (...args: any[]) => {
        // Return a chainable object
        const createChain = (operations: Array<[string, any[]]>) => ({
          eq: (...eqArgs: any[]) => createChain([...operations, ['eq', eqArgs]]),
          gte: (...gteArgs: any[]) => createChain([...operations, ['gte', gteArgs]]),
          lte: (...lteArgs: any[]) => createChain([...operations, ['lte', lteArgs]]),
          order: (...orderArgs: any[]) => createChain([...operations, ['order', orderArgs]]),
          limit: (...limitArgs: any[]) => createChain([...operations, ['limit', limitArgs]]),
          single: async () => {
            const client = await initializeAdminClient();
            let query = client.from(table).select(...args);
            for (const [method, methodArgs] of operations) {
              query = query[method](...methodArgs);
            }
            return query.single();
          },
          maybeSingle: async () => {
            const client = await initializeAdminClient();
            let query = client.from(table).select(...args);
            for (const [method, methodArgs] of operations) {
              query = query[method](...methodArgs);
            }
            return query.maybeSingle();
          },
          // Make it thenable so it can be awaited directly
          then: async (resolve: any, reject: any) => {
            try {
              const client = await initializeAdminClient();
              let query = client.from(table).select(...args);
              for (const [method, methodArgs] of operations) {
                query = query[method](...methodArgs);
              }
              const result = await query;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        });
        
        return createChain([]);
      },
      
      insert: (...args: any[]) => ({
        select: async (...selectArgs: any[]) => {
          const client = await initializeAdminClient();
          return client.from(table).insert(...args).select(...selectArgs);
        },
        then: async (resolve: any, reject: any) => {
          try {
            const client = await initializeAdminClient();
            const result = await client.from(table).insert(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      }),
      
      update: (...args: any[]) => ({
        eq: (...eqArgs: any[]) => ({
          select: async (...selectArgs: any[]) => {
            const client = await initializeAdminClient();
            return client.from(table).update(...args).eq(...eqArgs).select(...selectArgs);
          },
          then: async (resolve: any, reject: any) => {
            try {
              const client = await initializeAdminClient();
              const result = await client.from(table).update(...args).eq(...eqArgs);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        }),
        then: async (resolve: any, reject: any) => {
          try {
            const client = await initializeAdminClient();
            const result = await client.from(table).update(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      }),
      
      delete: () => ({
        eq: async (...eqArgs: any[]) => {
          const client = await initializeAdminClient();
          return client.from(table).delete().eq(...eqArgs);
        }
      }),
      
      upsert: async (...args: any[]) => {
        const client = await initializeAdminClient();
        return client.from(table).upsert(...args);
      }
    };
  },
  
  rpc: async (functionName: string, params: any) => {
    const client = await initializeAdminClient();
    return client.rpc(functionName, params);
  },
  
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File, options?: any) => {
        const client = await initializeAdminClient();
        return client.storage.from(bucket).upload(path, file, options);
      },
      getPublicUrl: async (path: string) => {
        try {
          const client = await initializeAdminClient();
          const urlResult = client.storage.from(bucket).getPublicUrl(path);
          return {
            data: {
              publicUrl: urlResult.data.publicUrl
            }
          };
        } catch (error) {
          console.error('Error getting public URL:', error);
          return {
            data: {
              publicUrl: ''
            }
          };
        }
      },
      download: async (path: string) => {
        const client = await initializeAdminClient();
        return client.storage.from(bucket).download(path);
      },
      remove: async (paths: string[]) => {
        const client = await initializeAdminClient();
        return client.storage.from(bucket).remove(paths);
      }
    })
  },
  
  // Admin-specific operations that require service role
  auth: {
    admin: {
      createUser: async (userData: any) => {
        const client = await initializeAdminClient();
        return client.auth.admin.createUser(userData);
      },
      
      updateUserById: async (userId: string, userData: any) => {
        const client = await initializeAdminClient();
        return client.auth.admin.updateUserById(userId, userData);
      },
      
      deleteUser: async (userId: string) => {
        const client = await initializeAdminClient();
        return client.auth.admin.deleteUser(userId);
      },
      
      listUsers: async (options?: any) => {
        const client = await initializeAdminClient();
        return client.auth.admin.listUsers(options);
      }
    }
  }
}; 