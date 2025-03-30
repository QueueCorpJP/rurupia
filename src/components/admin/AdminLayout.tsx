import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { UserNav } from './UserNav';
import { cn } from '@/lib/utils';
import { LayoutDashboard } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useToast } from '@/components/ui/use-toast';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  // Allow rendering content when on verification routes even if not authenticated
  const isVerificationRoute = location.pathname.includes('/admin/verification/');
  if (!isAdminAuthenticated && !isVerificationRoute) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <SidebarNav isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-primary-foreground bg-primary hover:bg-primary/90 mr-2 md:hidden"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </button>
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
