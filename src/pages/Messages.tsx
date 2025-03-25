import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MessageList from '../components/MessageList';
import { Therapist, Message } from '../utils/types';
import { Send, Paperclip, ArrowLeft, Check, CheckCheck, Image, Smile, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Updated interface for messages from Supabase
interface IMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  timestamp: string;
  is_read: boolean;
}

// Simple Therapist interface
interface TherapistInfo {
  id: string;
  name: string;
  imageUrl: string;
  specialties: string[];
}

const Messages = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      setUserId(user.id);
      
      // Subscribe to new messages
      const subscription = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
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
        
        // Get the current user
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        
        if (!user) {
          toast.error("ログインが必要です");
          navigate('/login');
          return;
        }
        
        setUserId(user.id);
        
        // Fetch therapist info
        const { data: therapistData, error: therapistError } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', id)
          .single();
          
        if (therapistError) {
          console.error('Error fetching therapist:', therapistError);
          toast.error('セラピスト情報の取得に失敗しました');
          return;
        }
        
        if (therapistData) {
          // Create a TherapistInfo object from therapistData
          setTherapist({
            id: therapistData.id,
            name: therapistData.name,
            imageUrl: therapistData.image_url || '/placeholder.svg',
            specialties: therapistData.specialties || ['マッサージ'],
          });
        }
        
        // Fetch messages between current user and therapist
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
          
          // Mark all messages from therapist as read
          const unreadMessages = messagesData.filter(msg => 
            msg.sender_id === id && 
            msg.receiver_id === user.id && 
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
    
    if ((!newMessage.trim() && !selectedImage) || !therapist || !userId) return;
    
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
        sender_id: userId,
        receiver_id: therapist.id, // This is a string now
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
    if (message.sender_id !== userId) return null; // Only show status for sent messages
    
    return message.is_read ? (
      <CheckCheck className="h-3.5 w-3.5 text-primary ml-1" />
    ) : (
      <Check className="h-3.5 w-3.5 text-muted-foreground ml-1" />
    );
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
          <h2 className="text-2xl font-bold">セラピストが見つかりません</h2>
          <p className="text-muted-foreground mt-2">
            お探しのセラピストは存在しないか、削除されました。
          </p>
          <button
            onClick={() => navigate('/messages')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            メッセージ一覧に戻る
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/messages')}
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          メッセージ一覧に戻る
        </button>
        
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-200px)]">
          <MessageList activeConversationId={id} />
          
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={therapist.imageUrl}
                  alt={therapist.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold">{therapist.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="px-1.5 py-0 text-xs font-normal bg-muted/50">
                      {therapist.specialties[0]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      通常2時間以内に返信
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate(`/therapists/${therapist.id}`)}
                className="text-sm text-primary hover:underline"
              >
                プロフィールを見る
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto bg-muted/20 flex flex-col space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-2xl p-3 max-w-[80%] ${
                      message.sender_id === userId 
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
                  disabled={!newMessage.trim() && !selectedImage}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
