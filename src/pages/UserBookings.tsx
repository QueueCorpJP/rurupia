import { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { BookingRequest } from '@/utils/types';
import { Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for demonstration
const mockBookingRequests: BookingRequest[] = [
  {
    id: "br1",
    clientName: "鈴木太郎",
    requestTime: "2023-11-15 14:00",
    servicePrice: 8000,
    serviceLocation: "東京都渋谷区",
    meetingMethod: "ホテル",
    status: "承認待ち",
    notes: "初めての予約です。よろしくお願いします。",
    therapistId: "t1"
  },
  {
    id: "br2",
    clientName: "田中花子",
    requestTime: "2023-11-16 18:30",
    servicePrice: 12000,
    serviceLocation: "東京都新宿区",
    meetingMethod: "訪問",
    status: "確定",
    notes: "肩こりがひどいです。",
    therapistId: "t2"
  },
  {
    id: "br3",
    clientName: "佐藤雅子",
    requestTime: "2023-11-10 10:00",
    servicePrice: 10000,
    serviceLocation: "東京都目黒区",
    meetingMethod: "ホテル",
    status: "完了",
    notes: "リラックスできました。ありがとうございました。",
    therapistId: "t3"
  },
  {
    id: "br4",
    clientName: "山本健太",
    requestTime: "2023-11-08 19:00",
    servicePrice: 8000,
    serviceLocation: "東京都港区",
    meetingMethod: "訪問",
    status: "キャンセル",
    notes: "急用ができたためキャンセルします。申し訳ありません。",
    therapistId: "t1"
  }
];

const UserBookings = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(mockBookingRequests);
  
  const pendingBookings = bookingRequests.filter(req => req.status === "承認待ち");
  const confirmedBookings = bookingRequests.filter(req => req.status === "確定");
  const completedBookings = bookingRequests.filter(req => req.status === "完了");
  const cancelledBookings = bookingRequests.filter(req => req.status === "キャンセル");
  
  const handleCancelRequest = (id: string) => {
    // In a real app, this would call an API to cancel the request
    setBookingRequests(bookingRequests.map(req => 
      req.id === id ? { ...req, status: "キャンセル" } : req
    ));
    
    toast.success('予約リクエストをキャンセルしました');
  };
  
  const renderBookingCard = (booking: BookingRequest) => {
    const therapistName = booking.id.includes('br1') ? "鈴木太郎" : 
                          booking.id.includes('br2') ? "田中花子" : 
                          booking.id.includes('br3') ? "佐藤雅子" : "山本健太";
                          
    return (
      <div key={booking.id} className="border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{therapistName}へのリクエスト</h3>
              <StatusBadge status={booking.status} />
            </div>
            
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.requestTime}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>¥{booking.servicePrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{booking.serviceLocation}</span>
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
  
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">予約履歴</h1>
        
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
