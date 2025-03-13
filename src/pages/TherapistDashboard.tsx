
import { useState } from "react";
import { 
  Calendar, Clock, DollarSign, Heart, MapPin, Upload, UploadCloud, Image, Building, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TherapistProfileForm } from "@/components/therapist/TherapistProfileForm";
import { TherapistPostForm } from "@/components/therapist/TherapistPostForm";
import { TherapistBookingRequests } from "@/components/therapist/TherapistBookingRequests";
import { TherapistLayout } from "@/components/therapist/TherapistLayout";

const TherapistDashboard = () => {
  // Mock therapist data
  const therapistProfile = {
    id: "t1",
    name: "よしひろ",
    therapistId: "p2r0G",
    location: "東京秘密基地",
    area: "東京",
    detailedArea: "渋谷区、新宿区",
    workingDays: ["月", "水", "金", "土"],
    workingHours: { start: "22:00", end: "8:00" },
    pricePerHour: 10000,
    bio: "こんにちは！よしひろです。リラックスした時間を提供します！",
    height: 173,
    weight: 67,
    hobbies: ["映画鑑賞", "料理", "旅行"],
    serviceAreas: { prefecture: "東京都", cities: ["渋谷区", "新宿区"] },
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"
  };

  // Mock post
  const post = {
    id: "p1",
    content: "今日楽しかったー",
    postedAt: "2025/02/26 10:59",
    likes: 3,
    authorName: therapistProfile.name,
    authorAvatar: therapistProfile.avatarUrl
  };

  // Mock booking requests
  const bookingRequests = [
    {
      id: "b1",
      clientName: "scroke0",
      requestTime: "2024/11/08 00:00",
      servicePrice: 13523,
      serviceLocation: "東京都渋谷区",
      meetingMethod: "お客様宅",
      status: "承認待ち" as const
    },
    {
      id: "b2",
      clientName: "sbeevors5",
      requestTime: "2024/04/05 00:00",
      servicePrice: 19752,
      serviceLocation: "東京都新宿区",
      meetingMethod: "ホテル",
      status: "確定" as const
    },
    {
      id: "b3",
      clientName: "jpietroni6",
      requestTime: "2024/06/11 00:00",
      servicePrice: 34045,
      serviceLocation: "東京都中央区",
      meetingMethod: "お客様宅",
      status: "承認待ち" as const
    },
    {
      id: "b4",
      clientName: "esee9",
      requestTime: "2024/12/01 00:00",
      servicePrice: 8091,
      serviceLocation: "東京都品川区",
      meetingMethod: "ホテル",
      status: "キャンセル" as const
    }
  ];

  // Mock gallery images
  const galleryImages = [
    {
      id: "g1",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
      title: "ポートレート1"
    },
    {
      id: "g2",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
      title: "ポートレート2"
    },
    {
      id: "g3",
      url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
      title: "ポートレート3"
    },
    {
      id: "g4",
      url: "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
      title: "日常風景"
    }
  ];

  // Current active tab
  const [activeTab, setActiveTab] = useState("profile");

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
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                スケジュール管理
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                顧客リスト
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Image className="mr-2 h-4 w-4" />
                ギャラリー管理
              </Button>
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
                <div className="border rounded-lg p-4">
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
                  {galleryImages.map((image) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                      <img 
                        src={image.url} 
                        alt={image.title} 
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <h4 className="text-white font-medium">{image.title}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20 hover:text-white">
                            編集
                          </Button>
                          <Button variant="destructive" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                            削除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
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
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <TherapistBookingRequests bookingRequests={bookingRequests} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TherapistLayout>
  );
};

export default TherapistDashboard;
