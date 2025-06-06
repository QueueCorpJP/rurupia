import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail } from "lucide-react";

const RegistrationPending = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-900">登録完了</CardTitle>
            <CardDescription className="text-blue-700">
              認証完了までお待ちください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">アカウントが正常に作成されました</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
                  <Mail className="h-5 w-5" />
                  <span className="text-sm font-medium">メール認証が必要です</span>
                </div>
                <p className="text-sm text-gray-600">
                  ご登録いただいたメールアドレスに認証メールを送信しました。
                  メール内のリンクをクリックして認証を完了してください。
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>重要:</strong> メールが届かない場合は、迷惑メールフォルダもご確認ください。
                  認証完了後、ログインが可能になります。
                </p>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full"
                variant="default"
              >
                ログインページに移動
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                className="w-full"
                variant="outline"
              >
                ホームページに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegistrationPending; 