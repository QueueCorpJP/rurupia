import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MessageInterface from '../components/MessageInterface';
import TherapistGallery from '../components/TherapistGallery';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { TherapistProfile } from '../components/TherapistProfile';
import TherapistQualifications from '../components/TherapistQualifications';
import TherapistReviews from '../components/TherapistReviews';
import { Therapist, Service } from '../utils/types';
import { ArrowLeft, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PostCard, { PostWithInteractions } from '@/components/PostCard';

interface ExtendedTherapist extends Therapist {
  galleryImages?: string[];
  followers_count?: number;
}

interface SupabasePost {
  id: string;
  therapist_id: string;
  title?: string;
  content: string;
  image_url?: string;
  visibility?: string;
  created_at: string;
}

interface Post {
  id: number;
  content: string;
  image?: string;
  date: string;
  isPrivate?: boolean;
}

const TherapistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<ExtendedTherapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'availability' | 'message'>('availability');
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [therapistPosts, setTherapistPosts] = useState<PostWithInteractions[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handlePostUpdate = useCallback(async (postId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('therapist_posts')
        .select('likes')
        .eq('id', postId)
        .single();
        
      if (error) {
        console.error('Error fetching updated post:', error);
        return;
      }
      
      if (data) {
        setTherapistPosts(currentPosts => 
          currentPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: data.likes || post.likes } 
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  }, []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  };

  const checkUserAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      setCurrentUser(data.session.user);
      return data.session.user;
    }
    return null;
  }, []);

  const checkIsFollowing = useCallback(async (userId: string, therapistId: string) => {
    if (!userId || !therapistId) return false;
    
    const { data, error } = await supabase
      .from('followed_therapists')
      .select('id')
      .eq('user_id', userId)
      .eq('therapist_id', therapistId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
    
    return !!data;
  }, []);

  const fetchTherapist = useCallback(async () => {
    if (!id || !isMounted) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('therapists')
        .select(`
          *,
          followers_count:followed_therapists(count)
        `)
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
      
      console.log("Raw therapist data from Supabase:", data);
      
      let therapistServices: Service[] = [];
      
      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from('therapist_services')
          .select('*, services(*)')
          .eq('therapist_id', id);
          
        if (servicesError) {
          console.error("Error fetching therapist services:", servicesError);
        } else if (servicesData && servicesData.length > 0) {
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
      
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('therapist_posts')
          .select('*')
          .eq('therapist_id', id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (postsError) {
          console.error("Error fetching therapist posts:", postsError);
        } else if (postsData && postsData.length > 0) {
          const posts: PostWithInteractions[] = postsData.map((post: SupabasePost) => ({
            id: post.id,
            therapist_id: post.therapist_id,
            content: post.content,
            title: post.title,
            image_url: post.image_url,
            visibility: post.visibility,
            created_at: post.created_at,
            likes: 0,
            therapist_name: data.name || "セラピスト",
            therapist_image_url: data.image_url
          }));
          
          for (const post of posts) {
            try {
              const { data, error } = await (supabase as any)
                .from('post_likes')
                .select('*')
                .eq('post_id', post.id);
                
              if (!error && data) {
                post.likes = data.length || 0;
              }
            } catch (error) {
              console.error(`Error fetching likes for post ${post.id}:`, error);
            }
          }
          
          setTherapistPosts(posts);
        } else {
          setTherapistPosts([]);
        }
        
      } catch (postsErr) {
        console.error("Error processing posts:", postsErr);
      }
      
      const mappedTherapist: ExtendedTherapist = {
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
        services: therapistServices,
        galleryImages: (data as any).gallery_images || [],
        height: (data as any).height,
        weight: (data as any).weight,
        workingHours: (data as any).working_hours,
        workingDays: (data as any).working_days,
        hobbies: (data as any).hobbies,
        age: (data as any).age_group,
        area: (data as any).service_areas?.prefecture,
        detailedArea: (data as any).service_areas?.cities?.join(', '),
        followers_count: typeof data.followers_count === 'number' ? data.followers_count : 
                         Array.isArray(data.followers_count) ? data.followers_count.length : 0
      };
      
      console.log("Mapped therapist data:", mappedTherapist);
      
      setTherapist(mappedTherapist);
    } catch (err) {
      console.error("Error in fetchTherapist:", err);
      setError("データ取得中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [id, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    
    const checkFollowStatus = async () => {
      const user = await checkUserAuth();
      if (user && id) {
        const following = await checkIsFollowing(user.id, id);
        setIsFollowing(following);
      }
    };
    
    const timer = setTimeout(() => {
      fetchTherapist();
      checkFollowStatus();
    }, 300);
    
    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, [fetchTherapist, checkUserAuth, checkIsFollowing, id]);

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

  const handleToggleFollow = async () => {
    const user = currentUser || await checkUserAuth();
    
    if (!user) {
      toast.error('フォローするにはログインが必要です');
      navigate('/login');
      return;
    }
    
    if (!therapist) return;
    
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('followed_therapists')
          .delete()
          .eq('user_id', String(user.id))
          .eq('therapist_id', String(therapist.id));
          
        if (error) throw error;
        
        toast.success(`${therapist.name}のフォローを解除しました`);
      } else {
        const { error } = await supabase
          .from('followed_therapists')
          .insert({
            user_id: String(user.id),
            therapist_id: String(therapist.id),
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast.success(`${therapist.name}をフォローしました`);
      }
      
      setIsFollowing(prev => !prev);
      
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('エラーが発生しました。もう一度お試しください');
    }
  };

  const handleTabChange = (value: string) => {
    setSidebarTab(value as 'availability' | 'message');
  };

  const handleBackClick = () => {
    navigate('/therapists');
  };

  const refreshPosts = async () => {
    if (!id) return;
    
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('therapist_posts')
        .select('*')
        .eq('therapist_id', id)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (postsError) {
        console.error("Error fetching therapist posts:", postsError);
        return;
      }
      
      if (postsData && postsData.length > 0 && therapist) {
        const posts: PostWithInteractions[] = postsData.map((post: SupabasePost) => ({
          id: post.id,
          therapist_id: post.therapist_id,
          content: post.content,
          title: post.title,
          image_url: post.image_url,
          visibility: post.visibility,
          created_at: post.created_at,
          likes: 0,
          therapist_name: therapist.name || "セラピスト",
          therapist_image_url: therapist.imageUrl
        }));
        
        for (const post of posts) {
          try {
            const { data, error } = await (supabase as any)
              .from('post_likes')
              .select('*')
              .eq('post_id', post.id);
              
            if (!error && data) {
              post.likes = data.length || 0;
            }
          } catch (error) {
            console.error(`Error fetching likes for post ${post.id}:`, error);
          }
        }
        
        setTherapistPosts(posts);
      }
    } catch (error) {
      console.error("Error refreshing posts:", error);
    }
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
              
              <div className="mt-8">
                <Tabs defaultValue="profile">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">プロフィール</TabsTrigger>
                    <TabsTrigger value="info">詳細情報</TabsTrigger>
                    <TabsTrigger value="reviews">レビュー</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <div>
                      <h3 className="text-lg font-medium">自己紹介</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatValue(therapist.description)}
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="info" className="space-y-4 mt-4">
                    {/* Info content here */}
                  </TabsContent>
                  <TabsContent value="reviews" className="space-y-4 mt-4">
                    <TherapistReviews therapistId={id!} />
                  </TabsContent>
                </Tabs>
              </div>
              
              {therapistPosts.length > 0 && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-medium">最近の投稿</h3>
                  {therapistPosts.map(post => (
                    <PostCard 
                      key={post.id}
                      post={post}
                      onPostUpdated={() => handlePostUpdate(post.id)}
                    />
                  ))}
                  <div className="flex justify-end">
                    <Link to={`/therapist-posts/${therapist.id}`} className="inline-flex items-center text-sm text-primary hover:underline">
                      <span>すべての投稿を見る</span>
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
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
                    <Link to={`/booking/${therapist?.id}`}>
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
                  <AvailabilityCalendar 
                    key={`availability-${therapist.id}`} 
                    therapistId={therapist.id} 
                  />
                </TabsContent>
                
                <TabsContent value="message" className="p-0 m-0 pt-4">
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
