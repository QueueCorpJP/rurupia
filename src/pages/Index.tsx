import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  ArrowRight, 
  Check, 
  Shield, 
  Calendar, 
  Search, 
  Sliders, 
  MapPin,
  Clock,
  ArrowLeft,
  HelpCircle,
  CalendarIcon,
} from 'lucide-react';
import TherapistCard from '../components/TherapistCard';
import { therapists } from '../utils/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/DateTimePicker';

const Index = () => {
  const navigate = useNavigate();

  // Handle 404 redirects from sessionStorage
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath) {
      sessionStorage.removeItem('redirect_path');
      
      // Check if the path is one of our valid routes and navigate to it
      const validRoutes = [
        '/signup', 
        '/login', 
        '/therapist-signup', 
        '/therapist-login',
        '/store-signup',
        '/store-login',
        '/therapists',
        '/blog',
        '/contact',
        '/faq',
        '/terms',
        '/privacy'
      ];
      
      if (validRoutes.includes(redirectPath)) {
        navigate(redirectPath);
      }
    }
  }, [navigate]);

  // Show only featured therapists on the landing page
  const featuredTherapists = therapists
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Keyword search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [keywordFilters, setKeywordFilters] = useState({
    area: '',
    budget: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("指定なし");

  // State for multi-step questionnaire
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    mood: '',
    therapistType: '',
    treatmentType: '',
    therapistAge: '',
    location: '',
    budget: ''
  });

  // Handle answer selection
  const handleAnswerSelect = (question: keyof typeof answers, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  // Move to next question
  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  // Move to previous question
  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    // Here you would typically navigate to the search results page with the filters
    console.log('Search with:', answers);
    // For now, we'll just reset the form
    setStep(1);
  };

  // Handle keyword search
  const handleKeywordSearch = () => {
    console.log('Searching for:', {
      keyword: searchTerm,
      ...keywordFilters,
      date: selectedDate ? selectedDate.toISOString() : undefined,
      timeSlot: selectedTimeSlot
    });
    // Navigate to search results with params
  };

  // Handle keyword filter change
  const handleFilterChange = (filterType: keyof typeof keywordFilters, value: string) => {
    setKeywordFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear date selection
  const clearDateSelection = () => {
    setSelectedDate(undefined);
    setSelectedTimeSlot("指定なし");
  };

  // Question components
  const renderQuestionStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">1. 今日はどんな気分ですか？</h2>
            <RadioGroup 
              value={answers.mood} 
              onValueChange={(value) => handleAnswerSelect('mood', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="relax" id="mood-1" />
                <label htmlFor="mood-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① リラックスしたい</span>
                  <span className="ml-2">☁️</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="stress" id="mood-2" />
                <label htmlFor="mood-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② ストレスを発散したい</span>
                  <span className="ml-2">💥</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="heal" id="mood-3" />
                <label htmlFor="mood-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 癒されたい</span>
                  <span className="ml-2">💗</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="talk" id="mood-4" />
                <label htmlFor="mood-4" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">④ しっかり会話を楽しみたい</span>
                  <span className="ml-2">🗣️</span>
                </label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!answers.mood} className="px-8 rounded-full">
                次へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">2. どんな雰囲気のセラピストが理想ですか？</h2>
            <RadioGroup 
              value={answers.therapistType} 
              onValueChange={(value) => handleAnswerSelect('therapistType', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="mature" id="type-1" />
                <label htmlFor="type-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① 落ち着いた・大人っぽい</span>
                  <span className="ml-2">🎩</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="bright" id="type-2" />
                <label htmlFor="type-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② 明るくて話しやすい</span>
                  <span className="ml-2">😄</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="inclusive" id="type-3" />
                <label htmlFor="type-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 包容力がある</span>
                  <span className="ml-2">🌿</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="cool" id="type-4" />
                <label htmlFor="type-4" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">④ クールで控えめ</span>
                  <span className="ml-2">❄️</span>
                </label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline" className="px-8 rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={handleNext} disabled={!answers.therapistType} className="px-8 rounded-full">
                次へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">3. どんなプレイを受けたいですか？</h2>
            <RadioGroup 
              value={answers.treatmentType} 
              onValueChange={(value) => handleAnswerSelect('treatmentType', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="gentle" id="treatment-1" />
                <label htmlFor="treatment-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① ゆっくり丁寧なプレイ</span>
                  <span className="ml-2">🦊</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="strong" id="treatment-2" />
                <label htmlFor="treatment-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② しっかり強めのプレイ</span>
                  <span className="ml-2">💪</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="technique" id="treatment-3" />
                <label htmlFor="treatment-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ ハンドテクニックメイン</span>
                  <span className="ml-2">✋</span>
                </label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline" className="px-8 rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={handleNext} disabled={!answers.treatmentType} className="px-8 rounded-full">
                次へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">4. セラピストの年齢に希望はありますか？</h2>
            <RadioGroup 
              value={answers.therapistAge} 
              onValueChange={(value) => handleAnswerSelect('therapistAge', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="early20s" id="age-1" />
                <label htmlFor="age-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① 20代前半</span>
                  <span className="ml-2">👧</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="late20s" id="age-2" />
                <label htmlFor="age-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② 20代後半</span>
                  <span className="ml-2">👱</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="30plus" id="age-3" />
                <label htmlFor="age-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 30代以上</span>
                  <span className="ml-2">👨</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="noPreference" id="age-4" />
                <label htmlFor="age-4" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">④ 特にない</span>
                  <span className="ml-2">🙈</span>
                </label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline" className="px-8 rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={handleNext} disabled={!answers.therapistAge} className="px-8 rounded-full">
                次へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">5. 希望エリアは？</h2>
            <div className="rounded-lg border p-4">
              <Input 
                placeholder="都道府県" 
                value={answers.location}
                onChange={(e) => handleAnswerSelect('location', e.target.value)}
                className="text-lg p-4 h-14"
              />
            </div>
            
            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline" className="px-8 rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={handleNext} disabled={!answers.location} className="px-8 rounded-full">
                次へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">6. 予算の希望は？</h2>
            <RadioGroup 
              value={answers.budget} 
              onValueChange={(value) => handleAnswerSelect('budget', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="under5000" id="budget-1" />
                <label htmlFor="budget-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① ～5,000円</span>
                  <span className="ml-2">💰</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="5000to10000" id="budget-2" />
                <label htmlFor="budget-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② 5,000円～10,000円</span>
                  <span className="ml-2">💵</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="10000to20000" id="budget-3" />
                <label htmlFor="budget-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 10,000円～20,000円</span>
                  <span className="ml-2">💎</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="noPreference" id="budget-4" />
                <label htmlFor="budget-4" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">④ 特にない</span>
                  <span className="ml-2">🙈</span>
                </label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline" className="px-8 rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                戻る
              </Button>
              <Button onClick={handleSearchSubmit} className="px-8 rounded-full">
                結果を見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Enhanced Search Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/lovable-uploads/9b8e3f3a-bf22-4ecc-9f1e-d46c7b403a4a.png')] bg-cover bg-center opacity-5"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col space-y-8 mx-auto max-w-3xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
                心と体に優しい<br className="hidden sm:inline" />癒しのひととき
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
                プロフェッショナルな男性セラピストによる、あなただけのリラックスタイムをお届けします
              </p>
            </div>
            
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
              <h2 className="text-2xl font-bold mb-6 text-center">あなたにぴったりのセラピストを見つける</h2>
              
              <Tabs defaultValue="keyword" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="keyword" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    キーワード検索
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    質問に答えて検索
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="keyword" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="セラピスト名・得意分野など"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleKeywordSearch}>
                        <Search className="h-4 w-4 mr-2" />
                        検索
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                        className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Sliders className="h-3 w-3" />
                        詳細検索 {showAdvancedSearch ? '閉じる' : '開く'}
                      </button>
                    </div>
                    
                    {showAdvancedSearch && (
                      <div className="pt-2 pb-1 border-t space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium flex items-center mb-1.5">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              エリア
                            </label>
                            <Select 
                              value={keywordFilters.area} 
                              onValueChange={(value) => handleFilterChange('area', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tokyo">東京</SelectItem>
                                <SelectItem value="osaka">大阪</SelectItem>
                                <SelectItem value="kyoto">京都</SelectItem>
                                <SelectItem value="yokohama">横浜</SelectItem>
                                <SelectItem value="sapporo">札幌</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium flex items-center mb-1.5">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              予算
                            </label>
                            <Select 
                              value={keywordFilters.budget} 
                              onValueChange={(value) => handleFilterChange('budget', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under5000">～5,000円</SelectItem>
                                <SelectItem value="5000to10000">5,000円～10,000円</SelectItem>
                                <SelectItem value="10000to20000">10,000円～20,000円</SelectItem>
                                <SelectItem value="over20000">20,000円以上</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium flex items-center mb-1.5">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            日時指定
                          </label>
                          <div className="relative">
                            <DateTimePicker
                              date={selectedDate}
                              setDate={setSelectedDate}
                              timeSlot={selectedTimeSlot}
                              setTimeSlot={setSelectedTimeSlot}
                            />
                            {selectedDate && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute right-2 top-2"
                                onClick={clearDateSelection}
                              >
                                クリア
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="questions" className="mt-0">
                  {/* Step-by-step questionnaire */}
                  <div className="transition-all duration-300 ease-in-out">
                    {renderQuestionStep()}
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
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
