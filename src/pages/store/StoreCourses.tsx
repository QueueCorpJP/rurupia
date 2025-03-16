
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogClose
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Service } from '@/utils/types';

const StoreCourses = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Service[]>([
    {
      id: 1,
      name: "アロマオイルマッサージ60分",
      duration: 60,
      price: 8000,
      description: "リラックス効果の高いアロマオイルを使用したフルボディマッサージです。"
    },
    {
      id: 2,
      name: "アロマオイルマッサージ90分",
      duration: 90,
      price: 12000,
      description: "リラックス効果の高いアロマオイルを使用したフルボディマッサージです。時間をかけてじっくりと施術します。"
    },
    {
      id: 3,
      name: "ディープティシューマッサージ60分",
      duration: 60,
      price: 9000,
      description: "筋肉の深層部までアプローチする、本格的なマッサージです。"
    },
    {
      id: 4,
      name: "ヘッドスパ30分",
      duration: 30,
      price: 5000,
      description: "頭皮の血行を促進し、リフレッシュ効果があります。"
    }
  ]);
  
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Service | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Service>>({
    name: "",
    duration: 60,
    price: 0,
    description: ""
  });

  const courseCategories = [
    "オイルマッサージ",
    "ディープティシュー",
    "ボディケア",
    "ヘッドスパ",
    "フットケア",
    "リラクゼーション",
    "その他"
  ];

  const handleAddCourse = () => {
    if (!newCourse.name || !newCourse.duration || !newCourse.price) {
      toast({
        title: "入力エラー",
        description: "コース名、時間、料金は必須項目です。",
        variant: "destructive"
      });
      return;
    }

    const newId = Math.max(0, ...courses.map(course => course.id)) + 1;
    setCourses([
      ...courses,
      {
        id: newId,
        name: newCourse.name,
        duration: newCourse.duration || 60,
        price: newCourse.price,
        description: newCourse.description || ""
      }
    ]);

    setNewCourse({
      name: "",
      duration: 60,
      price: 0,
      description: ""
    });

    setIsAddCourseOpen(false);
    
    toast({
      title: "コースを追加しました",
      description: `${newCourse.name}を追加しました。`,
    });
  };

  const handleEditCourse = () => {
    if (!editingCourse) return;
    
    setCourses(courses.map(course => 
      course.id === editingCourse.id ? editingCourse : course
    ));
    
    setIsEditCourseOpen(false);
    
    toast({
      title: "コースを更新しました",
      description: `${editingCourse.name}を更新しました。`,
    });
  };

  const handleDeleteCourse = (id: number) => {
    setCourses(courses.filter(course => course.id !== id));
    
    toast({
      title: "コースを削除しました",
      description: "コースが正常に削除されました。",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">コース管理</h1>
          <p className="text-muted-foreground mt-2">コースの登録・編集・削除ができます</p>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規コース追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規コース追加</DialogTitle>
              <DialogDescription>
                新しいコースの詳細を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="course-name">コース名</Label>
                <Input
                  id="course-name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder="アロマオイルマッサージ60分"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-category">カテゴリ</Label>
                <Select onValueChange={(value) => setNewCourse({ ...newCourse, name: `${value}${newCourse.duration}分` })}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-duration">所要時間（分）</Label>
                <Input
                  id="course-duration"
                  type="number"
                  value={newCourse.duration || ""}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) || 0 })}
                  placeholder="60"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-price">料金（円）</Label>
                <Input
                  id="course-price"
                  type="number"
                  value={newCourse.price || ""}
                  onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) || 0 })}
                  placeholder="8000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-description">詳細説明</Label>
                <Textarea
                  id="course-description"
                  value={newCourse.description || ""}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="コースの詳細説明を入力してください。"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">キャンセル</Button>
              </DialogClose>
              <Button onClick={handleAddCourse}>追加する</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>コース一覧</CardTitle>
          <CardDescription>
            現在登録されているコースの一覧です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コース名</TableHead>
                <TableHead>時間（分）</TableHead>
                <TableHead>料金（円）</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>{course.price.toLocaleString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{course.description}</TableCell>
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
                        <DropdownMenuItem onClick={() => {
                          setEditingCourse(course);
                          setIsEditCourseOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>編集する</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
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

      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コース編集</DialogTitle>
            <DialogDescription>
              コースの詳細を編集できます。
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-course-name">コース名</Label>
                <Input
                  id="edit-course-name"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course-duration">所要時間（分）</Label>
                <Input
                  id="edit-course-duration"
                  type="number"
                  value={editingCourse.duration}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course-price">料金（円）</Label>
                <Input
                  id="edit-course-price"
                  type="number"
                  value={editingCourse.price}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course-description">詳細説明</Label>
                <Textarea
                  id="edit-course-description"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button onClick={handleEditCourse}>保存する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreCourses;
