
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  UserCircle, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Settings 
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavigationItem[] = [
  {
    title: 'ダッシュボード',
    href: '/therapist-dashboard',
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />
  },
  {
    title: 'プロフィール編集',
    href: '/therapist-profile',
    icon: <UserCircle className="mr-2 h-4 w-4" />
  },
  {
    title: '予約管理',
    href: '/therapist-bookings',
    icon: <Calendar className="mr-2 h-4 w-4" />
  },
  {
    title: 'メッセージ',
    href: '/therapist-messages',
    icon: <MessageSquare className="mr-2 h-4 w-4" />
  },
  {
    title: '記事管理',
    href: '/therapist-posts',
    icon: <FileText className="mr-2 h-4 w-4" />
  },
  {
    title: '設定',
    href: '/therapist-settings',
    icon: <Settings className="mr-2 h-4 w-4" />
  }
];

const TherapistNavigation = () => {
  const location = useLocation();
  const currentPath = location?.pathname || '';
  
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link key={item.href} to={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              currentPath === item.href && "bg-muted hover:bg-muted"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Button>
        </Link>
      ))}
    </nav>
  );
};

export default TherapistNavigation;
