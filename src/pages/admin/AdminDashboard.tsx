
import { Users, BarChart3, Calendar, Star } from 'lucide-react';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { LineChart } from '@/components/admin/LineChart';

// Sample data for charts
const accessData = [
  { name: '2024年 9月', value: 400 },
  { name: '2024年 10月', value: 800 },
  { name: '2024年 11月', value: 1200 },
  { name: '2024年 12月', value: 1600 },
  { name: '2025年 1月', value: 2400 },
  { name: '2025年 2月', value: 1800 },
  { name: '2025年 3月', value: 1200 },
];

const registrationsData = [
  { name: '2024年 9月', value: 5 },
  { name: '2024年 10月', value: 8 },
  { name: '2024年 11月', value: 12 },
  { name: '2024年 12月', value: 15 },
  { name: '2025年 1月', value: 25 },
  { name: '2025年 2月', value: 22 },
  { name: '2025年 3月', value: 18 },
];

const AdminDashboard = () => {
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
          value="14,532" 
          change={{ value: "先月比 +20.1%", positive: true }}
        />
        <DashboardCard 
          icon={<BarChart3 className="h-5 w-5" />} 
          title="月間PV" 
          value="573,245" 
          change={{ value: "昨日比 +14%", positive: true }}
        />
        <DashboardCard 
          icon={<Calendar className="h-5 w-5" />} 
          title="月間予約数" 
          value="2,845" 
          change={{ value: "先月比 +3%", positive: true }}
        />
        <DashboardCard 
          icon={<Star className="h-5 w-5" />} 
          title="平均評価" 
          value="4.8" 
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
