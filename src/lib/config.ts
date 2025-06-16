// Configuration service to fetch environment variables from API
let configCache: any = null;

export async function getConfig() {
  // Only return cache if it has valid Supabase config
  if (configCache && configCache.VITE_SUPABASE_URL && configCache.VITE_SUPABASE_ANON_KEY) {
    return configCache;
  }

  // First try environment variables directly
  const envConfig = {
    VITE_TINYMCE_API_KEY: (import.meta as any).env?.VITE_TINYMCE_API_KEY,
    VITE_APP_LINE_CLIENT_ID: (import.meta as any).env?.VITE_APP_LINE_CLIENT_ID,
    VITE_APP_LINE_CLIENT_SECRET: (import.meta as any).env?.VITE_APP_LINE_CLIENT_SECRET,
    VITE_SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
  };

  // If we have Supabase env vars, use them directly
  if (envConfig.VITE_SUPABASE_URL && envConfig.VITE_SUPABASE_ANON_KEY) {
    configCache = envConfig;
    return configCache;
  }

  // Otherwise try the API
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    const text = await response.text();
    
    // Check if response is JSON
    if (!text.trim().startsWith('{')) {
      throw new Error('API returned non-JSON response');
    }
    
    const apiConfig = JSON.parse(text);
    // Only cache if we have valid Supabase config
    if (apiConfig.VITE_SUPABASE_URL && apiConfig.VITE_SUPABASE_ANON_KEY) {
      configCache = apiConfig;
      return configCache;
    }
  } catch (error) {
    console.error('Error fetching config:', error);
  }
  
  // Final fallback to environment variables (even if incomplete)
  console.warn('Using environment variables as fallback config');
  configCache = envConfig;
  return configCache;
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