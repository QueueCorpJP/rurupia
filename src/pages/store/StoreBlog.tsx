
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  FileImage
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// サンプルデータ
const blogPosts = [
  {
    id: 1,
    title: '夏の疲れを癒す！おすすめのマッサージコース',
    status: '公開',
    category: '季節のお知らせ',
    date: '2025/02/15',
    author: '田中 健',
    views: 245
  },
  {
    id: 2,
    title: 'リラクゼーションとアロマの効果',
    status: '公開',
    category: '健康情報',
    date: '2025/02/10',
    author: '佐藤 愛',
    views: 187
  },
  {
    id: 3,
    title: '新メニュー「ホットストーンマッサージ」のご案内',
    status: '公開予定',
    category: '新メニュー',
    date: '2025/02/25',
    author: '鈴木 美優',
    views: 0
  },
  {
    id: 4,
    title: 'マッサージ前後の水分補給の重要性',
    status: '下書き',
    category: '健康情報',
    date: '-',
    author: '高橋 誠',
    views: 0
  }
];

const StoreBlog = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredPosts(blogPosts);
      return;
    }
    
    const filtered = blogPosts.filter(
      post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.category.toLowerCase().includes(query.toLowerCase()) ||
        post.author.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredPosts(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ブログ管理</h1>
          <p className="text-muted-foreground mt-2">店舗ブログの投稿・管理</p>
        </div>
        <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規投稿
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>新規ブログ投稿</DialogTitle>
              <DialogDescription>
                ブログ記事の内容を入力してください。下書き保存か公開を選択できます。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input id="title" placeholder="記事のタイトルを入力" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Input id="category" placeholder="例: 健康情報" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publish-date">公開日</Label>
                  <div className="flex">
                    <Input id="publish-date" type="date" />
                    <Button variant="outline" size="icon" className="ml-2">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">本文</Label>
                <Textarea 
                  id="content" 
                  placeholder="記事の本文を入力してください" 
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label>画像の追加</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <FileImage className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    ドラッグ＆ドロップまたはクリックして画像をアップロード
                  </p>
                  <Button variant="outline" size="sm">
                    画像を選択
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPostDialogOpen(false)}>キャンセル</Button>
              <Button variant="secondary">下書き保存</Button>
              <Button type="submit">公開する</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>ブログ記事一覧</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="タイトルやカテゴリで検索"
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <CardDescription>
            投稿済みおよび下書き中の記事一覧です。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>公開日</TableHead>
                <TableHead>投稿者</TableHead>
                <TableHead className="text-right">閲覧数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      post.status === '公開' 
                        ? 'bg-green-100 text-green-800' 
                        : post.status === '公開予定' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell>{post.date}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell className="text-right">{post.views}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">メニューを開く</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>アクション</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>プレビュー</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>編集する</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>削除する</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* ブログ統計情報 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              人気記事ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">1</span>
                  <span className="text-sm">夏の疲れを癒す！おすすめのマッサージコース</span>
                </div>
                <span className="text-sm font-medium">245</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">2</span>
                  <span className="text-sm">リラクゼーションとアロマの効果</span>
                </div>
                <span className="text-sm font-medium">187</span>
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              投稿数統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">公開済み</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">公開予定</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">下書き</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">合計</span>
                <span className="font-medium">4</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              カテゴリ統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">健康情報</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">季節のお知らせ</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">新メニュー</span>
                <span className="font-medium">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreBlog;
