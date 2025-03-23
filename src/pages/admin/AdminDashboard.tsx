
import { useState, useEffect } from 'react';
import { Users, BarChart3, Calendar, Star } from 'lucide-react';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { LineChart } from '@/components/admin/LineChart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAccounts: '0',
    monthlyViews: '0',
    monthlyBookings: '0',
    averageRating: '0'
  });
  const [accessData, setAccessData] = useState([]);
  const [registrationsData, setRegistrationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch total accounts count
        const { count: accountsCount, error: accountsError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (accountsError) throw accountsError;
        
        // Fetch bookings count
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });
          
        if (bookingsError) throw bookingsError;
        
        // Fetch average rating
        const { data: therapistsData, error: therapistsError } = await supabase
          .from('therapists')
          .select('rating');
          
        if (therapistsError) throw therapistsError;
        
        // Calculate average rating
        const totalRating = therapistsData.reduce((sum, therapist) => sum + Number(therapist.rating), 0);
        const avgRating = therapistsData.length > 0 ? (totalRating / therapistsData.length).toFixed(1) : '0.0';
        
        // Update stats
        setStats({
          totalAccounts: String(accountsCount || 0),
          monthlyViews: '573,245', // Could be tracked in a separate analytics table
          monthlyBookings: String(bookingsCount || 0),
          averageRating: avgRating
        });

        // Sample data for charts - this would ideally come from a real analytics table
        setAccessData([
          { name: '2024年 9月', value: 400 },
          { name: '2024年 10月', value: 800 },
          { name: '2024年 11月', value: 1200 },
          { name: '2024年 12月', value: 1600 },
          { name: '2025年 1月', value: 2400 },
          { name: '2025年 2月', value: 1800 },
          { name: '2025年 3月', value: 1200 },
        ]);

        setRegistrationsData([
          { name: '2024年 9月', value: 5 },
          { name: '2024年 10月', value: 8 },
          { name: '2024年 11月', value: 12 },
          { name: '2024年 12月', value: 15 },
          { name: '2025年 1月', value: 25 },
          { name: '2025年 2月', value: 22 },
          { name: '2025年 3月', value: 18 },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">管理者ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">サイトの統計情報と活動の概要</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          icon={<Users className="h-5 w-5" />} 
          title="総アカウント数" 
          value={stats.totalAccounts} 
          change={{ value: "先月比 +20.1%", positive: true }}
        />
        <DashboardCard 
          icon={<BarChart3 className="h-5 w-5" />} 
          title="月間PV" 
          value={stats.monthlyViews} 
          change={{ value: "昨日比 +14%", positive: true }}
        />
        <DashboardCard 
          icon={<Calendar className="h-5 w-5" />} 
          title="月間予約数" 
          value={stats.monthlyBookings} 
          change={{ value: "先月比 +3%", positive: true }}
        />
        <DashboardCard 
          icon={<Star className="h-5 w-5" />} 
          title="平均評価" 
          value={stats.averageRating} 
          change={{ value: "先月比 +0.2", positive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <LineChart 
          title="アクセス数" 
          data={accessData} 
          color="#0ea5e9"
        />
        <LineChart 
          title="ユーザー登録数" 
          data={registrationsData} 
          color="#8b5cf6"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
