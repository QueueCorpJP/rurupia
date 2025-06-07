import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Store, Shield, CheckCircle, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StorePending = () => {
  const navigate = useNavigate();
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStoreStatus();
  }, []);

  const checkStoreStatus = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("ログインが必要です");
        navigate('/store-login');
        return;
      }

      // Check store status
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', user.id)
        .single();

      if (storeError) {
        console.error("Error fetching store data:", storeError);
        toast.error("店舗情報の取得に失敗しました");
        navigate('/store-login');
        return;
      }

      setStoreInfo(storeData);

      // If store is already approved, redirect to store admin
      if (storeData.status === 'active') {
        toast.success("店舗が承認されました！");
        navigate('/store-admin');
        return;
      }

      // If store is rejected, show error and redirect to signup
      if (storeData.status === 'rejected') {
        toast.error("申し訳ございませんが、店舗登録が承認されませんでした。詳細については管理者にお問い合わせください。");
        navigate('/store-signup');
        return;
      }

    } catch (error) {
      console.error("Error checking store status:", error);
      toast.error("ステータスの確認に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-md py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-orange-100 bg-orange-50/30">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-900">店舗登録完了</CardTitle>
            <CardDescription className="text-orange-700">
              審査中です。しばらくお待ちください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">店舗登録が正常に完了しました</span>
              </div>
              
              {storeInfo && (
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-center space-x-2 text-orange-600 mb-3">
                    <Store className="h-5 w-5" />
                    <span className="text-sm font-medium">登録された店舗情報</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>店舗名:</strong> {storeInfo.name}</p>
                    <p><strong>メール:</strong> {storeInfo.email}</p>
                    <p><strong>電話番号:</strong> {storeInfo.phone || '未設定'}</p>
                    <p><strong>住所:</strong> {storeInfo.address || '未設定'}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">現在の状況</span>
                </div>
                <p className="text-sm text-blue-800">
                  管理者が店舗情報を審査しています。
                  審査完了後、メールでお知らせいたします。
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center space-x-2 text-yellow-800 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">審査について</span>
                </div>
                <p className="text-sm text-yellow-800">
                  審査には通常1〜3営業日程度かかります。
                  審査結果は登録いただいたメールアドレスにお送りします。
                </p>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => checkStoreStatus()} 
                className="w-full"
                variant="default"
              >
                ステータスを更新
              </Button>
              <Button 
                onClick={handleSignOut}
                className="w-full"
                variant="outline"
              >
                ログアウト
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                className="w-full"
                variant="ghost"
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

export default StorePending; 