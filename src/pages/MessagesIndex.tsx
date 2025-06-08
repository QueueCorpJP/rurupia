import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MessageList from '../components/MessageList';
import { MessageSquare, MessageCircle, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const MessagesIndex = () => {
  const navigate = useNavigate();
  const [hasConversations, setHasConversations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkConversations = async () => {
      try {
        console.log("MessagesIndex: Checking for conversations");
        setIsLoading(true);
        
        // Get current user
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        
        console.log("MessagesIndex: Current user:", user);
        
        if (!user) {
          console.log("MessagesIndex: No user found, redirecting to login");
          toast.error("ログインが必要です");
          navigate('/login');
          return;
        }
        
        setUserId(user.id);
        
        // Check if the user has any conversations
        const { data: messages, error, count } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .limit(1);
          
        if (error) {
          console.error("MessagesIndex: Error fetching messages:", error);
          return;
        }
        
        console.log("MessagesIndex: Conversations count:", count);
        console.log("MessagesIndex: Messages data:", messages);
        
        setHasConversations(count !== null && count > 0);
      } catch (error) {
        console.error("MessagesIndex: Error in checkConversations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConversations();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">読み込み中...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container space-y-6 py-8">
        <Breadcrumb 
          items={[
            { label: 'マイページ', href: '/user-profile' },
            { label: 'メッセージ', href: '/messages', current: true }
          ]}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">メッセージ</h1>
          <p className="text-muted-foreground">
            セラピストとのメッセージのやり取りを管理します
          </p>
        </div>
        
        {hasConversations ? (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-80 lg:w-80 xl:w-96 flex-shrink-0">
              <MessageList />
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 bg-muted/30 min-w-0">
              <div className="text-center space-y-4 max-w-md">
                <MessageSquare className="h-12 w-12 mx-auto text-primary" />
                <h2 className="font-semibold text-xl">メッセージを選択</h2>
                <p className="text-muted-foreground">
                  左側のリストからセラピストを選択して会話を始めるか、
                  セラピストのプロフィールに移動して新しい会話を開始してください。
                </p>
                <Button
                  onClick={() => navigate('/therapists')}
                  className="w-full"
                >
                  セラピストを探す
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-8">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="relative">
                <div className="absolute -left-4 top-0">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="absolute -right-4 bottom-0">
                  <MessageSquare className="h-10 w-10 text-primary/20" />
                </div>
                <MessageSquare className="h-16 w-16 mx-auto text-primary" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  まだメッセージがありません
                </h2>
                <p className="text-muted-foreground">
                  セラピストを見つけて、あなたに合った施術について相談してみましょう。
                  気になるセラピストのプロフィールから、簡単にメッセージを送ることができます。
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => navigate('/therapists')}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  セラピストを探す
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    または
                  </span>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="キーワードでセラピストを検索..."
                  className="w-full pl-9 pr-4 py-2 text-sm border rounded-md bg-background"
                  onChange={(e) => navigate(`/therapists?search=${e.target.value}`)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MessagesIndex;
