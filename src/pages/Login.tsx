import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
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
        toast.error(error.message, {
          duration: 3000,
        });
        return;
      }

      if (data) {
        toast.success("ログインしました", {
          duration: 3000,
          dismissible: true,
        });
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
          
        if (profile) {
          switch (profile.user_type) {
            case 'store':
              navigate("/store-admin");
              break;
            case 'therapist':
              navigate("/therapist-dashboard");
              break;
            default:
              navigate("/");
              break;
          }
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("ログイン中にエラーが発生しました", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(error.message, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Googleログイン中にエラーが発生しました", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-pink-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">ログイン</CardTitle>
            <CardDescription>
              アカウントにログインしてサービスをご利用ください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-gray-300"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20484C17.64 8.56741 17.5827 7.95404 17.4764 7.36444H9V10.8454H13.8436C13.635 11.9701 13.0009 12.9225 12.0477 13.5614V15.8201H14.9564C16.6582 14.2528 17.64 11.9462 17.64 9.20484Z" fill="#4285F4"/>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8201L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0427C2.43818 15.9828 5.48182 18 9 18Z" fill="#34A853"/>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59319 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95737H0.957273C0.347727 6.17319 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0427L3.96409 10.71Z" fill="#FBBC05"/>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01723 0.957275 4.95737L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
                Googleでログイン
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-gray-300 bg-[#06C755] text-white hover:bg-[#06C755]/90"
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18 7.7543C18 3.4748 13.9706 0 9 0C4.02944 0 0 3.4748 0 7.7543C0 11.6116 3.33687 14.8264 7.7625 15.5193C8.0886 15.5993 8.55 15.7619 8.66497 16.0335C8.76825 16.2819 8.73487 16.6699 8.7021 16.9183L8.60025 17.6378C8.56597 17.9265 8.40113 18.9058 9 18.5412C9.59887 18.1759 13.0223 15.957 14.6353 14.031C15.6661 12.8189 16.2 11.3583 16.2 9.83115H18V7.7543Z" fill="white"/>
                  <path d="M6.35389 10.6237H3.84889C3.65597 10.6237 3.5 10.4679 3.5 10.2751V6.05314C3.5 5.86042 3.65597 5.70455 3.84889 5.70455H6.35389C6.54681 5.70455 6.70278 5.86042 6.70278 6.05314V10.2751C6.70278 10.4679 6.54681 10.6237 6.35389 10.6237Z" fill="#06C755"/>
                  <path d="M14.1514 10.6237H11.6464C11.4535 10.6237 11.2975 10.4679 11.2975 10.2751V6.05314C11.2975 5.86042 11.4535 5.70455 11.6464 5.70455H14.1514C14.3443 5.70455 14.5003 5.86042 14.5003 6.05314V10.2751C14.5003 10.4679 14.3443 10.6237 14.1514 10.6237Z" fill="#06C755"/>
                  <path d="M10.2526 10.6237H7.74761C7.55469 10.6237 7.39872 10.4679 7.39872 10.2751V6.05314C7.39872 5.86042 7.55469 5.70455 7.74761 5.70455H10.2526C10.4455 5.70455 10.6015 5.86042 10.6015 6.05314V10.2751C10.6015 10.4679 10.4455 10.6237 10.2526 10.6237Z" fill="#06C755"/>
                </svg>
                LINEでログイン
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">または</span>
              </div>
            </div>
            
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
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
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
              <Link to="/signup" className="text-primary hover:underline ml-1">
                新規会員登録
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
