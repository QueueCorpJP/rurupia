import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, LineChart, BarChart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#FF6B6B'];

interface AgeDistribution {
  name: string;
  value: number;
}

interface MonthlyCustomerData {
  month: string;
  new_customers: number;
  returning_customers: number;
}

interface PopularBookingTime {
  time_slot: string;
  bookings_count: number;
}

interface TherapistPerformance {
  therapist_id: string;
  therapist_name: string;
  bookings_count: number;
  rating: number;
}

// Mock data for development until the database tables are created
const mockAgeData: AgeDistribution[] = [
  { name: '10代', value: 5 },
  { name: '20代', value: 30 },
  { name: '30代', value: 35 },
  { name: '40代', value: 20 },
  { name: '50代', value: 8 },
  { name: '60代以上', value: 2 }
];

const mockMonthlyData: MonthlyCustomerData[] = [
  { month: '1月', new_customers: 28, returning_customers: 42 },
  { month: '2月', new_customers: 32, returning_customers: 45 },
  { month: '3月', new_customers: 35, returning_customers: 50 },
  { month: '4月', new_customers: 30, returning_customers: 55 },
  { month: '5月', new_customers: 38, returning_customers: 58 },
  { month: '6月', new_customers: 42, returning_customers: 60 }
];

const mockPopularTimesData: PopularBookingTime[] = [
  { time_slot: '9:00', bookings_count: 5 },
  { time_slot: '10:00', bookings_count: 8 },
  { time_slot: '11:00', bookings_count: 12 },
  { time_slot: '12:00', bookings_count: 10 },
  { time_slot: '13:00', bookings_count: 7 },
  { time_slot: '14:00', bookings_count: 9 },
  { time_slot: '15:00', bookings_count: 14 },
  { time_slot: '16:00', bookings_count: 18 },
  { time_slot: '17:00', bookings_count: 15 },
  { time_slot: '18:00', bookings_count: 12 },
  { time_slot: '19:00', bookings_count: 8 },
  { time_slot: '20:00', bookings_count: 6 }
];

const mockTherapistData: TherapistPerformance[] = [
  { therapist_id: '1', therapist_name: '山田 花子', bookings_count: 45, rating: 4.8 },
  { therapist_id: '2', therapist_name: '田中 優子', bookings_count: 38, rating: 4.9 },
  { therapist_id: '3', therapist_name: '佐藤 美咲', bookings_count: 42, rating: 4.7 },
  { therapist_id: '4', therapist_name: '鈴木 健太', bookings_count: 25, rating: 4.6 },
  { therapist_id: '5', therapist_name: '高橋 直人', bookings_count: 33, rating: 4.7 }
];

