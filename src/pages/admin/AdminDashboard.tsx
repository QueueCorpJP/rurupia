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
      
      // Get monthly views count
      const { count: monthlyViews, error: viewsError } = await supabaseAdmin
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO);

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
      
      // Generate dummy chart data for demonstration
      const accessData = generateChartData(30, 500, 1500);
      const registrationsData = generateChartData(30, 5, 20);
      
      setAccessData(accessData);
      setRegistrationsData(registrationsData);
      
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
  
  // Helper function to generate chart data
  const generateChartData = (days: number, min: number, max: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        value: Math.floor(Math.random() * (max - min + 1)) + min
      });
    }
    
    return data;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="アカウント数" 
          value={stats.totalAccounts.toString()} 
          change={{ 
            value: `前月比 ${stats.accountsGrowth > 0 ? '+' : ''}${stats.accountsGrowth}%`, 
            positive: stats.accountsGrowth > 0 
          }}
          icon={<Users className="h-4 w-4" />} 
          isLoading={isLoading}
        />
        <DashboardCard 
          title="月間PV" 
          value={stats.monthlyViews.toString()} 
          change={{ 
            value: `前月比 ${stats.viewsGrowth > 0 ? '+' : ''}${stats.viewsGrowth}%`, 
            positive: stats.viewsGrowth > 0 
          }}
          icon={<BarChart3 className="h-4 w-4" />} 
          isLoading={isLoading}
        />
        <DashboardCard 
          title="月間予約数" 
          value={stats.monthlyBookings.toString()} 
          change={{ 
            value: `前月比 ${stats.bookingsGrowth > 0 ? '+' : ''}${stats.bookingsGrowth}%`, 
            positive: stats.bookingsGrowth > 0 
          }}
          icon={<Calendar className="h-4 w-4" />} 
          isLoading={isLoading}
        />
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart 
          title="アクセス推移" 
          data={accessData} 
          color="#0ea5e9"
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
