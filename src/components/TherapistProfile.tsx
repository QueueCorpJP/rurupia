
import { Therapist } from '../utils/types';
import { Star, MapPin, Clock, Award, Heart } from 'lucide-react';

interface TherapistProfileProps {
  therapist: Therapist;
  isFollowing: boolean;
  onToggleFollow: () => void;
}

const TherapistProfile = ({ therapist, isFollowing, onToggleFollow }: TherapistProfileProps) => {
  // Translate the therapist info to Japanese
  const japaneseName = `${therapist.name}（${therapist.name.split(' ')[0]}）`;
  const japaneseAge = "30代";
  const japaneseHeight = "178cm";
  const japaneseWeight = "75kg";
  const japaneseArea = "東京23区、横浜市";
  const japaneseTime = "18:00～翌3:00";
  const japaneseFollowers = "125人";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{japaneseName}</h1>
          <div className="flex items-center mt-2 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
              <span className="font-medium">{therapist.rating}</span>
              <span className="text-muted-foreground ml-1">（{therapist.reviews}件のレビュー）</span>
            </div>
            <span className="mx-2 text-muted-foreground">•</span>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {japaneseArea}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleFollow}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              isFollowing 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFollowing ? 'fill-primary text-primary' : ''}`} />
            {isFollowing ? 'フォロー中' : 'フォローする'}
          </button>
          <div className="text-sm text-muted-foreground">{japaneseFollowers}がフォロー中</div>
        </div>
      </div>
              
      <div className="flex flex-wrap gap-2 mt-4">
        {therapist.specialties.map((specialty, index) => (
          <span 
            key={index}
            className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold"
          >
            {specialty === "Swedish" ? "スウェーディッシュ" : 
             specialty === "Deep Tissue" ? "ディープティシュー" : 
             specialty === "Sports" ? "スポーツ" : 
             specialty === "Hot Stone" ? "ホットストーン" : 
             specialty === "Aromatherapy" ? "アロマセラピー" : 
             specialty === "Relaxation" ? "リラクゼーション" : 
             specialty}
          </span>
        ))}
      </div>
      
      {/* Basic profile information */}
      <div className="grid sm:grid-cols-2 gap-4 mt-6 bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">対応可能時間:</span>
          <span className="text-sm">{japaneseTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">対応エリア:</span>
          <span className="text-sm">{japaneseArea}</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">年齢:</span>
          <span className="text-sm">{japaneseAge}</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">体格:</span>
          <span className="text-sm">{japaneseHeight} / {japaneseWeight}</span>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="font-semibold text-lg mb-2">自己紹介</h2>
        <p className="text-muted-foreground">
          こんにちは！{japaneseName}です。リラックスした時間を提供します！ 私は明るく話すことが好きですが、お客様の希望に合わせてサイレントにすることもできます。私の施術は深い筋肉の緊張を解消しながらも、心地よいリラクゼーションを提供することを目指しています。どうぞリラックスして、日常の疲れを忘れるひとときをお過ごしください。
        </p>
      </div>
    </div>
  );
};

export default TherapistProfile;
