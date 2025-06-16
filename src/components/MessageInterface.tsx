import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Therapist } from '../utils/types';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MessageInterfaceProps {
  therapist: Therapist;
  currentUser?: any;
  isUserVerified?: boolean;
}

const MessageInterface = ({ therapist, currentUser, isUserVerified }: MessageInterfaceProps) => {
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    console.log("MessageInterface: Starting conversation with therapist:", therapist);
    
    // Check if user is logged in
    const user = currentUser || (await supabase.auth.getUser()).data?.user;
    if (!user) {
      toast.error('メッセージ機能をご利用いただくには会員登録が必要です。', {
        duration: 4000,
      });
                    navigate('/signup');
      return;
    }
    
    // Check if user is verified
    if (!isUserVerified) {
      // Redirect to profile page for verification
      navigate('/user-profile');
      return;
    }
    
    // User is logged in and verified, proceed to messages
    navigate(`/messages/${therapist.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center p-4 flex-1 flex flex-col items-center justify-center">
        <MessageSquare className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {therapist.name}さんとのメッセージ
        </h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-[350px]">
          施術内容、スケジュール、特別なリクエストなど、
          セラピストに直接質問することができます。
        </p>
        <Button 
          onClick={handleStartConversation}
          className="w-full"
          disabled={currentUser && !isUserVerified}
        >
          {currentUser && !isUserVerified ? '認証が必要です' : '会話を開始する'}
        </Button>
      </div>
    </div>
  );
};

export default MessageInterface;
