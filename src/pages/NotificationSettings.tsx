import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, MessageSquare, Calendar, Gift, Star, Loader2, CheckCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type NotificationSettingsType = {
  id?: string;
  user_id?: string;
  email_notifications: boolean;
  message_notifications: boolean;
  booking_notifications: boolean;
  promotion_notifications: boolean;
  review_notifications: boolean;
};

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsType>({
    email_notifications: true,
    message_notifications: true,
    booking_notifications: true,
    promotion_notifications: false,
    review_notifications: true
  });

  // Test toast notifications
  const testToastNotifications = () => {
    console.log("Testing toast notifications");
    setTimeout(() => {
      toast.success("テスト成功通知", {
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />
      });
    }, 1000);
  };

  // Call when component mounts
  useEffect(() => {
    // Uncomment this line to test toast notifications
    testToastNotifications();
  }, []);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("ユーザー情報を取得できませんでした", {
            position: "top-center",
            duration: 4000
          });
          navigate("/login");
          return;
        }

        console.log("Fetching notification settings for user:", user.id);

        // Fetch notification settings from the database - using 'any' to bypass TS issues
        const { data, error } = await (supabase as any)
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error fetching notification settings:", error);
          toast.error("設定の取得に失敗しました", {
            position: "top-center", 
            duration: 4000
          });
          return;
        }
        
        // Check if we have any settings records
        if (data && data.length > 0) {
          console.log(`Found ${data.length} notification settings records`);
          
          // Use the first record if multiple exist (we'll fix the duplicates when saving)
          const firstRecord = data[0];
          console.log("Using settings record:", firstRecord);
          
          // We know what fields we expect
          setSettings({
            id: firstRecord.id,
            user_id: firstRecord.user_id,
            email_notifications: firstRecord.email_notifications,
            message_notifications: firstRecord.message_notifications,
            booking_notifications: firstRecord.booking_notifications,
            promotion_notifications: firstRecord.promotion_notifications,
            review_notifications: firstRecord.review_notifications
          });
        } else {
          console.log("No notification settings found, using defaults but not creating them");
          // Just use default settings in UI without creating in database
          setSettings({
            email_notifications: true,
            message_notifications: true,
            booking_notifications: true,
            promotion_notifications: false,
            review_notifications: true,
          });
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        toast.error("設定の取得に失敗しました", {
          position: "top-center",
          duration: 4000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, [navigate]);

  const handleToggle = (key: keyof NotificationSettingsType) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした", {
          position: "top-center",
          duration: 4000
        });
        return;
      }

      // Prepare upsert data with all necessary fields
      const upsertData: any = {
        user_id: user.id,
        email_notifications: settings.email_notifications,
        message_notifications: settings.message_notifications,
        booking_notifications: settings.booking_notifications,
        promotion_notifications: settings.promotion_notifications,
        review_notifications: settings.review_notifications,
        updated_at: new Date().toISOString()
      };

      // Include id if it exists (for proper upsert)
      if (settings.id) {
        upsertData.id = settings.id;
      }

      console.log("Saving notification settings:", upsertData);

      // Try to get existing record first to determine if we need update or insert
      const { data: existingSettings } = await (supabase as any)
        .from('notification_settings')
        .select('id')
        .eq('user_id', user.id);

      let error;
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing record - use the first one if multiple exist
        const firstSettingId = existingSettings[0].id;
        console.log("Updating existing settings with ID:", firstSettingId);
        
        // If there are multiple settings for this user, delete the extras
        if (existingSettings.length > 1) {
          console.log(`Found ${existingSettings.length} settings records, cleaning up duplicates`);
          
          // Get all IDs except the first one
          const idsToDelete = existingSettings
            .slice(1)
            .map(setting => setting.id);
            
          // Delete the duplicate settings
          const { error: deleteError } = await (supabase as any)
            .from('notification_settings')
            .delete()
            .in('id', idsToDelete);
            
          if (deleteError) {
            console.error("Error cleaning up duplicate settings:", deleteError);
          } else {
            console.log(`Successfully deleted ${idsToDelete.length} duplicate settings`);
          }
        }
        
        const result = await (supabase as any)
          .from('notification_settings')
          .update(upsertData)
          .eq('id', firstSettingId);
        
        error = result.error;
      } else {
        // Insert new record
        console.log("Creating new notification settings");
        const result = await (supabase as any)
          .from('notification_settings')
          .insert(upsertData);
        
        error = result.error;
      }

      if (error) {
        console.error("Error saving notification settings:", error);
        toast.error("設定の保存に失敗しました", {
          position: "top-center",
          duration: 4000
        });
        throw error;
      }

      // Show success notification
      console.log("Notification settings saved successfully");
      toast.success("通知設定を保存しました", {
        position: "top-center",
        duration: 4000,
        icon: <CheckCircle className="h-5 w-5" />,
        description: "設定内容が反映されました"
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("設定の保存に失敗しました", {
        position: "top-center",
        duration: 4000
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">設定を読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toaster richColors position="top-center" />
      
      <div className="container py-8">
        <Breadcrumb 
          items={[
            { label: 'マイページ', href: '/user-profile' },
            { label: '通知設定', href: '/notification-settings', current: true }
          ]}
        />
        
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
                checked={settings.email_notifications}
                onCheckedChange={() => handleToggle('email_notifications')}
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
                checked={settings.message_notifications}
                onCheckedChange={() => handleToggle('message_notifications')}
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
                checked={settings.booking_notifications}
                onCheckedChange={() => handleToggle('booking_notifications')}
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
                checked={settings.promotion_notifications}
                onCheckedChange={() => handleToggle('promotion_notifications')}
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
                checked={settings.review_notifications}
                onCheckedChange={() => handleToggle('review_notifications')}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="inline-flex items-center"
          >
            {isSaving ? (
              <span className="contents">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </span>
            ) : (
              "設定を保存"
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationSettings;
