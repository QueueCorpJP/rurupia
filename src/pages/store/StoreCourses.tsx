
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';

// サンプルデータ
const courses = [
  {
    id: 1,
    name: 'アロマオイルマッサージ 60分',
    price: 6000,
    duration: 60,
    category: 'オイルマッサージ',
    status: 'アクティブ',
    bookings: 120
  },
  {
    id: 2,
    name: 'ディープティシュー 90分',
    price: 9000,
    duration: 90,
    category: 'ディープティシュー',
    status: 'アクティブ',
    bookings: 85
  },
  {
    id: 3,
    name: 'ホットストーンセラピー 90分',
    price: 10000,
    duration: 90,
    category: 'ホットストーン',
    status: '非アクティブ',
    bookings: 42
  },
  {
    id: 4,
    name: 'フットマッサージ 30分',
    price: 3500,
    duration: 30,
    category: 'フットケア',
    status: 'アクティブ',
    bookings: 95
  },
  {
    id: 5,
    name: 'ヘッドスパ 45分',
    price: 5000,
    duration: 45,
    category: 'ヘッドケア',
    status: 'アクティブ',
    bookings: 76
  }
];

const StoreCourses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState(courses);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredCourses(courses);
      return;
    }
    
    const filtered = courses.filter(
      course => 
        course.name.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredCourses(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">コース管理</h1>
          <p className="text-muted-foreground mt-2">マッサージコースの登録・管理</p>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規コース
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>新規コース登録</DialogTitle>
              <DialogDescription>
                新しいマッサージコースの詳細を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course-name">コース名</Label>
                <Input id="course-name" placeholder="例: アロマオイルマッサージ 60分" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">料金 (円)</Label>
                  <Input id="price" type="number" placeholder="6000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">時間 (分)</Label>
                  <Input id="duration" type="number" placeholder="60" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ</Label>
                <Input id="category" placeholder="例: オイルマッサージ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea id="description" placeholder="コースの説明を入力してください" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>キャンセル</Button>
              <Button type="submit">登録する</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>コース一覧</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="コース名やカテゴリで検索"
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <CardDescription>
            現在登録されているマッサージコースの一覧です。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コース名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead className="text-right">料金 (円)</TableHead>
                <TableHead className="text-right">時間 (分)</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">予約数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell className="text-right">{course.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{course.duration}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      course.status === 'アクティブ' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{course.bookings}</TableCell>
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
                          <span>詳細を見る</span>
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
      
      {/* 売上や予約の分析セクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              人気コースランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">1</span>
                  <span>アロマオイルマッサージ 60分</span>
                </div>
                <span className="text-sm font-medium">120 予約</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">2</span>
                  <span>フットマッサージ 30分</span>
                </div>
                <span className="text-sm font-medium">95 予約</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full">3</span>
                  <span>ディープティシュー 90分</span>
                </div>
                <span className="text-sm font-medium">85 予約</span>
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              平均満足度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="text-3xl font-bold">4.8 / 5.0</div>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                418件のレビューに基づく
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              売上貢献度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>ディープティシュー 90分</span>
                  <span>35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>アロマオイルマッサージ 60分</span>
                  <span>28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>ホットストーンセラピー 90分</span>
                  <span>18%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreCourses;
