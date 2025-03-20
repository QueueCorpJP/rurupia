import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const storeId = searchParams.get('store');

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

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: 'therapist',
          name: data.name,
          invited_by_store_id: storeId,
          phone_number: data.phone_number,
          gender: data.gender,
          date_of_birth: data.date_of_birth?.toISOString(),
          address: data.address,
          introduction: data.introduction,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('アカウントを作成しました');
      navigate('/therapist-dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">セラピスト登録</CardTitle>
          <CardDescription>
            必要な情報を入力して、セラピストアカウントを作成してください。
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
        </CardContent>
        <CardFooter>
          <Button disabled={loading} onClick={handleSubmit(handleSignup)}>
            {loading ? 'お待ちください...' : 'アカウントを作成'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TherapistSignup;
