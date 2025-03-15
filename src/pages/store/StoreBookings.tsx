
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Archive } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

// Sample data for bookings
const bookings = [
  {
    id: "BK-2023-001",
    clientName: "田中さくら",
    therapistName: "鈴木一郎",
    service: "全身リラクゼーション",
    date: "2023-10-15",
    time: "14:00-15:30",
    status: "確定",
    price: "7,500円"
  },
  {
    id: "BK-2023-002",
    clientName: "佐藤ゆかり",
    therapistName: "山田太郎",
    service: "肩こり集中ケア",
    date: "2023-10-16",
    time: "11:00-12:00",
    status: "キャンセル",
    price: "6,000円"
  },
  {
    id: "BK-2023-003",
    clientName: "高橋美香",
    therapistName: "佐々木健太",
    service: "フットリフレ",
    date: "2023-10-18",
    time: "17:30-18:30",
    status: "確定",
    price: "5,000円"
  },
  {
    id: "BK-2023-004",
    clientName: "伊藤洋子",
    therapistName: "鈴木一郎",
    service: "全身リラクゼーション",
    date: "2023-10-20",
    time: "10:00-11:30",
    status: "確定",
    price: "7,500円"
  },
  {
    id: "BK-2023-005",
    clientName: "中村俊介",
    therapistName: "山田太郎",
    service: "ヘッドスパ",
    date: "2023-10-21",
    time: "15:00-16:00",
    status: "仮予約",
    price: "6,500円"
  }
];

const StoreBookings = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Column definition for the bookings table
  const columns = [
    {
      key: "id",
      label: "予約ID",
      accessorKey: "id"
    },
    {
      key: "clientName",
      label: "顧客名",
      accessorKey: "clientName"
    },
    {
      key: "therapistName",
      label: "担当セラピスト",
      accessorKey: "therapistName"
    },
    {
      key: "service",
      label: "サービス",
      accessorKey: "service"
    },
    {
      key: "date",
      label: "日付",
      accessorKey: "date"
    },
    {
      key: "time",
      label: "時間",
      accessorKey: "time"
    },
    {
      key: "status",
      label: "ステータス",
      accessorKey: "status",
      render: ({ row }: any) => {
        let statusColor;
        switch (row.status) {
          case "確定":
            statusColor = "bg-green-100 text-green-800";
            break;
          case "キャンセル":
            statusColor = "bg-red-100 text-red-800";
            break;
          case "仮予約":
            statusColor = "bg-yellow-100 text-yellow-800";
            break;
          default:
            statusColor = "bg-gray-100 text-gray-800";
        }
        
        return (
          <Badge variant="outline" className={`${statusColor} border-0`}>
            {row.status}
          </Badge>
        );
      }
    },
    {
      key: "price",
      label: "料金",
      accessorKey: "price"
    },
    {
      key: "actions",
      label: "操作",
      render: () => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">詳細</Button>
          <Button size="sm" variant="outline" className="text-red-500">キャンセル</Button>
        </div>
      )
    }
  ];

  // Filter bookings based on search query and status filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && booking.status === statusFilter;
  });

  const handleCheckIn = () => {
    toast({
      title: "チェックイン完了",
      description: "顧客のチェックインが完了しました。",
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">予約管理</h1>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">
            <Calendar className="h-4 w-4 mr-2" /> 今日の予約
          </TabsTrigger>
          <TabsTrigger value="all">
            <Clock className="h-4 w-4 mr-2" /> すべての予約
          </TabsTrigger>
          <TabsTrigger value="therapists">
            <Users className="h-4 w-4 mr-2" /> セラピスト別
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-4 w-4 mr-2" /> 過去の予約
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>本日の予約 (3件)</CardTitle>
                  <CardDescription>2023年10月15日の予約一覧</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" onClick={handleCheckIn}>チェックイン</Button>
                  <Button size="sm" variant="outline">予約を追加</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セラピスト</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">サービス</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">10:00 - 11:30</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">伊藤洋子</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">鈴木一郎</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">全身リラクゼーション</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                          確定
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">詳細</Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">14:00 - 15:30</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">田中さくら</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">鈴木一郎</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">全身リラクゼーション</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-0">
                          確定
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">詳細</Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">16:00 - 17:00</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">小林直人</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">山田太郎</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">ヘッドスパ</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-0">
                          仮予約
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">詳細</Button>
                          <Button size="sm" variant="outline" className="text-green-500">確定</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>すべての予約</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="確定">確定</SelectItem>
                      <SelectItem value="仮予約">仮予約</SelectItem>
                      <SelectItem value="キャンセル">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-[220px]"
                  />
                </div>
              </div>
              <CardDescription>すべての予約の管理と詳細確認ができます。</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={filteredBookings} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="therapists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>セラピスト別予約状況</CardTitle>
              <CardDescription>セラピスト別の予約状況を確認できます。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">鈴木一郎</CardTitle>
                    <CardDescription>本日の予約: 2件</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
                        <div>
                          <p className="font-medium">10:00 - 11:30</p>
                          <p className="text-sm text-gray-500">伊藤洋子 - 全身リラクゼーション</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-0">確定</Badge>
                      </div>
                      <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
                        <div>
                          <p className="font-medium">14:00 - 15:30</p>
                          <p className="text-sm text-gray-500">田中さくら - 全身リラクゼーション</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-0">確定</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">山田太郎</CardTitle>
                    <CardDescription>本日の予約: 1件</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
                        <div>
                          <p className="font-medium">16:00 - 17:00</p>
                          <p className="text-sm text-gray-500">小林直人 - ヘッドスパ</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-0">仮予約</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">佐々木健太</CardTitle>
                    <CardDescription>本日の予約: 0件</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[100px] flex items-center justify-center text-gray-400">
                      <p>予約なし</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>過去の予約履歴</CardTitle>
              <CardDescription>過去の予約履歴を確認できます。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">予約ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セラピスト</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">サービス</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">料金</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">BK-2023-001</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">2023-10-05</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">中村俊介</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">鈴木一郎</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">全身リラクゼーション</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">7,500円</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" variant="outline">詳細</Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">BK-2023-002</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">2023-10-07</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">佐藤ゆかり</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">山田太郎</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">肩こり集中ケア</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">6,000円</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" variant="outline">詳細</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreBookings;
