
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Mail, MapPin, Calendar, ShieldCheck, ShieldX } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  type?: string;
  registered: string;
  status: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

interface UserProfileModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (userId: string, newStatus: string) => void;
}

export function UserProfileModal({ user, isOpen, onClose, onStatusChange }: UserProfileModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(user);
  const [status, setStatus] = useState(user?.status || '');

  // Reset state when user changes
  React.useEffect(() => {
    setUserData(user);
    setStatus(user?.status || '');
    setIsEditing(false);
  }, [user]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData) return;
    
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const saveChanges = () => {
    if (!userData) return;
    
    // Here you would typically make an API call to update the user
    if (onStatusChange && status !== user?.status) {
      onStatusChange(userData.id, status);
    }
    
    toast({
      title: "変更を保存しました",
      description: "ユーザー情報が更新されました",
    });
    
    setIsEditing(false);
  };

  if (!userData) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const statusOptions = [
    { value: 'アクティブ', label: 'アクティブ' },
    { value: 'バン済み', label: 'バン済み' },
    { value: '保留中', label: '保留中' },
    { value: '確認待ち', label: '確認待ち' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">ユーザー詳細</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Profile header with avatar */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {userData.avatar ? (
                <AvatarImage src={userData.avatar} alt={userData.name} />
              ) : (
                <AvatarFallback className="text-lg">{getInitials(userData.name)}</AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{userData.name}</h3>
              <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>ID: {userData.id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>登録日: {userData.registered}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* User information fields */}
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名前
              </Label>
              <div className="col-span-3">
                {isEditing ? (
                  <Input 
                    id="name" 
                    name="name" 
                    value={userData.name} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                    {userData.name}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                メール
              </Label>
              <div className="col-span-3">
                {isEditing ? (
                  <Input 
                    id="email" 
                    name="email" 
                    value={userData.email || ''} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {userData.email || '未設定'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                電話番号
              </Label>
              <div className="col-span-3">
                {isEditing ? (
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={userData.phone || ''} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {userData.phone || '未設定'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                住所
              </Label>
              <div className="col-span-3">
                {isEditing ? (
                  <Input 
                    id="address" 
                    name="address" 
                    value={userData.address || ''} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {userData.address || '未設定'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                ステータス
              </Label>
              <div className="col-span-3">
                {isEditing ? (
                  <Select 
                    value={status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                    {userData.status === 'アクティブ' ? (
                      <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <ShieldX className="mr-2 h-4 w-4 text-red-500" />
                    )}
                    {userData.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>キャンセル</Button>
              <Button onClick={saveChanges}>保存</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>閉じる</Button>
              <Button onClick={() => setIsEditing(true)}>編集</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
