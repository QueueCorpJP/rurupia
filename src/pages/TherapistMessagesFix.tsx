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

  // Set up real-time subscription for new messages
  useEffect(() => {
    const setupSubscription = async () => {
      // Get the current therapist
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;
      
      if (!currentUser) {
        toast.error("ログインが必要です");
        navigate('/therapist-login');
        return;
      }
      
      setTherapistId(currentUser.id);
      
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
            // If the message is for the current conversation, add it to the messages
            if (id && payload.new.sender_id === id) {
              setMessages(prev => [...prev, payload.new as IMessage]);
              // Play notification sound or show toast
              toast.success('新しいメッセージが届きました');
            } else {
              // If it's from another conversation, just show a notification
              toast.success('新しいメッセージが届きました');
            }
          }
        )
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupSubscription();
  }, [navigate, id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (!id) return;
        
        // Get the current therapist
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        
        if (!currentUser) {
          toast.error("ログインが必要です");
          navigate('/therapist-login');
          return;
        }
        
        setTherapistId(currentUser.id);
        
        // Fetch user info
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (userError) {
          console.error('Error fetching user:', userError);
          toast.error('ユーザー情報の取得に失敗しました');
          return;
        }
        
        if (userData) {
          // Create a UserInfo object from userData
          setUser({
            id: userData.id,
            name: userData.name || 'User',
            imageUrl: userData.avatar_url || '/placeholder.svg',
          });
        }
        
        // Fetch messages between current therapist and user
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
          .order('timestamp', { ascending: true });
          
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          toast.error('メッセージの取得に失敗しました');
          return;
        }
        
        if (messagesData) {
          setMessages(messagesData);
          
          // Mark all messages from user as read
          const unreadMessages = messagesData.filter(msg => 
            msg.sender_id === id && 
            msg.receiver_id === currentUser.id && 
            !msg.is_read
          );
          
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
                  {user && (
                    <div className="p-4 border-b flex items-center">
                      <button
                        className="mr-2 md:hidden"
                        onClick={() => navigate('/therapist-messages')}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      
                      <div className="flex-shrink-0">
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      
                      <div className="ml-3">
                        <h3 className="font-semibold">{user.name}</h3>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.sender_id === therapistId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[75%] rounded-lg p-3 ${
                            message.sender_id === therapistId 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          {message.content && (
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          
                          {message.image_url && (
                            <div className="mt-2">
                              <img 
                                src={message.image_url} 
                                alt="Attached" 
                                className="max-h-60 rounded object-contain cursor-pointer" 
                                onClick={() => window.open(message.image_url || '', '_blank')}
                              />
                            </div>
                          )}
                          
                          <div className="text-xs mt-1 flex justify-end items-center gap-1 opacity-70">
                            {formatMessageDate(message.timestamp)}
                            {getMessageStatus(message)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    {imagePreview && (
                      <div className="relative inline-block mb-2">
                        <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
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
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      
                      <button
                        type="button"
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      
                      <button
                        type="submit"
                        className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50"
                        disabled={!newMessage.trim() && !selectedImage}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border-l p-4">
                  <div className="text-center text-muted-foreground">
                    <p>会話を選択してください</p>
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