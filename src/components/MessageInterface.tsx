import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Therapist } from '../utils/types';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MessageInterfaceProps {
  therapist: Therapist;
}

const MessageInterface = ({ therapist }: MessageInterfaceProps) => {
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    console.log("MessageInterface: Starting conversation with therapist:", therapist);
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('メッセージ機能をご利用いただくには会員登録が必要です。', {
        duration: 4000,
      });
      navigate('/register');
      return;
    }
    
    // Check if user is verified
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', user.id)
      .single();
      
    if (error || !profile?.is_verified) {
      toast.error('メッセージ機能をご利用いただくには年齢認証が必要です。プロフィールページで身分証明書をアップロードし、管理者による認証をお待ちください。', {
        duration: 6000,
      });
      navigate('/profile');
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
        >
          会話を開始する
        </Button>
      </div>
    </div>
  );
};

export default MessageInterface;
