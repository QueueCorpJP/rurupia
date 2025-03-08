
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string;
  className?: string;
  // Adding an optional label property to fix the AdminInquiries error
  label?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let badgeStyles = '';
  
  switch (status) {
    case '確定':
    case '在籍中':
      badgeStyles = 'bg-green-100 text-green-800 border-green-200';
      break;
    case '承諾待ち':
    case '承認待ち':
    case '対応中':
      badgeStyles = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case 'キャンセル':
    case '不在':
      badgeStyles = 'bg-red-100 text-red-800 border-red-200';
      break;
    case '保留中':
      badgeStyles = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case '完了':
      badgeStyles = 'bg-gray-100 text-gray-800 border-gray-200';
      break;
    default:
      badgeStyles = 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      badgeStyles,
      className
    )}>
      {status}
    </span>
  );
}
