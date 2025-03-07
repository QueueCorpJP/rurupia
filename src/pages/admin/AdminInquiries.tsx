
import { useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Sample data
const inquiries = [
  { 
    id: '1',
    date: '2025/02/25 15:42',
    username: 'tanaka_miyuki',
    type: 'サポート',
    status: '未対応',
    content: '予約した後にキャンセルする方法が分かりません。教えてください。'
  },
  { 
    id: '2',
    date: '2025/02/24 11:23',
    username: 'yamada_ken',
    type: 'クレーム',
    status: '対応中',
    content: 'セラピストが予約時間に来ませんでした。返金を希望します。'
  },
  { 
    id: '3',
    date: '2025/02/22 09:15',
    username: 'suzuki_ai',
    type: '提案',
    status: '完了',
    content: 'アプリでも予約できるようにしてほしいです。とても便利だと思います。'
  },
  { 
    id: '4',
    date: '2025/02/20 16:38',
    username: 'sato_takeshi',
    type: '質問',
    status: '完了',
    content: '料金体系について詳しく知りたいです。'
  },
  { 
    id: '5',
    date: '2025/02/18 14:05',
    username: 'nakamura_yuki',
    type: 'バグ報告',
    status: '未対応',
    content: 'プロフィール写真がアップロードできません。エラーが発生します。'
  },
];

const sortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '未対応のみ', value: 'unresolved' },
  { label: '対応中のみ', value: 'inProgress' },
  { label: '完了のみ', value: 'completed' },
];

const typeColors: Record<string, string> = {
  'サポート': 'default',
  'クレーム': 'destructive',
  '提案': 'secondary',
  '質問': 'primary',
  'バグ報告': 'outline'
};

const AdminInquiries = () => {
  const { toast } = useToast();
  const [filteredInquiries, setFilteredInquiries] = useState(inquiries);

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredInquiries(inquiries);
      return;
    }
    
    const filtered = inquiries.filter(
      inquiry => 
        inquiry.username.toLowerCase().includes(term.toLowerCase()) || 
        inquiry.content.toLowerCase().includes(term.toLowerCase()) ||
        inquiry.type.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredInquiries(filtered);
  };

  const handleSortChange = (value: string) => {
    let sorted = [...inquiries];
    
    switch(value) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setFilteredInquiries(sorted);
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setFilteredInquiries(sorted);
        break;
      case 'unresolved':
        setFilteredInquiries(inquiries.filter(item => item.status === '未対応'));
        break;
      case 'inProgress':
        setFilteredInquiries(inquiries.filter(item => item.status === '対応中'));
        break;
      case 'completed':
        setFilteredInquiries(inquiries.filter(item => item.status === '完了'));
        break;
    }
  };

  const columns = [
    { key: 'date', label: '日時' },
    { key: 'username', label: 'ユーザー名' },
    { 
      key: 'type', 
      label: '種類',
      render: (value: string) => (
        <Badge variant={typeColors[value] as any || 'default'}>{value}</Badge>
      )
    },
    { 
      key: 'status', 
      label: 'ステータス',
      render: (value: string) => {
        const status = 
          value === '未対応' ? 'pending' : 
          value === '対応中' ? 'active' : 
          'approved';
        return <StatusBadge status={status} label={value} />;
      }
    },
    { 
      key: 'content', 
      label: '内容',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
  ];

  const actionMenuItems = [
    { 
      label: '詳細を表示', 
      onClick: (inquiry: any) => {
        toast({
          title: "問い合わせ詳細",
          description: `${inquiry.username}からの問い合わせを表示します`,
        });
      } 
    },
    { 
      label: '対応中にする', 
      onClick: (inquiry: any) => {
        toast({
          description: `ステータスを「対応中」に変更しました`,
        });
      } 
    },
    { 
      label: '完了にする', 
      onClick: (inquiry: any) => {
        toast({
          description: `ステータスを「完了」に変更しました`,
        });
      } 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">お問い合わせ・クレーム</h1>
        <p className="text-muted-foreground mt-2">ユーザーからの問い合わせとクレームの管理</p>
      </div>
      
      <DataTable 
        columns={columns}
        data={filteredInquiries}
        searchPlaceholder="ユーザーIDで検索"
        sortOptions={sortOptions}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
      />
    </div>
  );
};

export default AdminInquiries;
