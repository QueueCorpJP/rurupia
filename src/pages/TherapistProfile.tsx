
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TherapistProfileForm } from '@/components/therapist/TherapistProfileForm';
import { TherapistGalleryView } from '@/components/therapist/TherapistGalleryView';
import { TherapistLayout } from '@/components/therapist/TherapistLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TherapistProfile = () => {
  const [loading, setLoading] = useState(true);
  const [therapistData, setTherapistData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
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

  const handleProfileSuccess = async (data: any) => {
    try {
      setTherapistData(data);
      toast.success('プロフィールを更新しました');
      
      // Refresh the data to get the latest from the database
      if (userId) {
        const { data: refreshedData, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (error) throw error;
        if (refreshedData) setTherapistData(refreshedData);
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  };

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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="gallery">ギャラリー</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <TherapistProfileForm 
              existingData={therapistData} 
              onSuccess={handleProfileSuccess}
            />
          </TabsContent>
          
          <TabsContent value="gallery">
            <TherapistGalleryView 
              galleryImages={therapistData?.galleryImages || []}
              onUploadClick={() => setActiveTab("profile")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </TherapistLayout>
  );
};

export default TherapistProfile;
