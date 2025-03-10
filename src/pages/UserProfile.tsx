
import { useState } from "react";
import { 
  Calendar, Heart, MessageSquare, Upload, Check, Search, 
  User, Clock, Star, Settings, Shield, FileText, 
  ChevronRight, BellRing, Copy, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/utils/types";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

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
    { id: "b1", date: "2023-11-15", time: "14:00-15:30", therapistName: "田中 健太", service: "リラクゼーションマッサージ", status: "完了", location: "銀座店" },
    { id: "b2", date: "2023-12-03", time: "18:00-19:00", therapistName: "佐藤 大輔", service: "ディープティシューマッサージ", status: "完了", location: "新宿店" },
    { id: "b3", date: "2024-01-10", time: "13:00-14:00", therapistName: "山田 孝", service: "アロマセラピー", status: "キャンセル", location: "渋谷店" },
    { id: "b4", date: "2024-02-20", time: "20:00-21:30", therapistName: "鈴木 啓太", service: "スウェーディッシュマッサージ", status: "予約済", location: "池袋店" },
  ];

  // Mock data for liked therapists
  const likedTherapists = [
    { id: 1, name: "鈴木 啓太", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3", specialties: ["スウェーディッシュ", "ディープティシュー"], rating: 4.8, workingHours: "10:00-20:00", isAvailable: true, location: "銀座店" },
    { id: 2, name: "田中 健太", imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3", specialties: ["アロマセラピー", "リラクゼーション"], rating: 4.7, workingHours: "12:00-22:00", isAvailable: false, location: "新宿店" },
    { id: 3, name: "佐藤 大輔", imageUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1378&auto=format&fit=crop&ixlib=rb-4.0.3", specialties: ["スポーツ", "ホットストーン"], rating: 4.9, workingHours: "09:00-19:00", isAvailable: true, location: "渋谷店" },
  ];

  // Mock data for messages
  const messages = [
    { id: "m1", therapistName: "鈴木 啓太", therapistImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3", lastMessage: "次回の予約ですが、5月20日14時はいかがでしょうか？", time: "2時間前", unread: true },
    { id: "m2", therapistName: "田中 健太", therapistImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3", lastMessage: "本日はご来店ありがとうございました。またのご利用をお待ちしております。", time: "2日前", unread: false },
    { id: "m3", therapistName: "佐藤 大輔", therapistImage: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1378&auto=format&fit=crop&ixlib=rb-4.0.3", lastMessage: "キャンセルの件、承知いたしました。また機会がありましたらよろしくお願いします。", time: "1週間前", unread: false },
  ];

  // Recent loyalty points activity
  const pointsActivity = [
    { id: 1, date: "2024-01-15", action: "マッサージ予約完了", points: 100, type: "earned" },
    { id: 2, date: "2024-02-03", action: "誕生日ボーナス", points: 200, type: "earned" },
    { id: 3, date: "2024-02-20", action: "ディスカウント適用", points: 150, type: "spent" },
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
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Left sidebar - User profile summary */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/80 to-primary"></div>
              <div className="px-6 pb-6">
                <div className="-mt-12 flex justify-center">
                  <Avatar className="h-24 w-24 ring-4 ring-background">
                    <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
                    <AvatarFallback>{profile.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold">{profile.nickname}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{profile.age}</p>
                  
                  {profile.isVerified && (
                    <div className="flex items-center justify-center mt-2 text-sm text-green-600 gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      <span>認証済み</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 justify-center mt-3">
                    {profile.hobbies?.map((hobby, index) => (
                      <Badge key={index} variant="outline" className="bg-secondary">
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1 p-2">
                    <p className="text-xl font-semibold">12</p>
                    <p className="text-xs text-muted-foreground">予約回数</p>
                  </div>
                  <div className="space-y-1 p-2">
                    <p className="text-xl font-semibold">350</p>
                    <p className="text-xs text-muted-foreground">ポイント</p>
                  </div>
                  <div className="space-y-1 p-2">
                    <p className="text-xl font-semibold">3</p>
                    <p className="text-xs text-muted-foreground">お気に入り</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">クイックアクション</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    新規予約をする
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    最新の予約を確認
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                    <BellRing className="h-4 w-4 mr-2" />
                    通知設定を変更
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ポイント履歴</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between pb-4 mb-2 border-b">
                  <div>
                    <p className="font-medium">現在のポイント</p>
                    <p className="text-sm text-muted-foreground">有効期限: 2024年12月31日</p>
                  </div>
                  <div className="text-xl font-bold">350</div>
                </div>
                <div className="space-y-3">
                  {pointsActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                      <div className={`font-medium ${activity.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                        {activity.type === 'earned' ? '+' : '-'}{activity.points}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content - Tabs */}
          <div>
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid grid-cols-4 rounded-lg mb-6 bg-muted/30">
                <TabsTrigger value="bookings">予約履歴</TabsTrigger>
                <TabsTrigger value="favorites">お気に入り</TabsTrigger>
                <TabsTrigger value="messages">メッセージ</TabsTrigger>
                <TabsTrigger value="profile">プロフィール</TabsTrigger>
              </TabsList>
              
              {/* Bookings Tab Content */}
              <TabsContent value="bookings">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>予約履歴</CardTitle>
                      <CardDescription>過去および今後の予約を確認できます</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-60">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="予約を検索..." className="pl-9" />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-36">
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
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>日付 / 時間</TableHead>
                            <TableHead>セラピスト</TableHead>
                            <TableHead>サービス</TableHead>
                            <TableHead>場所</TableHead>
                            <TableHead>ステータス</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookingRecords.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <div className="font-medium">{booking.date}</div>
                                <div className="text-sm text-muted-foreground">{booking.time}</div>
                              </TableCell>
                              <TableCell>{booking.therapistName}</TableCell>
                              <TableCell>{booking.service}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>{booking.location}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    booking.status === "完了" ? "outline" :
                                    booking.status === "予約済" ? "default" : "destructive"
                                  }
                                  className={
                                    booking.status === "完了" ? "bg-muted text-foreground" :
                                    booking.status === "予約済" ? "bg-green-500/10 text-green-600 hover:bg-green-500/10 border-green-500/20" : ""
                                  }
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
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
                  <CardHeader className="pb-2">
                    <CardTitle>お気に入りセラピスト</CardTitle>
                    <CardDescription>あなたがお気に入りに登録したセラピスト</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {likedTherapists.map((therapist) => (
                        <Card key={therapist.id} className="overflow-hidden card-hover">
                          <div className="relative h-48">
                            <img 
                              src={therapist.imageUrl} 
                              alt={therapist.name} 
                              className="w-full h-full object-cover" 
                            />
                            {therapist.isAvailable && (
                              <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-500">
                                営業中
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{therapist.name}</h3>
                              <div className="flex items-center bg-amber-500/10 px-2 py-0.5 rounded-full">
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                                <span className="text-sm font-medium">{therapist.rating}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {therapist.specialties.map((specialty, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-muted">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center text-sm mb-3 font-medium">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className={`${therapist.isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                                {therapist.workingHours}
                              </span>
                            </div>
                            <div className="flex items-center text-sm mb-4">
                              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{therapist.location}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1">
                                予約する
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                プロフィール
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Messages Tab Content */}
              <TabsContent value="messages">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>メッセージ</CardTitle>
                    <CardDescription>セラピストとのメッセージ履歴</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="メッセージを検索..." className="pl-9" />
                    </div>
                    
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <Card key={message.id} className={`overflow-hidden hover:bg-muted/10 transition-colors ${message.unread ? 'border-primary/30 bg-primary/5' : ''}`}>
                          <CardContent className="p-4 flex gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={message.therapistImage} alt={message.therapistName} />
                              <AvatarFallback>{message.therapistName.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-semibold">{message.therapistName}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{message.time}</span>
                                  {message.unread && (
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{message.lastMessage}</p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-xs px-3">
                                  返信
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Profile Tab Content */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>プロフィール設定</CardTitle>
                    <CardDescription>あなたの情報を編集できます</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nickname" className="text-base">
                            ニックネーム<span className="text-destructive">*</span>
                          </Label>
                          <Input 
                            id="nickname" 
                            value={profile.nickname} 
                            onChange={(e) => setProfile({...profile, nickname: e.target.value})}
                            className="mt-1.5"
                          />
                        </div>

                        <div>
                          <Label htmlFor="age" className="text-base">
                            年齢<span className="text-destructive">*</span>
                          </Label>
                          <Select 
                            value={profile.age} 
                            onValueChange={(value) => setProfile({...profile, age: value})}
                          >
                            <SelectTrigger className="w-full mt-1.5">
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

                        <div>
                          <Label htmlFor="hobbies" className="text-base">趣味</Label>
                          <Input 
                            id="hobbies" 
                            placeholder="読書、ヨガ、旅行" 
                            value={profile.hobbies?.join(', ') || ''}
                            onChange={handleHobbiesChange}
                            className="mt-1.5"
                          />
                        </div>

                        <div>
                          <Label htmlFor="mbti" className="text-base">MBTI (性格タイプ)</Label>
                          <Select 
                            value={profile.mbti} 
                            onValueChange={(value) => setProfile({...profile, mbti: value})}
                          >
                            <SelectTrigger className="w-full mt-1.5">
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
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-base mb-3 block">
                            プロフィール画像
                          </Label>
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative">
                              <Avatar className="w-32 h-32">
                                <AvatarImage 
                                  src={profile.avatarUrl} 
                                  alt={profile.nickname}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-2xl">
                                  {profile.nickname.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md">
                                <Upload className="h-4 w-4" />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={handleImageUpload}
                                />
                              </label>
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                              推奨: 300×300px以上、最大2MB
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 p-4 rounded-lg border bg-muted/20">
                          <div className="flex items-center">
                            <Shield className="h-5 w-5 text-muted-foreground mr-2" />
                            <Label className="text-base">
                              本人確認
                              {profile.isVerified && (
                                <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-600 hover:bg-green-500/10 border-green-500/20">
                                  認証済み
                                </Badge>
                              )}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 mb-4">
                            安全なコミュニティのために、身分証明書のアップロードをお願いしています。
                          </p>
                          <div className="flex items-center space-x-3">
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById("document-upload")?.click()}
                              size="sm"
                              className="text-sm"
                              disabled={profile.isVerified}
                            >
                              証明書をアップロード
                            </Button>
                            <input 
                              id="document-upload" 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png" 
                              onChange={handleDocumentUpload}
                              disabled={profile.isVerified}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline">キャンセル</Button>
                      <Button onClick={handleUpdateProfile}>
                        プロフィールを更新
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
