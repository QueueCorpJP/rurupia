import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { format } from 'date-fns';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: string;
  response?: string;
  responded_at?: string;
}

const typeColors: Record<string, string> = {
  'general': 'default',
  'complaint': 'destructive',
  'suggestion': 'secondary',
  'question': 'primary',
  'bug': 'outline'
};

const typeLabels: Record<string, string> = {
  'support': 'サポート',
  'complaint': 'クレーム',
  'suggestion': '提案',
  'question': '質問',
  'bug': 'バグ報告'
};

const statusLabels: Record<string, string> = {
  'pending': '未対応',
  'in_progress': '対応中',
  'resolved': '完了'
};

const AdminInquiries = () => {
  const { toast } = useToast();
  const { isAdminAuthenticated } = useAdminAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchInquiries();
    }
  }, [isAdminAuthenticated]);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedInquiries = data.map(inquiry => ({
          ...inquiry,
          date: format(new Date(inquiry.date), 'yyyy/MM/dd HH:mm'),
          responded_at: inquiry.responded_at 
            ? format(new Date(inquiry.responded_at), 'yyyy/MM/dd HH:mm')
            : undefined
        }));
        setInquiries(formattedInquiries);
        setFilteredInquiries(formattedInquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: "エラー",
        description: "お問い合わせデータの取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredInquiries(inquiries);
      return;
    }
    
    const filtered = inquiries.filter(
      inquiry => 
        inquiry.name.toLowerCase().includes(term.toLowerCase()) || 
        inquiry.email.toLowerCase().includes(term.toLowerCase()) ||
        inquiry.subject.toLowerCase().includes(term.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(term.toLowerCase())
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
        setFilteredInquiries(inquiries.filter(item => item.status === 'pending'));
        break;
      case 'inProgress':
        setFilteredInquiries(inquiries.filter(item => item.status === 'in_progress'));
        break;
      case 'completed':
        setFilteredInquiries(inquiries.filter(item => item.status === 'resolved'));
        break;
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('inquiries')
        .update({ 
          status,
          ...(status === 'resolved' ? { responded_at: new Date().toISOString() } : {})
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        description: `ステータスを「${statusLabels[status]}」に変更しました`,
      });

      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const columns = [
    { key: 'date', label: '日時', accessorKey: 'date' },
    { key: 'name', label: '名前', accessorKey: 'name' },
    { key: 'email', label: 'メール', accessorKey: 'email' },
    { key: 'subject', label: '件名', accessorKey: 'subject' },
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
    { 
      key: 'message', 
      label: '内容',
      accessorKey: 'message',
      render: (data: any) => {
        if (!data || !data.row) return null;
        const value = data.row.message;
        return (
          <div className="max-w-xs truncate" title={value}>
            {value}
          </div>
        );
      }
    },
  ];

  const sortOptions = [
    { label: '新しい順', value: 'newest' },
    { label: '古い順', value: 'oldest' },
    { label: '未対応のみ', value: 'unresolved' },
    { label: '対応中のみ', value: 'inProgress' },
    { label: '完了のみ', value: 'completed' },
  ];

  const actionMenuItems = [
    { 
      label: '詳細を表示', 
      onClick: (inquiry: Inquiry) => {
        toast({
          title: "問い合わせ詳細",
          description: `
            名前: ${inquiry.name}
            メール: ${inquiry.email}
            件名: ${inquiry.subject}
            内容: ${inquiry.message}
            ${inquiry.response ? `\n回答: ${inquiry.response}` : ''}
            ${inquiry.responded_at ? `\n回答日時: ${inquiry.responded_at}` : ''}
          `,
        });
      } 
    },
    { 
      label: '対応中にする', 
      onClick: (inquiry: Inquiry) => {
        if (inquiry.status !== 'in_progress') {
          updateInquiryStatus(inquiry.id, 'in_progress');
        }
      } 
    },
    { 
      label: '完了にする', 
      onClick: (inquiry: Inquiry) => {
        if (inquiry.status !== 'resolved') {
          updateInquiryStatus(inquiry.id, 'resolved');
        }
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
        searchPlaceholder="名前、メール、件名で検索"
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
