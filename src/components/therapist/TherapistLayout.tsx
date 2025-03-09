
import { ReactNode } from "react";
import { LogOut, User, Calendar, FileText, Settings, Home, HelpCircle, Bell } from "lucide-react";
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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-muted-foreground hover:bg-secondary"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-10 shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70">
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
            </div>
            <span className="font-semibold text-lg">のくとるセラピストページ</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-full">
                <Home className="h-4 w-4 mr-2" />
                トップページ
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="rounded-full border-pink-200">
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 h-fit">
          <div className="flex items-center gap-3 px-4 py-4 mb-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary/10">
              <span className="absolute inset-0 flex items-center justify-center text-primary font-semibold">JS</span>
            </div>
            <div>
              <h3 className="font-semibold">ジョン・スミス</h3>
              <p className="text-sm text-muted-foreground">セラピスト</p>
            </div>
          </div>
          
          <div className="bg-secondary rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">アカウントステータス</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">承認済み</span>
            </div>
            <div className="text-xs text-muted-foreground">
              最終ログイン: 2023/10/25 13:45
            </div>
          </div>
          
          <nav className="space-y-1">
            <NavItem to="/therapist-dashboard" icon={User} label="プロフィール" />
            <NavItem to="/therapist-dashboard/bookings" icon={Calendar} label="予約管理" />
            <NavItem to="/therapist-dashboard/posts" icon={FileText} label="投稿管理" />
            <NavItem to="/therapist-dashboard/settings" icon={Settings} label="設定" />
          </nav>
          
          <div className="mt-8 pt-6 border-t border-pink-100">
            <div className="space-y-1">
              <Link to="/therapist-dashboard/help" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-muted-foreground hover:bg-secondary">
                <HelpCircle className="h-5 w-5" />
                <span>ヘルプ</span>
              </Link>
              <Link to="/therapist-dashboard/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-muted-foreground hover:bg-secondary">
                <Bell className="h-5 w-5" />
                <span>お知らせ</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
