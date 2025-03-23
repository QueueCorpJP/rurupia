
import { StatusBadge } from '@/components/admin/StatusBadge';

export const getAccountTableColumns = () => [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'ユーザー名' },
  { key: 'email', label: 'メールアドレス' },
  { 
    key: 'type', 
    label: 'タイプ',
    render: (value: string) => value || '-'
  },
  { key: 'registered', label: '登録日' },
  { 
    key: 'status', 
    label: 'ステータス',
    render: (value: string) => <StatusBadge status={value} />
  },
];
