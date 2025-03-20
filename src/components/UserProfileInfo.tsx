
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, Heart } from 'lucide-react';

const UserProfileInfo = ({ userId }: { userId: string }) => {
  const [followedCount, setFollowedCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get count of followed therapists
        const { count: followedCount, error: followedError } = await supabase
          .from('followed_therapists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (!followedError) {
          setFollowedCount(followedCount || 0);
        }
        
        // Get count of bookings
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (!bookingsError) {
          setBookingsCount(bookingsCount || 0);
        }
        
        // Get count of unread messages
        const { count: messagesCount, error: messagesError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', userId)
          .eq('is_read', false);
        
        if (!messagesError) {
          setMessagesCount(messagesCount || 0);
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Heart className="mr-2 h-5 w-5 text-pink-500" />
            フォロー中のセラピスト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : followedCount}</p>
              <p className="text-muted-foreground text-sm">フォロー中</p>
            </div>
            <Link to="/therapists">
              <Button variant="outline" size="sm">
                セラピストを探す
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            予約履歴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : bookingsCount}</p>
              <p className="text-muted-foreground text-sm">予約数</p>
            </div>
            <Link to="/user-bookings">
              <Button variant="outline" size="sm">
                履歴を見る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
            メッセージ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : messagesCount}</p>
              <p className="text-muted-foreground text-sm">
                未読メッセージ
                {messagesCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    新着
                  </Badge>
                )}
              </p>
            </div>
            <Link to="/messages">
              <Button variant="outline" size="sm">
                メッセージを見る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileInfo;
