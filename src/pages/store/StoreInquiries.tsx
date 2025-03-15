
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare } from 'lucide-react';

const inquiries = [
  {
    id: 'INQ001',
    name: '佐藤 健太',
    email: 'kenta@example.com',
    subject: '予約の変更について',
    message: 'こんにちは。予約した日時を変更したいのですが、可能でしょうか？',
    date: '2025/02/20 13:45',
    status: '未対応'
  },
  {
    id: 'INQ002',
    name: '田中 美咲',
    email: 'misaki@example.com',
    subject: 'キャンセルポリシーについて',
    message: 'キャンセル料はいつから発生しますか？前日キャンセルの場合どうなりますか？',
    date: '2025/02/19 10:22',
    status: '対応中'
  },
  {
    id: 'INQ003',
    name: '鈴木 大輔',
    email: 'daisuke@example.com',
    subject: '駐車場について',
    message: '店舗に駐車場はありますか？近くにコインパーキングなどはありますか？',
    date: '2025/02/18 16:35',
    status: '完了'
  },
  {
    id: 'INQ004',
    name: '高橋 由美',
    email: 'yumi@example.com',
    subject: 'コースの内容について',
    message: 'アロマオイルマッサージとはどのようなものですか？初めてなのでどのコースがおすすめですか？',
    date: '2025/02/17 09:11',
    status: '完了'
  }
];

const StoreInquiries = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInquiries, setFilteredInquiries] = useState(inquiries);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredInquiries(inquiries);
      return;
    }
    
    const filtered = inquiries.filter(
      inquiry => 
        inquiry.name.toLowerCase().includes(query.toLowerCase()) ||
        inquiry.subject.toLowerCase().includes(query.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredInquiries(filtered);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">お問い合わせ管理</h1>
        <p className="text-muted-foreground mt-2">顧客からのお問い合わせを管理します</p>
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full">
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
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせ一覧</CardTitle>
                <CardDescription>
                  顧客からのお問い合わせ内容と対応状況を確認できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                          <Button variant="ghost" size="sm" className="mt-1 px-2 h-7">
                            返信する
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="unresolved">
            {/* 未対応のお問い合わせのみ表示 */}
          </TabsContent>
          
          <TabsContent value="inprogress">
            {/* 対応中のお問い合わせのみ表示 */}
          </TabsContent>
          
          <TabsContent value="resolved">
            {/* 完了のお問い合わせのみ表示 */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StoreInquiries;
