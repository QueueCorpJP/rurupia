import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StoreSignup = () => {
  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // 1. Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.ownerName,
            role: 'store'
          }
        }
      });
      
      if (authError) {
        toast.error(authError.message, {
          duration: 3000,
          dismissible: true,
        });
        return;
      }
      
      if (!authData.user) {
        toast.error("ユーザーの登録に失敗しました", {
          duration: 3000,
          dismissible: true,
        });
        return;
      }
      
      // Create or update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          user_type: 'store',
          user_id: authData.user.id
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
        
      if (profileError) {
        console.error("Error creating/updating profile:", profileError);
        // Continue with store creation even if profile update fails
      }
      
      // 2. Create the store profile
      const { error: storeError } = await supabase
        .from('stores')
        .insert({
          id: authData.user.id,
          name: formData.storeName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          status: 'pending' // Pending approval
        });
        
      if (storeError) {
        console.error("Error creating store profile:", storeError);
        toast.error("店舗プロフィールの作成に失敗しました", {
          duration: 3000,
          dismissible: true,
        });
        return;
      }
      
      toast.success("登録が完了しました", {
        duration: 3000,
        dismissible: true,
      });
      
      // Redirect to store pending page instead of store admin
      navigate("/store-pending");
      
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("登録中にエラーが発生しました", {
        duration: 3000,
        dismissible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <Card className="border-pink-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">店舗登録</CardTitle>
            <CardDescription>
              あなたの店舗を登録して、より多くのお客様に届けましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">店舗情報</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="storeName">店舗名</Label>
                    <Input
                      id="storeName"
                      name="storeName"
                      placeholder="〇〇マッサージ"
                      value={formData.storeName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">オーナー名</Label>
                    <Input
                      id="ownerName"
                      name="ownerName"
                      placeholder="山田 太郎"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="03-1234-5678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">店舗住所</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="東京都渋谷区〇〇1-2-3"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">店舗詳細</h3>
                <div className="space-y-2">
                  <Label htmlFor="description">店舗説明</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="店舗の特徴や提供しているサービスなどを記入してください"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>店舗登録には審査があります。審査完了までに数日かかる場合がございます。</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "処理中..." : "登録する"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              すでにアカウントをお持ちの方は
              <Link to="/store-login" className="text-primary hover:underline ml-1">
                ログイン
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              登録すると、<Link to="/terms" className="text-primary hover:underline">利用規約</Link>および<Link to="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>に同意したことになります。
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default StoreSignup;
