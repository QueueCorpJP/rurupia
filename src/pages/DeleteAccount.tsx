
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DeleteAccount = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!confirmed) {
      toast.error('アカウント削除を確認するためにチェックボックスを選択してください');
      return;
    }

    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('ユーザーがログインしていません');
        return;
      }
      
      // Call the server-side function to delete the user
      // Remove any parameters as the RPC function doesn't expect any
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        console.error('Error deleting account:', error);
        toast.error('アカウントの削除中にエラーが発生しました');
        return;
      }
      
      toast.success('アカウントが削除されました');
      navigate('/');
      
    } catch (error) {
      console.error('Error in delete account process:', error);
      toast.error('エラーが発生しました。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-12">
      <Card className="border-destructive">
        <CardHeader className="bg-destructive/10 text-destructive">
          <CardTitle>アカウントの削除</CardTitle>
          <CardDescription className="text-destructive/80">この操作は元に戻せません</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4 text-muted-foreground">
            アカウントを削除すると、すべてのデータ、予約履歴、およびメッセージが完全に削除されます。この操作は元に戻せません。
          </p>
          
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox 
              id="confirm-delete" 
              checked={confirmed}
              onCheckedChange={(value) => setConfirmed(!!value)}
            />
            <Label htmlFor="confirm-delete" className="font-semibold">
              アカウントの削除を確認します
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/user-profile')}
            >
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              disabled={!confirmed || loading}
              onClick={handleDeleteAccount}
            >
              {loading ? 'お待ちください...' : 'アカウントを削除'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeleteAccount;
