import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, X } from 'lucide-react';
import { useTherapistProfileOptions } from '@/hooks/use-therapist-profile-options';

interface TherapistProfileEnhancedProps {
  heightRange: string;
  onHeightRangeChange: (value: string) => void;
  facialFeatures: string;
  onFacialFeaturesChange: (value: string) => void;
  serviceStyle: string[];
  onServiceStyleChange: (values: string[]) => void;
  bodyType: string[];
  onBodyTypeChange: (values: string[]) => void;
  personalityTraits: string[];
  onPersonalityTraitsChange: (values: string[]) => void;
}

const TherapistProfileEnhanced: React.FC<TherapistProfileEnhancedProps> = ({
  heightRange,
  onHeightRangeChange,
  facialFeatures,
  onFacialFeaturesChange,
  serviceStyle,
  onServiceStyleChange,
  bodyType,
  onBodyTypeChange,
  personalityTraits,
  onPersonalityTraitsChange
}) => {
  const { 
    heightRanges,
    facialFeatures: facialFeatureOptions,
    serviceStyles,
    bodyTypes,
    personalityTraits: personalityTraitOptions,
    isLoading,
    error
  } = useTherapistProfileOptions();

  // Function to toggle a value in an array
  const toggleArrayValue = (
    array: string[], 
    value: string, 
    onChangeCallback: (newArray: string[]) => void
  ) => {
    if (array.includes(value)) {
      onChangeCallback(array.filter(item => item !== value));
    } else {
      onChangeCallback([...array, value]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">プロフィールオプションを読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <p>プロフィールオプションの読み込みに失敗しました。</p>
        <p className="text-sm">エラー: {error}</p>
        <p className="mt-2">デフォルトオプションを使用します。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Height Range Section - REMOVED as per user request */}
      
      {/* Facial Features Section */}
      <div>
        <Label className="text-lg font-medium">顔立ち</Label>
        <p className="text-sm text-muted-foreground mb-3">
          あなたの顔立ちに最も近いスタイルを選択してください
        </p>
        <RadioGroup value={facialFeatures} onValueChange={onFacialFeaturesChange} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {facialFeatureOptions.map(option => (
            <div key={option.value} className="flex items-start space-x-2 rounded-md border p-3">
              <RadioGroupItem value={option.value} id={`facial-${option.value}`} />
              <Label htmlFor={`facial-${option.value}`} className="cursor-pointer font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Service Style Section */}
      <div>
        <Label className="text-lg font-medium">接客スタイル</Label>
        <p className="text-sm text-muted-foreground mb-3">
          あなたの接客スタイルに該当するものをすべて選択してください
        </p>
        <div className="flex flex-wrap gap-2">
          {serviceStyles.map(option => (
            <Badge 
              key={option.value}
              variant={serviceStyle.includes(option.value) ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors py-1.5 px-3"
              onClick={() => toggleArrayValue(serviceStyle, option.value, onServiceStyleChange)}
            >
              {serviceStyle.includes(option.value) && (
                <X className="h-3 w-3 mr-1" />
              )}
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Body Type Section */}
      <div>
        <Label className="text-lg font-medium">体型・ビジュアル</Label>
        <p className="text-sm text-muted-foreground mb-3">
          あなたの体型に該当するものをすべて選択してください
        </p>
        <div className="flex flex-wrap gap-2">
          {bodyTypes.map(option => (
            <Badge 
              key={option.value}
              variant={bodyType.includes(option.value) ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors py-1.5 px-3"
              onClick={() => toggleArrayValue(bodyType, option.value, onBodyTypeChange)}
            >
              {bodyType.includes(option.value) && (
                <X className="h-3 w-3 mr-1" />
              )}
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Personality Traits Section */}
      <div>
        <Label className="text-lg font-medium">性格・雰囲気</Label>
        <p className="text-sm text-muted-foreground mb-3">
          あなたの性格に該当するものをすべて選択してください
        </p>
        <div className="flex flex-wrap gap-2">
          {personalityTraitOptions.map(option => (
            <Badge 
              key={option.value}
              variant={personalityTraits.includes(option.value) ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors py-1.5 px-3"
              onClick={() => toggleArrayValue(personalityTraits, option.value, onPersonalityTraitsChange)}
            >
              {personalityTraits.includes(option.value) && (
                <X className="h-3 w-3 mr-1" />
              )}
              {option.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistProfileEnhanced; 