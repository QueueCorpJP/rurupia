
import { useState, useEffect } from 'react';
import { LineChart } from '@/components/admin/LineChart';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import icons
import { Users, CalendarClock, Star, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    monthlySales: { value: 0, change: 0 },
    users: { value: 0, change: 0 },
    bookings: { value: 0, change: 0 },
    rating: { value: 0, change: 0 }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState([]);
  const [therapistData, setTherapistData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .order('recorded_date', { ascending: false });
        
      if (analyticsError) throw analyticsError;
      
      // Process analytics data
      const statsMap = {
        monthly_page_views: { key: 'monthlySales', icon: Eye },
        monthly_users: { key: 'users', icon: Users },
        monthly_bookings: { key: 'bookings', icon: CalendarClock },
        average_rating: { key: 'rating', icon: Star }
      };
      
      const newStats = { ...stats };
      
      analyticsData.forEach(item => {
        const mapping = statsMap[item.metric_name];
        if (mapping) {
          newStats[mapping.key] = {
            value: item.metric_value,
            change: item.percentage_change || 0
          };
        }
      });
      
      setStats(newStats);
      
      // 2. Fetch recent bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          date,
          status,
          price,
          therapists(name),
          services(name)
        `)
        .order('date', { ascending: false })
        .limit(10);
        
      if (bookingsError) throw bookingsError;
      
      const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        therapist: booking.therapists?.name || 'Unknown',
        service: booking.services?.name || 'Custom Session',
        date: new Date(booking.date).toLocaleDateString('ja-JP'),
        time: new Date(booking.date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        price: `¥${booking.price.toLocaleString()}`,
        status: booking.status
      }));
      
      setBookingData(formattedBookings);
      
      // 3. Fetch therapist ratings
      const { data: therapists, error: therapistsError } = await supabase
        .from('therapists')
        .select('id, name, rating, reviews')
        .order('rating', { ascending: false })
        .limit(5);
        
      if (therapistsError) throw therapistsError;
      
      setTherapistData(therapists);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="月間閲覧数"
          value={stats.monthlySales.value.toLocaleString()}
          change={stats.monthlySales.change}
          icon={<Eye className="h-5 w-5" />}
          loading={isLoading}
        />
        <DashboardCard 
          title="ユーザー数"
          value={stats.users.value.toLocaleString()}
          change={stats.users.change}
          icon={<Users className="h-5 w-5" />}
          loading={isLoading}
        />
        <DashboardCard 
          title="月間予約数"
          value={stats.bookings.value.toLocaleString()}
          change={stats.bookings.change}
          icon={<CalendarClock className="h-5 w-5" />}
          loading={isLoading}
        />
        <DashboardCard 
          title="平均評価"
          value={stats.rating.value.toFixed(1)}
          change={stats.rating.change}
          icon={<Star className="h-5 w-5" />}
          loading={isLoading}
          format="rating"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-2 lg:col-span-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">月間予約数推移</h3>
              <div className="h-[300px] w-full mt-4">
                <LineChart 
                  data={[
                    {
                      name: '6月',
                      value: 87,
                    },
                    {
                      name: '7月',
                      value: 96,
                    },
                    {
                      name: '8月',
                      value: 118,
                    },
                    {
                      name: '9月',
                      value: 124,
                    },
                    {
                      name: '10月',
                      value: 128,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">セラピスト評価</h3>
              <div className="mt-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin h-6 w-6 rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : (
                  therapistData.map((therapist) => (
                    <div key={therapist.id} className="flex items-center justify-between pb-2 border-b">
                      <span className="text-sm font-medium">{therapist.name}</span>
                      <div className="flex items-center">
                        <span className="text-amber-500 mr-1">★</span>
                        <span className="text-sm font-medium">{therapist.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground ml-1">({therapist.reviews})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">最近の予約</h3>
            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="animate-spin h-6 w-6 rounded-full border-b-2 border-primary"></div>
                </div>
              ) : bookingData.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">予約データがありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">セラピスト</th>
                        <th className="text-left py-3 px-4 font-medium">サービス</th>
                        <th className="text-left py-3 px-4 font-medium">日付</th>
                        <th className="text-left py-3 px-4 font-medium">時間</th>
                        <th className="text-left py-3 px-4 font-medium">価格</th>
                        <th className="text-left py-3 px-4 font-medium">ステータス</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingData.map((booking) => (
                        <tr key={booking.id} className="border-b">
                          <td className="py-3 px-4">{booking.therapist}</td>
                          <td className="py-3 px-4">{booking.service}</td>
                          <td className="py-3 px-4">{booking.date}</td>
                          <td className="py-3 px-4">{booking.time}</td>
                          <td className="py-3 px-4">{booking.price}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              booking.status === '完了' ? 'bg-green-100 text-green-800' :
                              booking.status === 'キャンセル' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
