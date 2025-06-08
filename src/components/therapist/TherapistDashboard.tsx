import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  BarChart,
  Edit,
} from 'lucide-react';

const TherapistDashboard = () => {
  const [therapistData, setTherapistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bookings: 0,
    messages: 0,
    reviews: 0,
    followers: 0,
    earnings: 0,
  });
  
  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Fetch therapist data
        const { data: therapist, error: therapistError } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (therapistError) {
          throw therapistError;
        }
        
        setTherapistData(therapist);
        
        // Fetch booking count
        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('therapist_id', user.id);
          
        // Fetch messages count
        const { count: messagesCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id);
          
        // Fetch reviews count
        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('therapist_id', user.id);
          
        // Fetch followers count
        const { count: followersCount } = await supabase
          .from('followers')
          .select('id', { count: 'exact', head: true })
          .eq('therapist_id', user.id);
          
        // Set stats
        setStats({
          bookings: bookingsCount || 0,
          messages: messagesCount || 0,
          reviews: reviewsCount || 0,
          followers: followersCount || 0,
          earnings: 0, // Placeholder for future earnings functionality
        });
      } catch (error) {
        console.error('Error fetching therapist data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTherapistData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Link to="/therapist/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            設定
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">予約数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.bookings}</div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">メッセージ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.messages}</div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">レビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.reviews}</div>
              <Star className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">フォロワー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.followers}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール完成度</CardTitle>
            <CardDescription>
              より多くのセラピスト情報を登録してプロフィールを充実させましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">プロフィール完成度</span>
                  <span className="text-sm font-medium">70%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  完成度を上げるために以下の情報を追加してください:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>健康関連の資格情報</li>
                  <li>写真ギャラリー</li>
                  <li>専門分野についての詳細</li>
                </ul>
              </div>
              
              <div className="pt-2">
                <Link to="/therapist/profile">
                  <Button variant="outline" className="w-full">プロフィールを編集</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>
              すぐに利用できる主要な機能にアクセス
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/therapist/availability">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>予約可能時間</span>
                </Button>
              </Link>
              
              <Link to="/therapist/messages">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>メッセージ</span>
                </Button>
              </Link>
              
              <Link to="/therapist/posts">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Activity className="h-6 w-6" />
                  <span>ポスト</span>
                </Button>
              </Link>
              
              <Link to="/therapist/reviews">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Star className="h-6 w-6" />
                  <span>レビュー</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ</CardTitle>
          <CardDescription>
            過去7日間のアクティビティ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[200px] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">近日公開予定の機能です</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistDashboard; 