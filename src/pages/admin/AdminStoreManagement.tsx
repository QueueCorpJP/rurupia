
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { useToast } from '@/hooks/use-toast';
import { LineChart } from '@/components/admin/LineChart';
import { Calendar, Clock, Users, DollarSign, CalendarCheck2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Sample data for reservations
const reservationData = [
  { 
    id: '17400602369690x10443888571296700',
    date: '2024/02/19 00:00',
    userName: 'yossii',
    therapist: 'ユウ',
    status: '確定',
    price: '¥34,509'
  },
  { 
    id: '17400602369671x83975436689411700',
    date: '2024/08/31 00:00',
    userName: 'mrisbridgeri',
    therapist: 'ユウ',
    status: '承諾待ち',
    price: '¥11,490'
  },
  { 
    id: '17400602369660x35846984141201360',
    date: '2024/05/29 00:00',
    userName: 'bmenath',
    therapist: 'よしひろ',
    status: '確定',
    price: '¥14,975'
  },
  { 
    id: '17400602369625x79880486353400040',
    date: '2024/06/15 00:00',
    userName: 'gtremouletg',
    therapist: 'ラン',
    status: '承諾待ち',
    price: '¥21,700'
  },
  { 
    id: '17400602369610x91711504723438670',
    date: '2024/04/01 00:00',
    userName: 'sscanlanf',
    therapist: 'ラン',
    status: '確定',
    price: '¥26,350'
  },
  { 
    id: '17400602368959x83700249696888300',
    date: '2024/03/23 00:00',
    userName: 'triquete',
    therapist: 'よしひろ',
    status: '確定',
    price: '¥23,795'
  },
  { 
    id: '17400602368680x10080262468082424',
    date: '2024/11/08 00:00',
    userName: 'dsinnottd',
    therapist: 'ラン',
    status: '承諾待ち',
    price: '¥20,885'
  },
  { 
    id: '17400602368657x33091301705574483',
    date: '2024/05/28 00:00',
    userName: 'swildec',
    therapist: 'ラン',
    status: 'キャンセル',
    price: '¥28,172'
  },
  { 
    id: '17400602368640x72234661221465720',
    date: '2024/06/24 00:00',
    userName: 'simesonb',
    therapist: 'ユウ',
    status: 'キャンセル',
    price: '¥22,929'
  },
];

// Sample data for therapists
const therapistData = [
  {
    name: 'ユウ',
    schedule: '0:00～6:00',
    reservations: 3,
    totalSales: '¥68,928',
    status: '在籍中'
  },
  {
    name: 'ラン',
    schedule: '20:00～6:00',
    reservations: 10,
    totalSales: '¥157,493',
    status: '在籍中'
  },
  {
    name: 'よしひろ',
    schedule: '22:00～8:00',
    reservations: 7,
    totalSales: '¥135,878',
    status: '在籍中'
  }
];

// Sample data for inquiries
const inquiryData = [
  {
    date: 'Feb 22, 2025 3:45 pm',
    userName: 'yossii',
    type: '予約関連',
    status: '対応中',
    content: '予約したセラピストのスケジュールを変更できますか？'
  }
];

// Sample sort options
const reservationSortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '確定のみ', value: 'confirmed' },
  { label: '承諾待ちのみ', value: 'pending' },
  { label: 'キャンセルのみ', value: 'cancelled' },
];

const therapistSortOptions = [
  { label: '在籍順', value: 'active' },
  { label: '予約数順', value: 'reservations' },
  { label: '売上高順', value: 'sales' },
];

const inquirySortOptions = [
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '対応中のみ', value: 'in-progress' },
  { label: '完了のみ', value: 'completed' },
];

// Sales data for chart
const salesData = [
  { date: '2024年 9月', value: 65000 },
  { date: '2024年 10月', value: 55000 },
  { date: '2024年 11月', value: 75000 },
  { date: '2024年 12月', value: 68000 },
  { date: '2025年 1月', value: 120000 },
  { date: '2025年 2月', value: 50000 },
  { date: '2025年 3月', value: 10000 },
];

const AdminStoreManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Handle status change action
  const handleStatusChange = (reservation: any, newStatus: string) => {
    toast({
      title: "ステータス変更",
      description: `予約ID: ${reservation.id} のステータスを「${newStatus}」に変更しました`,
    });
  };
  
  // Define columns for each table
  const reservationColumns = [
    { key: 'id', label: '予約ID' },
    { key: 'date', label: '日時' },
    { key: 'userName', label: 'ユーザー名' },
    { key: 'therapist', label: 'セラピスト' },
    { 
      key: 'status', 
      label: 'ステータス',
      render: (value: string) => <StatusBadge status={value} />
    },
    { key: 'price', label: '料金' },
  ];
  
  const therapistColumns = [
    { key: 'name', label: 'セラピスト名' },
    { key: 'schedule', label: 'スケジュール' },
    { key: 'reservations', label: '予約数' },
    { key: 'totalSales', label: '売上合計' },
    { 
      key: 'status', 
      label: 'ステータス',
      render: (value: string) => (
        <div className="flex items-center">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
          {value}
        </div>
      )
    },
  ];
  
  const inquiryColumns = [
    { key: 'date', label: '日時' },
    { key: 'userName', label: 'ユーザー名' },
    { key: 'type', label: '種類' },
    { key: 'status', label: 'ステータス' },
    { key: 'content', label: '内容' },
  ];
  
  // Define action menu items for each table
  const reservationActionMenuItems = [
    { 
      label: '詳細を見る', 
      onClick: (reservation: any) => {
        toast({
          title: "予約詳細",
          description: `予約ID: ${reservation.id} の詳細を表示します`,
        });
      } 
    },
    { 
      label: '確定する', 
      onClick: (reservation: any) => {
        if (reservation.status !== '確定') {
          handleStatusChange(reservation, '確定');
        }
      } 
    },
    { 
      label: 'キャンセルする', 
      onClick: (reservation: any) => {
        if (reservation.status !== 'キャンセル') {
          handleStatusChange(reservation, 'キャンセル');
        }
      } 
    },
  ];
  
  const therapistActionMenuItems = [
    { 
      label: '詳細を見る', 
      onClick: (therapist: any) => {
        toast({
          title: "セラピスト詳細",
          description: `${therapist.name}の詳細を表示します`,
        });
      } 
    },
    { 
      label: 'スケジュール編集', 
      onClick: (therapist: any) => {
        toast({
          title: "スケジュール編集",
          description: `${therapist.name}のスケジュールを編集します`,
        });
      } 
    },
    { 
      label: '休止する', 
      onClick: (therapist: any) => {
        toast({
          variant: "destructive",
          title: "休止確認",
          description: `${therapist.name}を休止状態にしますか？`,
        });
      } 
    },
  ];
  
  const inquiryActionMenuItems = [
    { 
      label: '詳細を見る', 
      onClick: (inquiry: any) => {
        toast({
          title: "お問い合わせ詳細",
          description: `${inquiry.userName}からのお問い合わせ詳細を表示します`,
        });
      } 
    },
    { 
      label: '返信する', 
      onClick: (inquiry: any) => {
        toast({
          title: "返信",
          description: `${inquiry.userName}に返信します`,
        });
      } 
    },
    { 
      label: '完了にする', 
      onClick: (inquiry: any) => {
        toast({
          title: "ステータス変更",
          description: `お問い合わせを完了状態に変更しました`,
        });
      } 
    },
  ];
  
  // Filter functions
  const [filteredReservations, setFilteredReservations] = useState(reservationData);
  const [filteredTherapists, setFilteredTherapists] = useState(therapistData);
  const [filteredInquiries, setFilteredInquiries] = useState(inquiryData);
  
  const handleReservationSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredReservations(reservationData);
      return;
    }
    
    const filtered = reservationData.filter(
      reservation => 
        reservation.id.includes(term) || 
        reservation.userName.toLowerCase().includes(term.toLowerCase()) ||
        reservation.therapist.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredReservations(filtered);
  };
  
  const handleTherapistSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredTherapists(therapistData);
      return;
    }
    
    const filtered = therapistData.filter(
      therapist => therapist.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredTherapists(filtered);
  };
  
  const handleInquirySearch = (term: string) => {
    if (!term.trim()) {
      setFilteredInquiries(inquiryData);
      return;
    }
    
    const filtered = inquiryData.filter(
      inquiry => 
        inquiry.userName.toLowerCase().includes(term.toLowerCase()) ||
        inquiry.content.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredInquiries(filtered);
  };
  
  // Sort functions
  const handleReservationSort = (value: string) => {
    let sorted = [...reservationData];
    
    switch(value) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'confirmed':
        sorted = sorted.filter(r => r.status === '確定');
        break;
      case 'pending':
        sorted = sorted.filter(r => r.status === '承諾待ち');
        break;
      case 'cancelled':
        sorted = sorted.filter(r => r.status === 'キャンセル');
        break;
      default:
        break;
    }
    
    setFilteredReservations(sorted);
  };
  
  const handleTherapistSort = (value: string) => {
    let sorted = [...therapistData];
    
    switch(value) {
      case 'reservations':
        sorted.sort((a, b) => b.reservations - a.reservations);
        break;
      case 'sales':
        sorted.sort((a, b) => {
          const salesA = parseInt(a.totalSales.replace(/[^0-9]/g, ''));
          const salesB = parseInt(b.totalSales.replace(/[^0-9]/g, ''));
          return salesB - salesA;
        });
        break;
      default:
        break;
    }
    
    setFilteredTherapists(sorted);
  };
  
  const handleInquirySort = (value: string) => {
    let sorted = [...inquiryData];
    
    switch(value) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'in-progress':
        sorted = sorted.filter(i => i.status === '対応中');
        break;
      case 'completed':
        sorted = sorted.filter(i => i.status === '完了');
        break;
      default:
        break;
    }
    
    setFilteredInquiries(sorted);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">店舗管理ページ</h1>
      </div>
      
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex">
          <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
          <TabsTrigger value="reservations">予約管理</TabsTrigger>
          <TabsTrigger value="therapists">セラピスト管理</TabsTrigger>
          <TabsTrigger value="inquiries">問い合わせ・クレーム</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              icon={<DollarSign className="h-5 w-5" />}
              title="今月の売上"
              value="¥1,245,000"
              change={{ value: "+20.1%", positive: true }}
            />
            <DashboardCard
              icon={<CalendarCheck2 className="h-5 w-5" />}
              title="本日の予約数"
              value="245"
              change={{ value: "+4", positive: true }}
            />
            <DashboardCard
              icon={<Users className="h-5 w-5" />}
              title="セラピスト数"
              value="15"
              change={{ value: "+3", positive: true }}
            />
            <DashboardCard
              icon={<Calendar className="h-5 w-5" />}
              title="平均評価"
              value="4.8"
              change={{ value: "+0.2", positive: true }}
            />
          </div>
          
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold text-lg mb-6">売上推移</h3>
            <div className="h-[300px]">
              <LineChart 
                data={salesData} 
                xAxisKey="date" 
                yAxisKey="value" 
                strokeColor="#0ea5e9"
              />
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-4">最近の予約</h3>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">予約ID</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">日時</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">料金</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservationData.slice(0, 3).map((reservation, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-2 py-3 text-sm">{reservation.id.substring(0, 10)}...</td>
                        <td className="px-2 py-3 text-sm">{reservation.date}</td>
                        <td className="px-2 py-3 text-sm">{reservation.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-4">最近のお問い合わせ</h3>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">ユーザー</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">日時</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground">ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiryData.map((inquiry, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-2 py-3 text-sm">{inquiry.userName}</td>
                        <td className="px-2 py-3 text-sm">{inquiry.date}</td>
                        <td className="px-2 py-3 text-sm">{inquiry.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-6">
          <h2 className="text-2xl font-bold">予約管理</h2>
          
          <DataTable 
            columns={reservationColumns}
            data={filteredReservations}
            searchPlaceholder="IDやユーザー名で検索"
            sortOptions={reservationSortOptions}
            onSearchChange={handleReservationSearch}
            onSortChange={handleReservationSort}
            actionMenuItems={reservationActionMenuItems}
            onRowClick={(reservation) => {
              toast({
                title: "予約詳細",
                description: `予約ID: ${reservation.id} の詳細を表示します`,
              });
            }}
          />
        </TabsContent>
        
        {/* Therapists Tab */}
        <TabsContent value="therapists" className="space-y-6">
          <h2 className="text-2xl font-bold">セラピスト管理</h2>
          
          <DataTable 
            columns={therapistColumns}
            data={filteredTherapists}
            searchPlaceholder="セラピスト名で検索"
            sortOptions={therapistSortOptions}
            onSearchChange={handleTherapistSearch}
            onSortChange={handleTherapistSort}
            actionMenuItems={therapistActionMenuItems}
          />
        </TabsContent>
        
        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-6">
          <h2 className="text-2xl font-bold">お問い合わせ・クレーム</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/2">
              <Input 
                placeholder="ユーザーIDで検索" 
                className="pl-4"
                onChange={(e) => handleInquirySearch(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-1/2">
              <Input 
                placeholder="セラピストIDで検索" 
                className="pl-4"
              />
            </div>
          </div>
          
          <DataTable 
            columns={inquiryColumns}
            data={filteredInquiries}
            sortOptions={inquirySortOptions}
            onSortChange={handleInquirySort}
            actionMenuItems={inquiryActionMenuItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStoreManagement;
