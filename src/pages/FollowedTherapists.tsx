import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import TherapistCard from '@/components/TherapistCard';
import { Loader2 } from 'lucide-react';
import { Therapist } from '@/utils/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';

const FollowedTherapists = () => {
  const [followedTherapists, setFollowedTherapists] = useState<Therapist[]>([]);
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
        
        // Map database fields to Therapist interface
        const mappedTherapists: Therapist[] = (therapists || []).map(dbTherapist => {
          // Use type assertion for database object
          const therapist = dbTherapist as any;
          
          return {
            id: therapist.id,
            name: therapist.name || "",
            imageUrl: therapist.image_url || "", // Map image_url to imageUrl
            description: therapist.description || "",
            location: therapist.location || "",
            price: therapist.price || 0,
            rating: therapist.rating || 0,
            reviews: therapist.reviews || 0,
            availability: therapist.availability || [],
            qualifications: therapist.qualifications || [],
            specialties: therapist.specialties || [],
            services: [], // Initialize with empty array
            // Additional fields
            galleryImages: therapist.gallery_images,
            height: therapist.height,
            weight: therapist.weight,
            workingDays: therapist.working_days,
            workingHours: therapist.working_hours,
            hobbies: therapist.hobbies,
            age: therapist.age_group,
            area: therapist.service_areas?.prefecture,
            detailedArea: therapist.service_areas?.cities?.join(', ')
          };
        });
        
        setFollowedTherapists(mappedTherapists);
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
        <Breadcrumb 
          items={[
            { label: 'マイページ', href: '/user-profile' },
            { label: 'お気に入りセラピスト', href: '/followed-therapists', current: true }
          ]}
        />
        
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
