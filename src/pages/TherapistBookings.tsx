
import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { TherapistBookingRequests } from '@/components/therapist/TherapistBookingRequests';
import { supabase } from '@/integrations/supabase/client';

const TherapistBookings = () => {
  const [therapistId, setTherapistId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTherapistId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setTherapistId(user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getTherapistId();
  }, []);

  return (
    <TherapistLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">予約管理</h1>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">読み込み中...</span>
          </div>
        ) : (
          <TherapistBookingRequests therapistId={therapistId} />
        )}
      </div>
    </TherapistLayout>
  );
};

export default TherapistBookings;
