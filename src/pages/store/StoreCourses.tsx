import { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { Edit, MoreHorizontal, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define the Service interface
interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  created_at?: string;
  // store_id field is added in migration but may not be available yet
  store_id?: string;
}

const StoreCourses = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  // Fetch services from Supabase
  const fetchServices = async () => {
    try {
      setLoading(true);

      // Get current user (store)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setStoreId(user.id);

      // Get all services - this approach is temporary until the store_id column is added
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Once data is fetched, we'll store it
      // After the migration adds the store_id column, we can filter by store_id directly in the query
      setServices(data || []);
      
      // For now, we can use local filtering if needed
      // setServices((data || []).filter(service => service.store_id === user.id));
    } catch (error) {
      console.error("Error fetching services:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.duration || !newCourse.price) {
      toast({
        title: "入力エラー",
        description: "コース名、時間、料金は必須項目です。",
        variant: "destructive"
      });
      return;
    }

    try {
      // Add service to Supabase - include store_id when the column is added
      const { data, error } = await supabase.from('services').insert([
        {
          name: newCourse.name,
          duration: newCourse.duration || 60,
          price: newCourse.price,
          description: newCourse.description || "",
          // This line will work after the migration adds the store_id column
          // store_id: storeId
        }
      ]).select();

      if (error) throw error;

      // Add the new service to the state
      if (data && data.length > 0) {
        setServices([data[0], ...services]);
      }

      // Reset form
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
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "エラー",
        description: "コースの追加に失敗しました。",
        variant: "destructive"
      });
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !editingCourse.id) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: editingCourse.name,
          duration: editingCourse.duration,
          price: editingCourse.price,
          description: editingCourse.description
          // This line will work after the migration adds the store_id column
          // store_id: storeId
        })
        .eq('id', editingCourse.id);
        
      if (error) throw error;
      
      // Update the local state
      setServices(services.map(service => 
        service.id === editingCourse.id ? editingCourse : service
      ));
      
      setIsEditCourseOpen(false);
      
      toast({
        title: "コースを更新しました",
        description: `${editingCourse.name}を更新しました。`,
      });
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "エラー",
        description: "コースの更新に失敗しました。",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("このコースを削除してもよろしいですか？")) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from local state
      setServices(services.filter(service => service.id !== id));
      
      toast({
        title: "コースを削除しました",
        description: "コースが正常に削除されました。",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "エラー",
        description: "コースの削除に失敗しました。",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <h3 className="font-bold">エラーが発生しました</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Note: このエラーはデータベースの構造変更が必要です。管理者に連絡してください。
          </p>
        </div>
      </div>
    );
  }

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
            設定されているコース一覧を表示しています
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">コースが設定されていません</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddCourseOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初のコースを追加する
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>コース名</TableHead>
                  <TableHead>所要時間</TableHead>
                  <TableHead>料金</TableHead>
                  <TableHead className="hidden md:table-cell">詳細</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.duration}分</TableCell>
                    <TableCell>{service.price.toLocaleString()}円</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="line-clamp-1">{service.description}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">メニューを開く</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setEditingCourse(service);
                            setIsEditCourseOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCourse(service.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit course dialog */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コース編集</DialogTitle>
            <DialogDescription>
              コースの詳細を編集してください。
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
                  value={editingCourse.duration || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course-price">料金（円）</Label>
                <Input
                  id="edit-course-price"
                  type="number"
                  value={editingCourse.price || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-course-description">詳細説明</Label>
                <Textarea
                  id="edit-course-description"
                  value={editingCourse.description || ""}
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
            <Button onClick={handleEditCourse}>更新する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreCourses;
