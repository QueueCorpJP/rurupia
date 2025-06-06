import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StoreLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }
      
      // Check if the user is banned
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', data.user?.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      if (profileData?.status === 'rejected') {
        // User is banned, sign them out and show error
        await supabase.auth.signOut();
        toast.error("このアカウントはバンされています。管理者にお問い合わせください。", {
          duration: 5000,
        });
        return;
      }

      // Check if the user is a store and their status
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, status')
        .eq('id', data.user?.id)
        .maybeSingle();
        
      if (storeError) {
        console.error("Error checking store status:", storeError);
        toast.error("ログイン処理に失敗しました");
        return;
      }
      
      if (!storeData) {
        // Not a store
        await supabase.auth.signOut();
        toast.error("店舗アカウントが見つかりませんでした");
        return;
      }

      // Check store status and redirect accordingly
      if (storeData.status === 'pending') {
        toast.success("ログインしました");
        navigate("/store-pending");
      } else if (storeData.status === 'rejected') {
        await supabase.auth.signOut();
        toast.error("申し訳ございませんが、店舗登録が承認されませんでした。詳細については管理者にお問い合わせください。");
        return;
      } else {
        toast.success("ログインしました");
        navigate("/store-admin");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error("ログイン中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-pink-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">店舗ログイン</CardTitle>
            <CardDescription>
              店舗アカウントにログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    ログイン状態を保持
                  </Label>
                </div>
                <Link to="/store-forgot-password" className="text-sm text-primary hover:underline">
                  パスワードをお忘れの方
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "処理中..." : "ログイン"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-muted-foreground">
              アカウントをお持ちでない方は
              <Link to="/store-signup" className="text-primary hover:underline ml-1">
                店舗登録
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default StoreLogin;
