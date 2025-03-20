import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  RefreshCw,
  UserPlus,
  Repeat,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// サンプルデータ
const initialTherapistsData = [
  {
    id: 1,
    name: '佐藤 愛',
    type: '正社員',
    specialties: ['アロマオイルマッサージ', 'タイ古式マッサージ'],
    status: 'アクティブ',
    bookings: 45,
    newClients: 12,
    repeatClients: 33
  },
  {
    id: 2,
    name: '田中 健',
    type: 'パート',
    specialties: ['ディープティシュー', 'ストレッチ'],
    status: 'アクティブ',
    bookings: 32,
    newClients: 8,
    repeatClients: 24
  },
  {
    id: 3,
    name: '鈴木 美優',
    type: '正社員',
    specialties: ['ホットストーンマッサージ', 'フットマッサージ'],
    status: '休暇中',
    bookings: 28,
    newClients: 5,
    repeatClients: 23
  },
  {
    id: 4,
    name: '高橋 誠',
    type: 'パート',
    specialties: ['アロマオイルマッサージ', 'ヘッドマッサージ'],
    status: 'アクティブ',
    bookings: 18,
    newClients: 10,
    repeatClients: 8
  },
  {
    id: 5,
    name: '渡辺 さくら',
    type: '研修中',
    specialties: ['アロマオイルマッサージ'],
    status: '研修中',
    bookings: 5,
    newClients: 5,
    repeatClients: 0
  }
];

