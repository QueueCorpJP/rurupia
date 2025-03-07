import { useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { UserProfileModal } from '@/components/admin/UserProfileModal';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data with extended fields for the profile modal
const accounts = [
  { 
    id: '174005961665x7177171110217600', 
    name: 'taka', 
    type: '', 
    registered: '2025/02/25 11:07', 
    status: 'バン済み',
    email: 'taka@example.com',
    phone: '080-1234-5678',
    address: '東京都渋谷区'
  },
  { 
    id: '174005961665x7177171110217601', 
    name: 'yossii', 
    type: 'Customer', 
    registered: '2025/02/20 14:53', 
    status: 'アクティブ',
    email: 'yossii@example.com',
    phone: '080-8765-4321',
    address: '大阪府大阪市'
  },
  { id: '174005961665x7177171110217602', name: 'mrisbridgeri', type: 'Customer', registered: '2025/02/20 14:53', status: 'アクティブ' },
  { id: '174005961665x7177171110217603', name: 'bmenath', type: 'Customer', registered: '2025/02/20 14:53', status: 'アクティブ' },
  { id: '174005961665x7177171110217604', name: 'gtremouletg', type: 'Customer', registered: '2025/02/20 14:53', status: 'アクティブ' },
  { id: '174005961665x7177171110217605', name: 'sscanlanf', type: 'Customer', registered: '2025/02/20 14:53', status: 'アクティブ' },
  { id: '174005961665x7177171110217606', name: 'triquete', type: 'Customer', registered: '2025/02/20 14:53', status: 'アクティブ' },
  { id: '174005961665x7177171110217607', name: 'dsinnottd', type: 'Customer', registered: '2025/02/20 14:53', status: 'アクティブ' },
  { id: '174005961665x7177171110217608', name: 'swildec', type: 'Customer', registered: '2025/02/20 14:53', status: 'バン済み' },
  { id: '174005961665x7177171110217609', name: 'simesonb', type: 'Customer', registered: '2025/02/20 14:53', status: 'バン済み' },
  { id: '174005961665x7177171110217610', name: 'cbaltrushaitisa', type: 'Customer', registered: '2025/02/20 14:53', status: 'バン済み' },
  { id: '174005961665x7177171110217611', name: 'esee9', type: 'Customer', registered: '2025/02/20 14:53', status: 'バン済み' },
];

const sortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '名前順', value: 'name' },
  { label: 'ステータス順', value: 'status' },
];

const AdminAccounts = () => {
  const { toast } = useToast();
  const [filteredAccounts, setFilteredAccounts] = useState(accounts);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredAccounts(accounts);
      return;
    }
    
    const filtered = accounts.filter(
      account => 
        account.name.toLowerCase().includes(term.toLowerCase()) || 
        account.id.includes(term)
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

  const handleStatusChange = (userId: string, newStatus: string) => {
    const updatedAccounts = accounts.map(account => 
      account.id === userId ? { ...account, status: newStatus } : account
    );
    
    const updatedFiltered = filteredAccounts.map(account => 
      account.id === userId ? { ...account, status: newStatus } : account
    );
    
    accounts.splice(0, accounts.length, ...updatedAccounts);
    setFilteredAccounts(updatedFiltered);
    
    toast({
      title: "ステータスを更新しました",
      description: `ユーザーID: ${userId}のステータスを${newStatus}に変更しました`,
    });
  };

  const openUserProfile = (user: any) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'ユーザー名' },
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
      onClick: (account: any) => openUserProfile(account)
    },
    { 
      label: 'ステータスを変更', 
      onClick: (account: any) => {
        const newStatus = account.status === 'アクティブ' ? 'バン済み' : 'アクティブ';
        handleStatusChange(account.id, newStatus);
      } 
    },
    { 
      label: 'アカウントを削除', 
      onClick: (account: any) => {
        toast({
          title: "削除確認",
          description: `${account.name}を削除しますか？`,
          variant: "destructive",
        });
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
        <Button className="sm:self-end">
          <UserPlus className="mr-2 h-4 w-4" />
          新規アカウントを作成
        </Button>
      </div>
      
      <DataTable 
        columns={columns}
        data={filteredAccounts}
        searchPlaceholder="名前やIDで検索"
        sortOptions={sortOptions}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
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
