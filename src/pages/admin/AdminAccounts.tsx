import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { PlusCircle, Users } from 'lucide-react';

// User account type mapping in Japanese
const USER_TYPE_MAP = {
  therapist: "セラピスト",
  client: "クライアント",
  store: "店舗",
  admin: "管理者",
  user: "一般ユーザー",
  customer: "お客様"
};

interface FormattedAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_type: string;
  status: string;
  created_at: string;
  is_verified: boolean;
  verification_document: string;
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<FormattedAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<FormattedAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<FormattedAccount | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, initializeAdminSession } = useAdminAuth();

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAccounts();
    }
  }, [isAdminAuthenticated]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAccounts: FormattedAccount[] = data.map((account) => ({
        id: account.id,
        name: account.name || 'N/A',
        email: account.email || 'N/A',
        phone: account.phone || 'N/A',
        address: account.address || 'N/A',
        user_type: account.user_type || 'user',
        status: account.status || 'active',
        created_at: new Date(account.created_at).toLocaleDateString(),
        is_verified: account.is_verified || false,
        verification_document: account.verification_document || '',
      }));

      setAccounts(formattedAccounts);
      setFilteredAccounts(formattedAccounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('アカウントの取得に失敗しました');
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    const filtered = accounts.filter((account) =>
      Object.values(account).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredAccounts(filtered);
  };

  const handleSortChange = (value: string) => {
    const [column, direction] = value.split(':');
    const sorted = [...filteredAccounts].sort((a: any, b: any) => {
      if (direction === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      }
      return a[column] < b[column] ? 1 : -1;
    });
    setFilteredAccounts(sorted);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`ステータスを${newStatus === 'active' ? 'アクティブ' : '無効'}に更新しました`);
      fetchAccounts();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('ステータスの更新に失敗しました');
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!window.confirm('このアカウントを削除してもよろしいですか？')) {
      return;
    }
    
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('アカウントを削除しました');
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('アカウントの削除に失敗しました');
    }
  };

  const openUserProfile = (user: FormattedAccount) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      accessorKey: 'id',
      render: (data: any) => {
        if (!data || !data.row) return null;
        return (
          <div className="max-w-[100px] truncate" title={data.row.id}>
            {data.row.id}
          </div>
        );
      },
    },
    {
      key: 'name',
      label: '名前',
      accessorKey: 'name',
    },
    {
      key: 'email',
      label: 'メールアドレス',
      accessorKey: 'email',
    },
    {
      key: 'user_type',
      label: 'ユーザータイプ',
      accessorKey: 'user_type',
      render: (data: any) => {
        if (!data || !data.row) return null;
        return USER_TYPE_MAP[data.row.user_type] || data.row.user_type;
      },
    },
    {
      key: 'created_at',
      label: '登録日',
      accessorKey: 'created_at',
    },
    {
      key: 'status',
      label: 'ステータス',
      accessorKey: 'status',
      render: (data: any) => {
        if (!data || !data.row) return null;
        return <StatusBadge status={data.row.status} />;
      },
    },
  ];

  const sortOptions = [
    { label: '名前（昇順）', value: 'name:asc' },
    { label: '名前（降順）', value: 'name:desc' },
    { label: 'メールアドレス（昇順）', value: 'email:asc' },
    { label: 'メールアドレス（降順）', value: 'email:desc' },
    { label: '登録日（新しい順）', value: 'created_at:desc' },
    { label: '登録日（古い順）', value: 'created_at:asc' },
    { label: 'ユーザータイプ', value: 'user_type:asc' },
  ];

  const actionMenuItems = [
    {
      label: '詳細',
      onClick: (row: FormattedAccount) => openUserProfile(row),
    },
    {
      label: 'ステータス変更',
      onClick: (row: FormattedAccount) => handleStatusChange(row.id, row.status === 'active' ? 'inactive' : 'active'),
    },
    {
      label: '削除',
      onClick: (row: FormattedAccount) => handleDeleteAccount(row.id),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">アカウント管理</h1>
        <p className="text-muted-foreground mt-2">ユーザーアカウントの管理と詳細情報の確認</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">全ユーザー: {filteredAccounts.length}</span>
        </div>
        <Button variant="default">
          <PlusCircle className="w-4 h-4 mr-2" />
          新規アカウント
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredAccounts}
        searchPlaceholder="ユーザーを検索..."
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        actionMenuItems={actionMenuItems}
        isLoading={loading}
      />

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザープロフィール</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>名前</Label>
                  <Input value={selectedUser.name} readOnly />
                </div>
                <div>
                  <Label>メールアドレス</Label>
                  <Input value={selectedUser.email} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>電話番号</Label>
                  <Input value={selectedUser.phone} readOnly />
                </div>
                <div>
                  <Label>住所</Label>
                  <Input value={selectedUser.address} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ユーザータイプ</Label>
                  <Input value={USER_TYPE_MAP[selectedUser.user_type] || selectedUser.user_type} readOnly />
                </div>
                <div>
                  <Label>ステータス</Label>
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>
              <div>
                <Label>本人確認ステータス</Label>
                <div className="mt-1">
                  {selectedUser.is_verified ? (
                    <span className="text-green-600">確認済み</span>
                  ) : (
                    <span className="text-yellow-600">未確認</span>
                  )}
                </div>
              </div>
              {selectedUser.verification_document && (
                <div>
                  <Label>Verification Document</Label>
                  <div className="mt-1">
                    <a
                      href={selectedUser.verification_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
