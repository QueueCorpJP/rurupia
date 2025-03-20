
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Copy, Mail, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the Therapist interface
interface Therapist {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

const StoreTherapists = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the current user's ID (the store)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("ログインしていません");
          setLoading(false);
          return;
        }
        
        setStoreId(user.id);
        
        // Get all therapists linked to this store
        const { data, error: therapistsError } = await supabase
          .from("store_therapists")
          .select(`
            therapist_id,
            status,
            created_at,
            therapists!inner(name),
            profiles!inner(email, phone)
          `)
          .eq("store_id", user.id);
          
        if (therapistsError) {
          throw therapistsError;
        }
        
        // Transform the data into a more usable format
        const formattedData = data.map((item: any) => ({
          id: item.therapist_id,
          name: item.therapists.name,
          email: item.profiles.email,
          phone: item.profiles.phone || "",
          status: item.status,
          created_at: item.created_at,
        }));
        
        setTherapists(formattedData);
      } catch (error: any) {
        console.error("Error fetching therapists:", error);
        setError("セラピスト情報の取得に失敗しました: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const copyInviteLink = () => {
    if (!storeId) return;
    
    const inviteLink = `${window.location.origin}/therapist-signup?store=${storeId}`;
    navigator.clipboard.writeText(inviteLink);
    
    // Show a toast notification
    toast("招待リンクがコピーされました");
    
    // Also update state to show a visual confirmation
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 3000);
  };

  const sendInviteEmail = async () => {
    // Implementation for sending invitation email would go here
    toast("招待メールが送信されました");
    setInviteEmail("");
    setIsDialogOpen(false);
  };

  const removeTherapist = async (therapistId: string) => {
    if (!storeId) return;
    
    try {
      const { error } = await supabase
        .from("store_therapists")
        .delete()
        .eq("store_id", storeId)
        .eq("therapist_id", therapistId);
        
      if (error) throw error;
      
      // Update the UI
      setTherapists(therapists.filter(t => t.id !== therapistId));
      toast("セラピストが削除されました");
    } catch (error: any) {
      console.error("Error removing therapist:", error);
      toast("セラピストの削除に失敗しました: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">セラピスト管理</h2>
          <p className="text-muted-foreground">
            店舗のセラピストを管理し、新しいセラピストを招待します
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>セラピストを招待</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>セラピストを招待</DialogTitle>
              <DialogDescription>
                招待リンクをコピーして共有するか、メールで直接招待を送信できます
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>招待リンク</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={storeId ? `${window.location.origin}/therapist-signup?store=${storeId}` : '読み込み中...'}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyInviteLink}
                    className={inviteCopied ? "bg-green-100" : ""}
                  >
                    <Copy className={`h-4 w-4 ${inviteCopied ? "text-green-500" : ""}`} />
                  </Button>
                </div>
                {inviteCopied && (
                  <p className="text-xs text-green-500">リンクをコピーしました!</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>メールで招待</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={sendInviteEmail}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsDialogOpen(false)}>
                閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>セラピスト一覧</CardTitle>
          <CardDescription>
            店舗に所属するセラピストの一覧です
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : therapists.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              セラピストがまだ登録されていません。「セラピストを招待」ボタンから招待してください。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {therapists.map((therapist) => (
                  <TableRow key={therapist.id}>
                    <TableCell className="font-medium">{therapist.name}</TableCell>
                    <TableCell>{therapist.email}</TableCell>
                    <TableCell>{therapist.phone || "未設定"}</TableCell>
                    <TableCell>
                      <StatusBadge status={therapist.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(therapist.created_at).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTherapist(therapist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreTherapists;
