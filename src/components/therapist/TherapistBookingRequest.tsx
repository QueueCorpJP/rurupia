
import { useState } from 'react';
import { BookingRequest } from '@/utils/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  CheckCircle2, 
  XCircle,
  Calendar 
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface TherapistBookingRequestProps {
  request: BookingRequest;
  onStatusChange: (id: string, newStatus: "承認待ち" | "確定" | "キャンセル" | "完了") => void;
}

const TherapistBookingRequest = ({ request, onStatusChange }: TherapistBookingRequestProps) => {
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const handleApprove = () => {
    setIsSubmittingResponse(true);
    
    // Simulate API call
    setTimeout(() => {
      onStatusChange(request.id, "確定");
      toast.success('予約リクエストを承認しました', {
        description: 'お客様に通知が送信されました。',
      });
      setIsSubmittingResponse(false);
    }, 1000);
  };

  const handleReject = () => {
    setIsSubmittingResponse(true);
    
    // Simulate API call
    setTimeout(() => {
      onStatusChange(request.id, "キャンセル");
      toast.success('予約リクエストを却下しました', {
        description: 'お客様に通知が送信されました。',
      });
      setIsSubmittingResponse(false);
    }, 1000);
  };
  
  const handleReschedule = (note: string) => {
    setIsSubmittingResponse(true);
    
    if (!note.trim()) {
      toast.error('変更提案の内容を入力してください');
      setIsSubmittingResponse(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast.success('日時変更を提案しました', {
        description: 'お客様に通知が送信されました。',
      });
      setRescheduleNote('');
      setIsSubmittingResponse(false);
    }, 1000);
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case "承認待ち":
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">承認待ち</span>;
      case "確定":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">確定</span>;
      case "キャンセル":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">キャンセル</span>;
      case "完了":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">完了</span>;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{request.clientName}からのリクエスト</h3>
            {getStatusBadge()}
          </div>
          
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>リクエスト日時: {request.requestTime}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>予算: ¥{request.servicePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>場所: {request.serviceLocation}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>合流方法: {
                request.meetingMethod === "meetup" ? "待ち合わせ" :
                request.meetingMethod === "hotel" ? "ホテル" :
                request.meetingMethod === "home" ? "自宅" : 
                request.meetingMethod
              }</span>
            </div>
          </div>
        </div>
      </div>
      
      {request.status === "承認待ち" && (
        <div className="flex space-x-2 mt-4">
          <Button 
            onClick={handleApprove}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmittingResponse}
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            承認
          </Button>
          <Button 
            onClick={handleReject}
            variant="destructive"
            className="flex-1"
            disabled={isSubmittingResponse}
          >
            <XCircle className="mr-1 h-4 w-4" />
            却下
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1" disabled={isSubmittingResponse}>
                <Clock className="mr-1 h-4 w-4" />
                時間変更提案
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>日時変更の提案</DialogTitle>
              </DialogHeader>
              
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {request.clientName}様への日時変更の提案内容を入力してください。
                </p>
                
                <Textarea 
                  placeholder="例: 申し訳ありませんが、ご希望の日時は埋まっております。代わりに6月15日の15:00はいかがでしょうか？"
                  rows={4}
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                />
              </div>
              
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">キャンセル</Button>
                </DialogClose>
                <Button 
                  onClick={() => handleReschedule(rescheduleNote)}
                  disabled={isSubmittingResponse || !rescheduleNote.trim()}
                >
                  提案を送信
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default TherapistBookingRequest;
