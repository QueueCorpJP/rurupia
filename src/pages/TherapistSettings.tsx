import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { CircleUser, Lock, Bell, Eye, Shield } from 'lucide-react';
import { TherapistSettings as TherapistSettingsType } from '@/types/therapist';

// Validation schema for account form
const accountFormSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
  name: z.string().min(1, { message: "名前を入力してください" }),
  language: z.string(),
});

// Validation schema for privacy form
const privacyFormSchema = z.object({
  isProfilePublic: z.boolean().default(true),
  showFollowerCount: z.boolean().default(true),
  showAvailability: z.boolean().default(true),
  restrictMessaging: z.boolean().default(false),
});

// Validation schema for notification form
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  bookingNotifications: z.boolean().default(true),
  messageNotifications: z.boolean().default(true),
  marketingNotifications: z.boolean().default(false),
});

// Validation schema for security form
const securityFormSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, { message: "パスワードは8文字以上である必要があります" }).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (!data.currentPassword && !data.newPassword && !data.confirmPassword) {
    return true;
  }
  return data.currentPassword && data.newPassword && data.confirmPassword;
}, {
  message: "すべてのパスワードフィールドを入力してください",
  path: ['currentPassword'],
}).refine(data => {
  if (!data.newPassword || !data.confirmPassword) return true;
  return data.newPassword === data.confirmPassword;
}, {
  message: "新しいパスワードと確認用パスワードが一致しません",
  path: ['confirmPassword'],
});

