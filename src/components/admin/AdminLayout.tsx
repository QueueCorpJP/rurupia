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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAdminAuthenticated, initializeAdminSession, adminUserId } = useAdminAuth();

  useEffect(() => {
    // Only check authentication for the main admin layout component
    // Skip check for children routes that handle their own authentication
    // like verification which uses AdminProtectedRoute
    const isVerificationRoute = location.pathname.includes('/admin/verification/');
    
    if (!isAdminAuthenticated && !isVerificationRoute) {
      console.log('Not authenticated, redirecting to login');
      navigate('/admin/login');
      return;
    }
    
    // Initialize Supabase session with admin credentials
    const setupAdmin = async () => {
      try {
        setInitializingSession(true);
        console.log('Initializing admin session...');
        await initializeAdminSession();
        console.log('Admin session initialized, userId:', adminUserId);
      } catch (error) {
        console.error('Error initializing admin session:', error);
        toast({
          title: "エラー",
          description: "管理者セッションの初期化に失敗しました",
          variant: "destructive",
        });
      } finally {
        setInitializingSession(false);
      }
    };
    
    setupAdmin();
  }, [isAdminAuthenticated, location.pathname]);

  useEffect(() => {
    if (!isAdminAuthenticated && !initializingSession) {
      navigate('/admin/auth');
    }
  }, [isAdminAuthenticated, initializingSession, navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Allow rendering content when on verification routes even if not authenticated
  const isVerificationRoute = location.pathname.includes('/admin/verification/');
  if (!isAdminAuthenticated && !isVerificationRoute) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarNav isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarNav isOpen={true} toggleSidebar={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn(
        "min-h-screen transition-all duration-300",
        "md:ml-64 md:data-[sidebar=collapsed]:ml-20",
        !isSidebarOpen && "md:ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
          </Sheet>
          
          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          
          <h1 className="font-semibold text-lg md:text-xl">運営管理システム</h1>
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
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
