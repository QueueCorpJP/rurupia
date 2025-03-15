
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, LineChart, BarChart } from 'lucide-react';
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

// サンプルデータ
const ageData = [
  { name: '10代', value: 5 },
  { name: '20代', value: 30 },
  { name: '30代', value: 35 },
  { name: '40代', value: 20 },
  { name: '50代', value: 8 },
  { name: '60代以上', value: 2 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#FF6B6B'];

const monthlyCustomerData = [
  { month: '1月', new: 28, returning: 42 },
  { month: '2月', new: 32, returning: 45 },
  { month: '3月', new: 35, returning: 50 },
  { month: '4月', new: 30, returning: 55 },
  { month: '5月', new: 38, returning: 58 },
  { month: '6月', new: 42, returning: 60 },
];

const popularTimesData = [
  { time: '9:00', bookings: 5 },
  { time: '10:00', bookings: 8 },
  { time: '11:00', bookings: 12 },
  { time: '12:00', bookings: 10 },
  { time: '13:00', bookings: 7 },
  { time: '14:00', bookings: 9 },
  { time: '15:00', bookings: 14 },
  { time: '16:00', bookings: 18 },
  { time: '17:00', bookings: 15 },
  { time: '18:00', bookings: 12 },
  { time: '19:00', bookings: 8 },
  { time: '20:00', bookings: 6 },
];

const therapistPerformanceData = [
  { name: '佐藤 愛', bookings: 45, rating: 4.9 },
  { name: '田中 健', bookings: 32, rating: 4.7 },
  { name: '鈴木 美優', bookings: 28, rating: 4.8 },
  { name: '高橋 誠', bookings: 18, rating: 4.5 },
  { name: '渡辺 さくら', bookings: 5, rating: 4.6 },
];

const StoreAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分析・統計</h1>
          <p className="text-muted-foreground mt-2">顧客データと予約状況の分析</p>
        </div>
        <Select defaultValue="month">
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
                      <Bar dataKey="new" name="新規顧客" fill="#8884d8" />
                      <Bar dataKey="returning" name="リピーター" fill="#82ca9d" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
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
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart
                    data={popularTimesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}件`} />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      name="予約数" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
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
                        <td className="py-3">{therapist.name}</td>
                        <td className="text-center">{therapist.bookings}</td>
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
                              style={{ width: `${Math.min(100, (therapist.bookings / 50) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreAnalytics;
