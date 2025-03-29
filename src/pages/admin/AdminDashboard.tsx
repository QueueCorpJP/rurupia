import { useEffect, useState } from 'react';
import { Users, BarChart3, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { LineChart } from '@/components/admin/LineChart';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface DashboardStats {
  totalAccounts: number;
  monthlyViews: number;
  monthlyBookings: number;
  accountsGrowth: number;
  viewsGrowth: number;
  bookingsGrowth: number;
}

// Chart data for the LineChart component
interface ChartDataPoint {
  name: string;
  value: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdminAuthenticated, initializeAdminSession } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAccounts: 0,
    monthlyViews: 0,
    monthlyBookings: 0,
    accountsGrowth: 0,
    viewsGrowth: 0,
    bookingsGrowth: 0
  });
  const [accessData, setAccessData] = useState<ChartDataPoint[]>([]);
  const [registrationsData, setRegistrationsData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    const initializeAndFetch = async () => {
      await initializeAdminSession();
      fetchDashboardData();
    };

    initializeAndFetch();
  }, [isAdminAuthenticated]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get current date and 30 days ago
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Format dates for queries
      const nowISO = now.toISOString();
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
      
      // Use adminClient for all queries to bypass RLS
      // Get total accounts
      const { count: totalAccounts, error: accountsError } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (accountsError) throw accountsError;
      
      // Get monthly views count - ONLY FOR INDEX PAGE
      const { count: monthlyViews, error: viewsError } = await supabaseAdmin
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('page', '/') // Only count index page views
        .gte('view_date', thirtyDaysAgoISO);

      if (viewsError) throw viewsError;
      
      // Get monthly bookings count
      const { count: monthlyBookings, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO);

      if (bookingsError) throw bookingsError;
      
      // Calculate growth (dummy data for now)
      const accountsGrowth = 5.2;
      const viewsGrowth = 12.8;
      const bookingsGrowth = 8.5;
      
      setStats({
        totalAccounts: totalAccounts || 0,
        monthlyViews: monthlyViews || 0,
        monthlyBookings: monthlyBookings || 0,
        accountsGrowth,
        viewsGrowth,
        bookingsGrowth
      });
      
      // Get real page view data by day
      const { data: pageViewsRawData, error: pageViewsDataError } = await supabaseAdmin
        .from('page_views')
        .select('view_date')
        .eq('page', '/') // Only count index page views
        .gte('view_date', thirtyDaysAgoISO);
        
      if (pageViewsDataError) throw pageViewsDataError;
      
      // Get real registration data by day
      const { data: registrationsRawData, error: registrationsDataError } = await supabaseAdmin
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgoISO);
        
      if (registrationsDataError) throw registrationsDataError;
      
      // Generate chart data based on real data
      const generatedAccessData = generateChartDataFromEvents(
        pageViewsRawData.map(item => new Date(item.view_date)),
        thirtyDaysAgo,
        now
      );
      
      const generatedRegistrationsData = generateChartDataFromEvents(
        registrationsRawData.map(item => new Date(item.created_at)),
        thirtyDaysAgo,
        now
      );
      
      setAccessData(generatedAccessData);
      setRegistrationsData(generatedRegistrationsData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'データの取得に失敗しました',
        description: 'しばらくしてからもう一度お試しください',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to generate chart data from real events
  const generateChartDataFromEvents = (
    eventDates: Date[],
    startDate: Date,
    endDate: Date
  ): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    
    // Create a map of date strings to counts
    const countsByDate = new Map<string, number>();
    
    // Initialize all dates in range with 0 counts
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = `${current.getMonth() + 1}/${current.getDate()}`;
      countsByDate.set(dateKey, 0);
      current.setDate(current.getDate() + 1);
    }
    
    // Count events for each date
    eventDates.forEach(date => {
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
      const currentCount = countsByDate.get(dateKey) || 0;
      countsByDate.set(dateKey, currentCount + 1);
    });
    
    // Convert map to array of ChartDataPoints with timestamps for sorting
    const dataWithTimestamps = Array.from(countsByDate.entries()).map(([dateKey, count]) => {
      const [month, day] = dateKey.split('/').map(Number);
      // Use the current year for consistent sorting
      const timestamp = new Date(new Date().getFullYear(), month - 1, day).getTime();
      return { name: dateKey, value: count, timestamp };
    });
    
    // Sort by timestamp
    dataWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove timestamp property for final data
    return dataWithTimestamps.map(({ name, value }) => ({ name, value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">アプリケーション全体の統計とアクティビティ</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          icon={<Users />}
          title="アカウント数"
          value={stats.totalAccounts}
          change={{
            value: `+${stats.accountsGrowth}%`,
            positive: true
          }}
          isLoading={isLoading}
        />
        <DashboardCard
          icon={<BarChart3 />}
          title="月間PV"
          value={stats.monthlyViews}
          change={{
            value: `+${stats.viewsGrowth}%`,
            positive: true
          }}
          isLoading={isLoading}
        />
        <DashboardCard
          icon={<Calendar />}
          title="月間予約数"
          value={stats.monthlyBookings}
          change={{
            value: `+${stats.bookingsGrowth}%`,
            positive: true
          }}
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart 
          title="アクセス推移" 
          data={accessData}
          color="#22c55e"
          isLoading={isLoading}
        />
        <LineChart 
          title="新規登録推移" 
          data={registrationsData}
          color="#8b5cf6"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
