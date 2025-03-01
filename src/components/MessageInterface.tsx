
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
        <h2 className="font-semibold text-xl">Message {therapist.name}</h2>
        <p className="text-muted-foreground">
          Have questions or want to discuss a session? Send a message to {therapist.name}.
        </p>
        <Link
          to={`/messages/${therapist.id}`}
          className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-full max-w-sm"
        >
          Start Conversation
        </Link>
      </div>
    </div>
  );
};

export default MessageInterface;
