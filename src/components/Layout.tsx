import { ReactNode, useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, User, BookOpen, Search, Heart, Calendar, Instagram, Facebook, Twitter, Mail, MapPin, LogOut, Store, Settings, FileText, Bell, ChevronDown, Loader2 } from 'lucide-react';
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
  // Simple approach - just store as string, not state
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add page view tracking
  usePageViewTracking();

  // Ultra-simple auth check - just set up the listener and don't overthink it
  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Just update the user state, nothing fancy
      setUser(session?.user || null);
    });

    // Initial check
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      localStorage.removeItem(LOCAL_STORAGE_USER_TYPE_KEY);
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
    }
  };

  // Simple function to get user type from localStorage
  const getUserType = () => {
    return localStorage.getItem(LOCAL_STORAGE_USER_TYPE_KEY) || 'customer';
  };

  const getUserDashboardLink = () => {
    const userType = getUserType();
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

  return (
    <div className="flex flex-col min-h-screen" lang={lang}>
      <header className="sticky top-0 w-full bg-white border-b z-40">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
                            <img src="/logo/rupipia_logo.png" alt="るぴぴあ" className="h-8 w-auto sm:h-10 md:h-10" />
          
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
            
            {user ? (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm">
                      <User className="h-4 w-4 mr-1" />
                      マイページ
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="right-0 left-auto">
                      <div className="grid w-[200px] gap-2 p-4">
                        <Link to={getUserDashboardLink()} className="block p-2 hover:bg-muted rounded-md">
                              <User className="h-4 w-4 inline mr-2" />
                              プロフィール
                            </Link>
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
                      <NavigationMenuContent className="right-0 left-auto">
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
                      <NavigationMenuContent className="right-0 left-auto">
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
                
                {user ? (
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
        {children}
      </main>
      
      <footer className="bg-gray-100 dark:bg-gray-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              {/* Logo */}
              <div className="mb-4">
                <img 
                  src="/logo/rupipia_logo.png" 
                  alt="るぴぴあ" 
                  className="h-8 w-auto sm:h-12 md:h-14"
                  onError={(e) => {
                    // Fallback to text logo if image fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    const nextElement = target.nextElementSibling as HTMLElement;
                    target.style.display = 'none';
                    if (nextElement) nextElement.style.display = 'block';
                  }}
                />
                <h2 className="text-lg font-bold text-primary hidden">るぴぴあ</h2>
              </div>
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
                  <span>東京都墨田区江東橋4丁目27番14号 楽天地ビル3F</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail size={16} className="mr-2" aria-hidden="true" />
                  <a href="mailto:info@noctle.com" className="hover:text-foreground transition-colors">info@noctle.com</a>
                </div>
              </address>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} るぴぴあ. All rights reserved.
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
