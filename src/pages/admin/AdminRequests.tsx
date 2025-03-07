
import { useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/hooks/use-toast';

// Sample data
const storeRequests = [
  { 
    id: '17400020276463087771230118852001', 
    name: '東京秘密基地', 
    email: 'accounttype@gmail.com',
    date: '2025/02/19 22:53',
    status: '許可'
  },
  { 
    id: '17400020276463087771230118852002', 
    name: '大阪リラクゼーションスペース', 
    email: 'osaka@example.com',
    date: '2025/02/18 14:23',
    status: '保留中'
  },
  { 
    id: '17400020276463087771230118852003', 
    name: '名古屋ヒーリングルーム', 
    email: 'nagoya@example.com',
    date: '2025/02/17 09:15',
    status: '許可'
  },
  { 
    id: '17400020276463087771230118852004', 
    name: '福岡セラピーセンター', 
    email: 'fukuoka@example.com',
    date: '2025/02/16 16:42',
    status: '保留中'
  },
];

const sortOptions = [
  { label: '全店舗表示', value: 'all' },
  { label: '許可済みのみ', value: 'approved' },
  { label: '保留中のみ', value: 'pending' },
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
];

const AdminRequests = () => {
  const { toast } = useToast();
  const [filteredRequests, setFilteredRequests] = useState(storeRequests);

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
        setFilteredRequests(storeRequests.filter(req => req.status === '許可'));
        return;
      case 'pending':
        setFilteredRequests(storeRequests.filter(req => req.status === '保留中'));
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
      onClick: (request: any) => {
        toast({
          title: "リクエスト詳細",
          description: `${request.name}の詳細を表示します`,
        });
      } 
    },
    { 
      label: '承認する', 
      onClick: (request: any) => {
        toast({
          title: "承認",
          description: `${request.name}を承認しました`,
          variant: "default",
        });
      } 
    },
    { 
      label: '拒否する', 
      onClick: (request: any) => {
        toast({
          title: "拒否確認",
          description: `${request.name}を拒否しますか？`,
          variant: "destructive",
        });
      } 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">店舗新規登録リクエスト</h1>
        <p className="text-muted-foreground mt-2">新しい店舗登録リクエストの管理</p>
      </div>
      
      <DataTable 
        columns={columns}
        data={filteredRequests}
        searchPlaceholder="店舗名やIDで検索"
        sortOptions={sortOptions}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
      />
    </div>
  );
};

export default AdminRequests;
