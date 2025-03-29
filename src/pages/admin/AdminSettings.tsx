import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState('SerenitySage');
  const [maintenance, setMaintenance] = useState(false);
  const [language, setLanguage] = useState('ja');
  const [timezone, setTimezone] = useState('Asia/Tokyo');

  const handleSaveGeneral = () => {
    toast({
      title: "設定保存",
      description: "一般設定が保存されました",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "設定保存",
      description: "通知設定が保存されました",
    });
  };

  const handleSaveBackup = () => {
    toast({
      title: "バックアップ開始",
      description: "データのバックアップを開始しました",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground mt-2">システム全体の設定と構成</p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">一般</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="backup">バックアップ</TabsTrigger>
          <TabsTrigger value="system">システム情報</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>一般設定</CardTitle>
              <CardDescription>
                サイトの基本設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">サイト名</Label>
                <Input 
                  id="site-name" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">言語</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="言語を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">タイムゾーン</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="タイムゾーンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                    <SelectItem value="Australia/Sydney">Australia/Sydney (GMT+11)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="maintenance" 
                  checked={maintenance}
                  onCheckedChange={setMaintenance}
                />
                <Label htmlFor="maintenance">メンテナンスモード</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                管理者への通知設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="new-accounts" defaultChecked />
                <Label htmlFor="new-accounts">新規アカウント登録時に通知</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="new-requests" defaultChecked />
                <Label htmlFor="new-requests">新規店舗リクエスト時に通知</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="new-inquiries" defaultChecked />
                <Label htmlFor="new-inquiries">新規問い合わせ時に通知</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="system-errors" defaultChecked />
                <Label htmlFor="system-errors">システムエラー発生時に通知</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>保存</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>バックアップ</CardTitle>
              <CardDescription>
                データベースとシステム設定のバックアップを管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>自動バックアップ</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="頻度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">1時間ごと</SelectItem>
                    <SelectItem value="daily">毎日</SelectItem>
                    <SelectItem value="weekly">毎週</SelectItem>
                    <SelectItem value="monthly">毎月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>保存期間</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="保存期間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7日間</SelectItem>
                    <SelectItem value="30">30日間</SelectItem>
                    <SelectItem value="90">90日間</SelectItem>
                    <SelectItem value="365">1年間</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBackup}>今すぐバックアップ</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>システム情報</CardTitle>
              <CardDescription>
                現在のシステム状態と情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">システムバージョン</p>
                  <p>1.00</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">最終更新日</p>
                  <p>{new Date().toLocaleDateString('ja-JP')}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">データベースサイズ</p>
                  <p>2.5 GB</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">最終バックアップ</p>
                  <p>{new Date().toLocaleDateString('ja-JP')} 09:00</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">稼働時間</p>
                  <p>30日間</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">メモリ使用量</p>
                  <p>45%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
