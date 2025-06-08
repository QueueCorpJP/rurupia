import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import MessageList from '@/components/MessageList';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Send, Paperclip, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
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

interface CustomerInfo {
  id: string;
  name: string;
  imageUrl: string;
}

const TherapistMessagesNew = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [therapistId, setTherapistId] = useState<string>();
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showMobileMessageList, setShowMobileMessageList] = useState(!id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set up real-time subscription for new messages
  useEffect(() => {
    const setupSubscription = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setTherapistId(userData.user.id);
        }

        const channel = supabase
          .channel('therapist-messages-realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'messages',
            },
            (payload) => {
              console.log('[TherapistMessages] Real-time update:', payload);
              
              if (payload.eventType === 'INSERT') {
                const newMsg = payload.new as IMessage;
                if (
                  (newMsg.sender_id === id && newMsg.receiver_id === userData.user?.id) ||
                  (newMsg.sender_id === userData.user?.id && newMsg.receiver_id === id)
                ) {
                  setMessages(prev => {
                    const exists = prev.find(msg => msg.id === newMsg.id);
                    if (exists) return prev;
                    return [...prev, newMsg].sort((a, b) => 
                      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );
                  });
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedMsg = payload.new as IMessage;
                if (
                  (updatedMsg.sender_id === id && updatedMsg.receiver_id === userData.user?.id) ||
                  (updatedMsg.sender_id === userData.user?.id && updatedMsg.receiver_id === id)
                ) {
                  setMessages(prev => 
                    prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg)
                  );
                }
              }
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('[TherapistMessages] Error setting up subscription:', error);
      }
    };

    setupSubscription();
  }, [id]);

  // Fetch the customer and message data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('[TherapistMessages] Fetching data for customer ID:', id);

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          console.error('[TherapistMessages] No authenticated user');
          setIsLoading(false);
          return;
        }

        const currentTherapistId = userData.user.id;
        setTherapistId(currentTherapistId);

        // Fetch customer profile
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('id, nickname, name, avatar_url')
          .eq('id', id)
          .single();

        if (customerError) {
          console.error('[TherapistMessages] Error fetching customer:', customerError);
          setIsLoading(false);
          return;
        }

        console.log('[TherapistMessages] Customer data:', customerData);

        if (customerData) {
          setCustomer({
            id: customerData.id,
            name: customerData.nickname || customerData.name || 'Customer',
            imageUrl: customerData.avatar_url || '/placeholder.svg'
          });
        }

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentTherapistId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentTherapistId})`)
          .order('timestamp', { ascending: true });

        if (messagesError) {
          console.error('[TherapistMessages] Error fetching messages:', messagesError);
        } else {
          console.log('[TherapistMessages] Messages data:', messagesData);
          setMessages(messagesData || []);

          // Mark messages as read
          const unreadMessages = messagesData?.filter(msg => 
            msg.receiver_id === currentTherapistId && !msg.is_read
          );

          if (unreadMessages && unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(msg => msg.id);
            const { error: updateError } = await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', messageIds);

            if (updateError) {
              console.error('[TherapistMessages] Error marking messages as read:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('[TherapistMessages] Error in fetchData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update mobile view state when id changes
  useEffect(() => {
    setShowMobileMessageList(!id);
  }, [id]);

  const sendMessageNotification = async (customerId: string, therapistName: string, messageContent: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          recipientId: customerId,
          senderName: therapistName,
          messageContent: messageContent,
          notificationType: 'new_message'
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
      } else {
        console.log('Notification sent successfully:', data);
      }
    } catch (error) {
      console.error('Error calling notification function:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || !therapistId || !id) return;

    setIsSending(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `message-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('message-images')
          .upload(filePath, selectedImage);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('画像のアップロードに失敗しました');
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('message-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Send message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: therapistId,
          receiver_id: id,
          content: newMessage.trim() || null,
          image_url: imageUrl,
        });

      if (insertError) {
        console.error('Error sending message:', insertError);
        toast.error('メッセージの送信に失敗しました');
        return;
      }

      // Send notification
      if (customer) {
        const { data: userData } = await supabase.auth.getUser();
        const therapistName = userData.user?.user_metadata?.name || 'セラピスト';
        await sendMessageNotification(
          customer.id,
          therapistName,
          newMessage.length > 30 ? newMessage.substring(0, 30) + '...' : newMessage
        );
      }

      // Clear form
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackToList = () => {
    navigate('/therapist-messages');
  };

  if (isLoading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          </div>
        </div>
      </TherapistLayout>
    );
  }

  if (!customer || !id) {
    return (
      <TherapistLayout>
        <div className="container py-6 space-y-4">
          <Breadcrumb 
            items={[
              { label: 'セラピストページ', href: '/therapist' },
              { label: 'メッセージ', href: '/therapist-messages', current: true }
            ]}
          />
  
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            {/* Desktop layout */}
            <div className="hidden md:flex h-[calc(100vh-200px)]">
              <MessageList activeConversationId={id} />
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground max-w-md p-6">
                  <h3 className="text-lg font-medium mb-1">会話を選択してください</h3>
                  <p className="text-sm">
                    左側のリストから顧客を選んでメッセージのやり取りを開始します
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden h-[calc(100vh-160px)]">
              <MessageList activeConversationId={id} />
            </div>
          </div>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="container py-6 space-y-4">
        <Breadcrumb 
          items={[
            { label: 'セラピストページ', href: '/therapist' },
            { label: 'メッセージ', href: '/therapist-messages' },
            { label: customer.name, href: `/therapist-messages/${customer.id}`, current: true }
          ]}
        />
        
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {/* Desktop layout */}
          <div className="hidden md:flex h-[calc(100vh-200px)]">
            <MessageList activeConversationId={id} />
            
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={customer.imageUrl}
                    alt={customer.name}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div>
                    <h2 className="font-semibold">{customer.name}</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        顧客
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto bg-muted/20 flex flex-col space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender_id === therapistId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-2xl p-3 max-w-[80%] ${
                        message.sender_id === therapistId 
                          ? 'bg-primary text-primary-foreground rounded-br-none' 
                          : 'bg-card border rounded-tl-none'
                      }`}
                    >
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                      
                      {message.image_url && (
                        <div className="mt-2 max-w-[240px]">
                          <img 
                            src={message.image_url} 
                            alt="Shared" 
                            className="rounded-lg w-full h-auto object-cover cursor-pointer"
                            onClick={() => window.open(message.image_url || '', '_blank')}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end gap-0.5 mt-1">
                        <span className="text-[10px] opacity-70">
                          {formatMessageDate(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                {imagePreview && (
                  <div className="mb-3 relative bg-muted/20 p-2 rounded-lg">
                    <div className="flex items-start gap-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="p-1 bg-card rounded-full shadow-sm border"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    placeholder="メッセージを入力..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(!newMessage.trim() && !selectedImage) || isSending}
                  >
                    {isSending ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-current" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden h-[calc(100vh-160px)] flex flex-col">
            {showMobileMessageList ? (
              <MessageList activeConversationId={id} />
            ) : (
              <>
                {/* Mobile conversation header with back button */}
                <div className="p-4 border-b flex items-center gap-3 bg-background">
                  <button
                    onClick={handleBackToList}
                    className="p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <img
                    src={customer.imageUrl}
                    alt={customer.name}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div>
                    <h2 className="font-semibold">{customer.name}</h2>
                    <span className="text-xs text-muted-foreground">顧客</span>
                  </div>
                </div>
                
                {/* Mobile messages area */}
                <div className="p-4 flex-1 overflow-y-auto bg-muted/20 flex flex-col space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender_id === therapistId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`rounded-2xl p-3 max-w-[85%] ${
                          message.sender_id === therapistId 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-card border rounded-tl-none'
                        }`}
                      >
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                        
                        {message.image_url && (
                          <div className="mt-2 max-w-[200px]">
                            <img 
                              src={message.image_url} 
                              alt="Shared" 
                              className="rounded-lg w-full h-auto object-cover cursor-pointer"
                              onClick={() => window.open(message.image_url || '', '_blank')}
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end gap-0.5 mt-1">
                          <span className="text-[10px] opacity-70">
                            {formatMessageDate(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Mobile input form - ensure it's always visible */}
                <div className="p-4 border-t bg-background flex-shrink-0">
                  <form onSubmit={handleSendMessage}>
                    {imagePreview && (
                      <div className="mb-3 relative bg-muted/20 p-2 rounded-lg">
                        <div className="flex items-start gap-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            className="p-1 bg-card rounded-full shadow-sm border"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="メッセージを入力..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted/50 transition-colors flex-shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        disabled={(!newMessage.trim() && !selectedImage) || isSending}
                      >
                        {isSending ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-current" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistMessagesNew; 