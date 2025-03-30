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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  CheckCircle2, 
  XCircle,
  Calendar,
  MoreHorizontal,
  CheckCheck,
  MessageSquare,
  Send
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; 

interface TherapistBookingRequestProps {
  request: BookingRequest;
  onStatusChange: (id: string, newStatus: "承認待ち" | "確定" | "キャンセル" | "完了") => void;
}

const TherapistBookingRequest = ({ request, onStatusChange }: TherapistBookingRequestProps) => {
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const handleApprove = () => {
    setIsSubmittingResponse(true);
    onStatusChange(request.id, "確定");
    setIsSubmittingResponse(false);
  };

  const handleReject = () => {
    setIsSubmittingResponse(true);
    onStatusChange(request.id, "キャンセル");
    setIsSubmittingResponse(false);
  };
  
  const handleComplete = () => {
    setIsSubmittingResponse(true);
    onStatusChange(request.id, "完了");
    setIsSubmittingResponse(false);
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
    }, 500);
  };

  const handleSendMessage = (content: string) => {
    setIsSubmittingResponse(true);
    
    if (!content.trim()) {
      toast.error('メッセージの内容を入力してください');
      setIsSubmittingResponse(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast.success('メッセージを送信しました', {
        description: 'お客様に通知が送信されました。',
      });
      setMessageContent('');
      setIsSubmittingResponse(false);
    }, 500);
  };

  const getStatusBadge = () => {
    const status = request?.status || '未定義';
    switch (status) {
      case "承認待ち":
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">承認待ち</span>;
      case "確定":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">確定</span>;
      case "キャンセル":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">キャンセル</span>;
      case "完了":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">完了</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">未定義</span>;
    }
  };

  // Get client initial
  const getClientInitial = () => {
    if (!request.clientName) return '?';
    return request.clientName.charAt(0).toUpperCase();
  };

  return (
    <div className="border rounded-lg p-4 mb-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.clientAvatar} alt={request.clientName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getClientInitial()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-base">{request.clientName}</h3>
              {request.clientEmail && (
                <p className="text-xs text-muted-foreground">{request.clientEmail}</p>
              )}
            </div>
            <div className="ml-2">{getStatusBadge()}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{request.requestTime}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{request.servicePrice.toLocaleString()}円</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{request.serviceLocation}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{
                request.meetingMethod === "meetup" ? "待ち合わせ" :
                request.meetingMethod === "hotel" ? "ホテル" :
                request.meetingMethod === "home" ? "自宅" : 
                request.meetingMethod
              }</span>
            </div>
          </div>
          
          {request.notes && (
            <div className="mt-3 text-sm text-muted-foreground border-t pt-2">
              <p className="font-medium">メモ：</p>
              <p>{request.notes}</p>
            </div>
          )}
        </div>
        
        {request.status !== "キャンセル" && request.status !== "完了" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {request.status === "承認待ち" && (
                <>
                  <DropdownMenuItem onClick={handleApprove}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    <span>承認する</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReject}>
                    <XCircle className="mr-2 h-4 w-4" />
                    <span>却下する</span>
                  </DropdownMenuItem>
                </>
              )}
              
              {request.status === "確定" && (
                <DropdownMenuItem onClick={handleComplete}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  <span>対応完了にする</span>
                </DropdownMenuItem>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>メッセージを送る</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>メッセージを送信</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {request.clientName}様へのメッセージを入力してください。
                    </p>
                    <Textarea 
                      placeholder="メッセージを入力..."
                      rows={4}
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">キャンセル</Button>
                    </DialogClose>
                    <Button 
                      onClick={() => handleSendMessage(messageContent)}
                      disabled={isSubmittingResponse || !messageContent.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      送信
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
                <DialogTitle className="text-lg">日時変更の提案</DialogTitle>
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
      
      {request.status === "確定" && (
        <div className="mt-4">
          <Button 
            onClick={handleComplete}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmittingResponse}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            対応完了にする
          </Button>
        </div>
      )}
    </div>
  );
};

export default TherapistBookingRequest;
