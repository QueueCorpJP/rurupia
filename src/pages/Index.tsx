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
  Loader2,
  Sparkles,
  ArrowUpRight,
  Heart,
  MessageSquare
} from 'lucide-react';
import TherapistCard from '../components/TherapistCard';
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
import { supabase } from '@/integrations/supabase/client';
import { Therapist } from '@/utils/types';
import { toast } from 'sonner';
import MBTISelect, { mbtiTypes } from '@/components/MBTISelect';
import PrefectureSelect, { japanesePrefectures } from '@/components/PrefectureSelect';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [featuredTherapists, setFeaturedTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .order('rating', { ascending: false })
          .limit(3);
        
        if (error) {
          console.error("Error fetching therapists:", error);
          toast.error("セラピスト情報の取得に失敗しました");
          return;
        }
        
        const mappedTherapists = (data || []).map((therapist: any) => ({
          id: therapist.id,
          name: therapist.name || "名前なし",
          imageUrl: therapist.image_url || "",
          description: therapist.description || "詳細情報はありません",
          location: therapist.location || "場所未設定",
          price: therapist.price || 0,
          rating: therapist.rating || 0,
          reviews: therapist.reviews || 0,
          workingDays: therapist.working_days || [],
          workingHours: therapist.working_hours || null,
          availability: therapist.availability || [],
          qualifications: therapist.qualifications || [],
          specialties: therapist.specialties || [],
          services: [] // Services will be loaded in the detail view
        }));
        
        setFeaturedTherapists(mappedTherapists);
      } catch (error) {
        console.error("Error in fetchTherapists:", error);
        toast.error("エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath) {
      sessionStorage.removeItem('redirect_path');
      
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

  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [keywordFilters, setKeywordFilters] = useState({
    area: '',
    budget: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("指定なし");

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    mood: '',
    therapistType: '',
    treatmentType: '',
    therapistAge: '',
    location: '',
    budget: '',
    mbtiType: 'unknown'
  });

  const handleAnswerSelect = (question: keyof typeof answers, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrevious = () => setStep(prev => prev - 1);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    
    Object.entries(answers).forEach(([key, value]) => {
      if (value && value !== 'unknown') {
        params.append(key, value);
      }
    });
    
    if (answers.budget) {
      if (answers.budget === 'under5000') {
        params.set('minPrice', '0');
        params.set('maxPrice', '5000');
      } else if (answers.budget === '5000to10000') {
        params.set('minPrice', '5000');
        params.set('maxPrice', '10000');
      } else if (answers.budget === '10000to20000') {
        params.set('minPrice', '10000');
        params.set('maxPrice', '20000');
      } else if (answers.budget === 'over20000') {
        params.set('minPrice', '20000');
        params.set('maxPrice', '50000');
      }
    }
    
    navigate({
      pathname: '/therapists',
      search: params.toString()
    });
  };

  const handleKeywordSearch = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    if (keywordFilters.area) {
      params.append('location', keywordFilters.area);
    }
    
    if (keywordFilters.budget) {
      switch (keywordFilters.budget) {
        case 'under5000':
          params.append('minPrice', '0');
          params.append('maxPrice', '5000');
          break;
        case '5000to10000':
          params.append('minPrice', '5000');
          params.append('maxPrice', '10000');
          break;
        case '10000to20000':
          params.append('minPrice', '10000');
          params.append('maxPrice', '20000');
          break;
        case 'over20000':
          params.append('minPrice', '20000');
          params.append('maxPrice', '50000');
          break;
      }
    }
    
    if (selectedDate) {
      params.append('date', selectedDate.toISOString().split('T')[0]);
      
      if (selectedTimeSlot !== "指定なし") {
        params.append('timeSlot', selectedTimeSlot);
      }
    }
    
    navigate({
      pathname: '/therapists',
      search: params.toString()
    });
  };

  const handleFilterChange = (filterType: keyof typeof keywordFilters, value: string) => {
    setKeywordFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearDateSelection = () => {
    setSelectedDate(undefined);
    setSelectedTimeSlot("指定なし");
  };

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
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="relax" id="mood-1" />
                <label htmlFor="mood-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① リラックスしたい</span>
                  <span className="ml-2">☁️</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="stress" id="mood-2" />
                <label htmlFor="mood-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② ストレスを発散したい</span>
                  <span className="ml-2">💥</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="heal" id="mood-3" />
                <label htmlFor="mood-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 癒されたい</span>
                  <span className="ml-2">💗</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="talk" id="mood-4" />
                <label htmlFor="mood-4" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">④ しっかり会話を楽しみたい</span>
                  <span className="ml-2">🗣️</span>
                </label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!answers.mood} 
                className="px-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 transition-all"
              >
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
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="mature" id="type-1" />
                <label htmlFor="type-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① 落ち着いた・大人っぽい</span>
                  <span className="ml-2">🎩</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="bright" id="type-2" />
                <label htmlFor="type-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② 明るくて話しやすい</span>
                  <span className="ml-2">😄</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="inclusive" id="type-3" />
                <label htmlFor="type-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 包容力がある</span>
                  <span className="ml-2">🌿</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
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
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="gentle" id="treatment-1" />
                <label htmlFor="treatment-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① ゆっくり丁寧なプレイ</span>
                  <span className="ml-2">🦊</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="strong" id="treatment-2" />
                <label htmlFor="treatment-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② しっかり強めのプレイ</span>
                  <span className="ml-2">💪</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
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
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="early20s" id="age-1" />
                <label htmlFor="age-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① 20代前半</span>
                  <span className="ml-2">👧</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="late20s" id="age-2" />
                <label htmlFor="age-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② 20代後半</span>
                  <span className="ml-2">👱</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="30plus" id="age-3" />
                <label htmlFor="age-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 30代以上</span>
                  <span className="ml-2">👨</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
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
              <PrefectureSelect 
                value={answers.location}
                onValueChange={(value) => handleAnswerSelect('location', value)}
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
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="under5000" id="budget-1" />
                <label htmlFor="budget-1" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">① ～5,000円</span>
                  <span className="ml-2">💰</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="5000to10000" id="budget-2" />
                <label htmlFor="budget-2" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">② 5,000円～10,000円</span>
                  <span className="ml-2">💵</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
                <RadioGroupItem value="10000to20000" id="budget-3" />
                <label htmlFor="budget-3" className="flex items-center cursor-pointer w-full">
                  <span className="text-lg">③ 10,000円～20,000円</span>
                  <span className="ml-2">💎</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all">
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
              <Button onClick={handleNext} disabled={!answers.budget} className="px-8 rounded-full">
                次へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">7. MBTIタイプの希望は？</h2>
            <div className="rounded-lg border p-4">
              <MBTISelect 
                value={answers.mbtiType}
                onValueChange={(value) => handleAnswerSelect('mbtiType', value)}
                placeholder="MBTIタイプを選択してください"
              />
              <p className="text-sm text-muted-foreground mt-2">
                より良いマッチングのためにMBTI性格タイプを選択してください。
                好みがない場合は「わからない」を選択してください。
              </p>
            </div>
            
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/lovable-uploads/9b8e3f3a-bf22-4ecc-9f1e-d46c7b403a4a.png')] bg-cover bg-center opacity-10"></div>
        
        <div className="hidden md:block absolute top-20 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-pink-300/20 to-rose-300/20 animate-float"></div>
        <div className="hidden md:block absolute bottom-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-300/10 animate-float" style={{animationDelay: "1s"}}></div>
        <div className="hidden md:block absolute top-40 left-[20%] w-16 h-16 rounded-full bg-gradient-to-br from-pink-300/20 to-rose-300/20 animate-float" style={{animationDelay: "1.5s"}}></div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col space-y-8 mx-auto max-w-3xl">
            <div className="text-center">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-pink-500/10 to-rose-400/10 text-pink-600">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-pink-500" />
                  心と身体のメンテナンス
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">
                心と体に優しい<br className="hidden sm:inline" />癒しのひととき
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
                プロフェッショナルな男性セラピストによる、あなただけのリラックスタイムをお届けします
              </p>
            </div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-pink-100">
              <h2 className="text-2xl font-bold mb-6 text-center">あなたにぴったりのセラピストを見つける</h2>
              
              <Tabs defaultValue="keyword" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-pink-50/50 p-1">
                  <TabsTrigger value="keyword" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-pink-600">
                    <Search className="h-4 w-4" />
                    キーワード検索
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-pink-600">
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
                        className="flex-1 border-pink-100 focus:border-pink-300 shadow-sm"
                      />
                      <Button onClick={handleKeywordSearch} className="bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 transition-all">
                        <Search className="h-4 w-4 mr-2" />
                        検索
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                        className="text-sm text-muted-foreground flex items-center gap-1 hover:text-pink-500 transition-colors"
                      >
                        <Sliders className="h-3 w-3" />
                        詳細検索 {showAdvancedSearch ? '閉じる' : '開く'}
                      </button>
                    </div>
                    
                    {showAdvancedSearch && (
                      <div className="pt-3 pb-2 border-t space-y-4 border-pink-100/50 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium flex items-center mb-1.5 text-gray-700">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-pink-400" />
                              エリア
                            </label>
                            <Select 
                              value={keywordFilters.area} 
                              onValueChange={(value) => handleFilterChange('area', value)}
                            >
                              <SelectTrigger className="border-pink-100 focus:border-pink-300">
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
                            <label className="text-sm font-medium flex items-center mb-1.5 text-gray-700">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-pink-400" />
                              予算
                            </label>
                            <Select 
                              value={keywordFilters.budget} 
                              onValueChange={(value) => handleFilterChange('budget', value)}
                            >
                              <SelectTrigger className="border-pink-100 focus:border-pink-300">
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
                          <label className="text-sm font-medium flex items-center mb-1.5 text-gray-700">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-pink-400" />
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
                                className="absolute right-2 top-2 hover:text-pink-500"
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
                  <div className="transition-all duration-300 ease-in-out">
                    {renderQuestionStep()}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                <div className="flex items-center gap-3 bg-gradient-to-br from-white to-pink-50/50 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-pink-100/80 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium">安心の身元確認</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-white to-pink-50/50 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-pink-100/80 flex items-center justify-center">
                    <Check className="h-5 w-5 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium">簡単予約システム</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-white to-pink-50/50 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-full bg-pink-100/80 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium">24時間対応</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#fff6f8_0%,_transparent_60%)]"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <div className="inline-block mb-3">
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-rose-500/10 to-pink-400/10 text-rose-600">
                  <Sparkles className="h-3 w-3 mr-1 text-rose-500" />
                  セラピスト
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">人気のセラピスト</h2>
              <p className="text-muted-foreground">お客様からの評価が高いセラピストをご紹介します</p>
            </div>
            <Link to="/therapists" className="group text-pink-500 font-medium flex items-center hover:text-pink-600 mt-4 md:mt-0 transition-colors">
              すべて見る 
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : featuredTherapists.length > 0 ? (
              featuredTherapists.map((therapist) => (
                <TherapistCard key={therapist.id.toString()} therapist={therapist} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">セラピスト情報がありません</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-50/50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#fff6f8_0%,_transparent_60%)]"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-3">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-rose-500/10 to-pink-400/10 text-rose-600">
                <Heart className="h-3 w-3 mr-1 text-rose-500" />
                特徴
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">リラクゼーションの新しいカタチ</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              私たちのサービスは心と体の健康を第一に考え、安心して利用できる環境を提供します
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">安心・安全</h3>
              <p className="text-muted-foreground">
                すべてのセラピストは厳しい審査を通過し、常に最高の品質とプロフェッショナリズムを提供します。
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">コミュニケーション</h3>
              <p className="text-muted-foreground">
                あなたの希望に合わせた施術を提供するため、セラピストとの事前相談も充実しています。
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">柔軟な予約</h3>
              <p className="text-muted-foreground">
                オンライン予約システムで簡単にセラピストを選び、あなたの都合に合わせた日時で予約できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-r from-pink-500 to-rose-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/9b8e3f3a-bf22-4ecc-9f1e-d46c7b403a4a.png')] bg-cover bg-center"></div>
        </div>
        
        <div className="hidden md:block absolute top-20 right-10 w-32 h-32 rounded-full bg-white/5"></div>
        <div className="hidden md:block absolute bottom-20 left-10 w-40 h-40 rounded-full bg-white/5"></div>
        
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">今すぐ始めましょう</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-white/90">
            あなたに合ったセラピストを見つけて、心と体のリラックスタイムを体験してください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/therapists">
              <Button size="lg" variant="secondary" className="font-medium text-lg rounded-full px-8 shadow-lg hover:shadow-xl transition-all group">
                セラピストを探す
                <ArrowUpRight className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
