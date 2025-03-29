import { Suspense, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/admin-client";
import { PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  user_type: string | null;
  created_at: string;
  status: string;
  is_verified: boolean;
  [key: string]: any;
}

export default function AdminAccountsFix() {
  const [accounts, setAccounts] = useState<FormattedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FormattedAccount | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      // Use supabaseAdmin to bypass RLS
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("アカウントの取得に失敗しました");
        console.error(error);
        return;
      }

      const formattedAccounts = data.map((account) => ({
        ...account,
        // Use nickname if name is not available
        name: account.name || account.nickname || 'N/A',
        email: account.email || 'N/A',
        created_at: new Date(account.created_at).toLocaleDateString("ja-JP"),
        status: account.status || "active",
      }));

      setAccounts(formattedAccounts);
    } catch (err) {
      toast.error("アカウントの取得に失敗しました");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        toast.error("ステータスの更新に失敗しました");
        console.error(error);
        return;
      }

      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === id ? { ...account, status: newStatus } : account
        )
      );

      toast.success(`ステータスを${newStatus === 'active' ? 'アクティブ' : '無効'}に更新しました`);
    } catch (err) {
      toast.error("ステータスの更新に失敗しました");
      console.error(err);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm("このアカウントを削除してもよろしいですか？")) {
      return;
    }

    try {
      const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id);

      if (error) {
        toast.error("アカウントの削除に失敗しました");
        console.error(error);
        return;
      }

      setAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );

      toast.success("アカウントが削除されました");
    } catch (err) {
      toast.error("アカウントの削除に失敗しました");
      console.error(err);
    }
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm) {
      fetchAccounts();
      return;
    }

    const filtered = accounts.filter((account) =>
      Object.values(account).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setAccounts(filtered);
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
        return USER_TYPE_MAP[data.row.user_type] || data.row.user_type || "なし";
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

  const handleSortChange = (value: string) => {
    const [column, direction] = value.split(':');
    let sorted = [...accounts];
    
    if (column === 'created_at') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at.split('/').reverse().join('/'));
        const dateB = new Date(b.created_at.split('/').reverse().join('/'));
        return direction === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      });
    } else {
      sorted.sort((a, b) => {
        const valueA = a[column] || '';
        const valueB = b[column] || '';
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return direction === 'asc'
            ? valueA.localeCompare(valueB, 'ja')
            : valueB.localeCompare(valueA, 'ja');
        }
        
        return direction === 'asc'
          ? (valueA > valueB ? 1 : -1)
          : (valueA < valueB ? 1 : -1);
      });
    }
    
    setAccounts(sorted);
  };

  const actionMenuItems = [
    {
      label: '詳細',
      onClick: (row: FormattedAccount) => {
        setSelectedUser(row);
        setShowUserDetails(true);
      },
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
          <span className="text-muted-foreground">全ユーザー: {accounts.length}</span>
        </div>
        <Button variant="default">
          <PlusCircle className="w-4 h-4 mr-2" />
          新規アカウント
        </Button>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <DataTable
          columns={columns}
          data={accounts}
          searchPlaceholder="ユーザーを検索..."
          onSearchChange={handleSearch}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          actionMenuItems={actionMenuItems}
          isLoading={isLoading}
        />
      </Suspense>

      {selectedUser && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ユーザー詳細</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">名前:</div>
                <div className="col-span-3">{selectedUser.name || "なし"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">メールアドレス:</div>
                <div className="col-span-3">{selectedUser.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">電話番号:</div>
                <div className="col-span-3">{selectedUser.phone || "なし"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">住所:</div>
                <div className="col-span-3">{selectedUser.address || "なし"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">ユーザータイプ:</div>
                <div className="col-span-3">
                  {USER_TYPE_MAP[selectedUser.user_type as keyof typeof USER_TYPE_MAP] || selectedUser.user_type || "なし"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">ステータス:</div>
                <div className="col-span-3">
                  {selectedUser.status === "active" ? "アクティブ" : "無効"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">認証状態:</div>
                <div className="col-span-3">
                  {selectedUser.is_verified ? "認証済み" : "未認証"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold">作成日:</div>
                <div className="col-span-3">{selectedUser.created_at}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 