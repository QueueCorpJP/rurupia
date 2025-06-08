import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getVerificationDocumentUrl, updateVerificationStatus, sendVerificationEmail } from '@/lib/supabase-utils';

// Status translation mapping - keep original Japanese statuses but remove English translations
const STATUS_TRANSLATIONS: Record<string, string> = {
  'active': 'アクティブ',
  'pending': '認証待ち',
  'rejected': '拒否済み', 
  'inactive': '無効',
  'banned': 'バン',
  'バン': 'バン',
  '認証待ち': '認証待ち',
  'アクティブ': 'アクティブ',
  '無効': '無効'
};

const translateStatus = (status: string) => {
  return STATUS_TRANSLATIONS[status] || status;
};

export default function VerificationDocument() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (!userId) {
      toast.error('ユーザーIDが指定されていません');
      navigate('/admin/accounts');
      return;
    }

    fetchDocumentAndUserDetails();
  }, [userId, navigate]);

  const fetchDocumentAndUserDetails = async () => {
    try {
      setLoading(true);
      
      // Use supabaseAdmin to ensure we can access data regardless of RLS policy
      const { data: userData, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }
      
      setUserDetails(userData);
      
      if (!userData.verification_document) {
        toast.error('このユーザーは身分証明書をアップロードしていません');
        return;
      }
      
      // Always use admin client to get the document URL
      const publicUrl = await getVerificationDocumentUrl(userData.verification_document, true);
      setDocumentUrl(publicUrl);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('書類の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      
      // Use our utility function to update verification status
      const { success, error } = await updateVerificationStatus(userId!, true, 'active');
      
      if (!success) throw error;

      // Send verification email
      if (userDetails?.email) {
        await sendVerificationEmail(
          userDetails.email, 
          userDetails.name || userDetails.nickname || 'ユーザー',
          true
        );
      }
      
      toast.success('ユーザーを承認し、通知メールを送信しました');
      navigate('/admin/accounts');
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('ユーザーの承認に失敗しました');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setRejecting(true);
      
      // Use our utility function to update verification status
      const { success, error } = await updateVerificationStatus(userId!, false, 'rejected');
      
      if (!success) throw error;

      // Send rejection email
      if (userDetails?.email) {
        await sendVerificationEmail(
          userDetails.email,
          userDetails.name || userDetails.nickname || 'ユーザー', 
          false
        );
      }
      
      toast.success('ユーザーを拒否し、通知メールを送信しました');
      navigate('/admin/accounts');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('ユーザーの拒否に失敗しました');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">書類確認</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/accounts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
      </div>
      
      {userDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ユーザー情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">名前:</p>
                <p>{userDetails.name || userDetails.nickname || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">メールアドレス:</p>
                <p>{userDetails.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">ユーザーID:</p>
                <p className="truncate">{userDetails.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">ステータス:</p>
                <p>{translateStatus(userDetails.status)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[400px] w-full" />
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ) : !documentUrl ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">書類が見つかりません</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 flex justify-center">
            <div className="max-w-3xl overflow-hidden">
              <img 
                src={documentUrl} 
                alt="身分証明書"
                className="max-w-full h-auto object-contain mb-4 border border-gray-200 rounded-md"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting || approving}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {rejecting ? '拒否中...' : '拒否'}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={rejecting || approving}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {approving ? '承認中...' : '承認'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 