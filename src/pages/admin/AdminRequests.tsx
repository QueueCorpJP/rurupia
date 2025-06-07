import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StoreRequest {
  id: string;
  name: string;
  email: string;
  date: string;
  status: string;
  phone?: string;
  address?: string;
  description?: string;
}

const AdminRequests = () => {
  const { toast } = useToast();
  const { isAdminAuthenticated, adminUserId } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<StoreRequest[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<StoreRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      console.log('Admin is authenticated, fetching store requests...');
      fetchStoreRequests();
    }
  }, [isAdminAuthenticated]);

  const fetchStoreRequests = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log('Fetching store requests with adminUserId:', adminUserId);
      
      const { data, error } = await supabaseAdmin
        .from('stores')
        .select(`
          id,
          name,
          email,
          created_at,
          status,
          phone,
          address,
          description
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error fetching stores:', error);
        setErrorMessage(`Error: ${error.message}`);
        throw error;
      }
      
      console.log('Store data fetched:', data?.length || 0, 'records');
      
      if (data && data.length > 0) {
        const formattedRequests = data.map((store): StoreRequest => ({
          id: store.id,
          name: store.name || 'No Name',
          email: store.email || 'No Email',
          date: format(new Date(store.created_at), 'yyyy/MM/dd HH:mm'),
          status: store.status || 'pending',
          phone: store.phone,
          address: store.address,
          description: store.description
        }));
        
        console.log('Formatted store requests:', formattedRequests.length);
        
        setStoreRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      } else {
        console.log('No store data found or empty result');
        setStoreRequests([]);
        setFilteredRequests([]);
      }
    } catch (error) {
      console.error('Error fetching store requests:', error);
      setErrorMessage(`Failed to fetch store data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const { error } = await supabaseAdmin
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
    { key: 'id', label: 'ストアID', accessorKey: 'id' },
    { key: 'name', label: '店舗名', accessorKey: 'name' },
    { key: 'email', label: 'Eメール', accessorKey: 'email' },
    { key: 'date', label: '送信日', accessorKey: 'date' },
    { 
      key: 'status', 
      label: 'ステータス',
      accessorKey: 'status',
      render: (data: any) => {
        if (!data || !data.row) return null;
        const value = data.row.status;
        return <StatusBadge status={value} />;
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
        setSelectedRequest(request);
        setShowDetailsDialog(true);
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
        <h1 className="text-3xl font-bold tracking-tight">店舗申請</h1>
        <p className="text-muted-foreground mt-2">店舗登録のリクエスト管理</p>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      
      <DataTable 
        columns={columns}
        data={filteredRequests}
        searchPlaceholder="店舗名、ID、またはメールで検索"
        sortOptions={sortOptions}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
        isLoading={isLoading}
      />

      {/* Store Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>店舗リクエスト詳細</DialogTitle>
            <DialogDescription>
              店舗登録リクエストの詳細情報です
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>店舗名</Label>
                  <Input value={selectedRequest.name} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>ステータス</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>メールアドレス</Label>
                  <Input value={selectedRequest.email} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>電話番号</Label>
                  <Input value={selectedRequest.phone || '未設定'} readOnly className="bg-gray-50" />
                </div>
              </div>
              
              <div>
                <Label>住所</Label>
                <Input value={selectedRequest.address || '未設定'} readOnly className="bg-gray-50" />
              </div>
              
              <div>
                <Label>店舗説明</Label>
                <Textarea 
                  value={selectedRequest.description || '未設定'} 
                  readOnly 
                  className="bg-gray-50 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label>申請日時</Label>
                <Input value={selectedRequest.date} readOnly className="bg-gray-50" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;
