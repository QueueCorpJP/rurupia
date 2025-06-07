import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current user's email on component mount
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email || "");
      } else {
        // If no user is logged in, redirect to login page
        navigate('/login');
      }
    };
    
    getUser();
  }, [navigate]);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmDelete !== "DELETE") {
      toast.error("確認のため「DELETE」と入力してください");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (!userEmail) {
        toast.error("ユーザー情報が見つかりません");
        return;
      }
      
      // Verify password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });
      
      if (verifyError) {
        toast.error("パスワードが正しくありません");
        return;
      }

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("認証セッションが見つかりません");
        return;
      }

      // Call the Edge Function to delete the user account
      const response = await fetch('/functions/v1/delete-user-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          password: password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'アカウント削除に失敗しました');
      }
      
      toast.success("アカウントが削除されました");
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error instanceof Error ? error.message : "アカウント削除中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <form onSubmit={handleDeleteAccount} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">アカウント削除</h1>
            <p className="text-muted-foreground">
              アカウントを削除すると、すべてのデータが削除され、復元できません。
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">アカウント削除の確認</Label>
            <Input
              id="confirm"
              type="text"
              placeholder="確認のため「DELETE」と入力してください"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "処理中..." : "アカウントを削除"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default DeleteAccount;
