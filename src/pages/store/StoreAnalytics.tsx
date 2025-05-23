import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, LineChart, BarChart, Loader2, AlertCircle } from 'lucide-react';
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
  Sector
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Type for Tooltip Props
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#FF6B6B'];

interface AgeDistribution {
  name: string;
  value: number;
}

interface AgeDistributionResponse {
  age_group: string;
  count: number;
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
  hasRating: boolean;
}

interface TherapistPerformanceResponse {
  therapist_id: string;
  therapist_name: string;
  bookings_count: number;
  rating: number;
  has_rating: boolean;
}

// Add these type declarations to fix TypeScript errors
// Declare the RPC functions so TypeScript recognizes them
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: string,
      params?: object,
      options?: {
        head?: boolean;
        count?: null | 'exact' | 'planned' | 'estimated';
      }
    ): PromiseLike<{ data: T; error: Error | null }>;
  }
}

// Custom Pie Chart Active Shape for better visualization
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`${value}人 (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm">
        <p className="font-medium">{`${payload[0].name}`}</p>
        <p className="text-gray-700">{`人数: ${payload[0].value}人`}</p>
        <p className="text-gray-700">{`割合: ${(payload[0].payload.percent * 100).toFixed(0)}%`}</p>
      </div>
    );
  }
  return null;
};

// Empty data display component
const NoDataDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="h-[300px] flex flex-col items-center justify-center">
    <Alert className="max-w-md mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>データはありません</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
    <Button onClick={onRetry} variant="outline" size="sm">再試行</Button>
  </div>
);

const StoreAnalytics = () => {
  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<{[key: string]: string}>({});
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [ageData, setAgeData] = useState<AgeDistribution[]>([]);
  const [monthlyCustomerData, setMonthlyCustomerData] = useState<MonthlyCustomerData[]>([]);
  const [popularTimesData, setPopularTimesData] = useState<PopularBookingTime[]>([]);
  const [therapistPerformanceData, setTherapistPerformanceData] = useState<TherapistPerformance[]>([]);
  
  // Track the active section in the pie chart
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Convert period to days for SQL queries
  const getPeriodDays = (periodValue: string): number => {
    switch(periodValue) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  };
  
  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiErrors({});

      // Get current user (store)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setStoreId(user.id);

      // Calculate days for SQL queries based on selected period
      const periodDays = getPeriodDays(period);
      
      // Use RPC to call the functions instead of querying tables directly
      // This avoids RLS permission issues
      
      // 1. Fetch age distribution data using RPC function
      const { data: ageDistributionRaw, error: ageError } = await supabase
        .rpc('get_customer_age_distribution', { 
          input_store_id: user.id,
          days_back: periodDays
        });

      if (ageError) {
        console.error("Error fetching age distribution data:", ageError);
        setApiErrors(prev => ({ ...prev, ageData: ageError.message }));
        setAgeData([]);
      } else if (ageDistributionRaw && Array.isArray(ageDistributionRaw)) {
        // Safely cast the data and validate it has the expected structure
        const ageDistribution = ageDistributionRaw as unknown as AgeDistributionResponse[];
        
        // Format data for chart
        const formattedAgeData = ageDistribution.map(item => ({
          name: item.age_group,
          value: item.count
        }));
        
        setAgeData(formattedAgeData);
      } else {
        setAgeData([]);
      }

      // 2. Fetch monthly customer data using RPC function
      const { data: monthlyDataRaw, error: monthlyError } = await supabase
        .rpc('get_monthly_customer_data', { 
          input_store_id: user.id,
          days_back: periodDays
        });
        
      if (monthlyError) {
        console.error("Error fetching monthly customer data:", monthlyError);
        setApiErrors(prev => ({ ...prev, monthlyData: monthlyError.message }));
        setMonthlyCustomerData([]);
      } else if (monthlyDataRaw && Array.isArray(monthlyDataRaw)) {
        // Safely cast the data
        const monthlyData = monthlyDataRaw as unknown as MonthlyCustomerData[];
        setMonthlyCustomerData(monthlyData);
      } else {
        setMonthlyCustomerData([]);
      }

      // 3. Fetch popular booking times using RPC function
      const { data: popularTimesRaw, error: timesError } = await supabase
        .rpc('get_popular_booking_times', { 
          input_store_id: user.id,
          days_back: periodDays
        });
        
      if (timesError) {
        console.error("Error fetching popular booking times data:", timesError);
        setApiErrors(prev => ({ ...prev, popularTimes: timesError.message }));
        setPopularTimesData([]);
      } else if (popularTimesRaw && Array.isArray(popularTimesRaw)) {
        // Safely cast the data
        const popularTimes = popularTimesRaw as unknown as PopularBookingTime[];
        setPopularTimesData(popularTimes);
      } else {
        setPopularTimesData([]);
      }

      // 4. Fetch therapist performance data using RPC function
      const { data: therapistPerfRaw, error: therapistError } = await supabase
        .rpc('get_therapist_performance', { 
          input_store_id: user.id,
          days_back: periodDays
        });
        
      if (therapistError) {
        console.error("Error fetching therapist performance data:", therapistError);
        setApiErrors(prev => ({ ...prev, therapistPerf: therapistError.message }));
        setTherapistPerformanceData([]);
      } else if (therapistPerfRaw && Array.isArray(therapistPerfRaw)) {
        // Safely cast the data
        const therapistPerf = therapistPerfRaw as unknown as TherapistPerformanceResponse[];
        
        // Convert from API format to component format
        const formattedPerformance = therapistPerf.map(perf => ({
          therapist_id: perf.therapist_id,
          therapist_name: perf.therapist_name,
          bookings_count: perf.bookings_count,
          rating: perf.rating,
          hasRating: perf.has_rating
        }));
        setTherapistPerformanceData(formattedPerformance);
      } else {
        setTherapistPerformanceData([]);
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

  // Pie chart event handlers
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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
            onClick={() => fetchAnalyticsData()}
          >
            再試行
          </Button>
        </div>
      </div>
    );
  }

  const hasApiErrors = Object.keys(apiErrors).length > 0;

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

      {hasApiErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>データ取得エラー</AlertTitle>
          <AlertDescription>
            一部のデータが正しく取得できませんでした。詳細はコンソールをご確認ください。
          </AlertDescription>
        </Alert>
      )}

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
                  {apiErrors.ageData ? (
                    <NoDataDisplay 
                      message="データの取得中にエラーが発生しました。後ほど再度お試しください。" 
                      onRetry={fetchAnalyticsData} 
                    />
                  ) : ageData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">この期間のデータがありません</p>
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
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={onPieEnter}
                          >
                            {ageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
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
                  {apiErrors.monthlyData ? (
                    <NoDataDisplay 
                      message="データの取得中にエラーが発生しました。後ほど再度お試しください。" 
                      onRetry={fetchAnalyticsData} 
                    />
                  ) : monthlyCustomerData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">この期間のデータがありません</p>
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
                {apiErrors.popularTimes ? (
                  <NoDataDisplay 
                    message="データの取得中にエラーが発生しました。後ほど再度お試しください。" 
                    onRetry={fetchAnalyticsData} 
                  />
                ) : popularTimesData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">この期間のデータがありません</p>
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
                {apiErrors.therapistPerf ? (
                  <NoDataDisplay 
                    message="データの取得中にエラーが発生しました。後ほど再度お試しください。" 
                    onRetry={fetchAnalyticsData} 
                  />
                ) : therapistPerformanceData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">この期間のデータがありません</p>
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
                                {therapist.hasRating ? (
                                  <>
                                    <span className="mr-1">{Number(therapist.rating).toFixed(1)}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                    </svg>
                                  </>
                                ) : (
                                  <span className="text-gray-400">未評価</span>
                                )}
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
