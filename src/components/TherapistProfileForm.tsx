import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import MBTISelect from '@/components/MBTISelect';
import PrefectureSelect from '@/components/PrefectureSelect';

interface FormData {
  name: string;
  description: string;
  location: string;
  price: string | number;
  experience: string | number;
  qualifications: string;
  specialties: string;
  mbtiType: string;
  mood: string;
  therapistType: string;
  treatmentType: string;
  therapistAge: string;
  galleryImages?: string[];
}

const TherapistProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    price: '',
    experience: '',
    qualifications: '',
    specialties: '',
    mbtiType: '',
    mood: '',
    therapistType: '',
    treatmentType: '',
    therapistAge: '',
  });
  const [saving, setSaving] = useState(false);
  const [fileList, setFileList] = useState<File[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        fetchTherapistData(data.user.id);
      }
    };
    
    getUserId();
  }, []);

  const fetchTherapistData = async (userId: string) => {
    try {
      // First check if there's a therapist record for this user
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && !error.message.includes('No rows found')) {
        throw error;
      }
      
      if (data) {
        // Cast data to any to avoid TypeScript errors with the questionnaire_data field
        const therapistData = data as any;
        
        // Map data to form format
        setFormData({
          name: therapistData.name || '',
          description: therapistData.description || '',
          location: therapistData.location || '',
          price: therapistData.price || '',
          experience: therapistData.experience || '',
          qualifications: therapistData.qualifications ? therapistData.qualifications.join(', ') : '',
          specialties: therapistData.specialties ? therapistData.specialties.join(', ') : '',
          mbtiType: therapistData.mbti_type || '',
          mood: therapistData.questionnaire_data?.mood || '',
          therapistType: therapistData.questionnaire_data?.therapistType || '',
          treatmentType: therapistData.questionnaire_data?.treatmentType || '',
          therapistAge: therapistData.questionnaire_data?.therapistAge || '',
          galleryImages: therapistData.gallery_images || []
        });
      }
    } catch (error: any) {
      console.error('Error fetching therapist data:', error);
      toast.error(`データの取得に失敗しました: ${error.message}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileList = Array.from(files);
      setFileList(fileList);
    }
  };

  const uploadGalleryImages = async (files: File[]) => {
    if (!userId || files.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('therapists')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('therapists').getPublicUrl(filePath);
        if (data) {
          uploadedUrls.push(data.publicUrl);
        }
      }
      
      return uploadedUrls;
    } catch (error: any) {
      console.error('Error uploading gallery images:', error);
      toast.error(`画像のアップロードに失敗しました: ${error.message}`);
      return [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: value
    }));
  };

  const handleMBTIChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      mbtiType: value
    }));
  };

  const handleQuestionnaireChange = (question: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleUpload = () => {
    if (!fileList) return;

    const sendableFiles: File[] = [];
    fileList.forEach((file) => {
      sendableFiles.push(file);
    });

    // Start uploads in the background
    uploadGalleryImages(sendableFiles);
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("セッションが無効です。再度ログインしてください。");
      return;
    }

    setSaving(true);

    try {
      if (!formData.name || !formData.description) {
        throw new Error("名前と説明は必須です");
      }

      // Format qualification and specialty data
      const formattedQualifications = formData.qualifications
        ? formData.qualifications
            .split(",")
            .map((q) => q.trim())
            .filter(Boolean)
        : [];

      const formattedSpecialties = formData.specialties
        ? formData.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      // Parse numeric values
      const numericPrice = typeof formData.price === 'string' 
        ? parseInt(formData.price, 10) || 0 
        : formData.price || 0;
        
      const numericExperience = typeof formData.experience === 'string'
        ? parseInt(formData.experience, 10) || 0
        : formData.experience || 0;

      // Prepare the questionnaire data as a JSON object
      const questionnaireData = {
        mood: formData.mood || null,
        therapistType: formData.therapistType || null,
        treatmentType: formData.treatmentType || null,
        therapistAge: formData.therapistAge || null,
      };

      // Create the update data with proper types
      const updateData: Record<string, any> = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        price: numericPrice,
        experience: numericExperience,
        qualifications: formattedQualifications,
        specialties: formattedSpecialties,
        mbti_type: formData.mbtiType || null,
        questionnaire_data: questionnaireData,
      };
      
      // Add gallery images if they exist
      if (formData.galleryImages?.length) {
        updateData.gallery_images = formData.galleryImages;
      }

      // First check if the therapist record exists
      const { data: existingTherapist, error: checkError } = await supabase
        .from('therapists')
        .select('id')
        .eq('id', userId)
        .single();

      if (checkError && !checkError.message.includes('No rows found')) {
        throw checkError;
      }

      let result;
      
      if (!existingTherapist) {
        // Insert new record if it doesn't exist
        result = await supabase
          .from("therapists")
          .insert([{ 
            id: userId, 
            name: formData.name,
            description: formData.description,
            location: formData.location,
            price: numericPrice,
            experience: numericExperience,
            qualifications: formattedQualifications,
            specialties: formattedSpecialties,
            rating: 0,
            reviews: 0,
            availability: [],
            mbti_type: formData.mbtiType || null,
            questionnaire_data: questionnaireData,
          }]);
      } else {
        // Update existing record
        result = await supabase
          .from("therapists")
          .update(updateData)
          .eq("id", userId);
      }

      if (result.error) throw result.error;

      toast.success(`プロフィールが更新されました (${activeTab}タブ)`);
      
      // Debug log
      console.log("Updated therapist profile with data:", updateData);
      
      // Refresh the therapist data
      fetchTherapistData(userId);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(`プロフィールの更新に失敗しました: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="questionnaire">マッチング質問</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium mb-1">
                名前 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full"
                placeholder="セラピスト名"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="block text-sm font-medium mb-1">
                プロフィール説明 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full min-h-[150px]"
                placeholder="あなたのセラピーについて説明してください"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="location" className="block text-sm font-medium mb-1">
                エリア <span className="text-red-500">*</span>
              </Label>
              <PrefectureSelect
                value={formData.location}
                onValueChange={handleLocationChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="block text-sm font-medium mb-1">
                  料金（1時間あたり）
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="5000"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="experience" className="block text-sm font-medium mb-1">
                  経験年数
                </Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="2"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="specialties" className="block text-sm font-medium mb-1">
                専門分野 (カンマ区切り)
              </Label>
              <Input
                id="specialties"
                name="specialties"
                value={formData.specialties}
                onChange={handleInputChange}
                className="w-full"
                placeholder="マッサージ, アロマセラピー, リラクゼーション"
              />
            </div>
            
            <div>
              <Label htmlFor="qualifications" className="block text-sm font-medium mb-1">
                資格 (カンマ区切り)
              </Label>
              <Input
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                className="w-full"
                placeholder="マッサージ師, セラピスト資格"
              />
            </div>
            
            <div>
              <Label htmlFor="profile-image" className="block text-sm font-medium mb-1">
                プロフィール画像
              </Label>
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="profile">
          <div className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="mbti-type" className="block text-sm font-medium mb-2">
                MBTIタイプ
              </Label>
              <MBTISelect 
                value={formData.mbtiType} 
                onValueChange={handleMBTIChange} 
              />
              <p className="text-sm text-muted-foreground mt-1">
                あなたのMBTI性格タイプを選択してください。わからない場合は「わからない」を選択してください。
              </p>
            </div>
            
            <div>
              <Label htmlFor="gallery-images" className="block text-sm font-medium mb-1">
                ギャラリー画像
              </Label>
              <Input
                id="gallery-images"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
                multiple
              />
              <Button 
                type="button" 
                onClick={handleUpload} 
                className="mt-2" 
                variant="outline" 
                size="sm"
              >
                アップロード
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="questionnaire">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">マッチング質問</h3>
            <p className="text-sm text-muted-foreground">
              これらの質問はユーザーとのマッチングに使用されます。質問の答えはトップページでのユーザーの好みと一致する場合に表示されます。
            </p>
            
            {/* Mood Question */}
            <div className="space-y-3">
              <h3 className="text-md font-medium">1. あなたの施術の特徴は？</h3>
              <RadioGroup 
                value={formData.mood} 
                onValueChange={(value) => handleQuestionnaireChange('mood', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="relax" id="profile-mood-1" />
                  <label htmlFor="profile-mood-1" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">リラックスさせる</span>
                    <span className="ml-2">☁️</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="stress" id="profile-mood-2" />
                  <label htmlFor="profile-mood-2" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">ストレス発散に効果的</span>
                    <span className="ml-2">💥</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="heal" id="profile-mood-3" />
                  <label htmlFor="profile-mood-3" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">癒し効果が高い</span>
                    <span className="ml-2">💗</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="talk" id="profile-mood-4" />
                  <label htmlFor="profile-mood-4" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">会話を楽しめる</span>
                    <span className="ml-2">🗣️</span>
                  </label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Therapist Type Question */}
            <div className="space-y-3">
              <h3 className="text-md font-medium">2. あなたの性格・雰囲気は？</h3>
              <RadioGroup 
                value={formData.therapistType} 
                onValueChange={(value) => handleQuestionnaireChange('therapistType', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="mature" id="profile-type-1" />
                  <label htmlFor="profile-type-1" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">落ち着いた・大人っぽい</span>
                    <span className="ml-2">🎩</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="bright" id="profile-type-2" />
                  <label htmlFor="profile-type-2" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">明るくて話しやすい</span>
                    <span className="ml-2">😄</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="inclusive" id="profile-type-3" />
                  <label htmlFor="profile-type-3" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">包容力がある</span>
                    <span className="ml-2">🌿</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="cool" id="profile-type-4" />
                  <label htmlFor="profile-type-4" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">クールで控えめ</span>
                    <span className="ml-2">❄️</span>
                  </label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Treatment Type Question */}
            <div className="space-y-3">
              <h3 className="text-md font-medium">3. あなたの施術スタイルは？</h3>
              <RadioGroup 
                value={formData.treatmentType} 
                onValueChange={(value) => handleQuestionnaireChange('treatmentType', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="gentle" id="profile-treatment-1" />
                  <label htmlFor="profile-treatment-1" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">ゆっくり丁寧なプレイ</span>
                    <span className="ml-2">🦊</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="strong" id="profile-treatment-2" />
                  <label htmlFor="profile-treatment-2" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">しっかり強めのプレイ</span>
                    <span className="ml-2">💪</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="technique" id="profile-treatment-3" />
                  <label htmlFor="profile-treatment-3" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">ハンドテクニックメイン</span>
                    <span className="ml-2">✋</span>
                  </label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Age Question */}
            <div className="space-y-3">
              <h3 className="text-md font-medium">4. あなたの年齢層は？</h3>
              <RadioGroup 
                value={formData.therapistAge} 
                onValueChange={(value) => handleQuestionnaireChange('therapistAge', value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="early20s" id="profile-age-1" />
                  <label htmlFor="profile-age-1" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">20代前半</span>
                    <span className="ml-2">👧</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="late20s" id="profile-age-2" />
                  <label htmlFor="profile-age-2" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">20代後半</span>
                    <span className="ml-2">👱</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="30plus" id="profile-age-3" />
                  <label htmlFor="profile-age-3" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">30代以上</span>
                    <span className="ml-2">👨</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="noPreference" id="profile-age-4" />
                  <label htmlFor="profile-age-4" className="flex items-center cursor-pointer w-full">
                    <span className="text-md">非公開</span>
                    <span className="ml-2">🙈</span>
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end pt-4 border-t">
        <Button 
          type="button" 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="animate-spin mr-2">◌</span>
              保存中...
            </>
          ) : (
            '保存する'
          )}
        </Button>
      </div>
    </form>
  );
};

export default TherapistProfileForm; 