import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

// Constants
const AUTH_TIMEOUT = 1000; // Reduced from 3000ms to 1000ms for better UX
const LOCAL_STORAGE_USER_TYPE_KEY = 'nokutoru_user_type';
const SUPABASE_INIT_DELAY = 50; // Small delay to ensure Supabase is initialized

export function UserNav() {
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(() => {
    // Initialize userType from localStorage if available
    return localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
  });
  // Initialize loading to false if we already have cached userType
  const [loading, setLoading] = useState(!localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY));
  const authTimeoutRef = useRef<number | null>(null);
  const authCheckRunningRef = useRef(false);

  useEffect(() => {
    // Initialize session from existing data first
    const cachedUserType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
    if (cachedUserType) {
      console.log("UserNav: Using cached user type on initial render:", cachedUserType);
      setUserType(cachedUserType);
      setLoading(false);
    }

    const getUser = async () => {
      // Prevent multiple simultaneous auth checks
      if (authCheckRunningRef.current) {
        console.log("UserNav: Auth check already running, skipping");
        return;
      }
      
      authCheckRunningRef.current = true;
      
      try {
        // Only set loading=true if we don't have cached data
        if (!localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY)) {
          console.log("UserNav: Starting user check");
          setLoading(true);
        }
        
        // Set a timeout to ensure we don't get stuck in loading state
        if (authTimeoutRef.current) {
          window.clearTimeout(authTimeoutRef.current);
        }
        
        authTimeoutRef.current = window.setTimeout(() => {
          console.log("UserNav: Auth timeout triggered, forcing loading to false");
          setLoading(false);
        }, AUTH_TIMEOUT);
        
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email || null);
        console.log("UserNav: User check result:", user ? "User found" : "No user");
        
        if (user) {
          // Try to get cached user type first as a fallback
          const cachedUserType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
          if (cachedUserType) {
            console.log("UserNav: Using cached user type:", cachedUserType);
            setUserType(cachedUserType);
            setLoading(false);
            
            // Still verify in the background but don't show loading state
            verifyUserTypeInBackground(user.id, cachedUserType);
            return;
          }
          
          // If no cached data, proceed with regular checks
          let userTypeFound = false;
          
          try {
            // First check if user is a store
            const { data: storeData, error: storeError } = await supabase
              .from('stores')
              .select('id')
              .eq('id', user.id)
              .maybeSingle();
              
            // Check if there's an infinite recursion error
            if (storeError && storeError.message.includes('infinite recursion')) {
              console.error("UserNav: RLS infinite recursion error on stores check, using fallback");
              if (cachedUserType) {
                userTypeFound = true;
                // Already set from cache above
              }
            } else {
              console.log("UserNav: Store check result:", storeData ? "Is store" : "Not store", storeError ? `Error: ${storeError.message}` : "");
                
              if (storeData) {
                console.log("UserNav: Setting user type to store");
                setUserType('store');
                localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'store');
                userTypeFound = true;
              } else {
                // Then check if user is a therapist
                try {
                  const { data: therapistData, error: therapistError } = await supabase
                    .from('therapists')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle();
                    
                  // Check if there's an infinite recursion error
                  if (therapistError && therapistError.message.includes('infinite recursion')) {
                    console.error("UserNav: RLS infinite recursion error on therapists check, using fallback");
                    if (cachedUserType) {
                      userTypeFound = true;
                      // Already set from cache above
                    }
                  } else {
                    console.log("UserNav: Therapist check result:", therapistData ? "Is therapist" : "Not therapist", therapistError ? `Error: ${therapistError.message}` : "");
                      
                    if (therapistData) {
                      console.log("UserNav: Setting user type to therapist");
                      setUserType('therapist');
                      localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'therapist');
                      userTypeFound = true;
                    } else {
                      // Fallback to checking the profiles table
                      try {
                        const { data: profileData, error: profileError } = await supabase
                          .from('profiles')
                          .select('user_type')
                          .eq('id', user.id)
                          .maybeSingle();
                        
                        // Check if there's an infinite recursion error
                        if (profileError && profileError.message.includes('infinite recursion')) {
                          console.error("UserNav: RLS infinite recursion error on profiles check, using fallback");
                          if (cachedUserType) {
                            userTypeFound = true;
                            // Already set from cache above
                          }
                        } else {
                          console.log("UserNav: Profile check result:", profileData ? `Type: ${profileData?.user_type}` : "No profile data", profileError ? `Error: ${profileError.message}` : "");
                          
                          if (profileData?.user_type) {
                            console.log("UserNav: Setting user type from profile:", profileData.user_type);
                            setUserType(profileData.user_type);
                            localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, profileData.user_type);
                            userTypeFound = true;
                          }
                        }
                      } catch (profileError) {
                        console.error("UserNav: Error checking profiles table:", profileError);
                      }
                    }
                  }
                } catch (therapistError) {
                  console.error("UserNav: Error checking therapists table:", therapistError);
                }
              }
            }
          } catch (storeError) {
            console.error("UserNav: Error checking stores table:", storeError);
          }
          
          // Final fallback: If we couldn't determine the user type from any source
          if (!userTypeFound && !userType) {
            console.log("UserNav: Defaulting to user type after all checks failed");
            setUserType('user');
            localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'user');
          }
        } else {
          // No user, clear user data
          setUserEmail(null);
          setUserType(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
        }
      } catch (error) {
        console.error("UserNav: Error fetching user data:", error);
      } finally {
        console.log("UserNav: User check completed, setting loading to false");
        setLoading(false);
        // Clear the timeout since we're done
        if (authTimeoutRef.current) {
          window.clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }
        authCheckRunningRef.current = false;
      }
    };
    
    // Verify user type in background without showing loading state
    const verifyUserTypeInBackground = async (userId: string, cachedType: string) => {
      try {
        console.log("UserNav: Verifying user type in background");
        
        // Check the appropriate table based on cached type
        if (cachedType === 'store') {
          const { data } = await supabase
            .from('stores')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
            
          if (!data) {
            console.log("UserNav: Cached store type may be incorrect, running full auth check");
            getUser();
          }
        } else if (cachedType === 'therapist') {
          const { data } = await supabase
            .from('therapists')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
            
          if (!data) {
            console.log("UserNav: Cached therapist type may be incorrect, running full auth check");
            getUser();
          }
        } else {
          // For regular users or unknown types, verify against profiles
          const { data } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', userId)
            .maybeSingle();
            
          if (data?.user_type && data.user_type !== cachedType) {
            console.log("UserNav: User type changed in database, updating");
            setUserType(data.user_type);
            localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, data.user_type);
          }
        }
      } catch (error) {
        console.error("UserNav: Background verification error:", error);
        // No need to update state on background check errors
      }
    };
    
    // Add a small delay before first check to ensure Supabase is initialized
    const initTimeout = setTimeout(() => {
      getUser();
    }, SUPABASE_INIT_DELAY);
    
    return () => {
      // Clear any remaining timeout on unmount
      if (authTimeoutRef.current) {
        window.clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      clearTimeout(initTimeout);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Check if the current path is in the admin section
      const isAdminPath = window.location.pathname.startsWith('/admin');
      
      if (isAdminPath) {
        // Use admin logout for admin section
        adminLogout();
      } else {
        // Use regular logout for other sections
        await supabase.auth.signOut();
      }
      
      localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
      navigate('/');
      toast.success('ログアウトしました');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  const handleSettings = () => {
    // Navigate to different settings pages based on user type
    if (userType === 'store') {
      navigate('/store-admin/settings');
    } else if (userType === 'therapist') {
      navigate('/therapist-dashboard');
    } else {
      navigate('/user-profile');
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-10 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar.png" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userType === 'store' ? '店舗管理者' : 
               userType === 'therapist' ? 'セラピスト' : 'ユーザー'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail || '読み込み中...'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>アカウント設定</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>ログアウト</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
