import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const navItems: NavigationItem[] = [
  {
    title: 'ダッシュボード',
    href: '/therapist-dashboard',
  },
  {
    title: 'プロフィール編集',
    href: '/therapist-profile',
  },
  {
    title: '予約管理',
    href: '/therapist-bookings',
  },
  {
    title: 'メッセージ',
    href: '/therapist-messages',
  },
  {
    title: '記事管理',
    href: '/therapist-posts',
  },
  {
    title: '設定',
    href: '/therapist-settings',
  }
];

const TherapistNavigation = () => {
  const location = useLocation();
  
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link key={item.href} to={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              location.pathname === item.href && "bg-muted hover:bg-muted"
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