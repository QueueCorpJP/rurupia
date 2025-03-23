import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, User, BookOpen, Search, Heart, Calendar, Instagram, Facebook, Twitter, Mail, Phone, MapPin, LogOut, Store, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import PageViewTracker from '@/components/common/PageViewTracker';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUserProfile(profile);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getUserDashboardLink = () => {
    if (!userProfile) return "/user-profile";
    
    switch (userProfile.user_type) {
      case 'store':
        return "/store-admin";
      case 'therapist':
        return "/therapist-dashboard";
      default:
        return "/user-profile";
    }
  };

  return (
    <>
      <PageViewTracker />
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
          <div className="container flex h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70">
                <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
              </div>
              <span className="font-semibold text-lg text-foreground">のくとる</span>
            </Link>
            
            <nav className="hidden md:flex ml-auto items-center gap-1 md:gap-6">
              <Link 
                to="/therapists" 
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-2 rounded-full ${
                  location.pathname === '/therapists' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>セラピスト検索</span>
              </Link>
              <Link 
                to="/blog" 
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-2 rounded-full ${
                  location.pathname.startsWith('/blog') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>ブログ</span>
              </Link>
              
              <div className="h-6 w-px bg-border mx-1"></div>
              
              {!loading && (
                <>
                  {user ? (
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger className="text-sm">
                            <User className="h-4 w-4 mr-1" />
                            マイページ
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="grid w-[200px] gap-2 p-4">
                              {userProfile?.user_type === 'store' ? (
                                <>
                                  <Link to="/store-admin" className="block p-2 hover:bg-muted rounded-md">
                                    <Store className="h-4 w-4 inline mr-2" />
                                    店舗管理
                                  </Link>
                                </>
                              ) : userProfile?.user_type === 'therapist' ? (
                                <>
                                  <Link to="/therapist-dashboard" className="block p-2 hover:bg-muted rounded-md">
                                    <User className="h-4 w-4 inline mr-2" />
                                    セラピストダッシュボード
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <Link to="/user-profile" className="block p-2 hover:bg-muted rounded-md">
                                    <User className="h-4 w-4 inline mr-2" />
                                    プロフィール
                                  </Link>
                                  <Link to="/user-bookings" className="block p-2 hover:bg-muted rounded-md">
                                    <Calendar

