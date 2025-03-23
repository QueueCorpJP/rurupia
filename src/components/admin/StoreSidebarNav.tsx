import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, Users, Calendar, BookOpen, 
  BarChart3, MessageSquare, Settings, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoreSidebarNavProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const StoreSidebarNav = ({ isOpen, toggleSidebar }: StoreSidebarNavProps) => {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("店舗管理");
  
  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // First check if this user has a store record
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('name')
            .eq('id', user.id)
            .single();
            
          if (storeData) {
            setStoreName(storeData.name);
            return;
          }
          
          // If not found in stores, check the profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
            
          if (profileData && profileData.name) {
            setStoreName(profileData.name);
          }
        }
      } catch (error) {
        console.error("Error fetching store name:", error);
      }
    };
    
    fetchStoreName();
  }, []);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('ログアウトしました');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('ログアウトに失敗しました');
    }
  };
  
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 border-r bg-background transition-all duration-300",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn("flex items-center gap-2", !isOpen && "justify-center w-full")}>
          <LayoutDashboard className="h-6 w-6 text-primary" />
          {isOpen && <span className="font-bold text-lg">{storeName}</span>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={!isOpen ? "hidden" : ""}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">サイドバーを閉じる</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={isOpen ? "hidden" : ""}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">サイドバーを開く</span>
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-1 p-2">
          <NavItem 
            to="/store-admin" 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="ダッシュボード" 
            isOpen={isOpen} 
            end 
          />
          <NavItem 
            to="/store-admin/therapists" 
            icon={<Users className="h-5 w-5" />} 
            label="セラピスト管理" 
            isOpen={isOpen} 
          />
          <NavItem 
            to="/store-admin/bookings" 
            icon={<Calendar className="h-5 w-5" />} 
            label="予約管理" 
            isOpen={isOpen} 
          />
          <NavItem 
            to="/store-admin/courses" 
            icon={<BookOpen className="h-5 w-5" />} 
            label="コース管理" 
            isOpen={isOpen} 
          />
          <NavItem 
            to="/store-admin/inquiries" 
            icon={<MessageSquare className="h-5 w-5" />} 
            label="問い合わせ" 
            isOpen={isOpen} 
          />
          <NavItem 
            to="/store-admin/analytics" 
            icon={<BarChart3 className="h-5 w-5" />} 
            label="分析" 
            isOpen={isOpen} 
          />
          <NavItem 
            to="/store-admin/settings" 
            icon={<Settings className="h-5 w-5" />} 
            label="設定" 
            isOpen={isOpen} 
          />
          
          <div className="mt-auto">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start", 
                !isOpen && "justify-center"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              {isOpen && "ログアウト"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  end?: boolean;
}

const NavItem = ({ to, icon, label, isOpen, end }: NavItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname !== to) {
      navigate(to);
    }
  };

  return (
    <NavLink
      to={to}
      end={end}
      onClick={handleClick}
      className={({ isActive }) => 
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-accent hover:text-accent-foreground",
          !isOpen && "justify-center"
        )
      }
    >
      {icon}
      {isOpen && <span>{label}</span>}
    </NavLink>
  );
};
