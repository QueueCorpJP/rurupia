
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
  const [changes, setChanges] = useState({
    totalAccountsChange: { value: '0%', positive: true },
    monthlyViewsChange: { value: '0%', positive: true },
    monthlyBookingsChange: { value: '0%', positive: true },
    averageRatingChange: { value: '0', positive: true }
  });
  const [accessData, setAccessData] = useState([]);
  const [registrationsData, setRegistrationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch analytics data from the analytics table
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics')
          .select('*')
          .in('metric_name', ['monthly_page_views', 'monthly_users', 'monthly_bookings', 'average_rating']);
        
        if (analyticsError) throw analyticsError;
        
        // Process analytics data
        let analyticsMap = {};
        if (analyticsData) {
          analyticsData.forEach(item => {
            analyticsMap[item.metric_name] = {
              value: item.metric_value,
              change: {
                value: item.percentage_change ? `${item.percentage_change > 0 ? '+' : ''}${item.percentage_change}%` : '0%',
                positive: item.percentage_change > 0
              }
            };
          });
        }

        // Fallback to direct counts if analytics data is missing
        
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
        
        // Fetch page views from the last month
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        const { count: viewsCount, error: viewsError } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('view_date', monthAgo.toISOString());
          
        if (viewsError) throw viewsError;
        
        // Fetch average rating
        const { data: therapistsData, error: therapistsError } = await supabase
          .from('therapists')
          .select('rating');
          
        if (therapistsError) throw therapistsError;
        
        // Calculate average rating
        const totalRating = therapistsData.reduce((sum, therapist) => sum + Number(therapist.rating), 0);
        const avgRating = therapistsData.length > 0 ? (totalRating / therapistsData.length).toFixed(1) : '0.0';
        
        // Update stats - prefer analytics data if available, otherwise use direct counts
        setStats({
          totalAccounts: analyticsMap.monthly_users ? String(analyticsMap.monthly_users.value) : String(accountsCount || 0),
          monthlyViews: analyticsMap.monthly_page_views ? String(analyticsMap.monthly_page_views.value) : String(viewsCount || 0),
          monthlyBookings: analyticsMap.monthly_bookings ? String(analyticsMap.monthly_bookings.value) : String(bookingsCount || 0),
          averageRating: analyticsMap.average_rating ? String(analyticsMap.average_rating.value) : avgRating
        });
        
        // Set change percentages
        setChanges({
          totalAccountsChange: analyticsMap.monthly_users ? analyticsMap.monthly_users.change : { value: '先月比 +20.1%', positive: true },
          monthlyViewsChange: analyticsMap.monthly_page_views ? analyticsMap.monthly_page_views.change : { value: '昨日比 +14%', positive: true },
          monthlyBookingsChange: analyticsMap.monthly_bookings ? analyticsMap.monthly_bookings.change : { value: '先月比 +3%', positive: true },
          averageRatingChange: analyticsMap.average_rating ? analyticsMap.average_rating.change : { value: '先月比 +0.2', positive: true }
        });

        // Fetch page views data for the last 7 months for the chart
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
        
        const { data: viewsChartData, error: viewsChartError } = await supabase
          .from('page_views')
          .select('view_date')
          .gte('view_date', sevenMonthsAgo.toISOString());
          
        if (viewsChartError) throw viewsChartError;
        
        // Process chart data by month
        const accessChartData = processChartData(viewsChartData || [], 'view_date');
        setAccessData(accessChartData);

        // Fetch user registrations data for the last 7 months
        const { data: registrationsChartData, error: registrationsChartError } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', sevenMonthsAgo.toISOString());
          
        if (registrationsChartError) throw registrationsChartError;
        
        // Process registrations chart data
        const registrationsChartProcessed = processChartData(registrationsChartData || [], 'created_at');
        setRegistrationsData(registrationsChartProcessed);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('データの取得に失敗しました');
        
        // Fallback to sample data if there's an error
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
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to process chart data by month
    const processChartData = (data, dateField) => {
      const months = {};
      
      // Group by month
      data.forEach(item => {
        const date = new Date(item[dateField]);
        const monthYear = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
        
        if (!months[monthYear]) {
          months[monthYear] = 0;
        }
        
        months[monthYear]++;
      });
      
      // Convert to array format needed for chart
      const result = Object.entries(months).map(([name, count]) => ({
        name,
        value: count,
      }));
      
      // Sort by date
      result.sort((a, b) => {
        const [yearA, monthA] = a.name.split('年 ');
        const [yearB, monthB] = b.name.split('年 ');
        
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        return parseInt(monthA) - parseInt(monthB);
      });
      
      // If there are fewer than 7 months of data, add empty months
      if (result.length < 7) {
        const currentDate = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentDate);
          date.setMonth(currentDate.getMonth() - i);
          const monthYear = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
          
          if (!months[monthYear]) {
            result.push({
              name: monthYear,
              value: 0,
            });
          }
        }
        
        // Sort again
        result.sort((a, b) => {
          const [yearA, monthA] = a.name.split('年 ');
          const [yearB, monthB] = b.name.split('年 ');
          
          if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
          return parseInt(monthA) - parseInt(monthB);
        });
      }
      
      // Limit to last 7 months
      return result.slice(-7);
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
          change={changes.totalAccountsChange}
        />
        <DashboardCard 
          icon={<BarChart3 className="h-5 w-5" />} 
          title="月間PV" 
          value={stats.monthlyViews} 
          change={changes.monthlyViewsChange}
        />
        <DashboardCard 
          icon={<Calendar className="h-5 w-5" />} 
          title="月間予約数" 
          value={stats.monthlyBookings} 
          change={changes.monthlyBookingsChange}
        />
        <DashboardCard 
          icon={<Star className="h-5 w-5" />} 
          title="平均評価" 
          value={stats.averageRating} 
          change={changes.averageRatingChange}
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
