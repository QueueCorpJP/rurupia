
import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const StoreLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Store login submitted:", { email, password });
    // Login logic would go here
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="border-pink-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">店舗ログイン</CardTitle>
            <CardDescription>
              店舗アカウントにログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    ログイン状態を保持
                  </Label>
                </div>
                <Link to="/store-forgot-password" className="text-sm text-primary hover:underline">
                  パスワードをお忘れの方
                </Link>
              </div>
              <Button type="submit" className="w-full">ログイン</Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-muted-foreground">
              アカウントをお持ちでない方は
              <Link to="/store-signup" className="text-primary hover:underline ml-1">
                店舗登録
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default StoreLogin;
