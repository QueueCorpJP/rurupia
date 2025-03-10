
import { useState } from "react";
import { Calendar, Heart, MessageSquare, Upload, Check, Search, Sliders, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/utils/types";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserProfilePage = () => {
  // Mock user data
  const [profile, setProfile] = useState<UserProfile>({
    id: "u1",
    nickname: "yossii",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
    age: "30代",
    hobbies: ["読書", "ヨガ", "旅行"],
    mbti: "INFJ"
  });

  // Mock data for booking records
  const bookingRecords = [
    { id: "b1", date: "2023-11-15", time: "14:00-15:30", therapistName: "田中 健太", service: "リラクゼーションマッサージ", status: "完了" },
    { id: "b2", date: "2023-12-03", time: "18:00-19:00", therapistName: "佐藤 大輔", service: "ディープティシューマッサージ", status: "完了" },
    { id: "b3", date: "2024-01-10", time: "13:00-14:00", therapistName: "山田 孝", service: "アロマセラピー", status: "キャンセル" },
    { id: "b4", date: "2024-02-20", time: "20:00-21:30", therapistName: "鈴木 啓太", service: "スウェーディッシュマッサージ", status: "予約済" },
  ];

  // Mock data for liked therapists
  const likedTherapists = [
    { id: 1, name: "鈴木 啓太", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3", specialties: ["スウェーディッシュ", "ディープティシュー"], rating: 4.8, workingHours: "10:00-20:00", isAvailable: true },
    { id: 2, name: "田中 健太", imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3", specialties: ["アロマセラピー", "リラクゼーション"], rating: 4.7, workingHours: "12:00-22:00", isAvailable: false },
    { id: 3, name: "佐藤 大輔", imageUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1378&auto=format&fit=crop&ixlib=rb-4.0.3", specialties: ["スポーツ", "ホットストーン"], rating: 4.9, workingHours: "09:00-19:00", isAvailable: true },
  ];

  // Mock data for messages
  const messages = [
    { id: "m1", therapistName: "鈴木 啓太", therapistImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3", lastMessage: "次回の予約ですが、5月20日14時はいかがでしょうか？", time: "2時間前", unread: true },
    { id: "m2", therapistName: "田中 健太", therapistImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3", lastMessage: "本日はご来店ありがとうございました。またのご利用をお待ちしております。", time: "2日前", unread: false },
    { id: "m3", therapistName: "佐藤 大輔", therapistImage: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1378&auto=format&fit=crop&ixlib=rb-4.0.3", lastMessage: "キャンセルの件、承知いたしました。また機会がありましたらよろしくお願いします。", time: "1週間前", unread: false },
  ];

  const handleUpdateProfile = () => {
    console.log("Updating profile:", profile);
    // This would connect to backend in a real application
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfile({ ...profile, avatarUrl: event.target.result as string });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleHobbiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, hobbies: e.target.value.split(',').map(hobby => hobby.trim()) });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, this would upload to a server
      setProfile({ ...profile, verificationDocument: e.target.files[0].name, isVerified: true });
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left sidebar with user profile */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
              <AvatarFallback>{profile.nickname.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile.nickname}</h2>
            
            {profile.isVerified && (
              <div className="flex items-center mt-2 text-sm text-green-600">
                <Check className="h-4 w-4 mr-1" />
                <span>認証済み</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-medium mb-4">クイックアクション</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-black text-white hover:bg-black/90">
                <Calendar className="mr-2 h-4 w-4" />
                予約履歴
              </Button>
              <Button variant="outline" className="w-full justify-start bg-black text-white hover:bg-black/90">
                <Heart className="mr-2 h-4 w-4" />
                お気に入りセラピスト
              </Button>
              <Button variant="outline" className="w-full justify-start bg-black text-white hover:bg-black/90">
                <MessageSquare className="mr-2 h-4 w-4" />
                メッセージ(0)
              </Button>
            </div>
          </Card>
        </div>

        {/* Main content area */}
        <div>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 bg-transparent border-b w-full rounded-none justify-start gap-6 h-12 px-0">
              <TabsTrigger value="profile" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                プロフィール
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                予約履歴
              </TabsTrigger>
              <TabsTrigger value="favorites" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                お気に入り
              </TabsTrigger>
              <TabsTrigger value="messages" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                メッセージ
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab Content */}
            <TabsContent value="profile">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">プロフィール設定</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-base">
                      ニックネーム<span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="nickname" 
                      value={profile.nickname} 
                      onChange={(e) => setProfile({...profile, nickname: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">
                      アイコン<span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex-1 flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100">
                            {profile.avatarUrl ? (
                              <img 
                                src={profile.avatarUrl} 
                                alt="Profile" 
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="text-sm text-gray-500">写真をアップロード</p>
                              </div>
                            )}
                            <input 
                              id="dropzone-file" 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        <p className="mt-3 text-center">または</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <Button variant="outline" className="w-full">
                          アバターを選択
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base">
                      年齢<span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={profile.age} 
                      onValueChange={(value) => setProfile({...profile, age: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20代">20代</SelectItem>
                        <SelectItem value="30代">30代</SelectItem>
                        <SelectItem value="40代">40代</SelectItem>
                        <SelectItem value="50代">50代</SelectItem>
                        <SelectItem value="60代以上">60代以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hobbies" className="text-base">趣味</Label>
                    <Input 
                      id="hobbies" 
                      placeholder="読書、ヨガ、旅行" 
                      value={profile.hobbies?.join(', ') || ''}
                      onChange={handleHobbiesChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mbti" className="text-base">MBTI (性格タイプ)</Label>
                    <Select 
                      value={profile.mbti} 
                      onValueChange={(value) => setProfile({...profile, mbti: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INTJ">INTJ</SelectItem>
                        <SelectItem value="INTP">INTP</SelectItem>
                        <SelectItem value="ENTJ">ENTJ</SelectItem>
                        <SelectItem value="ENTP">ENTP</SelectItem>
                        <SelectItem value="INFJ">INFJ</SelectItem>
                        <SelectItem value="INFP">INFP</SelectItem>
                        <SelectItem value="ENFJ">ENFJ</SelectItem>
                        <SelectItem value="ENFP">ENFP</SelectItem>
                        <SelectItem value="ISTJ">ISTJ</SelectItem>
                        <SelectItem value="ISFJ">ISFJ</SelectItem>
                        <SelectItem value="ESTJ">ESTJ</SelectItem>
                        <SelectItem value="ESFJ">ESFJ</SelectItem>
                        <SelectItem value="ISTP">ISTP</SelectItem>
                        <SelectItem value="ISFP">ISFP</SelectItem>
                        <SelectItem value="ESTP">ESTP</SelectItem>
                        <SelectItem value="ESFP">ESFP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base flex items-center">
                      身分証明書をアップロード
                      <span className="ml-3 px-2 py-1 text-xs bg-gray-200 rounded">年齢確認用</span>
                    </Label>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById("document-upload")?.click()}
                        className="bg-gray-100"
                      >
                        証明書をアップロード
                      </Button>
                      <input 
                        id="document-upload" 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={handleDocumentUpload}
                      />
                      {profile.verificationDocument && (
                        <div className="flex items-center text-sm text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          <span>アップロード済み</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      運転免許証、パスポート、マイナンバーカードなどの政府発行の身分証明書をアップロードしてください。
                    </p>
                  </div>

                  <Button 
                    onClick={handleUpdateProfile} 
                    className="w-full bg-black text-white hover:bg-black/90"
                  >
                    プロフィールを更新
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            {/* Bookings Tab Content */}
            <TabsContent value="bookings">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">予約履歴</h2>
                  
                  <div className="mb-4 flex justify-between items-center">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="予約を検索..." className="pl-9" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="status-filter" className="text-sm">ステータス：</Label>
                      <Select defaultValue="all">
                        <SelectTrigger id="status-filter" className="w-[180px]">
                          <SelectValue placeholder="全て" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全て</SelectItem>
                          <SelectItem value="completed">完了</SelectItem>
                          <SelectItem value="scheduled">予約済</SelectItem>
                          <SelectItem value="canceled">キャンセル</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>時間</TableHead>
                          <TableHead>セラピスト</TableHead>
                          <TableHead>サービス</TableHead>
                          <TableHead>ステータス</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingRecords.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>{booking.therapistName}</TableCell>
                            <TableCell>{booking.service}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  booking.status === "完了" ? "outline" :
                                  booking.status === "予約済" ? "default" : "destructive"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Favorites Tab Content */}
            <TabsContent value="favorites">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">お気に入りセラピスト</h2>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {likedTherapists.map((therapist) => (
                      <Card key={therapist.id} className="overflow-hidden">
                        <div className="relative h-48">
                          <img 
                            src={therapist.imageUrl} 
                            alt={therapist.name} 
                            className="w-full h-full object-cover" 
                          />
                          {therapist.isAvailable && (
                            <Badge className="absolute top-2 right-2 bg-green-500">
                              営業中
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{therapist.name}</h3>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
                              <span>{therapist.rating}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {therapist.specialties.map((specialty, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center text-sm mb-4 font-medium">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span className={`${therapist.isAvailable ? "text-green-600" : "text-gray-500"}`}>
                              {therapist.workingHours}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 bg-black hover:bg-black/90">
                              予約する
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              プロフィール
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Messages Tab Content */}
            <TabsContent value="messages">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">メッセージ</h2>
                  
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="メッセージを検索..." className="pl-9" />
                  </div>
                  
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className={`p-4 flex gap-4 ${message.unread ? 'bg-muted/30' : ''}`}>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={message.therapistImage} alt={message.therapistName} />
                          <AvatarFallback>{message.therapistName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold">{message.therapistName}</h3>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{message.lastMessage}</p>
                          <div className="mt-3 flex justify-between items-center">
                            <Button size="sm" variant="outline" className="text-xs px-3 py-1 h-auto">
                              返信
                            </Button>
                            {message.unread && (
                              <Badge variant="default" className="text-xs px-2 py-0 h-5">
                                新着
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
