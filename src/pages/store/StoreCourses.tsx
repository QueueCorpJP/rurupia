
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash2, Clock, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialCourses = [
  {
    id: 1,
    name: "アロマオイルマッサージ",
    category: "リラクゼーション",
    description: "北欧生まれのマッサージで、心と身体の調整を行います。",
    duration: 60,
    price: 8000,
    defaultPrice: 8000,
    customizable: true
  },
  {
    id: 2,
    name: "ディープティシューマッサージ",
    category: "ボディケア",
    description: "深層筋肉に働きかけることで、筋肉疲労を軽減します。",
    duration: 90,
    price: 12000,
    defaultPrice: 12000,
    customizable: true
  },
  {
    id: 3,
    name: "ホットストーンマッサージ",
    category: "スペシャルケア",
    description: "温めた石を使用することで、深いリラクゼーション効果があります。",
    duration: 120,
    price: 15000,
    defaultPrice: 15000,
    customizable: false
  },
  {
    id: 4,
    name: "フットマッサージ",
    category: "リラクゼーション",
    description: "足裏の反射区を刺激し、全身の疲労回復を促します。",
    duration: 45,
    price: 6000,
    defaultPrice: 6000,
    customizable: true
  },
  {
    id: 5,
    name: "ヘッドスパ",
    category: "ヘッドケア",
    description: "頭皮と髪の健康を促進するスペシャルケアです。",
    duration: 60,
    price: 8500,
    defaultPrice: 8500,
    customizable: false
  }
];

const categories = [
  "リラクゼーション",
  "ボディケア",
  "スペシャルケア",
  "ヘッドケア",
  "フットケア",
  "その他"
];

const durations = [30, 45, 60, 90, 120, 150, 180];

const StoreCourses = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState(initialCourses);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCourse, setNewCourse] = useState({
    name: '',
    category: '',
    description: '',
    duration: 60,
    price: 0,
    defaultPrice: 0,
    customizable: true
  });
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const filteredCourses = courses.filter(
    course => course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = () => {
    const courseToAdd = {
      ...newCourse,
      id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
      defaultPrice: newCourse.price
    };
    
    setCourses([...courses, courseToAdd]);
    setNewCourse({
      name: '',
      category: '',
      description: '',
      duration: 60,
      price: 0,
      defaultPrice: 0,
      customizable: true
    });
    setIsAddCourseOpen(false);
    
    toast({
      title: "コースを追加しました",
      description: `新しいコース「${courseToAdd.name}」を追加しました。`
    });
  };

  const handleEditCourse = () => {
    if (!editingCourse) return;
    
    setCourses(courses.map(course => 
      course.id === editingCourse.id ? {...editingCourse, defaultPrice: editingCourse.price} : course
    ));
    setIsEditCourseOpen(false);
    
    toast({
      title: "コースを更新しました",
      description: `コース「${editingCourse.name}」の情報を更新しました。`
    });
  };

  const handleDeleteCourse = (courseId: number) => {
    setCourses(courses.filter(course => course.id !== courseId));
    
    toast({
      title: "コースを削除しました",
      description: "コースが正常に削除されました。"
    });
  };

  const startEditCourse = (course: any) => {
    setEditingCourse({...course});
    setIsEditCourseOpen(true);
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">コース管理</h1>
          <p className="text-muted-foreground mt-2">マッサージコースの作成と管理</p>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規コース
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>新規コース作成</DialogTitle>
              <DialogDescription>
                新しいマッサージコースの情報を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">コース名</Label>
                <Input
                  id="name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  placeholder="例: アロマオイルマッサージ"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">カテゴリー</Label>
                <Select
                  value={newCourse.category}
                  onValueChange={(value) => setNewCourse({...newCourse, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="コースの詳細説明"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">施術時間（分）</Label>
                  <Select
                    value={newCourse.duration.toString()}
                    onValueChange={(value) => setNewCourse({...newCourse, duration: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="時間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration}分
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">料金（円）</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newCourse.price || ''}
                    onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value) || 0})}
                    placeholder="例: 8000"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="customizable"
                  checked={newCourse.customizable}
                  onChange={(e) => setNewCourse({...newCourse, customizable: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="customizable" className="text-sm font-normal">
                  セラピストによる料金カスタマイズを許可する
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>キャンセル</Button>
              <Button onClick={handleAddCourse}>コースを作成</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>コース一覧</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="コース名を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-60"
              />
            </div>
          </div>
          <CardDescription>
            マッサージコースの一覧と詳細
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コース名</TableHead>
                <TableHead>カテゴリー</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>料金</TableHead>
                <TableHead>セラピスト調整</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{course.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{course.duration}分</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(course.price)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      course.customizable 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {course.customizable ? "許可" : "固定"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">操作メニュー</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => startEditCourse(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>編集</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>削除</span>
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

      {/* 編集ダイアログ */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>コース編集</DialogTitle>
            <DialogDescription>
              コース情報を変更できます。
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">コース名</Label>
                <Input
                  id="edit-name"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">カテゴリー</Label>
                <Select
                  value={editingCourse.category}
                  onValueChange={(value) => setEditingCourse({...editingCourse, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">説明</Label>
                <Textarea
                  id="edit-description"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">施術時間（分）</Label>
                  <Select
                    value={editingCourse.duration.toString()}
                    onValueChange={(value) => setEditingCourse({...editingCourse, duration: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="時間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration}分
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">料金（円）</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingCourse.price || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, price: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="edit-customizable"
                  checked={editingCourse.customizable}
                  onChange={(e) => setEditingCourse({...editingCourse, customizable: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="edit-customizable" className="text-sm font-normal">
                  セラピストによる料金カスタマイズを許可する
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCourseOpen(false)}>キャンセル</Button>
            <Button onClick={handleEditCourse}>変更を保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>コースの注意事項</CardTitle>
          <CardDescription>
            コース設定・管理に関する重要な情報
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>セラピストによる料金カスタマイズ:</strong> 許可されている場合、セラピストは自身のプロフィールでこのコースの料金を変更できます。
          </p>
          <p className="text-sm">
            <strong>コース削除の注意:</strong> 現在予約が入っているコースを削除すると、関連する予約情報に影響が出る可能性があります。
          </p>
          <p className="text-sm">
            <strong>料金表示:</strong> 設定された料金は税抜き価格で表示されます。お客様向けの表示では税込み価格が自動計算されます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreCourses;
