import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { UserProfileModal } from '@/components/admin/UserProfileModal';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/integrations/supabase/types';

interface FormattedAccount {
  id: string;
  name: string;
  email: string;
  type: string;
  registered: string;
  status: string;
  phone: string;
  address: string;
}

const sortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '名前順', value: 'name' },
  { label: 'ステータス順', value: 'status' },
];

const AdminAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<FormattedAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<FormattedAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<FormattedAccount | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch accounts from Supabase
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users from auth.users and join with profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          auth_users:id (
            email,
            created_at,
            last_sign_in_at
          )
        `);

      if (error) {
        throw error;
      }

      const formattedAccounts: FormattedAccount[] = (profiles as Profile[]).map(profile => ({
        id: profile.id,
        name: profile.name || profile.nickname || 'No Name',
        email: profile.auth_users?.email || profile.email || '',
        type: profile.user_type || 'Customer',
        registered: new Date(profile.auth_users?.created_at || profile.created_at).toLocaleString('ja-JP'),
        status: profile.status || 'アクティブ',
        phone: profile.phone || '',
        address: profile.address || '',
      }));

      setAccounts(formattedAccounts);
      setFilteredAccounts(formattedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "エラー",
        description: "アカウント情報の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredAccounts(accounts);
      return;
    }
    
    const filtered = accounts.filter(
      account => 
        account.name.toLowerCase().includes(term.toLowerCase()) || 
        account.id.includes(term) ||
        account.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredAccounts(filtered);
  };

  const handleSortChange = (value: string) => {
    let sorted = [...filteredAccounts];
    
    switch(value) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.registered).getTime() - new Date(a.registered).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.registered).getTime() - new Date(b.registered).getTime());
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'status':
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }
    
    setFilteredAccounts(sorted);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      const updatedAccounts = accounts.map(account => 
        account.id === userId ? { ...account, status: newStatus } : account
      );
      
      const updatedFiltered = filteredAccounts.map(account => 
        account.id === userId ? { ...account, status: newStatus } : account
      );
      
      setAccounts(updatedAccounts);
      setFilteredAccounts(updatedFiltered);
      
      toast({
        title: "ステータスを更新しました",
        description: `ユーザーID: ${userId}のステータスを${newStatus}に変更しました`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    try {
      // Delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update local state
      const updatedAccounts = accounts.filter(account => account.id !== userId);
      setAccounts(updatedAccounts);
      setFilteredAccounts(filteredAccounts.filter(account => account.id !== userId));

      toast({
        title: "アカウントを削除しました",
        description: `ユーザーID: ${userId}のアカウントを削除しました`,
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "エラー",
        description: "アカウントの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  const openUserProfile = (user: FormattedAccount) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const columns = [
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

  const actionMenuItems = [
    { 
      label: '詳細を見る', 
      onClick: (account: FormattedAccount) => openUserProfile(account)
    },
    { 
      label: 'ステータスを変更', 
      onClick: (account: FormattedAccount) => {
        const newStatus = account.status === 'アクティブ' ? 'バン済み' : 'アクティブ';
        handleStatusChange(account.id, newStatus);
      } 
    },
    { 
      label: 'アカウントを削除', 
      onClick: (account: FormattedAccount) => {
        if (window.confirm(`${account.name}のアカウントを削除してもよろしいですか？`)) {
          handleDeleteAccount(account.id);
        }
      } 
    },
  ];

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
        sortOptions={sortOptions}
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
