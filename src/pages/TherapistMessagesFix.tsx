import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import MessageList from '@/components/MessageList';
import { Send, Paperclip, ArrowLeft, Check, CheckCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { sendMessageNotification } from '@/utils/notification-service';

// Message interface
interface IMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  timestamp: string;
  is_read: boolean;
}

// Customer info interface
interface CustomerInfo {
  id: string;
  name: string;
  imageUrl: string;
}

const TherapistMessagesFix = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [showMobileMessageList, setShowMobileMessageList] = useState(false);

  // Set up real-time subscription for new messages
  useEffect(() => {
    const setupSubscription = async () => {
      // Get the current user
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      
      if (!user) {
        toast.error("ログインが必要です");
        navigate('/login');
        return;
      }
      
      setTherapistId(user.id);
      setSession(data.session); // Set the session
      
      // Subscribe to new messages
      const channel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            console.log('[TherapistMessagesFix] Real-time update:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newMsg = payload.new as IMessage;
              if (
                (newMsg.sender_id === id && newMsg.receiver_id === user.id) ||
                (newMsg.sender_id === user.id && newMsg.receiver_id === id)
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
                (updatedMsg.sender_id === id && updatedMsg.receiver_id === user.id) ||
                (updatedMsg.sender_id === user.id && updatedMsg.receiver_id === id)
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
    };
    
    setupSubscription();
  }, [navigate, id]);

  // Fetch the customer and message data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (!id) return;
        
        // Get the current user
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        
        if (!user) {
          toast.error("ログインが必要です");
          navigate('/login');
          return;
        }
        
        setTherapistId(user.id);
        setSession(data.session); // Set the session
        
        // Fetch customer info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, nickname, avatar_url')
          .eq('id', id)
          .single();
          
        if (profileError) {
          console.error('Error fetching customer profile:', profileError);
          toast.error('顧客情報の取得に失敗しました');
          return;
        }
        
        if (profileData) {
          // Create a CustomerInfo object from profileData
          setCustomer({
            id: profileData.id,
            name: profileData.nickname || profileData.name || 'Customer',
            imageUrl: profileData.avatar_url || '/placeholder.svg',
          });
        }
        
        // Fetch messages between current therapist and customer
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
          .order('timestamp', { ascending: true });
          
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          toast.error('メッセージの取得に失敗しました');
          return;
        }
        
        if (messagesData) {
          setMessages(messagesData);
          
          // Mark all messages from customer as read
          const unreadMessages = messagesData.filter(msg => 
            msg.sender_id === id && 
            msg.receiver_id === user.id && 
            !msg.is_read
          );
          
          if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(msg => msg.id);
            const { error: updateError } = await supabase
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
        console.error('Error fetching data:', error);
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

  // Update mobile view state when id changes
  useEffect(() => {
    // If there's no id, show message list on mobile
    // If there's an id, show conversation view on mobile  
    setShowMobileMessageList(!id);
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;
    
    // Ensure we have session and user data
    if (!session || !session.user) {
      console.error('Session or user data missing, retrieving session again');
      const { data } = await supabase.auth.getSession();
      
      if (!data.session || !data.session.user) {
        toast.error('セッションが無効です。再度ログインしてください。');
        navigate('/login');
        return;
      }
      
      setSession(data.session);
    }

    try {
      setIsSending(true);
      
      // Handle file upload if there's an image
      let imageUrl = null;
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
          setIsSending(false);
          return;
        }
        
        const { data: urlData } = supabase.storage
          .from('messages')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      const newMessageData = {
        id: uuidv4(),
        sender_id: session.user.id,
        receiver_id: customer?.id || '',
        content: newMessage.trim(),
        image_url: imageUrl,
        timestamp: new Date().toISOString(),
        is_read: false
      };
      
      console.log('Sending message:', newMessageData);
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessageData)
        .select();
        
      if (error) {
        console.error('Error inserting message:', error);
        throw error;
      }
      
      if (data && data[0]) {
        console.log('Message sent successfully:', data[0]);
        // Add the new message to the state
        setMessages(prev => [...prev, data[0]]);
      }
      
      // Send notification to customer
      if (customer) {
        const therapistName = session.user.user_metadata?.name || 'セラピスト';
        await sendMessageNotification(
          customer.id,
          therapistName,
          newMessage.length > 30 ? newMessage.substring(0, 30) + '...' : newMessage
        );
      }
      
      // Reset message state
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      
      // Scroll to bottom after a short delay to allow the message to render
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('画像サイズは5MB以下にしてください');
        return;
      }
      
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
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatus = (message: IMessage) => {
    // Removed read receipt functionality as requested
    return null;
  };

  const handleBackToList = () => {
    navigate('/therapist-messages');
  };

  const handleConversationSelect = () => {
    setShowMobileMessageList(false);
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
                        {getMessageStatus(message)}
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
                <div className="p-4 border-b flex items-center gap-3">
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
                          {getMessageStatus(message)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Mobile input form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
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
              </>
            )}
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistMessagesFix; 