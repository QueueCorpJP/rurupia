
import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const TherapistSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    experience: "",
    certifications: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Therapist signup submitted:", formData);
    // Signup logic would go here
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
                <Button type="submit" className="w-full">登録する</Button>
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
