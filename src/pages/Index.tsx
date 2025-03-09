
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight, Check, Shield, Calendar } from 'lucide-react';
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
      {/* Hero Section with Soft Gradient Background */}
      <section className="relative bg-gradient-to-br from-pink-50 to-white py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/lovable-uploads/9b8e3f3a-bf22-4ecc-9f1e-d46c7b403a4a.png')] bg-cover bg-center opacity-5"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_500px] lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
                  心と体に優しい<br className="hidden sm:inline" />癒しのひとときを
                </h1>
                <p className="text-xl text-muted-foreground md:text-2xl max-w-[600px] leading-relaxed">
                  プロフェッショナルな男性セラピストによる、あなただけのリラックスタイムをお届けします
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/therapists">
                  <Button size="lg" className="font-medium text-base rounded-full px-8 shadow-md hover:shadow-lg transition-shadow btn-hover-slide">
                    セラピストを探す
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="font-medium text-base rounded-full px-8 border-pink-200">
                    サービスについて
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
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
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">24時間対応</span>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-lg border-4 border-white">
                <img
                  alt="Professional Massage Therapy"
                  className="object-cover w-full h-full"
                  src="/lovable-uploads/1649972904349-6e44c42644a7.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white relative">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">あなたにぴったりのセラピストを見つける</h2>
              <p className="text-muted-foreground mt-2">希望の条件に合わせてお探しいただけます</p>
            </div>
            
            {/* Search Tabs */}
            <div className="flex flex-col md:flex-row mb-8 gap-4">
              <div className="flex-1 rounded-full bg-secondary p-1 flex">
                <button className="flex-1 rounded-full bg-white py-2.5 font-medium shadow-sm">
                  キーワード検索
                </button>
                <button className="flex-1 rounded-full text-muted-foreground py-2.5 font-medium">
                  質問形式で探す
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
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
            
            {/* Filter Options */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-xl border border-pink-100 bg-white">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">サービス希望日</span>
                <input type="date" className="ml-auto border-0 bg-transparent text-sm" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-pink-100 bg-white">
                <div className="text-muted-foreground text-sm flex-1">予算検索</div>
                <select className="ml-auto border-0 bg-transparent text-sm">
                  <option>最小料金</option>
                </select>
                <span className="text-muted-foreground">〜</span>
                <select className="border-0 bg-transparent text-sm">
                  <option>最大料金</option>
                </select>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-pink-100 bg-white">
                <Sliders className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">フィルター</span>
                <select className="ml-auto border-0 bg-transparent text-sm">
                  <option>並び替え</option>
                </select>
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
