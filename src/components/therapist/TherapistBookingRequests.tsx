
import { useState } from "react";
import { BookingRequest } from "@/utils/types";
import TherapistBookingRequest from "./TherapistBookingRequest";

interface TherapistBookingRequestsProps {
  bookingRequests: BookingRequest[];
}

export const TherapistBookingRequests = ({ bookingRequests: initialRequests }: TherapistBookingRequestsProps) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(initialRequests);

  const handleStatusChange = (id: string, newStatus: "承認待ち" | "確定" | "キャンセル" | "完了") => {
    setBookingRequests(bookingRequests.map(request => 
      request.id === id ? { ...request, status: newStatus } : request
    ));
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
        {sortedRequests.length === 0 ? (
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
