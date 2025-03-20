
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, MessageSquare, Calendar, Gift, Star } from "lucide-react";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    messageNotifications: true,
    bookingNotifications: true,
    promotionNotifications: false,
    reviewNotifications: true
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("ユーザー情報を取得できませんでした");
          navigate("/login");
          return;
        }

        // In a real app, we would fetch notification settings from the database
        // For now, we'll use defaults
        
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast.error("設定の取得に失敗しました");
      }
    };

    fetchNotificationSettings();
  }, [navigate]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }

      // In a real implementation, save to the database
      // await supabase.from('notification_settings').upsert({
      //   user_id: user.id,
      //   ...settings
      // });

      toast.success("通知設定を保存しました");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("設定の保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">通知設定</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>通知の管理</CardTitle>
            <CardDescription>
              通知の受け取り方法を設定できます。頻度や種類を調整してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">メール通知</Label>
                  <p className="text-sm text-muted-foreground">アカウント関連の重要な通知</p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="message-notifications" className="font-medium">メッセージ通知</Label>
                  <p className="text-sm text-muted-foreground">新着メッセージの通知</p>
                </div>
              </div>
              <Switch
                id="message-notifications"
                checked={settings.messageNotifications}
                onCheckedChange={() => handleToggle('messageNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="booking-notifications" className="font-medium">予約通知</Label>
                  <p className="text-sm text-muted-foreground">予約確認や変更の通知</p>
                </div>
              </div>
              <Switch
                id="booking-notifications"
                checked={settings.bookingNotifications}
                onCheckedChange={() => handleToggle('bookingNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Gift className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="promotion-notifications" className="font-medium">プロモーション通知</Label>
                  <p className="text-sm text-muted-foreground">割引やキャンペーン情報</p>
                </div>
              </div>
              <Switch
                id="promotion-notifications"
                checked={settings.promotionNotifications}
                onCheckedChange={() => handleToggle('promotionNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Star className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="review-notifications" className="font-medium">レビュー通知</Label>
                  <p className="text-sm text-muted-foreground">レビューリクエストやフィードバック</p>
                </div>
              </div>
              <Switch
                id="review-notifications"
                checked={settings.reviewNotifications}
                onCheckedChange={() => handleToggle('reviewNotifications')}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={loading}>
            設定を保存
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationSettings;
