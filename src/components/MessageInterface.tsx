import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Therapist } from '../utils/types';
import { Button } from './ui/button';

interface MessageInterfaceProps {
  therapist: Therapist;
}

const MessageInterface = ({ therapist }: MessageInterfaceProps) => {
  const navigate = useNavigate();

  const handleStartConversation = () => {
    console.log("MessageInterface: Starting conversation with therapist:", therapist);
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
