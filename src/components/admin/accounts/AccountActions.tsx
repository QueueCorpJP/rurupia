
import { Account, ActionMenuItem } from '@/types/admin/account.types';

interface AccountActionsProps {
  openUserProfile: (user: Account) => void;
  handleStatusChange: (userId: string, newStatus: string) => void;
  handleDeleteAccount: (userId: string) => void;
}

export const getAccountActions = ({
  openUserProfile,
  handleStatusChange,
  handleDeleteAccount
}: AccountActionsProps): ActionMenuItem[] => [
  { 
    label: '詳細を見る', 
    onClick: (account: Account) => openUserProfile(account)
  },
  { 
    label: 'ステータスを変更', 
    onClick: (account: Account) => {
      const newStatus = account.status === 'アクティブ' ? 'バン済み' : 'アクティブ';
      handleStatusChange(account.id, newStatus);
    } 
  },
  { 
    label: 'アカウントを削除', 
    onClick: (account: Account) => {
      if (window.confirm(`${account.name}のアカウントを削除してもよろしいですか？`)) {
        handleDeleteAccount(account.id);
      }
    } 
  },
];
