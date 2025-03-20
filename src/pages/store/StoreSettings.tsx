
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const StoreSettings = () => {
  const [loading, setLoading] = useState(false);
  const [storeProfile, setStoreProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    const getStoreProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setStoreProfile({
          id: user.id,
          name: data.name || "",
          email: user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
        });
      } catch (error) {
        console.error("Error fetching store profile:", error);
        toast.error("設定情報の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };
    
    getStoreProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: storeProfile.name,
          phone: storeProfile.phone,
          address: storeProfile.address,
          description: storeProfile.description,
          updated_at: new Date(),
        })
        .eq('id', storeProfile.id);
        
      if (error) throw error;
      
      toast.success("設定を更新しました");
    } catch (error) {
      console.error("Error updating store settings:", error);
      toast.error("設定の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">店舗設定</h3>
        <p className="text-muted-foreground">
          店舗のプロフィールと設定を管理します。
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="general">一般設定</TabsTrigger>
          <TabsTrigger value="password">パスワード</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
          <TabsTrigger value="danger">危険な操作</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>店舗情報</CardTitle>
              <CardDescription>
                店舗の基本情報を更新します。
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">店舗名</Label>
                  <Input
                    id="name"
                    placeholder="店舗名を入力"
                    value={storeProfile.name}
                    onChange={(e) => setStoreProfile({...storeProfile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeProfile.email}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    メールアドレスの変更には再認証が必要です。
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    placeholder="電話番号を入力"
                    value={storeProfile.phone}
                    onChange={(e) => setStoreProfile({...storeProfile, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">住所</Label>
                  <Input
                    id="address"
                    placeholder="住所を入力"
                    value={storeProfile.address}
                    onChange={(e) => setStoreProfile({...storeProfile, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">店舗紹介</Label>
                  <Textarea
                    id="description"
                    placeholder="店舗紹介を入力"
                    value={storeProfile.description}
                    onChange={(e) => setStoreProfile({...storeProfile, description: e.target.value})}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "更新中..." : "変更を保存"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>パスワード変更</CardTitle>
              <CardDescription>
                アカウントのパスワードを変更します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">パスワードを確認</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>パスワードを変更</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                通知の受け取り方法を設定します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notification settings form will be implemented in future updates */}
              <p>通知設定は現在開発中です。</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="danger" className="space-y-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">危険な操作</CardTitle>
              <CardDescription>
                アカウントに関する取り消し不可能な操作です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-destructive">アカウント削除</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  アカウントを削除すると、すべてのデータ（セラピスト情報、予約履歴など）が永久に削除されます。
                  この操作は取り消せません。
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/delete-account">
                <Button variant="destructive">アカウントを削除</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreSettings;

