import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Star, MapPin, Heart, Clock, Zap, User } from 'lucide-react';
import { Therapist } from '../utils/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface TherapistCardProps {
  therapist: Therapist;
  className?: string;
}

// Helper function to check if the therapist is currently open in JST
// Accepts camelCase properties as defined in the Therapist type
const isCurrentlyOpen = (workingDays?: number[] | string[] | null, workingHours?: { start?: string | null; end?: string | null } | null): boolean => {
  let numericWorkingDays: number[] = [];
  if (workingDays && workingDays.length > 0) {
    if (typeof workingDays[0] === 'string') {
      // Map lowercase English names to numbers (0-6)
      const dayStringToNumber: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
      };
      numericWorkingDays = (workingDays as string[])
        .map(day => dayStringToNumber[day.toLowerCase()]) // Ensure lowercase match
        .filter(day => day !== undefined);
    } else {
      numericWorkingDays = workingDays as number[];
    }
  }

  if (numericWorkingDays.length === 0 || !workingHours?.start || !workingHours?.end) {
    return false; // Closed if no data
  }

  try {
    const japanTimeZone = 'Asia/Tokyo';
    const now = toZonedTime(new Date(), japanTimeZone);
    const currentDay = now.getDay();
    const currentTime = format(now, 'HH:mm');

    if (!numericWorkingDays.includes(currentDay)) {
      return false;
    }

    if (currentTime >= workingHours.start && currentTime < workingHours.end) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking therapist availability:", error);
    return false;
  }
};

