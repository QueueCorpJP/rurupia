import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../components/Layout";

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
        const REDIRECT_URI = "http://localhost:8080/line-callback";

        // It’s recommended to store sensitive keys in environment variables
        const LINE_CLIENT_ID = process.env.REACT_APP_LINE_CLIENT_ID;
        const LINE_CLIENT_SECRET = process.env.REACT_APP_LINE_CLIENT_SECRET;

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

        // Determine if the user is signing up or logging in
        const intent = sessionStorage.getItem("line_auth_intent") || "login";
        sessionStorage.removeItem("line_auth_intent");

        if (intent === "signup" || state === "signup") {
          // Here you would typically create a new user record in your database
          toast.success("LINEアカウントで登録しました");
          navigate("/verify-identity");
        } else {
          // Here you would log the user in (e.g., store the token and update state)
          toast.success("LINEアカウントでログインしました");
          navigate("/user-profile");
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
