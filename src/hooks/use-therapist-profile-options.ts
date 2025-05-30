import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProfileOption {
  value: string;
  label: string;
}

export interface TherapistProfileOptions {
  mbtiTypes: ProfileOption[];
  ageRanges: ProfileOption[];
  heightRanges: ProfileOption[];
  serviceStyles: ProfileOption[];
  facialFeatures: ProfileOption[];
  bodyTypes: ProfileOption[];
  personalityTraits: ProfileOption[];
  isLoading: boolean;
  error: string | null;
}

// Fallback options in case the database call fails
const fallbackOptions = {
  mbtiTypes: [
    { value: 'INTJ', label: 'INTJ - 建築家' },
    { value: 'INTP', label: 'INTP - 論理学者' },
    { value: 'ENTJ', label: 'ENTJ - 指揮官' },
    { value: 'ENTP', label: 'ENTP - 討論者' },
    { value: 'INFJ', label: 'INFJ - 提唱者' },
    { value: 'INFP', label: 'INFP - 仲介者' },
    { value: 'ENFJ', label: 'ENFJ - 主人公' },
    { value: 'ENFP', label: 'ENFP - 運動家' },
    { value: 'ISTJ', label: 'ISTJ - 管理者' },
    { value: 'ISFJ', label: 'ISFJ - 擁護者' },
    { value: 'ESTJ', label: 'ESTJ - 幹部' },
    { value: 'ESFJ', label: 'ESFJ - 領事' },
    { value: 'ISTP', label: 'ISTP - 巨匠' },
    { value: 'ISFP', label: 'ISFP - 冒険家' },
    { value: 'ESTP', label: 'ESTP - 起業家' },
    { value: 'ESFP', label: 'ESFP - エンターテイナー' }
  ],
  ageRanges: [
    { value: '20-24', label: '20～24歳' },
    { value: '25-29', label: '25～29歳' },
    { value: '30-34', label: '30～34歳' },
    { value: '35-40', label: '35～40歳' },
    { value: '40plus', label: '40歳～' }
  ],
  heightRanges: [
    { value: '150-159', label: '150～159cm' },
    { value: '160-169', label: '160～169cm' },
    { value: '170-179', label: '170～179cm' },
    { value: '180-189', label: '180～189cm' },
    { value: '190plus', label: '190cm～' }
  ],
  serviceStyles: [
    { value: 'ranking', label: 'ランキング入り' },
    { value: 'repeat', label: '高リピート' },
    { value: 'technician', label: 'テクニシャン' },
    { value: 'massage', label: 'マッサージ上手' },
    { value: 'talking', label: 'トーク力' },
    { value: 'alcohol', label: 'お酒OK' },
    { value: 'karaoke', label: 'カラオケOK' },
    { value: 'couple', label: 'カップルコースOK' },
    { value: 'overnight', label: 'お泊まりOK' },
    { value: 'non-mucous', label: '非粘膜接触OK' },
    { value: 'english', label: '英語対応可' },
    { value: 'non-smoker', label: 'ノンスモーカー' }
  ],
  facialFeatures: [
    { value: 'masculine', label: '男らしい系' },
    { value: 'cute', label: '可愛い系' },
    { value: 'fresh', label: '爽やか系' },
    { value: 'neutral', label: '中性的' },
    { value: 'exotic', label: 'エキゾチック系' },
    { value: 'korean', label: '韓流系' }
  ],
  bodyTypes: [
    { value: 'muscular', label: '筋肉質' },
    { value: 'slim', label: '細見' },
    { value: 'average', label: '標準体型' },
    { value: 'depilated', label: '脱毛済' },
    { value: 'tattoo', label: 'タトゥー有り' },
    { value: 'beard', label: 'ヒゲ有り' }
  ],
  personalityTraits: [
    { value: 'bright', label: '明るい' },
    { value: 'calm', label: '穏やか' },
    { value: 'reliable', label: 'しっかり者' },
    { value: 'humorous', label: 'ユーモアがある' },
    { value: 'social', label: '社交的' },
    { value: 'pure', label: 'ピュア' },
    { value: 'friendly', label: '人懐っこい' },
    { value: 'tsundere', label: 'ツンデレ' },
    { value: 'otaku', label: 'オタク' },
    { value: 'natural', label: '天然' },
    { value: 'intellectual', label: '知的' },
    { value: 'elegant', label: '上品' }
  ]
};

export const useTherapistProfileOptions = (): TherapistProfileOptions => {
  const [options, setOptions] = useState<TherapistProfileOptions>({
    ...fallbackOptions,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data, error } = await supabase.rpc('get_therapist_profile_options');
        
        if (error) {
          console.error('Error fetching profile options:', error);
          toast.error('プロフィールオプションの読み込みに失敗しました。フォールバックオプションを使用します。');
          setOptions({
            ...fallbackOptions,
            isLoading: false,
            error: error.message
          });
          return;
        }
        
        if (data) {
          setOptions({
            mbtiTypes: data.mbti_types || fallbackOptions.mbtiTypes,
            ageRanges: data.age_ranges || fallbackOptions.ageRanges,
            heightRanges: data.height_ranges || fallbackOptions.heightRanges,
            serviceStyles: data.service_styles || fallbackOptions.serviceStyles,
            facialFeatures: data.facial_features || fallbackOptions.facialFeatures,
            bodyTypes: data.body_types || fallbackOptions.bodyTypes,
            personalityTraits: data.personality_traits || fallbackOptions.personalityTraits,
            isLoading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching profile options:', err);
        toast.error('予期せぬエラーが発生しました。フォールバックオプションを使用します。');
        setOptions({
          ...fallbackOptions,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    };

    fetchOptions();
  }, []);

  return options;
};

export default useTherapistProfileOptions; 