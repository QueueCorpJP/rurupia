import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idDocument) {
      toast.error("身分証明書をアップロードしてください");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 1. Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          },
          // Add emailRedirectTo to ensure proper redirect after email verification
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (authError) {
        console.error("Auth error:", authError);
        toast.error(authError.message);
        return;
      }
      
      if (!authData.user) {
        toast.error("ユーザーの登録に失敗しました");
        return;
      }
      
      console.log("User registered successfully:", authData.user.id);

      // Check if a profile already exists before creating one
      const { data: existingProfile, error: checkProfileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
        
      if (checkProfileError && checkProfileError.code !== 'PGRST116') {
        // PGRST116 means "not found", which is expected if profile doesn't exist
        console.error("Error checking for existing profile:", checkProfileError);
      }
      
      // Only create a new profile if one doesn't exist yet
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: name,
              email: email
              // Don't set created_at and updated_at - let the database handle this
            }
          ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't fail the registration if profile creation fails
          // The trigger might have already created the profile
        }
      }

      // Immediately sign in after registration for better UX
      if (!authData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error("Sign in error after registration:", signInError);
          toast.error("ログインに失敗しました");
        } else if (signInData.session) {
          authData.session = signInData.session;
        }
      }
      
      // 2. Upload the ID document with proper path structure
      const fileExt = idDocument.name.split('.').pop();
      const userId = authData.user.id;
      // Store files in user-specific folders
      const filePath = `${userId}/${userId}-verification-document.${fileExt}`;
      
      console.log("Attempting to upload file to path:", filePath);
      
      // Upload the file to the verification bucket
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('verification')
        .upload(filePath, idDocument, {
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        toast.error("ファイルのアップロードに失敗しました");
        return;
      }
      
      console.log("File uploaded successfully:", uploadData);
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase
        .storage
        .from('verification')
        .getPublicUrl(filePath);
      
      console.log("File public URL:", urlData);
      
      // Note: The profile should automatically be created by the trigger we set up
      // However, we'll update it with additional information
      if (authData.session) {
        // Use upsert instead of update to handle both cases
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            nickname: name,
            email: email,
            verification_document: filePath,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'id',  // Specify the constraint
            ignoreDuplicates: false  // Update if exists
          });
          
        if (profileUpdateError) {
          console.error("Error updating profile:", profileUpdateError);
          // Don't fail the registration if profile update fails
          // The handle_new_user trigger should have created the basic profile
        }
      }
      
      // 4. Handle session and navigation
      if (authData.session) {
        // User was automatically signed in, navigate to home
        toast.success("登録が完了しました！");
        navigate("/");
      } else {
        // Check if email confirmation is required
        toast.success("登録が完了しました。メールアドレスを確認してください。");
        navigate("/login");
      }
      
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("登録中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/verify-identity`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Googleでの登録中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocument(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-pink-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">新規会員登録</CardTitle>
            <CardDescription>
              アカウントを作成して、あなたにぴったりのサービスを見つけましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-gray-300"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20484C17.64 8.56741 17.5827 7.95404 17.4764 7.36444H9V10.8454H13.8436C13.635 11.9701 13.0009 12.9225 12.0477 13.5614V15.8201H14.9564C16.6582 14.2528 17.64 11.9462 17.64 9.20484Z" fill="#4285F4"/>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8201L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0427C2.43818 15.9828 5.48182 18 9 18Z" fill="#34A853"/>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59319 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95737H0.957273C0.347727 6.17319 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0427L3.96409 10.71Z" fill="#FBBC05"/>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01723 0.957275 4.95737L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
                Googleで登録
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-gray-300 bg-[#06C755] text-white hover:bg-[#06C755]/90"
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18 7.7543C18 3.4748 13.9706 0 9 0C4.02944 0 0 3.4748 0 7.7543C0 11.6116 3.33687 14.8264 7.7625 15.5193C8.0886 15.5993 8.55 15.7619 8.66497 16.0335C8.76825 16.2819 8.73487 16.6699 8.7021 16.9183L8.60025 17.6378C8.56597 17.9265 8.40113 18.9058 9 18.5412C9.59887 18.1759 13.0223 15.957 14.6353 14.031C15.6661 12.8189 16.2 11.3583 16.2 9.83115H18V7.7543Z" fill="white"/>
                  <path d="M6.35389 10.6237H3.84889C3.65597 10.6237 3.5 10.4679 3.5 10.2751V6.05314C3.5 5.86042 3.65597 5.70455 3.84889 5.70455H6.35389C6.54681 5.70455 6.70278 5.86042 6.70278 6.05314V10.2751C6.70278 10.4679 6.54681 10.6237 6.35389 10.6237Z" fill="#06C755"/>
                  <path d="M14.1514 10.6237H11.6464C11.4535 10.6237 11.2975 10.4679 11.2975 10.2751V6.05314C11.2975 5.86042 11.4535 5.70455 11.6464 5.70455H14.1514C14.3443 5.70455 14.5003 5.86042 14.5003 6.05314V10.2751C14.5003 10.4679 14.3443 10.6237 14.1514 10.6237Z" fill="#06C755"/>
                  <path d="M10.2526 10.6237H7.74761C7.55469 10.6237 7.39872 10.4679 7.39872 10.2751V6.05314C7.39872 5.86042 7.55469 5.70455 7.74761 5.70455H10.2526C10.4455 5.70455 10.6015 5.86042 10.6015 6.05314V10.2751C10.6015 10.4679 10.4455 10.6237 10.2526 10.6237Z" fill="#06C755"/>
                </svg>
                LINEで登録
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">または</span>
              </div>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">お名前</Label>
                <Input
                  id="name"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* 身分証アップロード部分 */}
              <div className="space-y-2">
                <Label htmlFor="id-document">身分証明書のアップロード</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {idPreview ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={idPreview} 
                            alt="ID Preview" 
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                            <UploadCloud className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">身分証明書をアップロード</p>
                          <p className="text-xs text-gray-500 mt-1">（運転免許証・マイナンバーカード・パスポートなど）</p>
                        </div>
                      )}
                      <input 
                        id="id-document" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleIdUpload}
                        required
                        name="id-document"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    本人確認のため、有効な身分証明書のアップロードが必要です。登録後の確認作業に使用され、厳重に管理されます。
                  </p>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "処理中..." : "登録する"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              すでにアカウントをお持ちの方は
              <Link to="/login" className="text-primary hover:underline ml-1">
                ログイン
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              登録すると、<Link to="/terms" className="text-primary hover:underline">利用規約</Link>および<Link to="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>に同意したことになります。
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Signup;
