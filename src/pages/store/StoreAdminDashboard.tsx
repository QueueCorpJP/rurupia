import { useState, useEffect } from 'react';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, AreaChartIcon, Store, Users, BookOpen, Calendar, Loader2, CheckSquare as BadgeCheck, DollarSign } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart as ReBarChart,
  Bar 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, parseISO, getDay, isToday, isFuture } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast as useToastUI } from "@/components/ui/use-toast";

// Map day of week number to Japanese day name
const dayOfWeekMap = ['日', '月', '火', '水', '木', '金', '土'];

const StoreAdminDashboard = () => {
  const { toast: uiToast } = useToastUI();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  // Summary metrics
  const [monthlySales, setMonthlySales] = useState(0);
  const [salesChange, setSalesChange] = useState(0);
  const [monthlyBookings, setMonthlyBookings] = useState(0);
  const [bookingsChange, setBookingsChange] = useState(0);
  const [therapistCount, setTherapistCount] = useState(0);
  const [therapistChange, setTherapistChange] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  
  // Chart data
  const [revenueData, setRevenueData] = useState<Array<{date: string; revenue: number}>>([]);
  const [bookingData, setBookingData] = useState<Array<{day: string; bookings: number}>>([]);
  const [ageDistribution, setAgeDistribution] = useState<Array<{age: string; count: number}>>([]);
  const [repeatCustomerData, setRepeatCustomerData] = useState({
    repeatRate: 0,
    averageVisits: 0,
    distribution: [
      { label: '1回のみ', value: 0 },
      { label: '2〜3回', value: 0 },
      { label: '4〜5回', value: 0 },
      { label: '6回以上', value: 0 }
    ]
  });
  const [dashboardData, setDashboardData] = useState({
    pendingBookingsCount: 0,
    todayBookingsCount: 0,
    upcomingBookingsCount: 0,
    totalBookingsCount: 0,
    totalRevenue: 0,
    therapistsCount: 0,
    recentBookings: [],
  });
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week" | "day">("month");

  // Fetch all dashboard data from Supabase
  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data...");
      setLoading(true);
      setError(null);
      
      // Get current user (store)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setStoreId(user.id);
      setStoreInfo({ id: user.id });
      
      // Current month date range for filtering
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      // Previous month date range for comparison
      const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
      const prevMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));

      // Get store info
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (storeError) {
        console.error("Error fetching store data:", storeError);
      } else if (storeData) {
        setStoreInfo(storeData);
      }

      // Get therapists for this store
      const { data: storeTherapists, error: therapistsError } = await supabase
        .from('store_therapists')
        .select('therapist_id, status')
        .eq('store_id', user.id);
        
      if (therapistsError) {
        console.error("Error fetching therapists:", therapistsError);
        throw therapistsError;
      }
      
      // Filter active therapists
      const activeTherapists = storeTherapists?.filter(t => t.status === "active") || [];
      const therapistIds = activeTherapists.map(t => t.therapist_id) || [];
      
      setTherapistCount(therapistIds.length || 0);
      
      if (therapistIds.length === 0) {
        // No therapists, set empty data
        setDashboardData({
          pendingBookingsCount: 0,
          todayBookingsCount: 0,
          upcomingBookingsCount: 0,
          totalBookingsCount: 0,
          totalRevenue: 0,
          therapistsCount: 0,
          recentBookings: [],
        });
        setLoading(false);
        return;
      }
        
      // Get therapist count change by comparing with previous month
      try {
        const { data: prevMonthTherapists, error: prevTherapistsError } = await supabase
          .from('store_therapists')
          .select('therapist_id')
          .eq('store_id', user.id)
          .eq('status', 'active')
          .lt('created_at', monthStart.toISOString());
          
        if (!prevTherapistsError && prevMonthTherapists) {
          const prevCount = prevMonthTherapists.length;
          setTherapistChange(therapistIds.length - prevCount);
        } else {
          setTherapistChange(0);
        }
      } catch (error) {
        console.error("Error calculating therapist change:", error);
        setTherapistChange(0);
      }
      
      // Get services/courses for this store
      try {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id')
          .eq('store_id', user.id);
          
        if (!servicesError && services) {
          setCourseCount(services.length || 0);
        } else {
          // Fall back to getting services via therapist_services
          const { data: therapistServices, error: tsError } = await supabase
            .from('therapist_services')
            .select('service_id')
            .in('therapist_id', therapistIds);
            
          if (!tsError && therapistServices) {
            // Get unique service IDs
            const uniqueServiceIds = [...new Set(therapistServices.map(ts => ts.service_id))];
            setCourseCount(uniqueServiceIds.length || 0);
          } else {
            setCourseCount(0);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setCourseCount(0);
      }
      
      // Get time range limit
      let fromDate = null;
      const currentDate = new Date();
      
      if (timeRange === "month") {
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
      } else if (timeRange === "week") {
        fromDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === "day") {
        fromDate = new Date(currentDate.setHours(0, 0, 0, 0));
      }
      
      // Prepare query filters
      let query = supabase
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
        
      if (fromDate && timeRange !== "all") {
        query = query.gte("date", fromDate.toISOString());
      }
      
      // Get bookings
      const { data: bookingsData, error: bookingsError } = await query;
      
      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        throw bookingsError;
      }
      
      if (!bookingsData || bookingsData.length === 0) {
        setMonthlySales(0);
        setMonthlyBookings(0);
        setBookingData([]);
        setRevenueData([]);
        setDashboardData({
          pendingBookingsCount: 0,
          todayBookingsCount: 0,
          upcomingBookingsCount: 0,
          totalBookingsCount: 0,
          totalRevenue: 0,
          therapistsCount: therapistIds.length,
          recentBookings: [],
        });
        setLoading(false);
        return;
      }
      
      // Calculate monthly sales and bookings
      setMonthlyBookings(bookingsData.length);
      const calculatedMonthlySales = bookingsData
        .reduce((sum, booking) => sum + (booking.price || 0), 0);
      setMonthlySales(calculatedMonthlySales);
      
      // Calculate dashboard metrics
      const pendingBookings = bookingsData.filter(booking => booking.status === "pending");
      const confirmedBookings = bookingsData.filter(booking => booking.status === "confirmed");
      const completedBookings = bookingsData.filter(booking => booking.status === "completed");
      
      const todayBookings = bookingsData.filter(booking => {
        const bookingDate = new Date(booking.date);
        return isToday(bookingDate);
      });
      
      const upcomingBookings = bookingsData.filter(booking => {
        const bookingDate = new Date(booking.date);
        return isFuture(bookingDate) && !isToday(bookingDate);
      });
      
      const totalRevenue = bookingsData
        .filter(booking => booking.status === "completed" || booking.status === "confirmed")
        .reduce((sum, booking) => sum + (booking.price || 0), 0);
        
      // Get bookings by day of week
      const bookingsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
      
      bookingsData.forEach(booking => {
        if (booking.date) {
          try {
            const date = parseISO(booking.date);
            const dayOfWeek = getDay(date); // 0 is Sunday, 6 is Saturday
            bookingsByDay[dayOfWeek] += 1;
          } catch (e) {
            console.error("Error parsing booking date:", e);
          }
        }
      });
      
      // Format for chart
      const formattedBookingData = bookingsByDay.map((count, index) => ({
        day: dayOfWeekMap[index],
        bookings: count || 0 // Ensure no undefined values
      }));
      
      setBookingData(formattedBookingData);
      
      // Get user profiles to get client names
      const userIds = bookingsData.map(booking => booking.user_id).filter(Boolean);
      
      console.log("Fetching user profiles...");
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from("profiles")
        .select("id, name, nickname, avatar_url")
        .in("id", userIds);

      if (userProfilesError) {
        console.error("Error fetching user profiles:", userProfilesError);
        // Continue without user profiles
      }
      
      console.log("Fetching therapist profiles...");
      const { data: therapistProfiles, error: therapistProfilesError } = await supabase
        .from("therapists")
        .select("id, name")
        .in("id", therapistIds);

      if (therapistProfilesError) {
        console.error("Error fetching therapist profiles:", therapistProfilesError);
        // Continue without therapist profiles
      }

      // Get service information
      const serviceIds = bookingsData
        .map(booking => booking.service_id)
        .filter(Boolean);
        
      console.log("Fetching services...");
      const { data: services, error: servicesError } = serviceIds.length > 0 
        ? await supabase
            .from("services")
            .select("id, name")
            .in("id", serviceIds)
        : { data: [], error: null };

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        // Continue without services
      }

      // Prepare recent bookings data (most recent 5 bookings)
      const recentBookings = bookingsData
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(booking => {
          const user = userProfiles?.find(u => u.id === booking.user_id);
          const therapist = therapistProfiles?.find(t => t.id === booking.therapist_id);
          const service = services?.find(s => s.id === booking.service_id);
          
          const bookingDate = new Date(booking.date);
          
          return {
            id: booking.id,
            clientName: user?.name || user?.nickname || "名前なし",
            clientAvatar: user?.avatar_url,
            therapistName: therapist?.name || "未定",
            therapistId: booking.therapist_id,
            serviceName: service?.name || "未定",
            date: format(bookingDate, "yyyy/MM/dd", { locale: ja }),
            time: format(bookingDate, "HH:mm", { locale: ja }),
            status: booking.status,
            price: booking.price || 0,
            location: booking.location || "未定",
          };
        });
        
      // Get last 6 months revenue data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      
      const { data: revenueHistoryData, error: revenueError } = await supabase
        .from('bookings')
        .select('id, price, date')
        .in('therapist_id', therapistIds)
        .gte('date', sixMonthsAgo.toISOString());
        
      if (revenueError) {
        console.error("Error fetching revenue history:", revenueError);
        setRevenueData([]);
      } else if (revenueHistoryData && revenueHistoryData.length > 0) {
        // Group by month and sum
        const revenueByMonth: Record<string, number> = {};
        
        revenueHistoryData.forEach(booking => {
          if (booking.date && booking.price) {
            try {
              const date = parseISO(booking.date);
              const monthKey = format(date, 'yyyy/MM');
              
              if (!revenueByMonth[monthKey]) {
                revenueByMonth[monthKey] = 0;
              }
              
              revenueByMonth[monthKey] += booking.price;
            } catch (e) {
              console.error("Error parsing revenue date:", e);
            }
          }
        });
        
        // Format for chart
        const formattedRevenueData = Object.keys(revenueByMonth)
          .sort()
          .map(monthKey => ({
            date: monthKey,
            revenue: revenueByMonth[monthKey] || 0 // Ensure no undefined values
          }));
        
        setRevenueData(formattedRevenueData);
      }

      // Set dashboard data
      setDashboardData({
        pendingBookingsCount: pendingBookings.length,
        todayBookingsCount: todayBookings.length,
        upcomingBookingsCount: upcomingBookings.length,
        totalBookingsCount: bookingsData.length,
        totalRevenue,
        therapistsCount: therapistIds.length,
        recentBookings,
      });
      
      console.log("Dashboard data fetched successfully");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("データの取得中にエラーが発生しました", {
        description: "最新の統計情報を表示できない場合があります。"
      });
      setError("データの取得中にエラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg font-medium">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <h3 className="font-bold">エラーが発生しました</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => fetchDashboardData()}
          >
            再試行
          </Button>
        </div>
      </div>
    );
  }

  const hasData = monthlySales > 0 || monthlyBookings > 0 || therapistCount > 0 || courseCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">店舗ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">店舗の現状と統計情報</p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">今日</SelectItem>
            <SelectItem value="week">過去7日間</SelectItem>
            <SelectItem value="month">過去30日間</SelectItem>
            <SelectItem value="all">全期間</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hasData && (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-800">
          <h3 className="font-bold mb-2">データがありません</h3>
          <p>現在表示できるデータがありません。新しい予約や顧客データが追加されると、ここに統計情報が表示されます。</p>
        </div>
      )}

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={<Store className="h-5 w-5" />}
          title="今月の売上"
          value={`${monthlySales.toLocaleString()}円`}
          change={salesChange !== 0 ? { value: `${salesChange > 0 ? '+' : ''}${salesChange}%`, positive: salesChange >= 0 } : undefined}
        />
        <DashboardCard
          icon={<Calendar className="h-5 w-5" />}
          title="今月の予約数"
          value={monthlyBookings.toString()}
          change={bookingsChange !== 0 ? { value: `${bookingsChange > 0 ? '+' : ''}${bookingsChange}%`, positive: bookingsChange >= 0 } : undefined}
        />
        <DashboardCard
          icon={<Users className="h-5 w-5" />}
          title="セラピスト数"
          value={therapistCount.toString()}
          change={therapistChange !== 0 ? { value: `${therapistChange > 0 ? '+' : ''}${therapistChange}`, positive: therapistChange > 0 } : undefined}
        />
        <DashboardCard
          icon={<BookOpen className="h-5 w-5" />}
          title="コース数"
          value={courseCount.toString()}
        />
      </div>

      {/* グラフセクション */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 売上推移グラフ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0">
              <CardTitle>月次売上推移</CardTitle>
              <CardDescription>
                過去6ヶ月の売上推移
              </CardDescription>
            </div>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}円`} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                <p>データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 曜日別予約数グラフ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0">
              <CardTitle>曜日別予約数</CardTitle>
              <CardDescription>
                曜日ごとの予約傾向
              </CardDescription>
            </div>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bookingData.some(item => item.bookings > 0) ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={bookingData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}件`} />
                    <Bar dataKey="bookings" fill="#82ca9d" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                <p>データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 顧客分析セクション */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0">
              <CardTitle>顧客年齢層分布</CardTitle>
              <CardDescription>
                来店客の年齢層分析
              </CardDescription>
            </div>
            <AreaChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ageDistribution.length > 0 && ageDistribution.some(item => item.count > 0) ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={ageDistribution}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}`} />
                    <Bar dataKey="count" fill="#ffc658" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                <p>データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* リピーター情報 */}
        <Card>
          <CardHeader>
            <CardTitle>リピーター情報</CardTitle>
            <CardDescription>
              顧客のリピート傾向分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            {repeatCustomerData.repeatRate > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">リピート率</p>
                    <p className="text-2xl font-bold">{repeatCustomerData.repeatRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">平均利用回数</p>
                    <p className="text-2xl font-bold">{repeatCustomerData.averageVisits}回</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">リピート回数分布</p>
                  <div className="space-y-2">
                    {repeatCustomerData.distribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="text-sm min-w-[80px]">{item.label}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-4">
                          <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${item.value}%` }}></div>
                        </div>
                        <div className="text-sm min-w-[40px] text-right">{item.value}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                <p>データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>最近の予約</CardTitle>
            <CardDescription>最新の予約一覧</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentBookings.length > 0 ? (
              <div className="space-y-6">
                {dashboardData.recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={booking.clientAvatar || undefined} alt={booking.clientName} />
                      <AvatarFallback>{booking.clientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{booking.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.date} {booking.time} / {booking.therapistName}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium">
                        {getStatusBadge(booking.status)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.price.toLocaleString()}円
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                表示できる予約がありません
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>サマリー</CardTitle>
            <CardDescription>現在の店舗状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mr-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">今後の予約</p>
                  <p className="text-sm text-muted-foreground">合計 {dashboardData.upcomingBookingsCount}件</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">総予約数</p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.totalBookingsCount}件 ({timeRange === "all" 
                    ? "全期間" 
                    : timeRange === "month" 
                      ? "過去30日間" 
                      : timeRange === "week" 
                        ? "過去7日間" 
                        : "今日"})
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 text-muted-foreground mr-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">店舗ステータス</p>
                  <p className="text-sm text-muted-foreground">{storeInfo?.status === "active" ? "営業中" : "準備中"}</p>
                </div>
              </div>
              {storeInfo?.subscription_status && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground mr-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">プラン</p>
                    <p className="text-sm text-muted-foreground">
                      {storeInfo.subscription_status === "active" ? "プレミアム" : "無料プラン"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-0">確定</Badge>;
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-0">仮予約</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-0">キャンセル</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-0">完了</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default StoreAdminDashboard;
