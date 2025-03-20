
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Mail,
  BarChart2,
  Settings,
  LogOut,
  UserPlus,
  Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoreSidebarNavProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function StoreSidebarNav({ isOpen, toggleSidebar }: StoreSidebarNavProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast.success('ログアウトしました');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  const generateInviteLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ログインしていません");
        return;
      }
      
      // Generate invite link with store ID
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/therapist-signup?store=${user.id}`;
      
      setInviteLink(link);
      setIsInviteDialogOpen(true);
    } catch (error) {
      console.error("Error generating invite link:", error);
      toast.error("招待リンクの生成に失敗しました");
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("招待リンクをコピーしました");
  };

  return (
    <>
      <nav className={cn(
        "fixed left-0 top-0 z-40 h-full w-64 transform bg-background border-r transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 md:w-64 md:transition-width"
      )}>
        <div className="flex h-16 items-center border-b px-4">
          <h2 className="text-lg font-semibold">店舗管理システム</h2>
          <button
            onClick={toggleSidebar}
            className="ml-auto md:hidden"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="sr-only">閉じる</span>
          </button>
        </div>
        <div className="space-y-4 py-4 px-4">
          <NavLink
            to="/store-admin"
            end
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start w-full"
              )
            }
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            ダッシュボード
          </NavLink>
          <NavLink
            to="/store-admin/therapists"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start w-full"
              )
            }
          >
            <Users className="mr-2 h-4 w-4" />
            セラピスト
          </NavLink>
          <NavLink
            to="/store-admin/bookings"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start w-full"
              )
            }
          >
            <Calendar className="mr-2 h-4 w-4" />
            予約管理
          </NavLink>
          <NavLink
            to="/store-admin/courses"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start w-full"
              )
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            メニュー管理
          </NavLink>
          <NavLink
            to="/store-admin/inquiries"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start w-full"
              )
            }
          >
            <Mail className="mr-2 h-4 w-4" />
            問い合わせ
          </NavLink>
          <NavLink
            to="/store-admin/analytics"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start w-full"
              )
            }
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            分析
          </NavLink>
          <NavLink
            to="/store-admin/settings"
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: "ghost" }),
                isActive
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start w-full"
              )
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            設定
          </NavLink>
          
          <Button
            variant="outline"
            className="mt-4 justify-start w-full"
            onClick={generateInviteLink}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            セラピストを招待
          </Button>
          
          <Button
            variant="ghost"
            className="mt-2 text-destructive justify-start w-full hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
      </nav>
      
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>セラピスト招待</DialogTitle>
            <DialogDescription>
              以下の招待リンクを共有して、新しいセラピストを招待できます。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input 
              readOnly 
              value={inviteLink} 
              className="flex-1"
            />
            <Button onClick={copyInviteLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsInviteDialogOpen(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
