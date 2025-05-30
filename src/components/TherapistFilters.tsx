import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
import MBTISelect from "./MBTISelect";
import PrefectureSelect from "./PrefectureSelect";

interface TherapistFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: {
    location: string;
    specialties: string[];
    priceRange: [number, number];
    rating?: number;
    availability: string[];
    mbtiType?: string;
    mood?: string;
    therapistType?: string;
    treatmentType?: string;
    therapistAge?: string;
    height?: string;
    serviceStyle?: string[];
    facialFeatures?: string;
    bodyType?: string[];
    personalityTraits?: string[];
  };
}

const TherapistFilters = ({ onFilterChange, initialFilters }: TherapistFiltersProps) => {
  // Track whether the update came from inside this component
  const isInternalUpdate = useRef(false);
  
  const [location, setLocation] = useState(initialFilters?.location || "");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(initialFilters?.specialties || []);
  const [priceRange, setPriceRange] = useState(initialFilters?.priceRange || [0, 20000]);
  const [rating, setRating] = useState(initialFilters?.rating || 0);
  const [availability, setAvailability] = useState<string[]>(initialFilters?.availability || []);
  const [mbtiType, setMbtiType] = useState(initialFilters?.mbtiType || "unknown");
  const [mood, setMood] = useState(initialFilters?.mood || "");
  const [therapistType, setTherapistType] = useState(initialFilters?.therapistType || "");
  const [treatmentType, setTreatmentType] = useState(initialFilters?.treatmentType || "");
  const [therapistAge, setTherapistAge] = useState(initialFilters?.therapistAge || "");
  const [height, setHeight] = useState(initialFilters?.height || "");
  const [serviceStyle, setServiceStyle] = useState<string[]>(initialFilters?.serviceStyle || []);
  const [facialFeatures, setFacialFeatures] = useState(initialFilters?.facialFeatures || "");
  const [bodyType, setBodyType] = useState<string[]>(initialFilters?.bodyType || []);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(initialFilters?.personalityTraits || []);

  const specialties = [
    "マッサージ",
    "鍼灸",
    "整体",
    "リフレクソロジー",
    "アロマセラピー",
    "カイロプラクティック",
  ];
  const availabilityOptions = ["平日", "週末", "夜間"];
  
  // Define mood options that match Index page questionnaire
  const moodOptions = [
    { value: "relax", label: "リラックスさせる" },
    { value: "stress", label: "ストレス発散に効果的" },
    { value: "heal", label: "癒し効果が高い" },
    { value: "talk", label: "会話を楽しめる" }
  ];
  
  // Updated MBTI types with Japanese descriptions
  const mbtiOptions = [
    { value: "INTJ", label: "INTJ - 建築家" },
    { value: "INTP", label: "INTP - 論理学者" },
    { value: "ENTJ", label: "ENTJ - 指揮官" },
    { value: "ENTP", label: "ENTP - 討論者" },
    { value: "INFJ", label: "INFJ - 提唱者" },
    { value: "INFP", label: "INFP - 仲介者" },
    { value: "ENFJ", label: "ENFJ - 主人公" },
    { value: "ENFP", label: "ENFP - 運動家" },
    { value: "ISTJ", label: "ISTJ - 管理者" },
    { value: "ISFJ", label: "ISFJ - 擁護者" },
    { value: "ESTJ", label: "ESTJ - 幹部" },
    { value: "ESFJ", label: "ESFJ - 領事" },
    { value: "ISTP", label: "ISTP - 巨匠" },
    { value: "ISFP", label: "ISFP - 冒険家" },
    { value: "ESTP", label: "ESTP - 起業家" },
    { value: "ESFP", label: "ESFP - エンターテイナー" }
  ];
  
  // Updated age range options
  const therapistAgeOptions = [
    { value: "20-24", label: "20～24歳" },
    { value: "25-29", label: "25～29歳" },
    { value: "30-34", label: "30～34歳" },
    { value: "35-40", label: "35～40歳" },
    { value: "40plus", label: "40歳～" }
  ];
  
  // Height range options
  const heightOptions = [
    { value: "150-159", label: "150～159cm" },
    { value: "160-169", label: "160～169cm" },
    { value: "170-179", label: "170～179cm" },
    { value: "180-189", label: "180～189cm" },
    { value: "190plus", label: "190cm～" }
  ];
  
  // Service style options
  const serviceStyleOptions = [
    { value: "ranking", label: "ランキング入り" },
    { value: "repeat", label: "高リピート" },
    { value: "technician", label: "テクニシャン" },
    { value: "massage", label: "マッサージ上手" },
    { value: "talking", label: "トーク力" },
    { value: "alcohol", label: "お酒OK" },
    { value: "karaoke", label: "カラオケOK" },
    { value: "couple", label: "カップルコースOK" },
    { value: "overnight", label: "お泊まりOK" },
    { value: "non-mucous", label: "非粘膜接触OK" },
    { value: "english", label: "英語対応可" },
    { value: "non-smoker", label: "ノンスモーカー" }
  ];
  
  // Facial features options
  const facialFeaturesOptions = [
    { value: "masculine", label: "男らしい系" },
    { value: "cute", label: "可愛い系" },
    { value: "fresh", label: "爽やか系" },
    { value: "neutral", label: "中性的" },
    { value: "exotic", label: "エキゾチック系" },
    { value: "korean", label: "韓流系" }
  ];
  
  // Body type options
  const bodyTypeOptions = [
    { value: "muscular", label: "筋肉質" },
    { value: "slim", label: "細見" },
    { value: "average", label: "標準体型" },
    { value: "depilated", label: "脱毛済" },
    { value: "tattoo", label: "タトゥー有り" },
    { value: "beard", label: "ヒゲ有り" }
  ];
  
  // Personality traits options
  const personalityTraitsOptions = [
    { value: "bright", label: "明るい" },
    { value: "calm", label: "穏やか" },
    { value: "reliable", label: "しっかり者" },
    { value: "humorous", label: "ユーモアがある" },
    { value: "social", label: "社交的" },
    { value: "pure", label: "ピュア" },
    { value: "friendly", label: "人懐っこい" },
    { value: "tsundere", label: "ツンデレ" },
    { value: "otaku", label: "オタク" },
    { value: "natural", label: "天然" },
    { value: "intellectual", label: "知的" },
    { value: "elegant", label: "上品" }
  ];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}円`;
  };

  const handleSpecialtyClick = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(
        selectedSpecialties.filter((s) => s !== specialty)
      );
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const handleAvailabilityChange = (value: string) => {
    if (availability.includes(value)) {
      setAvailability(availability.filter((a) => a !== value));
    } else {
      setAvailability([...availability, value]);
    }
  };
  
  const handleQuestionnaireOptionClick = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    currentValue: string,
    value: string
  ) => {
    if (currentValue === value) {
      setter("");
    } else {
      setter(value);
    }
  };
  
  const handleArrayOptionClick = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    currentValues: string[],
    value: string
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter((v) => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  const handleReset = () => {
    setLocation("");
    setSelectedSpecialties([]);
    setPriceRange([0, 20000]);
    setRating(0);
    setAvailability([]);
    setMbtiType("unknown");
    setMood("");
    setTherapistType("");
    setTreatmentType("");
    setTherapistAge("");
    setHeight("");
    setServiceStyle([]);
    setFacialFeatures("");
    setBodyType([]);
    setPersonalityTraits([]);
  };

  // Add useEffect to sync state with initialFilters prop changes
  useEffect(() => {
    // Skip if this was triggered by our own state update
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
    console.log('TherapistFilters: initialFilters changed', initialFilters);
    
    if (initialFilters) {
      // Update all fields from initialFilters
      setLocation(initialFilters.location || "");
      setSelectedSpecialties(initialFilters.specialties || []);
      setPriceRange(initialFilters.priceRange || [0, 20000]);
      setRating(initialFilters.rating || 0);
      setAvailability(initialFilters.availability || []);
      setMbtiType(initialFilters.mbtiType || "unknown");
      setMood(initialFilters.mood || "");
      setTherapistType(initialFilters.therapistType || "");
      setTreatmentType(initialFilters.treatmentType || "");
      setTherapistAge(initialFilters.therapistAge || "");
      setHeight(initialFilters.height || "");
      setServiceStyle(initialFilters.serviceStyle || []);
      setFacialFeatures(initialFilters.facialFeatures || "");
      setBodyType(initialFilters.bodyType || []);
      setPersonalityTraits(initialFilters.personalityTraits || []);
      
      console.log('TherapistFilters: Updated internal state with initialFilters');
    }
  }, [initialFilters]);

  useEffect(() => {
    // Set flag to indicate this update came from inside the component
    isInternalUpdate.current = true;
    
    onFilterChange({
      location,
      specialties: selectedSpecialties,
      priceRange,
      rating,
      availability,
      mbtiType,
      mood,
      therapistType,
      treatmentType,
      therapistAge,
      height,
      serviceStyle,
      facialFeatures,
      bodyType,
      personalityTraits
    });
  }, [
    location, 
    selectedSpecialties, 
    priceRange, 
    rating, 
    availability, 
    mbtiType, 
    mood, 
    therapistType, 
    treatmentType, 
    therapistAge,
    height,
    serviceStyle,
    facialFeatures,
    bodyType,
    personalityTraits
  ]);

  return (
    <div className="bg-card rounded-lg shadow-sm border mb-4 p-3">
      <h3 className="font-medium text-base mb-3">フィルター</h3>

      <div className="space-y-3">
        {/* Location filter - replaced badges with PrefectureSelect dropdown */}
        <div>
          <Label htmlFor="location" className="text-sm mb-1 block">場所 (都道府県)</Label>
          <PrefectureSelect
            value={location}
            onValueChange={setLocation}
            placeholder="都道府県を選択"
          />
        </div>

        {/* MBTI Type filter */}
        <div>
          <Label className="text-sm mb-1 block">MBTIタイプ</Label>
          <MBTISelect 
            value={mbtiType}
            onValueChange={setMbtiType}
            placeholder="MBTIタイプを選択"
          />
        </div>
        
        {/* Age range filter */}
        <div>
          <Label className="text-sm mb-1 block">年齢層</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {therapistAgeOptions.map((option) => (
              <Badge
                key={option.value}
                variant={therapistAge === option.value ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleQuestionnaireOptionClick(setTherapistAge, therapistAge, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Height filter */}
        <div>
          <Label className="text-sm mb-1 block">身長</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {heightOptions.map((option) => (
              <Badge
                key={option.value}
                variant={height === option.value ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleQuestionnaireOptionClick(setHeight, height, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Service Style filter */}
        <div>
          <Label className="text-sm mb-1 block">接客スタイル</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {serviceStyleOptions.map((option) => (
              <Badge
                key={option.value}
                variant={serviceStyle.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleArrayOptionClick(setServiceStyle, serviceStyle, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Facial Features filter */}
        <div>
          <Label className="text-sm mb-1 block">顔立ち</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {facialFeaturesOptions.map((option) => (
              <Badge
                key={option.value}
                variant={facialFeatures === option.value ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleQuestionnaireOptionClick(setFacialFeatures, facialFeatures, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Body Type filter */}
        <div>
          <Label className="text-sm mb-1 block">体型・ビジュアル</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {bodyTypeOptions.map((option) => (
              <Badge
                key={option.value}
                variant={bodyType.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleArrayOptionClick(setBodyType, bodyType, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Personality Traits filter */}
        <div>
          <Label className="text-sm mb-1 block">性格・雰囲気</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {personalityTraitsOptions.map((option) => (
              <Badge
                key={option.value}
                variant={personalityTraits.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleArrayOptionClick(setPersonalityTraits, personalityTraits, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mood filter */}
        <div>
          <Label className="text-sm mb-1 block">セラピーの特徴</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {moodOptions.map((option) => (
              <Badge
                key={option.value}
                variant={mood === option.value ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleQuestionnaireOptionClick(setMood, mood, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Specialties filter */}
        <div>
          <Label className="text-sm mb-1 block">専門分野</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant={
                  selectedSpecialties.includes(specialty)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleSpecialtyClick(specialty)}
              >
                {specialty}
              </Badge>
            ))}
          </div>
          {selectedSpecialties.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 mt-1"
              onClick={() => setSelectedSpecialties([])}
            >
              クリア
            </Button>
          )}
        </div>

        {/* Price range filter */}
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-sm">価格帯</Label>
            <span className="text-xs text-muted-foreground">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </span>
          </div>
          <Slider
            defaultValue={priceRange}
            max={50000}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="my-3"
          />
        </div>

        {/* Rating filter */}
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-sm">評価</Label>
            <span className="text-xs text-muted-foreground">
              {rating}/5 以上
            </span>
          </div>
          <Slider
            defaultValue={[rating]}
            max={5}
            step={0.5}
            value={[rating]}
            onValueChange={(value) => setRating(value[0])}
            className="my-3"
          />
        </div>

        {/* Availability filter */}
        <div>
          <Label className="text-sm mb-1 block">利用可能時間</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {availabilityOptions.map((option) => (
              <Badge
                key={option}
                variant={
                  availability.includes(option) ? "default" : "outline"
                }
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleAvailabilityChange(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-2 border-t border-border">
          <Button size="sm" variant="secondary" onClick={handleReset} className="h-8">
            リセット
          </Button>
          <Button size="sm" className="ml-auto h-8">
            適用
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TherapistFilters;
