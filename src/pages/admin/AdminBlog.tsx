
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminBlog = () => {
  const [selectedTab, setSelectedTab] = useState("all");

  const blogPosts = [
    { id: 1, title: "マッサージの健康効果について", category: "健康", status: "published", date: "2023-08-15" },
    { id: 2, title: "睡眠の質を向上させる方法", category: "健康", status: "published", date: "2023-07-22" },
    { id: 3, title: "効果的なストレス解消法", category: "ライフスタイル", status: "draft", date: "2023-09-05" },
    { id: 4, title: "リラクゼーションのための瞑想テクニック", category: "マインドフルネス", status: "scheduled", date: "2023-10-10" },
    { id: 5, title: "マッサージセラピストになるには", category: "キャリア", status: "published", date: "2023-06-30" },
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          新規投稿
        </Button>
      </div>

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
      />
    </div>
  );
};

export default AdminBlog;
