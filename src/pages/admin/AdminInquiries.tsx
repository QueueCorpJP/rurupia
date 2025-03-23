
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const typeColors: Record<string, string> = {
  'サポート': 'default',
  'クレーム': 'destructive',
  '提案': 'secondary',
  '質問': 'primary',
  'バグ報告': 'outline'
};

const sortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '未対応のみ', value: 'unresolved' },
  { label: '対応中のみ', value: 'inProgress' },
  { label: '完了のみ', value: 'completed' },
];

const AdminInquiries = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Format the data to include a type property
      const formattedInquiries = data.map(inquiry => ({
        ...inquiry,
        username: inquiry.name,
        type: determineInquiryType(inquiry.subject),
        date: new Date(inquiry.date).toLocaleString('ja-JP')
      }));

      setInquiries(formattedInquiries);
      setFilteredInquiries(formattedInquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: "エラー",
        description: "問い合わせの取得に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine inquiry type based on subject
  const determineInquiryType = (subject: string) => {
    const lowercaseSubject = subject.toLowerCase();
    if (lowercaseSubject.includes('サポート')) return 'サポート';
    if (lowercaseSubject.includes('クレーム') || lowercaseSubject.includes('苦情')) return 'クレーム';
    if (lowercaseSubject.includes('提案') || lowercaseSubject.includes('アイデア')) return '提案';
    if (lowercaseSubject.includes('バグ') || lowercaseSubject.includes('エラー')) return 'バグ報告';
    return '質問';
  };

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

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId);

      if (error) throw error;

      // Update local state
      const updatedInquiries = inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      );
      
      setInquiries(updatedInquiries);
      setFilteredInquiries(filteredInquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      ));
      
      toast({
        description: `ステータスを「${newStatus}」に変更しました`,
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive"
      });
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
        updateInquiryStatus(inquiry.id, '対応中');
      } 
    },
    { 
      label: '完了にする', 
      onClick: (inquiry: any) => {
        updateInquiryStatus(inquiry.id, '完了');
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
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminInquiries;
