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
import { CircleUser, Lock, Bell, Eye, Shield, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define a more complete Therapist type that includes required database fields
interface TherapistDB {
  id: string;
  name: string;
  description: string;
  location: string;
  working_days?: string[];
  working_hours?: any;
  availability?: string[];
  // Settings fields
  is_profile_public?: boolean;
  show_follower_count?: boolean;
  show_availability?: boolean;
  restrict_messaging?: boolean;
  email_notifications?: boolean;
  booking_notifications?: boolean;
  message_notifications?: boolean;
  marketing_notifications?: boolean;
  // Other fields can be added as needed
}

// Settings interface for updates
interface TherapistSettings {
  id?: string;
  name?: string;
  description?: string;
  location?: string;
  is_profile_public?: boolean;
  show_follower_count?: boolean;
  show_availability?: boolean;
  restrict_messaging?: boolean;
  email_notifications?: boolean;
  booking_notifications?: boolean;
  message_notifications?: boolean;
  marketing_notifications?: boolean;
}

// Validation schema for account form
const accountFormSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
  name: z.string().min(1, { message: "名前を入力してください" }),
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Initialize the forms
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const privacyForm = useForm<z.infer<typeof privacyFormSchema>>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues: {
      isProfilePublic: true,
      showFollowerCount: true,
      showAvailability: true,
      restrictMessaging: false,
    }
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      bookingNotifications: true,
      messageNotifications: true,
      marketingNotifications: false,
    }
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
        if (!user) {
          toast.error("ユーザー情報を取得できませんでした");
          return;
        }
        
        setUserId(user.id);
        console.log("Fetching data for user ID:", user.id);
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError && !profileError.message.includes('No rows found')) {
          console.error('Error fetching profile:', profileError);
          toast.error("プロフィール情報の取得に失敗しました");
          return;
        }
        
        console.log("Profile data:", profile);
        
        // Fetch therapist data
        const { data: therapistData, error: therapistError } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (therapistError && !therapistError.message.includes('No rows found')) {
          console.error('Error fetching therapist data:', therapistError);
          toast.error("セラピスト情報の取得に失敗しました");
          return;
        }
        
        console.log("Therapist data:", therapistData);
        
        // Safely handle therapist data with proper type assertion
        const therapist = therapistData as TherapistDB | null;
        
        // Create a merged object with safer type handling
        const combinedData = {
          ...profile,
          ...(therapist || {}),
          email: user.email,
          // Ensure settings fields exist with defaults using optional chaining
          is_profile_public: therapist?.is_profile_public ?? true,
          show_follower_count: therapist?.show_follower_count ?? true,
          show_availability: therapist?.show_availability ?? true,
          restrict_messaging: therapist?.restrict_messaging ?? false,
          email_notifications: therapist?.email_notifications ?? true,
          booking_notifications: therapist?.booking_notifications ?? true,
          message_notifications: therapist?.message_notifications ?? true,
          marketing_notifications: therapist?.marketing_notifications ?? false
        };
        
        console.log("Combined data:", combinedData);
        setUserData(combinedData);
        
        // Reset form values with fetched data
        accountForm.reset({
          email: user.email || "",
          name: combinedData.name || "",
        });
        
        // Reset privacy form
        privacyForm.reset({
          isProfilePublic: Boolean(combinedData.is_profile_public),
          showFollowerCount: Boolean(combinedData.show_follower_count),
          showAvailability: Boolean(combinedData.show_availability),
          restrictMessaging: Boolean(combinedData.restrict_messaging),
        });
        
        // Reset notification form
        notificationForm.reset({
          emailNotifications: Boolean(combinedData.email_notifications),
          bookingNotifications: Boolean(combinedData.booking_notifications),
          messageNotifications: Boolean(combinedData.message_notifications),
          marketingNotifications: Boolean(combinedData.marketing_notifications),
        });
        
        setDataInitialized(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error("ユーザーデータの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Handle account form submission
  const onSubmitAccountForm = async (data: z.infer<typeof accountFormSchema>) => {
    if (!userId) {
      toast.error("ユーザーIDが見つかりません");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Updating account settings:", data);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
        })
        .eq('id', userId);
      
      if (profileError) {
        console.error("Profile update error:", profileError);
        toast.error("プロフィール更新エラー", { description: profileError.message });
        return;
      }
      
      // Update therapist name
      const updateData: TherapistSettings = {
        name: data.name,
      };
      
      const { error: therapistError } = await supabase
        .from('therapists')
        .update(updateData)
        .eq('id', userId);
      
      if (therapistError) {
        console.error("Therapist update error:", therapistError);
        toast.warning("一部の設定が更新されませんでした", { description: therapistError.message });
      }
      
      // Update email if changed
      if (data.email !== userData.email) {
        console.log("Updating email from", userData.email, "to", data.email);
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) {
          console.error("Email update error:", emailError);
          toast.error("メールアドレス更新エラー", { description: emailError.message });
          return;
        }
        
        toast.info("確認メールを送信しました", { 
          description: "新しいメールアドレスの確認のため、確認メールを送信しました。"
        });
      }
      
      // Update the local userData state
      setUserData(prev => ({
        ...prev,
        name: data.name,
        email: data.email
      }));
      
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
    if (!userId) {
      toast.error("ユーザーIDが見つかりません");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Updating privacy settings:", data);
      
      // Create an update object with snake_case keys
      const updateData: TherapistSettings = {
        is_profile_public: data.isProfilePublic,
        show_follower_count: data.showFollowerCount,
        show_availability: data.showAvailability,
        restrict_messaging: data.restrictMessaging,
      };
      
      // First check if therapist record exists
      const { data: existingTherapist, error: checkError } = await supabase
        .from('therapists')
        .select('id, description, location')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError && !checkError.message.includes('No rows found')) {
        console.error("Error checking therapist:", checkError);
        toast.error("セラピスト情報の確認に失敗しました");
        return;
      }
        
      // If no therapist record, create one
      if (!existingTherapist) {
        console.log("No therapist record found, creating one");
        
        // Create a minimal valid therapist record
        const therapistRecord: any = {
          id: userId,
          name: userData?.name || "セラピスト",
          description: "セラピストの紹介文",
          location: "東京都",
          ...updateData
        };
        
        const { error: createError } = await supabase
          .from('therapists')
          .insert(therapistRecord);
          
        if (createError) {
          console.error("Error creating therapist:", createError);
          toast.error("セラピスト情報の作成に失敗しました");
          return;
        }
      } else {
        // Update privacy settings
        const { error: updateError } = await supabase
          .from('therapists')
          .update(updateData)
          .eq('id', userId);
        
        if (updateError) {
          console.error("Privacy settings update error:", updateError);
          toast.error("プライバシー設定の更新に失敗しました");
          return;
        }
      }
      
      // Update the local userData state
      setUserData(prev => ({
        ...prev,
        is_profile_public: data.isProfilePublic,
        show_follower_count: data.showFollowerCount,
        show_availability: data.showAvailability,
        restrict_messaging: data.restrictMessaging,
      }));
      
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
    if (!userId) {
      toast.error("ユーザーIDが見つかりません");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Updating notification settings:", data);
      
      // Create an update object with snake_case keys
      const updateData: TherapistSettings = {
        email_notifications: data.emailNotifications,
        booking_notifications: data.bookingNotifications,
        message_notifications: data.messageNotifications,
        marketing_notifications: data.marketingNotifications,
      };
      
      // First check if therapist record exists
      const { data: existingTherapist, error: checkError } = await supabase
        .from('therapists')
        .select('id, description, location')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError && !checkError.message.includes('No rows found')) {
        console.error("Error checking therapist:", checkError);
        toast.error("セラピスト情報の確認に失敗しました");
        return;
      }
        
      // If no therapist record, create one
      if (!existingTherapist) {
        console.log("No therapist record found, creating one");
        
        // Create a minimal valid therapist record
        const therapistRecord: any = {
          id: userId,
          name: userData?.name || "セラピスト",
          description: "セラピストの紹介文",
          location: "東京都",
          ...updateData
        };
        
        const { error: createError } = await supabase
          .from('therapists')
          .insert(therapistRecord);
          
        if (createError) {
          console.error("Error creating therapist:", createError);
          toast.error("セラピスト情報の作成に失敗しました");
          return;
        }
      } else {
        // Update notification settings
        const { error: updateError } = await supabase
          .from('therapists')
          .update(updateData)
          .eq('id', userId);
        
        if (updateError) {
          console.error("Notification settings update error:", updateError);
          toast.error("通知設定の更新に失敗しました");
          return;
        }
      }
      
      // Update the local userData state
      setUserData(prev => ({
        ...prev,
        email_notifications: data.emailNotifications,
        booking_notifications: data.bookingNotifications,
        message_notifications: data.messageNotifications,
        marketing_notifications: data.marketingNotifications,
      }));
      
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
    if (!userId || !data.currentPassword || !data.newPassword) {
      toast.error("全てのパスワードフィールドを入力してください");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Updating password");
      
      // First check current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: data.currentPassword,
      });
      
      if (signInError) {
        console.error("Current password verification failed:", signInError);
        toast.error("現在のパスワードが正しくありません");
        return;
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (error) {
        console.error("Password update error:", error);
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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!userId) {
      toast.error("ユーザーIDが見つかりません");
      return;
    }
    
    try {
      setIsDeleting(true);
      console.log("Deleting account for user ID:", userId);
      
      // Delete therapist data
      const { error: therapistError } = await supabase
        .from('therapists')
        .delete()
        .eq('id', userId);
      
      if (therapistError) {
        console.error('Error deleting therapist data:', therapistError);
        toast.error("アカウント削除エラー", { description: therapistError.message });
        return;
      }
      
      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting profile:', profileError);
        toast.error("アカウント削除エラー", { description: profileError.message });
        return;
      }
      
      // Delete auth user (this is normally done server-side)
      toast.success("アカウントを削除しました");
      
      // Sign out and redirect to home
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("エラーが発生しました", { description: "アカウントの削除中にエラーが発生しました。" });
    } finally {
      setIsDeleting(false);
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        アカウントを削除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。アカウントとすべての関連データが永久に削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "削除中..." : "アカウントを削除する"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
