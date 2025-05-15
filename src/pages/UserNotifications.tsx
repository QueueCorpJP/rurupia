import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bell, CheckCircle2, Calendar, MessageSquare, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  data: any;
}

const UserNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }

      // Try to fetch notifications
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setNotifications(data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        toast.error("通知の取得に失敗しました");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setMarkingAsRead(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      toast.success("通知を既読にしました");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("通知の更新に失敗しました");
    } finally {
      setMarkingAsRead(false);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAsRead(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update the local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast.success("すべての通知を既読にしました");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("通知の更新に失敗しました");
    } finally {
      setMarkingAsRead(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'booking':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">通知を読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Breadcrumb 
          items={[
            { label: 'マイページ', href: '/user-profile' },
            { label: '通知', href: '/notifications', current: true }
          ]}
        />
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">通知</h1>
          
          {notifications.some(n => !n.read) && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead} 
              disabled={markingAsRead}
              className="flex items-center"
            >
              {markingAsRead ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              すべて既読にする
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">通知はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            新着
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 my-2">{notification.message}</p>
                    
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        disabled={markingAsRead}
                        className="mt-2"
                      >
                        {markingAsRead ? (
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-2" />
                        )}
                        既読にする
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserNotifications; 