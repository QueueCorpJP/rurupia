
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageViewTracker } from '@/components/common/PageViewTracker';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MobileNav } from "./ui/sidebar";
import { useMobile } from "@/hooks/use-mobile";
import TherapistSearch from './TherapistSearch';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isTop, setIsTop] = useState(true);
  const isMobile = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY < 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobileMenuOpen && !(e.target as Element).closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <PageViewTracker />
      <div className="flex flex-col min-h-screen">
        <header className={`sticky top-0 z-50 transition-all ${isTop ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b'}`}>
          <div className="container mx-auto flex justify-between items-center h-16 px-4">
            <Link to="/" className="flex items-center text-lg font-semibold">
              <span className={`${isTop ? 'text-white' : 'text-primary'}`}>Ryokan</span>
            </Link>

            {isMobile ? (
              <>
                <button 
                  onClick={toggleMobileMenu}
                  aria-label="Toggle menu"
                  className={`p-2 ${isTop ? 'text-white' : 'text-gray-800'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
                
                {isMobileMenuOpen && (
                  <MobileNav 
                    className="mobile-menu absolute top-16 left-0 right-0 bg-white p-4 border-b shadow-lg"
                    items={[
                      { href: "/therapists", label: "セラピスト一覧" },
                      { href: "/followed-therapists", label: "お気に入りセラピスト" },
                      { href: "/booking", label: "予約" },
                      { href: "/blog", label: "ブログ" },
                      { href: "/contact", label: "お問い合わせ" },
                    ]}
                  />
                )}
              </>
            ) : (
              <nav className={`space-x-1 ${isTop ? 'text-white' : 'text-gray-800'}`}>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className={isTop ? 'text-white hover:text-white/80' : ''}>
                        セラピスト
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                          <Link to="/therapists" className="group grid h-full w-full items-center justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md">
                            セラピスト一覧
                          </Link>
                          <Link to="/followed-therapists" className="group grid h-full w-full items-center justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md">
                            お気に入りセラピスト
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Link to="/booking" className={`${navigationMenuTriggerStyle()} ${isTop ? 'text-white hover:text-white/80' : ''}`}>
                        予約
                      </Link>
                    </NavigationMenuItem>
                    
                    <NavigationMenuItem>
                      <Link to="/blog" className={`${navigationMenuTriggerStyle()} ${isTop ? 'text-white hover:text-white/80' : ''}`}>
                        ブログ
                      </Link>
                    </NavigationMenuItem>
                    
                    <NavigationMenuItem>
                      <Link to="/contact" className={`${navigationMenuTriggerStyle()} ${isTop ? 'text-white hover:text-white/80' : ''}`}>
                        お問い合わせ
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>
            )}

            <div className="flex items-center space-x-2">
              <TherapistSearch />
              <Link to="/login">
                <Button variant={isTop ? "outline" : "default"} className={isTop ? "border-white text-white hover:bg-white/10 hover:text-white" : ""}>
                  ログイン
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Ryokan</h3>
                <p className="text-gray-600 text-sm">
                  リラクゼーションセラピーを通じて、心身ともに健やかな生活をサポートします。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">リンク</h3>
                <ul className="space-y-2">
                  <li><Link to="/therapists" className="text-gray-600 hover:text-primary">セラピスト一覧</Link></li>
                  <li><Link to="/booking" className="text-gray-600 hover:text-primary">予約</Link></li>
                  <li><Link to="/blog" className="text-gray-600 hover:text-primary">ブログ</Link></li>
                  <li><Link to="/contact" className="text-gray-600 hover:text-primary">お問い合わせ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">法的情報</h3>
                <ul className="space-y-2">
                  <li><Link to="/terms" className="text-gray-600 hover:text-primary">利用規約</Link></li>
                  <li><Link to="/privacy" className="text-gray-600 hover:text-primary">プライバシーポリシー</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">お問い合わせ</h3>
                <p className="text-gray-600">〒123-4567<br />東京都渋谷区〇〇1-2-3</p>
                <p className="text-gray-600 mt-2">電話: 03-1234-5678<br />メール: info@ryokan.com</p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Ryokan All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
