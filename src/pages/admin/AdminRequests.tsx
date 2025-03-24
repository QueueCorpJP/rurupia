
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface StoreRequest {
  id: string;
  name: string;
  email: string;
  date: string;
  status: string;
}

const AdminRequests = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<StoreRequest[]>([]);

  useEffect(() => {
    fetchStoreRequests();
  }, []);

  const fetchStoreRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, email, created_at, status')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const formattedRequests = data.map((store): StoreRequest => ({
          id: store.id,
          name: store.name,
          email: store.email,
          date: format(new Date(store.created_at), 'yyyy/MM/dd HH:mm'),
          status: store.status
        }));
        
        setStoreRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Error fetching store requests:', error);
      toast({
        title: 'エラー',
        description: '店舗データの取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredRequests(storeRequests);
      return;
    }
    
    const filtered = storeRequests.filter(
      request => 
        request.name.toLowerCase().includes(term.toLowerCase()) || 
        request.id.includes(term) ||
        request.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredRequests(filtered);
  };

  const handleSortChange = (value: string) => {
    let sorted = [...storeRequests];
    
    switch(value) {
      case 'all':
        setFilteredRequests(storeRequests);
        return;
      case 'approved':
        setFilteredRequests(storeRequests.filter(req => req.status === 'active'));
        return;
      case 'pending':
        setFilteredRequests(storeRequests.filter(req => req.status === 'pending'));
        return;
      case 'newest':
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
    }
    
    setFilteredRequests(sorted);
  };

  const updateStoreStatus = async (storeId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ status })
        .eq('id', storeId);
        
      if (error) throw error;
      
      // Update local state
      const updatedRequests = storeRequests.map(request => 
        request.id === storeId 
          ? { ...request, status } 
          : request
      );
      
      setStoreRequests(updatedRequests);
      setFilteredRequests(filteredRequests.map(request => 
        request.id === storeId 
          ? { ...request, status } 
          : request
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating store status:', error);
      return false;
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
      render: (value: string) => {
        let label = '';
        switch (value) {
          case 'active':
            label = '許可';
            break;
          case 'pending':
            label = '保留中';
            break;
          case 'rejected':
            label = '拒否';
            break;
          case 'inactive':
            label = '停止中';
            break;
          default:
            label = value;
        }
        return <StatusBadge status={value} label={label} />;
      }
    },
  ];

  const sortOptions = [
    { label: '全店舗表示', value: 'all' },
    { label: '許可済みのみ', value: 'approved' },
    { label: '保留中のみ', value: 'pending' },
    { label: '新しい順', value: 'newest' },
    { label: '古い順', value: 'oldest' },
  ];

  const actionMenuItems = [
    { 
      label: '詳細を見る', 
      onClick: (request: StoreRequest) => {
        toast({
          title: "リクエスト詳細",
          description: `${request.name}の詳細を表示します`,
        });
      } 
    },
    { 
      label: '承認する', 
      onClick: async (request: StoreRequest) => {
        if (request.status === 'active') {
          toast({
            title: "情報",
            description: `${request.name}はすでに承認されています`,
          });
          return;
        }
        
        const success = await updateStoreStatus(request.id, 'active');
        
        if (success) {
          toast({
            title: "承認",
            description: `${request.name}を承認しました`,
            variant: "default",
          });
        } else {
          toast({
            title: "エラー",
            description: `${request.name}の承認に失敗しました`,
            variant: "destructive",
          });
        }
      } 
    },
    { 
      label: '拒否する', 
      onClick: async (request: StoreRequest) => {
        if (request.status === 'rejected') {
          toast({
            title: "情報",
            description: `${request.name}はすでに拒否されています`,
          });
          return;
        }
        
        const success = await updateStoreStatus(request.id, 'rejected');
        
        if (success) {
          toast({
            title: "拒否",
            description: `${request.name}を拒否しました`,
            variant: "default",
          });
        } else {
          toast({
            title: "エラー",
            description: `${request.name}の拒否に失敗しました`,
            variant: "destructive",
          });
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
        data={filteredRequests}
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
