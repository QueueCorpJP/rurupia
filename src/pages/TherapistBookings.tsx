import { useState, useEffect } from 'react';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import TherapistBookingRequests from '@/components/therapist/TherapistBookingRequests';
import { supabase } from '@/integrations/supabase/client';

const TherapistBookings = () => {
  const [therapistId, setTherapistId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTherapistId = async () => {
      try {
        console.log("TherapistBookings - Getting current user...");
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error getting current user:", error);
          return;
        }
        
        console.log("Current user:", user);
        
        if (user) {
          console.log("Setting therapistId to:", user.id);
          setTherapistId(user.id);
          
          // Verify if this user exists in the therapists table
          const { data: therapistData, error: therapistError } = await supabase
            .from('therapists')
            .select('id, name')
            .eq('id', user.id)
            .single();
            
          if (therapistError) {
            console.error("Error checking therapist data:", therapistError);
          } else {
            console.log("Therapist data found:", therapistData);
          }
          
          // Check if there are any bookings for this therapist
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('id')
            .eq('therapist_id', user.id);
            
          if (bookingsError) {
            console.error("Error checking bookings:", bookingsError);
          } else {
            console.log(`Found ${bookingsData?.length || 0} bookings for this therapist`);
          }
        } else {
          console.log("No user found");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getTherapistId();
  }, []);

  // Log when component renders
  console.log("TherapistBookings rendering, therapistId:", therapistId);

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
          <>
            {therapistId ? (
              <TherapistBookingRequests therapistId={therapistId} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                セラピスト情報が見つかりませんでした。ログインしているアカウントがセラピストとして登録されているか確認してください。
              </div>
            )}
          </>
        )}
      </div>
    </TherapistLayout>
  );
};

export default TherapistBookings;
