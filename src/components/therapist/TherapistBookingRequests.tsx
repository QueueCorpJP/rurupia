import { useState, useEffect } from "react";
import { BookingRequest } from "@/utils/types";
import TherapistBookingRequest from "./TherapistBookingRequest";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { sendBookingConfirmationToClient, sendTherapistResponseNotificationToStore, sendBookingRejectionToClient } from "@/utils/notification-service";

interface TherapistBookingRequestsProps {
  therapistId: string;
}

const TherapistBookingRequests = ({ therapistId }: TherapistBookingRequestsProps) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [therapistName, setTherapistName] = useState<string>("セラピスト");
  
  // Helper counters
  const pendingCount = bookingRequests.filter(req => req.status === "承認待ち").length;
  const confirmedCount = bookingRequests.filter(req => req.status === "確定").length;
  const completedCount = bookingRequests.filter(req => req.status === "完了").length;
  const cancelledCount = bookingRequests.filter(req => req.status === "キャンセル").length;

  useEffect(() => {
    console.log("TherapistBookingRequests - therapistId:", therapistId);
    
    if (!therapistId) {
      console.log('No therapist ID provided');
      setIsLoading(false);
      return;
    }

    const fetchBookingRequests = async () => {
      try {
        console.log("Fetching bookings for therapist ID:", therapistId);
        
        // Step 0: Get therapist's name first
        const { data: therapistData, error: therapistError } = await (supabase as any)
          .from('profiles')
          .select('nickname, name')
          .eq('id', therapistId)
          .single();
          
        const fetchedTherapistName = therapistData?.nickname || therapistData?.name || 'セラピスト';
        setTherapistName(fetchedTherapistName);
        console.log("Therapist name:", fetchedTherapistName);
        
        // Step 1: Fetch bookings
        const { data: bookingsData, error: bookingsError } = await (supabase as any)
          .from('bookings')
          .select('*')
          .eq('therapist_id', therapistId)
          .order('date', { ascending: true });

        console.log("Bookings query result:", { bookingsData, bookingsError });

        if (bookingsError) {
          console.error('Error fetching booking requests:', bookingsError);
          toast.error('予約リクエストの取得に失敗しました');
          setIsLoading(false);
          return;
        }

        if (!bookingsData || bookingsData.length === 0) {
          console.log("No bookings found for therapist:", therapistId);
          setBookingRequests([]);
          setIsLoading(false);
          return;
        }

        // Step 2: Fetch all relevant profiles
        const userIds = bookingsData.map(booking => booking.user_id).filter(Boolean);
        console.log("User IDs from bookings:", userIds);
        
        let profilesMap = new Map();
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await (supabase as any)
            .from('profiles')
            .select('id, nickname, email, avatar_url')
            .in('id', userIds);

          console.log("Profiles query result:", { profilesData, profilesError });

          if (profilesError) {
            console.error('Error fetching user profiles:', profilesError);
            // Continue with just the booking data
          } else if (profilesData) {
            // Create a map of profiles by ID for easy lookup
            profilesData.forEach(profile => {
              profilesMap.set(profile.id, profile);
            });
          }
        }

        console.log("Profiles map:", Array.from(profilesMap.entries()));

        // Transform data with profile information when available
        const transformedBookings: BookingRequest[] = bookingsData.map((booking: any) => {
          const profile = profilesMap.get(booking.user_id);
          const bookingDate = new Date(booking.date);
          const transformedBooking = {
            id: booking.id,
            clientName: profile?.nickname || '名前なし',
            clientEmail: profile?.email || undefined,
            clientAvatar: profile?.avatar_url || undefined,
            userId: booking.user_id,
            requestTime: format(bookingDate, 'yyyy年MM月dd日 HH:mm', { locale: ja }),
            originalDate: bookingDate, // Store the original Date object
            servicePrice: booking.price || 0,
            serviceLocation: booking.location || '未定',
            meetingMethod: extractMeetingMethod(booking.notes || ''),
            status: mapStatus(booking["status therapist"] || booking.status), // Use dual status system
            notes: booking.notes || '',
            therapistId: booking.therapist_id,
            therapistName: fetchedTherapistName // Add therapist name for notifications
          };
          return transformedBooking;
        });

        console.log("Transformed bookings:", transformedBookings);

        setBookingRequests(transformedBookings);
        console.log("State updated with bookings:", transformedBookings.length);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in booking requests fetch:', error);
        toast.error('予約リクエストの取得に失敗しました');
        setIsLoading(false);
      }
    };

    fetchBookingRequests();
  }, [therapistId]);

  // Helper function to extract meeting method from notes (logic could be improved)
  const extractMeetingMethod = (notes: string): string => {
    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('ホテル') || lowerNotes.includes('hotel')) return 'hotel';
    if (lowerNotes.includes('自宅') || lowerNotes.includes('home')) return 'home';
    return 'meetup';
  };

  // Helper function to map status from English to Japanese
  const mapStatus = (status: string): "承認待ち" | "確定" | "キャンセル" | "完了" => {
    console.log("Mapping status:", status);
    switch (status) {
      case 'pending': return "承認待ち";
      case 'confirmed': return "確定";
      case 'completed': return "完了";
      case 'cancelled':
      case 'canceled': return "キャンセル";
      default: return "承認待ち";
    }
  };

  const handleStatusChange = async (id: string, newStatus: "承認待ち" | "確定" | "キャンセル" | "完了") => {
    // Map status to English for DB
    let dbStatus = '';
    switch (newStatus) {
      case "承認待ち": dbStatus = 'pending'; break;
      case "確定": dbStatus = 'confirmed'; break;
      case "完了": dbStatus = 'completed'; break;
      case "キャンセル": dbStatus = 'cancelled'; break;
    }

    try {
      // First validate that this booking belongs to this therapist
      const { data: bookingCheck, error: checkError } = await (supabase as any)
        .from('bookings')
        .select('id, therapist_id')
        .eq('id', id);
        
      if (checkError) {
        console.error('Error checking booking:', checkError);
        toast.error('予約の確認に失敗しました');
        return;
      }
      
      const validatedBooking = bookingCheck?.[0];
      if (!validatedBooking || validatedBooking.therapist_id !== therapistId) {
        toast.error('この予約を更新する権限がありません');
        return;
      }
      
      // Update the 'status therapist' column
      const { error } = await (supabase as any)
        .from('bookings')
        .update({ ["status therapist"]: dbStatus } as any)
        .eq('id', id);

      if (error) {
        console.error('Error updating booking therapist status:', error);
        toast.error('ステータスの更新に失敗しました');
        return;
      }

      // Update local state (assuming the component consuming this uses a similar status logic)
      // Might need adjustment depending on how TherapistBookingRequest component handles status display
      setBookingRequests(prev =>
        prev.map(req =>
          req.id === id ? { ...req, status: newStatus } : req
        )
      );

      toast.success('ステータスを更新しました');

      // Send notification to store about therapist response
      const booking = bookingRequests.find(req => req.id === id);
      if (booking && booking.originalDate) {
        try {
          // Get store ID for this therapist
          const { data: storeData, error: storeError } = await (supabase as any)
            .from('store_therapists')
            .select('store_id')
            .eq('therapist_id', therapistId)
            .eq('status', 'active')
            .single();
            
          if (!storeError && storeData) {
            // Notify store about therapist response using the original Date object
            await sendTherapistResponseNotificationToStore(
              storeData.store_id,
              booking.therapistName || therapistName,
              booking.originalDate,
              dbStatus
            );
            
            // Check if both therapist and store have confirmed the booking
            if (dbStatus === 'confirmed') {
              // Get the current booking data to check store status
              const { data: currentBooking, error: bookingError } = await (supabase as any)
                .from('bookings')
                .select('id, user_id, "status store"')
                .eq('id', id)
                .single();
                
              if (!bookingError && currentBooking && currentBooking['status store'] === 'confirmed') {
                // Both therapist and store have confirmed - notify client
                try {
                  const { sendBookingConfirmationToClient } = await import('@/utils/notification-service');
                  
                  await sendBookingConfirmationToClient(
                    currentBooking.user_id,
                    booking.therapistName || therapistName,
                    booking.originalDate
                  );
                  
                  toast.success('お客様に予約確定の通知を送信しました');
                } catch (clientNotifyError) {
                  console.error('Error sending booking confirmation to client:', clientNotifyError);
                  // Continue even if client notification fails
                }
              }
            }
          }
        } catch (notifyError) {
          console.error('Error sending therapist response notification:', notifyError);
          // Continue even if notification fails
        }
      }
    } catch (error) {
      console.error('Error in status update:', error);
      toast.error('ステータスの更新に失敗しました');
    }
  };

  // Filter bookings based on selected tab
  const filteredBookings = bookingRequests.filter(booking => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return booking.status === "承認待ち";
    if (activeFilter === 'confirmed') return booking.status === "確定";
    if (activeFilter === 'completed') return booking.status === "完了";
    if (activeFilter === 'cancelled') return booking.status === "キャンセル";
    return true;
  });

  console.log("Filtered bookings for tab", activeFilter, ":", filteredBookings.length);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">予約リクエスト管理</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all" onValueChange={setActiveFilter}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              全て
              <Badge variant="secondary" className="ml-2">{bookingRequests.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              承認待ち
              <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              確定
              <Badge variant="secondary" className="ml-2">{confirmedCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              完了
              <Badge variant="secondary" className="ml-2">{completedCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              キャンセル
              <Badge variant="secondary" className="ml-2">{cancelledCount}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(request => (
                <TherapistBookingRequest 
                  key={request.id} 
                  request={request}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">予約リクエストがありません</p>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(request => (
                <TherapistBookingRequest 
                  key={request.id} 
                  request={request}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">承認待ちのリクエストがありません</p>
            )}
          </TabsContent>
          
          <TabsContent value="confirmed" className="mt-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(request => (
                <TherapistBookingRequest 
                  key={request.id} 
                  request={request}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">確定した予約がありません</p>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(request => (
                <TherapistBookingRequest 
                  key={request.id} 
                  request={request}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">完了した予約がありません</p>
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(request => (
                <TherapistBookingRequest 
                  key={request.id} 
                  request={request}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">キャンセルされた予約がありません</p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TherapistBookingRequests;
