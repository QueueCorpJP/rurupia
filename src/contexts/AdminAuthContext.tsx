import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Remove the admin client to avoid circular dependency issues
// import { supabaseAdmin } from '@/integrations/supabase/admin-client';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  initializeAdminSession: () => Promise<void>;
  adminUserId: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'serenitysage_admin',
  password: '5ecurity@SageAdmin2025'
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminSession = () => {
      const adminSession = localStorage.getItem('admin_session');
      const storedAdminId = localStorage.getItem('admin_user_id');
      setIsAdminAuthenticated(!!adminSession);
      setAdminUserId(storedAdminId);
    };

    checkAdminSession();
  }, []);

  const initializeAdminSession = async () => {
    try {
      // First check if admin session already exists
      const adminSession = localStorage.getItem('admin_session');
      const storedAdminId = localStorage.getItem('admin_user_id');
      
      if (adminSession === 'true' && storedAdminId) {
        console.log('Admin session already initialized with ID:', storedAdminId);
        setAdminUserId(storedAdminId);
        return;
      }
      
      // Hard-coded admin user ID (from logs: 5748e2f5-c12e-45a6-b240-6874281362da)
      // This ensures we always have a valid admin ID for development
      const adminId = '5748e2f5-c12e-45a6-b240-6874281362da';
      localStorage.setItem('admin_user_id', adminId);
      setAdminUserId(adminId);
      console.log('Admin session initialized with ID:', adminId);
      return;
      
      // The code below is kept for reference but we're using the hard-coded ID above
      /*
      // Use regular client with RLS policies instead of admin client
      // This relies on having proper RLS policies configured for admin users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'admin')
        .limit(1);

      if (error) {
        console.error('Error fetching admin profile:', error.message);
        return;
      }

      if (profiles && profiles.length > 0) {
        const adminId = profiles[0].id;
        localStorage.setItem('admin_user_id', adminId);
        setAdminUserId(adminId);
        console.log('Admin session initialized with ID:', adminId);
      } else {
        console.error('Admin profile not found');
      }
      */
    } catch (error) {
      console.error('Error in initializeAdminSession:', error);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('admin_session', 'true');
      setIsAdminAuthenticated(true);
      
      // Initialize Supabase session with admin account
      await initializeAdminSession();
      
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user_id');
    setIsAdminAuthenticated(false);
    setAdminUserId(null);
    supabase.auth.signOut();
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
      initializeAdminSession,
      adminUserId
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 