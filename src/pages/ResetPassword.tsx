import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenProcessing, setIsTokenProcessing] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processResetTokens = async () => {
      try {
        setIsTokenProcessing(true);
        
        // Parse hash fragments from URL
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        // Check for errors in URL
        if (error) {
          console.error("Reset password error from URL:", error, errorDescription);
          toast.error(`パスワードリセットエラー: ${errorDescription || error}`, {
            duration: 5000,
          });
          navigate("/login");
          return;
        }
        
        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error("Error setting session:", sessionError);
            toast.error("セッションの設定中にエラーが発生しました", {
              duration: 3000,
            });
            navigate("/login");
            return;
          }
          
          if (data.session?.user) {
            console.log("Password reset session established");
            setIsValidSession(true);
          } else {
            toast.error("有効なリセットセッションが確立できませんでした", {
              duration: 3000,
            });
            navigate("/login");
            return;
          }
        } else {
          // Check if we already have a valid session (user navigated directly to page)
          const { data, error: getSessionError } = await supabase.auth.getSession();
          
          if (getSessionError) {
            console.error("Error checking session:", getSessionError);
            toast.error("セッションの確認中にエラーが発生しました", {
              duration: 3000,
            });
            navigate("/login");
            return;
          }
          
          // Check if we have a valid recovery session
          if (data.session?.user) {
            console.log("Existing session found");
            setIsValidSession(true);
          } else {
            toast.error("パスワードリセットのリンクが無効または期限切れです", {
              duration: 3000,
            });
            navigate("/login");
            return;
          }
        }
      } catch (err) {
        console.error("Token processing error:", err);
        toast.error("認証処理中にエラーが発生しました", {
          duration: 3000,
        });
        navigate("/login");
      } finally {
        setIsTokenProcessing(false);
      }
    };
    
    processResetTokens();
  }, [navigate, location.hash]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません", {
        duration: 3000,
      });
      return;
    }
    
    if (password.length < 6) {
      toast.error("パスワードは6文字以上で入力してください", {
        duration: 3000,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(`パスワード更新エラー: ${error.message}`, {
          duration: 3000,
        });
        return;
      }

      toast.success("パスワードが正常に更新されました", {
        duration: 3000,
        dismissible: true,
      });
      
      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("パスワード更新中にエラーが発生しました", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while processing tokens
  if (isTokenProcessing) {
    return (
      <Layout>
        <div className="container max-w-md py-12">
          <Card className="border-pink-100">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
                <h3 className="text-lg font-semibold mb-2">認証処理中...</h3>
                <p className="text-sm text-muted-foreground">
                  パスワードリセットのトークンを確認しています
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show reset form only if we have a valid session
  if (!isValidSession) {
    return (
      <Layout>
        <div className="container max-w-md py-12">
          <Card className="border-red-100">
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  無効なリセットリンク
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  パスワードリセットリンクが無効または期限切れです
                </p>
                <Button onClick={() => navigate("/forgot-password")}>
                  新しいリセットリンクを要求
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-pink-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">新しいパスワードを設定</CardTitle>
            <CardDescription>
              新しいパスワードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">新しいパスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "処理中..." : "パスワードを更新"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              安全のため、8文字以上の強力なパスワードを設定してください
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword; 