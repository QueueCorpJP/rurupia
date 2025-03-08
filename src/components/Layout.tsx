
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, User, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
            </div>
            <span className="font-semibold text-lg">のくとる</span>
          </Link>
          <nav className="ml-auto flex gap-6">
            <Link 
              to="/therapists" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/therapists' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              セラピスト検索
            </Link>
            <Link 
              to="/blog" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                location.pathname.startsWith('/blog') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              ブログ
            </Link>
            <Link 
              to="/messages" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                location.pathname === '/messages' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              メッセージ
            </Link>
            <Link 
              to="/user-profile" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                location.pathname === '/user-profile' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              マイページ
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container py-6 md:py-10">
        {children}
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:h-16 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; 2023 のくとる. All rights reserved.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
