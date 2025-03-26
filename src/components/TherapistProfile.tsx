import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Therapist } from "../utils/types";
import { User } from "lucide-react";

interface TherapistProfileProps {
  therapist: Therapist;
  isFollowing: boolean;
  onToggleFollow: () => void;
}

export function TherapistProfile({
  therapist,
  isFollowing,
  onToggleFollow,
}: TherapistProfileProps) {
  // Format or default values for therapist data
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  };

  // Format height with cm
  const formatHeight = (height: any): string => {
    if (height === null || height === undefined || height === '') {
      return '-';
    }
    return `${height}cm`;
  };

  // Format weight with kg
  const formatWeight = (weight: any): string => {
    if (weight === null || weight === undefined || weight === '') {
      return '-';
    }
    return `${weight}kg`;
  };

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3">
        <Avatar className="h-24 w-24">
          {therapist.imageUrl ? (
            <AvatarImage src={therapist.imageUrl} alt={therapist.name} />
          ) : (
            <AvatarFallback className="text-lg">
              {getInitials(therapist.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{therapist.name}</h2>
          <p className="text-sm text-muted-foreground">{formatValue(therapist.location)}</p>
        </div>
        <div className="flex items-center gap-6 text-center text-sm">
          <div>
            <div className="font-medium">{formatValue(therapist.rating)}</div>
            <div className="text-xs text-muted-foreground">評価</div>
          </div>
          <div>
            <div className="font-medium">{formatValue(therapist.reviews)}</div>
            <div className="text-xs text-muted-foreground">レビュー</div>
          </div>
          <div>
            <div className="font-medium">{formatValue(therapist['followers_count'])}</div>
            <div className="text-xs text-muted-foreground">フォロワー</div>
          </div>
        </div>
        <Button onClick={onToggleFollow} variant={isFollowing ? "outline" : "default"}>
          {isFollowing ? "フォロー中" : "フォローする"}
        </Button>
      </div>
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="info">詳細情報</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-medium">自己紹介</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatValue(therapist.description)}
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-medium">専門分野</h3>
            <div className="mt-1 space-y-1">
              {therapist.specialties && therapist.specialties.length > 0 ? (
                therapist.specialties.map((specialty, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    • {specialty}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="info" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <h4 className="text-sm font-medium">エリア</h4>
              <p className="text-sm text-muted-foreground">
                {formatValue(therapist.area || therapist.location)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">詳細エリア</h4>
              <p className="text-sm text-muted-foreground">
                {formatValue(therapist.detailedArea)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">身長</h4>
              <p className="text-sm text-muted-foreground">
                {formatHeight(therapist.height)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">体重</h4>
              <p className="text-sm text-muted-foreground">
                {formatWeight(therapist.weight)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">年齢</h4>
              <p className="text-sm text-muted-foreground">
                {formatValue(therapist.age)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">趣味</h4>
              <p className="text-sm text-muted-foreground">
                {therapist.hobbies && Array.isArray(therapist.hobbies) && therapist.hobbies.length > 0
                  ? therapist.hobbies.join(', ')
                  : formatValue(therapist.hobbies)}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
