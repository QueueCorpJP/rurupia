
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight, Check, Star, Search, Calendar, Sliders, Heart, Shield, MapPin, Phone, MessageCircle } from 'lucide-react';
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

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-pink-50 relative">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">選ばれる理由</h2>
            <p className="text-muted-foreground text-lg">
              お客様に安心して施術を受けていただくために、私たちが大切にしていること
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-pink-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">信頼できるセラピスト</h3>
              <p className="text-muted-foreground">
                すべてのセラピストは厳格な審査と専門トレーニングを受けており、高品質な施術をお約束します。
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-pink-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">簡単予約システム</h3>
              <p className="text-muted-foreground">
                希望の日時やセラピストを簡単に選択でき、数クリックで予約が完了します。変更やキャンセルも安心です。
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-pink-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">安心のサポート</h3>
              <p className="text-muted-foreground">
                カスタマーサポートが24時間体制であなたの不安や質問にお答えします。初めての方も安心してご利用いただけます。
              </p>
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
              <div key={therapist.id} className="group">
                <div className="relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="absolute right-4 top-4 z-10">
                    <button className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:text-pink-500 transition-colors">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={therapist.imageUrl} 
                      alt={therapist.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-xl">{therapist.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium">{therapist.rating}</span>
                        <span className="text-sm text-muted-foreground">({therapist.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="mr-1 h-4 w-4 text-primary" />
                      {therapist.location}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {therapist.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{therapist.description}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-pink-100">
                      <div className="text-sm font-medium">
                        <span className="text-lg font-bold text-foreground">${therapist.price}</span>
                        <span className="text-muted-foreground"> / 時間</span>
                      </div>
                      <Link to={`/therapists/${therapist.id}`}>
                        <Button variant="outline" size="sm" className="rounded-full px-4 border-pink-200">
                          詳細を見る
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-white relative">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">お客様の声</h2>
            <p className="text-muted-foreground text-lg">
              実際にサービスを利用されたお客様からいただいた貴重なフィードバック
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "田中 美香",
                avatar: "T",
                review: "長年の肩こりに悩んでいましたが、プロの施術で驚くほど楽になりました。定期的に通うようになって体調も良くなりました。",
                rating: 5
              },
              {
                name: "佐藤 健太",
                avatar: "S",
                review: "仕事のストレスでなかなか眠れない日が続いていました。施術後は心地よい疲れで深い睡眠ができるようになりました。",
                rating: 5
              },
              {
                name: "山田 優子",
                avatar: "Y",
                review: "スポーツで疲れた体をケアしてもらいました。体の状態をしっかり理解して施術してくれるので、パフォーマンスも向上しています。",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-pink-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">ご利用の流れ</h2>
            <p className="text-muted-foreground text-lg">
              簡単3ステップでリラクゼーションタイムをお楽しみいただけます
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-6 z-10">
                1
              </div>
              {/* Connector line */}
              <div className="absolute top-8 left-1/2 w-full h-0.5 bg-primary/20 hidden md:block"></div>
              <h3 className="text-xl font-bold mb-3">セラピストを探す</h3>
              <p className="text-muted-foreground">
                お好みの条件でセラピストを検索。プロフィールや口コミを参考に、あなたにぴったりのセラピストを見つけましょう。
              </p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-6 z-10">
                2
              </div>
              {/* Connector line */}
              <div className="absolute top-8 left-1/2 w-full h-0.5 bg-primary/20 hidden md:block"></div>
              <h3 className="text-xl font-bold mb-3">予約を確定</h3>
              <p className="text-muted-foreground">
                希望の日時を選び、予約を確定。事前に施術内容やご要望をセラピストに伝えることも可能です。
              </p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-6 z-10">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">施術を受ける</h3>
              <p className="text-muted-foreground">
                当日は予約時間に施術を受けるだけ。プロの技術で心身ともにリラックスした時間をお過ごしください。
              </p>
            </div>
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
