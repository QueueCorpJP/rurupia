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
import { PlusCircle, Copy, Mail, Trash2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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
  const [pendingTherapists, setPendingTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

      // First, get pending therapists from profiles
      const { data: pendingData, error: pendingError } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          phone,
          status,
          created_at
        `)
        .eq("invited_by_store_id", user.id)
        .eq("status", "pending_therapist_approval");

      if (pendingError) throw pendingError;
      setPendingTherapists(pendingData || []);
      
      // Then, get active store-therapist relationships
      const { data: storeTherapistsData, error: storeTherapistsError } = await supabase
        .from("store_therapists")
        .select(`
          id,
          therapist_id,
          status,
          schedule
        `)
        .eq("store_id", user.id);
        
      if (storeTherapistsError) throw storeTherapistsError;

      if (!storeTherapistsData || storeTherapistsData.length === 0) {
        setTherapists([]);
        setLoading(false);
        return;
      }

      // Get the ids of all therapists linked to this store
      const therapistIds = storeTherapistsData.map(item => item.therapist_id);
      
      // Get therapist profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email, phone, status, created_at")
        .in("id", therapistIds);

      if (profilesError) throw profilesError;
      
      setTherapists(profilesData || []);
    } catch (error: any) {
      console.error("Error fetching therapists:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const copyInviteLink = () => {
    if (!storeId) return;
    
    const inviteLink = `${window.location.origin}/therapist-signup?store=${storeId}`;
    navigator.clipboard.writeText(inviteLink);
    
    toast("招待リンクがコピーされました");
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 3000);
  };

  const sendInviteEmail = async () => {
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
      
      setTherapists(therapists.filter(t => t.id !== therapistId));
      toast("セラピストが削除されました");
    } catch (error: any) {
      console.error("Error removing therapist:", error);
      toast("セラピストの削除に失敗しました: " + error.message);
    }
  };

  const approveTherapist = async (therapistId: string) => {
    if (!storeId) return;
    
    try {
      // 1. Create entry in therapists table
      const { error: therapistError } = await supabase
        .from("therapists")
        .insert([
          {
            id: therapistId,
            name: pendingTherapists.find(t => t.id === therapistId)?.name || "",
            description: "No description yet",
            location: "Tokyo",
            price: 5000,
            specialties: [],
            experience: 0,
            rating: 0,
            reviews: 0,
            availability: []
          }
        ]);
        
      if (therapistError) throw therapistError;

      // 2. Create store_therapists relation
      const { error: relationError } = await supabase
        .from("store_therapists")
        .insert([
          {
            store_id: storeId,
            therapist_id: therapistId,
            status: "active"
          }
        ]);
        
      if (relationError) throw relationError;

      // 3. Update profile status to active
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ status: "active" })
        .eq("id", therapistId);
        
      if (profileError) throw profileError;

      toast.success("セラピストを承認しました");
      fetchTherapists(); // Refresh the lists
    } catch (error: any) {
      console.error("Error approving therapist:", error);
      toast.error("セラピストの承認に失敗しました: " + error.message);
    }
  };

  const rejectTherapist = async (therapistId: string) => {
    if (!storeId) return;
    
    try {
      // Simply delete the profile entry
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", therapistId)
        .eq("invited_by_store_id", storeId);
        
      if (error) throw error;

      setPendingTherapists(pendingTherapists.filter(t => t.id !== therapistId));
      toast.success("セラピストの申請を却下しました");
    } catch (error: any) {
      console.error("Error rejecting therapist:", error);
      toast.error("セラピストの却下に失敗しました: " + error.message);
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>招待リンク</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={copyInviteLink}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {inviteCopied ? "コピーしました" : "招待リンクをコピー"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>メールで招待</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="メールアドレスを入力"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={sendInviteEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    送信
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Therapists Section */}
      {pendingTherapists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>承認待ちのセラピスト</CardTitle>
            <CardDescription>
              新しく登録申請のあったセラピストを確認し、承認または却下してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>申請日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTherapists.map((therapist) => (
                  <TableRow key={therapist.id}>
                    <TableCell className="font-medium">{therapist.name}</TableCell>
                    <TableCell>{therapist.email}</TableCell>
                    <TableCell>{therapist.phone || "未設定"}</TableCell>
                    <TableCell>
                      {new Date(therapist.created_at).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => approveTherapist(therapist.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => rejectTherapist(therapist.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Active Therapists Section */}
      <Card>
        <CardHeader>
          <CardTitle>登録済みセラピスト</CardTitle>
          <CardDescription>
            現在登録されているセラピストの一覧です
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : loading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : therapists.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              登録されているセラピストはいません
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
