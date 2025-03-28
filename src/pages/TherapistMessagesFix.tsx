import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import MessageList from '@/components/MessageList';
import { supabase } from '@/integrations/supabase/client';
import { Send, Paperclip, ArrowLeft, Check, CheckCheck, Image, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';

interface IMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  timestamp: string;
  is_read: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  imageUrl: string;
  nickname?: string;
}

const TherapistMessagesFix = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Set up real-time subscription for new messages
  useEffect(() => {
    const setupSubscription = async () => {
      // Get the current therapist
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;
      
      console.log("[TherapistMessagesFix] Auth session current user:", currentUser);
      
      if (!currentUser) {
        toast.error("ログインが必要です");
        navigate('/therapist-login');
        return;
      }
      
      setTherapistId(currentUser.id);
      console.log("[TherapistMessagesFix] Set therapist ID:", currentUser.id);
      
      // Subscribe to new messages
      const subscription = supabase
        .channel('therapist-messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log("[TherapistMessagesFix] Real-time message received:", payload);
            // If the message is for the current conversation, add it to the messages
            if (id && payload.new.sender_id === id) {
              setMessages(prev => [...prev, payload.new as IMessage]);
              // Play notification sound or show toast
              toast.success('新しいメッセージが届きました');
              
              // Mark message as read immediately
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', payload.new.id)
                .then(() => console.log("[TherapistMessagesFix] Marked new message as read"));
            } else {
              // If it's from another conversation, just show a notification
              toast.success('新しいメッセージが届きました');
            }
          }
        )
        .subscribe((status) => {
          console.log("[TherapistMessagesFix] Subscription status:", status);
        });
        
      console.log("[TherapistMessagesFix] Supabase channel subscription initialized");
        
      return () => {
        console.log("[TherapistMessagesFix] Unsubscribing from supabase channel");
        subscription.unsubscribe();
      };
    };
    
    setupSubscription();
  }, [navigate, id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (!id) {
          console.log("[TherapistMessagesFix] No conversation ID provided - this is the index page");
        }
        
        // Get the current therapist
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        
        console.log("[TherapistMessagesFix] Auth session for fetchData:", currentUser);
        
        if (!currentUser) {
          console.error("[TherapistMessagesFix] No user session found");
          toast.error("ログインが必要です");
          navigate('/therapist-login');
          return;
        }
        
        setTherapistId(currentUser.id);
        
        // If no specific conversation is selected (on the index page)
        if (!id) {
          console.log("[TherapistMessagesFix] No conversation selected, checking for available conversations");
          
          // Check if therapist has any conversations
          const { data: conversationsCheck, error: conversationsError, count } = await supabase
            .from('messages')
            .select('sender_id, receiver_id', { count: 'exact' })
            .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
            .limit(10);
            
          if (conversationsError) {
            console.error('[TherapistMessagesFix] Error checking conversations:', conversationsError);
          } else {
            console.log(`[TherapistMessagesFix] Found ${count} conversations for therapist ${currentUser.id}`);
            
            if (conversationsCheck && conversationsCheck.length > 0) {
              console.log("[TherapistMessagesFix] Conversation data sample:", conversationsCheck);
              
              // Get unique sender/receiver IDs excluding the current user
              const uniquePartnerIds = new Set<string>();
              
              conversationsCheck.forEach(msg => {
                if (msg.sender_id !== currentUser.id) {
                  uniquePartnerIds.add(msg.sender_id);
                }
                if (msg.receiver_id !== currentUser.id) {
                  uniquePartnerIds.add(msg.receiver_id);
                }
              });
              
              console.log("[TherapistMessagesFix] Unique conversation partners:", Array.from(uniquePartnerIds));
              
              if (uniquePartnerIds.size > 0) {
                // Log the exact IDs we're searching for
                console.log('[TherapistMessagesFix] Searching for profiles with exact IDs:', Array.from(uniquePartnerIds));
                
                // Ensure IDs are properly formatted as strings
                const stringIds = Array.from(uniquePartnerIds).map(id => String(id));
                console.log('[TherapistMessagesFix] Formatted IDs as strings:', stringIds);
                
                // Fetch partner details from profiles table
                const { data: profilesCheck, error: profilesError } = await supabase
                  .from('profiles')
                  .select('id, nickname, name, avatar_url')
                  .in('id', stringIds);
                  
                if (profilesError) {
                  console.error('[TherapistMessagesFix] Error checking partner profiles:', profilesError);
                  
                  // Try fetching profiles individually as a fallback
                  console.log('[TherapistMessagesFix] Trying to fetch profiles individually');
                  
                  const individualProfiles = [];
                  for (const partnerId of uniquePartnerIds) {
                    const { data: profileData, error: profileError } = await supabase
                      .from('profiles')
                      .select('id, nickname, name, avatar_url')
                      .eq('id', partnerId)
                      .maybeSingle();
                      
                    if (profileError) {
                      console.error(`[TherapistMessagesFix] Error fetching profile for ${partnerId}:`, profileError);
                    } else if (profileData) {
                      console.log(`[TherapistMessagesFix] Found profile for ${partnerId}:`, profileData);
                      individualProfiles.push(profileData);
                    }
                  }
                  
                  if (individualProfiles.length > 0) {
                    console.log('[TherapistMessagesFix] Partner profiles found via individual queries:', individualProfiles);
                    
                    // Log found nicknames for debugging
                    individualProfiles.forEach(profile => {
                      console.log(`[TherapistMessagesFix] Partner ${profile.id} has nickname: ${profile.nickname}`);
                    });
                  }
                } else if (profilesCheck && profilesCheck.length > 0) {
                  console.log('[TherapistMessagesFix] Partner profiles found:', profilesCheck);
                  
                  // Log found nicknames for debugging
                  profilesCheck.forEach(profile => {
                    console.log(`[TherapistMessagesFix] Partner ${profile.id} has nickname: ${profile.nickname}`);
                  });
                } else {
                  console.log('[TherapistMessagesFix] No partner profiles found in the query');
                }
              }
            }
          }
          
          setIsLoading(false);
          return;
        }
        
        // Fetch user info - try profiles first
        let userData = null;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, nickname, avatar_url')
          .eq('id', id);
          
        if (profileError) {
          console.error('[TherapistMessagesFix] Error fetching user profile:', profileError);
        } else if (profileData && profileData.length > 0) {
          console.log("[TherapistMessagesFix] User profile data fetched:", profileData[0]);
          userData = profileData[0];
          
          // Log nickname explicitly for debugging
          console.log(`[TherapistMessagesFix] User nickname: ${userData.nickname}, name: ${userData.name}`);
        } else {
          console.log("[TherapistMessagesFix] No profile found, checking therapists table");
          
          // Try therapists table as fallback
          const { data: therapistData, error: therapistError } = await supabase
            .from('therapists')
            .select('id, name, image_url')
            .eq('id', id);
            
          if (therapistError) {
            console.error('[TherapistMessagesFix] Error fetching therapist:', therapistError);
          } else if (therapistData && therapistData.length > 0) {
            console.log("[TherapistMessagesFix] Therapist data fetched:", therapistData[0]);
            userData = {
              id: therapistData[0].id,
              name: therapistData[0].name,
              avatar_url: therapistData[0].image_url
            };
          }
        }
          
        if (!userData) {
          // As a last resort, create a placeholder
          console.log("[TherapistMessagesFix] Creating placeholder for user:", id);
          userData = {
            id: id,
            name: `Customer ${id.substring(0, 6)}...`,
            avatar_url: null
          };
        }
        
        // Set display name prioritizing nickname over name
        let displayName = 'User';
        
        if (userData.nickname) {
          displayName = userData.nickname;
          console.log(`[TherapistMessagesFix] Using nickname: ${displayName}`);
        } else if (userData.name) {
          displayName = userData.name;
          console.log(`[TherapistMessagesFix] Using name: ${displayName}`);
        }
        
        console.log("[TherapistMessagesFix] Final display name:", displayName);
        
        setUser({
          id: userData.id,
          name: displayName,
          imageUrl: userData.avatar_url || '/placeholder.svg',
        });
        
        // Fetch messages between current therapist and user
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
          .order('timestamp', { ascending: true });
          
        if (messagesError) {
          console.error('[TherapistMessagesFix] Error fetching messages:', messagesError);
          toast.error('メッセージの取得に失敗しました');
          return;
        }
        
        console.log(`[TherapistMessagesFix] Messages fetched between ${currentUser.id} and ${id}:`, messagesData);
        
        if (messagesData) {
          setMessages(messagesData);
          
          // Mark all messages from user as read
          const unreadMessages = messagesData.filter(msg => 
            msg.sender_id === id && 
            msg.receiver_id === currentUser.id && 
            !msg.is_read
          );
          
          console.log("[TherapistMessagesFix] Unread messages to mark as read:", unreadMessages.length);
          
          if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(msg => msg.id);
            await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', messageIds);
              
            // Update the local state as well
            setMessages(prev => 
              prev.map(msg => 
                messageIds.includes(msg.id) 
                  ? { ...msg, is_read: true } 
                  : msg
              )
            );
          }
        }
      } catch (error) {
        console.error('[TherapistMessagesFix] Error fetching data:', error);
        toast.error('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || !user || !therapistId) return;
    
    try {
      let imageUrl = null;
      
      // If there's an image, upload it first
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `message-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('messages')
          .upload(filePath, selectedImage);
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('画像のアップロードに失敗しました');
          return;
        }
        
        const { data: urlData } = supabase.storage
          .from('messages')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Create a new message in the database
      const newMessageData = {
        sender_id: therapistId,
        receiver_id: user.id,
        content: newMessage.trim(),
        image_url: imageUrl,
        timestamp: new Date().toISOString(),
        is_read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessageData)
        .select();
        
      if (error) {
        console.error('Error sending message:', error);
        toast.error('メッセージの送信に失敗しました');
        return;
      }
      
      if (data && data[0]) {
        // Add the new message to the state
        setMessages(prev => [...prev, data[0]]);
      }
      
      // Clear the input fields
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast.error('メッセージの送信中にエラーが発生しました');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatus = (message: IMessage) => {
    if (message.sender_id !== therapistId) return null; // Only show status for sent messages
    
    return message.is_read ? (
      <CheckCheck className="h-4 w-4 text-blue-500" />
    ) : (
      <Check className="h-4 w-4 text-gray-400" />
    );
  };

  return (
    <TherapistLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">メッセージ</h1>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">読み込み中...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex h-[calc(100vh-250px)] flex-col md:flex-row">
              <MessageList activeConversationId={id} />
              
              {id ? (
                <div className="flex-1 flex flex-col border-l">
                  <div className="flex items-center gap-3 p-4 border-b">
                    <button
                      onClick={() => navigate('/therapist-messages')}
                      className="text-muted-foreground hover:text-foreground md:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10">
                        <img
                          src={user?.imageUrl || '/placeholder.svg'}
                          alt={user?.name || 'User'}
                          className="rounded-full object-cover h-full w-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold">{user?.name || 'User'}</h2>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20" ref={messagesContainerRef}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === therapistId ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === therapistId
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.content}
                          {message.image_url && (
                            <img
                              src={message.image_url}
                              alt="Message attachment"
                              className="mt-2 rounded-md max-w-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              message.sender_id === therapistId
                                ? 'text-primary-foreground/70 justify-end'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatMessageDate(message.timestamp)}
                            {message.sender_id === therapistId && (
                              <span>{getMessageStatus(message)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                    {selectedImage && (
                      <div className="flex-1 relative my-2">
                        <div className="relative inline-block">
                          <img 
                            src={imagePreview || ''} 
                            alt="Preview" 
                            className="h-20 rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="メッセージを入力..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                      >
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                      </button>
                      
                      <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedImage}
                        className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border-l p-4">
                  <div className="text-center max-w-md mx-auto">
                    <h3 className="text-lg font-medium mb-2">会話を選択してください</h3>
                    <p className="text-muted-foreground">メッセージの送信を開始するには左側の会話リストから選択してください。</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TherapistLayout>
  );
};

export default TherapistMessagesFix; 