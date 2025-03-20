
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import TherapistCard from '@/components/TherapistCard';
import { Loader2 } from 'lucide-react';

const FollowedTherapists = () => {
  const [followedTherapists, setFollowedTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowedTherapists = async () => {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Get followed therapists
        const { data: followed, error: followedError } = await supabase
          .from('followed_therapists')
          .select('therapist_id')
          .eq('user_id', user.id);
          
        if (followedError) {
          console.error('Error fetching followed therapists:', followedError);
          setLoading(false);
          return;
        }
        
        if (!followed || followed.length === 0) {
          setFollowedTherapists([]);
          setLoading(false);
          return;
        }
        
        // Get therapist details
        const therapistIds = followed.map(f => f.therapist_id);
        
        const { data: therapists, error: therapistsError } = await supabase
          .from('therapists')
          .select('*')
          .in('id', therapistIds);
          
        if (therapistsError) {
          console.error('Error fetching therapist details:', therapistsError);
          setLoading(false);
          return;
        }
        
        setFollowedTherapists(therapists || []);
      } catch (error) {
        console.error('Error in followed therapists:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFollowedTherapists();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">お気に入りセラピスト</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : followedTherapists.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">お気に入りに追加したセラピストがいません</p>
            <p className="mt-2">
              <a href="/therapists" className="text-primary hover:underline">
                セラピストを探す
              </a>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followedTherapists.map((therapist) => (
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FollowedTherapists;
