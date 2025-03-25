import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Archive } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Loader2 } from "lucide-react";

// Define booking interface
interface Booking {
  id: string;
  clientName: string;
  therapistName: string;
  service: string;
  date: string;
  time: string;
  status: string;
  price: string;
  raw_date: Date; // For date comparison
}

const StoreBookings = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  // Fetch bookings from Supabase
  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Get current store ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      setStoreId(user.id);

      // Get all store's therapists
      const { data: storeTherapists, error: therapistsError } = await supabase
        .from("store_therapists")
        .select("therapist_id")
        .eq("store_id", user.id)
        .eq("status", "active");

      if (therapistsError) throw therapistsError;
      if (!storeTherapists || storeTherapists.length === 0) {
        setBookings([]);
        setTodayBookings([]);
        setLoading(false);
        return;
      }

      const therapistIds = storeTherapists.map(t => t.therapist_id);

      // Get bookings for all store's therapists
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          therapist_id,
          user_id,
          service_id,
          date,
          status,
          notes,
          location,
          price,
          created_at
        `)
        .in("therapist_id", therapistIds)
        .order("date", { ascending: true });

      if (bookingsError) throw bookingsError;
      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        setTodayBookings([]);
        setLoading(false);
        return;
      }

      // Get user profiles to get client names
      const userIds = bookingsData.map(booking => booking.user_id).filter(Boolean);
      const { data: userProfiles, error: userError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      if (userError) throw userError;

      // Get therapist profiles to get therapist names
      const { data: therapistProfiles, error: therapistProfileError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", therapistIds);

      if (therapistProfileError) throw therapistProfileError;

      // Get services to get service names
      const serviceIds = bookingsData.map(booking => booking.service_id).filter(Boolean);
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("id, name")
        .in("id", serviceIds);

      if (servicesError) throw servicesError;

      // Map data to UI format
      const formattedBookings: Booking[] = bookingsData.map(booking => {
        const client = userProfiles?.find(user => user.id === booking.user_id);
        const therapist = therapistProfiles?.find(t => t.id === booking.therapist_id);
        const service = services?.find(s => s.id === booking.service_id);
        
        const bookingDate = parseISO(booking.date);
        const formattedDate = format(bookingDate, "yyyy-MM-dd", { locale: ja });
        const formattedTime = format(bookingDate, "HH:mm", { locale: ja }) + "-" + 
                             format(new Date(bookingDate.getTime() + 60*60*1000), "HH:mm", { locale: ja }); // Assuming 1 hour sessions
        
        return {
          id: booking.id,
          clientName: client?.name || "名前なし",
          therapistName: therapist?.name || "未定",
          service: service?.name || "未定",
          date: formattedDate,
          time: formattedTime,
          status: booking.status === "confirmed" ? "確定" : 
                  booking.status === "cancelled" ? "キャンセル" : "仮予約",
          price: booking.price ? `${booking.price.toLocaleString()}円` : "未定",
          raw_date: bookingDate
        };
      });

      // Set all bookings and filter today's bookings
      setBookings(formattedBookings);
      setTodayBookings(formattedBookings.filter(booking => isToday(booking.raw_date)));
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);
  
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
      render: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleViewBookingDetails(row.id)}>詳細</Button>
          {row.status !== "キャンセル" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-500"
              onClick={() => handleCancelBooking(row.id)}
            >
              キャンセル
            </Button>
          )}
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

  const handleCheckIn = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed", checked_in_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "チェックイン完了",
        description: "顧客のチェックインが完了しました。",
      });

      fetchBookings(); // Refresh data
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "エラー",
        description: "チェックインに失敗しました。",
        variant: "destructive"
      });
    }
  };

  const handleViewBookingDetails = (bookingId: string) => {
    // TODO: Implement booking details view
    toast({
      title: "詳細表示",
      description: `予約ID: ${bookingId}の詳細を表示します。`,
    });
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("この予約をキャンセルしてもよろしいですか？")) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "予約キャンセル",
        description: "予約がキャンセルされました。",
      });

      fetchBookings(); // Refresh data
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "エラー",
        description: "キャンセル処理に失敗しました。",
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
        </div>
      </div>
    );
  }

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
                  <CardTitle>本日の予約 ({todayBookings.length}件)</CardTitle>
                  <CardDescription>{format(new Date(), "yyyy年MM月dd日")}の予約一覧</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm">チェックイン</Button>
                  <Button size="sm" variant="outline">予約を追加</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : todayBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  本日の予約はありません
                </div>
              ) : (
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
                      {todayBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{booking.clientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.therapistName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.service}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge variant="outline" className={`
                              ${booking.status === "確定" ? "bg-green-100 text-green-800" : 
                                booking.status === "キャンセル" ? "bg-red-100 text-red-800" : 
                                "bg-yellow-100 text-yellow-800"} border-0`}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleCheckIn(booking.id)}>チェックイン</Button>
                              <Button size="sm" variant="outline" onClick={() => handleViewBookingDetails(booking.id)}>詳細</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>すべての予約</CardTitle>
                <div className="flex gap-2">
                  <div className="max-w-sm">
                    <Input 
                      placeholder="顧客名・セラピスト名・予約IDで検索" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ステータスで絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="確定">確定</SelectItem>
                      <SelectItem value="仮予約">仮予約</SelectItem>
                      <SelectItem value="キャンセル">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  該当する予約はありません
                </div>
              ) : (
                <DataTable columns={columns} data={filteredBookings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="therapists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>セラピスト別予約状況</CardTitle>
              <CardDescription>セラピスト別の予約状況を確認できます</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  機能開発中です。次回のアップデートでご利用いただけます。
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>過去の予約</CardTitle>
              <CardDescription>過去の予約履歴を確認できます</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  機能開発中です。次回のアップデートでご利用いただけます。
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreBookings;
