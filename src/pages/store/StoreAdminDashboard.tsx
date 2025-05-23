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
import { SupabaseClient } from '@supabase/supabase-js';
import { BookingData, FormattedBooking, calculateCombinedStatus } from '@/types/booking';

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
      
      // Get services/courses for this store using direct SQL for better performance and to avoid type issues
      try {
        const { data, error } = await supabase.rpc('count_store_services', { 
          input_store_id: user.id 
        });
        
        if (!error && data !== null) {
          setCourseCount(data);
        } else {
          console.error("Error counting services:", error);
          setCourseCount(0);
        }
      } catch (error) {
        console.error("Error fetching service count:", error);
        setCourseCount(0);
      }
      
      // Get time range limit
      let fromDate = null;
      const currentDate = new Date();
      
      // Function to fetch bookings and calculate sales
      const fetchBookings = async (therapistIds: string[]) => {
        // Set time filter based on selected range
        switch(timeRange) {
          case "week":
            fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);
            break;
          case "month":
            fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            break;
          case "day":
            fromDate = new Date();
            fromDate.setHours(0, 0, 0, 0);
            break;
          case "all":
          default:
            fromDate = null;
            break;
        }
        
        // Get bookings with a wider date range to ensure we have past week data
        // Always include at least past 7 days for the day-of-week chart
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Use the earlier of fromDate or oneWeekAgo
        const queryFromDate = fromDate && fromDate < oneWeekAgo ? fromDate : oneWeekAgo;
        
        // Get bookings for therapists
        const bookingsQuery = supabase
          .from('bookings')
          .select('*')
          .in('therapist_id', therapistIds);
          
        // Apply date filter if specified
        if (queryFromDate) {
          bookingsQuery.gte('date', queryFromDate.toISOString());
        }
        
        const { data: bookings, error: bookingsError } = await bookingsQuery;
        
        if (bookingsError) {
          console.error("Error fetching bookings:", bookingsError);
          throw bookingsError;
        }
        
        // Calculate booking metrics from fetched data
        if (bookings) {
          const currentDate = new Date();
          let pendingCount = 0;
          let todayCount = 0;
          let upcomingCount = 0;
          let totalRevenue = 0;
          let currentMonthRevenue = 0;
          let previousMonthRevenue = 0;
          let currentMonthBookings = 0;
          let previousMonthBookings = 0;
          
          // Format booking data and calculate metrics
          const formattedBookings = bookings.map(booking => {
            const bookingDate = parseISO(booking.date);
            
            // Determine booking status - check both status fields or use combined status
            const bookingStatus = 
              // Handle the case where status might not exist on some bookings
              'status' in booking && booking.status ? 
                booking.status : 
                (booking["status store"] === "completed" && booking["status therapist"] === "completed" ? 
                  "完了" : "pending");
            
            const isToday = new Date(booking.date).toDateString() === currentDate.toDateString();
            const isUpcoming = new Date(booking.date) > currentDate;
            const isPending = bookingStatus === 'pending';
            
            // Only include in current/previous month counts if appropriate for the selected time range
            let isCurrentPeriod = false;
            let isPreviousPeriod = false;
            
            if (timeRange === "month") {
              // Monthly view (current month vs previous month)
              const currentMonthStart = startOfMonth(currentDate);
              const currentMonthEnd = endOfMonth(currentDate);
              const prevMonthStart = startOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
              const prevMonthEnd = endOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
              
              isCurrentPeriod = bookingDate >= currentMonthStart && bookingDate <= currentMonthEnd;
              isPreviousPeriod = bookingDate >= prevMonthStart && bookingDate <= prevMonthEnd;
            } else if (timeRange === "week") {
              // Weekly view (this week vs last week)
              const thisWeekStart = new Date(currentDate);
              thisWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
              thisWeekStart.setHours(0, 0, 0, 0);
              
              const thisWeekEnd = new Date(thisWeekStart);
              thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
              thisWeekEnd.setHours(23, 59, 59, 999);
              
              const lastWeekStart = new Date(thisWeekStart);
              lastWeekStart.setDate(lastWeekStart.getDate() - 7);
              
              const lastWeekEnd = new Date(thisWeekEnd);
              lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
              
              isCurrentPeriod = bookingDate >= thisWeekStart && bookingDate <= thisWeekEnd;
              isPreviousPeriod = bookingDate >= lastWeekStart && bookingDate <= lastWeekEnd;
            } else if (timeRange === "day") {
              // Daily view (today vs yesterday)
              const todayStart = new Date(currentDate);
              todayStart.setHours(0, 0, 0, 0);
              
              const todayEnd = new Date(currentDate);
              todayEnd.setHours(23, 59, 59, 999);
              
              const yesterdayStart = new Date(todayStart);
              yesterdayStart.setDate(yesterdayStart.getDate() - 1);
              
              const yesterdayEnd = new Date(todayEnd);
              yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
              
              isCurrentPeriod = bookingDate >= todayStart && bookingDate <= todayEnd;
              isPreviousPeriod = bookingDate >= yesterdayStart && bookingDate <= yesterdayEnd;
            } else {
              // All time - compare last 30 days with previous 30 days
              const thirtyDaysAgo = new Date(currentDate);
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              
              const sixtyDaysAgo = new Date(currentDate);
              sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
              
              isCurrentPeriod = bookingDate >= thirtyDaysAgo && bookingDate <= currentDate;
              isPreviousPeriod = bookingDate >= sixtyDaysAgo && bookingDate < thirtyDaysAgo;
            }
            
            // FIXED: Better check for completed bookings
            // Check if booking is completed using both combined status and individual status fields
            const isCompleted = 
              bookingStatus === '完了' || 
              bookingStatus === 'completed' ||
              (booking["status store"] === "completed" && booking["status therapist"] === "completed");
            
            // Count bookings by status
            if (isPending) pendingCount++;
            if (isToday) todayCount++;
            if (isUpcoming) upcomingCount++;
            
            // Calculate revenue from completed bookings
            if (isCompleted) {
              const price = booking.price || 0;
              totalRevenue += price;
              
              // Track period revenues for comparison
              if (isCurrentPeriod) {
                currentMonthRevenue += price;
                currentMonthBookings++;
              } else if (isPreviousPeriod) {
                previousMonthRevenue += price;
                previousMonthBookings++;
              }
            }
            
            // Calculate combined status for UI display
            const combinedStatus = calculateCombinedStatus(
              booking["status therapist"] || 'pending',
              booking["status store"] || 'pending'
            );
            
            return {
              ...booking,
              formattedDate: format(bookingDate, 'yyyy/MM/dd', { locale: ja }),
              dayOfWeek: dayOfWeekMap[getDay(bookingDate)],
              status: bookingStatus,
              combined_status: combinedStatus,
              isToday,
              isUpcoming,
              isPending,
              isCompleted // Add isCompleted to the booking object
            };
          });
          
          // Update state with calculated metrics
          setMonthlySales(currentMonthRevenue);
          setMonthlyBookings(currentMonthBookings);
          
          // Calculate percent changes
          const salesPercentChange = previousMonthRevenue > 0 
            ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
            : 0;
          const bookingsPercentChange = previousMonthBookings > 0 
            ? ((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100 
            : 0;
            
          setSalesChange(salesPercentChange);
          setBookingsChange(bookingsPercentChange);
          
          // Generate data for revenue chart
          const dailySales = {};
          formattedBookings.forEach(booking => {
            // Only include completed bookings in sales chart
            if (booking.isCompleted) {
              const date = booking.formattedDate;
              dailySales[date] = (dailySales[date] || 0) + (booking.price || 0);
            }
          });
          
          // Format based on selected time range
          let revenueChartData;
          if (timeRange === "day") {
            // For day view, use hourly data
            const hourlyData = {};
            formattedBookings.forEach(booking => {
              if (booking.isCompleted && isToday(parseISO(booking.date))) {
                const bookingHour = format(parseISO(booking.date), 'HH:00');
                hourlyData[bookingHour] = (hourlyData[bookingHour] || 0) + (booking.price || 0);
              }
            });
            
            revenueChartData = Object.keys(hourlyData).map(hour => ({
              date: hour,
              revenue: hourlyData[hour]
            })).sort((a, b) => a.date.localeCompare(b.date));
          } else {
            revenueChartData = Object.keys(dailySales).map(date => ({
              date,
              revenue: dailySales[date]
            })).sort((a, b) => a.date.localeCompare(b.date));
          }
          
          setRevenueData(revenueChartData);
          
          // FIXED: Generate data for day-of-week booking chart
          // Initialize data for all days of the week
          const dayOfWeekData = {
            '日': 0,
            '月': 0,
            '火': 0,
            '水': 0,
            '木': 0,
            '金': 0,
            '土': 0
          };
          
          // Count bookings by day of week based on timeRange
          let bookingsToInclude = formattedBookings;
          
          // Filter bookings based on time range
          if (timeRange === "day") {
            // For day view, include only last 7 days
            const sevenDaysAgo = new Date(currentDate);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            bookingsToInclude = formattedBookings.filter(booking => {
              const bookingDate = parseISO(booking.date);
              return bookingDate >= sevenDaysAgo;
            });
          } else if (timeRange === "week") {
            // For week view, include only this week
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            weekStart.setHours(0, 0, 0, 0);
            bookingsToInclude = formattedBookings.filter(booking => {
              const bookingDate = parseISO(booking.date);
              return bookingDate >= weekStart;
            });
          } else if (timeRange === "month") {
            // For month view, include only this month
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            bookingsToInclude = formattedBookings.filter(booking => {
              const bookingDate = parseISO(booking.date);
              return bookingDate >= monthStart;
            });
          }
          
          // Count by day of week
          bookingsToInclude.forEach(booking => {
            const bookingDate = parseISO(booking.date);
            const dayOfWeek = dayOfWeekMap[getDay(bookingDate)];
            dayOfWeekData[dayOfWeek] = (dayOfWeekData[dayOfWeek] || 0) + 1;
          });
          
          // Convert to array format for chart
          const bookingChartData = Object.keys(dayOfWeekData).map(day => ({
            day,
            bookings: dayOfWeekData[day]
          }));
          
          // Sort by day of week (starting with Monday)
          const dayOrder = ['月', '火', '水', '木', '金', '土', '日'];
          bookingChartData.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
          
          setBookingData(bookingChartData);
          
          // Update dashboard data
          setDashboardData({
            pendingBookingsCount: pendingCount,
            todayBookingsCount: todayCount,
            upcomingBookingsCount: upcomingCount,
            totalBookingsCount: bookings.length,
            totalRevenue: totalRevenue,
            therapistsCount: therapistIds.length,
            recentBookings: formattedBookings
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
          });
          
          return formattedBookings;
        }
        
        return [];
      };

      // Get bookings
      const bookingsData = await fetchBookings(therapistIds);
      
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
        pendingBookingsCount: bookingsData.filter(b => b.status === "pending").length,
        todayBookingsCount: bookingsData.filter(b => b.isToday).length,
        upcomingBookingsCount: bookingsData.filter(b => b.isUpcoming).length,
        totalBookingsCount: bookingsData.length,
        totalRevenue: bookingsData.reduce((sum, b) => sum + (b.price || 0), 0),
        therapistsCount: therapistIds.length,
        recentBookings: recentBookings,
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
