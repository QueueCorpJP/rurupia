
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DeleteAccount = () => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const expectedConfirmText = 'DELETE ACCOUNT';

  const handleDelete = async () => {
    if (confirmText !== expectedConfirmText) {
      setError('正確に「DELETE ACCOUNT」と入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the delete_user function (requires the supabase-js v2)
      const { error } = await supabase.rpc<void>('delete_user');
      
      if (error) throw error;

      toast.success('アカウントが削除されました');
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError(error.message || 'アカウントの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-12">
      <Card className="border-destructive">
        <CardHeader className="bg-destructive/10 text-destructive">
          <CardTitle>アカウント削除</CardTitle>
          <CardDescription className="text-destructive/80">
            この操作は取り消すことができません
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>警告</AlertTitle>
            <AlertDescription>
              アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">確認</Label>
              <p className="text-sm text-muted-foreground mb-2">
                アカウントを削除するには「DELETE ACCOUNT」と入力してください
              </p>
              <Input
                id="confirm"
                placeholder="DELETE ACCOUNT"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col space-y-2 w-full">
            <Button 
              variant="destructive" 
              disabled={confirmText !== expectedConfirmText || loading}
              onClick={handleDelete}
            >
              {loading ? '処理中...' : 'アカウントを削除する'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              キャンセル
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeleteAccount;
