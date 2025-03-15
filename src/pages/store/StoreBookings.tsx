
import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const StoreBookings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const bookings = [
    { 
      id: 1, 
      customer: "田中 花子", 
      service: "リラクゼーションマッサージ 60分", 
      therapist: "佐藤 健太", 
      date: "2023-11-15", 
      time: "14:00", 
      status: "confirmed",
      phone: "090-1234-5678",
      email: "tanaka@example.com",
      notes: "初回利用です。肩こりがひどいので重点的にお願いします。",
      payment: "クレジットカード"
    },
    { 
      id: 2, 
      customer: "鈴木 一郎", 
      service: "ディープティシューマッサージ 90分", 
      therapist: "山田 太郎", 
      date: "2023-11-15", 
      time: "16:30", 
      status: "completed",
      phone: "090-8765-4321",
      email: "suzuki@example.com",
      notes: "",
      payment: "現金"
    },
    { 
      id: 3, 
      customer: "佐々木 美咲", 
      service: "アロマオイルマッサージ 60分", 
      therapist: "鈴木 健二", 
      date: "2023-11-16", 
      time: "11:00", 
      status: "pending",
      phone: "090-5555-7777",
      email: "sasaki@example.com",
      notes: "ラベンダーの香りを希望します。",
      payment: "クレジットカード"
    },
    { 
      id: 4, 
      customer: "山本 雄太", 
      service: "スポーツマッサージ 90分", 
      therapist: "佐藤 健太", 
      date: "2023-11-17", 
      time: "15:00", 
      status: "cancelled",
      phone: "090-3333-4444",
      email: "yamamoto@example.com",
      notes: "お客様都合によるキャンセル",
      payment: "クレジットカード"
    },
    { 
      id: 5, 
      customer: "伊藤 真理子", 
      service: "ヘッドマッサージ 30分", 
      therapist: "鈴木 健二", 
      date: "2023-11-18", 
      time: "13:30", 
      status: "confirmed",
      phone: "090-2222-8888",
      email: "ito@example.com",
      notes: "",
      payment: "現金"
    },
  ];

  const columns = [
    { 
      key: "customer",
      label: "お客様名",
      accessorKey: "customer", 
    },
    { 
      key: "service",
      label: "サービス",
      accessorKey: "service", 
    },
    { 
      key: "therapist",
      label: "セラピスト",
      accessorKey: "therapist", 
    },
    { 
      key: "dateTime",
      label: "予約日時",
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            <span>{row.date}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>{row.time}</span>
          </div>
        </div>
      )
    },
    { 
      key: "status",
      label: "ステータス",
      accessorKey: "status",
      render: (value: string, row: any) => {
        const status = row.status;
        return (
          <Badge variant={
            status === "confirmed" ? "outline" :
            status === "completed" ? "default" :
            status === "pending" ? "secondary" :
            "destructive"
          }>
            {status === "confirmed" ? "予約確定" :
             status === "completed" ? "施術完了" :
             status === "pending" ? "予約保留" :
             "キャンセル"}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      label: "アクション",
      render: (value: string, row: any) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(row)}>詳細</Button>
        </div>
      ),
    },
  ];

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleStatusChange = (status: string) => {
    // Update booking status logic would go here
    toast({
      title: "予約ステータスを更新しました",
      description: `予約 #${selectedBooking?.id} のステータスが更新されました`,
    });
    setDetailsOpen(false);
  };

  const filteredBookings = activeTab === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">予約管理</h1>
        <p className="text-muted-foreground mt-2">お客様の予約状況の確認と管理を行います</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本日の予約</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待機中</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">今週</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">キャンセル</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">今週</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="confirmed">予約確定</TabsTrigger>
          <TabsTrigger value="pending">予約保留</TabsTrigger>
          <TabsTrigger value="completed">完了</TabsTrigger>
          <TabsTrigger value="cancelled">キャンセル</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable 
        columns={columns}
        data={filteredBookings}
        searchPlaceholder="予約を検索..."
        onRowClick={handleViewDetails}
      />

      {selectedBooking && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>予約詳細 #{selectedBooking.id}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm mb-1">お客様名</h3>
                  <p>{selectedBooking.customer}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">ステータス</h3>
                  <Badge variant={
                    selectedBooking.status === "confirmed" ? "outline" :
                    selectedBooking.status === "completed" ? "default" :
                    selectedBooking.status === "pending" ? "secondary" :
                    "destructive"
                  }>
                    {selectedBooking.status === "confirmed" ? "予約確定" :
                    selectedBooking.status === "completed" ? "施術完了" :
                    selectedBooking.status === "pending" ? "予約保留" :
                    "キャンセル"}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm mb-1">予約日</h3>
                  <p>{selectedBooking.date}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">予約時間</h3>
                  <p>{selectedBooking.time}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm mb-1">サービス</h3>
                  <p>{selectedBooking.service}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">セラピスト</h3>
                  <p>{selectedBooking.therapist}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm mb-1">電話番号</h3>
                  <p>{selectedBooking.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">メールアドレス</h3>
                  <p>{selectedBooking.email}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-1">支払い方法</h3>
                <p>{selectedBooking.payment}</p>
              </div>
              
              {selectedBooking.notes && (
                <div>
                  <h3 className="font-medium text-sm mb-1">お客様メモ</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="status">ステータスを変更</Label>
                <div className="flex space-x-2 mt-2">
                  <Select 
                    defaultValue={selectedBooking.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">予約確定</SelectItem>
                      <SelectItem value="pending">予約保留</SelectItem>
                      <SelectItem value="completed">施術完了</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>閉じる</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StoreBookings;
