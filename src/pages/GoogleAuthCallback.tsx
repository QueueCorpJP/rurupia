import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const GoogleAuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          toast.error('セッションの取得に失敗しました');
          navigate('/login');
          return;
        }

        if (!session || !session.user) {
          // No session or user, redirect to login
          toast.error('ログインに失敗しました');
          navigate('/login');
          return;
        }

        // Check if the user is banned
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('status, user_type')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        if (profileData?.status === 'rejected') {
          // User is banned, sign them out and show error
          await supabase.auth.signOut();
          toast.error('このアカウントはバンされています。管理者にお問い合わせください。', {
            duration: 5000,
          });
          navigate('/login');
          return;
        }

        // User is not banned, redirect based on user type
        toast.success('ログインしました');

        // Check if user is a store
        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (storeData) {
          navigate('/store-admin');
          return;
        }

        // Check if user is a therapist
        const { data: therapistData } = await supabase
          .from('therapists')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (therapistData) {
          navigate('/therapist-dashboard');
          return;
        }

        // Default to user profile for regular users
        navigate('/user-profile');
      } catch (error) {
        console.error('Error in callback processing:', error);
        toast.error('ログイン処理中にエラーが発生しました');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl mb-4">ログイン処理中...</h2>
        <p className="text-muted-foreground">しばらくお待ちください</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback; 