const StoreAnalytics = () => {
  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [ageData, setAgeData] = useState<AgeDistribution[]>([]);
  const [monthlyCustomerData, setMonthlyCustomerData] = useState<MonthlyCustomerData[]>([]);
  const [popularTimesData, setPopularTimesData] = useState<PopularBookingTime[]>([]);
  const [therapistPerformanceData, setTherapistPerformanceData] = useState<TherapistPerformance[]>([]);
  
  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Get current user (store)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setStoreId(user.id);

      // Try to fetch real data, but fall back to mock data if tables don't exist yet
      try {
        // Check if the required tables exist
        const { data: tables, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .in('table_name', ['customer_age_distribution', 'monthly_customer_data', 'popular_booking_times', 'therapist_performance'])
          .eq('table_schema', 'public');
          
        if (tableError || !tables || tables.length < 4) {
          // Tables don't exist yet, use mock data
          console.log("Analytics tables not found, using mock data");
          setAgeData(mockAgeData);
          setMonthlyCustomerData(mockMonthlyData);
          setPopularTimesData(mockPopularTimesData);
          setTherapistPerformanceData(mockTherapistData);
          return;
        }
          
        // Fetch age distribution data
        const { data: ageDistribution, error: ageError } = await supabase
          .from('customer_age_distribution')
          .select('*')
          .eq('store_id', user.id);

        if (!ageError && ageDistribution) {
          // Format data for chart
          const formattedAgeData = ageDistribution.map(item => ({
            name: item.age_group,
            value: item.count
          }));
          
          setAgeData(formattedAgeData);
        } else {
          setAgeData(mockAgeData);
        }

        // Fetch monthly customer data
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('monthly_customer_data')
          .select('*')
          .eq('store_id', user.id)
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (!monthlyError && monthlyData) {
          setMonthlyCustomerData(monthlyData);
        } else {
          setMonthlyCustomerData(mockMonthlyData);
        }

        // Fetch popular booking times
        const { data: popularTimes, error: timesError } = await supabase
          .from('popular_booking_times')
          .select('*')
          .eq('store_id', user.id)
          .order('time_slot', { ascending: true });

        if (!timesError && popularTimes) {
          setPopularTimesData(popularTimes);
        } else {
          setPopularTimesData(mockPopularTimesData);
        }

        // Fetch therapist performance data
        const { data: therapistPerf, error: therapistError } = await supabase
          .from('therapist_performance')
          .select(`
            id,
            therapist_id,
            bookings_count,
            rating
          `)
          .eq('store_id', user.id);

        if (!therapistError && therapistPerf && therapistPerf.length > 0) {
          // Get therapist profiles to get names
          const therapistIds = therapistPerf.map(t => t.therapist_id);
          
          const { data: therapistProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', therapistIds);
            
          if (!profilesError && therapistProfiles) {
            // Combine data
            const formattedTherapistData = therapistPerf.map(perf => {
              const profile = therapistProfiles.find(p => p.id === perf.therapist_id);
              return {
                therapist_id: perf.therapist_id,
                therapist_name: profile?.name || '名前なし',
                bookings_count: perf.bookings_count,
                rating: perf.rating
              };
            });
            
            setTherapistPerformanceData(formattedTherapistData);
          } else {
            setTherapistPerformanceData(mockTherapistData);
          }
        } else {
          setTherapistPerformanceData(mockTherapistData);
        }
      } catch (error) {
        console.error("Error checking tables or fetching data:", error);
        // If there's any error, fall back to mock data
        setAgeData(mockAgeData);
        setMonthlyCustomerData(mockMonthlyData);
        setPopularTimesData(mockPopularTimesData);
        setTherapistPerformanceData(mockTherapistData);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <h3 className="font-bold">エラーが発生しました</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Note: この機能は現在開発中です。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分析・統計</h1>
          <p className="text-muted-foreground mt-2">顧客データと予約状況の分析</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">過去7日間</SelectItem>
            <SelectItem value="month">過去30日間</SelectItem>
            <SelectItem value="quarter">過去3ヶ月</SelectItem>
            <SelectItem value="year">過去1年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="customers">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customers">顧客分析</TabsTrigger>
            <TabsTrigger value="bookings">予約分析</TabsTrigger>
            <TabsTrigger value="therapists">セラピスト分析</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0">
                    <CardTitle>年齢層分布</CardTitle>
                    <CardDescription>
                      顧客の年齢層の割合
                    </CardDescription>
                  </div>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {ageData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">データがありません</p>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={ageData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {ageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0">
                    <CardTitle>新規・リピーター比率</CardTitle>
                    <CardDescription>
                      月別の新規顧客とリピーター数
                    </CardDescription>
                  </div>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {monthlyCustomerData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">データがありません</p>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart
                          data={monthlyCustomerData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="new_customers" name="新規顧客" fill="#8884d8" />
                          <Bar dataKey="returning_customers" name="リピーター" fill="#82ca9d" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-0">
                  <CardTitle>時間帯別予約数</CardTitle>
                  <CardDescription>
                    時間帯ごとの予約人気度
                  </CardDescription>
                </div>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {popularTimesData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">データがありません</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart
                        data={popularTimesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time_slot" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}件`} />
                        <Line 
                          type="monotone" 
                          dataKey="bookings_count" 
                          name="予約数" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }}
                        />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="therapists" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>セラピスト実績</CardTitle>
                <CardDescription>
                  セラピストごとの予約数と評価
                </CardDescription>
              </CardHeader>
              <CardContent>
                {therapistPerformanceData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">データがありません</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">セラピスト</th>
                          <th className="text-center pb-2">予約数</th>
                          <th className="text-center pb-2">評価</th>
                          <th className="text-right pb-2">予約状況</th>
                        </tr>
                      </thead>
                      <tbody>
                        {therapistPerformanceData.map((therapist, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3">{therapist.therapist_name}</td>
                            <td className="text-center">{therapist.bookings_count}</td>
                            <td className="text-center">
                              <div className="flex items-center justify-center">
                                <span className="mr-1">{therapist.rating}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </td>
                            <td className="text-right">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-primary h-2.5 rounded-full" 
                                  style={{ width: `${Math.min(100, (therapist.bookings_count / 50) * 100)}%` }}
                                ></div>
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
        </Tabs>
      )}
    </div>
  );
};

export default StoreAnalytics;
