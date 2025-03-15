
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/DataTable";
import { BarChart2, Edit, Trash, PlusCircle, FileText, BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Sample data for blog posts
const blogPosts = [
  {
    id: 1,
    title: "ストレス解消に効果的なマッサージ",
    author: "山田太郎",
    publishDate: "2023-04-15",
    status: "公開中",
    views: 1245
  },
  {
    id: 2,
    title: "冬に最適なホットストーンマッサージの魅力",
    author: "鈴木花子",
    publishDate: "2023-05-22",
    status: "公開中",
    views: 892
  },
  {
    id: 3,
    title: "男性セラピストによるマッサージの魅力とは",
    author: "佐藤健太",
    publishDate: "2023-06-10",
    status: "下書き",
    views: 0
  },
  {
    id: 4, 
    title: "肩こり解消のための簡単なセルフマッサージ",
    author: "田中美香",
    publishDate: "2023-07-05",
    status: "公開中",
    views: 1587
  },
  {
    id: 5,
    title: "リラクゼーションと生産性の関係",
    author: "山田太郎",
    publishDate: "2023-08-12",
    status: "公開中",
    views: 762
  }
];

const AdminBlog = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPost, setNewPost] = useState({ title: "", content: "", status: "下書き" });
  const [openDialog, setOpenDialog] = useState(false);

  // Column definition for the blog posts table
  const columns = [
    {
      key: "title",
      label: "タイトル",
      accessorKey: "title"
    },
    {
      key: "author",
      label: "著者",
      accessorKey: "author"
    },
    {
      key: "publishDate",
      label: "公開日",
      accessorKey: "publishDate"
    },
    {
      key: "status",
      label: "ステータス",
      accessorKey: "status",
      render: ({ row }: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === "公開中" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: "views",
      label: "閲覧数",
      accessorKey: "views"
    },
    {
      key: "actions",
      label: "操作",
      render: () => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const filteredPosts = blogPosts.filter(
    post => post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePost = () => {
    toast({
      title: "ブログ投稿を作成しました",
      description: "新しいブログ投稿が下書きに保存されました。"
    });
    setOpenDialog(false);
    setNewPost({ title: "", content: "", status: "下書き" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ブログ管理</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" /> 新規作成
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>新しいブログ投稿を作成</DialogTitle>
              <DialogDescription>
                下記のフォームを入力して、新しいブログ投稿を作成します。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="ブログのタイトルを入力"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">本文</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="ブログの本文を入力"
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>キャンセル</Button>
              <Button onClick={handleCreatePost}>投稿を保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">
            <FileText className="h-4 w-4 mr-2" /> 投稿一覧
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" /> 分析
          </TabsTrigger>
          <TabsTrigger value="settings">
            <BarChart2 className="h-4 w-4 mr-2" /> 設定
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>ブログ投稿一覧</CardTitle>
                <Input
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <CardDescription>
                すべてのブログ投稿の管理と編集が可能です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={filteredPosts} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ブログ閲覧分析</CardTitle>
              <CardDescription>
                過去30日間のブログ投稿の閲覧統計です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded">
                <p className="text-gray-500">閲覧統計グラフがここに表示されます</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ブログ設定</CardTitle>
              <CardDescription>
                ブログの公開設定やカテゴリー管理を行います。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="blog-title">ブログタイトル</Label>
                  <Input id="blog-title" defaultValue="のくとるブログ" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="blog-description">ブログ説明</Label>
                  <Textarea 
                    id="blog-description" 
                    defaultValue="男性セラピストによるマッサージ・リラクゼーションの情報発信ブログ" 
                  />
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Button>設定を保存</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBlog;
