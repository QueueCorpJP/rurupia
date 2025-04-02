import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const TherapistLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

      // Check if the user is a therapist
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .select('id')
        .eq('id', data.user?.id)
        .maybeSingle();
        
      if (therapistError) {
        console.error("Error checking therapist status:", therapistError);
        toast.error("ログイン処理に失敗しました");
        return;
      }
      
      if (!therapistData) {
        // Not a therapist - simply sign out without querying profiles
        await supabase.auth.signOut();
        toast.error("セラピストアカウントが見つかりませんでした");
        return;
      }

      toast.success("ログインしました");
      navigate("/therapist-dashboard");
      
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
            <CardTitle className="text-2xl">セラピストログイン</CardTitle>
            <CardDescription>
              セラピストアカウントにログインしてください
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal whitespace-nowrap">
                    {isMobile ? "ログイン保持" : "ログイン状態を保持"}
                  </Label>
                </div>
                <Link to="/therapist-forgot-password" className="text-sm text-primary hover:underline whitespace-nowrap">
                  {isMobile ? "パスワード忘れ" : "パスワードをお忘れの方"}
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
              <Link to="/therapist-signup" className="text-primary hover:underline ml-1">
                セラピスト登録
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default TherapistLogin;
