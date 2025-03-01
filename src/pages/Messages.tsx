
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { therapists } from '../utils/data';
import { Therapist, Message } from '../utils/types';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Messages = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call to fetch therapist data
    setTimeout(() => {
      if (id) {
        const foundTherapist = therapists.find(t => t.id === parseInt(id));
        setTherapist(foundTherapist || null);
        
        // Mock initial message
        if (foundTherapist) {
          setMessages([
            {
              id: 1,
              senderId: foundTherapist.id,
              receiverId: 0, // User ID
              content: "Hello! Thanks for your interest in booking a session with me. How can I help you today?",
              timestamp: new Date().toISOString(),
              isRead: true
            }
          ]);
        }
      }
      setIsLoading(false);
    }, 800);
  }, [id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !therapist) return;
    
    // Create a new message
    const userMessage: Message = {
      id: Date.now(),
      senderId: 0, // User ID
      receiverId: therapist.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate therapist response after a short delay
    setTimeout(() => {
      const therapistResponse: Message = {
        id: Date.now() + 1,
        senderId: therapist.id,
        receiverId: 0,
        content: "Thanks for your message! I'll check my schedule and get back to you soon.",
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      setMessages(prev => [...prev, therapistResponse]);
      toast.success('New message received');
    }, 2000);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!therapist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Therapist Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The therapist you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/therapists')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Therapists
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => navigate(`/therapists/${therapist.id}`)}
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {therapist.name}'s Profile
      </button>
      
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in">
        <div className="p-4 border-b flex items-center gap-4">
          <img
            src={therapist.imageUrl}
            alt={therapist.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold">{therapist.name}</h2>
            <p className="text-sm text-muted-foreground">
              Typically replies within 2 hours
            </p>
          </div>
        </div>
        
        <div className="p-4 h-96 overflow-y-auto flex flex-col space-y-4 bg-muted/30">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.senderId === 0 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted rounded-tl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {message.senderId === 0 ? 'You' : therapist.name} • {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
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
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="shrink-0 bg-primary text-primary-foreground h-10 px-4 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Messages;
