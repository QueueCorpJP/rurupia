import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StatusType = 'active' | 'inactive' | 'pending' | 'rejected' | 'approved' | 'success' | 'warning' | 'error' | 'info' | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<
  StatusType, 
  { 
    color: string;
    label: string;
  }
> = {
  active: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900',
    label: 'アクティブ'
  },
  inactive: {
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-800',
    label: '無効'
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900',
    label: '認証待ち'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900',
    label: 'バン'
  },
  approved: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900',
    label: '承認済み'
  },
  success: {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900',
    label: '成功'
  },
  warning: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900',
    label: '警告'
  },
  error: {
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900',
    label: 'エラー'
  },
  info: {
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900',
    label: '情報'
  },
  // Inquiry specific statuses
  '未対応': {
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900',
    label: '未対応'
  },
  'in_progress': {
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900',
    label: '対応中'
  },
  'resolved': {
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900',
    label: '完了'
  }
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'px-3 py-1'
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-800',
    label: status
  };
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium border rounded-full',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
