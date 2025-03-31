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
  
  // Define therapist type options that match Index page questionnaire
  const therapistTypeOptions = [
    { value: "mature", label: "落ち着いた・大人っぽい" },
    { value: "bright", label: "明るくて話しやすい" },
    { value: "inclusive", label: "包容力がある" },
    { value: "cool", label: "クールで控えめ" }
  ];
  
  // Define treatment type options that match Index page questionnaire
  const treatmentTypeOptions = [
    { value: "gentle", label: "ゆっくり丁寧なプレイ" },
    { value: "strong", label: "しっかり強めのプレイ" },
    { value: "technique", label: "ハンドテクニックメイン" }
  ];
  
  // Define age range options that match Index page questionnaire
  const therapistAgeOptions = [
    { value: "early20s", label: "20代前半" },
    { value: "late20s", label: "20代後半" },
    { value: "30plus", label: "30代以上" }
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
      therapistAge
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
    therapistAge
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

        {/* Therapist Type filter */}
        <div>
          <Label className="text-sm mb-1 block">性格・雰囲気</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {therapistTypeOptions.map((option) => (
              <Badge
                key={option.value}
                variant={therapistType === option.value ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleQuestionnaireOptionClick(setTherapistType, therapistType, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Treatment Type filter */}
        <div>
          <Label className="text-sm mb-1 block">施術スタイル</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {treatmentTypeOptions.map((option) => (
              <Badge
                key={option.value}
                variant={treatmentType === option.value ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleQuestionnaireOptionClick(setTreatmentType, treatmentType, option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Therapist Age filter */}
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
