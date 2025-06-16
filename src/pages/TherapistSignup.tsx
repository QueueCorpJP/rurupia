/**
 * TherapistSignup Component
 * 
 * This component handles the registration of new therapists invited by stores.
 * The component has been updated to allow therapists to directly insert into the 
 * therapists table on registration with proper RLS policies.
 * 
 * Process:
 * 1. Create a user account
 * 2. Update their profile with 'user_type: therapist' and 'status: pending_therapist_approval'
 * 3. Store references to the inviting store
 * 4. Create a basic therapist record with the therapist's own ID
 * 5. Wait for store approval to activate the therapist
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

// Schema with essential fields
const formSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z.string().min(8, { message: 'パスワードは8文字以上で入力してください' }),
  name: z.string().min(2, { message: '名前は2文字以上で入力してください' }),
  location: z.string().min(1, { message: '場所を選択してください' }),
});

// List of all Japanese prefectures
const japanesePrefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const TherapistSignup = () => {
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<{ name: string; email: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const storeId = searchParams.get('store');

  console.log("Rendering TherapistSignup component with storeId:", storeId);

  // Fetch store information
  useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!storeId) return;

      try {
        // Try to get store info from the stores table
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('name, email, representative')
          .eq('id', storeId)
          .maybeSingle();

        if (storeData) {
          console.log("Found store:", storeData);
          setStoreInfo({
            name: storeData.name, // Use store name, not representative name
            email: storeData.email
          });
          return;
        }

        // If not found in stores, try profiles table for backward compatibility
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', storeId)
          .eq('user_type', 'store')
          .maybeSingle();

        if (profileData) {
          console.log("Found store in profiles (fallback):", profileData);
          setStoreInfo(profileData);
          return;
        }

        // If we couldn't find proper store info, use a default
        console.log("Using default store info");
        setStoreInfo({
          name: "不明な店舗",
          email: "no-email@example.com"
        });
      } catch (error) {
        console.error("Error fetching store info:", error);
        setStoreInfo({
          name: "不明な店舗",
          email: "no-email@example.com"
        });
      }
    };

    fetchStoreInfo();
  }, [storeId]);

  // Set up form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      location: '',
    },
  });

  // Store therapist data in the profile for admin approval
  const storeTherapistDataInProfile = async (userId: string, userData: any) => {
    try {
      // Use only fields that we know exist in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: 'therapist',
          name: userData.name,
          invited_by_store_id: storeId,
          status: 'pending_therapist_approval',  // Use status field to indicate pending approval
          user_id: userId  // Add the user_id field
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Failed to store therapist data in profile:", updateError);
        return false;
      }
      
      console.log("Successfully stored therapist data in profile for admin approval");
      return true;
    } catch (error) {
      console.error("Error in storeTherapistDataInProfile:", error);
      return false;
    }
  };

  // Create a basic therapist record
  const createTherapistRecord = async (userId: string, userData: any) => {
    try {
      console.log("Attempting to create therapist record for user ID:", userId);
      
      // Check if a therapist record already exists
      const { data: existingTherapist, error: checkError } = await supabase
        .from("therapists")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing therapist record:", checkError);
        // Continue with the insert attempt even if check fails
      }
      
      if (existingTherapist) {
        console.log("Therapist record already exists, skipping creation");
        return true;
      }
      
      // Insert basic therapist record with user-provided values for key fields
      const { error: insertError } = await supabase
        .from("therapists")
        .insert({
          id: userId,
          name: userData.name,
          description: "セラピストの紹介文はまだありません", // Default description
          location: userData.location,
          price: 5000, // Use default price instead of null to prevent not-null constraint
          specialties: [],
          experience: 0,
          rating: 0,
          reviews: 0,
          availability: []
        });

      if (insertError) {
        console.error("Failed to create therapist record:", insertError);
        // Log more detailed information about the error
        if (insertError.code) {
          console.error(`Error code: ${insertError.code}, Message: ${insertError.message}, Details: ${insertError.details}`);
        }
        return false;
      }
      
      console.log("Successfully created therapist record");
      return true;
    } catch (error) {
      console.error("Error in createTherapistRecord:", error);
      return false;
    }
  };

  // Full signup handler
  const handleSignup = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      console.log("Signup attempt with data:", data);
      
      if (!storeId) {
        toast.error('有効な招待リンクが必要です');
        return;
      }

      // First try to create the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            user_type: 'therapist',
            name: data.name,
            invited_by_store_id: storeId,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already signed up')) {
          toast.error('このメールアドレスは既に登録されています');
          return;
        }
        throw signUpError;
      }

      if (!authData.user) {
        toast.error('ユーザー登録に失敗しました');
        return;
      }

      console.log("User created successfully with ID:", authData.user.id);

      // Mark the user as a pending therapist in the profiles table
      const profileUpdated = await storeTherapistDataInProfile(authData.user.id, data);
      
      if (!profileUpdated) {
        console.warn("Could not update profile with therapist status.");
        toast.warning('アカウントは作成されましたが、プロフィール更新に問題が発生しました');
      } else {
        console.log("Profile marked as pending therapist successfully");
      }

      // Create a basic therapist record
      const therapistRecordCreated = await createTherapistRecord(authData.user.id, data);
      
      if (!therapistRecordCreated) {
        console.warn("Could not create therapist record.");
        toast.warning('セラピスト情報の初期設定に問題が発生しました');
      } else {
        console.log("Therapist record created successfully");
      }

      // Create a relation between the therapist and the inviting store
      try {
        if (storeId) {
          console.log("Creating store-therapist relationship with:", {
            store_id: storeId,
            therapist_id: authData.user.id,
            status: 'pending'
          });
          
          // Try to create the relationship
          const { error: relationError } = await supabase
            .from('store_therapists')
            .insert({
              store_id: storeId,
              therapist_id: authData.user.id,
              status: 'pending'
            });
            
          if (relationError) {
            console.error("Failed to create store-therapist relation:", relationError);
            console.log("Note: This is expected if RLS policies don't allow therapists to create this relation. The store will need to approve the therapist manually.");
          } else {
            console.log("Store-therapist relation created successfully");
          }
        }
      } catch (relationError) {
        console.error("Error creating store-therapist relation:", relationError);
        // Don't block the signup process if this fails
      }

      // Show success message
      toast.success('アカウントを作成しました。管理者の承認後に全機能が利用可能になります');

      // Log the user in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (loginError) {
        console.error('Error logging in after signup:', loginError);
        navigate('/therapist-login');
      } else {
        navigate('/therapist-profile');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-12 mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">セラピスト登録</CardTitle>
          <CardDescription>
            {storeInfo 
              ? `${storeInfo.name}からの招待で登録しています` 
              : storeId 
                ? '招待された店舗の情報を取得中...' 
                : '招待リンクが見つかりません'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Form with only necessary fields */}
          <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="メールアドレスを入力してください"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力してください"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                placeholder="名前を入力してください"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">場所</Label>
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="施術を行う場所を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {japanesePrefectures.map((prefecture) => (
                        <SelectItem key={prefecture} value={prefecture}>
                          {prefecture}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
            
            {storeInfo && (
              <div className="mt-2 p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-medium">招待元の店舗: {storeInfo.name}</p>
                <p className="text-xs text-muted-foreground">{storeInfo.email}</p>
              </div>
            )}
            
            <Button 
              type="submit"
              disabled={loading} 
              className="w-full mt-4"
            >
              {loading ? 'お待ちください...' : 'アカウントを作成'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistSignup;
