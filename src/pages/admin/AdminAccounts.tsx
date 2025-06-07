import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { PlusCircle, Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// User account type mapping in Japanese
const USER_TYPE_MAP = {
  therapist: "セラピスト",
  client: "クライアント",
  store: "店舗",
  admin: "管理者",
  customer: "お客様"
};

interface FormattedAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_type: string;
  status: string;
  created_at: string;
  is_verified: boolean;
  verification_document: string;
  storeName?: string; // For stores - the actual store name
  ownerName?: string; // For stores - the owner/responsible person name
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<FormattedAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<FormattedAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<FormattedAccount | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAdminAuthenticated, initializeAdminSession } = useAdminAuth();
  
  // New state variables for status change dialog
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [userToChangeStatus, setUserToChangeStatus] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  
  // New state variables for new account creation
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [newAccountData, setNewAccountData] = useState({
    // Required fields
    name: '',
    email: '',
    password: '',
    userType: 'customer',
    
    // Optional profile fields
    nickname: '',
    phone: '',
    address: '',
    age: '',
    hobbies: [],
    mbti: '',
    lineId: '',
    
    // Therapist-specific fields (only shown when userType is therapist)
    specialties: [],
    experience: '',
    location: '',
    price: '',
    description: '',
    longDescription: '',
    qualifications: [],
    height: '',
    weight: '',
    detailedArea: '',
    serviceStyle: [],
    facialFeatures: '',
    bodyType: [],
    personalityTraits: [],
    workingDays: [],
    
    // Settings
    isVerified: false,
    status: 'active'
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAccounts();
    }
  }, [isAdminAuthenticated]);

  const fetchAccounts = async () => {
    try {
      const response = await supabaseAdmin
        .from('profiles')
        .select('*')
        .neq('user_type', 'store') // Exclude stores from accounts tab
        .order('created_at', { ascending: false });
      
      const { data, error } = response;

      if (error) throw error;

      // Get store data for store users
      const storeUserIds = data.filter(account => account.user_type === 'store').map(account => account.id);
      let storeData: any[] = [];
      
      if (storeUserIds.length > 0) {
        const { data: stores, error: storeError } = await supabaseAdmin
          .from('stores')
          .select('id, name')
          .in('id', storeUserIds);
          
        if (!storeError && stores) {
          storeData = stores;
        }
      }

      const formattedAccounts: FormattedAccount[] = data.map((account) => {
        // For stores, use store name instead of owner name
        let displayName = account.nickname || account.name || 'N/A';
        if (account.user_type === 'store') {
          const store = storeData.find(s => s.id === account.id);
          displayName = store?.name || account.name || 'N/A';
        }

        return {
          id: account.id,
          name: displayName,
          email: account.email || 'N/A',
          phone: account.phone || 'N/A',
          address: account.address || 'N/A',
          user_type: account.user_type || 'user',
          status: account.status || 'active',
          created_at: new Date(account.created_at).toLocaleDateString(),
          is_verified: account.is_verified || false,
          verification_document: account.verification_document || '',
          // For stores, keep store name and owner name separate
          storeName: account.user_type === 'store' ? (storeData.find(s => s.id === account.id)?.name || account.name || 'N/A') : undefined,
          ownerName: account.user_type === 'store' ? (account.nickname || account.name || 'N/A') : undefined,
        };
      });

      setAccounts(formattedAccounts);
      setFilteredAccounts(formattedAccounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('アカウントの取得に失敗しました');
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    const filtered = accounts.filter((account) =>
      Object.values(account).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredAccounts(filtered);
  };

  const handleSortChange = (value: string) => {
    const [column, direction] = value.split(':');
    
    // Special handling for verification status filter
    if (column === 'verification_status') {
      let filtered;
      switch (direction) {
        case 'pending':
          filtered = accounts.filter(account => 
            !account.is_verified && account.verification_document && account.status === 'pending'
          );
          break;
        case 'verified':
          filtered = accounts.filter(account => account.is_verified);
          break;
        case 'rejected':
          filtered = accounts.filter(account => account.status === 'rejected');
          break;
        case 'all':
          filtered = accounts;
          break;
        default:
          filtered = accounts;
      }
      setFilteredAccounts(filtered);
      return;
    }
    
    // Special handling for user type filter
    if (column === 'user_type_filter') {
      const filtered = accounts.filter(account => account.user_type === direction);
      setFilteredAccounts(filtered);
      return;
    }
    
    // Regular column sorting
    const sorted = [...filteredAccounts].sort((a: any, b: any) => {
      if (direction === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      }
      return a[column] < b[column] ? 1 : -1;
    });
    setFilteredAccounts(sorted);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      let statusMessage = '';
      switch(newStatus) {
        case 'active':
          statusMessage = 'アクティブ';
          break;
        case 'inactive':
          statusMessage = '無効';
          break;
        case 'pending':
          statusMessage = '認証待ち';
          break;
        case 'rejected':
          statusMessage = 'バン';
          break;
        default:
          statusMessage = newStatus;
      }

      toast.success(`ステータスを${statusMessage}に更新しました`);
      fetchAccounts();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('ステータスの更新に失敗しました');
    }
  };

  // New function to open the status change dialog
  const openStatusDialog = (userId: string, currentStatus: string) => {
    setUserToChangeStatus(userId);
    setSelectedStatus(currentStatus);
    setShowStatusDialog(true);
  };

  // New function to confirm status change
  const confirmStatusChange = () => {
    if (userToChangeStatus && selectedStatus) {
      handleStatusChange(userToChangeStatus, selectedStatus);
      setShowStatusDialog(false);
    }
  };

  // New function to handle account creation
  const handleCreateAccount = async () => {
    if (!newAccountData.name || !newAccountData.email || !newAccountData.password) {
      toast.error('すべての必須フィールドを入力してください');
      return;
    }

    try {
      setIsCreatingAccount(true);
      
      // Create the user account using Supabase Admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: newAccountData.email,
        password: newAccountData.password,
        email_confirm: true,
        user_metadata: {
          name: newAccountData.name
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error(`アカウント作成エラー: ${authError.message}`);
        return;
      }

      // Update the profile with all provided data
      const profileData: any = {
        name: newAccountData.name,
        nickname: newAccountData.nickname || null,
        phone: newAccountData.phone || null,
        address: newAccountData.address || null,
        age: newAccountData.age || null,
        mbti: newAccountData.mbti || null,
        line_id: newAccountData.lineId || null,
        user_type: newAccountData.userType,
        status: newAccountData.status,
        is_verified: newAccountData.isVerified
      };

      // Add hobbies if provided
      if (newAccountData.hobbies.length > 0) {
        profileData.hobbies = newAccountData.hobbies;
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileData)
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast.error(`プロフィール更新エラー: ${profileError.message}`);
        return;
      }

      // If user type is therapist, create therapist record
      if (newAccountData.userType === 'therapist') {
        const therapistData: any = {
          id: authData.user.id,
          name: newAccountData.name,
          experience: parseInt(newAccountData.experience) || 0,
          location: newAccountData.location || '',
          price: parseInt(newAccountData.price) || null,
          description: newAccountData.description || '',
          long_description: newAccountData.longDescription || null,
          height: newAccountData.height || null,
          weight: parseInt(newAccountData.weight) || null,
          detailed_area: newAccountData.detailedArea || '',
          facial_features: newAccountData.facialFeatures || '',
          specialties: newAccountData.specialties,
          qualifications: newAccountData.qualifications,
          service_style: newAccountData.serviceStyle,
          body_type: newAccountData.bodyType,
          personality_traits: newAccountData.personalityTraits,
          working_days: newAccountData.workingDays,
          hobbies: newAccountData.hobbies,
          rating: 0,
          reviews: 0,
          availability: []
        };

        const { error: therapistError } = await supabaseAdmin
          .from('therapists')
          .insert(therapistData);

        if (therapistError) {
          console.error('Therapist creation error:', therapistError);
          toast.error(`セラピスト情報の作成エラー: ${therapistError.message}`);
          return;
        }
      }

      toast.success('新しいアカウントが正常に作成されました');
      setShowNewAccountDialog(false);
      setNewAccountData({
        // Required fields
        name: '',
        email: '',
        password: '',
        userType: 'customer',
        
        // Optional profile fields
        nickname: '',
        phone: '',
        address: '',
        age: '',
        hobbies: [],
        mbti: '',
        lineId: '',
        
        // Therapist-specific fields
        specialties: [],
        experience: '',
        location: '',
        price: '',
        description: '',
        longDescription: '',
        qualifications: [],
        height: '',
        weight: '',
        detailedArea: '',
        serviceStyle: [],
        facialFeatures: '',
        bodyType: [],
        personalityTraits: [],
        workingDays: [],
        
        // Settings
        isVerified: false,
        status: 'active'
      });
      fetchAccounts(); // Refresh the accounts list
      
    } catch (error) {
      console.error('Account creation error:', error);
      toast.error('アカウント作成中にエラーが発生しました');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!window.confirm('このアカウントを削除してもよろしいですか？')) {
      return;
    }
    
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('アカウントを削除しました');
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('アカウントの削除に失敗しました');
    }
  };

  const openUserProfile = (user: FormattedAccount) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      accessorKey: 'id',
      render: (data: any) => {
        if (!data || !data.row) return null;
        return (
          <div className="max-w-[100px] truncate" title={data.row.id}>
            {data.row.id}
          </div>
        );
      },
    },
    {
      key: 'name',
      label: '名前',
      accessorKey: 'name',
    },
    {
      key: 'email',
      label: 'メールアドレス',
      accessorKey: 'email',
    },
    {
      key: 'user_type',
      label: 'ユーザータイプ',
      accessorKey: 'user_type',
      render: (data: any) => {
        if (!data || !data.row) return null;
        return USER_TYPE_MAP[data.row.user_type] || data.row.user_type;
      },
    },
    {
      key: 'created_at',
      label: '登録日',
      accessorKey: 'created_at',
    },
    {
      key: 'status',
      label: 'ステータス',
      accessorKey: 'status',
      render: (data: any) => {
        if (!data || !data.row) return null;
        return <StatusBadge status={data.row.status} />;
      },
    },
    {
      key: 'verification',
      label: '本人確認',
      accessorKey: 'is_verified',
      render: (data: any) => {
        if (!data || !data.row) return null;
        // Don't show verification for stores
        if (data.row.user_type === 'store') {
          return <span className="text-gray-400">-</span>;
        }
        return data.row.is_verified ? 
          <span className="text-green-600 font-medium">確認済み</span> : 
          data.row.verification_document ? 
            <span className="text-yellow-600 font-medium">未確認（書類あり）</span> : 
            <span className="text-gray-400">未提出</span>;
      },
    },
  ];

  const sortOptions = [
    // Verification status filters
    { label: '全てのユーザー', value: 'verification_status:all' },
    { label: '保留中の書類確認', value: 'verification_status:pending' },
    { label: '承認済みユーザー', value: 'verification_status:verified' },
    { label: '拒否されたユーザー', value: 'verification_status:rejected' },
    // User type filters
    { label: 'セラピストのみ', value: 'user_type_filter:therapist' },
    { label: '店舗のみ', value: 'user_type_filter:store' },
    { label: '管理者のみ', value: 'user_type_filter:admin' },
    { label: 'お客様のみ', value: 'user_type_filter:customer' },
    // Regular sorting options
    { label: '名前（昇順）', value: 'name:asc' },
    { label: '名前（降順）', value: 'name:desc' },
    { label: 'メールアドレス（昇順）', value: 'email:asc' },
    { label: 'メールアドレス（降順）', value: 'email:desc' },
    { label: '登録日（新しい順）', value: 'created_at:desc' },
    { label: '登録日（古い順）', value: 'created_at:asc' },
  ];

  const actionMenuItems = [
    {
      label: '詳細',
      onClick: (row: FormattedAccount) => openUserProfile(row),
    },
    {
      label: 'ステータスを変更',
      onClick: (row: FormattedAccount) => {
        openStatusDialog(row.id, row.status);
      },
    },
    {
      label: '削除',
      onClick: (row: FormattedAccount) => handleDeleteAccount(row.id),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">アカウント管理</h1>
        <p className="text-muted-foreground mt-2">ユーザーアカウントの管理と詳細情報の確認</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">全ユーザー: {filteredAccounts.length}</span>
        </div>
        <Button variant="default" onClick={() => setShowNewAccountDialog(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          新規アカウント
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredAccounts}
        searchPlaceholder="ユーザーを検索..."
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        actionMenuItems={actionMenuItems}
        isLoading={loading}
      />

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザープロフィール</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4">
              {/* Show store name and owner name for stores, just name for others */}
              {selectedUser.user_type === 'store' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>店舗名</Label>
                    <Input value={selectedUser.storeName || selectedUser.name} readOnly />
                  </div>
                  <div>
                    <Label>責任者</Label>
                    <Input value={selectedUser.ownerName || selectedUser.name} readOnly />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>名前</Label>
                    <Input value={selectedUser.name} readOnly />
                  </div>
                  <div>
                    <Label>メールアドレス</Label>
                    <Input value={selectedUser.email} readOnly />
                  </div>
                </div>
              )}
              
              {/* Email field for stores */}
              {selectedUser.user_type === 'store' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>メールアドレス</Label>
                    <Input value={selectedUser.email} readOnly />
                  </div>
                  <div></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>電話番号</Label>
                  <Input value={selectedUser.phone} readOnly />
                </div>
                <div>
                  <Label>住所</Label>
                  <Input value={selectedUser.address} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ユーザータイプ</Label>
                  <Input value={USER_TYPE_MAP[selectedUser.user_type] || selectedUser.user_type} readOnly />
                </div>
                <div>
                  <Label>ステータス</Label>
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>
              {/* Only show verification for non-store users */}
              {selectedUser.user_type !== 'store' && (
                <>
                  <div>
                    <Label>本人確認</Label>
                    <div className="mt-1">
                      {selectedUser.is_verified ? (
                        <span className="text-green-600">確認済み</span>
                      ) : (
                        selectedUser.verification_document ? (
                          <span className="text-yellow-600">未確認（書類あり）</span>
                        ) : (
                          <span className="text-gray-400">未提出</span>
                        )
                      )}
                    </div>
                  </div>
                  {selectedUser.verification_document && (
                    <div>
                      <Label>本人確認書類</Label>
                      <div className="mt-1">
                        <a
                          href={`/admin/verification/${selectedUser.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          書類を確認
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Dialog for Status Change */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ステータス変更</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">アクティブ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive">無効</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending">認証待ち</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected">バン</Label>
              </div>
            </RadioGroup>
            <div className="flex justify-end">
              <Button onClick={confirmStatusChange}>変更する</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Dialog for Account Creation */}
      <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規アカウント作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-lg font-semibold text-primary">必須情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-account-name">名前 *</Label>
                  <Input
                    id="new-account-name"
                    value={newAccountData.name}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ユーザー名を入力"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-email">メールアドレス *</Label>
                  <Input
                    id="new-account-email"
                    type="email"
                    value={newAccountData.email}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-password">パスワード *</Label>
                  <Input
                    id="new-account-password"
                    type="password"
                    value={newAccountData.password}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="パスワードを入力"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-type">ユーザータイプ</Label>
                  <Select value={newAccountData.userType} onValueChange={(value) => setNewAccountData(prev => ({ ...prev, userType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="ユーザータイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">お客様</SelectItem>
                      <SelectItem value="therapist">セラピスト</SelectItem>
                      <SelectItem value="store">店舗</SelectItem>
                      <SelectItem value="admin">管理者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Optional Profile Fields Section */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-lg font-semibold text-primary">基本情報 (任意)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-account-nickname">ニックネーム</Label>
                  <Input
                    id="new-account-nickname"
                    value={newAccountData.nickname}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="ニックネームを入力"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-phone">電話番号</Label>
                  <Input
                    id="new-account-phone"
                    value={newAccountData.phone}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="090-1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-address">住所</Label>
                  <Input
                    id="new-account-address"
                    value={newAccountData.address}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="住所を入力"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-age">年齢</Label>
                  <Input
                    id="new-account-age"
                    value={newAccountData.age}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="年齢を入力"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-mbti">MBTI</Label>
                  <Input
                    id="new-account-mbti"
                    value={newAccountData.mbti}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, mbti: e.target.value }))}
                    placeholder="例: INFP"
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-line">LINE ID</Label>
                  <Input
                    id="new-account-line"
                    value={newAccountData.lineId}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, lineId: e.target.value }))}
                    placeholder="LINE IDを入力"
                  />
                </div>
              </div>
            </div>

            {/* Therapist-specific Fields Section */}
            {newAccountData.userType === 'therapist' && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-lg font-semibold text-primary">セラピスト専用情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-account-experience">経験年数</Label>
                    <Input
                      id="new-account-experience"
                      value={newAccountData.experience}
                      onChange={(e) => setNewAccountData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="例: 3年"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-account-location">勤務エリア</Label>
                    <Input
                      id="new-account-location"
                      value={newAccountData.location}
                      onChange={(e) => setNewAccountData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="例: 東京都"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-account-price">料金</Label>
                    <Input
                      id="new-account-price"
                      type="number"
                      value={newAccountData.price}
                      onChange={(e) => setNewAccountData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="例: 8000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-account-height">身長</Label>
                    <Input
                      id="new-account-height"
                      value={newAccountData.height}
                      onChange={(e) => setNewAccountData(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="例: 165cm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-account-weight">体重</Label>
                    <Input
                      id="new-account-weight"
                      type="number"
                      value={newAccountData.weight}
                      onChange={(e) => setNewAccountData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="例: 55"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-account-detailed-area">詳細エリア</Label>
                    <Input
                      id="new-account-detailed-area"
                      value={newAccountData.detailedArea}
                      onChange={(e) => setNewAccountData(prev => ({ ...prev, detailedArea: e.target.value }))}
                      placeholder="例: 渋谷区、新宿区"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-account-description">自己紹介</Label>
                  <Textarea
                    id="new-account-description"
                    value={newAccountData.description}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="自己紹介文を入力"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new-account-long-description">詳細説明</Label>
                  <Textarea
                    id="new-account-long-description"
                    value={newAccountData.longDescription}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, longDescription: e.target.value }))}
                    placeholder="詳細な説明を入力"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Account Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">アカウント設定</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-account-status">ステータス</Label>
                  <Select value={newAccountData.status} onValueChange={(value) => setNewAccountData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">アクティブ</SelectItem>
                      <SelectItem value="pending">認証待ち</SelectItem>
                      <SelectItem value="inactive">無効</SelectItem>
                      <SelectItem value="rejected">拒否</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="new-account-verified"
                    checked={newAccountData.isVerified}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="new-account-verified">認証済み</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewAccountDialog(false)} disabled={isCreatingAccount}>
                キャンセル
              </Button>
              <Button onClick={handleCreateAccount} disabled={isCreatingAccount}>
                {isCreatingAccount ? '作成中...' : 'アカウント作成'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
