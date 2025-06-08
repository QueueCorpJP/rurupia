import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, FileText, Heart, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  ArrowRight,
  BarChart3,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const TherapistDashboard = () => {
  const [therapistData, setTherapistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bookings: {
      pending: 0,
      confirmed: 0,
      total: 0,
      today: 0
    },
    messages: {
      unread: 0,
      total: 0
    },
    posts: 0,
    followers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTherapistData();
  }, []);

  const fetchTherapistData = async () => {
    try {
      // If refreshing, set refresh state but keep existing data visible
      if (isRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ユーザー情報の取得に失敗しました');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Get therapist profile
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', user.id)
        .single();

      if (therapistError) {
        console.error('Error fetching therapist:', therapistError);
        toast.error('セラピスト情報の取得に失敗しました');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      setTherapistData(therapistData);

      // Get booking stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count pending requests
      const { count: pendingCount, error: pendingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user.id)
        .eq('status', 'pending');

      // Count confirmed bookings
      const { count: confirmedCount, error: confirmedError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user.id)
        .eq('status', 'confirmed');

      // Count total bookings
      const { count: totalCount, error: totalError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user.id);

      // Count today's bookings
      const { count: todayCount, error: todayError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user.id)
        .gte('date', today.toISOString())
        .lt('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

      // Fetch recent bookings with user info
      const { data: recentBookingsData, error: recentBookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('therapist_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      let recentBookingsWithProfiles = [];
      if (recentBookingsData && recentBookingsData.length > 0) {
        // Get all unique user IDs from the bookings
        const userIds = recentBookingsData.map(booking => booking.user_id).filter(Boolean);
        
        // Create a map to store profiles by ID
        let profilesMap = new Map();
        
        if (userIds.length > 0) {
          // Fetch profiles for all user IDs
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, nickname, email, avatar_url')
            .in('id', userIds);

          if (profilesError) {
            console.error('Error fetching user profiles:', profilesError);
          } else if (profilesData) {
            // Create a map of profiles by ID for easy lookup
            profilesData.forEach(profile => {
              profilesMap.set(profile.id, profile);
            });
          }
        }

        // Combine booking data with profile data
        recentBookingsWithProfiles = recentBookingsData.map(booking => {
          const profile = profilesMap.get(booking.user_id) || {};
          return {
            ...booking,
            profiles: {
              nickname: profile.nickname,
              email: profile.email,
              avatar_url: profile.avatar_url
            }
          };
        });
      }

      // Get message stats
      const { count: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      const { count: totalMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`);

      // Get post count
      const { count: postsCount, error: postsError } = await supabase
        .from('therapist_posts')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user.id);

      // Get followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('followed_therapists')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user.id);

      // Update stats
      setStats({
        bookings: {
          pending: pendingCount || 0,
          confirmed: confirmedCount || 0,
          total: totalCount || 0,
          today: todayCount || 0
        },
        messages: {
          unread: unreadCount || 0,
          total: totalMessages || 0
        },
        posts: postsCount || 0,
        followers: followersCount || 0
      });

      if (recentBookingsWithProfiles.length > 0) {
        setRecentBookings(recentBookingsWithProfiles);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTherapistData();
  };

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
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full overflow-hidden">
            {therapistData?.image_url ? (
              <img 
                src={therapistData.image_url} 
                alt={therapistData?.name || 'セラピスト'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(therapistData?.name || 'セラピスト').charAt(0)}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">
            ようこそ、{therapistData?.name || 'セラピスト'}さん
          </h1>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本日の予約</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookings.today}</div>
              <p className="text-xs text-muted-foreground">
                合計予約数: {stats.bookings.total}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">新規リクエスト</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookings.pending}</div>
              <p className="text-xs text-muted-foreground">
                確定済み: {stats.bookings.confirmed}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未読メッセージ</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages.unread}</div>
              <p className="text-xs text-muted-foreground">
                合計メッセージ: {stats.messages.total}
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
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">フォロワー</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.followers}</div>
              <p className="text-xs text-muted-foreground">
                あなたをフォロー中
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
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  予約がありません
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {booking.profiles?.nickname || booking.profiles?.email || '予約者'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'pending' ? '承認待ち' :
                           booking.status === 'confirmed' ? '確定' :
                           booking.status === 'completed' ? '完了' :
                           'キャンセル'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(booking.date), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </div>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {booking.location || '場所未指定'}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 text-center">
                    <a href="/therapist-bookings" className="text-primary hover:underline text-sm">
                      すべての予約を表示
                    </a>
                  </div>
                </div>
              )}
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
