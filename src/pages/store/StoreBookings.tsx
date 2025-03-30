import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Archive, Filter, SortAsc, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO, subMonths, startOfDay, endOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CheckSquare,
  SortDesc,
  AlertCircle,
  Trash,
  Pencil,
  X,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DayPicker } from 'react-day-picker';
import {
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Define booking interface
interface Booking {
  id: string;
  clientName: string;
  clientAvatar?: string;
  clientEmail?: string;
  therapistName: string;
  therapistId: string;
  serviceName: string;
  serviceId: string;
  date: string;
  time: string;
  originalDate: string; // ISO date for sorting
  status: string;
  price: number;
  location: string;
  notes?: string;
  userId: string;
}

interface TherapistOption {
  id: string;
  name: string;
}

const StoreBookings = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [therapistFilter, setTherapistFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "price-high" | "price-low" | "status" | "therapist">("newest");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [filteredResults, setFilteredResults] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [therapists, setTherapists] = useState<TherapistOption[]>([]);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [sortOption, setSortOption] = useState<string>('date-desc');
  
  // Fetch bookings from Supabase
  const fetchBookings = async () => {
    try {
      console.log("Starting to fetch bookings...");
      setLoading(true);
      setError(null);

      // Get current store ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error: " + authError.message);
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("User not authenticated");
      }
      
      console.log("Authenticated user:", user.id);
      setStoreId(user.id);

      // Get all store's therapists
      console.log("Fetching store therapists for store:", user.id);
      const { data: storeTherapists, error: therapistsError } = await supabase
        .from("store_therapists")
        .select("therapist_id, status")
        .eq("store_id", user.id);

      if (therapistsError) {
        console.error("Error fetching store therapists:", therapistsError);
        throw therapistsError;
      }
      
      console.log("Store therapists data:", storeTherapists);
      
      if (!storeTherapists || storeTherapists.length === 0) {
        console.log("No therapists found for this store");
        setBookings([]);
        setTodayBookings([]);
        setLoading(false);
        return;
      }

      // Filter only active therapists
      const activeTherapists = storeTherapists.filter(t => t.status === "active");
      const therapistIds = activeTherapists.map(t => t.therapist_id);
      
      console.log(`Found ${therapistIds.length} active therapists for this store:`, therapistIds);
      
      // Check if our specific therapist is included
      const includesTargetTherapist = therapistIds.includes("d4a60272-81aa-4866-89dd-1330fb38e02a");
      console.log("Includes target therapist?", includesTargetTherapist);

      // Get bookings for all store's therapists
      console.log("Fetching bookings for therapists:", therapistIds);
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
        .in("therapist_id", therapistIds);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        throw bookingsError;
      }
      
      console.log(`Retrieved ${bookingsData?.length || 0} bookings:`, bookingsData);
      
      // Check for our specific therapist's bookings
      if (bookingsData) {
        const targetTherapistBookings = bookingsData.filter(b => b.therapist_id === "d4a60272-81aa-4866-89dd-1330fb38e02a");
        console.log(`Found ${targetTherapistBookings.length} bookings for target therapist:`, targetTherapistBookings);
      }
      
      if (!bookingsData || bookingsData.length === 0) {
        console.log("No bookings found for any therapist");
        setBookings([]);
        setTodayBookings([]);
        setFilteredResults([]);
        setLoading(false);
        return;
      }

      // Get user profiles to get client names
      const userIds = bookingsData.map(booking => booking.user_id).filter(Boolean);
      console.log("Fetching profiles for users:", userIds);
      const { data: userProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, nickname, email, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
        throw profilesError;
      }

      // Get therapist profiles to get therapist names
      console.log("Fetching profiles for therapists:", therapistIds);
      const { data: therapistProfiles, error: therapistProfileError } = await supabase
        .from("therapists")
        .select("id, name")
        .in("id", therapistIds);

      if (therapistProfileError) {
        console.error("Error fetching therapist profiles:", therapistProfileError);
        throw therapistProfileError;
      }
      
      // Build therapist options for filter dropdown
      if (therapistProfiles && therapistProfiles.length > 0) {
        const therapistOptions = therapistProfiles.map(t => ({
          id: t.id,
          name: t.name || "名前なし"
        }));
        setTherapists(therapistOptions);
        console.log("Set therapist options for filtering:", therapistOptions);
      }

      // Get services to get service names
      const serviceIds = bookingsData.map(booking => booking.service_id).filter(Boolean);
      console.log("Fetching services:", serviceIds);
      const { data: services, error: servicesError } = serviceIds.length > 0 ? await supabase
        .from("services")
        .select("id, name")
        .in("id", serviceIds) : { data: [], error: null };

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        throw servicesError;
      }

      // Map data to UI format
      console.log("Formatting booking data for UI");
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
          clientName: client?.name || client?.nickname || "名前なし",
          clientAvatar: client?.avatar_url || undefined,
          clientEmail: client?.email || undefined,
          therapistName: therapist?.name || "未定",
          therapistId: booking.therapist_id,
          serviceName: service?.name || "未定",
          serviceId: booking.service_id || "",
          date: formattedDate,
          time: formattedTime,
          originalDate: booking.date || "",
          status: booking.status === "confirmed" ? "確定" : 
                  booking.status === "cancelled" ? "キャンセル" : 
                  booking.status === "completed" ? "完了" : "仮予約",
          price: booking.price || 0,
          location: booking.location || "",
          notes: booking.notes,
          userId: booking.user_id,
        };
      });

      console.log(`Formatted ${formattedBookings.length} bookings for display`);
      
      // Set all bookings and filter today's bookings
      setBookings(formattedBookings);
      setTodayBookings(formattedBookings.filter(booking => isToday(booking.originalDate)));
      
      // Apply initial filtering and sorting
      applyFiltersAndSorting(formattedBookings);
      
      console.log("Booking data fetch complete");
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError((error as Error).message);
      toast({
        title: "エラー",
        description: "予約データの取得に失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);
  
  // Apply filters and sorting whenever filter/sort criteria change
  useEffect(() => {
    applyFiltersAndSorting(bookings);
  }, [searchQuery, statusFilter, therapistFilter, sortOrder, dateRange, bookings]);
  
  // Apply all filters and sorting to the data
  const applyFiltersAndSorting = (data: Booking[]) => {
    console.log("Applying filters and sorting", { 
      statusFilter, 
      therapistFilter, 
      sortOrder, 
      dateRange,
      searchQuery 
    });
    
    let filtered = [...data];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(booking => 
        booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      const statusMap: Record<string, string> = {
        "pending": "仮予約",
        "confirmed": "確定",
        "cancelled": "キャンセル",
        "completed": "完了"
      };
      filtered = filtered.filter(booking => booking.status === statusMap[statusFilter]);
    }
    
    // Apply therapist filter
    if (therapistFilter !== "all") {
      filtered = filtered.filter(booking => booking.therapistId === therapistFilter);
    }
    
    // Apply date range filter
    if (dateRange && dateRange.from) {
      const fromDate = startOfDay(dateRange.from);
      const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      
      filtered = filtered.filter(booking => {
        const bookingDate = parseISO(booking.originalDate);
        return bookingDate >= fromDate && bookingDate <= toDate;
      });
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "newest":
        filtered.sort((a, b) => b.originalDate.localeCompare(a.originalDate));
        break;
      case "oldest":
        filtered.sort((a, b) => a.originalDate.localeCompare(b.originalDate));
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "status":
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "therapist":
        filtered.sort((a, b) => a.therapistName.localeCompare(b.therapistName));
        break;
    }
    
    console.log(`Filtered from ${data.length} to ${filtered.length} bookings`);
    setFilteredResults(filtered);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };
  
  // Column definition for the bookings table
  const columns = [
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
      accessorKey: "serviceName"
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
          case "完了":
            statusColor = "bg-blue-100 text-blue-800";
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
          <Button size="sm" variant="outline" onClick={() => handleViewBookingDetails(row)}>詳細</Button>
          {row.status !== "キャンセル" && row.status !== "完了" && (
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

  const handleCheckIn = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (error) throw error;
      
      toast({
        title: "チェックイン完了",
        description: "予約のステータスを完了に更新しました。",
      });
      
      // Update local state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: "完了" } 
          : booking
      );
      
      setBookings(updatedBookings);
      setTodayBookings(updatedBookings.filter(booking => isToday(parseISO(booking.originalDate))));
      applyFiltersAndSorting(updatedBookings);
      
    } catch (error) {
      console.error("Error checking in booking:", error);
      toast({
        title: "エラー",
        description: "チェックインに失敗しました。",
        variant: "destructive"
      });
    }
  };

  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      
      toast({
        title: "キャンセル完了",
        description: "予約をキャンセルしました。",
      });
      
      // Update local state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: "キャンセル" } 
          : booking
      );
      
      setBookings(updatedBookings);
      setTodayBookings(updatedBookings.filter(booking => isToday(parseISO(booking.originalDate))));
      applyFiltersAndSorting(updatedBookings);
      
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "エラー",
        description: "予約のキャンセルに失敗しました。",
        variant: "destructive"
      });
    }
  };

  const getFilterOptions = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="pending">仮予約</SelectItem>
              <SelectItem value="confirmed">確定</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
              <SelectItem value="cancelled">キャンセル</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={therapistFilter} onValueChange={setTherapistFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="セラピスト" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのセラピスト</SelectItem>
              {therapists.map(therapist => (
                <SelectItem key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "yyyy/MM/dd")} - {format(dateRange.to, "yyyy/MM/dd")}
                    </>
                  ) : (
                    format(dateRange.from, "yyyy/MM/dd")
                  )
                ) : (
                  "日付で絞り込み"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="border-0"
                />
                <div className="mt-3 border-t border-border pt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => setDateRange(undefined)}
                  >
                    クリア
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新順</SelectItem>
              <SelectItem value="oldest">古い順</SelectItem>
              <SelectItem value="price-high">料金（高い順）</SelectItem>
              <SelectItem value="price-low">料金（安い順）</SelectItem>
              <SelectItem value="status">ステータス順</SelectItem>
              <SelectItem value="therapist">セラピスト名順</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">予約管理</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <Button 
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRefresh}
          >
            再試行
          </Button>
        </div>
      )}

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="today">本日の予約</TabsTrigger>
          <TabsTrigger value="all">すべての予約</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">本日の予約</CardTitle>
              <CardDescription>
                {format(new Date(), "yyyy年MM月dd日", { locale: ja })}の予約一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getFilterOptions()}
              
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mr-2" />
                  <span>予約データを読み込み中...</span>
                </div>
              ) : todayBookings.length > 0 ? (
                <DataTable 
                  columns={columns} 
                  data={filteredResults.filter(booking => isToday(parseISO(booking.originalDate)))} 
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  本日の予約はありません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">すべての予約</CardTitle>
              <CardDescription>
                過去と将来のすべての予約を表示します
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getFilterOptions()}
              
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mr-2" />
                  <span>予約データを読み込み中...</span>
                </div>
              ) : bookings.length > 0 ? (
                <DataTable 
                  columns={columns} 
                  data={filteredResults} 
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  予約データがありません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Booking Details Dialog */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>予約詳細</DialogTitle>
            <DialogDescription>
              予約 #{selectedBooking?.id?.substring(0, 8)} の詳細情報
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">顧客</Label>
                <div className="col-span-3">{selectedBooking.clientName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">セラピスト</Label>
                <div className="col-span-3">{selectedBooking.therapistName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">日付・時間</Label>
                <div className="col-span-3">{selectedBooking.date} {selectedBooking.time}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">場所</Label>
                <div className="col-span-3">{selectedBooking.location || "未指定"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">サービス</Label>
                <div className="col-span-3">{selectedBooking.serviceName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">料金</Label>
                <div className="col-span-3">{selectedBooking.price.toLocaleString()}円</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ステータス</Label>
                <div className="col-span-3">
                  <Badge variant="outline" className={
                    selectedBooking.status === "確定" ? "bg-green-100 text-green-800 border-0" :
                    selectedBooking.status === "キャンセル" ? "bg-red-100 text-red-800 border-0" :
                    selectedBooking.status === "完了" ? "bg-blue-100 text-blue-800 border-0" :
                    "bg-yellow-100 text-yellow-800 border-0"
                  }>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              {selectedBooking.notes && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">メモ</Label>
                  <div className="col-span-3 whitespace-pre-wrap">{selectedBooking.notes}</div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                {selectedBooking.status === "confirmed" && (
                  <Button onClick={() => {
                    handleCheckIn(selectedBooking.id);
                    setShowBookingDetails(false);
                  }}>
                    チェックイン（完了に変更）
                  </Button>
                )}
                {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleCancelBooking(selectedBooking.id);
                      setShowBookingDetails(false);
                    }}
                  >
                    キャンセル
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreBookings;
