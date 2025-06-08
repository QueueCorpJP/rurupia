import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import MessageList from '@/components/MessageList';
import { supabase } from '@/integrations/supabase/client';

const TherapistMessages = () => {
  const [therapistId, setTherapistId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTherapistId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setTherapistId(user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getTherapistId();
  }, []);

  return (
    <TherapistLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">メッセージ</h1>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">読み込み中...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex h-[calc(100vh-250px)] flex-col md:flex-row">
              <div className="w-full md:w-80 lg:w-80 xl:w-96 flex-shrink-0">
                <MessageList />
              </div>
              <div className="flex-1 flex items-center justify-center border-l p-4 min-w-0">
                <div className="text-center text-muted-foreground">
                  <p>会話を選択してください</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TherapistLayout>
  );
};

export default TherapistMessages;
