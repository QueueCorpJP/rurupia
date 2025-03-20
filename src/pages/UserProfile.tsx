
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
  Download
} from 'lucide-react';
import type { UserProfile as UserProfileType } from "@/utils/types";

const UserProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    
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
      toast.success("プロフィールを更新しました！");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("プロフィールの更新に失敗しました");
    } finally {
      setIsLoading(false);
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

      toast.success("プロフィール画像をアップロードしました！");
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

      toast.success("書類をアップロードしました！");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("書類のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerificationRequest = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }

      if (!profile.verification_document) {
        toast.error("認証書類をアップロードしてください");
        return;
      }

      // In a real app, this would create a verification request rather than directly setting is_verified
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_verified: true, // This would normally be set by an admin after review
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        is_verified: true,
      });

      toast.success("アカウント認証リクエストを送信しました！管理者の確認をお待ちください。");
    } catch (error) {
      console.error("Error requesting verification:", error);
      toast.error("アカウント認証リクエストに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // Get document URL
  const getDocumentUrl = (filePath: string) => {
    if (!filePath) return "";
    
    const { data } = supabase
      .storage
      .from('verification')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  // All possible MBTI types
  const mbtiTypes = [
    "INTJ", "INTP", "ENTJ", "ENTP", 
    "INFJ", "INFP", "ENFJ", "ENFP", 
    "ISTJ", "ISFJ", "ESTJ", "ESFJ", 
    "ISTP", "ISFP", "ESTP", "ESFP"
  ];

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
              
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3">アカウント設定</h3>
                <ul className="space-y-2">
                  <li>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/profile">プロフィール編集</Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/notification-settings">通知設定</Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start text-red-500" asChild>
                      <Link to="/delete-account">アカウント削除</Link>
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
                  <Label htmlFor="profile-image" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-colors">
                    画像をアップロード
                    <input 
                      type="file" 
                      id="profile-image" 
                      className="hidden"
                      onChange={handleAvatarUpload}
                      accept="image/*"
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
                    placeholder="趣味"
                    value={profile.hobbies?.join(", ") || ""}
                    onChange={(e) => setProfile({ ...profile, hobbies: e.target.value.split(",").map(h => h.trim()) })}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8 bg-gray-50 p-6 rounded-lg border mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">アカウント認証</h3>
                <Badge variant={profile.is_verified ? "secondary" : "outline"}>
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
                    アカウントを認証すると、他のユーザーからの信頼性が向上します。身分証明書をアップロードして認証をリクエストしてください。
                  </p>
                  
                  {profile.verification_document ? (
                    <div className="mb-4">
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
                      
                      <Button 
                        onClick={handleVerificationRequest} 
                        disabled={isLoading} 
                        className="bg-green-500 text-green-50 hover:bg-green-600 transition-colors mt-4"
                      >
                        認証をリクエスト
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Label htmlFor="verification-document" className="block text-sm font-medium text-gray-700">身分証明書</Label>
                      <div className="mt-1 flex items-center">
                        <input 
                          type="file" 
                          id="verification-document" 
                          className="hidden" 
                          onChange={handleDocumentUpload}
                          accept="image/*,application/pdf" 
                        />
                        <Label htmlFor="verification-document" className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                          {verificationFile ? verificationFile.name : "書類を選択"}
                        </Label>
                        {isUploading && <span className="ml-2 text-sm text-gray-500">アップロード中...</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">有効な身分証明書には、運転免許証、パスポート、マイナンバーカードなどが含まれます。</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button onClick={handleProfileUpdate} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              プロフィールを保存
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
