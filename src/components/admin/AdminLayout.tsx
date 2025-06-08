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
    // Check authentication for all admin routes
    if (!isAdminAuthenticated) {
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

  if (!isAdminAuthenticated) {
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
            <Outlet />
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
