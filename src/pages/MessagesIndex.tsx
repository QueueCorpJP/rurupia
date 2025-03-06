
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MessageList from '../components/MessageList';
import { MessageSquare } from 'lucide-react';

const MessagesIndex = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">メッセージ</h1>
          <p className="text-muted-foreground mt-2">
            セラピストとのメッセージのやり取りを管理します
          </p>
        </div>
        
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
              <button
                onClick={() => navigate('/therapists')}
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-full"
              >
                セラピストを探す
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesIndex;
