
import { useState } from 'react';
import { UserProfileModal } from '@/components/admin/UserProfileModal';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { useAccounts } from '@/hooks/admin/useAccounts';
import { getAccountTableColumns } from '@/components/admin/accounts/AccountTableColumns';
import { getAccountActions } from '@/components/admin/accounts/AccountActions';
import { ACCOUNT_SORT_OPTIONS } from '@/constants/admin/sortOptions';
import { Account } from '@/types/admin/account.types';

const AdminAccounts = () => {
  const { 
    filteredAccounts, 
    isLoading, 
    fetchAccounts, 
    handleSearch, 
    handleSortChange, 
    handleStatusChange, 
    handleDeleteAccount 
  } = useAccounts();
  
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openUserProfile = (user: Account) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const columns = getAccountTableColumns();
  const actionMenuItems = getAccountActions({
    openUserProfile,
    handleStatusChange,
    handleDeleteAccount
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">アカウント管理</h1>
          <p className="text-muted-foreground mt-2">ユーザーアカウントの管理と監視</p>
        </div>
        <Button className="sm:self-end" onClick={() => fetchAccounts()}>
          <UserPlus className="mr-2 h-4 w-4" />
          更新
        </Button>
      </div>
      
      <DataTable 
        columns={columns}
        data={filteredAccounts}
        searchPlaceholder="名前、メール、IDで検索"
        sortOptions={ACCOUNT_SORT_OPTIONS}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
        isLoading={isLoading}
      />

      <UserProfileModal 
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default AdminAccounts;
