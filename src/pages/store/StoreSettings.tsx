
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const StoreSettings = () => {
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    const fetchStoreProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("ユーザー情報の取得に失敗しました");
          return;
        }

        // Get the store profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Get the store data
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (storeError) {
          throw storeError;
        }

        if (storeData) {
          setStoreData({
            id: storeData.id,
            name: storeData.name || profileData.name || "",
            email: storeData.email || user.email || "",
            phone: storeData.phone || profileData.phone || "",
            address: storeData.address || profileData.address || "",
            description: storeData.description || "",
          });
        } else {
          // If no store data exists, use profile data
          setStoreData({
            id: user.id,
            name: profileData.name || "",
            email: user.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            description: "",
          });
        }
      } catch (error) {
        console.error("Error fetching store profile:", error);
        toast.error("店舗情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: storeData.name,
          phone: storeData.phone,
          address: storeData.address,
        })
        .eq('id', storeData.id);

      if (profileError) throw profileError;

      // Upsert to stores table
      const { error: storeError } = await supabase
        .from('stores')
        .upsert({
          id: storeData.id,
          name: storeData.name,
          email: storeData.email,
          phone: storeData.phone,
          address: storeData.address,
          description: storeData.description,
          status: 'active',
        }, { onConflict: 'id' });

      if (storeError) throw storeError;
      
      toast.success("店舗情報が更新されました");
    } catch (error) {
      console.error("Error updating store profile:", error);
      toast.error("店舗情報の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">店舗設定</h1>
        <p className="text-muted-foreground mt-2">店舗プロフィールと各種設定</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
          <TabsTrigger value="security">セキュリティ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>店舗情報</CardTitle>
              <CardDescription>
                店舗の基本情報を編集します。この情報はユーザーに表示されます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">店舗名</Label>
                <Input
                  id="name"
                  name="name"
                  value={storeData.name}
                  onChange={handleChange}
                  placeholder="店舗名を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  value={storeData.email}
                  onChange={handleChange}
                  placeholder="example@example.com"
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  メールアドレスは変更できません
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={storeData.phone}
                  onChange={handleChange}
                  placeholder="03-1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  name="address"
                  value={storeData.address}
                  onChange={handleChange}
                  placeholder="東京都渋谷区〇〇1-2-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">店舗紹介</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={storeData.description}
                  onChange={handleChange}
                  placeholder="店舗の説明や特徴を入力してください"
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "更新中..." : "変更を保存"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                通知の受け取り方法を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notification settings will be implemented here later */}
              <p className="text-muted-foreground">この機能は準備中です</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ設定</CardTitle>
              <CardDescription>
                アカウントのセキュリティに関する設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="現在のパスワードを入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="新しいパスワードを入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">パスワードの確認</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="新しいパスワードを再入力"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>パスワードを変更</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreSettings;
