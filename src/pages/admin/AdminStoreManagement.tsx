import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  FileText, 
  Trash2, 
  Edit, 
  Eye 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminStoreManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchSalesData();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*');

      if (error) throw error;

      const formattedProducts = data.map(service => ({
        id: service.id,
        name: service.name,
        category: service.description ? 'サービス' : 'グッズ',
        price: service.price,
        stock: Math.floor(Math.random() * 30),
        status: getStockStatus(Math.floor(Math.random() * 30))
      }));

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('商品データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesData = async () => {
    setSalesData([
      { date: '2024年 9月', value: 65000, name: "Sales" },
      { date: '2024年 10月', value: 55000, name: "Sales" },
      { date: '2024年 11月', value: 75000, name: "Sales" },
      { date: '2024年 12月', value: 68000, name: "Sales" },
      { date: '2025年 1月', value: 120000, name: "Sales" },
      { date: '2025年 2月', value: 50000, name: "Sales" },
      { date: '2025年 3月', value: 10000, name: "Sales" },
    ]);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return '在庫切れ';
    if (stock < 6) return '残りわずか';
    return '在庫あり';
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
        toast.error('すべての項目を入力してください');
        return;
      }

      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: newProduct.name,
          description: newProduct.category === 'サービス' ? `${newProduct.name}の説明` : null,
          price: newProduct.price,
          duration: 60
        }])
        .select();

      if (error) throw error;

      const addedProduct = {
        id: data[0].id,
        name: data[0].name,
        category: newProduct.category,
        price: data[0].price,
        stock: newProduct.stock,
        status: getStockStatus(newProduct.stock)
      };

      setProducts([...products, addedProduct]);
      setFilteredProducts([...filteredProducts, addedProduct]);
      setNewProduct({ name: '', category: '', price: 0, stock: 0 });
      setIsAddProductOpen(false);
      toast.success('商品を追加しました');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('商品の追加に失敗しました');
    }
  };

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const filterProducts = () => {
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(filteredProducts.filter(product => product.id !== productId));
      toast.success('商品を削除しました');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('商品の削除に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">ストア管理</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            インポート
          </Button>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新規商品
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規商品の追加</DialogTitle>
                <DialogDescription>
                  新しい商品の詳細を入力してください。すべての項目が必須です。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    商品名
                  </Label>
                  <Input 
                    id="name" 
                    className="col-span-3" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    カテゴリ
                  </Label>
                  <Select 
                    value={newProduct.category} 
                    onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="オイル">オイル</SelectItem>
                      <SelectItem value="ツール">ツール</SelectItem>
                      <SelectItem value="機器">機器</SelectItem>
                      <SelectItem value="クリーム">クリーム</SelectItem>
                      <SelectItem value="サービス">サービス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    価格 (円)
                  </Label>
                  <Input 
                    id="price" 
                    type="number" 
                    className="col-span-3" 
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    在庫数
                  </Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    className="col-span-3" 
                    value={newProduct.stock || ''}
                    onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>キャンセル</Button>
                <Button type="submit" onClick={handleAddProduct}>追加する</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">商品管理</TabsTrigger>
          <TabsTrigger value="orders">注文管理</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>商品一覧</CardTitle>
              <CardDescription>
                現在登録されている商品の一覧です。商品の追加、編集、削除が可能です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="商品名やカテゴリで検索"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select 
                  defaultValue="all" 
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="カテゴリで絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのカテゴリ</SelectItem>
                    <SelectItem value="オイル">オイル</SelectItem>
                    <SelectItem value="ツール">ツール</SelectItem>
                    <SelectItem value="機器">機器</SelectItem>
                    <SelectItem value="クリーム">クリーム</SelectItem>
                    <SelectItem value="サービス">サービス</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名</TableHead>
                        <TableHead>カテゴリ</TableHead>
                        <TableHead className="text-right">価格</TableHead>
                        <TableHead className="text-right">在庫数</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            商品が見つかりませんでした
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="text-right">¥{product.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{product.stock}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                product.status === "在庫あり" 
                                  ? "bg-green-100 text-green-800" 
                                  : product.status === "残りわずか" 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-red-100 text-red-800"
                              }`}>
                                {product.status}
                              </div>
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
                                  <DropdownMenuLabel>アクション</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => toast.info(`${product.name}の詳細を表示します`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>詳細を見る</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toast.info(`${product.name}を編集します`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>編集する</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      if (window.confirm(`${product.name}を削除しますか？`)) {
                                        handleDeleteProduct(product.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>削除する</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>注文履歴</CardTitle>
              <CardDescription>
                過去の注文履歴を確認できます。注文のステータス更新や詳細確認が可能です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="注文ID・顧客名で検索"
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ステータスで絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべてのステータス</SelectItem>
                      <SelectItem value="pending">処理待ち</SelectItem>
                      <SelectItem value="processing">処理中</SelectItem>
                      <SelectItem value="shipped">発送済み</SelectItem>
                      <SelectItem value="delivered">配達済み</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>注文ID</TableHead>
                      <TableHead>顧客名</TableHead>
                      <TableHead>注文日</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">#ORD-2024-0123</TableCell>
                      <TableCell>田中 太郎</TableCell>
                      <TableCell>2024/02/15</TableCell>
                      <TableCell className="text-right">¥12,800</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                          発送済み
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#ORD-2024-0122</TableCell>
                      <TableCell>佐藤 花子</TableCell>
                      <TableCell>2024/02/14</TableCell>
                      <TableCell className="text-right">¥8,500</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                          配達済み
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#ORD-2024-0121</TableCell>
                      <TableCell>鈴木 一郎</TableCell>
                      <TableCell>2024/02/13</TableCell>
                      <TableCell className="text-right">¥15,000</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">
                          処理中
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">月間売上推移</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString()}円`} />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Sales" 
                stroke="#e11d48" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              総売上（今月）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥458,000</div>
            <p className="text-xs text-muted-foreground mt-1">
              前月比 +12.5%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              注文数（今月）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              前月比 +8.3%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              在庫切れ商品
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.status === '在庫切れ').length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              要補充
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStoreManagement;
