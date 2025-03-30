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
import { toast } from 'sonner';

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

      // Get store info
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (storeError) {
        console.error("Error fetching store data:", storeError);
      }

      // Get therapists for this store
      const { data: therapists, error: therapistsError } = await supabase
        .from('store_therapists')
        .select('therapist_id')
        .eq('store_id', user.id)
        .eq('status', 'active');
        
      if (therapistsError) {
        console.error("Error fetching therapists:", therapistsError);
        return;
      }
      
      if (therapists) {
        const therapistIds = therapists.map(t => t.therapist_id) || [];
        setTherapistCount(therapistIds.length || 0);
        
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
        
        if (therapistIds.length > 0) {
          // Get bookings for current month
          const { data: currentMonthBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, price, date, user_id')
            .in('therapist_id', therapistIds)
            .gte('date', monthStart.toISOString())
            .lte('date', monthEnd.toISOString());
            
          if (bookingsError) {
            console.error("Error fetching current month bookings:", bookingsError);
            setMonthlyBookings(0);
            setMonthlySales(0);
            setSalesChange(0);
            setBookingsChange(0);
          } else if (currentMonthBookings && currentMonthBookings.length > 0) {
            // Calculate monthly sales and bookings
            setMonthlyBookings(currentMonthBookings.length);
            const calculatedMonthlySales = currentMonthBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
            setMonthlySales(calculatedMonthlySales);
            
            // Get bookings for previous month for comparison
            const { data: prevMonthBookings, error: prevBookingsError } = await supabase
              .from('bookings')
              .select('id, price, user_id')
              .in('therapist_id', therapistIds)
              .gte('date', prevMonthStart.toISOString())
              .lte('date', prevMonthEnd.toISOString());
              
            if (prevBookingsError) {
              console.error("Error fetching previous month bookings:", prevBookingsError);
              setSalesChange(0);
              setBookingsChange(0);
            } else if (prevMonthBookings) {
              // Calculate percentage changes
              const prevMonthSales = prevMonthBookings.reduce((sum, booking) => sum + (booking.price || 0), 0) || 0;
              const prevMonthBookingCount = prevMonthBookings.length || 0;
              
              if (prevMonthSales > 0) {
                const percentChange = ((calculatedMonthlySales - prevMonthSales) / prevMonthSales) * 100;
                setSalesChange(Math.round(percentChange));
              } else {
                setSalesChange(0);
              }
              
              if (prevMonthBookingCount > 0) {
                const percentChange = ((monthlyBookings - prevMonthBookingCount) / prevMonthBookingCount) * 100;
                setBookingsChange(Math.round(percentChange));
              } else {
                setBookingsChange(0);
              }
            }
            
            // Get bookings by day of week
            const bookingsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
            
            currentMonthBookings.forEach(booking => {
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
            } else {
              setRevenueData([]);
            }
            
            // Calculate repeat customer data based on real bookings
            try {
              const uniqueUserIds = [...new Set(currentMonthBookings.map(b => b.user_id))];
              
              // Get all bookings for these users to analyze repeat patterns
              const { data: allUserBookings, error: allBookingsError } = await supabase
                .from('bookings')
                .select('user_id')
                .in('therapist_id', therapistIds)
                .in('user_id', uniqueUserIds);
                
              if (!allBookingsError && allUserBookings && allUserBookings.length > 0) {
                // Count bookings per user
                const bookingsPerUser: Record<string, number> = {};
                
                allUserBookings.forEach(booking => {
                  if (booking.user_id) {
                    if (!bookingsPerUser[booking.user_id]) {
                      bookingsPerUser[booking.user_id] = 0;
                    }
                    bookingsPerUser[booking.user_id] += 1;
                  }
                });
                
                // Calculate statistics
                const userIds = Object.keys(bookingsPerUser);
                const totalUsers = userIds.length;
                
                if (totalUsers > 0) {
                  const bookingCounts = Object.values(bookingsPerUser);
                  
                  // Users with more than 1 booking are repeat customers
                  const repeatUsers = userIds.filter(id => bookingsPerUser[id] > 1).length;
                  const repeatRate = Math.round((repeatUsers / totalUsers) * 100);
                  
                  // Average visits
                  const totalBookings = bookingCounts.reduce((sum, count) => sum + count, 0);
                  const averageVisits = totalBookings / totalUsers;
                  
                  // Distribution
                  const singleVisits = userIds.filter(id => bookingsPerUser[id] === 1).length;
                  const twoToThreeVisits = userIds.filter(id => bookingsPerUser[id] >= 2 && bookingsPerUser[id] <= 3).length;
                  const fourToFiveVisits = userIds.filter(id => bookingsPerUser[id] >= 4 && bookingsPerUser[id] <= 5).length;
                  const sixPlusVisits = userIds.filter(id => bookingsPerUser[id] >= 6).length;
                  
                  // Calculate percentages
                  const singlePercent = Math.round((singleVisits / totalUsers) * 100);
                  const twoToThreePercent = Math.round((twoToThreeVisits / totalUsers) * 100);
                  const fourToFivePercent = Math.round((fourToFiveVisits / totalUsers) * 100);
                  const sixPlusPercent = Math.round((sixPlusVisits / totalUsers) * 100);
                  
                  // Set real repeat customer data
                  setRepeatCustomerData({
                    repeatRate: repeatRate,
                    averageVisits: Number(averageVisits.toFixed(1)),
                    distribution: [
                      { label: '1回のみ', value: singlePercent },
                      { label: '2〜3回', value: twoToThreePercent },
                      { label: '4〜5回', value: fourToFivePercent },
                      { label: '6回以上', value: sixPlusPercent }
                    ]
                  });
                } else {
                  // No users with bookings
                  setRepeatCustomerData({
                    repeatRate: 0,
                    averageVisits: 0,
                    distribution: [
                      { label: '1回のみ', value: 0 },
                      { label: '2〜3回', value: 0 },
                      { label: '4〜5回', value: 0 },
                      { label: '6回以上', value: 0 }
                    ]
                  });
                }
              } else {
                // No bookings found
                setRepeatCustomerData({
                  repeatRate: 0,
                  averageVisits: 0,
                  distribution: [
                    { label: '1回のみ', value: 0 },
                    { label: '2〜3回', value: 0 },
                    { label: '4〜5回', value: 0 },
                    { label: '6回以上', value: 0 }
                  ]
                });
              }
            } catch (error) {
              console.error("Error calculating repeat customer data:", error);
              setRepeatCustomerData({
                repeatRate: 0,
                averageVisits: 0,
                distribution: [
                  { label: '1回のみ', value: 0 },
                  { label: '2〜3回', value: 0 },
                  { label: '4〜5回', value: 0 },
                  { label: '6回以上', value: 0 }
                ]
              });
            }
          } else {
            // No bookings for current month
            setMonthlyBookings(0);
            setMonthlySales(0);
            setSalesChange(0);
            setBookingsChange(0);
            setBookingData([]);
            setRevenueData([]);
            setRepeatCustomerData({
              repeatRate: 0,
              averageVisits: 0,
              distribution: [
                { label: '1回のみ', value: 0 },
                { label: '2〜3回', value: 0 },
                { label: '4〜5回', value: 0 },
                { label: '6回以上', value: 0 }
              ]
            });
          }
        }
      }
      
      // Try to fetch age distribution from customer_age_distribution
      try {
        const { data: ageData, error: ageError } = await supabase
          .from('customer_age_distribution' as any)
          .select('*')
          .eq('store_id', user.id);
          
        if (ageError) {
          console.error("Error fetching age distribution:", ageError);
          setAgeDistribution([]);
        } else if (ageData && ageData.length > 0) {
          // Format for chart
          const formattedAgeData = ageData.map((item: any) => ({
            age: item.age_group || 'Unknown',
            count: item.count || 0
          }));
          
          setAgeDistribution(formattedAgeData);
        } else {
          setAgeDistribution([]);
        }
      } catch (error) {
        console.error("Error fetching age distribution:", error);
        setAgeDistribution([]);
      }
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

  const hasData = monthlySales > 0 || monthlyBookings > 0 || therapistCount > 0 || courseCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">店舗ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">店舗の現状と統計情報</p>
        </div>
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
    </div>
  );
};

export default StoreAdminDashboard;