const TherapistCard = ({ therapist, className }: TherapistCardProps) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpenNow, setIsOpenNow] = useState(false);
  
  // Calculate open status when therapist data changes
  useEffect(() => {
    // Use camelCase properties from the Therapist type
    setIsOpenNow(isCurrentlyOpen(therapist.workingDays, therapist.workingHours));
  }, [therapist.workingDays, therapist.workingHours]); // Use camelCase dependencies

  // Format availability days into a readable string
  const formatAvailability = (days?: string[] | number[] | null) => {
    if (!days || days.length === 0) return '不定';

    // Map lowercase English names to Japanese names
    const englishToJapaneseMap: Record<string, string> = {
      sunday: '日', monday: '月', tuesday: '火', wednesday: '水', thursday: '木', friday: '金', saturday: '土'
    };
    
    // Map numbers to Japanese names (in case format varies)
    const numberToJapaneseMap: Record<number, string> = {
      0: '日', 1: '月', 2: '火', 3: '水', 4: '木', 5: '金', 6: '土'
    };

    let japaneseDayStrings: string[];
    if (typeof days[0] === 'string') {
      japaneseDayStrings = (days as string[]).map(day => englishToJapaneseMap[day.toLowerCase()] || '?');
    } else {
      japaneseDayStrings = (days as number[]).map(day => numberToJapaneseMap[day] || '?');
    }

    const sortOrder: Record<string, number> = { '月': 0, '火': 1, '水': 2, '木': 3, '金': 4, '土': 5, '日': 6 };
    const sortedDays = japaneseDayStrings.sort((a, b) => sortOrder[a] - sortOrder[b]);
    return sortedDays.join('・');
  };

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };
  
  // Check if user is authenticated
  const checkUserAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      setCurrentUser(data.session.user);
      return data.session.user;
    }
    return null;
  }, []);

  // Check if the user is following the therapist
  const checkIsFollowing = useCallback(async (userId: string, therapistId: string | number) => {
    if (!userId || !therapistId) return false;
    
    const { data, error } = await supabase
      .from('followed_therapists')
      .select('id')
      .eq('user_id', String(userId))
      .eq('therapist_id', String(therapistId))
      .maybeSingle();
      
    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
    
    return !!data;
  }, []);

  // Toggle follow status
  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the heart button
    
    // Check if user is authenticated
    const user = currentUser || await checkUserAuth();
    
    if (!user) {
      toast.error('フォローするにはログインが必要です');
      navigate('/login'); // Redirect to login
      return;
    }
    
    if (!therapist) return;
    
    try {
      if (isFollowing) {
        // Unfollow: Find and delete the specific record using validation-first pattern
        // First validate the record exists
        const { data: existingRecord, error: findError } = await (supabase as any)
          .from('followed_therapists')
          .select('*')
          .eq('user_id', String(user.id))
          .eq('therapist_id', String(therapist.id))
          .single();
          
        if (findError) {
          console.error('Error finding follow record:', findError);
          throw findError;
        }
        
        if (existingRecord) {
          // Delete by ID to avoid chained .eq() calls
          const { error: deleteError } = await (supabase as any)
            .from('followed_therapists')
            .delete()
            .eq('id', existingRecord.id);
            
          if (deleteError) throw deleteError;
        }
        
        toast.success(`${therapist.name}のフォローを解除しました`);
      } else {
        // Follow: Insert a new record
        const { error } = await (supabase as any)
          .from('followed_therapists')
          .insert({
            user_id: String(user.id),
            therapist_id: String(therapist.id),
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast.success(`${therapist.name}をフォローしました`);
      }
      
      // Update local state
      setIsFollowing(prev => !prev);
      
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('エラーが発生しました。もう一度お試しください');
    }
  };

  // Check follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      const user = await checkUserAuth();
      if (user && therapist.id) {
        const following = await checkIsFollowing(user.id, therapist.id);
        setIsFollowing(following);
      }
    };
    
    checkFollowStatus();
  }, [therapist.id, checkUserAuth, checkIsFollowing]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group", className)}>
      <div className="absolute right-4 top-4 z-10">
        <button 
          onClick={handleToggleFollow}
          className={cn(
            "h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors",
            isFollowing 
              ? "bg-pink-50 text-pink-500" 
              : "hover:bg-white hover:text-pink-500"
          )}
        >
          <Heart className={cn("h-5 w-5", isFollowing && "fill-pink-500")} />
        </button>
      </div>
      
      {/* Conditional "Available now" badge */}
      {isOpenNow && (
        <div className="absolute left-4 top-4 z-10">
          <div className="rounded-full bg-green-500 text-white px-3 py-1 text-xs font-medium flex items-center shadow-sm">
            <Zap className="h-3 w-3 mr-1" />
            ただいま営業中
          </div>
        </div>
      )}
      
      <Link to={`/therapist/${therapist.id}`}>
        <div className="aspect-[4/3] w-full overflow-hidden">
          {therapist.imageUrl ? (
            <img 
              src={therapist.imageUrl} 
              alt={therapist.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-lg bg-gray-200">
                  {getInitials(therapist.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <Link to={`/therapist/${therapist.id}`}>
            <h3 className="font-bold text-xl hover:text-primary transition-colors">{therapist.name}</h3>
          </Link>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            {therapist.rating > 0 && therapist.reviews > 0 ? (
              <>
                <span className="text-sm font-medium">{therapist.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({therapist.reviews})</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">未評価</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <MapPin className="mr-1 h-4 w-4 text-primary" />
            {therapist.location}
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-primary" />
            {/* Use camelCase workingDays here */}
            <span>営業日：{formatAvailability(therapist.workingDays)}</span>
          </div>
          {/* Dynamic working hours - use camelCase workingHours */}
          {(therapist.workingHours?.start && therapist.workingHours?.end) ? (
            <div className={cn(
              "flex items-center rounded-md p-1.5 border",
              isOpenNow
                ? "bg-green-50 border-green-100"
                : "bg-gray-50 border-gray-100" // Style for closed hours
            )}>
              <Clock className={cn(
                "mr-1 h-4 w-4",
                isOpenNow ? "text-green-600" : "text-gray-500"
              )} />
              <span className={cn(
                "font-medium",
                 isOpenNow ? "text-green-800" : "text-gray-700"
              )}>
                 営業時間：{therapist.workingHours.start}～{therapist.workingHours.end}
              </span>
            </div>
          ) : (
             <div className="flex items-center bg-gray-50 rounded-md p-1.5 border border-gray-100">
               <Clock className="mr-1 h-4 w-4 text-gray-500" />
               <span className="font-medium text-gray-700">営業時間：不定</span>
             </div>
          )}
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
        
        <div className="flex items-center justify-between pt-4 border-t border-pink-100">
          <div className="text-sm font-medium">
            <span className="text-lg font-bold text-foreground">{therapist.price}円</span>
            <span className="text-muted-foreground"> / 時間</span>
          </div>
          <Link to={`/therapist/${therapist.id}`}>
            <Button variant="outline" size="sm" className="rounded-full px-4 border-pink-200">
              詳細を見る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;
