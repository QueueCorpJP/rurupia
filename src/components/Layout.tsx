import { ReactNode, useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, User, BookOpen, Search, Heart, Calendar, Instagram, Facebook, Twitter, Mail, Phone, MapPin, LogOut, Store, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
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
const AUTH_TIMEOUT = 1000; // Reduced from 3000ms to 1000ms for better UX
const LOCAL_STORAGE_USER_TYPE_KEY = 'nokutoru_user_type';
const SUPABASE_INIT_DELAY = 50; // Small delay to ensure Supabase is ready

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(() => {
    // Initialize userType from localStorage if available
    return localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY);
  });
  // Initialize loading to false if we already have cached userType
  const [loading, setLoading] = useState(!localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authTimeoutRef = useRef<number | null>(null);
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
        
        // Set a timeout to ensure we don't get stuck in loading state
        if (authTimeoutRef.current) {
          window.clearTimeout(authTimeoutRef.current);
        }
        
        authTimeoutRef.current = window.setTimeout(() => {
          console.log("Auth timeout triggered, forcing loading to false");
          setLoading(false);
        }, AUTH_TIMEOUT);
        
        console.log("Starting auth check");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session check result:", session ? "Session exists" : "No session");
        
        if (session?.user) {
          setUser(session.user);
          console.log("User ID from session:", session.user.id);
          
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
      
      // Set a timeout for auth state change as well
      if (authTimeoutRef.current) {
        window.clearTimeout(authTimeoutRef.current);
      }
      
      authTimeoutRef.current = window.setTimeout(() => {
        console.log("Auth state change timeout triggered, forcing loading to false");
        setLoading(false);
      }, AUTH_TIMEOUT);
      
      if (session?.user) {
        setUser(session.user);
        console.log("User ID from auth state change:", session.user.id);
        
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
          console.log("Defaulting to user type after all checks failed (auth change)");
          setUserType('user');
          localStorage.setItem(LOCAL_STORAGE_USER_TYPE_KEY, 'user');
        }
      } else {
        console.log("No session in auth change, clearing user state");
        setUser(null);
        setUserType(null);
        localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
        setLoading(false);
      }
      
      // Clear the timeout since we're done with auth state change
      if (authTimeoutRef.current) {
        window.clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    });

    return () => {
      subscription.unsubscribe();
      // Clear any remaining timeout on unmount
      if (authTimeoutRef.current) {
        window.clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      clearTimeout(initTimeout);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserType(null);
      localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
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

  // For debugging
  useEffect(() => {
    console.log("Auth state:", { user, userType, loading });
  }, [user, userType, loading]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
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
            
            <div className="h-6 w-px bg-border mx-1"></div>
            
            {loading ? (
              <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-md"></div>
            ) : user ? (
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
                          <>
                            <Link to="/store-admin" className="block p-2 hover:bg-muted rounded-md">
                              <Store className="h-4 w-4 inline mr-2" />
                              店舗管理
                            </Link>
                          </>
                        ) : userType === 'therapist' ? (
                          <>
                            <Link to="/therapist-dashboard" className="block p-2 hover:bg-muted rounded-md">
                              <User className="h-4 w-4 inline mr-2" />
                              セラピストダッシュボード
                            </Link>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                        <Link to="/notification-settings" className="block p-2 hover:bg-muted rounded-md">
                          <Settings className="h-4 w-4 inline mr-2" />
                          通知設定
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left p-2 hover:bg-muted rounded-md text-red-500"
                        >
                          <LogOut className="h-4 w-4 inline mr-2" />
                          ログアウト
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
                
                <div className="h-px w-full bg-gray-200"></div>
                
                {loading ? (
                  <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-md"></div>
                ) : user ? (
                  <>
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
                      className="w-full text-left py-2 text-sm font-medium text-red-500"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      ログアウト
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="relative bg-gradient-to-br from-gray-50 to-pink-50 pt-16 pb-8 border-t border-pink-100">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70">
                  <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
                </div>
                <span className="font-semibold text-xl">のくとる</span>
              </div>
              <p className="text-muted-foreground mb-4">
                安心して利用できる、男性セラピストによるリラクゼーションサービスマッチングプラットフォーム
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">サービス</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/therapists" className="text-muted-foreground hover:text-primary transition-colors">
                    セラピスト検索
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                    ブログ
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    会社概要
                  </Link>
                </li>
                <li>
                  <Link to="/partnership" className="text-muted-foreground hover:text-primary transition-colors">
                    パートナー募集
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">サポート</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                    よくある質問
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    お問い合わせ
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">お問い合わせ</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    〒150-0002 東京都渋谷区渋谷2-24-12
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    03-1234-5678
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    info@nokutoru.com
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-pink-100 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground order-2 md:order-1 mt-4 md:mt-0 text-center md:text-left">
              &copy; 2023 のくとる All rights reserved.
            </p>
            <div className="flex items-center space-x-4 order-1 md:order-2">
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                利用規約
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                プライバシーポリシー
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/sitemap" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                サイトマップ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
