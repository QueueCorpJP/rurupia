
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

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

const StoreInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error("Error fetching inquiries:", error);
          toast.error("お問い合わせの取得に失敗しました");
          return;
        }
        
        const formattedInquiries: Inquiry[] = data.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          subject: item.subject,
          message: item.message,
          date: new Date(item.date).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: item.status,
          response: item.response,
          responded_at: item.responded_at ? new Date(item.responded_at).toLocaleString('ja-JP') : undefined
        }));
        
        setInquiries(formattedInquiries);
        setFilteredInquiries(formattedInquiries);
      } catch (error) {
        console.error("Error in fetchInquiries:", error);
        toast.error("エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      filterByTab(activeTab, inquiries);
      return;
    }
    
    const filtered = inquiries.filter(
      inquiry => 
        inquiry.name.toLowerCase().includes(query.toLowerCase()) ||
        inquiry.subject.toLowerCase().includes(query.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(query.toLowerCase())
    );
    
    filterByTab(activeTab, filtered);
  };

  const filterByTab = (tab: string, data: Inquiry[] = inquiries) => {
    setActiveTab(tab);
    
    if (tab === 'all') {
      setFilteredInquiries(data);
      return;
    }
    
    const statusMap: Record<string, string> = {
      'unresolved': '未対応',
      'inprogress': '対応中',
      'resolved': '完了'
    };
    
    const filtered = data.filter(inquiry => inquiry.status === statusMap[tab]);
    setFilteredInquiries(filtered);
  };

  const handleReply = async (id: string) => {
    try {
      // This would normally open a reply form
      // For now, just update the status to "対応中"
      const { error } = await supabase
        .from('inquiries')
        .update({ status: '対応中' })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating inquiry status:", error);
        toast.error("ステータスの更新に失敗しました");
        return;
      }
      
      // Update local state
      const updatedInquiries = inquiries.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status: '対応中' } : inquiry
      );
      setInquiries(updatedInquiries);
      
      // Re-filter based on current tab
      filterByTab(activeTab, updatedInquiries);
      
      toast.success("対応中に更新しました");
    } catch (error) {
      console.error("Error in handleReply:", error);
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">お問い合わせ管理</h1>
        <p className="text-muted-foreground mt-2">顧客からのお問い合わせを管理します</p>
      </div>

      <div className="flex justify-between items-center">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => filterByTab(value)}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">全て</TabsTrigger>
              <TabsTrigger value="unresolved">未対応</TabsTrigger>
              <TabsTrigger value="inprogress">対応中</TabsTrigger>
              <TabsTrigger value="resolved">完了</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="検索..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせ一覧</CardTitle>
                <CardDescription>
                  顧客からのお問い合わせ内容と対応状況を確認できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">データを読み込んでいます...</p>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    該当するお問い合わせはありません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-medium">{inquiry.subject}</h3>
                          </div>
                          <Badge variant={
                            inquiry.status === '未対応' ? 'destructive' : 
                            inquiry.status === '対応中' ? 'default' : 'outline'
                          }>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{inquiry.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div>
                            <p className="text-sm">{inquiry.name}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{inquiry.date}</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1 px-2 h-7"
                              onClick={() => handleReply(inquiry.id)}
                            >
                              返信する
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StoreInquiries;
