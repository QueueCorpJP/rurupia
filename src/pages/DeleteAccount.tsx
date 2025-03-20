
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const DeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('ユーザー情報が見つかりません');
        return;
      }
      
      // Call the RPC function to delete the user
      const { error } = await supabase.rpc('delete_user', {
        user_id: user.id
      });

      if (error) throw error;
      
      toast.success('アカウントが削除されました');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('アカウント削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle>アカウント削除</CardTitle>
            <CardDescription>一度削除すると、アカウントを復元することはできません</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                アカウントを削除すると、すべてのプロフィール情報、予約履歴、メッセージが完全に消去されます。この操作は取り消せません。
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={isDeleting}
              className="w-full"
            >
              {isDeleting ? '処理中...' : 'アカウントを完全に削除する'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full"
            >
              キャンセル
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default DeleteAccount;
