import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapists } from '../utils/data';
import { Message } from '../utils/types';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

// Fixed mockConversations to use string IDs, not multiplying by number
const mockConversations = therapists.map(therapist => {
  const lastMessage = {
    id: `msg-${therapist.id}`,
    senderId: therapist.id,
    receiverId: 0, // User ID
    content: "こんにちは！セッションのご予約ありがとうございます。お役に立てることがあれば、お気軽にお問い合わせください。",
    timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    isRead: Math.random() > 0.5
  };
  
  return {
    therapistId: therapist.id,
    therapist,
    lastMessage,
    unreadCount: lastMessage.isRead ? 0 : 1
  };
});

const MessageList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(mockConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredConversations = conversations.filter(
    convo => convo.therapist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (therapistId: number | string) => {
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
            検索結果がありません
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.therapistId}
              className={`p-4 flex gap-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                conversation.unreadCount > 0 ? 'bg-muted/30' : ''
              }`}
              onClick={() => handleConversationClick(conversation.therapistId)}
            >
              <div className="flex-shrink-0">
                <img
                  src={conversation.therapist.imageUrl}
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
