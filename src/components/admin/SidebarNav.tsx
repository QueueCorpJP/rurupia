
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Settings, 
  Newspaper, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ListChecks
} from 'lucide-react';

interface SidebarNavProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function SidebarNav({ isOpen, toggleSidebar }: SidebarNavProps) {
  const navItems = [
    { title: 'ダッシュボード', href: '/admin', icon: LayoutDashboard },
    { title: 'アカウント管理', href: '/admin/accounts', icon: Users },
    { title: '店舗一覧', href: '/admin/requests', icon: ListChecks },
    { title: 'お問い合わせ', href: '/admin/inquiries', icon: HelpCircle },
    { title: 'ブログ管理', href: '/admin/blog', icon: Newspaper },
    { title: '設定', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border bg-primary text-primary-foreground">
        <span className={cn("font-semibold whitespace-nowrap overflow-hidden transition-all", 
          isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
        )}>
          運営管理システム
        </span>
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center rounded-md p-2 text-primary-foreground bg-primary hover:bg-primary/90"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    !isOpen && "justify-center"
                  )
                }
                end={item.href === '/admin'}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn("truncate transition-all", 
                  isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}>
                  {item.title}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto">
          <div className="border-t border-sidebar-border px-2 py-4">
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-destructive hover:bg-destructive/10",
                !isOpen && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={cn("truncate transition-all", 
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              )}>
                ログアウト
              </span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
