import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
}

const StoreSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [storeDescription, setStoreDescription] = useState('');
  const [formData, setFormData] = useState<StoreSettings>({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('ユーザー情報が見つかりません');
          return;
        }
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }
        
        setProfile(profileData);
        
        // Fetch store data
        const { data: storeDataResult, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (storeError) {
          console.error('Store fetch error:', storeError);
          // If store doesn't exist yet, create a new record
          if (storeError.code === 'PGRST116') {
            const { data: newStore, error: createError } = await supabase
              .from('stores')
              .insert([{
                id: user.id,
                name: profileData?.name || '',
                email: profileData?.email || '',
                phone: profileData?.phone || '',
                address: profileData?.address || '',
                description: '',
              }])
              .select();
              
            if (createError) {
              console.error('Store creation error:', createError);
              throw createError;
            }
            
            setStoreData(newStore?.[0] || null);
            
            // Set form data from new store
            setFormData({
              name: newStore?.[0]?.name || profileData?.name || '',
              email: newStore?.[0]?.email || profileData?.email || '',
              phone: newStore?.[0]?.phone || profileData?.phone || '',
              address: newStore?.[0]?.address || profileData?.address || '',
              description: newStore?.[0]?.description || '',
            });
            
            setStoreDescription(newStore?.[0]?.description || '');
          } else {
            throw storeError;
          }
        } else {
          setStoreData(storeDataResult);
          
          // Set form data from existing store
          setFormData({
            name: storeDataResult?.name || profileData?.name || '',
            email: storeDataResult?.email || profileData?.email || '',
            phone: storeDataResult?.phone || profileData?.phone || '',
            address: storeDataResult?.address || profileData?.address || '',
            description: storeDataResult?.description || '',
          });
          
          setStoreDescription(storeDataResult?.description || '');
        }
      } catch (error: any) {
        console.error('Error fetching store data:', error);
        toast.error(`データの取得に失敗しました: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('ユーザー情報が見つかりません');
        return;
      }
      
      console.log('Saving store settings:', formData);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      // Check if store exists
      const { data: existingStore, error: checkError } = await supabase
        .from('stores')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Store check error:', checkError);
        throw checkError;
      }
      
      let storeOp;
      if (!existingStore) {
        // Insert if doesn't exist
        storeOp = supabase
          .from('stores')
          .insert([{
            id: user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            description: storeDescription,
          }]);
      } else {
        // Update if exists
        storeOp = supabase
          .from('stores')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            description: storeDescription,
          })
          .eq('id', user.id);
      }
      
      const { error: storeError } = await storeOp;
      
      if (storeError) {
        console.error('Store update error:', storeError);
        throw storeError;
      }
      
      // Update local state
      setProfile({
        ...profile,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      
      setStoreData({
        ...storeData,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: storeDescription,
      });
      
      toast.success('設定が保存されました');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`設定の保存に失敗しました: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">店舗設定</h1>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>店舗の基本情報を設定します</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">店舗名</Label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="店舗名を入力"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="メールアドレスを入力"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input 
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="電話番号を入力"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">住所</Label>
                <Input 
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="住所を入力"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">店舗説明</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="店舗の説明を入力"
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? '保存中...' : '設定を保存'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StoreSettings;