const TherapistSettings = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("account");

  // Initialize the forms
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: "",
      name: "",
      language: "ja",
    },
  });

  const privacyForm = useForm<z.infer<typeof privacyFormSchema>>({
    resolver: zodResolver(privacyFormSchema),
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
  });

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setUserId(user.id);
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError && !profileError.message.includes('No rows found')) {
          console.error('Error fetching profile:', profileError);
          return;
        }
        
        // Fetch therapist data
        const { data: therapist, error: therapistError } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (therapistError && !therapistError.message.includes('No rows found')) {
          console.error('Error fetching therapist data:', therapistError);
          return;
        }
        
        // Merge profile and therapist data
        const combinedData = {
          ...profile,
          ...therapist,
          email: user.email,
        };
        
        setUserData(combinedData);
        
        // Reset form values with fetched data
        accountForm.reset({
          email: user.email || "",
          name: combinedData.name || "",
          language: combinedData.language || "ja",
        });
        
        // Reset privacy form with safe type assertions
        privacyForm.reset({
          isProfilePublic: combinedData.is_profile_public !== false,
          showFollowerCount: combinedData.show_follower_count !== false,
          showAvailability: combinedData.show_availability !== false,
          restrictMessaging: combinedData.restrict_messaging === true,
        });
        
        // Reset notification form with safe type assertions
        notificationForm.reset({
          emailNotifications: combinedData.email_notifications !== false,
          bookingNotifications: combinedData.booking_notifications !== false,
          messageNotifications: combinedData.message_notifications !== false,
          marketingNotifications: combinedData.marketing_notifications === true,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Handle account form submission
  const onSubmitAccountForm = async (data: z.infer<typeof accountFormSchema>) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
        })
        .eq('id', userId);
      
      if (profileError) {
        toast.error("プロフィール更新エラー", { description: profileError.message });
        return;
      }
      
      // Update therapist name and language
      const updateData: TherapistSettingsType = {
        name: data.name,
        language: data.language
      };
      
      const { error: therapistError } = await supabase
        .from('therapists')
        .update(updateData)
        .eq('id', userId);
      
      if (therapistError) {
        console.warn("Some therapist fields might not have been updated:", therapistError.message);
      }
      
      // Update email if changed
      if (data.email !== userData.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) {
          toast.error("メールアドレス更新エラー", { description: emailError.message });
          return;
        }
        
        toast.info("確認メールを送信しました", { 
          description: "新しいメールアドレスの確認のため、確認メールを送信しました。"
        });
      }
      
      toast.success("アカウント設定を更新しました");
    } catch (error) {
      console.error('Error updating account settings:', error);
      toast.error("エラーが発生しました", { description: "アカウント設定の更新中にエラーが発生しました。" });
    } finally {
      setLoading(false);
    }
  };

  // Handle privacy form submission
  const onSubmitPrivacyForm = async (data: z.infer<typeof privacyFormSchema>) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Create an update object with snake_case keys
      const updateData: TherapistSettingsType = {
        is_profile_public: data.isProfilePublic,
        show_follower_count: data.showFollowerCount,
        show_availability: data.showAvailability,
        restrict_messaging: data.restrictMessaging,
      };
      
      // Update privacy settings
      const { error } = await supabase
        .from('therapists')
        .update(updateData)
        .eq('id', userId);
      
      if (error) {
        console.warn("Privacy settings update warning:", error.message);
        // Continue anyway as these fields might be added in the future
      }
      
      toast.success("プライバシー設定を更新しました");
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error("エラーが発生しました", { description: "プライバシー設定の更新中にエラーが発生しました。" });
    } finally {
      setLoading(false);
    }
  };

  // Handle notification form submission
  const onSubmitNotificationForm = async (data: z.infer<typeof notificationFormSchema>) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Create an update object with snake_case keys
      const updateData: TherapistSettingsType = {
        email_notifications: data.emailNotifications,
        booking_notifications: data.bookingNotifications,
        message_notifications: data.messageNotifications,
        marketing_notifications: data.marketingNotifications,
      };
      
      // Update notification settings
      const { error } = await supabase
        .from('therapists')
        .update(updateData)
        .eq('id', userId);
      
      if (error) {
        console.warn("Notification settings update warning:", error.message);
        // Continue anyway as these fields might be added in the future
      }
      
      toast.success("通知設定を更新しました");
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error("エラーが発生しました", { description: "通知設定の更新中にエラーが発生しました。" });
    } finally {
      setLoading(false);
    }
  };

  // Handle security form submission
  const onSubmitSecurityForm = async (data: z.infer<typeof securityFormSchema>) => {
    if (!userId || !data.currentPassword || !data.newPassword) return;
    
    try {
      setLoading(true);
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (error) {
        toast.error("パスワード更新エラー", { description: error.message });
        return;
      }
      
      toast.success("パスワードを更新しました");
      
      // Reset form
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("エラーが発生しました", { description: "パスワードの更新中にエラーが発生しました。" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">読み込み中...</span>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">設定</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="account" className="flex items-center">
              <CircleUser className="mr-2 h-4 w-4" />
              アカウント
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              プライバシー
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              通知
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              セキュリティ
            </TabsTrigger>
          </TabsList>
          
          {/* Account Settings */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>アカウント設定</CardTitle>
                <CardDescription>
                  アカウント情報の管理や表示設定を変更します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit(onSubmitAccountForm)} className="space-y-6">
                    <FormField
                      control={accountForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>メールアドレス</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            アカウントに関連付けられたメールアドレスです
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>名前</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            公開プロフィールに表示される名前です
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>言語設定</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="言語を選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ja">日本語</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            アプリの表示言語を設定します
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? "保存中..." : "保存"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>プライバシー設定</CardTitle>
                <CardDescription>
                  プロフィールの公開設定やデータの表示範囲を管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...privacyForm}>
                  <form onSubmit={privacyForm.handleSubmit(onSubmitPrivacyForm)} className="space-y-6">
                    <FormField
                      control={privacyForm.control}
                      name="isProfilePublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">公開プロフィール</FormLabel>
                            <FormDescription>
                              プロフィールを検索結果に表示する
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={privacyForm.control}
                      name="showFollowerCount"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">フォロワー数の表示</FormLabel>
                            <FormDescription>
                              あなたのフォロワー数を他のユーザーに表示する
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={privacyForm.control}
                      name="showAvailability"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">予約可能時間の表示</FormLabel>
                            <FormDescription>
                              あなたの予約可能時間を公開する
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={privacyForm.control}
                      name="restrictMessaging"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">メッセージ制限</FormLabel>
                            <FormDescription>
                              メッセージの送信をフォロワーのみに制限する
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? "保存中..." : "保存"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>通知設定</CardTitle>
                <CardDescription>
                  メール通知やアプリ内通知の設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onSubmitNotificationForm)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">メール通知</FormLabel>
                            <FormDescription>
                              重要なお知らせをメールで受け取る
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="bookingNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">予約通知</FormLabel>
                            <FormDescription>
                              新しい予約や予約変更の通知を受け取る
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="messageNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">メッセージ通知</FormLabel>
                            <FormDescription>
                              新しいメッセージの通知を受け取る
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="marketingNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">マーケティング通知</FormLabel>
                            <FormDescription>
                              プロモーションやお得な情報の通知を受け取る
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? "保存中..." : "保存"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>セキュリティ設定</CardTitle>
                <CardDescription>
                  パスワードの変更や認証設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSubmitSecurityForm)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>現在のパスワード</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>新しいパスワード</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            8文字以上の強力なパスワードを設定してください
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>新しいパスワード（確認）</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={loading}>
                      {loading ? "更新中..." : "パスワードを更新"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">アカウント削除</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。
                  </p>
                  <Button variant="destructive">
                    アカウントを削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TherapistLayout>
  );
};

export default TherapistSettings;
