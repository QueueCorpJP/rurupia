import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simple TherapistNavigation component
const TherapistNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      title: 'ダッシュボード',
      href: '/therapist-dashboard',
    },
    {
      title: 'プロフィール編集',
      href: '/therapist-profile',
    },
    {
      title: '予約管理',
      href: '/therapist-bookings',
    },
    {
      title: 'メッセージ',
      href: '/therapist-messages',
    },
    {
      title: '記事管理',
      href: '/therapist-posts',
    },
    {
      title: '設定',
      href: '/therapist-settings',
    }
  ];
  
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link key={item.href} to={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              location.pathname === item.href && "bg-muted hover:bg-muted"
            )}
          >
            <span>{item.title}</span>
          </Button>
        </Link>
      ))}
    </nav>
  );
};

interface ProfileFormData {
  name: string;
  description: string;
  location: string;
  price: number | null;
  specialties: string[];
  experience: number;
  long_description: string | null;
  image_url: string | null;
  qualifications: string[];
}

const TherapistProfile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    description: '',
    location: '',
    price: null,
    specialties: [],
    experience: 0,
    long_description: null,
    image_url: null,
    qualifications: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/therapist-login');
        return;
      }
      setTherapistId(user.id);
      
      try {
        // Fetch therapist data
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            location: data.location || '',
            price: data.price || null,
            specialties: data.specialties || [],
            experience: data.experience || 0,
            long_description: data.long_description || null,
            image_url: data.image_url || null,
            qualifications: data.qualifications || [],
          });
        }
      } catch (error) {
        console.error('Error fetching therapist profile:', error);
        toast.error('プロフィール情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'experience') {
      setFormData({ ...formData, [name]: Number(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSpecialtiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const specialtiesArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData({ ...formData, specialties: specialtiesArray });
  };

  const handleQualificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qualificationsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData({ ...formData, qualifications: qualificationsArray });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('therapist-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('therapist-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const saveProfile = async () => {
    if (!therapistId) return;
    
    try {
      setSaving(true);
      setUploading(profileImageFile !== null);
      
      let imageUrl = formData.image_url;

      // Upload profile image if changed
      if (profileImageFile) {
        imageUrl = await uploadFile(profileImageFile, `profile/${therapistId}`);
        setUploading(false);
      }
      
      const { error } = await supabase
        .from('therapists')
        .update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          price: formData.price,
          specialties: formData.specialties,
          experience: formData.experience,
          long_description: formData.long_description,
          image_url: imageUrl,
          qualifications: formData.qualifications,
        })
        .eq('id', therapistId);
        
      if (error) throw error;
      
      // Clear selected file after successful upload
      setProfileImageFile(null);
      
      // Update form data with new URL
      setFormData({
        ...formData,
        image_url: imageUrl,
      });
      
      toast.success('プロフィールを更新しました');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <p className="text-center">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <TherapistNavigation />
        </div>
        
        <div className="w-full md:w-3/4">
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="media">プロフィール画像</TabsTrigger>
              <TabsTrigger value="details">詳細情報</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>基本プロフィール</CardTitle>
                  <CardDescription>
                    基本的なプロフィール情報を更新します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">名前</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="あなたの名前"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">紹介文（短い）</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="あなたのサービスの簡単な説明"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="location">場所</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="施術を行う場所"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="price">料金（円）</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      placeholder="基本料金"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={saveProfile} 
                    disabled={saving}
                    className="ml-auto"
                  >
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>プロフィール画像</CardTitle>
                  <CardDescription>
                    プロフィール画像を更新できます
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>プロフィール画像</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-24 h-24">
                        {formData.image_url ? (
                          <AvatarImage src={formData.image_url} />
                        ) : (
                          <AvatarFallback>
                            {formData.name ? formData.name.charAt(0).toUpperCase() : 'T'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          JPEG、PNG、GIF形式の画像をアップロードしてください
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={saveProfile} 
                    disabled={saving || uploading}
                    className="ml-auto"
                  >
                    {uploading ? 'アップロード中...' : saving ? '保存中...' : '保存'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>詳細情報</CardTitle>
                  <CardDescription>
                    詳細な紹介文や専門分野などの情報を更新します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="long_description">詳細な紹介</Label>
                    <Textarea
                      id="long_description"
                      name="long_description"
                      value={formData.long_description || ''}
                      onChange={handleInputChange}
                      placeholder="あなたのサービス、経験、得意分野などについて詳しく説明してください"
                      rows={5}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="experience">経験年数</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="セラピストとしての経験年数"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="specialties">専門分野（カンマ区切り）</Label>
                    <Input
                      id="specialties"
                      name="specialties"
                      value={formData.specialties.join(', ')}
                      onChange={handleSpecialtiesChange}
                      placeholder="専門分野をカンマで区切って入力してください"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="qualifications">資格（カンマ区切り）</Label>
                    <Input
                      id="qualifications"
                      name="qualifications"
                      value={formData.qualifications.join(', ')}
                      onChange={handleQualificationsChange}
                      placeholder="お持ちの資格をカンマで区切って入力してください"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={saveProfile} 
                    disabled={saving}
                    className="ml-auto"
                  >
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfile; 