// Configuration service to fetch environment variables from API
let configCache: any = null;

export async function getConfig() {
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    configCache = await response.json();
    return configCache;
  } catch (error) {
    console.error('Error fetching config:', error);
    // Fallback to environment variables for development
    return {
      VITE_TINYMCE_API_KEY: (import.meta as any).env?.VITE_TINYMCE_API_KEY,
      VITE_APP_LINE_CLIENT_ID: (import.meta as any).env?.VITE_APP_LINE_CLIENT_ID,
      VITE_APP_LINE_CLIENT_SECRET: (import.meta as any).env?.VITE_APP_LINE_CLIENT_SECRET,
      VITE_SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
    };
  }
}

// Helper functions to get specific config values
export async function getTinyMCEApiKey() {
  const config = await getConfig();
  return config.VITE_TINYMCE_API_KEY;
}

export async function getLineClientId() {
  const config = await getConfig();
  return config.VITE_APP_LINE_CLIENT_ID;
}

export async function getLineClientSecret() {
  const config = await getConfig();
  return config.VITE_APP_LINE_CLIENT_SECRET;
}

export async function getSupabaseUrl() {
  const config = await getConfig();
  return config.VITE_SUPABASE_URL;
}

export async function getSupabaseAnonKey() {
  const config = await getConfig();
  return config.VITE_SUPABASE_ANON_KEY;
} 