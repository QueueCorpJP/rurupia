
import { useState, useEffect } from "react";
import { BookingRequest } from "@/utils/types";
import TherapistBookingRequest from "./TherapistBookingRequest";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TherapistBookingRequestsProps {
  therapistId?: string;
}

export const TherapistBookingRequests = ({ therapistId }: TherapistBookingRequestsProps) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookingRequests = async () => {
      try {
        if (!therapistId) {
          console.log("No therapist ID provided");
          setIsLoading(false);
          return;
        }
        
        let query = supabase
          .from('bookings')
          .select('*')
          .eq('therapist_id', therapistId);
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching booking requests:", error);
          toast.error("予約リクエストの取得に失敗しました");
          return;
        }
        
        if (!data || data.length === 0) {
          setBookingRequests([]);
          setIsLoading(false);
          return;
        }
        
        // Transform the data to match BookingRequest type
        const transformedData: BookingRequest[] = data.map(booking => ({
          id: booking.id,
          clientName: "クライアント", // This would ideally come from a join with the user profile
          requestTime: new Date(booking.date).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          servicePrice: booking.price,
          serviceLocation: booking.location || "未指定",
          // Handle the case where meeting_method might not exist in the database
          meetingMethod: booking.notes?.includes("meetup") ? "meetup" : 
                       booking.notes?.includes("hotel") ? "hotel" : 
                       booking.notes?.includes("home") ? "home" : "meetup",
          status: booking.status === 'pending' ? "承認待ち" : 
                booking.status === 'confirmed' ? "確定" : 
                booking.status === 'cancelled' ? "キャンセル" : "完了",
          notes: booking.notes || "",
          therapistId: booking.therapist_id
        }));
        
        setBookingRequests(transformedData);
      } catch (error) {
        console.error("Error in fetchBookingRequests:", error);
        toast.error("エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingRequests();
  }, [therapistId]);

  const handleStatusChange = async (id: string, newStatus: "承認待ち" | "確定" | "キャンセル" | "完了") => {
    try {
      // Convert Japanese status to English for database
      const dbStatus = newStatus === "承認待ち" ? "pending" : 
                      newStatus === "確定" ? "confirmed" : 
                      newStatus === "キャンセル" ? "cancelled" : "completed";
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: dbStatus })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating booking status:", error);
        toast.error("ステータスの更新に失敗しました");
        return;
      }
      
      // Update local state
      setBookingRequests(bookingRequests.map(request => 
        request.id === id ? { ...request, status: newStatus } : request
      ));
      
      toast.success(`ステータスを「${newStatus}」に更新しました`);
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast.error("エラーが発生しました");
    }
  };

  // Filter requests to show pending ones first
  const sortedRequests = [...bookingRequests].sort((a, b) => {
    if (a.status === "承認待ち" && b.status !== "承認待ち") return -1;
    if (a.status !== "承認待ち" && b.status === "承認待ち") return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">予約リクエスト</h2>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-muted-foreground">データを読み込んでいます...</p>
          </div>
        ) : bookingRequests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            現在、予約リクエストはありません
          </div>
        ) : (
          sortedRequests.map(request => (
            <TherapistBookingRequest 
              key={request.id} 
              request={request} 
              onStatusChange={handleStatusChange} 
            />
          ))
        )}
      </div>
    </div>
  );
};
