import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { setupAdminUser } from '@/utils/admin-setup';

const AdminSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const user = await setupAdminUser();
      if (user) {
        toast({
          title: "セットアップ完了",
          description: "管理者アカウントが作成されました",
        });
        navigate('/admin/login');
      } else {
        toast({
          title: "エラー",
          description: "管理者アカウントの作成に失敗しました",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "エラー",
        description: "セットアップ中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">管理者セットアップ</h2>
          <p className="mt-2 text-sm text-gray-600">
            管理者アカウントを作成します
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  注意
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    このセットアップは一度だけ実行できます。
                    既に管理者アカウントが存在する場合は作成されません。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSetup}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'セットアップ中...' : '管理者アカウントを作成'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup; 