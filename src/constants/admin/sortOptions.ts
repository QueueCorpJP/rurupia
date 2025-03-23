
import { SortOption } from '@/types/admin/account.types';

export const ACCOUNT_SORT_OPTIONS: SortOption[] = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '名前順', value: 'name' },
  { label: 'ステータス順', value: 'status' },
];
