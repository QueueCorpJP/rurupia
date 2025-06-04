import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";

const LineCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorParam) {
          setError(`LINE認証エラー: ${errorDescription || errorParam}`);
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError("認証コードが見つかりません");
          setIsProcessing(false);
          return;
        }

        // Ensure this URI exactly matches what is registered in your LINE console
        const REDIRECT_URI = import.meta.env.VITE_LINE_REDIRECT_URI || "https://rupipia.jp/line-callback";

        // Get the client credentials from environment variables
        const LINE_CLIENT_ID = import.meta.env.VITE_APP_LINE_CLIENT_ID;
        const LINE_CLIENT_SECRET = import.meta.env.VITE_APP_LINE_CLIENT_SECRET;

        console.log("Using LINE credentials:", { 
          clientId: LINE_CLIENT_ID, 
          redirectUri: REDIRECT_URI,
          hasSecret: !!LINE_CLIENT_SECRET
        });

        // Exchange the authorization code for an access token with LINE's API
        const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            client_id: LINE_CLIENT_ID,
            client_secret: LINE_CLIENT_SECRET,
          }),
        });

        if (!tokenResponse.ok) {
          const errData = await tokenResponse.json();
          console.error("Token exchange error:", errData);
          setError(`トークン交換に失敗しました: ${errData.error || tokenResponse.statusText}`);
          setIsProcessing(false);
          return;
        }

        const tokenData = await tokenResponse.json();
        console.log("Token data received:", tokenData);

        const { id_token, access_token } = tokenData;

        if (!id_token) {
          setError("LINE IDトークンが見つかりません。");
          setIsProcessing(false);
          return;
        }

        // Decode the ID token to get user info (simple JWT parsing)
        const base64Url = id_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const idTokenData = JSON.parse(jsonPayload);
        
        // Get user profile from LINE API
        const profileResponse = await fetch("https://api.line.me/v2/profile", {
          headers: {
            "Authorization": `Bearer ${access_token}`,
          },
        });

        if (!profileResponse.ok) {
          setError("LINEプロフィール情報の取得に失敗しました");
          setIsProcessing(false);
          return;
        }

        const profileData = await profileResponse.json();
        const { userId, displayName, pictureUrl } = profileData;
        const email = idTokenData.email;

        // Check if user already exists in profiles table by line_id
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('line_id', userId)
          .single();

        let authResult;
        let isNewUser = false;

        if (existingProfile) {
          // User exists, sign them in using their email
          if (email) {
            // Create a one-time password for LINE users
            const tempPassword = `line_${userId}_${Date.now()}`;
            authResult = await supabase.auth.signInWithPassword({
              email: email,
              password: tempPassword
            });

            // If sign in fails, try to create the user with this password
            if (authResult.error) {
              authResult = await supabase.auth.signUp({
                email: email,
                password: tempPassword,
                options: {
                  data: {
                    line_id: userId,
                    full_name: displayName,
                    avatar_url: pictureUrl,
                    provider: 'line'
                  }
                }
              });
            }
          } else {
            setError("LINEアカウントにメールアドレスが設定されていません");
            setIsProcessing(false);
            return;
          }
        } else {
          // New user, create account
          if (!email) {
            setError("LINEアカウントにメールアドレスが設定されていません");
            setIsProcessing(false);
            return;
          }

          const tempPassword = `line_${userId}_${Date.now()}`;
          authResult = await supabase.auth.signUp({
            email: email,
            password: tempPassword,
            options: {
              data: {
                line_id: userId,
                full_name: displayName,
                avatar_url: pictureUrl,
                provider: 'line',
                user_type: 'customer'
              }
            }
          });
          isNewUser = true;
        }

        if (authResult.error) {
          console.error("Supabase auth error:", authResult.error);
          setError(`認証エラー: ${authResult.error.message}`);
          setIsProcessing(false);
          return;
        }

        // Update profile with LINE information
        if (authResult.data.user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: authResult.data.user.id,
              email: email,
              full_name: displayName,
              avatar_url: pictureUrl,
              line_id: userId,
              user_type: 'customer'
            });

          if (updateError) {
            console.error("Profile update error:", updateError);
            // Don't fail the auth for this
          }

          // Store user type for UI
          localStorage.setItem('nokutoru_user_type', 'customer');
          
          toast.success("LINEアカウントで正常にログインしました！");
          
          const intent = sessionStorage.getItem("line_auth_intent") || "login";
          sessionStorage.removeItem("line_auth_intent");

          // Navigate based on whether it was a login or a new user signup via LINE
          if (intent === "signup" && isNewUser) {
            navigate("/user-profile"); // Or a welcome/profile completion page
          } else {
            navigate("/user-profile"); // Default navigation for login
          }
        } else {
          setError("ユーザー認証に失敗しました");
          setIsProcessing(false);
        }

      } catch (err) {
        console.error("LINE callback error:", err);
        setError("処理中にエラーが発生しました");
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center min-h-[60vh]">
        {isProcessing ? (
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
            <h2 className="text-xl font-semibold mb-2">LINEアカウントで認証中...</h2>
            <p className="text-muted-foreground">このページを閉じないでください</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              ログインページに戻る
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
              <p>認証が完了しました。リダイレクトします...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LineCallback;
