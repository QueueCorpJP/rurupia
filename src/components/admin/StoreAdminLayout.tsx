
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { StoreSidebarNav } from "./StoreSidebarNav";
import { UserNav } from "./UserNav";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StoreAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Use location to detect route changes
  useEffect(() => {
    setPageLoading(true);
    
    // Reset page loading after a short delay
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not logged in, redirect to login
          toast.error("ログインが必要です");
          navigate("/store-login");
          return;
        }
        
        // Check if user is a store owner
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Only allow users with user_type 'store' to access store admin pages
        if (!profileData || profileData.user_type !== 'store') {
          toast.error("店舗管理者のみアクセス可能です");
          navigate("/");
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Access check error:", error);
        toast.error("アクセス権の確認中にエラーが発生しました");
        navigate("/");
      }
    };
    
    checkAccess();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreSidebarNav isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        <header className="h-16 border-b flex items-center justify-end px-4">
          <UserNav />
        </header>
        
        <main className="flex-1 p-6 max-w-7xl mx-auto relative">
          {pageLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <div className={cn(
            "transition-opacity duration-300",
            pageLoading ? "opacity-50" : "opacity-100"
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreAdminLayout;
