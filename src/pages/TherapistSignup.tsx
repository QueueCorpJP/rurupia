
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Layout from "@/components/Layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z.string().min(8, { message: 'パスワードは8文字以上で入力してください' }),
  name: z.string().min(2, { message: '名前は2文字以上で入力してください' }),
  phone_number: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.date().optional(),
  address: z.string().optional(),
  introduction: z.string().optional(),
});

const TherapistSignup = () => {
  const [loading, setLoading] = useState(false);
  const [invitingStore, setInvitingStore] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const storeId = searchParams.get('store');

  // Redirect to home if no store ID is provided - this ensures therapists can only register via invite
  useEffect(() => {
    if (!storeId) {
      navigate('/');
      toast.error('有効な招待リンクが必要です');
    }
  }, [storeId, navigate]);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (storeId) {
        try {
          // First try to get from stores table
          let { data, error } = await supabase
            .from('stores')
            .select('name, email')
            .eq('id', storeId)
            .single();

          if (error || !data) {
            // If not found in stores, try profiles table
            const profileResult = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', storeId)
              .eq('user_type', 'store')
              .single();
              
            if (profileResult.error) {
              console.error('Error fetching store details:', profileResult.error);
              toast.error('店舗情報の取得に失敗しました');
              return;
            }
            
            data = profileResult.data;
          }

          if (data) {
            setInvitingStore(data);
          }
        } catch (error) {
          console.error('Error in fetchStoreDetails:', error);
          toast.error('エラーが発生しました');
        }
      }
    };

    fetchStoreDetails();
  }, [storeId]);

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

  const handleSignup = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Validate that we have a store ID
      if (!storeId) {
        toast.error('有効な招待リンクが必要です');
        navigate('/');
        return;
      }

      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            user_type: 'therapist',
            name: data.name,
            phone_number: data.phone_number,
            gender: data.gender,
            date_of_birth: data.date_of_birth?.toISOString(),
            address: data.address,
            introduction: data.introduction,
            invited_by_store_id: storeId,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!user) {
        toast.error('ユーザー登録に失敗しました');
        return;
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: 'therapist',
          name: data.name,
          invited_by_store_id: storeId,
          phone: data.phone_number,
          gender: data.gender,
          date_of_birth: data.date_of_birth?.toISOString(),
          address: data.address,
          introduction: data.introduction,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create therapist entry
      const { error: therapistError } = await supabase.from('therapists').insert({
        id: user.id,
        name: data.name,
        description: data.introduction || `${data.name}はプロフェッショナルなセラピストです`,
        location: data.address || '東京',
        price: 5000, // Default price
        specialties: [],
        qualifications: [],
        availability: ['月', '火', '水', '木', '金', '土', '日'],
        rating: 0,
        reviews: 0,
        experience: 0
      });

      if (therapistError && !therapistError.message.includes('duplicate')) {
        console.error('Error creating therapist entry:', therapistError);
      }

      // Create store_therapist relationship
      const { error: relationError } = await supabase.from('store_therapists').insert({
        store_id: storeId,
        therapist_id: user.id,
        status: 'pending'
      });

      if (relationError) {
        console.error('Error creating store-therapist relationship:', relationError);
      }

      toast.success('アカウントを作成しました');
      
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
    <Layout>
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">セラピスト登録</CardTitle>
            <CardDescription>
              {invitingStore 
                ? `${invitingStore.name}からの招待で登録しています。` 
                : '招待された店舗の情報を読み込んでいます...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
            
            {storeId && invitingStore && (
              <div className="mt-2 p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-medium">招待元の店舗: {invitingStore.name}</p>
                <p className="text-xs text-muted-foreground">{invitingStore.email}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button disabled={loading || !storeId} onClick={handleSubmit(handleSignup)} className="w-full">
              {loading ? 'お待ちください...' : 'アカウントを作成'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default TherapistSignup;
