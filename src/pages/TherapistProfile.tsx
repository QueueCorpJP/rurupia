
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TherapistProfileForm } from '@/components/therapist/TherapistProfileForm';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TherapistProfile = () => {
  const [loading, setLoading] = useState(false);
  const [therapistData, setTherapistData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/therapist-login');
        return;
      }
      setUserId(user.id);
      
      try {
        // Fetch therapist data
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && !error.message.includes('No rows found')) {
          throw error;
        }
        
        if (data) {
          setTherapistData(data);
        }
      } catch (error) {
        console.error('Error fetching therapist profile:', error);
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
        <div className="container py-8">
          <p className="text-center">読み込み中...</p>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="container max-w-4xl py-12">
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
