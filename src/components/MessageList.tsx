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
  partnerId: string;
  partnerName: string;
  partnerImageUrl: string;
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
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        console.log("[MessageList] Fetching conversations, activeConversationId:", activeConversationId);
        setIsLoading(true);
        
        // Get current user
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        
        console.log("[MessageList] Current user:", user);
        
        if (!user) {
          console.log("[MessageList] No user found");
          return;
        }
        
        setUserId(user.id);
        
        // Get user type (therapist or customer)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("[MessageList] Error fetching profile:", profileError);
          return;
        }
        
        console.log("[MessageList] User profile data:", profileData);
        setUserType(profileData?.user_type || null);
        
        // First, get raw messages to identify all conversation partners
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('sender_id, receiver_id, timestamp')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('timestamp', { ascending: false })
          .limit(100);
          
        if (messagesError) {
          console.error("[MessageList] Error fetching messages:", messagesError);
          return;
        }
        
        console.log("[MessageList] All messages involving this user:", messagesData);
        
        if (!messagesData || messagesData.length === 0) {
          console.log("[MessageList] No messages found for user");
          setConversations([]);
          setIsLoading(false);
          return;
        }
        
        // Extract unique partner IDs
        const partnerIds = new Set<string>();
        
        messagesData.forEach(msg => {
          if (msg.sender_id !== user.id) {
            partnerIds.add(msg.sender_id);
          }
          if (msg.receiver_id !== user.id) {
            partnerIds.add(msg.receiver_id);
          }
        });
        
        const uniquePartnerIds = Array.from(partnerIds);
        console.log("[MessageList] Unique partner IDs:", uniquePartnerIds);
        
        if (uniquePartnerIds.length === 0) {
          console.log("[MessageList] No conversation partners found");
          setConversations([]);
          setIsLoading(false);
          return;
        }
        
        // Build partner data from appropriate tables based on user type
        let partners = [];
        
        if (profileData?.user_type === 'therapist') {
          // For therapists, fetch customer profiles from profiles table
          console.log("[MessageList] Fetching customer profiles for IDs:", uniquePartnerIds);
          
          // Make sure we're working with a non-empty array of valid IDs
          if (uniquePartnerIds.length > 0) {
            // Try fetching each partner profile individually to ensure we get data
            const customerProfiles = [];
            
            for (const partnerId of uniquePartnerIds) {
              console.log(`[MessageList] Fetching profile data for partner: ${partnerId}`);
              
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, nickname, name, avatar_url, user_type')
                .eq('id', partnerId)
                .single();
                
              if (profileError) {
                console.error(`[MessageList] Error fetching profile for ${partnerId}:`, profileError);
              } else if (profileData) {
                console.log(`[MessageList] Found profile for ${partnerId}:`, profileData);
                customerProfiles.push(profileData);
              } else {
                console.log(`[MessageList] No profile found for ${partnerId}`);
              }
            }
            
            console.log("[MessageList] All customer profiles collected:", customerProfiles);
            
            if (customerProfiles.length > 0) {
              partners = customerProfiles.map(customer => {
                const displayName = customer.nickname || customer.name || 'Customer';
                console.log(`[MessageList] Setting partner name to: ${displayName} for user ${customer.id}`);
                
                return {
                  id: customer.id,
                  name: displayName,
                  image_url: customer.avatar_url || '/placeholder.svg'
                };
              });
            } else {
              console.log("[MessageList] No customer profiles found after individual queries");
            }
          } else {
            console.log("[MessageList] No partner IDs to fetch profiles for");
          }
          
          // If no partners found in profiles, create placeholder partners
          if (partners.length === 0) {
            console.log("[MessageList] Creating placeholder partners for missing profiles. This means no matching profiles were found.");
            
            partners = uniquePartnerIds.map(partnerId => {
              console.log(`[MessageList] Creating placeholder for partner ID: ${partnerId}`);
              return {
                id: partnerId,
                name: `Customer`,
                image_url: '/placeholder.svg'
              };
            });
          }
        } else {
          // For customers, fetch therapist profiles
          const { data: therapists, error: therapistsError } = await supabase
            .from('therapists')
            .select('id, name, image_url')
            .in('id', uniquePartnerIds);
            
          if (therapistsError) {
            console.error("[MessageList] Error fetching therapists:", therapistsError);
          } else if (therapists && therapists.length > 0) {
            console.log("[MessageList] Therapist partners data:", therapists);
            partners = therapists.map(therapist => ({
              id: therapist.id,
              name: therapist.name || 'Therapist',
              image_url: therapist.image_url || '/placeholder.svg'
            }));
          } else {
            // Create placeholder partners for each unique ID if no therapists found
            partners = uniquePartnerIds.map(partnerId => ({
              id: partnerId,
              name: 'Therapist',
              image_url: '/placeholder.svg'
            }));
          }
        }
        
        console.log("[MessageList] Final partners list:", partners);
        
        // For each partner, get the most recent message and unread count
        const conversationsData: Conversation[] = await Promise.all(
          partners.map(async (partner) => {
            console.log("[MessageList] Processing conversation with partner:", partner);
            
            // Get most recent message
            const { data: recentMessages, error: recentError } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partner.id}),and(sender_id.eq.${partner.id},receiver_id.eq.${user.id})`)
              .order('timestamp', { ascending: false })
              .limit(1);
              
            if (recentError) {
              console.error(`[MessageList] Error fetching recent message for partner ${partner.id}:`, recentError);
              return null;
            }
            
            if (!recentMessages || recentMessages.length === 0) {
              console.log(`[MessageList] No recent messages found for partner ${partner.id}`);
              return null;
            }
            
            console.log(`[MessageList] Recent messages with partner ${partner.id}:`, recentMessages);
            
            // Get unread count
            const { count: unreadCount, error: unreadError } = await supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('sender_id', partner.id)
              .eq('receiver_id', user.id)
              .eq('is_read', false);
              
            if (unreadError) {
              console.error(`[MessageList] Error fetching unread count for partner ${partner.id}:`, unreadError);
              return null;
            }
            
            console.log(`[MessageList] Unread count for partner ${partner.id}:`, unreadCount);
            
            return {
              partnerId: partner.id,
              partnerName: partner.name || 'Unknown Partner',
              partnerImageUrl: partner.image_url || '/placeholder.svg',
              lastMessage: recentMessages[0].content || '画像が送信されました',
              timestamp: recentMessages[0].timestamp,
              unreadCount: unreadCount || 0
            };
          })
        );
        
        const validConversations = conversationsData.filter(c => c !== null) as Conversation[];
        console.log("[MessageList] Processed conversations:", validConversations);
        
        // Sort by timestamp (most recent first)
        validConversations.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setConversations(validConversations);
      } catch (error) {
        console.error("[MessageList] Error in fetchConversations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, [activeConversationId]);

  const handleConversationClick = (partnerId: string) => {
    console.log(`[MessageList] Clicking conversation with ${partnerId}`);
    if (userType === 'therapist') {
      navigate(`/therapist-messages/${partnerId}`);
    } else {
      navigate(`/messages/${partnerId}`);
    }
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
    convo.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
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
          filteredConversations.map((conversation) => {
            // Debug log for rendered conversation
            console.log(`[MessageList] Rendering conversation with partner: ${conversation.partnerId}, name: ${conversation.partnerName}`);
            
            return (
              <div
                key={conversation.partnerId}
                className={`p-3 border-b flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                  activeConversationId === conversation.partnerId ? 'bg-muted/40' : ''
                }`}
                onClick={() => handleConversationClick(conversation.partnerId)}
              >
                <div className="relative">
                  <img
                    src={conversation.partnerImageUrl}
                    alt={conversation.partnerName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  {conversation.unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium truncate">{conversation.partnerName}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            );
          })
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
