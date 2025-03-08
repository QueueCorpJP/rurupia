
import { useState } from "react";
import { Calendar, Heart, MessageSquare, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/utils/types";
import Layout from "@/components/Layout";

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
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
