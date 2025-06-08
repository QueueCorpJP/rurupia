import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { UserNav } from './UserNav';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Menu } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initializingSession, setInitializingSession] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAdminAuthenticated, initializeAdminSession, adminUserId } = useAdminAuth();

  useEffect(() => {
    // Check localStorage directly first
    const adminSession = localStorage.getItem('admin_session');
    console.log('AdminLayout: Checking admin session:', { 
      adminSession, 
      isAdminAuthenticated, 
      pathname: location.pathname 
    });

    // If we have admin session in localStorage but context says not authenticated
    if (adminSession === 'true' && !isAdminAuthenticated) {
      console.log('AdminLayout: Found admin session in localStorage but context not updated yet, waiting...');
      setAuthChecked(true);
      return;
    }

    // If no session and not authenticated, redirect
    if (!adminSession && !isAdminAuthenticated) {
      console.log('AdminLayout: No admin session found, redirecting to login');
      navigate('/admin/login');
      return;
    }

    // If authenticated, initialize session
    if (isAdminAuthenticated || adminSession === 'true') {
      console.log('AdminLayout: Admin authenticated, initializing session...');
      const setupAdmin = async () => {
        try {
          setInitializingSession(true);
          await initializeAdminSession();
          console.log('AdminLayout: Admin session initialized, userId:', adminUserId);
        } catch (error) {
          console.error('AdminLayout: Error initializing admin session:', error);
          toast({
            title: "エラー",
            description: "管理者セッションの初期化に失敗しました",
            variant: "destructive",
          });
        } finally {
          setInitializingSession(false);
          setAuthChecked(true);
        }
      };
      
      setupAdmin();
    }
  }, [isAdminAuthenticated, location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Check localStorage directly for immediate auth state
  const hasAdminSession = localStorage.getItem('admin_session') === 'true';
  
  // Don't render if not authenticated (unless we're still checking)
  if (!hasAdminSession && !isAdminAuthenticated && authChecked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <aside className={cn(
          "bg-sidebar border-r border-border transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-16"
        )}>
          <div className="flex items-center justify-center h-16 border-b px-4">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              {isSidebarOpen && <span className="font-semibold text-lg">るぴぴあ</span>}
            </div>
          </div>
          <SidebarNav isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </aside>
        
        <div className="flex-1 flex flex-col">
          <header className="bg-background border-b h-16 flex items-center justify-between px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <UserNav />
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            {initializingSession ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">セッションを初期化中...</p>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen">
        <header className="bg-background border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex items-center justify-center h-16 border-b px-4">
                  <div className="flex items-center space-x-2">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-lg">るぴぴあ</span>
                  </div>
                </div>
                <SidebarNav isOpen={true} toggleSidebar={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">るぴぴあ</span>
            </div>
          </div>
          <UserNav />
        </header>
        
        <main className="p-4 pb-20 overflow-auto">
          {initializingSession ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">セッションを初期化中...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
