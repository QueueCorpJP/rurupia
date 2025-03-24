
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Calendar, MessageSquare, FileText, Settings, User } from "lucide-react";

const TherapistNavigation = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    if (location && location.pathname) {
      setCurrentPath(location.pathname);
    }
  }, [location]);

  const isActive = (path: string) => {
    if (!currentPath) return false;
    return currentPath === path || (typeof currentPath === 'string' && currentPath.startsWith(path));
  };

  const navItems = [
    { 
      label: "ダッシュボード", 
      path: "/therapist-dashboard", 
      icon: <Home className="w-5 h-5 mr-3" /> 
    },
    { 
      label: "予約管理", 
      path: "/therapist-bookings", 
      icon: <Calendar className="w-5 h-5 mr-3" /> 
    },
    { 
      label: "メッセージ", 
      path: "/therapist-messages", 
      icon: <MessageSquare className="w-5 h-5 mr-3" /> 
    },
    { 
      label: "記事管理", 
      path: "/therapist-posts", 
      icon: <FileText className="w-5 h-5 mr-3" /> 
    },
    { 
      label: "プロフィール", 
      path: "/therapist-profile", 
      icon: <User className="w-5 h-5 mr-3" /> 
    },
    { 
      label: "設定", 
      path: "/therapist-settings", 
      icon: <Settings className="w-5 h-5 mr-3" /> 
    }
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
            isActive(item.path)
              ? "bg-primary/10 text-primary font-medium"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default TherapistNavigation;
