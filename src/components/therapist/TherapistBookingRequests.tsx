
import { useState } from "react";
import { BookingRequest } from "@/utils/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TherapistBookingRequestsProps {
  bookingRequests: BookingRequest[];
}

export const TherapistBookingRequests = ({ bookingRequests: initialRequests }: TherapistBookingRequestsProps) => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(initialRequests);

  const handleApprove = (id: string) => {
    setBookingRequests(bookingRequests.map(request => 
      request.id === id ? { ...request, status: "確定" } : request
    ));
  };

  const handleReject = (id: string) => {
    setBookingRequests(bookingRequests.map(request => 
      request.id === id ? { ...request, status: "キャンセル" } : request
    ));
  };

  const handleReschedule = (id: string) => {
    // In a real app, this would open a rescheduling dialog
    console.log("Rescheduling request:", id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">予約リクエスト</h2>
      
      <div className="space-y-4">
        {bookingRequests.map(request => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{request.clientName}からのリクエスト</h3>
                  {request.status === "承認待ち" && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                      承認待ち
                    </span>
                  )}
                  {request.status === "確定" && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      確定
                    </span>
                  )}
                  {request.status === "キャンセル" && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                      キャンセル
                    </span>
                  )}
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>リクエスト時間: {request.requestTime}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">サービス料金:</span>{" "}
                    <span className="font-medium">¥{request.servicePrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">サービス場所:</span>{" "}
                    <span>{request.serviceLocation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">待ち合わせ方法:</span>{" "}
                    <span>{request.meetingMethod}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {request.status === "承認待ち" && (
              <div className="flex space-x-2 mt-4">
                <Button 
                  onClick={() => handleApprove(request.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  承認
                </Button>
                <Button 
                  onClick={() => handleReject(request.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  却下
                </Button>
                <Button 
                  onClick={() => handleReschedule(request.id)}
                  variant="outline"
                >
                  時間変更提案
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
