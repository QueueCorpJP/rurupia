import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  User as UserIcon,
  UploadCloud,
  Mail,
  FileText,
  Download,
  Calendar,
  MessageSquare,
  Heart,
  Clock,
  Bell,
  UserX,
  Loader2
} from 'lucide-react';
import type { UserProfile as UserProfileType } from "@/utils/types";

const UserProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  
  const [profile, setProfile] = useState<UserProfileType>({
    id: "",
    nickname: "",
    age: "",
    avatar_url: "", 
    email: "",
    mbti: "",
    hobbies: [],
    is_verified: false,
    verification_document: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("ユーザー情報を取得できませんでした");
          navigate("/login");
          return;
        }

        console.log("Fetching profile for user:", user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("Fetched profile data:", data);

        if (data) {
          setProfile({
            id: data.id,
            nickname: data.nickname || "",
            age: data.age || "",
            avatar_url: data.avatar_url || "",
            email: user.email || "",
            mbti: data.mbti || "",
            hobbies: data.hobbies || [],
            is_verified: data.is_verified || false,
            verification_document: data.verification_document || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("プロフィールの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }

      console.log("Updating profile for user:", user.id);
      console.log("Profile data to update:", {
        nickname: profile.nickname,
        age: profile.age,
        avatar_url: profile.avatar_url,
        mbti: profile.mbti,
        hobbies: profile.hobbies,
      });

      const { data, error } = await supabase
        .from('profiles')
        .update({
          nickname: profile.nickname,
          age: profile.age,
          avatar_url: profile.avatar_url,
          mbti: profile.mbti,
          hobbies: profile.hobbies,
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Profile updated successfully:", data);
      toast.success("プロフィールを更新しました！", {
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
        description: "変更内容が保存されました"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("プロフィールの更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }
      
      console.log("Uploading avatar for user:", user.id);
      
      const filePath = `${user.id}_avatar_${Date.now()}.${file.name.split('.').pop()}`;
      
      console.log("Attempting to upload avatar to path:", filePath);
      
      const { data, error } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, file, {
          upsert: true
        });

      if (error) {
        console.error("Error uploading avatar:", error);
        throw error;
      }

      console.log("Avatar uploaded successfully:", data);

      const { data: publicUrlData } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log("Avatar public URL:", publicUrlData);

      setProfile({
        ...profile,
        avatar_url: publicUrlData.publicUrl,
      });

      toast.success("プロフィール画像をアップロードしました！", {
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
        description: "新しいプロフィール画像が保存されました"
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setVerificationFile(file);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }
      
      console.log("Uploading verification document for user:", user.id);
      
      const filePath = `${user.id}/${user.id}-verification-document.${file.name.split('.').pop()}`;
      
      console.log("Attempting to upload document to path:", filePath);
      
      const { data, error } = await supabase
        .storage
        .from('verification')
        .upload(filePath, file, {
          upsert: true
        });

      if (error) {
        console.error("Error uploading document:", error);
        throw error;
      }

      console.log("Document uploaded successfully:", data);

      const { data: publicUrlData } = supabase
        .storage
        .from('verification')
        .getPublicUrl(filePath);

      console.log("Document public URL:", publicUrlData);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_document: filePath,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("Error updating profile with document:", updateError);
        throw updateError;
      }

      setProfile({
        ...profile,
        verification_document: filePath,
      });

      toast.success("書類をアップロードしました！", {
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5" />,
        description: "書類が正常にアップロードされました"
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("書類のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const getDocumentUrl = (filePath: string) => {
    if (!filePath) return "";
    
    const { data } = supabase
      .storage
      .from('verification')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  const mbtiTypes = [
    "INTJ", "INTP", "ENTJ", "ENTP", 
    "INFJ", "INFP", "ENFJ", "ENFP", 
    "ISTJ", "ISFJ", "ESTJ", "ESFJ", 
    "ISTP", "ISFP", "ESTP", "ESFP"
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">プロフィールを読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-24">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-2 border-4 border-white shadow">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.nickname || "User"} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <UserIcon className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                  </div>
                  
                  {profile.is_verified && (
                    <div className="absolute bottom-2 right-0 bg-green-500 text-white rounded-full p-1" title="Verified">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold">{profile.nickname || "匿名ユーザー"}</h2>
                <p className="text-gray-500 text-sm">{profile.age || "年齢未設定"}</p>
                
                {profile.is_verified ? (
                  <div className="flex items-center mt-2 text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">認証済み</span>
                  </div>
                ) : (
                  <div className="flex items-center mt-2 text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">未認証</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 border-t pt-6">
                <h3 className="text-md font-semibold mb-3">アクティビティ</h3>
                <ul className="space-y-2">
                  <li>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/user-bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        予約履歴
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        メッセージ
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/followed-therapists">
                        <Heart className="mr-2 h-4 w-4" />
                        フォロー中のセラピスト
                      </Link>
                    </Button>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <h3 className="text-md font-semibold mb-3">アカウント設定</h3>
                <ul className="space-y-2">
                  <li>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/notification-settings">
                        <Bell className="mr-2 h-4 w-4" />
                        通知設定
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-red-500" asChild>
                      <Link to="/delete-account">
                        <UserX className="mr-2 h-4 w-4" />
                        アカウント削除
                      </Link>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-6">プロフィール編集</h1>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">プロフィール画像</h3>
              <div className="flex items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 mr-4">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.nickname || "User"} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="profile-image" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-colors inline-flex items-center">
                    {isUploading ? (
                      <span className="contents">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        アップロード中...
                      </span>
                    ) : (
                      <span className="contents">
                        <UploadCloud className="h-4 w-4 mr-2" />
                        画像をアップロード
                      </span>
                    )}
                    <input 
                      type="file" 
                      id="profile-image" 
                      className="hidden"
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      disabled={isUploading}
                    />
                  </Label>
                  <p className="text-sm text-gray-500 mt-2">推奨サイズ：300x300px</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="nickname" className="block text-sm font-medium text-gray-700">ニックネーム</Label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="nickname"
                    placeholder="ニックネーム"
                    value={profile.nickname || ""}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</Label>
                <div className="mt-1">
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {profile.email || "未設定"}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">メールアドレスは認証で使用されます。変更には再認証が必要です。</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="age" className="block text-sm font-medium text-gray-700">年齢</Label>
                <div className="mt-1">
                  <Select value={profile.age || ""} onValueChange={(value) => setProfile({ ...profile, age: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="年齢を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10代">10代</SelectItem>
                      <SelectItem value="20代">20代</SelectItem>
                      <SelectItem value="30代">30代</SelectItem>
                      <SelectItem value="40代">40代</SelectItem>
                      <SelectItem value="50代">50代</SelectItem>
                      <SelectItem value="60代以上">60代以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="mbti" className="block text-sm font-medium text-gray-700">MBTI</Label>
                <div className="mt-1">
                  <Select 
                    value={profile.mbti || ""} 
                    onValueChange={(value) => setProfile({ ...profile, mbti: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="MBTIタイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {mbtiTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">MBTIは心理学的な性格分類システムです</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="hobbies" className="block text-sm font-medium text-gray-700">趣味</Label>
                <div className="mt-1">
                  <Textarea
                    id="hobbies"
                    placeholder="趣味を入力（改行で複数入力可能）"
                    value={Array.isArray(profile.hobbies) ? profile.hobbies.join("\n") : ""}
                    onChange={(e) => {
                      const hobbies = e.target.value.split("\n").map(h => h.trim()).filter(Boolean);
                      setProfile({ ...profile, hobbies });
                    }}
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">Enterキーで改行して複数の趣味を入力できます</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8 bg-gray-50 p-6 rounded-lg border mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">アカウント認証状態</h3>
                <Badge variant={profile.is_verified ? "secondary" : "outline"} className={profile.is_verified ? "bg-green-100 text-green-800" : ""}>
                  {profile.is_verified ? "認証済み" : "未認証"}
                </Badge>
              </div>
              
              {profile.is_verified ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    あなたのアカウントは認証されています。認証済みユーザーはプラットフォーム内でより高い信頼性を得られます。
                  </p>
                  {profile.verification_document && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">アップロード済み書類:</p>
                      <div className="mt-1 flex items-center p-3 bg-white border rounded-md">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="flex-1 text-sm">身分証明書</span>
                        <a 
                          href={getDocumentUrl(profile.verification_document)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline flex items-center ml-4"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          表示
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    アカウント認証サービスは現在メンテナンス中です。認証が必要な場合は、カスタマーサポートにお問い合わせください。
                  </p>
                  
                  {profile.verification_document && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">アップロード済み書類:</p>
                      <div className="mt-1 flex items-center p-3 bg-white border rounded-md">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="flex-1 text-sm">身分証明書</span>
                        <a 
                          href={getDocumentUrl(profile.verification_document)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline flex items-center ml-4"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          表示
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleProfileUpdate} 
              disabled={isSaving} 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center"
            >
              {isSaving ? (
                <span className="contents">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </span>
              ) : (
                "プロフィールを保存"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
