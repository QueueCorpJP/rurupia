
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  ArrowRight, 
  Check, 
  Shield, 
  Calendar, 
  Search, 
  Sliders, 
  User, 
  UserCircle, 
  Store, 
  Briefcase,
  MapPin,
  Clock,
} from 'lucide-react';
import TherapistCard from '../components/TherapistCard';
import { therapists } from '../utils/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  // Show only featured therapists on the landing page
  const featuredTherapists = therapists
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <Layout>
      {/* Enhanced Search Section with Registration Options */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/lovable-uploads/9b8e3f3a-bf22-4ecc-9f1e-d46c7b403a4a.png')] bg-cover bg-center opacity-5"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            {/* Search Column */}
            <div className="flex flex-col space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
                  心と体に優しい<br className="hidden sm:inline" />癒しのひととき
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] mx-auto lg:mx-0">
                  プロフェッショナルな男性セラピストによる、あなただけのリラックスタイムをお届けします
                </p>
              </div>
              
              <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
                <h2 className="text-2xl font-bold mb-6 text-center">あなたにぴったりのセラピストを見つける</h2>
                
                {/* Search Tabs */}
                <Tabs defaultValue="keyword" className="mb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="keyword">キーワード検索</TabsTrigger>
                    <TabsTrigger value="guided">質問形式で探す</TabsTrigger>
                  </TabsList>
                  <TabsContent value="keyword" className="space-y-4 pt-4">
                    <div className="relative">
                      <div className="flex items-center bg-white rounded-full border border-pink-100 shadow-sm overflow-hidden">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                          <Input 
                            type="text" 
                            placeholder="セラピスト名、得意分野で検索" 
                            className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-12 text-base rounded-full" 
                          />
                        </div>
                        <Button size="lg" className="rounded-l-none h-12 px-6 rounded-r-full">
                          検索
                        </Button>
                      </div>
                    </div>

                    {/* Quick Filter Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-pink-100 bg-white">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-muted-foreground text-sm">サービス希望日</span>
                        <input type="date" className="ml-auto border-0 bg-transparent text-sm" />
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-pink-100 bg-white">
                        <MapPin className="h-5 w-5 text-primary" />
                        <select className="border-0 bg-transparent text-sm w-full">
                          <option>エリアを選択</option>
                          <option>東京</option>
                          <option>大阪</option>
                          <option>名古屋</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-pink-100 bg-white">
                        <Sliders className="h-5 w-5 text-primary" />
                        <span className="text-muted-foreground text-sm">フィルター</span>
                        <select className="ml-auto border-0 bg-transparent text-sm">
                          <option>並び替え</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-center pt-2">
                      <Link to="/therapists">
                        <Button size="lg" className="font-medium text-base rounded-full px-8 shadow-md hover:shadow-lg transition-shadow btn-hover-slide">
                          すべてのセラピストを表示
                          <ArrowRight className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="guided" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">どのようなケアをお求めですか？</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <Button variant="outline" className="justify-start border-pink-100">リラクゼーション</Button>
                          <Button variant="outline" className="justify-start border-pink-100">美容</Button>
                          <Button variant="outline" className="justify-start border-pink-100">筋肉疲労</Button>
                          <Button variant="outline" className="justify-start border-pink-100">ストレス軽減</Button>
                          <Button variant="outline" className="justify-start border-pink-100">姿勢改善</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">ご希望の予算はいくらですか？</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <Button variant="outline" className="justify-start border-pink-100">～7,000円</Button>
                          <Button variant="outline" className="justify-start border-pink-100">～10,000円</Button>
                          <Button variant="outline" className="justify-start border-pink-100">10,000円～</Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-center pt-2">
                        <Button size="lg" className="font-medium text-base rounded-full px-8 shadow-md hover:shadow-lg transition-shadow btn-hover-slide">
                          セラピストを探す
                          <ArrowRight className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">安心の身元確認</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">簡単予約システム</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">24時間対応</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Registration/Login Column */}
            <div className="flex flex-col space-y-6">
              <Tabs defaultValue="user" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="user" className="flex items-center gap-1">
                    <UserCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">ユーザー</span>
                  </TabsTrigger>
                  <TabsTrigger value="therapist" className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">セラピスト</span>
                  </TabsTrigger>
                  <TabsTrigger value="store" className="flex items-center gap-1">
                    <Store className="h-4 w-4" />
                    <span className="hidden sm:inline">店舗</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* User Registration/Login */}
                <TabsContent value="user" className="space-y-4 pt-4">
                  <Card className="border-pink-100">
                    <CardHeader className="text-center">
                      <CardTitle>会員登録・ログイン</CardTitle>
                      <CardDescription>
                        アカウントを作成して、あなたにぴったりのサービスをお楽しみください
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-gray-300">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.20484C17.64 8.56741 17.5827 7.95404 17.4764 7.36444H9V10.8454H13.8436C13.635 11.9701 13.0009 12.9225 12.0477 13.5614V15.8201H14.9564C16.6582 14.2528 17.64 11.9462 17.64 9.20484Z" fill="#4285F4"/>
                            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8201L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0427C2.43818 15.9828 5.48182 18 9 18Z" fill="#34A853"/>
                            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59319 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95737H0.957273C0.347727 6.17319 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0427L3.96409 10.71Z" fill="#FBBC05"/>
                            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01723 0.957275 4.95737L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                          </svg>
                          Googleでログイン
                        </Button>
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-gray-300 bg-[#06C755] text-white hover:bg-[#06C755]/90">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18 7.7543C18 3.4748 13.9706 0 9 0C4.02944 0 0 3.4748 0 7.7543C0 11.6116 3.33687 14.8264 7.7625 15.5193C8.0886 15.5993 8.55 15.7619 8.66497 16.0335C8.76825 16.2819 8.73487 16.6699 8.7021 16.9183L8.60025 17.6378C8.56597 17.9265 8.40113 18.9058 9 18.5412C9.59887 18.1759 13.0223 15.957 14.6353 14.031C15.6661 12.8189 16.2 11.3583 16.2 9.83115H18V7.7543Z" fill="white"/>
                            <path d="M6.35389 10.6237H3.84889C3.65597 10.6237 3.5 10.4679 3.5 10.2751V6.05314C3.5 5.86042 3.65597 5.70455 3.84889 5.70455H6.35389C6.54681 5.70455 6.70278 5.86042 6.70278 6.05314V10.2751C6.70278 10.4679 6.54681 10.6237 6.35389 10.6237Z" fill="#06C755"/>
                            <path d="M14.1514 10.6237H11.6464C11.4535 10.6237 11.2975 10.4679 11.2975 10.2751V6.05314C11.2975 5.86042 11.4535 5.70455 11.6464 5.70455H14.1514C14.3443 5.70455 14.5003 5.86042 14.5003 6.05314V10.2751C14.5003 10.4679 14.3443 10.6237 14.1514 10.6237Z" fill="#06C755"/>
                            <path d="M10.2526 10.6237H7.74761C7.55469 10.6237 7.39872 10.4679 7.39872 10.2751V6.05314C7.39872 5.86042 7.55469 5.70455 7.74761 5.70455H10.2526C10.4455 5.70455 10.6015 5.86042 10.6015 6.05314V10.2751C10.6015 10.4679 10.4455 10.6237 10.2526 10.6237Z" fill="#06C755"/>
                          </svg>
                          LINEでログイン
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
                      
                      <div className="grid gap-2">
                        <Link to="/login">
                          <Button className="w-full">ログイン</Button>
                        </Link>
                        <Link to="/signup">
                          <Button variant="outline" className="w-full border-pink-200">新規会員登録</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Therapist Registration/Login */}
                <TabsContent value="therapist" className="space-y-4 pt-4">
                  <Card className="border-pink-100">
                    <CardHeader className="text-center">
                      <CardTitle>セラピスト登録・ログイン</CardTitle>
                      <CardDescription>
                        セラピストとして登録して、あなたのスキルを活かしましょう
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Link to="/therapist/login">
                          <Button className="w-full">ログイン</Button>
                        </Link>
                        <Link to="/therapist/signup">
                          <Button variant="outline" className="w-full border-pink-200">セラピスト登録</Button>
                        </Link>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        <p>セラピストとして登録すると、お客様から直接予約を受け付けることができます。</p>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 py-2 px-6 text-center text-xs text-muted-foreground rounded-b-lg">
                      <p>登録には審査があります。詳しくは<Link to="/therapist/info" className="text-primary hover:underline">こちら</Link></p>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Store Registration/Login */}
                <TabsContent value="store" className="space-y-4 pt-4">
                  <Card className="border-pink-100">
                    <CardHeader className="text-center">
                      <CardTitle>店舗登録・ログイン</CardTitle>
                      <CardDescription>
                        あなたの店舗を登録して、より多くのお客様に届けましょう
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Link to="/store/login">
                          <Button className="w-full">ログイン</Button>
                        </Link>
                        <Link to="/store/signup">
                          <Button variant="outline" className="w-full border-pink-200">店舗登録</Button>
                        </Link>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        <p>店舗として登録すると、複数のセラピストを管理できるようになります。</p>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 py-2 px-6 text-center text-xs text-muted-foreground rounded-b-lg">
                      <p>登録には審査があります。詳しくは<Link to="/store/info" className="text-primary hover:underline">こちら</Link></p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="relative bg-gradient-to-r from-pink-100 to-rose-50 rounded-2xl p-6 shadow-lg border border-pink-100">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">初めての方へ</h3>
                  <p className="text-muted-foreground mb-4">サービスの仕組みや安全への取り組みについてご案内します</p>
                  <Link to="/about">
                    <Button variant="outline" className="font-medium rounded-full px-6 border-pink-200">
                      サービスについて詳しく見る
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Therapists Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">人気のセラピスト</h2>
              <p className="text-muted-foreground">お客様からの評価が高いセラピストをご紹介します</p>
            </div>
            <Link to="/therapists" className="text-primary font-medium flex items-center hover:underline mt-4 md:mt-0">
              すべて見る <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTherapists.map((therapist) => (
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-rose-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/9b8e3f3a-bf22-4ecc-9f1e-d46c7b403a4a.png')] bg-cover bg-center"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">今すぐ始めましょう</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-white/90">
            あなたに合ったセラピストを見つけて、心と体のリラックスタイムを体験してください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/therapists">
              <Button size="lg" variant="secondary" className="font-medium text-lg rounded-full px-8 shadow-md hover:shadow-lg transition-shadow">
                セラピストを探す
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 font-medium text-lg rounded-full px-8">
                会員登録
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
