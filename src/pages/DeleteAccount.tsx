
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できません", {
          duration: 3000,
        });
        return;
      }

      console.log("Attempting to delete user with ID:", user.id);
      
      // Call the delete_user RPC function
      const { error } = await supabase.rpc('delete_user', {
        user_id: user.id
      });
      
      if (error) {
        console.error("Error calling delete_user function:", error);
        throw error;
      }
      
      toast.success("アカウントが削除されました", {
        duration: 3000,
      });
      navigate("/");
      
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("アカウントの削除に失敗しました", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">アカウント削除</h1>
        
        <Card>
          <CardHeader className="bg-red-50 text-red-900 border-b border-red-100">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              アカウント削除について
            </CardTitle>
            <CardDescription className="text-red-700">
              アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-gray-700 mb-4">
                アカウントを削除する前に、次の影響について確認してください：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>すべての個人情報が削除されます</li>
                <li>過去の予約履歴にアクセスできなくなります</li>
                <li>お気に入りやフォロー中のセラピストが削除されます</li>
                <li>アカウントを復元することはできません</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-reason">削除の理由（任意）</Label>
              <Textarea 
                id="delete-reason" 
                placeholder="アカウントを削除する理由を教えてください"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                サービス改善のため、ご意見をお聞かせください
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-red-600 font-semibold">
                確認のため「削除します」と入力してください
              </Label>
              <Input 
                id="confirm-delete" 
                className="border-red-300 focus:ring-red-500"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
            
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full mt-4"
                  disabled={confirmText !== "削除します" || loading}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  アカウントを削除する
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消すことができません。すべてのデータが完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeleteAccount;
