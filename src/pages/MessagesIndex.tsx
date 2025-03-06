
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MessageList from '../components/MessageList';
import { MessageSquare, MessageCircle, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

const MessagesIndex = () => {
  const navigate = useNavigate();
  const [hasTherapists] = useState(false); // This would normally come from your data/API

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">メッセージ</h1>
          <p className="text-muted-foreground mt-2">
            セラピストとのメッセージのやり取りを管理します
          </p>
        </div>
        
        {hasTherapists ? (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden flex flex-col md:flex-row">
            <MessageList />
            
            <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
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
