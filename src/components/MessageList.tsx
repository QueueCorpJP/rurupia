import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface MessageListProps {
  activeConversationId?: string;
}

const MessageList: React.FC<MessageListProps> = ({ activeConversationId }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        
        if (!user) return;
        
        // Fetch messages (this is simplified, in real app you'd group by conversation)
        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            sender_id,
            receiver_id,
            timestamp,
            is_read,
            therapists:sender_id (name, image_url)
          `)
          .eq('receiver_id', user.id)
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        // Process messages into conversations (simplified)
        const processedConversations = messages ? messages.reduce((acc: any[], message: any) => {
          // Check if we already have a conversation with this sender
          const existingConvo = acc.find(c => c.therapistId === message.sender_id);
          
          if (existingConvo) {
            // If message is newer than last message, update the last message
            if (new Date(message.timestamp) > new Date(existingConvo.lastMessage.timestamp)) {
              existingConvo.lastMessage = {
                id: message.id,
                content: message.content,
                timestamp: message.timestamp,
                isRead: message.is_read
              };
            }
            
            // Update unread count if message is unread
            if (!message.is_read) {
              existingConvo.unreadCount += 1;
            }
          } else {
            // Create new conversation
            acc.push({
              therapistId: message.sender_id,
              therapist: {
                id: message.sender_id,
                name: message.therapists?.name || 'Unknown',
                imageUrl: message.therapists?.image_url || ''
              },
              lastMessage: {
                id: message.id,
                content: message.content,
                timestamp: message.timestamp,
                isRead: message.is_read
              },
              unreadCount: message.is_read ? 0 : 1
            });
          }
          
          return acc;
        }, []) : [];
        
        setConversations(processedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(
    convo => convo.therapist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (therapistId: string) => {
    navigate(`/messages/${therapistId}`);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨日';
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[350px] border-r h-[calc(100vh-210px)] overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="セラピストを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            メッセージがありません
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.therapistId}
              className={`p-4 flex gap-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                conversation.unreadCount > 0 ? 'bg-muted/30' : ''
              } ${activeConversationId === conversation.therapistId ? 'bg-muted' : ''}`}
              onClick={() => handleConversationClick(conversation.therapistId)}
            >
              <div className="flex-shrink-0">
                <img
                  src={conversation.therapist.imageUrl || '/placeholder.svg'}
                  alt={conversation.therapist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold truncate">{conversation.therapist.name}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {conversation.lastMessage.content}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <Badge variant="primary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageList;
