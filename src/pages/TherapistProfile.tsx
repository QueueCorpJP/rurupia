
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TherapistProfileForm } from '@/components/therapist/TherapistProfileForm';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TherapistProfile = () => {
  const [loading, setLoading] = useState(true);
  const [therapistData, setTherapistData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No user found, redirecting to login");
          navigate('/therapist-login');
          return;
        }
        
        setUserId(user.id);
        
        // Fetch therapist data
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching therapist profile:', error);
          if (!error.message.includes('No rows found')) {
            throw error;
          }
        }
        
        console.log("Therapist data fetched:", data);
        setTherapistData(data || { id: user.id });
      } catch (error) {
        console.error('Error in checkAuth:', error);
        toast.error('プロフィール情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
        <TherapistProfileForm 
          existingData={therapistData} 
          onSuccess={(data) => {
            setTherapistData(data);
            toast.success('プロフィールを更新しました');
          }}
        />
      </div>
    </TherapistLayout>
  );
};

export default TherapistProfile;
