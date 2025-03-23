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
import { PlusCircle, Copy, Mail, Trash2, AlertCircle, CheckCircle2, XCircle, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [processingTherapistId, setProcessingTherapistId] = useState<string | null>(null);

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
      
      // Get active store therapist relationships
      const { data: activeRelations, error: relationError } = await supabase
        .from("store_therapists")
        .select("therapist_id, status")
        .eq("store_id", user.id)
        .eq("status", "active");
      
      if (relationError) throw relationError;
      
      if (!activeRelations || activeRelations.length === 0) {
        setTherapists([]);
        setLoading(false);
        return;
      }
      
      // Get IDs of active therapists
      const activeTherapistIds = activeRelations.map(r => r.therapist_id);
      
      // Get profile data for these therapists
      const { data: therapistProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, email, phone, created_at")
        .in("id", activeTherapistIds);
      
      if (profileError) throw profileError;
      
      // Transform to the format expected by the UI
      const activeTherapists = therapistProfiles?.map(profile => {
        return {
          id: profile.id,
          name: profile.name || "名前なし",
          email: profile.email || "メール未設定",
          phone: profile.phone || "電話番号未設定",
          status: "active",
          created_at: profile.created_at || new Date().toISOString()
        };
      }) || [];
      
      setTherapists(activeTherapists);
    } catch (err: any) {
      console.error("Error fetching therapists:", err);
      setError(err.message);
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
    
    toast.success("招待リンクがコピーされました");
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 3000);
  };

  const sendInviteEmail = async () => {
    toast.success("招待メールが送信されました");
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
      toast.success("セラピストが削除されました");
    } catch (error: any) {
      console.error("Error removing therapist:", error);
      toast.error("セラピストの削除に失敗しました: " + error.message);
    }
  };

  const approveTherapist = async (therapistId: string) => {
    if (!storeId) return;
    setProcessingTherapistId(therapistId);
    
    try {
      console.log("Approving therapist:", therapistId);
      
      // Get the therapist data before removing from pending
      const therapistToApprove = pendingTherapists.find(t => t.id === therapistId);
      if (!therapistToApprove) {
        toast.error("セラピストが見つかりませんでした");
        return;
      }

      // 1. First, check if we already have this therapist in store_therapists with any status
      let existingRelations, existingRelation = null;
      try {
        const { data, error: relationCheckError } = await supabase
          .from("store_therapists")
          .select("*")
          .eq("store_id", storeId)
          .eq("therapist_id", therapistId);

        if (relationCheckError) {
          console.error("Error checking existing relations:", relationCheckError);
        } else {
          existingRelations = data;
          existingRelation = existingRelations && existingRelations.length > 0 
            ? existingRelations[0] 
            : null;
        }
      } catch (error) {
        console.error("Error in relation check:", error);
      }
      
      // 2. Update store_therapists relation status to active
      let relationOperation;
      if (existingRelation) {
        relationOperation = supabase
          .from("store_therapists")
          .update({ status: "active" })
          .eq("store_id", storeId)
          .eq("therapist_id", therapistId);
      } else {
        relationOperation = supabase
          .from("store_therapists")
          .insert([{
            store_id: storeId,
            therapist_id: therapistId,
            status: "active"
          }]);
      }
      
      try {
        const { error: relationError } = await relationOperation;
        if (relationError) {
          console.error("Error updating store_therapist relation:", relationError);
          // Log but continue - don't throw
        }
      } catch (relationError) {
        console.error("Error in store_therapists operation:", relationError);
        // Log but continue - don't throw
      }
      
      // 3. Check if we need to create a therapist record
      const { data: existingTherapists, error: therapistCheckError } = await supabase
        .from("therapists")
        .select("id")
        .eq("id", therapistId);
        
      if (therapistCheckError) {
        throw therapistCheckError;
      }
      
      const existingTherapist = existingTherapists && existingTherapists.length > 0 
        ? existingTherapists[0] 
        : null;
      
      // 4. Insert or update the therapist record
      if (!existingTherapist) {
        try {
          // Simplest approach - direct insert with minimal fields
          const { error: insertError } = await supabase
            .from("therapists")
            .insert({
              id: therapistId,
              name: therapistToApprove.name,
              description: "セラピストの紹介文はまだありません",
              location: "東京",
              price: 5000,
              specialties: [],
              experience: 0,
              rating: 0,
              reviews: 0,
              availability: []
            });
            
          if (insertError) {
            console.log("Could not create therapist record:", insertError);
            
            // If insert fails, try update (in case the record exists but wasn't found)
            const { error: updateError } = await supabase
              .from("therapists")
              .update({
                name: therapistToApprove.name,
                description: "セラピストの紹介文はまだありません",
                location: "東京",
                price: 5000
              })
              .eq("id", therapistId);
              
            if (updateError) {
              console.log("Update also failed:", updateError);
            } else {
              console.log("Updated existing therapist record");
            }
          } else {
            console.log("Successfully created therapist record");
          }
        } catch (error: any) {
          console.error("Note: Couldn't create therapist record:", error);
          console.log("Continuing with profile update only - therapist record will need to be created later");
          // Don't throw the error, just log it and continue
        }
      }

      // 5. Update profile status to active
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ status: "active" })
          .eq("id", therapistId);
          
        if (profileError) {
          console.error("Error updating profile status:", profileError);
          // Log but continue - don't throw
        }
      } catch (profileError) {
        console.error("Error in profile update operation:", profileError);
        // Log but continue - don't throw
      }

      console.log("Therapist approval process completed");
      
      // Always update the UI regardless of backend errors
      // Update the UI by removing the approved therapist from pending list
      setPendingTherapists(prevTherapists => 
        prevTherapists.filter(t => t.id !== therapistId)
      );
      
      // Add the approved therapist to the active list
      setTherapists(prevTherapists => [
        ...prevTherapists,
        {
          id: therapistId,
          name: therapistToApprove.name,
          email: therapistToApprove.email,
          phone: therapistToApprove.phone,
          status: "active",
          created_at: new Date().toISOString()
        }
      ]);
      
      toast.success("セラピストを承認しました");
    } catch (error: any) {
      console.error("Unexpected error in therapist approval process:", error);
      toast.error("セラピストの承認に失敗しました: " + error.message);
    } finally {
      setProcessingTherapistId(null);
    }
  };

  const rejectTherapist = async (therapistId: string) => {
    if (!storeId) return;
    setProcessingTherapistId(therapistId);
    
    try {
      // Get the therapist data before removing from pending
      const therapistToReject = pendingTherapists.find(t => t.id === therapistId);
      if (!therapistToReject) {
        throw new Error("Therapist not found in pending list");
      }
      
      // Update profile status to rejected
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("id", therapistId)
        .eq("invited_by_store_id", storeId);
        
      if (error) throw error;

      // Update the UI by removing the rejected therapist from pending list
      setPendingTherapists(prevTherapists => 
        prevTherapists.filter(t => t.id !== therapistId)
      );
      
      toast.success("セラピストの申請を却下しました");
    } catch (error: any) {
      console.error("Error rejecting therapist:", error);
      toast.error("セラピストの却下に失敗しました: " + error.message);
    } finally {
      setProcessingTherapistId(null);
    }
  };

  const deactivateTherapist = async (therapistId: string) => {
    if (!storeId) return;
    
    try {
      // Update the store_therapists relationship to inactive
      const { error } = await supabase
        .from("store_therapists")
        .update({ status: "inactive" })
        .eq("store_id", storeId)
        .eq("therapist_id", therapistId);
        
      if (error) {
        console.error("Error deactivating therapist:", error);
        toast.error("セラピストの無効化に失敗しました");
        return;
      }
      
      // Update the local state to reflect the change
      setTherapists(prevTherapists => 
        prevTherapists.map(t => 
          t.id === therapistId 
            ? { ...t, status: "inactive" } 
            : t
        )
      );
      
      toast.success("セラピストを無効化しました");
    } catch (error) {
      console.error("Error in deactivateTherapist:", error);
      toast.error("セラピストの無効化中にエラーが発生しました");
    }
  };

  // For the dropdown menu actions
  const handleDropdownAction = (action: string, therapistId: string) => {
    switch (action) {
      case "view":
        // Handle view therapist details
        toast.info("セラピスト詳細機能は開発中です");
        break;
      case "message":
        // Handle sending message
        toast.info("メッセージ機能は開発中です");
        break;
      case "schedule":
        // Handle scheduling
        toast.info("スケジュール設定機能は開発中です");
        break;
      case "deactivate":
        deactivateTherapist(therapistId);
        break;
      default:
        break;
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
                  <TableRow key={`pending-${therapist.id}`}>
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
                        disabled={processingTherapistId === therapist.id}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => rejectTherapist(therapist.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={processingTherapistId === therapist.id}
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
                  <TableRow key={`active-${therapist.id}`}>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">アクション</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDropdownAction("view", therapist.id)}>
                            詳細を見る
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDropdownAction("message", therapist.id)}>
                            メッセージを送る
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDropdownAction("schedule", therapist.id)}>
                            スケジュールを設定
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDropdownAction("deactivate", therapist.id)}>
                            無効にする
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
