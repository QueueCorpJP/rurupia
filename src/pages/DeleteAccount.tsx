
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DeleteAccount = () => {
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('正しい確認コードを入力してください');
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('ユーザー情報の取得に失敗しました');
        return;
      }

      // Call the Supabase function to delete the user account
      // Note: This would require a Supabase Edge Function to be set up
      // that handles the user deletion process
      const { error } = await supabase.functions.invoke('delete_user_account');

      if (error) throw error;

      toast.success('アカウントが削除されました');
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('アカウントの削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">アカウント削除</CardTitle>
          <CardDescription className="text-center">
            アカウントを削除すると、すべてのデータが完全に削除されます。この操作は元に戻せません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">確認のため「DELETE」と入力してください</Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleDeleteAccount}
            disabled={confirmation !== 'DELETE' || isLoading}
          >
            {isLoading ? 'アカウント削除中...' : 'アカウントを永久に削除する'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeleteAccount;
