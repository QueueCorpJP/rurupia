
import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Therapist } from '../utils/types';
import { toast } from 'sonner';

interface MessageInterfaceProps {
  therapist: Therapist;
}

const MessageInterface = ({ therapist }: MessageInterfaceProps) => {
  const [message, setMessage] = useState('');
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Here you would typically make an API call to send the message
    toast.success('Message sent!');
    setMessage('');
  };
  
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Message {therapist.name}</h2>
        <p className="text-sm text-muted-foreground">
          Typically replies within 2 hours
        </p>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto flex flex-col justify-end bg-muted/30">
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-[80%]">
              <p className="text-sm">
                Hello! Thanks for your interest in booking a session with me. How can I help you today?
              </p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {therapist.name} • Just now
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <button
          type="button"
          className="shrink-0 rounded-md h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="shrink-0 bg-primary text-primary-foreground h-10 px-4 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageInterface;
