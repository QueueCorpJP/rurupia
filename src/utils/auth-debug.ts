/**
 * Auth Debugging Utilities
 * 
 * These functions can be called from the browser console to help debug authentication issues.
 * To use: 
 * 1. Import this file in your main component (e.g., App.tsx)
 * 2. Add: window.authDebug = authDebug;
 * 3. Access in console: authDebug.checkState(), authDebug.clearAll(), etc.
 */

import { supabase } from "@/integrations/supabase/client";
import { clearAuthState, forceSignOut } from "@/integrations/supabase/client";

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Constants
const LOCAL_STORAGE_USER_TYPE_KEY = 'nokutoru_user_type';
const SUPABASE_AUTH_KEY = 'therapist-app-auth';

// Define the window augmentation for TypeScript
declare global {
  interface Window {
    authDebug: typeof authDebug;
  }
}

export const authDebug = {
  /**
   * Check current auth state from all sources
   */
  async checkState() {
    if (!isBrowser) return { error: 'Not in browser environment' };
    
    try {
      // Get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Get localStorage items
      const userType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
      const supabaseAuth = localStorage.getItem(SUPABASE_AUTH_KEY);
      const adminSession = localStorage.getItem('admin_session');
      const adminUserId = localStorage.getItem('admin_user_id');
      
      // Get all localStorage keys for inspection
      const allKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('sb-') ||
        key.includes('nokutoru')
      );

      // Get additional localStorage items for more detailed inspection
      const userTypeKey = localStorage.getItem('therapist-app-userType');
      const authHash = localStorage.getItem('supabase.auth.token');
      const refreshToken = localStorage.getItem('supabase.auth.refreshToken');
      const sbLocalStorage = Object.keys(localStorage).filter(key => key.startsWith('supabase')).reduce((obj, key) => {
        obj[key] = localStorage.getItem(key);
        return obj;
      }, {});
      
      // Prepare result
      const result = {
        session: session ? {
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            aud: session.user.aud,
            lastSignIn: session.user.last_sign_in_at
          },
          expires_at: session.expires_at,
          tokenType: session.token_type,
          hasAccessToken: !!session.access_token,
          hasRefreshToken: !!session.refresh_token
        } : null,
        sessionError: error,
        localStorage: {
          userType,
          userTypeAlternate: userTypeKey,
          hasSupabaseAuth: !!supabaseAuth,
          hasAuthHash: !!authHash,
          hasRefreshToken: !!refreshToken,
          adminSession,
          adminUserId,
          relevantKeys: allKeys,
          otherSupabaseKeys: Object.keys(sbLocalStorage)
        },
        state: {
          isLoggedIn: !!session,
          hasUserType: !!userType || !!userTypeKey,
          hasAdminSession: adminSession === 'true',
          sync: {
            isInSync: !!session === !!(userType || userTypeKey),
            details: !!session !== !!(userType || userTypeKey) ? 'Session and userType are out of sync' : 'In sync',
          }
        }
      };
      
      console.log('Auth Debug State:', result);
      console.log("\nAvailable commands:");
      console.log("- authDebug.fixUserTypeMismatch(): Fix user type if it's not matching session");
      console.log("- authDebug.forceSignOut(): Force clear all auth states and sign out");
      console.log("- authDebug.hardReset(): ✨NEW✨ Complete auth storage reset + page reload");
      
      return result;
    } catch (error) {
      console.error('Error in authDebug.checkState:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  
  /**
   * Clear all auth state
   */
  clearAll() {
    try {
      clearAuthState();
      console.log('All auth state cleared');
      return { success: true };
    } catch (error) {
      console.error('Error in authDebug.clearAll:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  
  /**
   * Force sign out and clear everything
   */
  async forceSignOut() {
    try {
      // First try original forceSignOut
      const result = await forceSignOut();
      
      // Additional cleanup for thoroughness
      clearAuthState();
      localStorage.removeItem('therapist-app-userType');
      
      // More aggressive cleanup
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase') || key.includes('auth') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log("All auth state cleared. Refresh the page to apply changes.");
      return result;
    } catch (error) {
      console.error('Error in authDebug.forceSignOut:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  
  /**
   * Fix mismatched state
   */
  async fixState() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
      
      if (session && !userType) {
        // There's a session but no userType, set default
        localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'user');
        console.log('Fixed missing userType by setting default');
        return { fixed: 'Added missing userType', action: 'added_user_type' };
      } else if (!session && userType) {
        // There's a userType but no session, clear it
        localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
        console.log('Fixed stale userType by removing it');
        return { fixed: 'Removed stale userType', action: 'removed_user_type' };
      } else {
        console.log('No state mismatch detected');
        return { fixed: false, message: 'No state mismatch detected' };
      }
    } catch (error) {
      console.error('Error in authDebug.fixState:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Fix the user type in localStorage if it doesn't match with session
  async fixUserTypeMismatch() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session found. Nothing to fix.");
      return;
    }
    
    try {
      // Check the user's profile in the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error("Error checking profile:", profileError);
        console.log("Attempting fallback query...");
        
        // Try again with a different approach
        const { data: adminData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (adminData?.user_type) {
          console.log(`Found user type: ${adminData.user_type}`);
          localStorage.setItem('therapist-app-userType', adminData.user_type);
          console.log("Fixed userType in localStorage. Refresh the page to apply.");
          return;
        } else {
          console.log("No profile found in database. Setting default 'customer' type");
          localStorage.setItem('therapist-app-userType', 'customer');
          console.log("Set default userType in localStorage. Refresh the page to apply.");
          return;
        }
      }
      
      console.log(`Found user type: ${profileData.user_type}`);
      localStorage.setItem('therapist-app-userType', profileData.user_type);
      console.log("Fixed userType in localStorage. Refresh the page to apply.");
    } catch (err) {
      console.error("Error fixing user type:", err);
    }
  },

  // Hard reset - completely clear all storage and reload
  async hardReset() {
    try {
      console.log("Performing complete auth state reset...");
      
      // First try to sign out properly
      await supabase.auth.signOut().catch(e => console.log("SignOut error:", e));
      
      // Clear all localStorage
      localStorage.clear();
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear cookies related to auth
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log("Storage cleared. Reloading page in 2 seconds...");
      
      // Reload the page with a slight delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
      return true;
    } catch (err) {
      console.error("Hard reset error:", err);
      return false;
    }
  }
};

// Add to window in browser environment
if (isBrowser) {
  window.authDebug = authDebug;
} 