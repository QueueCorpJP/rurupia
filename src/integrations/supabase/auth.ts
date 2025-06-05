import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getConfig } from '../../lib/config';

// A true singleton: created exactly once per browser tab.
let supabaseSingleton: ReturnType<typeof createClient<Database>> | undefined;

// Helper with retry so first page load does not fail if /api/config is cold.
async function initSingleton(): Promise<ReturnType<typeof createClient<Database>>> {
  if (supabaseSingleton) return supabaseSingleton;

  let attempts = 0;
  let cfg: any = undefined;
  while (attempts < 3) {
    cfg = await getConfig();
    if (cfg?.VITE_SUPABASE_URL && cfg?.VITE_SUPABASE_ANON_KEY) break;
    attempts += 1;
    console.warn(`Auth config missing (attempt ${attempts}). Retrying...`);
    await new Promise(res => setTimeout(res, 500 * attempts));
  }

  if (!cfg?.VITE_SUPABASE_URL || !cfg?.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase env vars unavailable after retries');
  }

  supabaseSingleton = createClient<Database>(
    cfg.VITE_SUPABASE_URL,
    cfg.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        storageKey: 'therapist-app-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  );

  return supabaseSingleton;
}

export async function getSupabaseAuth() {
  return await initSingleton();
}

// Convenience promise export for modules that just need the client.
export const supabaseAuth = initSingleton(); 