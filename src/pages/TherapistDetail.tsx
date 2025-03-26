import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MessageInterface from '../components/MessageInterface';
import TherapistGallery from '../components/TherapistGallery';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import TherapistProfile from '../components/TherapistProfile';
import TherapistQualifications from '../components/TherapistQualifications';
import TherapistServices from '../components/TherapistServices';
import TherapistReviews from '../components/TherapistReviews';
import TherapistPosts from '../components/TherapistPosts';
import { Therapist, Service } from '../utils/types';
import { ArrowLeft, Calendar, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

const TherapistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'availability' | 'message'>('availability');
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetchTherapist function
  const fetchTherapist = useCallback(async () => {
    if (!id || !isMounted) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching from Supabase:", error);
        setError("セラピストが見つかりませんでした");
        return;
      }
      
      if (!data) {
        setError("セラピストが見つかりませんでした");
        return;
      }
      
      // Fetch services for this therapist
      let therapistServices: Service[] = [];
      
      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from('therapist_services')
          .select('*, services(*)')
          .eq('therapist_id', id);
          
        if (servicesError) {
          console.error("Error fetching therapist services:", servicesError);
        } else if (servicesData && servicesData.length > 0) {
          // Map the services data to match the Service type
          therapistServices = servicesData.map((item: any) => ({
            id: item.service_id || item.id,
            name: item.services?.name || "",
            price: item.services?.price || 0, 
            duration: item.services?.duration || 0,
            description: item.services?.description || ""
          }));
        }
      } catch (servicesErr) {
        console.error("Error processing services:", servicesErr);
      }
      
      // Map Supabase data to the expected format
      const mappedTherapist: Therapist = {
        id: data.id,
        name: data.name || "",
        imageUrl: data.image_url || "",
        description: data.description || "",
        location: data.location || "",
        price: data.price || 0,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        availability: data.availability || [],
        qualifications: data.qualifications || [],
        specialties: data.specialties || [],
        services: therapistServices
      };
      
      setTherapist(mappedTherapist);
    } catch (err) {
      console.error("Error in fetchTherapist:", err);
      setError("データ取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [id, isMounted]);

  useEffect(() => {
    // Set mounted flag
    setIsMounted(true);
    
    // Load data with a small delay to ensure smooth transitions
    const timer = setTimeout(() => {
      fetchTherapist();
    }, 300);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, [fetchTherapist]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (error || !therapist) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">セラピストが見つかりません</h1>
            <p className="text-muted-foreground mb-8">
              お探しのセラピストは存在しないか、削除されました。
            </p>
            <Button onClick={() => navigate('/therapists')}>
              セラピスト一覧に戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Handler functions to avoid async issues
  const handleToggleFollow = () => {
    setIsFollowing(prev => !prev);
  };
  
  const handleTabChange = (value: string) => {
    setSidebarTab(value as 'availability' | 'message');
  };

  const handleBackClick = () => {
    navigate('/therapists');
  };

  return (
    <Layout>
      <button
        onClick={handleBackClick}
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        全てのセラピストに戻る
      </button>
      
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg overflow-hidden border">
            <TherapistGallery therapist={therapist} />
            
            <div className="p-6">
              <TherapistProfile 
                therapist={therapist} 
                isFollowing={isFollowing}
                onToggleFollow={handleToggleFollow}
              />
              
              <TherapistQualifications therapist={therapist} />
              
              <TherapistServices therapist={therapist} />
              
              <TherapistReviews reviews={[]} />
              
              <TherapistPosts posts={[]} therapistName={therapist.name} />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden sticky top-20">
            <div className="p-6">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">予約</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      {therapist?.name}さんの施術を予約しましょう。
                    </p>
                    <Link to={`/book/${therapist?.id}`}>
                      <Button className="w-full" size="lg">
                        <Calendar className="mr-2 h-5 w-5" />
                        予約ページへ進む
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs 
                defaultValue="availability" 
                value={sidebarTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="availability" className="text-xs sm:text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">空き状況</span>
                  </TabsTrigger>
                  <TabsTrigger value="message" className="text-xs sm:text-sm flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">メッセージ</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="availability" className="p-0 m-0 pt-4">
                  <h3 className="font-semibold mb-3">空き状況</h3>
                  {/* Use key to ensure proper remounting when therapist changes */}
                  <AvailabilityCalendar 
                    key={`availability-${therapist.id}`} 
                    therapistId={therapist.id} 
                  />
                </TabsContent>
                
                <TabsContent value="message" className="p-0 m-0 pt-4">
                  {/* Use key to ensure proper remounting when therapist changes */}
                  <MessageInterface 
                    key={`message-${therapist.id}`} 
                    therapist={therapist} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TherapistDetail;
