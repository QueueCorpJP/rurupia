
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MessageList from '../components/MessageList';
import { therapists } from '../utils/data';
import { Therapist, Message } from '../utils/types';
import { Send, Paperclip, ArrowLeft, Check, CheckCheck, Image, Smile, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const Messages = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call to fetch therapist data
    setTimeout(() => {
      if (id) {
        // Ensure proper comparison by converting types appropriately
        const foundTherapist = therapists.find(t => String(t.id) === id);
        setTherapist(foundTherapist || null);
        
        if (foundTherapist) {
          // Generate a few mock messages for this therapist
          const mockMessages: Message[] = [
            {
              id: '1',
              senderId: foundTherapist.id,
              receiverId: 0, // User ID
              content: "こんにちは！セッションのご予約ありがとうございます。お役に立てることがあれば、お気軽にお問い合わせください。",
              timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
              isRead: true,
              imageUrl: null
            },
            {
              id: '2',
              senderId: 0,
              receiverId: foundTherapist.id,
              content: "ありがとうございます。マッサージの予約をしたいのですが、来週の空き状況を教えていただけますか？",
              timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
              isRead: true,
              imageUrl: null
            },
            {
              id: '3',
              senderId: foundTherapist.id,
              receiverId: 0,
              content: "もちろんです。来週は火曜日の午後2時と、木曜日の午前10時に空きがあります。ご都合はいかがでしょうか？",
              timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
              isRead: true,
              imageUrl: "https://images.unsplash.com/photo-1519682577862-22b62b24e493?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
            }
          ];
          
          setMessages(mockMessages);
        }
      }
      setIsLoading(false);
    }, 800);
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || !therapist) return;
    
    // Create a new message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 0, // User ID
      receiverId: therapist.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
      imageUrl: imagePreview
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    
    // Simulate therapist response after a short delay
    setTimeout(() => {
      const therapistResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: therapist.id,
        receiverId: 0,
        content: "ご連絡ありがとうございます。できるだけ早くご返信いたします。",
        timestamp: new Date().toISOString(),
        isRead: false,
        imageUrl: null
      };
      
      setMessages(prev => [...prev, therapistResponse]);
      toast.success('新しいメッセージが届きました');
    }, 2000);
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
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== 0) return null; // Only show status for sent messages
    
    return message.isRead ? (
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
          <MessageList />
          
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
                  className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-2xl p-3 max-w-[80%] ${
                      message.senderId === 0 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-card border rounded-tl-none'
                    }`}
                  >
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    
                    {message.imageUrl && (
                      <div className="mt-2 max-w-[240px]">
                        <img 
                          src={message.imageUrl} 
                          alt="Shared" 
                          className="rounded-lg w-full h-auto object-cover cursor-pointer"
                          onClick={() => window.open(message.imageUrl || '', '_blank')}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end mt-1 gap-1">
                      <span className={`text-xs ${message.senderId === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatMessageDate(message.timestamp)}
                      </span>
                      {getMessageStatus(message)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {imagePreview && (
              <div className="p-3 border-t bg-card">
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-20 w-auto rounded-lg border"
                  />
                  <button
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
            
            <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2 bg-card">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-md h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 rounded-md h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Image className="h-5 w-5" />
              </button>
              
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="メッセージを入力..."
                className="flex-1"
              />
              
              <button
                type="button"
                className="shrink-0 rounded-md h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Smile className="h-5 w-5" />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim() && !selectedImage}
                className="shrink-0 bg-primary text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
