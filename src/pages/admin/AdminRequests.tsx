
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sortOptions = [
  { label: '全店舗表示', value: 'all' },
  { label: '許可済みのみ', value: 'approved' },
  { label: '保留中のみ', value: 'pending' },
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
];

const AdminRequests = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, email, created_at, status');

      if (error) throw error;

      // Format the data for the table
      const formattedStores = data.map(store => ({
        id: store.id,
        name: store.name,
        email: store.email,
        date: new Date(store.created_at).toLocaleString('ja-JP'),
        status: store.status === 'active' ? '許可' : '保留中'
      }));

      setStores(formattedStores);
      setFilteredStores(formattedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: "エラー",
        description: "店舗情報の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredStores(stores);
      return;
    }
    
    const filtered = stores.filter(
      store => 
        store.name.toLowerCase().includes(term.toLowerCase()) || 
        store.id.includes(term) ||
        store.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStores(filtered);
  };

  const handleSortChange = (value: string) => {
    let filtered = [...stores];
    
    switch(value) {
      case 'all':
        setFilteredStores(stores);
        return;
      case 'approved':
        setFilteredStores(stores.filter(store => store.status === '許可'));
        return;
      case 'pending':
        setFilteredStores(stores.filter(store => store.status === '保留中'));
        return;
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setFilteredStores(filtered);
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setFilteredStores(filtered);
        break;
    }
  };

  const handleStatusChange = async (storeId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ 
          status: newStatus === '許可' ? 'active' : 'pending' 
        })
        .eq('id', storeId);

      if (error) throw error;

      // Update local state
      const updatedStores = stores.map(store => 
        store.id === storeId ? { ...store, status: newStatus } : store
      );
      
      setStores(updatedStores);
      setFilteredStores(filteredStores.map(store => 
        store.id === storeId ? { ...store, status: newStatus } : store
      ));
      
      toast({
        title: "ステータスを更新しました",
        description: `店舗ID: ${storeId}のステータスを${newStatus}に変更しました`,
      });
    } catch (error) {
      console.error('Error updating store status:', error);
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const columns = [
    { key: 'id', label: 'ストアID' },
    { key: 'name', label: '店舗名' },
    { key: 'email', label: 'Eメール' },
    { key: 'date', label: '送信日' },
    { 
      key: 'status', 
      label: 'ステータス',
      render: (value: string) => <StatusBadge status={value} />
    },
  ];

  const actionMenuItems = [
    { 
      label: '詳細を見る', 
      onClick: (store: any) => {
        toast({
          title: "リクエスト詳細",
          description: `${store.name}の詳細を表示します`,
        });
      } 
    },
    { 
      label: '承認する', 
      onClick: (store: any) => {
        handleStatusChange(store.id, '許可');
      } 
    },
    { 
      label: '拒否する', 
      onClick: (store: any) => {
        if (window.confirm(`${store.name}を拒否しますか？`)) {
          handleStatusChange(store.id, '保留中');
        }
      } 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">店舗一覧</h1>
        <p className="text-muted-foreground mt-2">システムに登録されている店舗の管理</p>
      </div>
      
      <DataTable 
        columns={columns}
        data={filteredStores}
        searchPlaceholder="店舗名やIDで検索"
        sortOptions={sortOptions}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminRequests;
