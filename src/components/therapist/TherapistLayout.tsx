
import { ReactNode, useState } from "react";
import { LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TherapistNavigation from "./TherapistNavigation";

interface TherapistLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export const TherapistLayout = ({ children, fullWidth = false }: TherapistLayoutProps) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("ログアウトしました");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("ログアウトに失敗しました");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-10 shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/rupipia_logo.png" 
              alt="るぴぴあ" 
              className="h-9 w-auto object-contain"
              onError={(e) => {
                // Fallback to gradient background with text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70 hidden">
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">るぴ</span>
            </div>
            <span className="font-semibold text-lg hidden md:inline">るぴぴあセラピストページ</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-full">
                <Home className="h-4 w-4 mr-2" />
                トップページ
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full border-pink-200"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "処理中..." : "ログアウト"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {fullWidth ? (
          /* Full width layout for messages */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border border-pink-100 p-4 sticky top-24">
                <TherapistNavigation />
              </div>
            </div>
            
            {/* Main content - full width */}
            <main className="md:col-span-4">
              {children}
            </main>
          </div>
        ) : (
          /* Default layout */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border border-pink-100 p-4 sticky top-24">
                <TherapistNavigation />
              </div>
            </div>
            
            {/* Main content */}
            <main className="md:col-span-3 bg-white rounded-lg shadow-sm border border-pink-100 p-6">
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
