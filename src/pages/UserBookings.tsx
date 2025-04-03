
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { BookingRequest } from '@/utils/types';
import { Calendar, Clock, MapPin, DollarSign, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// Define a new interface that matches our Supabase booking structure
interface SupabaseBooking {
  id: string;
  therapist_id: string;
  user_id: string;
  date: string;
  ["status therapist"]?: string;
  ["status store"]?: string;
  notes: string;
  location: string;
  price: number;
  created_at: string;
  therapist_name: string;
  meeting_method?: string;
}

const UserBookings = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Map status from English to Japanese
  const mapStatus = (statusTherapist: string | null | undefined, statusStore: string | null | undefined): "承認待ち" | "確定" | "キャンセル" | "完了" => {
    // Default to pending if both are null/undefined
    if (!statusTherapist && !statusStore) return "承認待ち";
    
    // Priority order: cancelled > completed > confirmed > pending
    if (statusTherapist === 'cancelled' || statusStore === 'cancelled') return "キャンセル";
    if (statusTherapist === 'completed' || statusStore === 'completed') return "完了";
    if (statusTherapist === 'confirmed' || statusStore === 'confirmed') return "確定";
    
    // Default to pending for any other status
    return "承認待ち";
  };
  
  // Function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Extract meeting method from location or notes
  const extractMeetingMethod = (booking: SupabaseBooking): string => {
    const location = booking.location?.toLowerCase() || '';
    const notes = booking.notes?.toLowerCase() || '';
    
    if (booking.meeting_method) {
      return booking.meeting_method;
    } else if (location.includes('ホテル') || notes.includes('ホテル')) {
      return 'hotel';
    } else if (location.includes('自宅') || notes.includes('自宅')) {
      return 'home';
    } else if (location.includes('待ち合わせ') || notes.includes('待ち合わせ')) {
      return 'meetup';
    } else {
      return 'meetup'; // Default to meetup
    }
  };
  
  // Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('ログインしていません。ログインしてください。');
          setIsLoading(false);
          return;
        }
        
        // Fetch bookings for current user
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            therapists:therapist_id (name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching bookings:', error);
          setError('予約データの取得に失敗しました');
          setIsLoading(false);
          return;
        }
        
        console.log('Bookings data:', data);
        
        // Transform database bookings to match BookingRequest interface
        const transformedBookings: BookingRequest[] = data.map((booking: any) => ({
          id: booking.id,
          clientName: user.email || 'User',
          requestTime: formatDate(booking.date),
          servicePrice: booking.price,
          serviceLocation: booking.location,
          meetingMethod: extractMeetingMethod(booking),
          status: mapStatus(booking["status therapist"], booking["status store"]),
          notes: booking.notes || '',
          therapistId: booking.therapist_id,
          therapistName: booking.therapists?.name || 'セラピスト'
        }));
        
        setBookingRequests(transformedBookings);
      } catch (error) {
        console.error('Error in fetchBookings:', error);
        setError('予約データの取得中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const pendingBookings = bookingRequests.filter(req => req.status === "承認待ち");
  const confirmedBookings = bookingRequests.filter(req => req.status === "確定");
  const completedBookings = bookingRequests.filter(req => req.status === "完了");
  const cancelledBookings = bookingRequests.filter(req => req.status === "キャンセル");
  
  const handleCancelRequest = async (id: string) => {
    try {
      // Update both status fields to cancelled
      const { error } = await supabase
        .from('bookings')
        .update({ 
          ["status therapist"]: 'cancelled',
          ["status store"]: 'cancelled'
        } as any)
        .eq('id', id);
        
      if (error) {
        console.error('Error cancelling booking:', error);
        toast.error('予約のキャンセルに失敗しました');
        return;
      }
      
      // Update local state
      setBookingRequests(bookingRequests.map(req => 
        req.id === id ? { ...req, status: "キャンセル" } : req
      ));
      
      toast.success('予約リクエストをキャンセルしました');
    } catch (error) {
      console.error('Error handling cancel request:', error);
      toast.error('エラーが発生しました。後でもう一度お試しください。');
    }
  };
  
  const renderBookingCard = (booking: BookingRequest) => {
    return (
      <div key={booking.id} className="bg-background rounded-lg shadow-sm p-4 mb-4 border">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{booking.therapistName || 'セラピスト'}へのリクエスト</h3>
              <StatusBadge status={booking.status || '未定義'} />
            </div>
            
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.requestTime}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.servicePrice.toLocaleString()}円</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="truncate">{booking.serviceLocation}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{
                  booking.meetingMethod === "meetup" ? "待ち合わせ" : 
                  booking.meetingMethod === "hotel" ? "ホテル" : 
                  booking.meetingMethod === "home" ? "自宅" : 
                  booking.meetingMethod
                }</span>
              </div>
            </div>
            
            {booking.notes && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p className="font-medium">備考:</p>
                <p>{booking.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        {booking.status === "承認待ち" && (
          <div className="mt-4">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => handleCancelRequest(booking.id)}
            >
              リクエストをキャンセル
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">データを読み込み中...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>再読み込み</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">予約履歴</h1>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="pending" className="relative">
              承認待ち
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              確定済み
              {confirmedBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {confirmedBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">完了</TabsTrigger>
            <TabsTrigger value="cancelled">キャンセル</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-0">
            <div className="space-y-4">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  承認待ちの予約リクエストはありません
                </div>
              ) : (
                pendingBookings.map(renderBookingCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="confirmed" className="mt-0">
            <div className="space-y-4">
              {confirmedBookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  確定済みの予約はありません
                </div>
              ) : (
                confirmedBookings.map(renderBookingCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <div className="space-y-4">
              {completedBookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  完了した予約はありません
                </div>
              ) : (
                completedBookings.map(renderBookingCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-0">
            <div className="space-y-4">
              {cancelledBookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  キャンセルした予約はありません
                </div>
              ) : (
                cancelledBookings.map(renderBookingCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "承認待ち":
        return "bg-amber-100 text-amber-800";
      case "確定":
        return "bg-green-100 text-green-800";
      case "完了":
        return "bg-blue-100 text-blue-800";
      case "キャンセル":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default UserBookings;
