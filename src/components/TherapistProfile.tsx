
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Therapist } from "../utils/types";
import { User } from "lucide-react";
import { getAvatarImageUrl } from "@/utils/imageOptimizer";

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

  // Get optimized avatar URL
  const getProfileImage = (imageUrl: string): string => {
    if (!imageUrl) return '';
    return getAvatarImageUrl(imageUrl, 96); // 96px for the avatar (24*4)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3">
        <Avatar className="h-24 w-24 border overflow-hidden">
          {therapist.imageUrl ? (
            <AvatarImage src={getProfileImage(therapist.imageUrl)} alt={therapist.name} />
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
            <div className="font-medium">
              {therapist.rating > 0 ? 
                formatValue(therapist.rating.toFixed(1)) : 
                <span className="text-gray-400">未評価</span>
              }
            </div>
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
    </div>
  );
}
