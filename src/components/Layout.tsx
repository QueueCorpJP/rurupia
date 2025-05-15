import { ReactNode, useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, User, BookOpen, Search, Heart, Calendar, Instagram, Facebook, Twitter, Mail, Phone, MapPin, LogOut, Store, Settings, FileText, Bell, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { usePageViewTracking } from '@/hooks/usePageViewTracking';

// Constants
const LOCAL_STORAGE_USER_TYPE_KEY = 'nokutoru_user_type';
const SUPABASE_INIT_DELAY = 50; // Small delay to ensure Supabase is ready

interface LayoutProps {
  children: ReactNode;
  lang?: string;
}

const Layout = ({ children, lang = 'ja-JP' }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(() => {
    // Initialize userType from localStorage if available
    return localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
  });
  // Initialize loading to false if we already have cached userType
  const [loading, setLoading] = useState(!localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY));
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authCheckRunningRef = useRef(false);

  // Add page view tracking
  usePageViewTracking();

  useEffect(() => {
    // Initialize session from existing data first
    const cachedUserType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
    if (cachedUserType) {
      console.log("Using cached user type on initial render:", cachedUserType);
      setUserType(cachedUserType);
      setLoading(false);
    }

    const checkAuth = async () => {
      // Prevent multiple simultaneous auth checks
      if (authCheckRunningRef.current) {
        console.log("Auth check already running, skipping");
        return;
      }
      
      authCheckRunningRef.current = true;
      
      try {
        // Only clear state if we don't have cached data
        if (!localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY)) {
          setUser(null);
          setUserType(null);
          setLoading(true);
        }
        
        console.log("Starting auth check");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session check result:", session ? "Session exists" : "No session");
        
        if (session?.user) {
          setUser(session.user);
          console.log("User ID from session:", session.user.id);
          
          // Try to use admin client first to bypass RLS issues
          try {
            const { data: adminProfileData } = await supabaseAdmin
              .from('profiles')
              .select('user_type')
              .eq('id', session.user.id)
              .maybeSingle();
              
            if (adminProfileData?.user_type) {
              console.log("Setting user type from admin client (checkAuth):", adminProfileData.user_type);
              setUserType(adminProfileData.user_type);
              localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, adminProfileData.user_type);
              setLoading(false);
              authCheckRunningRef.current = false;
              return;
            }
          } catch (adminError) {
            console.error("Admin client profile check failed (checkAuth):", adminError);
            // Continue with regular flow if this fails
          }
          
          // Try to get cached user type first as a fallback
          const cachedUserType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
          if (cachedUserType) {
            console.log("Using cached user type:", cachedUserType);
            setUserType(cachedUserType);
            setLoading(false);
            
            // Still verify in the background but don't show loading state
            verifyUserTypeInBackground(session.user.id, cachedUserType);
            return;
          }
          
          // If no cached data, proceed with regular checks
          let userTypeFound = false;
          
          try {
            // First check if user is a store
            const { data: storeData, error: storeError } = await supabase
              .from('stores')
              .select('id')
              .eq('id', session.user.id)
              .maybeSingle();
            
            // Check if there's an infinite recursion error
            if (storeError && storeError.message.includes('infinite recursion')) {
              console.error("RLS infinite recursion error on stores check, using fallback");
              if (cachedUserType) {
                userTypeFound = true;
                // Already set from cache above
              }
            } else {
              console.log("Store check result:", storeData ? "Is store" : "Not store", storeError ? `Error: ${storeError.message}` : "");
                
              if (storeData) {
                console.log("Setting user type to store");
                setUserType('store');
                localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'store');
                userTypeFound = true;
              } else {
                // Then check if user is a therapist
                try {
                  const { data: therapistData, error: therapistError } = await supabase
                    .from('therapists')
                    .select('id')
                    .eq('id', session.user.id)
                    .maybeSingle();
                  
                  // Check if there's an infinite recursion error
                  if (therapistError && therapistError.message.includes('infinite recursion')) {
                    console.error("RLS infinite recursion error on therapists check, using fallback");
                    if (cachedUserType) {
                      userTypeFound = true;
                      // Already set from cache above
                    }
                  } else {
                    console.log("Therapist check result:", therapistData ? "Is therapist" : "Not therapist", therapistError ? `Error: ${therapistError.message}` : "");
                      
                    if (therapistData) {
                      console.log("Setting user type to therapist");
                      setUserType('therapist');
                      localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'therapist');
                      userTypeFound = true;
                    } else {
                      // If we couldn't determine from tables, try the profiles table as fallback
                      try {
                        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
                          .select('user_type')
            .eq('id', session.user.id)
                          .maybeSingle();
                          
                        // Check if there's an infinite recursion error
                        if (profileError && profileError.message.includes('infinite recursion')) {
                          console.error("RLS infinite recursion error on profiles check, using fallback");
                          if (cachedUserType) {
                            userTypeFound = true;
                            // Already set from cache above
                          }
                        } else {
                          console.log("Profile check result:", profileData ? `Type: ${profileData.user_type}` : "No profile data", profileError ? `Error: ${profileError.message}` : "");
                          
                          if (profileData?.user_type) {
                            console.log("Setting user type from profile:", profileData.user_type);
                            setUserType(profileData.user_type);
                            localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, profileData.user_type);
                            userTypeFound = true;
                          }
                        }
                      } catch (profileError) {
                        console.error("Error checking profiles table:", profileError);
                      }
                    }
                  }
                } catch (therapistError) {
                  console.error("Error checking therapists table:", therapistError);
                }
              }
            }
          } catch (storeError) {
            console.error("Error checking stores table:", storeError);
          }
          
          // Final fallback: If we couldn't determine the user type from any source
          if (!userTypeFound && !userType) {
            console.log("Defaulting to user type after all checks failed");
            setUserType('user');
            localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'user');
          }
        } else {
          // No session, clear user data
          setUser(null);
          setUserType(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Ensure user is logged out if there's an error
        setUser(null);
        setUserType(null);
      } finally {
        console.log("Auth check completed, setting loading to false");
        setLoading(false);
        authCheckRunningRef.current = false;
      }
    };

    // Verify user type in background without showing loading state
    const verifyUserTypeInBackground = async (userId: string, cachedType: string) => {
      try {
        console.log("Verifying user type in background");
        
        // Check the appropriate table based on cached type
        if (cachedType === 'store') {
          const { data } = await supabase
            .from('stores')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
            
          if (!data) {
            console.log("Cached store type may be incorrect, running full auth check");
            checkAuth();
          }
        } else if (cachedType === 'therapist') {
          const { data } = await supabase
            .from('therapists')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
            
          if (!data) {
            console.log("Cached therapist type may be incorrect, running full auth check");
            checkAuth();
          }
        } else {
          // For regular users or unknown types, verify against profiles
          const { data } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', userId)
            .maybeSingle();
            
          if (data?.user_type && data.user_type !== cachedType) {
            console.log("User type changed in database, updating");
            setUserType(data.user_type);
            localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, data.user_type);
          }
        }
      } catch (error) {
        console.error("Background verification error:", error);
        // No need to update state on background check errors
      }
    };

    // Add a small delay before first auth check to ensure Supabase is initialized
    const initTimeout = setTimeout(() => {
      checkAuth();
    }, SUPABASE_INIT_DELAY);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session ? "Session exists" : "No session");
      
      if (session?.user) {
        setUser(session.user);
        console.log("User ID from auth state change:", session.user.id);
        
        // Enhanced profile checking logic - try a direct check first to avoid RLS issues
        try {
          // Direct database query using admin client, bypassing RLS
          // This is a fallback in case the normal query fails
          const { data: adminProfileData } = await supabaseAdmin
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (adminProfileData?.user_type) {
            console.log("Setting user type from admin client:", adminProfileData.user_type);
            setUserType(adminProfileData.user_type);
            localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, adminProfileData.user_type);
            setLoading(false);
            return;
          }
        } catch (adminError) {
          console.error("Admin client profile check failed:", adminError);
          // Continue with normal flow if this fails
        }
        
        // Try to get cached user type first as a fallback
        const cachedUserType = localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
        if (cachedUserType) {
          console.log("Using cached user type for auth change:", cachedUserType);
          setUserType(cachedUserType);
          setLoading(false);
          
          // Verify in background but don't show loading state
          verifyUserTypeInBackground(session.user.id, cachedUserType);
          return;
        }
        
        // Similar to checkAuth, but for auth state changes
        let userTypeFound = false;
        
        try {
          // First check if user is a store
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();
          
          // Check if there's an infinite recursion error
          if (storeError && storeError.message.includes('infinite recursion')) {
            console.error("RLS infinite recursion error on stores check (auth change), using fallback");
            if (cachedUserType) {
              userTypeFound = true;
              // Already set from cache above
            }
          } else {
            console.log("Store check (auth change):", storeData ? "Is store" : "Not store", storeError ? `Error: ${storeError.message}` : "");
            
            if (storeData) {
              console.log("Setting user type to store (auth change)");
              setUserType('store');
              localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'store');
              userTypeFound = true;
            } else {
              // Then check if user is a therapist
              try {
                const { data: therapistData, error: therapistError } = await supabase
                  .from('therapists')
                  .select('id')
                  .eq('id', session.user.id)
                  .maybeSingle();
                
                // Check if there's an infinite recursion error
                if (therapistError && therapistError.message.includes('infinite recursion')) {
                  console.error("RLS infinite recursion error on therapists check (auth change), using fallback");
                  if (cachedUserType) {
                    userTypeFound = true;
                    // Already set from cache above
                  }
                } else {
                  console.log("Therapist check (auth change):", therapistData ? "Is therapist" : "Not therapist", therapistError ? `Error: ${therapistError.message}` : "");
                  
                  if (therapistData) {
                    console.log("Setting user type to therapist (auth change)");
                    setUserType('therapist');
                    localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'therapist');
                    userTypeFound = true;
                  } else {
                    // If we couldn't determine from tables, try the profiles table as fallback
                    try {
                      const { data: profileData, error: profileError } = await supabase
          .from('profiles')
                        .select('user_type')
          .eq('id', session.user.id)
                        .maybeSingle();
                      
                      // Check if there's an infinite recursion error
                      if (profileError && profileError.message.includes('infinite recursion')) {
                        console.error("RLS infinite recursion error on profiles check (auth change), using fallback");
                        if (cachedUserType) {
                          userTypeFound = true;
                          // Already set from cache above
                        }
                      } else {
                        console.log("Profile check (auth change):", profileData ? `Type: ${profileData.user_type}` : "No profile data", profileError ? `Error: ${profileError.message}` : "");
                        
                        if (profileData?.user_type) {
                          console.log("Setting user type from profile (auth change):", profileData.user_type);
                          setUserType(profileData.user_type);
                          localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, profileData.user_type);
                          userTypeFound = true;
                        }
                      }
                    } catch (profileError) {
                      console.error("Error checking profiles table (auth change):", profileError);
                    }
                  }
                }
              } catch (therapistError) {
                console.error("Error checking therapists table (auth change):", therapistError);
              }
            }
          }
        } catch (storeError) {
          console.error("Error checking stores table (auth change):", storeError);
        }
        
        // Final fallback: If we couldn't determine the user type from any source
        if (!userTypeFound && !userType) {
          // Check if this is the first login after registration
          const isNewUser = session.user.app_metadata?.provider === 'email' && 
                          new Date(session.user.created_at).getTime() > Date.now() - 5 * 60 * 1000; // registered in last 5 minutes
          
          // For new users, let's default to customer instead of just 'user'
          const defaultType = isNewUser ? 'customer' : 'user';
          console.log(`Defaulting to user type '${defaultType}' after all checks failed (auth change)`);
          setUserType(defaultType);
          localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, defaultType);
          
          // For new users, also create their profile
          if (isNewUser) {
            try {
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ 
                  id: session.user.id,
                  user_type: defaultType,
                  email: session.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                
              if (profileError) {
                console.error("Error creating default profile:", profileError);
              } else {
                console.log("Created default profile with type:", defaultType);
              }
            } catch (e) {
              console.error("Exception creating default profile:", e);
            }
          }
        }
        
        // Always ensure loading is set to false after auth change
        setLoading(false);
      } else {
        console.log("No session in auth change, clearing user state");
        setUser(null);
        setUserType(null);
        localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(initTimeout);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out process");
      setIsSigningOut(true);
      
      // Clear localStorage first to prevent UI flicker
      localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
      
      // Additional clear of any potential stale data
      localStorage.removeItem('therapist-app-auth');
      
      // Update state before async operation
      setUser(null);
      setUserType(null);
      
      // Then perform Supabase signout
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      console.log("Sign out successful, redirecting to home");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if there's an error, clear the UI state
      setUser(null);
      setUserType(null);
      
      // Force page reload as last resort if sign out fails
      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserDashboardLink = () => {
    if (!userType) return "/user-profile";
    
    switch (userType) {
      case 'store':
        return "/store-admin";
      case 'therapist':
        return "/therapist-dashboard";
      default:
        return "/user-profile";
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Enhanced debug logging for auth state changes
  useEffect(() => {
    const authStateStr = JSON.stringify({ 
      user: user ? { id: user.id } : null, 
      userType,
      loading 
    });
    console.log(`Auth state changed: ${authStateStr}`);
    
    // Safety check: if no user but userType exists in localStorage, clear it
    if (!user && localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY)) {
      console.log("Found stale userType in localStorage, clearing it");
      localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
      setUserType(null);
    }
  }, [user, userType, loading]);

  return (
    <div className="flex flex-col min-h-screen" lang={lang}>
      <header className="sticky top-0 w-full bg-white border-b z-40">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70">
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
            </div>
            <span className="font-semibold text-lg text-foreground">のくとる</span>
          </Link>
          
          <nav className="hidden md:flex ml-auto items-center gap-1 md:gap-6">
            <Link 
              to="/therapists" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-2 rounded-full ${
                location.pathname === '/therapists' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>セラピスト検索</span>
            </Link>
            <Link 
              to="/blog" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-2 rounded-full ${
                location.pathname.startsWith('/blog') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>ブログ</span>
            </Link>
            <Link
              to="/all-posts"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-2 rounded-full ${
                location.pathname === '/all-posts' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>セラピスト投稿</span>
            </Link>
            
            <div className="h-6 w-px bg-border mx-1"></div>
            
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">読み込み中...</span>
              </div>
            ) : user && userType ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm">
                      <User className="h-4 w-4 mr-1" />
                      マイページ
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[200px] gap-2 p-4">
                        {userType === 'store' ? (
                          <span className="contents">
                            <Link to="/store-admin" className="block p-2 hover:bg-muted rounded-md">
                              <Store className="h-4 w-4 inline mr-2" />
                              店舗管理
                            </Link>
                          </span>
                        ) : userType === 'therapist' ? (
                          <span className="contents">
                            <Link to="/therapist-dashboard" className="block p-2 hover:bg-muted rounded-md">
                              <User className="h-4 w-4 inline mr-2" />
                              セラピストダッシュボード
                            </Link>
                            <Link to="/therapist-posts" className="block p-2 hover:bg-muted rounded-md">
                              <FileText className="h-4 w-4 inline mr-2" />
                              投稿管理
                            </Link>
                          </span>
                        ) : (
                          <span className="contents">
                            <Link to="/user-profile" className="block p-2 hover:bg-muted rounded-md">
                              <User className="h-4 w-4 inline mr-2" />
                              プロフィール
                            </Link>
                            <Link to="/user-bookings" className="block p-2 hover:bg-muted rounded-md">
                              <Calendar className="h-4 w-4 inline mr-2" />
                              予約履歴
                            </Link>
                            <Link to="/messages" className="block p-2 hover:bg-muted rounded-md">
                              <MessageSquare className="h-4 w-4 inline mr-2" />
                              メッセージ
                            </Link>
                            <Link to="/followed-therapists" className="block p-2 hover:bg-muted rounded-md">
                              <Heart className="h-4 w-4 inline mr-2" />
                              お気に入りセラピスト
                            </Link>
                          </span>
                        )}
                        <Link to="/notification-settings" className="block p-2 hover:bg-muted rounded-md">
                          <Settings className="h-4 w-4 inline mr-2" />
                          通知設定
                        </Link>
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full text-left p-2 hover:bg-muted rounded-md text-red-500 disabled:opacity-50 flex items-center"
                        >
                          {isSigningOut ? (
                            <span className="contents">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ログアウト中...
                            </span>
                          ) : (
                            <span className="contents">
                              <LogOut className="h-4 w-4 inline mr-2" />
                              ログアウト
                            </span>
                          )}
                        </button>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            ) : (
              <>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm">ログイン</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[200px] gap-2 p-4">
                          <Link to="/login" className="block p-2 hover:bg-muted rounded-md">
                            ユーザーログイン
                          </Link>
                          <Link to="/therapist-login" className="block p-2 hover:bg-muted rounded-md">
                            セラピストログイン
                          </Link>
                          <Link to="/store-login" className="block p-2 hover:bg-muted rounded-md">
                            店舗ログイン
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm">新規登録</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[200px] gap-2 p-4">
                          <Link to="/signup" className="block p-2 hover:bg-muted rounded-md">
                            ユーザー登録
                          </Link>
                          <Link to="/store-signup" className="block p-2 hover:bg-muted rounded-md">
                            店舗登録
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            className="ml-auto md:hidden px-0 h-9 w-9"
            onClick={toggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
              <div className="container py-4 space-y-4">
                <Link 
                  to="/therapists" 
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Search className="h-4 w-4 inline mr-2" />
                  セラピスト検索
                </Link>
                <Link 
                  to="/blog" 
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="h-4 w-4 inline mr-2" />
                  ブログ
                </Link>
                <Link
                  to="/all-posts"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  セラピスト投稿
                </Link>
                
                <div className="h-px w-full bg-gray-200"></div>
                
                {loading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">読み込み中...</span>
                  </div>
                ) : user && userType ? (
                  <span className="contents">
                    <Link 
                      to={getUserDashboardLink()} 
                      className="block py-2 text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      マイページ
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={isSigningOut}
                      className="w-full text-left py-2 text-sm font-medium text-red-500 flex items-center disabled:opacity-50"
                    >
                      {isSigningOut ? (
                        <span className="contents">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ログアウト中...
                        </span>
                      ) : (
                        <span className="contents">
                          <LogOut className="h-4 w-4 inline mr-2" />
                          ログアウト
                        </span>
                      )}
                    </button>
                  </span>
                ) : (
                  <span className="contents">
                    <Link 
                      to="/login" 
                      className="block py-2 text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ログイン
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block py-2 text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      新規登録
                    </Link>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow py-8">
        {loading && location.pathname.includes('profile') ? (
          <div className="container flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">ページを読み込み中...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-lg font-bold mb-4">SerenitySage</h2>
              <p className="text-muted-foreground mb-4">
                リラクゼーションと癒やしの空間を提供し、あなたの心と体のバランスを整えるお手伝いをします。
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
            
            <nav aria-label="フッターナビゲーション">
              <h2 className="text-lg font-bold mb-4">リンク</h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    私たちについて
                  </Link>
                </li>
                <li>
                  <Link to="/therapists" className="text-muted-foreground hover:text-foreground transition-colors">
                    セラピスト一覧
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    ブログ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    お問い合わせ
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    よくある質問
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div>
              <h2 className="text-lg font-bold mb-4">お問い合わせ</h2>
              <address className="not-italic">
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin size={16} className="mr-2" aria-hidden="true" />
                  <span>東京都渋谷区〇〇町1-2-3</span>
                </div>
                <div className="flex items-center text-muted-foreground mb-2">
                  <Phone size={16} className="mr-2" aria-hidden="true" />
                  <a href="tel:03-1234-5678" className="hover:text-foreground transition-colors">03-1234-5678</a>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail size={16} className="mr-2" aria-hidden="true" />
                  <a href="mailto:info@example.com" className="hover:text-foreground transition-colors">info@example.com</a>
                </div>
              </address>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} SerenitySage. All rights reserved.
            </p>
            
            <div className="flex space-x-4">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                利用規約
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
