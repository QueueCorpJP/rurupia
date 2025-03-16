import { useState, useEffect } from 'react';
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
import { therapists } from '../utils/data';
import { Therapist } from '../utils/types';
import { ArrowLeft, Calendar, DollarSign, MessageSquare, ClipboardList, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TherapistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'availability' | 'message'>('availability');

  useEffect(() => {
    // Simulate loading for a smooth experience
    const timer = setTimeout(() => {
      if (id) {
        const foundTherapist = therapists.find(t => String(t.id) === id);
        setTherapist(foundTherapist || null);
      }
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!therapist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">セラピストが見つかりません</h2>
          <p className="text-muted-foreground mt-2">
            お探しのセラピストは存在しないか、削除されました。
          </p>
          <button
            onClick={() => navigate('/therapists')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            全てのセラピストに戻る
          </button>
        </div>
      </Layout>
    );
  }

  // Japanese reviews
  const japaneseReviews = [
    { id: 1, user: "Mika S.", rating: 5, content: "とても丁寧な施術で、長年の肩こりがすっきりしました！またお願いしたいです。", date: "2023年4月15日" },
    { id: 2, user: "Yuki T.", rating: 4, content: "穏やかな雰囲気で安心してリラックスできました。マッサージの腕前も確かです。", date: "2023年3月28日" },
    { id: 3, user: "Haruna K.", rating: 5, content: "予約時間通りに来ていただき、とても親切でプロフェッショナルな対応でした。", date: "2023年3月10日" }
  ];
  
  // Japanese posts
  const japanesePosts = [
    { id: 1, content: "今日は新しいアロマオイルを使った施術をしました���お客様にも大好評でした！", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3", date: "2日前" },
    { id: 2, content: "マッサージの技術向上のための研修に参加してきました。新しい知識をセッションに活かせるのが楽しみです。", image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3", date: "1週間前" }
  ];

  const japaneseName = `${therapist.name}（${therapist.name.split(' ')[0]}）`;

  return (
    <Layout>
      <button
        onClick={() => navigate('/therapists')}
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        全てのセラピストに戻る
      </button>
      
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg overflow-hidden border">
            {/* Therapist Gallery */}
            <TherapistGallery therapist={therapist} />
            
            <div className="p-6">
              {/* Profile Information */}
              <TherapistProfile 
                therapist={therapist} 
                isFollowing={isFollowing}
                onToggleFollow={() => setIsFollowing(!isFollowing)}
              />
              
              {/* Qualifications and Availability */}
              <TherapistQualifications therapist={therapist} />
              
              {/* Services */}
              <TherapistServices therapist={therapist} />
              
              {/* Reviews */}
              <TherapistReviews reviews={japaneseReviews} />
              
              {/* SNS Posts */}
              <TherapistPosts posts={japanesePosts} therapistName={japaneseName} />
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
                      {therapist.name}さんの施術を予約しましょう。
                    </p>
                    <Link to={`/book/${therapist.id}`}>
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
                onValueChange={(value) => setSidebarTab(value as 'availability' | 'message')}
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
                  <AvailabilityCalendar therapistId={therapist.id} />
                </TabsContent>
                
                <TabsContent value="message" className="p-0 m-0 pt-4">
                  <MessageInterface therapist={therapist} />
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