const StoreTherapists = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [therapists, setTherapists] = useState(initialTherapistsData);
  const [filteredTherapists, setFilteredTherapists] = useState(initialTherapistsData);
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [therapistDetails, setTherapistDetails] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Fetch store ID for generating invite link
  useEffect(() => {
    const fetchStoreId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Generate invite link using store ID
        setInviteLink(`${window.location.origin}/therapist-signup?store=${user.id}`);
      }
    };
    
    fetchStoreId();
  }, []);
  
  // Reset linkCopied state when dialog is closed
  useEffect(() => {
    if (!isInviteOpen) {
      setLinkCopied(false);
    }
  }, [isInviteOpen]);

  // Real-time status simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update a therapist's status to simulate real-time updates
      const randomIndex = Math.floor(Math.random() * therapists.length);
      const statuses = ['アクティブ', '休憩中', '施術中', '休暇中'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setTherapists(prevTherapists => {
        const updatedTherapists = [...prevTherapists];
        updatedTherapists[randomIndex] = {
          ...updatedTherapists[randomIndex],
          status: randomStatus
        };
        return updatedTherapists;
      });
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [therapists]);
  
  // Update filtered therapists when therapists or search query changes
  useEffect(() => {
    handleSearch();
  }, [therapists, searchQuery]);
  
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredTherapists(therapists);
      return;
    }
    
    const filtered = therapists.filter(
      therapist => 
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredTherapists(filtered);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    toast.success("招待リンクをコピーしました", {
      description: "招待リンクをセラピスト候補に共有してください"
    });
  };

  const updateTherapistStatus = (therapistId: number, newStatus: string) => {
    setTherapists(prevTherapists => 
      prevTherapists.map(therapist => 
        therapist.id === therapistId 
          ? { ...therapist, status: newStatus } 
          : therapist
      )
    );
    
    toast({
      title: "ステータスを更新しました",
      description: `セラピストのステータスを「${newStatus}」に変更しました。`,
    });
  };
  
  const viewTherapistDetails = (therapist: any) => {
    setTherapistDetails(therapist);
    setIsDetailsModalOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'アクティブ':
        return 'bg-green-100 text-green-800';
      case '施術中':
        return 'bg-blue-100 text-blue-800';
      case '休憩中':
        return 'bg-amber-100 text-amber-800';
      case '休暇中':
        return 'bg-gray-100 text-gray-800';
      case '研修中':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">セラピスト管理</h1>
          <p className="text-muted-foreground mt-2">セラピストの登録・管理</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                セラピスト招待
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>セラピスト招待</DialogTitle>
                <DialogDescription>
                  以下の招待リンクを共有して、新しいセラピストを招待できます。
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    readOnly 
                    value={inviteLink} 
                    className="flex-1"
                  />
                  <Button onClick={copyInviteLink} variant={linkCopied ? "outline" : "default"}>
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {linkCopied && (
                  <div className="bg-green-50 text-green-800 px-4 py-2 rounded-md text-sm">
                    招待リンクがコピーされました！
                  </div>
                )}
              </div>
              <DialogFooter className="mt-6">
                <Button onClick={() => setIsInviteOpen(false)}>閉じる</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全て</TabsTrigger>
          <TabsTrigger value="active">アクティブ</TabsTrigger>
          <TabsTrigger value="onbreak">休憩中</TabsTrigger>
          <TabsTrigger value="treatment">施術中</TabsTrigger>
          <TabsTrigger value="vacation">休暇中</TabsTrigger>
          <TabsTrigger value="training">研修中</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>セラピスト一覧</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="名前や専門で検索"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>
                現在登録されているセラピストの一覧です。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>雇用形態</TableHead>
                    <TableHead>専門</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">予約</TableHead>
                    <TableHead className="text-right">新規/リピート</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTherapists.map((therapist) => (
                    <TableRow key={therapist.id}>
                      <TableCell className="font-medium">{therapist.name}</TableCell>
                      <TableCell>{therapist.type}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {therapist.specialties.map((specialty, index) => (
                            <span 
                              key={index}
                              className="inline-flex text-xs bg-secondary px-2 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          getStatusBadgeColor(therapist.status)
                        }`}>
                          {therapist.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{therapist.bookings}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span title="新規客" className="inline-flex items-center text-xs">
                            <UserPlus className="h-3.5 w-3.5 mr-1 text-blue-500" />
                            {therapist.newClients}
                          </span>
                          <span>/</span>
                          <span title="リピート客" className="inline-flex items-center text-xs">
                            <Repeat className="h-3.5 w-3.5 mr-1 text-green-500" />
                            {therapist.repeatClients}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>アクション</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => viewTherapistDetails(therapist)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>プロフィールを見る</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>編集する</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>予約状況を確認</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>ステータス変更</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={therapist.status}>
                              <DropdownMenuRadioItem 
                                value="アクティブ"
                                onClick={() => updateTherapistStatus(therapist.id, "アクティブ")}
                              >
                                アクティブ
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem 
                                value="施術中"
                                onClick={() => updateTherapistStatus(therapist.id, "施術中")}
                              >
                                施術中
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem 
                                value="休憩中"
                                onClick={() => updateTherapistStatus(therapist.id, "休憩中")}
                              >
                                休憩中
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem 
                                value="休暇中"
                                onClick={() => updateTherapistStatus(therapist.id, "休暇中")}
                              >
                                休暇中
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem 
                                value="研修中"
                                onClick={() => updateTherapistStatus(therapist.id, "研修中")}
                              >
                                研修中
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>削除する</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {/* アクティブのセラピスト向けのコンテンツ */}
        </TabsContent>
        
        <TabsContent value="onbreak" className="space-y-4">
          {/* 休憩中のセラピスト向けのコンテンツ */}
        </TabsContent>
        
        <TabsContent value="treatment" className="space-y-4">
          {/* 施術中のセラピスト向けのコンテンツ */}
        </TabsContent>
        
        <TabsContent value="vacation" className="space-y-4">
          {/* 休暇中のセラピスト向けのコンテンツ */}
        </TabsContent>
        
        <TabsContent value="training" className="space-y-4">
          {/* 研修中のセラピスト向けのコンテンツ */}
        </TabsContent>
      </Tabs>
      
      {/* セラピスト応募リスト */}
      <Card>
        <CardHeader>
          <CardTitle>セラピスト応募</CardTitle>
          <CardDescription>
            招待リンク経由の応募申請を管理します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">現在、新しい応募はありません。</p>
            <Button variant="outline" onClick={() => setIsInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              招待リンクを共有する
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Therapist Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          {therapistDetails && (
            <>
              <DialogHeader>
                <DialogTitle>セラピスト詳細</DialogTitle>
                <DialogDescription>
                  {therapistDetails.name}のプロフィール情報
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-semibold">{therapistDetails.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{therapistDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{therapistDetails.type}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge className={getStatusBadgeColor(therapistDetails.status)}>
                        {therapistDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">専門</h4>
                    <div className="flex flex-wrap gap-1">
                      {therapistDetails.specialties.map((specialty: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">予約数</h4>
                      <p className="text-2xl font-semibold">{therapistDetails.bookings}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        <span className="inline-flex items-center">
                          <UserPlus className="h-4 w-4 mr-1 text-blue-500" />
                          新規客
                        </span>
                      </h4>
                      <p className="text-2xl font-semibold">{therapistDetails.newClients}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        <span className="inline-flex items-center">
                          <Repeat className="h-4 w-4 mr-1 text-green-500" />
                          リピート
                        </span>
                      </h4>
                      <p className="text-2xl font-semibold">{therapistDetails.repeatClients}</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>閉じる</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreTherapists;
