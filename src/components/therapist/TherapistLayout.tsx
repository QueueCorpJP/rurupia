
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TherapistLayoutProps {
  children: ReactNode;
}

export const TherapistLayout = ({ children }: TherapistLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">JM</span>
            </div>
            <span className="font-semibold text-lg">のくとるセラピストページ</span>
          </Link>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
};
