import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, User, BookOpen, Search, Heart, Calendar, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
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
import NavLink from '@/components/common/NavLink';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container flex h-16 items-center">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70">
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
            </div>
            <span className="font-semibold text-lg text-foreground">のくとる</span>
          </NavLink>
          
          <nav className="hidden md:flex ml-auto items-center gap-1 md:gap-6">
            <NavLink 
              to="/therapists" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-2 rounded-full ${
                location.pathname === '/therapists' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>セラピスト検索</span>
            </NavLink>
            <NavLink 
              to="/blog" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-2 rounded-full ${
                location.pathname.startsWith('/blog') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>ブログ</span>
            </NavLink>
            
            <div className="h-6 w-px bg-border mx-1"></div>
            
            {/* Conditional rendering based on auth state */}
            {!loading && (
              <>
                {user ? (
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-sm">
                          <User className="h-4 w-4 mr-1" />
                          マイページ
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[200px] gap-2 p-4">
                            <NavLink to="/user-profile" className="block p-2 hover:bg-muted rounded-md">
                              プロフィール
                            </NavLink>
                            <NavLink to="/user-bookings" className="block p-2 hover:bg-muted rounded-md">
                              予約履歴
                            </NavLink>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left p-2 hover:bg-muted rounded-md text-red-500"
                            >
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
                              <NavLink to="/login" className="block p-2 hover:bg-muted rounded-md">
                                ユーザーログイン
                              </NavLink>
                              <NavLink to="/therapist-login" className="block p-2 hover:bg-muted rounded-md">
                                セラピストログイン
                              </NavLink>
                              <NavLink to="/store-login" className="block p-2 hover:bg-muted rounded-md">
                                店舗ログイン
                              </NavLink>
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
                              <NavLink to="/signup" className="block p-2 hover:bg-muted rounded-md">
                                ユーザー登録
                              </NavLink>
                              <NavLink to="/therapist-signup" className="block p-2 hover:bg-muted rounded-md">
                                セラピスト登録
                              </NavLink>
                              <NavLink to="/store-signup" className="block p-2 hover:bg-muted rounded-md">
                                店舗登録
                              </NavLink>
                            </div>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button variant="ghost" className="ml-auto md:hidden px-0 h-9 w-9">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
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
                  <NavLink to="/therapists" className="text-muted-foreground hover:text-primary transition-colors">
                    セラピスト検索
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                    ブログ
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    会社概要
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/partnership" className="text-muted-foreground hover:text-primary transition-colors">
                    パートナー募集
                  </NavLink>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">サポート</h3>
              <ul className="space-y-3">
                <li>
                  <NavLink to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                    よくある質問
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    利用規約
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    プライバシーポリシー
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    お問い合わせ
                  </NavLink>
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
              <NavLink to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                利用規約
              </NavLink>
              <span className="text-muted-foreground">•</span>
              <NavLink to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                プライバシーポリシー
              </NavLink>
              <span className="text-muted-foreground">•</span>
              <NavLink to="/sitemap" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                サイトマップ
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
