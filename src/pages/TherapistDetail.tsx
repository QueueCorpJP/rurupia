
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BookingForm from '../components/BookingForm';
import MessageInterface from '../components/MessageInterface';
import TherapistGallery from '../components/TherapistGallery';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { therapists } from '../utils/data';
import { Therapist } from '../utils/types';
import { Star, MapPin, Clock, DollarSign, Award, Calendar, MessageSquare, ArrowLeft, Heart, Instagram, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TherapistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'book' | 'message'>('book');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Simulate loading for a smooth experience
    const timer = setTimeout(() => {
      if (id) {
        const foundTherapist = therapists.find(t => t.id === parseInt(id));
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

  // Translate the therapist info to Japanese
  const japaneseName = `${therapist.name}（${therapist.name.split(' ')[0]}）`;
  const japaneseAge = "30代";
  const japaneseHeight = "178cm";
  const japaneseWeight = "75kg";
  const japaneseArea = "東京23区、横浜市";
  const japaneseTime = "18:00～翌3:00";
  const japaneseFollowers = "125人";
  
  // Translate services to Japanese
  const japaneseServices = therapist.services.map(service => ({
    ...service,
    name: service.name === "Swedish Massage" ? "スウェーディッシュマッサージ" :
          service.name === "Deep Tissue Massage" ? "ディープティシューマッサージ" :
          service.name === "Sports Massage" ? "スポーツマッサージ" :
          service.name === "Hot Stone Massage" ? "ホットストーンマッサージ" :
          service.name === "Aromatherapy Massage" ? "アロマセラピーマッサージ" :
          service.name,
    description: "リラックス効果の高い優しいタッチで全身の疲れを癒します。"
  }));
  
  // Japanese reviews
  const japaneseReviews = [
    { id: 1, user: "Mika S.", rating: 5, content: "とても丁寧な施術で、長年の肩こりがすっきりしました！またお願いしたいです。", date: "2023年4月15日" },
    { id: 2, user: "Yuki T.", rating: 4, content: "穏やかな雰囲気で安心してリラックスできました。マッサージの腕前も確かです。", date: "2023年3月28日" },
    { id: 3, user: "Haruna K.", rating: 5, content: "予約時間通りに来ていただき、とても親切でプロフェッショナルな対応でした。", date: "2023年3月10日" }
  ];
  
  // Japanese posts
  const japanesePosts = [
    { id: 1, content: "今日は新しいアロマオイルを使った施術をしました。お客様にも大好評でした！", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3", date: "2日前" },
    { id: 2, content: "マッサージの技術向上のための研修に参加してきました。新しい知識をセッションに活かせるのが楽しみです。", image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?ixlib=rb-4.0.3", date: "1週間前" }
  ];

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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{japaneseName}</h1>
                  <div className="flex items-center mt-2 text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
                      <span className="font-medium">{therapist.rating}</span>
                      <span className="text-muted-foreground ml-1">（{therapist.reviews}件のレビュー）</span>
                    </div>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {japaneseArea}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                      isFollowing 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFollowing ? 'fill-primary text-primary' : ''}`} />
                    {isFollowing ? 'フォロー中' : 'フォローする'}
                  </button>
                  <div className="text-sm text-muted-foreground">{japaneseFollowers}がフォロー中</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {therapist.specialties.map((specialty, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {specialty === "Swedish" ? "スウェーディッシュ" : 
                     specialty === "Deep Tissue" ? "ディープティシュー" : 
                     specialty === "Sports" ? "スポーツ" : 
                     specialty === "Hot Stone" ? "ホットストーン" : 
                     specialty === "Aromatherapy" ? "アロマセラピー" : 
                     specialty === "Relaxation" ? "リラクゼーション" : 
                     specialty}
                  </span>
                ))}
              </div>
              
              {/* Basic profile information */}
              <div className="grid sm:grid-cols-2 gap-4 mt-6 bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">対応可能時間:</span>
                  <span className="text-sm">{japaneseTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">対応エリア:</span>
                  <span className="text-sm">{japaneseArea}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">年齢:</span>
                  <span className="text-sm">{japaneseAge}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">体格:</span>
                  <span className="text-sm">{japaneseHeight} / {japaneseWeight}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="font-semibold text-lg mb-2">自己紹介</h2>
                <p className="text-muted-foreground">
                  こんにちは！{japaneseName}です。リラックスした時間を提供します！ 私は明るく話すことが好きですが、お客様の希望に合わせてサイレントにすることもできます。私の施術は深い筋肉の緊張を解消しながらも、心地よいリラクゼーションを提供することを目指しています。どうぞリラックスして、日常の疲れを忘れるひとときをお過ごしください。
                </p>
              </div>
              
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 mt-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-3">
                    <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                    資格
                  </h3>
                  <ul className="space-y-2">
                    {therapist.qualifications.map((qualification, index) => (
                      <li key={index} className="text-sm">
                        • {qualification === "Certified Massage Therapist (CMT)" ? "認定マッサージセラピスト" :
                            qualification === "Sports Massage Certification" ? "スポーツマッサージ認定" :
                            qualification === "Bachelor's in Kinesiology" ? "運動学学士" :
                            qualification === "Licensed Massage Therapist (LMT)" ? "ライセンスマッサージセラピスト" :
                            qualification === "Aromatherapy Certification" ? "アロマセラピー認定" :
                            qualification === "Hot Stone Therapy Certification" ? "ホットストーンセラピー認定" :
                            qualification}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-3">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    勤務日
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {therapist.availability.map((day, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                      >
                        {day === "Mon" ? "月曜日" :
                         day === "Tue" ? "火曜日" :
                         day === "Wed" ? "水曜日" :
                         day === "Thu" ? "木曜日" :
                         day === "Fri" ? "金曜日" :
                         day === "Sat" ? "土曜日" :
                         day === "Sun" ? "日曜日" : day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="font-semibold text-lg mb-3">施術メニュー</h2>
                <div className="space-y-3">
                  {japaneseServices.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {service.duration}分
                          </span>
                          <span className="font-medium">
                            ¥{(service.price * 150).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Reviews section */}
              <div className="mt-8">
                <h2 className="font-semibold text-lg mb-3">お客様の声</h2>
                <div className="space-y-4">
                  {japaneseReviews.map(review => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{review.user}</div>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                      <p className="text-sm mt-2">{review.content}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-muted hover:bg-muted/80 text-foreground h-10 px-4 py-2 rounded-md transition-all">
                  レビューを書く
                </button>
              </div>
              
              {/* SNS Posts */}
              <div className="mt-8">
                <h2 className="font-semibold text-lg mb-3">最近の投稿</h2>
                <div className="space-y-4">
                  {japanesePosts.map(post => (
                    <div key={post.id} className="border rounded-lg overflow-hidden">
                      {post.image && (
                        <img 
                          src={post.image} 
                          alt="Post" 
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between">
                          <div className="font-medium">{japaneseName}</div>
                          <div className="text-xs text-muted-foreground">{post.date}</div>
                        </div>
                        <p className="text-sm mt-2">{post.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden sticky top-20">
            <div className="p-0">
              <Tabs defaultValue="availability" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="availability" className="text-xs sm:text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">予約可能日</span>
                  </TabsTrigger>
                  <TabsTrigger value="book" className="text-xs sm:text-sm flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">予約する</span>
                  </TabsTrigger>
                  <TabsTrigger value="message" className="text-xs sm:text-sm flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">メッセージ</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="availability" className="p-0 m-0">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">空き状況</h3>
                    <AvailabilityCalendar therapistId={therapist.id} />
                  </div>
                </TabsContent>
                
                <TabsContent value="book" className="p-0 m-0">
                  <BookingForm therapist={therapist} />
                </TabsContent>
                
                <TabsContent value="message" className="p-0 m-0">
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

