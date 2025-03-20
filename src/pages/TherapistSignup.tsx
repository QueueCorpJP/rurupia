import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TherapistSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    experience: "",
    certifications: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // 1. Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'therapist'
          }
        }
      });
      
      if (authError) {
        toast.error(authError.message);
        return;
      }
      
      if (!authData.user) {
        toast.error("ユーザーの登録に失敗しました");
        return;
      }
      
      // Create or update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          user_type: 'therapist'
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
        
      if (profileError) {
        console.error("Error creating/updating profile:", profileError);
        // Continue with therapist creation even if profile update fails
      }
      
      // 2. Create the therapist profile
      const { error: therapistError } = await supabase
        .from('therapists')
        .insert({
          id: authData.user.id,
          name: formData.name,
          description: `経験年数: ${formData.experience}年`,
          long_description: formData.experience,
          qualifications: formData.certifications.split(',').map(cert => cert.trim()),
          specialties: [],
          location: "東京",
          price: 5000,
          experience: parseInt(formData.experience) || 0
        });
        
      if (therapistError) {
        console.error("Error creating therapist profile:", therapistError);
        toast.error("セラピストプロフィールの作成に失敗しました");
        return;
      }
      
      toast.success("登録が完了しました。確認のためメールをご確認ください。");
      navigate("/therapist-login");
      
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("登録中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <Card className="border-pink-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">セラピスト登録</CardTitle>
            <CardDescription>
              セラピストとして登録して、あなたのスキルを多くのお客様に届けましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">基本情報</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="山田 太郎"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="090-1234-5678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">資格・経験</h3>
                <div className="space-y-2">
                  <Label htmlFor="experience">経験年数・経歴</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="これまでの経験について記入してください"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">保有資格</Label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    placeholder="保有している資格について記入してください"
                    value={formData.certifications}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>セラピスト登録には審査があります。審査完了までに数日かかる場合がございます。</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "処理中..." : "登録する"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              すでにアカウントをお持ちの方は
              <Link to="/therapist-login" className="text-primary hover:underline ml-1">
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

export default TherapistSignup;
