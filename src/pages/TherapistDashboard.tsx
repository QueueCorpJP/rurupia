
import { useState, useEffect } from "react";
import { 
  Calendar, Clock, DollarSign, Heart, MapPin, Upload, UploadCloud, Image, Building, Users, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { TherapistProfileForm } from "@/components/therapist/TherapistProfileForm";
import { TherapistPostForm } from "@/components/therapist/TherapistPostForm";
import { TherapistBookingRequests } from "@/components/therapist/TherapistBookingRequests";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";
import { TherapistProfile } from "@/utils/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const TherapistDashboard = () => {
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();

  // Current active tab
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ログインが必要です");
        navigate("/therapist-login");
        return;
      }
      
      // Check if the user is a therapist
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!profile || profile.user_type !== 'therapist') {
        toast.error("セラピストアカウントでログインしてください");
        navigate("/therapist-login");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Fetch therapist profile data
  useEffect(() => {
    const fetchTherapistProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Get therapist data
        const { data: therapistData, error: therapistError } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (therapistError && !therapistError.message.includes('No rows found')) {
          throw therapistError;
        }
        
        // Combine profile and therapist data
        const combinedData: TherapistProfile = {
          id: user.id,
          name: profileData.name || "セラピスト",
          therapistId: user.id.slice(0, 5),
          location: therapistData?.location || profileData.address || "未設定",
          area: therapistData?.location?.split('、')[0] || "未設定",
          detailedArea: therapistData?.location || "未設定",
          workingDays: therapistData?.availability || ["未設定"],
          workingHours: { start: "9:00", end: "18:00" },
          pricePerHour: therapistData?.price || 0,
          bio: therapistData?.description || "",
          height: 0,
          weight: 0,
          hobbies: profileData.hobbies || [],
          serviceAreas: { prefecture: "未設定", cities: [] },
          avatarUrl: profileData.avatar_url || "",
          description: therapistData?.description || "",
          long_description: therapistData?.long_description || "",
          qualifications: therapistData?.qualifications || [],
          specialties: therapistData?.specialties || [],
          price: therapistData?.price || 0,
          rating: therapistData?.rating || 0,
          reviews: therapistData?.reviews || 0,
          experience: therapistData?.experience || 0,
          availability: therapistData?.availability || []
        };
        
        setTherapistProfile(combinedData);
      } catch (error) {
        console.error("Error fetching therapist profile:", error);
        toast.error("プロフィール情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTherapistProfile();
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Here you would fetch posts from your Supabase table
        // For now, using mock post since posts table might not exist yet
        const mockPost = {
          id: "p1",
          content: "今日はセミナーに参加しました。皆さんにお会いできて良かったです！",
          postedAt: new Date().toLocaleString('ja-JP'),
          likes: 0,
          authorName: therapistProfile?.name || "セラピスト",
          authorAvatar: therapistProfile?.avatarUrl || ""
        };
        
        setPosts([mockPost]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    
    if (therapistProfile) {
      fetchPosts();
    }
  }, [therapistProfile]);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadMessageCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);
          
        if (error) throw error;
        
        setUnreadMessages(count || 0);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };
    
    fetchUnreadMessageCount();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${therapistProfile?.id}`
      }, fetchUnreadMessageCount)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [therapistProfile]);

  // Handle quick action buttons
  const handleQuickAction = (action: string) => {
    switch(action) {
      case "schedule":
        setActiveTab("bookings");
        break;
      case "customers":
        // For now, just navigate to bookings which has customer info
        setActiveTab("bookings");
        break;
      case "gallery":
        setActiveTab("gallery");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <TherapistLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">読み込み中...</span>
        </div>
      </TherapistLayout>
    );
  }

  if (!therapistProfile) {
    return (
      <TherapistLayout>
        <div className="text-center py-10">
          <p>プロフィール情報が見つかりませんでした。</p>
          <Button 
            onClick={() => setActiveTab("profile")} 
            className="mt-4"
          >
            プロフィールを作成する
          </Button>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left sidebar with therapist info */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={therapistProfile.avatarUrl} alt={therapistProfile.name} />
              <AvatarFallback>{therapistProfile.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{therapistProfile.name}</h2>
            <p className="text-sm text-muted-foreground">セラピストID: {therapistProfile.therapistId}</p>
            
            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{therapistProfile.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{therapistProfile.area}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{therapistProfile.workingDays.join(' · ')}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{therapistProfile.workingHours.start}〜{therapistProfile.workingHours.end}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>60分:¥{therapistProfile.pricePerHour.toLocaleString()}〜</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium mb-4">クイックアクション</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction("schedule")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                スケジュール管理
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction("customers")}
              >
                <Users className="mr-2 h-4 w-4" />
                顧客リスト
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickAction("gallery")}
              >
                <Image className="mr-2 h-4 w-4" />
                ギャラリー管理
              </Button>
              <Link to="/messages">
                <Button 
                  variant="outline" 
                  className="w-full justify-start relative"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>メッセージ</span>
                  {unreadMessages > 0 && (
                    <span className="absolute right-2 top-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Main content area */}
        <div>
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="profile">プロフィール設定</TabsTrigger>
              <TabsTrigger value="posts">投稿</TabsTrigger>
              <TabsTrigger value="gallery">ギャラリー</TabsTrigger>
              <TabsTrigger value="bookings">予約</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <TherapistProfileForm therapist={therapistProfile} />
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              <TherapistPostForm />
              
              <div className="mt-8">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback>{post.authorName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{post.authorName}</h4>
                          <p className="text-xs text-muted-foreground">{post.postedAt}</p>
                        </div>
                      </div>
                      <p className="mt-3">{post.content}</p>
                      <div className="flex items-center mt-4 text-sm">
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    投稿がありません
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">ギャラリー</h2>
                  <Button variant="outline" className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" />
                    <span>新規アップロード</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Gallery images will be loaded from database later */}
                  <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg border-gray-300 p-8">
                    <div className="text-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">画像がありません</h3>
                      <p className="mt-1 text-sm text-gray-500">ギャラリーに画像をアップロードしてください</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg border-gray-300 p-8">
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">新しい画像</h3>
                    <p className="mt-1 text-sm text-gray-500">ドラッグ&ドロップまたはクリックしてアップロード</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        ギャラリーに追加
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <TherapistBookingRequests therapistId={therapistProfile.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistDashboard;
