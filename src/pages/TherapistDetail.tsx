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
import { ArrowLeft, Calendar, MessageSquare, ExternalLink, MapPin, Ruler, Weight, Brain, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PostCard, { PostWithInteractions } from '@/components/PostCard';
import { addDays, isAfter, isBefore, eachDayOfInterval, getDay } from 'date-fns';

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

// Add Japanese day mapping
const dayMap: { [key: string]: string } = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
};

// Day of week mapping between number and Japanese text
const dayOfWeekMap: Record<number, string> = {
  0: '日',
  1: '月',
  2: '火',
  3: '水',
  4: '木',
  5: '金',
  6: '土'
};

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
  const [hasAvailability, setHasAvailability] = useState<boolean>(true);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isUserVerified, setIsUserVerified] = useState<boolean>(false);

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

  const formatValue = (value: any, unit: string = ''): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return `${String(value)}${unit}`;
  };

  // Specific formatter for MBTI
  const formatMbti = (value: any): string => {
    if (value === null || value === undefined || value === '' || value === 'unknown') {
      return '未設定';
    }
    return String(value);
  };

  const checkUserAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      setCurrentUser(data.session.user);
      
      // Check user verification status
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', data.session.user.id)
          .single();
          
        if (!error && profile) {
          setIsUserVerified(profile.is_verified || false);
        }
      } catch (err) {
        console.error('Error checking user verification:', err);
        setIsUserVerified(false);
      }
      
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
        const { data: servicesData, error: servicesError } = await (supabase as any)
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
            comment_count: 0,
            therapist_name: data.name || "セラピスト",
            therapist_image_url: data.image_url
          }));
          
          for (const post of posts) {
            try {
              // Fetch likes
              const { data: likesData, error: likesError } = await (supabase as any)
                .from('post_likes')
                .select('*')
                .eq('post_id', post.id);
                
              if (!likesError && likesData) {
                post.likes = likesData.length || 0;
              }
              
              // Fetch comment count
              const { data: commentsData, error: commentsError } = await (supabase as any)
                .from('post_comments')
                .select('id')
                .eq('post_id', post.id);
                
              if (!commentsError && commentsData) {
                post.comment_count = commentsData.length || 0;
              }
            } catch (error) {
              console.error(`Error fetching interactions for post ${post.id}:`, error);
            }
          }
          
          setTherapistPosts(posts);
        } else {
          setTherapistPosts([]);
        }
        
      } catch (postsErr) {
        console.error("Error processing posts:", postsErr);
      }
      
      // Fetch review count directly from therapist data or from reviews table
      try {
        // First try to get the review_count from the therapist data
        let reviewCountValue = data.review_count || 0;
        
        // If review_count is 0 or null, fetch from therapist_reviews table directly
        if (!reviewCountValue) {
          const { data: allReviews, error: reviewError } = await supabase
            .from('therapist_reviews')
            .select('id')
            .eq('therapist_id', id);
            
          if (!reviewError && allReviews) {
            reviewCountValue = allReviews.length;
            console.log(`Found ${reviewCountValue} reviews in therapist_reviews table for therapist ${id}`);
          }
        } else {
          console.log(`Using review_count from therapist data: ${reviewCountValue}`);
        }
        
        setReviewCount(reviewCountValue);
      } catch (reviewErr) {
        console.error("Error fetching review count:", reviewErr);
        setReviewCount(0);
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
        workingHours: (() => {
          try {
            if (typeof (data as any).working_hours === 'string') {
              return JSON.parse((data as any).working_hours);
            }
            return (data as any).working_hours || { start: '', end: '' };
          } catch (e) {
            console.error('Error parsing working hours:', e);
            return { start: '', end: '' };
          }
        })(),
        workingDays: (data as any).working_days || [],
        hobbies: (data as any).hobbies,
        age: (data as any).age || '',
        mbtiType: (data as any).mbti_type,
        area: (data as any).location || (data as any).service_areas?.prefecture || '',
        detailedArea: (data as any).detailed_area || (data as any).service_areas?.detailedArea || (data as any).service_areas?.cities?.join(', ') || '',
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

  // Add an effect to check if therapist has any available days
  useEffect(() => {
    if (!therapist) return;
    
    const checkTherapistAvailability = async () => {
      try {
        console.log("Checking availability for therapist:", therapist.id, "Name:", therapist.name);
        console.log("Working days data:", therapist.workingDays);
        console.log("Availability data:", therapist.availability);
        
        // Fetch the most up-to-date availability data from the database
        const { data, error } = await supabase
          .from('therapists')
          .select('working_days, availability, working_hours')
          .eq('id', String(therapist.id))
          .single();
          
        if (error) {
          console.error('Error checking therapist availability:', error);
          setHasAvailability(false);
          return;
        }
        
        console.log("Database availability data:", data);
        
        // Store valid working days that are in the future
        const validWorkingDays: Date[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // End date (one month from today)
        const endDate = addDays(new Date(), 30);
        
        let hasAvailabilityData = false;
        
        // Case 1: Check availability days (recurring weekly schedule)
        if (data.availability && Array.isArray(data.availability) && data.availability.length > 0) {
          hasAvailabilityData = true;
          
          // For each day in the next month, check if the day of week is in the availability array
          const checkDays = eachDayOfInterval({ start: today, end: endDate });
          
          checkDays.forEach(day => {
            const dayOfWeek = dayOfWeekMap[getDay(day)];
            if (data.availability.includes(dayOfWeek)) {
              // This is a valid available day
              validWorkingDays.push(day);
            }
          });
        }
        
        // Case 2: Check working days as recurring weekly schedule
        if (data.working_days && Array.isArray(data.working_days) && data.working_days.length > 0) {
          hasAvailabilityData = true;
          
          // Map working days to Japanese characters for comparison
          const dayNameToChar: { [key: string]: string } = {
            'monday': '月',
            'tuesday': '火',
            'wednesday': '水',
            'thursday': '木',
            'friday': '金',
            'saturday': '土',
            'sunday': '日'
          };
          
          // Convert working days to characters if they're day names
          const workingDayChars = data.working_days.map((day: string) => {
            if (day in dayNameToChar) {
              return dayNameToChar[day];
            }
            return day; // Already a character
          });
          
          // For each day in the next month, check if the day of week matches working days
          const checkDays = eachDayOfInterval({ start: today, end: endDate });
          
          checkDays.forEach(day => {
            const dayOfWeek = dayOfWeekMap[getDay(day)];
            if (workingDayChars.includes(dayOfWeek)) {
              // Check if this date isn't already in validWorkingDays from availability array
              if (!validWorkingDays.some(d => d.getTime() === day.getTime())) {
                validWorkingDays.push(day);
              }
            }
          });
        }
        
        // Case 3: Check if they have working hours defined
        let hasWorkingHours = false;
        if (data.working_hours) {
          try {
            const workingHours = typeof data.working_hours === 'string' 
              ? JSON.parse(data.working_hours) 
              : data.working_hours;
              
            if (workingHours) {
              // Check if they have day-specific working hours or global start/end times
              if ((Object.keys(workingHours).some(key => 
                   Array.isArray(workingHours[key]) && workingHours[key].length > 0)) ||
                  (workingHours.start && workingHours.end)) {
                hasWorkingHours = true;
              }
            }
          } catch (e) {
            console.error("Error parsing working hours:", e);
          }
        }
        
        // A therapist is considered available if they have:
        // 1. Valid working days in the future AND
        // 2. Working hours defined AND
        // 3. Some form of availability data (either working_days or availability array)
        const isAvailable = validWorkingDays.length > 0 && hasWorkingHours && hasAvailabilityData;
        
        console.log("Availability check result:", { 
          validWorkingDays: validWorkingDays.length,
          hasWorkingHours,
          hasAvailabilityData,
          isAvailable
        });
        
        setHasAvailability(isAvailable);
      } catch (error) {
        console.error('Error checking therapist availability:', error);
        setHasAvailability(false);
      }
    };
    
    checkTherapistAvailability();
  }, [therapist]);

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
    
    // Update the UI state immediately for better UX
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    
    // Update follower count immediately
    const currentFollowerCount = therapist.followers_count || 0;
    const newFollowerCount = newFollowingState ? currentFollowerCount + 1 : currentFollowerCount - 1;
    setTherapist(prev => prev ? { ...prev, followers_count: Math.max(0, newFollowerCount) } : null);
    
    try {
      if (isFollowing) {
        // Unfollow: Find and delete the specific record using validation-first pattern
        // First validate the record exists
        const { data: existingRecord, error: findError } = await (supabase as any)
          .from('followed_therapists')
          .select('*')
          .eq('user_id', String(user.id))
          .eq('therapist_id', String(therapist.id))
          .single();
          
        if (findError) {
          console.error('Error finding follow record:', findError);
          throw findError;
        }
        
        if (existingRecord) {
          // Delete by ID to avoid chained .eq() calls
          const { error: deleteError } = await (supabase as any)
            .from('followed_therapists')
            .delete()
            .eq('id', existingRecord.id);
            
          if (deleteError) throw deleteError;
        }
        
        toast.success(`${therapist.name}のフォローを解除しました`);
      } else {
        // Follow: Insert a new record
        const { error } = await (supabase as any)
          .from('followed_therapists')
          .insert({
            user_id: String(user.id),
            therapist_id: String(therapist.id),
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast.success(`${therapist.name}をフォローしました`);
      }
      
    } catch (error) {
      console.error('Error updating follow status:', error);
      // Revert both the UI state and follower count if the database operation failed
      setIsFollowing(!newFollowingState);
      setTherapist(prev => prev ? { ...prev, followers_count: currentFollowerCount } : null);
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
                reviewCount={reviewCount}
              />
              
              <div className="mt-8">
                <Tabs defaultValue="profile">
                  <TabsList className="grid w-full grid-cols-3 h-12 sm:h-10 p-1 rounded-lg bg-muted">
                    <TabsTrigger 
                      value="profile" 
                      className="text-sm sm:text-base font-medium px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                    >
                      基本情報
                    </TabsTrigger>
                    <TabsTrigger 
                      value="info" 
                      className="text-sm sm:text-base font-medium px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                    >
                      詳細情報
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews" 
                      className="text-sm sm:text-base font-medium px-3 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                    >
                      レビュー ({reviewCount})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="space-y-6 mt-6">
                    {/* Use dl for definition list styling */}
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">自己紹介</dt>
                        <dd className="text-sm">
                          {formatValue(therapist.description)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">営業時間</dt>
                        <dd className="text-sm">
                          {formatValue(therapist.workingHours?.start)} - {formatValue(therapist.workingHours?.end)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">営業日</dt>
                        <dd className="text-sm">
                          {therapist.workingDays?.length > 0 
                            ? therapist.workingDays.map(day => dayMap[day.toLowerCase()] || day).join(', ') 
                            : '-'}
                        </dd>
                      </div>
                    </dl>
                    {/* Posts Section */}
                    {therapistPosts.length > 0 && (
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-4">最近の投稿</h3>
                        <div className="space-y-6">
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
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="info" className="mt-6">
                    {/* Use dl for definition list styling with icons */}
                    <dl className="space-y-5">
                      <div className="flex items-center">
                        <dt className="w-24 text-sm font-medium text-muted-foreground flex items-center"><Calendar className="mr-2 h-4 w-4"/>年齢</dt>
                        <dd className="text-sm font-semibold">{formatValue(therapist.age)}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="w-24 text-sm font-medium text-muted-foreground flex items-center"><Ruler className="mr-2 h-4 w-4"/>身長</dt>
                        <dd className="text-sm font-semibold">{formatValue(therapist.height, ' cm')}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="w-24 text-sm font-medium text-muted-foreground flex items-center"><Weight className="mr-2 h-4 w-4"/>体重</dt>
                        <dd className="text-sm font-semibold">{formatValue(therapist.weight, ' kg')}</dd>
                      </div>
                       <div className="flex items-start">
                        <dt className="w-24 text-sm font-medium text-muted-foreground flex items-center pt-0.5"><MapPin className="mr-2 h-4 w-4"/>エリア</dt>
                        <dd className="text-sm font-semibold">
                           {formatValue(therapist.area)}<br/>
                           <span className="text-xs text-muted-foreground">{formatValue(therapist.detailedArea)}</span>
                         </dd>
                      </div>
                      <div className="flex items-start">
                        <dt className="w-24 text-sm font-medium text-muted-foreground flex items-center pt-0.5"><Heart className="mr-2 h-4 w-4"/>趣味</dt>
                        <dd className="text-sm font-semibold">
                          {therapist.hobbies?.length > 0 ? therapist.hobbies.join(', ') : '-'}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="w-24 text-sm font-medium text-muted-foreground flex items-center"><Brain className="mr-2 h-4 w-4"/>MBTI</dt>
                        <dd className="text-sm font-semibold">{formatMbti(therapist.mbtiType)}</dd>
                      </div>
                      {/* Removed Qualifications Section */}
                    </dl>
                  </TabsContent>
                  <TabsContent value="reviews" className="space-y-4 mt-6">
                    <TherapistReviews therapistId={id!} currentUser={currentUser} />
                  </TabsContent>
                </Tabs>
              </div>
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
                    {!hasAvailability && (
                      <p className="text-red-500 text-sm">
                        このセラピストは現在予約可能日がありません。
                      </p>
                    )}
                                        <Button 
                      className="w-full" 
                      size="lg"
                      disabled={!hasAvailability || (currentUser && !isUserVerified)}
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!hasAvailability) return;
                        
                        // Check if user is logged in
                        const user = currentUser || await checkUserAuth();
                        if (!user) {
                          toast.error('予約するには会員登録が必要です。まずは会員登録をお願いします。', {
                            duration: 4000,
                          });
                          navigate('/signup');
                          return;
                        }
                        
                        // Check if user is verified
                        const { data: profile, error } = await supabase
                          .from('profiles')
                          .select('is_verified')
                          .eq('id', user.id)
                          .single();
                          
                        if (error || !profile?.is_verified) {
                          // For unverified users, redirect to verification page
                          navigate('/user-profile');
                          return;
                        }
                        
                        // User is logged in and verified, proceed to booking
                        navigate(`/booking/${therapist?.id}`);
                      }}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      {currentUser && !isUserVerified ? '認証が必要です' : '予約ページへ進む'}
                    </Button>
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
                    currentUser={currentUser}
                    isUserVerified={isUserVerified}
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
