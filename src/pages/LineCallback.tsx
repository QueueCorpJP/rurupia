import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { getConfig } from "@/lib/config";
import { getSupabaseClient } from "@/integrations/supabase/client";

// Helper function to provide user-friendly error messages
const getFriendlyErrorMessage = (error: string, description?: string | null): string => {
  switch (error) {
    case 'access_denied':
      return 'LINEログインがキャンセルされました。再度お試しください。';
    case 'invalid_request':
      return 'LINE認証リクエストに問題があります。しばらく時間をおいて再度お試しください。';
    case 'server_error':
      return 'LINE側のサーバーエラーです。しばらく時間をおいて再度お試しください。';
    default:
      return `LINE認証エラー: ${description || error}`;
  }
};

// Helper function to provide user-friendly messages for LINE profile API issues
const getApiErrorMessage = (context: string, status: number): string => {
  switch (context) {
    case 'profile':
      if (status === 401) {
        return 'LINEアクセストークンの有効期限が切れています。再度ログインしてください。';
      }
      if (status === 403) {
        return 'LINEプロフィール情報へのアクセス権限がありません。';
      }
      break;
  }
  return `${context}情報の取得中にエラーが発生しました (Status: ${status})`;
};

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
          const friendlyErrorMessage = getFriendlyErrorMessage(errorParam, errorDescription);
          setError(friendlyErrorMessage);
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError("認証コードが見つかりません");
          setIsProcessing(false);
          return;
        }

        // Get configuration from API
        const config = await getConfig();
        
        // Ensure this URI exactly matches what is registered in your LINE console
        const REDIRECT_URI = config.VITE_LINE_REDIRECT_URI || "https://rupipia.jp/line-callback";

        // Get the client credentials from configuration
        const LINE_CLIENT_ID = config.VITE_APP_LINE_CLIENT_ID;
        const LINE_CLIENT_SECRET = config.VITE_APP_LINE_CLIENT_SECRET;

        if (!LINE_CLIENT_ID || !LINE_CLIENT_SECRET) {
          setError("LINE認証の設定が不完全です");
          setIsProcessing(false);
          return;
        }

        console.log("Using LINE credentials:", { 
          clientId: LINE_CLIENT_ID, 
          redirectUri: REDIRECT_URI,
          hasSecret: !!LINE_CLIENT_SECRET,
          code: code,
          actualCallbackUrl: window.location.href
        });

        // Exchange the authorization code for an access token with LINE's API
        const tokenRequestParams = {
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          client_id: LINE_CLIENT_ID,
          client_secret: LINE_CLIENT_SECRET,
        };

        console.log("Token exchange request params:", tokenRequestParams);

        const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(tokenRequestParams),
        });

        console.log("Token response status:", tokenResponse.status);
        console.log("Token response headers:", Object.fromEntries(tokenResponse.headers.entries()));

        if (!tokenResponse.ok) {
          const responseText = await tokenResponse.text();
          console.error("Token exchange error response (raw):", responseText);
          
          let errData;
          try {
            errData = JSON.parse(responseText);
          } catch (e) {
            errData = { error: responseText };
          }
          
          console.error("Token exchange error:", errData);
          setError(`トークン交換に失敗しました: ${errData.error || tokenResponse.statusText} (Status: ${tokenResponse.status})`);
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
        
        // Get user profile data from LINE
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (!profileResponse.ok) {
          const friendlyMessage = getApiErrorMessage('profile', profileResponse.status);
          throw new Error(friendlyMessage);
        }

        const profileData = await profileResponse.json();
        const { userId, displayName, pictureUrl } = profileData;

        console.log('LINE profile data:', profileData);

        // Skip email fetching from LINE since users can set email in account settings
        console.log('Skipping LINE email fetch - users can set email in account settings later');

        // Use the Edge Function to handle authentication for both new and existing users
        const { data: authData, error: authError } = await supabase.functions.invoke('line-auth-handler', {
          body: {
            id_token,
            access_token,
          }
        });

        if (authError) {
          console.error('Edge Function error:', authError);
          setError("LINE認証の処理中にサーバーエラーが発生しました。しばらく時間をおいて再度お試しください。");
          setIsProcessing(false);
          return;
        }

        if (!authData) {
          setError("認証データが取得できませんでした。");
          setIsProcessing(false);
          return;
        }

        console.log('Edge Function response:', authData);

        let authResult;

        // Handle authentication based on whether user is new or existing
        if (authData.is_new_user) {
          // For new users, we can try to sign up normally since they don't exist yet
          authResult = await supabase.auth.signUp({
            email: authData.auth_credentials.email,
            password: authData.auth_credentials.password,
            options: {
              data: {
                line_id: authData.profile.line_id,
                display_name: authData.profile.name,
                picture_url: authData.profile.picture,
                needs_email_setup: !authData.profile.email || authData.profile.email.includes('@temp.rupipia.jp'),
              }
            }
          });
        } else {
          // For existing users, we sign them in with the credentials provided by the Edge Function
          console.log('Existing user detected, signing in with provided credentials');
          
          authResult = await supabase.auth.signInWithPassword({
            email: authData.auth_credentials.email,
            password: authData.auth_credentials.password
          });
        }

        if (authResult.error) {
          console.error("Supabase auth error:", authResult.error);
          setError(`アカウント認証エラー: ${authResult.error.message}`);
          setIsProcessing(false);
          return;
        }

        // Update profile with LINE information
        if (authResult.data.user) {
          try {
            const config = await getConfig();
            const supabaseUrl = config.VITE_SUPABASE_URL;
            const supabaseAnonKey = config.VITE_SUPABASE_ANON_KEY;
            
            // Since we're not fetching email from LINE, users will need to set email in settings
            const userMetadata = authResult.data.user.user_metadata || {};
            const needsEmailSetup = true; // Always true for LINE users since we don't fetch email
            const userEmail = null; // Will be set later in account settings

            // Use direct fetch for profile upsert to avoid client issues
            const upsertResponse = await fetch(
              `${supabaseUrl}/rest/v1/profiles`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept-Profile': 'public',
                  'apikey': supabaseAnonKey,
                  'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                  id: authResult.data.user.id,
                  line_id: userId,
                  email: userEmail,
                  nickname: displayName,
                  avatar_url: pictureUrl,
                  needs_email_setup: needsEmailSetup,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
              }
            );

            if (!upsertResponse.ok) {
              console.error(`Profile upsert failed with status: ${upsertResponse.status} ${upsertResponse.statusText}`);
              const errorText = await upsertResponse.text();
              console.error('Upsert error response:', errorText);
              // Don't fail the auth for this
            } else {
              console.log("Profile updated successfully");
            }
          } catch (updateError) {
            console.error("Profile update error:", updateError);
            // Don't fail the auth for this
          }

          // Store user type for UI
          localStorage.setItem('nokutoru_user_type', 'customer');
          
          // Check if user needs to set up email
          const userMetadata = authResult.data.user.user_metadata || {};
          const needsEmailSetup = userMetadata.needs_email_setup || false;
          
          if (needsEmailSetup) {
            toast.success("LINEアカウントで登録完了！メールアドレスを設定してください。");
            // Store a flag to show email setup prompt
            sessionStorage.setItem('needs_email_setup', 'true');
          } else {
            toast.success("LINEアカウントで正常にログインしました！");
          }
          
          const intent = sessionStorage.getItem("line_auth_intent") || "login";
          sessionStorage.removeItem("line_auth_intent");

          // Navigate based on whether it was a login or a new user signup via LINE
          // Always go to user profile for now so they can set up their email if needed
          navigate("/user-profile");
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