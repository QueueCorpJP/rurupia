
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TherapistLayoutProps {
  children: ReactNode;
}

export const TherapistLayout = ({ children }: TherapistLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">のくとるセラピストページ</h1>
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
