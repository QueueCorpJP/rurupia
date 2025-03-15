
import { DashboardCard } from '@/components/admin/DashboardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, AreaChartIcon, Store, Users, BookOpen, Calendar } from 'lucide-react';
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

// サンプルデータ
const revenueData = [
  { date: '2025/01', revenue: 450000 },
  { date: '2025/02', revenue: 520000 },
  { date: '2025/03', revenue: 480000 },
  { date: '2025/04', revenue: 600000 },
  { date: '2025/05', revenue: 580000 },
  { date: '2025/06', revenue: 650000 },
];

const bookingData = [
  { day: '月', bookings: 8 },
  { day: '火', bookings: 5 },
  { day: '水', bookings: 7 },
  { day: '木', bookings: 10 },
  { day: '金', bookings: 12 },
  { day: '土', bookings: 18 },
  { day: '日', bookings: 15 },
];

const ageDistribution = [
  { age: '10代', count: 5 },
  { age: '20代', count: 25 },
  { age: '30代', count: 35 },
  { age: '40代', count: 20 },
  { age: '50代', count: 10 },
  { age: '60代以上', count: 5 },
];

const StoreAdminDashboard = () => {
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
          value="¥650,000"
          change={{ value: "+12%", positive: true }}
        />
        <DashboardCard
          icon={<Calendar className="h-5 w-5" />}
          title="今月の予約数"
          value="128"
          change={{ value: "+5%", positive: true }}
        />
        <DashboardCard
          icon={<Users className="h-5 w-5" />}
          title="セラピスト数"
          value="12"
          change={{ value: "+2", positive: true }}
        />
        <DashboardCard
          icon={<BookOpen className="h-5 w-5" />}
          title="コース数"
          value="8"
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
                  <p className="text-2xl font-bold">65%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">平均利用回数</p>
                  <p className="text-2xl font-bold">3.2回</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">リピート回数分布</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm min-w-[80px]">1回のみ</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div className="bg-blue-500 h-4 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <div className="text-sm min-w-[40px] text-right">35%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm min-w-[80px]">2〜3回</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div className="bg-blue-500 h-4 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <div className="text-sm min-w-[40px] text-right">40%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm min-w-[80px]">4〜5回</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div className="bg-blue-500 h-4 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <div className="text-sm min-w-[40px] text-right">15%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm min-w-[80px]">6回以上</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div className="bg-blue-500 h-4 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <div className="text-sm min-w-[40px] text-right">10%</div>
                  </div>
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
