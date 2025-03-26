import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface MessageListProps {
  activeConversationId?: string;
}

interface Conversation {
  therapistId: string;
  therapistName: string;
  therapistImageUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const MessageList: React.FC<MessageListProps> = ({ activeConversationId }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        console.log("MessageList: Fetching conversations");
        setIsLoading(true);
        
        // Get current user
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        
        console.log("MessageList: Current user:", user);
        
        if (!user) {
          console.log("MessageList: No user found");
          return;
        }
        
        setUserId(user.id);
        
        // First, get unique therapist IDs with whom the user has conversed
        const { data: senderData, error: senderError } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('receiver_id', user.id)
          .order('timestamp', { ascending: false });
          
        if (senderError) {
          console.error("MessageList: Error fetching senders:", senderError);
          return;
        }
        
        console.log("MessageList: Messages where user is receiver:", senderData);
        
        const { data: receiverData, error: receiverError } = await supabase
          .from('messages')
          .select('receiver_id')
          .eq('sender_id', user.id)
          .order('timestamp', { ascending: false });
          
        if (receiverError) {
          console.error("MessageList: Error fetching receivers:", receiverError);
          return;
        }
        
        console.log("MessageList: Messages where user is sender:", receiverData);
        
        // Combine unique therapist IDs (where user is either sender or receiver)
        const therapistIds = Array.from(new Set([
          ...senderData.map(msg => msg.sender_id),
          ...receiverData.map(msg => msg.receiver_id)
        ])).filter(id => id !== user.id); // Filter out the user's own ID
        
        console.log("MessageList: Unique therapist IDs:", therapistIds);
        
        if (therapistIds.length === 0) {
          console.log("MessageList: No conversations found");
          setConversations([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch therapist details
        const { data: therapists, error: therapistsError } = await supabase
          .from('therapists')
          .select('id, name, image_url')
          .in('id', therapistIds);
          
        if (therapistsError) {
          console.error("MessageList: Error fetching therapists:", therapistsError);
          return;
        }
        
        console.log("MessageList: Therapists data:", therapists);
        
        // For each therapist, get the most recent message and unread count
        const conversationsData: Conversation[] = await Promise.all(
          therapists.map(async (therapist) => {
            // Get most recent message
            const { data: recentMessages, error: recentError } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${user.id},receiver_id.eq.${therapist.id}),and(sender_id.eq.${therapist.id},receiver_id.eq.${user.id})`)
              .order('timestamp', { ascending: false })
              .limit(1);
              
            if (recentError) {
              console.error(`MessageList: Error fetching recent message for therapist ${therapist.id}:`, recentError);
              return null;
            }
            
            // Get unread count
            const { count: unreadCount, error: unreadError } = await supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('sender_id', therapist.id)
              .eq('receiver_id', user.id)
              .eq('is_read', false);
              
            if (unreadError) {
              console.error(`MessageList: Error fetching unread count for therapist ${therapist.id}:`, unreadError);
              return null;
            }
            
            if (recentMessages && recentMessages.length > 0) {
              return {
                therapistId: therapist.id,
                therapistName: therapist.name || 'Unknown Therapist',
                therapistImageUrl: therapist.image_url || '/placeholder.svg',
                lastMessage: recentMessages[0].content || '画像が送信されました',
                timestamp: recentMessages[0].timestamp,
                unreadCount: unreadCount || 0
              };
            }
            
            return null;
          })
        );
        
        const validConversations = conversationsData.filter(c => c !== null) as Conversation[];
        console.log("MessageList: Processed conversations:", validConversations);
        
        // Sort by timestamp (most recent first)
        validConversations.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setConversations(validConversations);
      } catch (error) {
        console.error("MessageList: Error in fetchConversations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, [activeConversationId]);

  const handleConversationClick = (therapistId: string) => {
    navigate(`/messages/${therapistId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'たった今';
    } else if (diffMins < 60) {
      return `${diffMins}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(convo =>
    convo.therapistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="w-full md:w-80 lg:w-96 border-r">
        <div className="p-4 border-b">
          <div className="animate-pulse h-10 bg-muted rounded-md"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 lg:w-96 border-r overflow-hidden flex flex-col max-h-[600px]">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="セラピストを検索..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.therapistId}
              className={`p-3 border-b flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                activeConversationId === conversation.therapistId ? 'bg-muted/40' : ''
              }`}
              onClick={() => handleConversationClick(conversation.therapistId)}
            >
              <div className="relative">
                <img
                  src={conversation.therapistImageUrl}
                  alt={conversation.therapistName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium truncate">{conversation.therapistName}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(conversation.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <p>会話が見つかりません</p>
            {searchQuery && (
              <button
                className="mt-2 text-primary text-sm hover:underline"
                onClick={() => setSearchQuery('')}
              >
                検索をクリア
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
