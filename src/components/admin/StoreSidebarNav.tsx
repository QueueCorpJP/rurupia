import { cn } from '@/lib/utils';
import NavLink from '@/components/common/NavLink';
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Copy,
  Calendar
} from 'lucide-react';

interface StoreSidebarNavProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function StoreSidebarNav({ isOpen, toggleSidebar }: StoreSidebarNavProps) {
  const navItems = [
    { title: 'ダッシュボード', href: '/store-admin', icon: LayoutDashboard },
    { title: '予約管理', href: '/store-admin/bookings', icon: Calendar },
    { title: 'セラピスト管理', href: '/store-admin/therapists', icon: Users },
    { title: 'コース管理', href: '/store-admin/courses', icon: BookOpen },
    { title: 'お問い合わせ', href: '/store-admin/inquiries', icon: MessageSquare },
    { title: '分析・統計', href: '/store-admin/analytics', icon: BarChart2 },
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
          店舗管理システム
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
          {navItems.map((item) => {
            // Helper function to generate class names based on active state
            const getActiveClass = (isActive: boolean) => {
              return cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                !isOpen && "justify-center"
              );
            };
            
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={(props) => getActiveClass(props.isActive)}
                  end={item.href === '/store-admin'}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("truncate transition-all", 
                    isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                  )}>
                    {item.title}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-auto">
          <div className="px-2 py-4">
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                !isOpen && "justify-center"
              )}
            >
              <Copy className="h-5 w-5 flex-shrink-0" />
              <span className={cn("truncate transition-all", 
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              )}>
                招待リンクをコピー
              </span>
            </button>
          </div>
          
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
