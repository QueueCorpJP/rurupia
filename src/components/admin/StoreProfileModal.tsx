
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface StoreProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeData?: any;
}

export function StoreProfileModal({ open, onOpenChange, storeData }: StoreProfileModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  
  // Create form state if we have store data
  const [formData, setFormData] = useState({
    name: storeData?.name || '',
    email: storeData?.email || '',
    phone: storeData?.phone || '',
    address: storeData?.address || '',
    description: storeData?.description || '',
    status: storeData?.status || '確定',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };
  
  const handleSave = () => {
    toast({
      title: "保存完了",
      description: "店舗情報が更新されました。",
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">店舗プロフィール</DialogTitle>
          <DialogDescription>
            店舗情報の詳細を確認・編集できます
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="details">基本情報</TabsTrigger>
            <TabsTrigger value="services">サービス</TabsTrigger>
            <TabsTrigger value="staff">スタッフ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">店舗名</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="確定">確定</SelectItem>
                    <SelectItem value="承諾待ち">承諾待ち</SelectItem>
                    <SelectItem value="キャンセル">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                value={formData.email} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input 
                id="phone" 
                name="phone"
                type="tel" 
                value={formData.phone} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              <Input 
                id="address" 
                name="address"
                value={formData.address} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea 
                id="description" 
                name="description"
                rows={4} 
                value={formData.description} 
                onChange={handleInputChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="py-4">
            <div className="rounded-md border p-4 mb-4">
              <div className="font-medium mb-2">現在のサービス</div>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 border-b">
                  <div>
                    <div className="font-medium">スウェーディッシュマッサージ</div>
                    <div className="text-sm text-muted-foreground">60分 - ¥9,800</div>
                  </div>
                  <Button variant="outline" size="sm">編集</Button>
                </li>
                <li className="flex justify-between items-center p-2 border-b">
                  <div>
                    <div className="font-medium">アロマセラピー</div>
                    <div className="text-sm text-muted-foreground">90分 - ¥15,800</div>
                  </div>
                  <Button variant="outline" size="sm">編集</Button>
                </li>
                <li className="flex justify-between items-center p-2">
                  <div>
                    <div className="font-medium">ディープティシュー</div>
                    <div className="text-sm text-muted-foreground">75分 - ¥12,500</div>
                  </div>
                  <Button variant="outline" size="sm">編集</Button>
                </li>
              </ul>
            </div>
            
            <Button variant="outline" className="w-full">
              新しいサービスを追加
            </Button>
          </TabsContent>
          
          <TabsContent value="staff" className="py-4">
            <div className="rounded-md border p-4 mb-4">
              <div className="font-medium mb-2">セラピスト一覧</div>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 border-b">
                  <div>
                    <div className="font-medium">ユウ</div>
                    <div className="text-sm text-muted-foreground">0:00～6:00</div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    在籍中
                  </div>
                </li>
                <li className="flex justify-between items-center p-2 border-b">
                  <div>
                    <div className="font-medium">ラン</div>
                    <div className="text-sm text-muted-foreground">20:00～6:00</div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    在籍中
                  </div>
                </li>
                <li className="flex justify-between items-center p-2">
                  <div>
                    <div className="font-medium">よしひろ</div>
                    <div className="text-sm text-muted-foreground">22:00～8:00</div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    在籍中
                  </div>
                </li>
              </ul>
            </div>
            
            <Button variant="outline" className="w-full">
              新しいセラピストを追加
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
