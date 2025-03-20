import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DeleteAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!window.confirm("アカウントを削除してもよろしいですか？この操作は元に戻せません。")) {
      return;
    }

    try {
      setIsLoading(true);
      // Call RPC function without passing any parameters since it uses auth.uid() internally
      const { error } = await supabase.rpc('delete_user');
    
      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/");
      toast.success("アカウントが正常に削除されました");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("アカウントの削除中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-destructive">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-destructive">アカウント削除</CardTitle>
            <CardDescription>
              アカウントを削除すると、すべてのデータが削除されます。
              この操作は元に戻せません。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              アカウントを削除すると、以下の情報がすべて削除されます。
            </p>
            <ul className="list-disc pl-5">
              <li>プロフィール情報</li>
              <li>予約履歴</li>
              <li>メッセージ</li>
              <li>その他すべてのデータ</li>
            </ul>
            <p>
              本当にアカウントを削除してもよろしいですか？
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              {isLoading ? "削除中..." : "アカウントを削除"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default DeleteAccount;
