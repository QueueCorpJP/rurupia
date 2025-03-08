
import { ReactNode } from "react";
import { LogOut, User, Calendar, FileText, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface TherapistLayoutProps {
  children: ReactNode;
}

export const TherapistLayout = ({ children }: TherapistLayoutProps) => {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-muted-foreground hover:bg-gray-100"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-blue-600">
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
            </div>
            <span className="font-semibold text-lg">のくとるセラピストページ</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                トップページ
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-xl shadow-sm border p-4 h-fit">
          <nav className="space-y-1">
            <NavItem to="/therapist-dashboard" icon={User} label="プロフィール" />
            <NavItem to="/therapist-dashboard/bookings" icon={Calendar} label="予約管理" />
            <NavItem to="/therapist-dashboard/posts" icon={FileText} label="投稿管理" />
            <NavItem to="/therapist-dashboard/settings" icon={Settings} label="設定" />
          </nav>
        </aside>

        {/* Main content */}
        <main className="bg-white rounded-xl shadow-sm border p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
