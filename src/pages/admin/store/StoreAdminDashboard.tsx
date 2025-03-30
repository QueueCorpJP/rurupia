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
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Dashboard data interface
interface DashboardData {
  ageDistribution: Array<{ age: string; count: number }>;
  monthlyCustomerData: Array<{ month: string; newCustomers: number; returningCustomers: number }>;
  popularBookingTimes: Array<{ time: string; count: number }>;
  therapistPerformance: Array<{ therapistName: string; bookingsCount: number; rating: number }>;
}

// Empty dashboard data
const emptyDashboardData: DashboardData = {
  ageDistribution: [],
  monthlyCustomerData: [],
  popularBookingTimes: [],
  therapistPerformance: []
};

const fetchDashboardData = async (storeId: string): Promise<DashboardData> => {
  try {
    console.log("Fetching dashboard data for store:", storeId);
    
    // Get age distribution data
    const { data: ageData, error: ageError } = await supabase
      .from('customer_age_distribution' as any)
      .select('age_group, count')
      .eq('store_id', storeId);
    
    if (ageError) {
      console.error("Error fetching age distribution:", ageError);
    }
    
    // Get monthly customer data
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('monthly_customer_data' as any)
      .select('month, year, new_customers, returning_customers')
      .eq('store_id', storeId)
      .order('year', { ascending: true })
      .order('month', { ascending: true });
    
    if (monthlyError) {
      console.error("Error fetching monthly data:", monthlyError);
    }
    
    // Get popular booking times
    const { data: popularTimesData, error: timesError } = await supabase
      .from('popular_booking_times' as any)
      .select('time_slot, bookings_count')
      .eq('store_id', storeId)
      .order('recorded_date', { ascending: false })
      .limit(10);
    
    if (timesError) {
      console.error("Error fetching booking times:", timesError);
    }
    
    // Get therapist performance data
    const { data: therapistData, error: therapistError } = await supabase
      .from('therapist_performance' as any)
      .select('therapist_id, bookings_count, rating')
      .eq('store_id', storeId)
      .order('recorded_date', { ascending: false });
    
    if (therapistError) {
      console.error("Error fetching therapist data:", therapistError);
    }
    
    // Get therapist information to map IDs to names
    let therapistIds: string[] = [];
    if (therapistData && therapistData.length > 0) {
      therapistIds = therapistData.map((t: any) => t.therapist_id);
    }
    
    const { data: therapists, error: therapistNameError } = await supabase
      .from('therapists')
      .select('id, name')
      .in('id', therapistIds.length > 0 ? therapistIds : ['no-matching-id']);
    
    if (therapistNameError) {
      console.error("Error fetching therapist names:", therapistNameError);
    }
    
    // Process age distribution data
    const ageDistribution = ageData && ageData.length > 0
      ? ageData.map((item: any) => ({ age: item.age_group, count: item.count }))
      : [];
    
    // Process monthly customer data
    const monthlyCustomerData = monthlyData && monthlyData.length > 0
      ? monthlyData.map((item: any) => ({
          month: `${item.year}/${item.month}`,
          newCustomers: item.new_customers,
          returningCustomers: item.returning_customers
        }))
      : [];
    
    // Process popular booking times
    const popularBookingTimes = popularTimesData && popularTimesData.length > 0
      ? popularTimesData.map((item: any) => ({
          time: item.time_slot,
          count: item.bookings_count
        }))
      : [];
    
    // Process therapist performance data
    const therapistsMap = new Map(therapists?.map((t: any) => [t.id, t.name]) || []);
    
    const therapistPerformance = therapistData && therapistData.length > 0 && therapists
      ? therapistData.map((item: any) => ({
          therapistName: therapistsMap.get(item.therapist_id) || 'Unknown',
          bookingsCount: item.bookings_count,
          rating: item.rating
        }))
      : [];
    
    // If there's no performance data, fetch basic therapist info with ratings
    if (therapistPerformance.length === 0 && therapistIds.length > 0) {
      try {
        const { data: basicTherapistData, error: basicTherapistError } = await supabase
          .from('therapists')
          .select('id, name, rating, reviews')
          .in('id', therapistIds);
        
        if (!basicTherapistError && basicTherapistData && basicTherapistData.length > 0) {
          return {
            ageDistribution,
            monthlyCustomerData,
            popularBookingTimes,
            therapistPerformance: basicTherapistData.map((t: any) => ({
              therapistName: t.name,
              bookingsCount: 0, // No booking count data available
              rating: t.rating,
              reviews: t.reviews
            }))
          };
        }
      } catch (error) {
        console.error("Error fetching basic therapist data:", error);
      }
    }
      
    return {
      ageDistribution,
      monthlyCustomerData,
      popularBookingTimes,
      therapistPerformance
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return emptyDashboardData;
  }
};

const StoreAdminDashboard = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!storeId) {
        setError("Store ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await fetchDashboardData(storeId);
        setDashboardData(data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data");
        toast.error("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [storeId]);
  
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">エラーが発生しました</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  // Get summary data for cards
  const totalNewCustomers = dashboardData.monthlyCustomerData.reduce(
    (sum, month) => sum + month.newCustomers, 0
  );
  
  const totalReturningCustomers = dashboardData.monthlyCustomerData.reduce(
    (sum, month) => sum + month.returningCustomers, 0
  );
  
  const totalBookings = dashboardData.popularBookingTimes.reduce(
    (sum, slot) => sum + slot.count, 0
  );
  
  const therapistCount = dashboardData.therapistPerformance.length;
  
  const hasData = totalNewCustomers > 0 || totalReturningCustomers > 0 || 
                  totalBookings > 0 || therapistCount > 0 ||
                  dashboardData.ageDistribution.length > 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">店舗ダッシュボード</h1>
        <p className="text-muted-foreground">店舗の現在の状況とパフォーマンスの概要</p>
      </div>
      
      {!hasData && (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-800">
          <h3 className="font-bold mb-2">データがありません</h3>
          <p>現在表示できるデータがありません。新しい予約や顧客データが追加されると、ここに統計情報が表示されます。</p>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={<Users className="h-5 w-5" />}
          title="新規顧客"
          value={totalNewCustomers.toString()}
        />
        <DashboardCard
          icon={<Users className="h-5 w-5" />}
          title="リピーター"
          value={totalReturningCustomers.toString()}
        />
        <DashboardCard
          icon={<Calendar className="h-5 w-5" />}
          title="予約総数"
          value={totalBookings.toString()}
        />
        <DashboardCard
          icon={<Store className="h-5 w-5" />}
          title="セラピスト数"
          value={therapistCount.toString()}
        />
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Customer Chart */}
        <Card>
          <CardHeader>
            <CardTitle>月次顧客データ</CardTitle>
            <CardDescription>新規顧客とリピーターの推移</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.monthlyCustomerData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={dashboardData.monthlyCustomerData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newCustomers" name="新規顧客" fill="#8884d8" />
                    <Bar dataKey="returningCustomers" name="リピーター" fill="#82ca9d" />
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
        
        {/* Age Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>年齢層分布</CardTitle>
            <CardDescription>顧客の年齢層分析</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.ageDistribution.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={dashboardData.ageDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="人数" fill="#ffc658" />
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
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Popular Booking Times */}
        <Card>
          <CardHeader>
            <CardTitle>人気予約時間帯</CardTitle>
            <CardDescription>時間帯別の予約数</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.popularBookingTimes.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={dashboardData.popularBookingTimes}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="予約数" fill="#82ca9d" />
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
        
        {/* Therapist Performance */}
        <Card>
          <CardHeader>
            <CardTitle>セラピストパフォーマンス</CardTitle>
            <CardDescription>セラピスト別の予約数と評価</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.therapistPerformance.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.therapistPerformance.map((therapist, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{therapist.therapistName}</span>
                      <span className="text-sm text-muted-foreground">
                        {therapist.rating > 0 
                          ? `${Number(therapist.rating).toFixed(1)} ⭐️`
                          : <span className="text-gray-400">未評価</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm min-w-[50px]">予約数:</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full" 
                          style={{ 
                            width: `${dashboardData.therapistPerformance.length > 0 && Math.max(...dashboardData.therapistPerformance.map(t => t.bookingsCount)) > 0
                              ? (therapist.bookingsCount / Math.max(...dashboardData.therapistPerformance.map(t => t.bookingsCount))) * 100
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-sm min-w-[40px] text-right">{therapist.bookingsCount}</div>
                    </div>
                  </div>
                ))}
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