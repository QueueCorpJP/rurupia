
import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, FileText } from 'lucide-react';

const TherapistDashboard = () => {
  const [therapistData, setTherapistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bookings: 0,
    pendingRequests: 0,
    messages: 0,
    posts: 0
  });

  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Fetch therapist data
        const { data: therapist, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error && !error.message.includes('No rows found')) {
          console.error('Error fetching therapist data:', error);
          return;
        }
        
        setTherapistData(therapist || { id: user.id, name: 'セラピスト' });
        
        // In a real app, you would fetch actual statistics
        // This is a mock implementation for demonstration
        setStats({
          bookings: Math.floor(Math.random() * 10),
          pendingRequests: Math.floor(Math.random() * 5),
          messages: Math.floor(Math.random() * 15),
          posts: Math.floor(Math.random() * 3)
        });
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTherapistData();
  }, []);

  if (loading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">読み込み中...</span>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          ようこそ、{therapistData?.name || 'セラピスト'}さん
        </h1>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">予約数</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookings}</div>
              <p className="text-xs text-muted-foreground">
                今月の予約数
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">リクエスト</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                未対応のリクエスト
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">メッセージ</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">
                未読メッセージ
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">投稿</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.posts}</div>
              <p className="text-xs text-muted-foreground">
                公開中の記事
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>最近の予約</CardTitle>
              <CardDescription>
                直近の予約情報
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10 text-muted-foreground">
              予約がありません
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>未読メッセージ</CardTitle>
              <CardDescription>
                返信が必要なメッセージ
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10 text-muted-foreground">
              未読メッセージはありません
            </CardContent>
          </Card>
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistDashboard;
