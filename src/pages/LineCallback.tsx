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
        const REDIRECT_URI = process.env.VITE_LINE_REDIRECT_URI || "https://rupipia.jp/line-callback";

        // It's recommended to store sensitive keys in environment variables
        const LINE_CLIENT_ID = process.env.VITE_LINE_CLIENT_ID;
        const LINE_CLIENT_SECRET = process.env.VITE_LINE_CLIENT_SECRET;

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
            client_id: LINE_CLIENT_ID!,
            client_secret: LINE_CLIENT_SECRET!,
          }),
        });

        if (!tokenResponse.ok) {
          const errData = await tokenResponse.json();
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

        // Call Supabase Edge Function
        // Ensure 'line-auth-handler' is the correct name of your deployed Edge Function
        const { data: functionInvokeData, error: functionError } = await supabase.functions.invoke(
          'line-auth-handler', 
          { body: { id_token, access_token } } 
        );

        if (functionError) {
          console.error("Edge function error:", functionError);
          setError(`認証処理エラー: ${functionError.message}`);
          setIsProcessing(false);
          return;
        }
        
        // IMPORTANT: Edge function NO LONGER returns Supabase session tokens in this simplified model
        if (functionInvokeData && functionInvokeData.profile) {
          // Store the fetched profile data or a "logged in via LINE" flag
          // in your client-side state management (React Context, Zustand, etc.)
          // For example, you might dispatch an action or call a context function:
          // authContext.setLineUser(functionInvokeData.profile);
          // authContext.setAuthMethod('line');
          // This part depends on your app's state management approach.

          // Persist user type if your application relies on it for UI/routing
          if (functionInvokeData.user_type) {
            localStorage.setItem('nokutoru_user_type', functionInvokeData.user_type);
          }
          
          toast.success("LINEアカウントで正常に処理されました。");
          
          const intent = sessionStorage.getItem("line_auth_intent") || "login";
          sessionStorage.removeItem("line_auth_intent");

          // Navigate based on whether it was a login or a new user signup via LINE
          if (intent === "signup" && functionInvokeData.is_new_user) {
            navigate("/user-profile"); // Or a welcome/profile completion page
          } else {
            navigate("/user-profile"); // Default navigation for login
          }
        } else {
          console.error("LINE Auth: Edge function did not return expected profile data:", functionInvokeData);
          setError("LINE認証からのユーザーデータの取得に失敗しました。データ構造を確認してください。");
          setIsProcessing(false);
          return;
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
