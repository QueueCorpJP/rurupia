
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight, Check, Star, Search, Calendar, Sliders, Heart } from 'lucide-react';
import TherapistCard from '../components/TherapistCard';
import { therapists } from '../utils/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Index = () => {
  // Show only featured therapists on the landing page
  const featuredTherapists = therapists
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <Layout>
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-pink-50 py-16 md:py-24">
        <div className="absolute inset-0 z-0 opacity-30 bg-[url('/lovable-uploads/9b8e3f3a-bf22-4ecc-9f1e-d46c7b403a4a.png')] bg-cover bg-center bg-no-repeat"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  心と体に優しい癒しのひとときを
                </h1>
                <p className="text-xl text-muted-foreground md:text-2xl max-w-[600px]">
                  プロフェッショナルな男性セラピストによる、あなただけのリラックスタイムをお届けします
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/therapists">
                  <Button size="lg" className="font-medium text-base">
                    セラピストを探す
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="font-medium text-base">
                    サービスについて
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">プロの技術</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">安心の予約</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">24時間対応</span>
                </div>
              </div>
            </div>
            <div className="relative hidden md:flex items-center justify-center">
              <div className="absolute w-full h-full bg-gradient-to-br from-blue-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                <img
                  alt="Professional Massage"
                  className="object-cover w-full h-full"
                  src="/lovable-uploads/aa718ccf-9aa6-41d9-907a-6d529d259192.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-10 bg-white">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            {/* Search Tabs */}
            <div className="flex flex-col md:flex-row mb-8 gap-4">
              <div className="flex-1 rounded-full bg-gray-100 p-1 flex">
                <button className="flex-1 rounded-full bg-white py-2.5 font-medium shadow-sm">
                  キーワード検索
                </button>
                <button className="flex-1 rounded-full text-gray-600 py-2.5 font-medium">
                  質問形式で探す
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center bg-white rounded-full border shadow-sm overflow-hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    type="text" 
                    placeholder="セラピスト名、得意分野で検索" 
                    className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-12 text-base" 
                  />
                </div>
                <Button size="lg" className="rounded-l-none h-12 px-6">
                  検索
                </Button>
              </div>
            </div>
            
            {/* Filter Options */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-white">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600 text-sm">サービス希望日</span>
                <input type="date" className="ml-auto border-0 bg-transparent text-sm" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-white">
                <div className="text-gray-600 text-sm flex-1">予算検索</div>
                <select className="ml-auto border-0 bg-transparent text-sm">
                  <option>最小料金</option>
                </select>
                <span className="text-gray-400">〜</span>
                <select className="border-0 bg-transparent text-sm">
                  <option>最大料金</option>
                </select>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-white">
                <Sliders className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600 text-sm">フィルター</span>
                <select className="ml-auto border-0 bg-transparent text-sm">
                  <option>並び替え</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-2">選ばれる理由</h2>
            <p className="text-muted-foreground text-lg">
              お客様に安心して施術を受けていただくために、私たちが大切にしていること
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">信頼できるセラピスト</h3>
              <p className="text-muted-foreground">
                すべてのセラピストは厳格な審査と専門トレーニングを受けており、高品質な施術をお約束します。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">簡単予約システム</h3>
              <p className="text-muted-foreground">
                希望の日時やセラピストを簡単に選択でき、数クリックで予約が完了します。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">柔軟なスケジュール</h3>
              <p className="text-muted-foreground">
                24時間対応のセラピストも多数在籍しており、お客様のライフスタイルに合わせた予約が可能です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Therapists Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter mb-2">人気のセラピスト</h2>
              <p className="text-muted-foreground">お客様からの評価が高いセラピストをご紹介します</p>
            </div>
            <Link to="/therapists" className="text-primary font-medium flex items-center hover:underline">
              すべて見る <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTherapists.map((therapist) => (
              <div key={therapist.id} className="group relative">
                <div className="absolute right-4 top-4 z-10">
                  <button className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-pink-500" />
                  </button>
                </div>
                <TherapistCard key={therapist.id} therapist={therapist} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-2">お客様の声</h2>
            <p className="text-muted-foreground text-lg">
              実際にサービスを利用されたお客様からいただいた貴重なフィードバック
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "田中 美香",
                review: "長年の肩こりに悩んでいましたが、プロの施術で驚くほど楽になりました。定期的に通うようになって体調も良くなりました。",
                rating: 5
              },
              {
                name: "佐藤 健太",
                review: "仕事のストレスでなかなか眠れない日が続いていました。施術後は心地よい疲れで深い睡眠ができるようになりました。",
                rating: 5
              },
              {
                name: "山田 優子",
                review: "スポーツで疲れた体をケアしてもらいました。体の状態をしっかり理解して施術してくれるので、パフォーマンスも向上しています。",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.review}"</p>
                <p className="font-medium">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">今すぐ始めましょう</h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-6">
            あなたに合ったセラピストを見つけて、心と体のリラックスタイムを体験してください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/therapists">
              <Button size="lg" variant="secondary" className="font-medium text-base">
                セラピストを探す
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 font-medium text-base">
                会員登録
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer is handled by the Layout component */}
    </Layout>
  );
};

export default Index;
