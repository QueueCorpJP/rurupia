/**
 * TherapistSignup Component
 * 
 * This component handles the registration of new therapists invited by stores.
 * Due to Supabase Row Level Security (RLS) constraints, therapists can't directly
 * insert into the therapists table on registration. Instead, we:
 * 
 * 1. Create a user account
 * 2. Update their profile with 'user_type: therapist' and 'status: pending_therapist_approval'
 * 3. Store references to the inviting store
 * 
 * ADMIN IMPLEMENTATION NOTE:
 * Admin tools must include a section to approve pending therapists by:
 * 1. Querying profiles with status='pending_therapist_approval' 
 * 2. Creating a record in the therapists table for each approved profile
 * 3. Creating a store_therapists relation between the therapist and the inviting store
 * 4. Updating the profile status to 'active'
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

// Schema with essential fields
const formSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z.string().min(8, { message: 'パスワードは8文字以上で入力してください' }),
  name: z.string().min(2, { message: '名前は2文字以上で入力してください' }),
});

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
          .select('name, email')
          .eq('id', storeId)
          .maybeSingle();

        if (storeData) {
          console.log("Found store:", storeData);
          setStoreInfo(storeData);
          return;
        }

        // If not found in stores, try profiles table for store admins
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', storeId)
          .maybeSingle();

        if (profileData) {
          console.log("Found store in profiles:", profileData);
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
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
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
          status: 'pending_therapist_approval'  // Use status field to indicate pending approval
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
        if (signUpError.message.includes('already registered')) {
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
        toast.success('アカウントを作成しました。管理者の承認後に全機能が利用可能になります');
      }

      // Log the user in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (loginError) {
        console.error('Error logging in after signup:', loginError);
        navigate('/therapist-login');
      } else {
        navigate('/therapist-dashboard');
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
          {/* Simple form with minimal fields */}
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
