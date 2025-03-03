
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Therapist } from '../utils/types';

interface MessageInterfaceProps {
  therapist: Therapist;
}

const MessageInterface = ({ therapist }: MessageInterfaceProps) => {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in p-6">
      <div className="text-center space-y-4">
        <MessageSquare className="h-12 w-12 mx-auto text-primary" />
        <h2 className="font-semibold text-xl">{therapist.name}にメッセージを送る</h2>
        <p className="text-muted-foreground">
          質問がありますか？セッションについて相談したいですか？{therapist.name}にメッセージを送ってください。
        </p>
        <Link
          to={`/messages/${therapist.id}`}
          className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-full max-w-sm"
        >
          会話を始める
        </Link>
      </div>
    </div>
  );
};

export default MessageInterface;
