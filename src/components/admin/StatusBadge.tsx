
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string;
  className?: string;
  label?: string; // Added label property
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  let badgeStyles = '';
  const statusValue = status || '未定義'; // Add default value if status is undefined
  const displayText = label || statusValue; // Use label if provided, otherwise use status
  
  switch (statusValue) {
    case '確定':
    case '在籍中':
    case '公開中':
    case '公開':
    case 'active':
      badgeStyles = 'bg-green-100 text-green-800 border-green-200';
      break;
    case '承諾待ち':
    case '承認待ち':
    case '対応中':
    case '公開予定':
    case 'pending':
      badgeStyles = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case 'キャンセル':
    case '不在':
    case '非公開':
    case 'inactive':
    case 'deleted':
      badgeStyles = 'bg-red-100 text-red-800 border-red-200';
      break;
    case '保留中':
    case '下書き':
    case 'draft':
      badgeStyles = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case '完了':
    case 'completed':
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
      {displayText}
    </span>
  );
}
