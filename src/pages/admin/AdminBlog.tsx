
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { PlusCircle, BarChart, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminBlog = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(false);

  const blogPosts = [
    { id: 1, title: "マッサージの健康効果について", category: "健康", status: "published", date: "2023-08-15", views: 1245, comments: 23 },
    { id: 2, title: "睡眠の質を向上させる方法", category: "健康", status: "published", date: "2023-07-22", views: 983, comments: 17 },
    { id: 3, title: "効果的なストレス解消法", category: "ライフスタイル", status: "draft", date: "2023-09-05", views: 0, comments: 0 },
    { id: 4, title: "リラクゼーションのための瞑想テクニック", category: "マインドフルネス", status: "scheduled", date: "2023-10-10", views: 0, comments: 0 },
    { id: 5, title: "マッサージセラピストになるには", category: "キャリア", status: "published", date: "2023-06-30", views: 2105, comments: 41 },
  ];

  const columns = [
    { 
      key: "title",
      label: "タイトル",
      accessorKey: "title",
    },
    { 
      key: "category",
      label: "カテゴリ",
      accessorKey: "category",
    },
    { 
      key: "status",
      label: "ステータス",
      accessorKey: "status",
      render: (value: string, row: any) => {
        const status = row.status;
        return (
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
            status === "published" ? "bg-green-100 text-green-800" :
            status === "draft" ? "bg-gray-100 text-gray-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {status === "published" ? "公開中" :
             status === "draft" ? "下書き" :
             "予約投稿"}
          </span>
        );
      }
    },
    { 
      key: "date",
      label: "公開日",
      accessorKey: "date",
    },
    { 
      key: "views",
      label: "閲覧数",
      accessorKey: "views",
      render: (value: number, row: any) => (
        <span>{row.status === "published" ? row.views.toLocaleString() : "-"}</span>
      )
    },
    {
      key: "actions",
      label: "アクション",
      render: (value: string, row: any) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">編集</Button>
          <Button variant="outline" size="sm" className="text-destructive">削除</Button>
        </div>
      ),
    },
  ];

  const filteredPosts = selectedTab === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.status === selectedTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ブログ管理</h1>
          <p className="text-muted-foreground mt-2">運営ブログの投稿、編集、管理を行います</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart className="mr-2 h-4 w-4" />
            アクセス分析
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                新規投稿
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>新規ブログ投稿</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input id="title" placeholder="タイトルを入力" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">健康</SelectItem>
                      <SelectItem value="lifestyle">ライフスタイル</SelectItem>
                      <SelectItem value="mindfulness">マインドフルネス</SelectItem>
                      <SelectItem value="career">キャリア</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">本文</Label>
                  <Textarea id="content" rows={10} placeholder="本文を入力" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">公開ステータス</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="公開ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">公開する</SelectItem>
                      <SelectItem value="draft">下書き保存</SelectItem>
                      <SelectItem value="scheduled">予約投稿</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">投稿する</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showAnalytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総閲覧数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,333</div>
              <p className="text-xs text-muted-foreground">+12% 先月比</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均滞在時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3分27秒</div>
              <p className="text-xs text-muted-foreground">+8% 先月比</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">コメント数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">81</div>
              <p className="text-xs text-muted-foreground">+23% 先月比</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">シェア数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+18% 先月比</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="published">公開中</TabsTrigger>
          <TabsTrigger value="draft">下書き</TabsTrigger>
          <TabsTrigger value="scheduled">予約投稿</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <DataTable 
        columns={columns}
        data={filteredPosts}
        searchPlaceholder="ブログ記事を検索..."
      />
    </div>
  );
};

export default AdminBlog;
