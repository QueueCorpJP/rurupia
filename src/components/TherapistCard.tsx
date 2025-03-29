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

interface TherapistCardProps {
  therapist: Therapist;
  className?: string;
}

const TherapistCard = ({ therapist, className }: TherapistCardProps) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Format availability days into a readable string
  const formatAvailability = (days: string[]) => {
    // Create mapping from Japanese days to their proper order in a week
    const sortOrder: Record<string, number> = {
      '月': 0, '火': 1, '水': 2, '木': 3, '金': 4, '土': 5, '日': 6
    };
    
    // Sort days according to weekday order
    const sortedDays = [...days].sort((a, b) => sortOrder[a] - sortOrder[b]);
    
    // Return the sorted days with proper separator
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
        // Unfollow: Delete the record
        const { error } = await supabase
          .from('followed_therapists')
          .delete()
          .eq('user_id', String(user.id))
          .eq('therapist_id', String(therapist.id));
          
        if (error) throw error;
        
        toast.success(`${therapist.name}のフォローを解除しました`);
      } else {
        // Follow: Insert a new record
        const { error } = await supabase
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
      
      {/* Available now badge */}
      <div className="absolute left-4 top-4 z-10">
        <div className="rounded-full bg-green-500 text-white px-3 py-1 text-xs font-medium flex items-center shadow-sm">
          <Zap className="h-3 w-3 mr-1" />
          ただいま営業中
        </div>
      </div>
      
      <Link to={`/therapists/${therapist.id}`}>
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
          <Link to={`/therapists/${therapist.id}`}>
            <h3 className="font-bold text-xl hover:text-primary transition-colors">{therapist.name}</h3>
          </Link>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-medium">{therapist.rating}</span>
            <span className="text-sm text-muted-foreground">({therapist.reviews})</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <MapPin className="mr-1 h-4 w-4 text-primary" />
            {therapist.location}
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-primary" />
            <span>営業日：{formatAvailability(therapist.availability)}</span>
          </div>
          {/* Highlighted working hours */}
          <div className="flex items-center bg-green-50 rounded-md p-1.5 border border-green-100">
            <Clock className="mr-1 h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">営業時間：10:00～20:00</span>
          </div>
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
          <Link to={`/therapists/${therapist.id}`}>
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
