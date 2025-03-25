import { useState, useEffect } from 'react';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, AreaChartIcon, Store, Users, BookOpen, Calendar, Loader2 } from 'lucide-react';
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
import { format, startOfMonth, endOfMonth, parseISO, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';

// Mock data as fallback
const mockRevenueData = [
  { date: '2025/01', revenue: 450000 },
  { date: '2025/02', revenue: 520000 },
  { date: '2025/03', revenue: 480000 },
  { date: '2025/04', revenue: 600000 },
  { date: '2025/05', revenue: 580000 },
  { date: '2025/06', revenue: 650000 },
];

const mockBookingData = [
  { day: '月', bookings: 8 },
  { day: '火', bookings: 5 },
  { day: '水', bookings: 7 },
  { day: '木', bookings: 10 },
  { day: '金', bookings: 12 },
  { day: '土', bookings: 18 },
  { day: '日', bookings: 15 },
];

const mockAgeDistribution = [
  { age: '10代', count: 5 },
  { age: '20代', count: 25 },
  { age: '30代', count: 35 },
  { age: '40代', count: 20 },
  { age: '50代', count: 10 },
  { age: '60代以上', count: 5 },
];

// Map day of week number to Japanese day name
const dayOfWeekMap = ['日', '月', '火', '水', '木', '金', '土'];

const StoreAdminDashboard = () => {
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
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [bookingData, setBookingData] = useState(mockBookingData);
  const [ageDistribution, setAgeDistribution] = useState(mockAgeDistribution);
  const [repeatCustomerData, setRepeatCustomerData] = useState({
    repeatRate: 65,
    averageVisits: 3.2,
    distribution: [
      { label: '1回のみ', value: 35 },
      { label: '2〜3回', value: 40 },
      { label: '4〜5回', value: 15 },
      { label: '6回以上', value: 10 }
    ]
  });

  // Fetch all dashboard data from Supabase
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user (store)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setStoreId(user.id);
      
      // Current month date range for filtering
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      // Previous month date range for comparison
      const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
      const prevMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));

      // Get therapists for this store
      const { data: therapists, error: therapistsError } = await supabase
        .from('store_therapists')
        .select('therapist_id')
        .eq('store_id', user.id)
        .eq('status', 'active');
        
      if (therapistsError) throw therapistsError;
      
      const therapistIds = therapists?.map(t => t.therapist_id) || [];
      setTherapistCount(therapistIds.length);
      
      // Get therapist count change (simplistic approach - just a +/- indicator for demo)
      setTherapistChange(therapistIds.length > 10 ? therapistIds.length - 10 : 0);
      
      // Get services/courses for this store
      try {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id')
          .eq('store_id', user.id);
          
        if (!servicesError && services) {
          setCourseCount(services.length);
        } else {
          // Fall back to getting services via therapist_services
          const { data: therapistServices, error: tsError } = await supabase
            .from('therapist_services')
            .select('service_id')
            .in('therapist_id', therapistIds);
            
          if (!tsError && therapistServices) {
            // Get unique service IDs
            const uniqueServiceIds = [...new Set(therapistServices.map(ts => ts.service_id))];
            setCourseCount(uniqueServiceIds.length);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        setCourseCount(8); // Fallback to mock data
      }
      
      if (therapistIds.length > 0) {
        // Get bookings for current month
        const { data: currentMonthBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, price, date')
          .in('therapist_id', therapistIds)
          .gte('date', monthStart.toISOString())
          .lte('date', monthEnd.toISOString());
          
        if (bookingsError) throw bookingsError;
        
        // Calculate monthly sales and bookings
        setMonthlyBookings(currentMonthBookings?.length || 0);
        setMonthlySales(currentMonthBookings?.reduce((sum, booking) => sum + (booking.price || 0), 0) || 0);
        
        // Get bookings for previous month for comparison
        const { data: prevMonthBookings, error: prevBookingsError } = await supabase
          .from('bookings')
          .select('id, price')
          .in('therapist_id', therapistIds)
          .gte('date', prevMonthStart.toISOString())
          .lte('date', prevMonthEnd.toISOString());
          
        if (prevBookingsError) throw prevBookingsError;
        
        // Calculate percentage changes
        const prevMonthSales = prevMonthBookings?.reduce((sum, booking) => sum + (booking.price || 0), 0) || 0;
        const prevMonthBookingCount = prevMonthBookings?.length || 0;
        
        if (prevMonthSales > 0) {
          const percentChange = ((monthlySales - prevMonthSales) / prevMonthSales) * 100;
          setSalesChange(Math.round(percentChange));
        }
        
        if (prevMonthBookingCount > 0) {
          const percentChange = ((monthlyBookings - prevMonthBookingCount) / prevMonthBookingCount) * 100;
          setBookingsChange(Math.round(percentChange));
        }
        
        // Get bookings by day of week
        const bookingsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
        
        currentMonthBookings?.forEach(booking => {
          if (booking.date) {
            const date = parseISO(booking.date);
            const dayOfWeek = getDay(date); // 0 is Sunday, 6 is Saturday
            bookingsByDay[dayOfWeek] += 1;
          }
        });
        
        // Format for chart
        const formattedBookingData = bookingsByDay.map((count, index) => ({
          day: dayOfWeekMap[index],
          bookings: count
        }));
        
        setBookingData(formattedBookingData);
        
        // Get last 6 months revenue data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        
        const { data: revenueHistoryData, error: revenueError } = await supabase
          .from('bookings')
          .select('id, price, date')
          .in('therapist_id', therapistIds)
          .gte('date', sixMonthsAgo.toISOString());
          
        if (!revenueError && revenueHistoryData) {
          // Group by month and sum
          const revenueByMonth: Record<string, number> = {};
          
          revenueHistoryData.forEach(booking => {
            if (booking.date && booking.price) {
              const date = parseISO(booking.date);
              const monthKey = format(date, 'yyyy/MM');
              
              if (!revenueByMonth[monthKey]) {
                revenueByMonth[monthKey] = 0;
              }
              
              revenueByMonth[monthKey] += booking.price;
            }
          });
          
          // Format for chart
          const formattedRevenueData = Object.keys(revenueByMonth)
            .sort()
            .map(monthKey => ({
              date: monthKey,
              revenue: revenueByMonth[monthKey]
            }));
          
          if (formattedRevenueData.length > 0) {
            setRevenueData(formattedRevenueData);
          }
        }
      }
      
      // Try to fetch age distribution from customer_age_distribution
      try {
        const { data: ageData, error: ageError } = await supabase
          .from('customer_age_distribution')
          .select('*')
          .eq('store_id', user.id);
          
        if (!ageError && ageData && ageData.length > 0) {
          // Format for chart
          const formattedAgeData = ageData.map(item => ({
            age: item.age_group,
            count: item.count
          }));
          
          setAgeDistribution(formattedAgeData);
        }
      } catch (error) {
        console.error("Error fetching age distribution:", error);
        // Keep using mock age distribution data
      }
      
      // Future enhancement: Fetch real repeat customer data from bookings table by analyzing
      // distinct user_id counts and frequency
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">店舗ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">店舗の現状と統計情報</p>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={<Store className="h-5 w-5" />}
          title="今月の売上"
          value={`¥${monthlySales.toLocaleString()}`}
          change={{ value: `${salesChange > 0 ? '+' : ''}${salesChange}%`, positive: salesChange >= 0 }}
        />
        <DashboardCard
          icon={<Calendar className="h-5 w-5" />}
          title="今月の予約数"
          value={monthlyBookings.toString()}
          change={{ value: `${bookingsChange > 0 ? '+' : ''}${bookingsChange}%`, positive: bookingsChange >= 0 }}
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart
                  data={ageDistribution}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="count" fill="#ffc658" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreAdminDashboard;
