import React, { useState, useEffect } from "react";
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
  Loader2,
  X
} from 'lucide-react';
import type { UserProfile as UserProfileType } from "@/utils/types";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const UserProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [hobbyInput, setHobbyInput] = useState('');
  
  const [profile, setProfile] = useState<UserProfileType>({
    id: "",
    nickname: "",
    age: "",
    avatar_url: "", 
    email: "",
    mbti: "",
    hobbies: [],
    is_verified: false,
    verification_document: "",
    needs_email_setup: false
  });

  // State for email setup
  const [showEmailSetup, setShowEmailSetup] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

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
            needs_email_setup: data.needs_email_setup || false,
          });
          
          // Show email setup modal if user needs to set up email
          // Only show if they actually need email setup AND don't have a real email
          const hasRealEmail = user.email && !user.email.includes('@temp.rupipia.jp');
          if (data.needs_email_setup && !hasRealEmail) {
            setShowEmailSetup(true);
          }
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
        avatar_url: publicUrlData?.publicUrl || "",
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
      
    return data?.publicUrl || "";
  };

  const mbtiTypes = [
    "INTJ", "INTP", "ENTJ", "ENTP", 
    "INFJ", "INFP", "ENFJ", "ENFP", 
    "ISTJ", "ISFJ", "ESTJ", "ESFJ", 
    "ISTP", "ISFP", "ESTP", "ESFP"
  ];

  const handleAddHobby = () => {
    if (hobbyInput.trim()) {
      // Split by commas or spaces to allow multiple entries at once
      const newHobbies = hobbyInput.split(/[,、]/).map(h => h.trim()).filter(h => h);
      
      // Filter out duplicates
      const uniqueNewHobbies = newHobbies.filter(
        hobby => !profile.hobbies?.includes(hobby)
      );
      
      if (uniqueNewHobbies.length > 0) {
        setProfile({
          ...profile,
          hobbies: [...(Array.isArray(profile.hobbies) ? profile.hobbies : []), ...uniqueNewHobbies]
        });
      }
      setHobbyInput('');
    }
  };
  
  const handleRemoveHobby = (hobbyToRemove: string) => {
    setProfile({
      ...profile,
      hobbies: profile.hobbies?.filter(hobby => hobby !== hobbyToRemove) || [],
    });
  };

  const handleEmailSetup = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("有効なメールアドレスを入力してください");
      return;
    }

    // Check if this is actually a change (different from current email and not a temp email)
    const hasRealEmail = profile.email && !profile.email.includes('@temp.rupipia.jp');
    const isEmailChange = hasRealEmail && profile.email !== newEmail;
    const isInitialSetup = !hasRealEmail;

    setIsUpdatingEmail(true);
    
    try {
      // First check if the email is already taken by another user
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newEmail);

      // Filter out current user if found
      const otherUsersWithEmail = existingProfiles?.filter(existingProfile => existingProfile.id !== profile.id) || [];

      if (otherUsersWithEmail.length > 0) {
        toast.error("このメールアドレスは既に使用されています", {
          description: "別のメールアドレスをお試しください。または、そのメールアドレスでアカウントを作成済みの場合は、パスワードログインをご利用ください。",
          duration: 6000,
        });
        setIsUpdatingEmail(false);
        return;
      }
    } catch (error) {
      console.warn("Could not check email availability:", error);
      // Continue with the update - the auth service will catch duplicates anyway
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ユーザー情報を取得できませんでした");
        return;
      }

      // Only update Supabase auth email if it's different from current auth email
      const currentAuthEmail = user.email;
      const needsAuthUpdate = currentAuthEmail !== newEmail;
      
      if (needsAuthUpdate) {
        console.log("Updating auth email from", currentAuthEmail, "to", newEmail);
        
        const { error: emailError } = await supabase.auth.updateUser({
          email: newEmail
        });

        if (emailError) {
          console.error("Error updating user email:", emailError);
          throw emailError;
        }
      } else {
        console.log("Auth email already matches, skipping auth update");
      }

      // Update profile with new email and remove needs_email_setup flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: newEmail,
          needs_email_setup: false,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      // Update local state
      setProfile({
        ...profile,
        email: newEmail,
        needs_email_setup: false,
      });
      
      setShowEmailSetup(false);
      setNewEmail("");
      
      // Different success messages based on action type
      if (isEmailChange) {
        toast.success("メールアドレスを変更しました！", {
          position: "top-center",
          duration: 3000,
          icon: <CheckCircle className="h-5 w-5" />,
          description: "新しいメールアドレスに確認メールが送信されました"
        });
      } else if (isInitialSetup) {
        toast.success("メールアドレスが設定されました！", {
          position: "top-center",
          duration: 3000,
          icon: <CheckCircle className="h-5 w-5" />,
          description: "今後、こちらのメールアドレスに通知が送信されます"
        });
      }
    } catch (error) {
      console.error("Error setting up email:", error);
      
      // Check for specific error messages and provide user-friendly feedback
      let errorMessage = isEmailChange ? "メールアドレスの変更に失敗しました" : "メールアドレスの設定に失敗しました";
      let errorDescription = "";
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as any).message;
        
                if (errorMsg.includes('A user with this email address has already been signed up') ||
            errorMsg.includes('already been signed up')) {
          errorMessage = "このメールアドレスは既に使用されています";
          errorDescription = "別のメールアドレスをお試しください。または、そのメールアドレスでアカウントを作成済みの場合は、パスワードログインをご利用ください。";
        } else if (errorMsg.includes('Invalid email')) {
          errorMessage = "無効なメールアドレスです";
          errorDescription = "正しい形式のメールアドレスを入力してください。";
        } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
          errorMessage = "ネットワークエラーが発生しました";
          errorDescription = "インターネット接続を確認して、もう一度お試しください。";
        } else {
          // For other errors, show the original error message if it's user-friendly
          errorDescription = errorMsg;
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 6000, // Show longer for error messages
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

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
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 flex items-center h-10 px-3 rounded-md border border-input bg-background">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {profile.email || "未設定"}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewEmail(profile.email || "");
                        setShowEmailSetup(true);
                      }}
                      className="shrink-0"
                    >
                      {profile.email ? "変更" : "設定"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">通知やアカウント回復のために使用されます。</p>
                  {!profile.email && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      メールアドレスが設定されていません。設定することをお勧めします。
                    </p>
                  )}
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
                  <div className="flex items-center space-x-2">
                    <Input
                      id="hobbies-input"
                      value={hobbyInput}
                      onChange={(e) => setHobbyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHobby();
                        }
                      }}
                      placeholder="趣味を入力してEnterキーを押してください"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddHobby} 
                      size="sm">追加</Button>
                  </div>
                  
                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.hobbies.map((hobby, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {hobby}
                          <X 
                            size={14} 
                            className="cursor-pointer" 
                            onClick={() => handleRemoveHobby(hobby)} 
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    複数の趣味を追加するには、一つずつ入力してEnterを押すか、カンマ区切りで複数入力できます
                  </p>
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
                    あなたのアカウントは認証されています。認証済みユーザーはプラットフォーム内でより高い信頼性を得られます。セラピストとのメッセージ機能や予約機能をご利用いただけます。
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
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800 mb-1">ID認証が必要です</h4>
                        <p className="text-sm text-amber-700">
                          セラピストとのメッセージ機能や予約機能をご利用いただくには、身分証明書による年齢認証が必要です。管理者による認証が完了するまでお待ちください。
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    身分証明書をアップロードして年齢認証を完了してください。認証により、より安全で信頼性の高いサービスをご利用いただけます。
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="verification-document" className="block text-sm font-medium text-gray-700 mb-2">
                        身分証明書のアップロード
                      </Label>
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="verification-document" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-colors inline-flex items-center">
                          {isUploading ? (
                            <span className="contents">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              アップロード中...
                            </span>
                          ) : (
                            <span className="contents">
                              <UploadCloud className="h-4 w-4 mr-2" />
                              書類を選択
                            </span>
                          )}
                          <input 
                            type="file" 
                            id="verification-document" 
                            className="hidden"
                            onChange={handleDocumentUpload}
                            accept="image/*,.pdf"
                            disabled={isUploading}
                          />
                        </Label>
                        {verificationFile && (
                          <span className="text-sm text-gray-600">
                            選択済み: {verificationFile.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        運転免許証、パスポート、マイナンバーカードなど（画像またはPDF形式）
                      </p>
                    </div>
                  </div>
                  
                  {profile.verification_document && (
                    <div className="mt-4">
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

      {/* Email Setup/Change Dialog */}
      <Dialog open={showEmailSetup} onOpenChange={setShowEmailSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {profile.email && !profile.email.includes('@temp.rupipia.jp') ? "メールアドレスの変更" : "メールアドレスの設定"}
            </DialogTitle>
            <DialogDescription>
              {profile.email && !profile.email.includes('@temp.rupipia.jp')
                ? "新しいメールアドレスを入力してください。変更後は新しいアドレスに確認メールが送信されます。"
                : "LINEアカウントからメールアドレスが取得できませんでした。通知やパスワードリセットのために、メールアドレスを設定してください。"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {profile.email && !profile.email.includes('@temp.rupipia.jp') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">現在のメールアドレス</Label>
                <div className="flex items-center p-2 bg-gray-50 rounded-md">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.email}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-email" className="text-sm font-medium">
                {profile.email && !profile.email.includes('@temp.rupipia.jp') ? "新しいメールアドレス" : "メールアドレス"}
              </Label>
              <Input
                id="new-email"
                type="email"
                placeholder="your-email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              このメールアドレスは通知の送信やアカウント回復のために使用されます。
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEmailSetup(false)}>
              {profile.email && !profile.email.includes('@temp.rupipia.jp') ? "キャンセル" : "後で"}
            </Button>
            <Button 
              onClick={handleEmailSetup} 
              disabled={isUpdatingEmail || !newEmail.includes('@')}
            >
              {isUpdatingEmail ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  更新中...
                </span>
              ) : (
                profile.email && !profile.email.includes('@temp.rupipia.jp') ? "変更する" : "保存する"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default UserProfile;
