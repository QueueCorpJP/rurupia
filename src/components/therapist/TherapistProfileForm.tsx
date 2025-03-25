import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TherapistProfile } from "@/utils/types";
import { UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// List of all Japanese prefectures
const japanesePrefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

interface TherapistProfileFormProps {
  therapist?: TherapistProfile;
  existingData?: any;
  onCancel?: () => void;
  onSuccess?: (data: any) => void;
}

// Function to convert database fields to component format
const mapDatabaseToComponentFormat = (data: any) => {
  if (!data) return {};

  // Map working days - if a DB format exists, transform it, otherwise use empty array
  let workingDays: string[] = [];
  
  // Working days could be stored in several formats, try to handle all reasonable ones
  if (data.working_days && Array.isArray(data.working_days)) {
    // Map full day names to Japanese day first characters
    const dayNameToChar: { [key: string]: string } = {
      'monday': '月',
      'tuesday': '火',
      'wednesday': '水',
      'thursday': '木',
      'friday': '金',
      'saturday': '土',
      'sunday': '日'
    };
    
    workingDays = data.working_days.map((day: string) => {
      return dayNameToChar[day.toLowerCase()] || day.charAt(0);
    });
  } else if (data.workingDays && Array.isArray(data.workingDays)) {
    workingDays = data.workingDays;
  } else if (data.availability && Array.isArray(data.availability)) {
    // Map availability days to workingDays if necessary
    workingDays = data.availability.map((day: string) => day.charAt(0));
  }

  // Map the price field - could be in price or pricePerHour
  const price = data.price_per_hour || data.pricePerHour || data.price || 0;

  // Create a mapped object with the correct field names
  return {
    name: data.name || '',
    workingDays,
    workingHours: data.working_hours || data.workingHours || { start: "09:00", end: "18:00" },
    pricePerHour: price,
    bio: data.bio || data.description || '',
    serviceAreas: data.service_areas || data.serviceAreas || { prefecture: data.location || '', cities: [] },
    height: data.height,
    weight: data.weight,
    hobbies: data.hobbies || [],
    specialties: data.specialties || [],
    avatarUrl: data.avatar_url || data.image_url || data.avatarUrl || '',
    galleryImages: data.gallery_images || data.galleryImages || [],
    healthDocumentUrl: data.health_document_url || '',
    // Add any other fields that need mapping here
  };
};

export const TherapistProfileForm = ({ 
  therapist, 
  existingData, 
  onCancel, 
  onSuccess 
}: TherapistProfileFormProps) => {
  // Use existingData if provided, otherwise use therapist
  const mappedData = mapDatabaseToComponentFormat(existingData || therapist);
  
  const initialProfile = {
    name: '',
    workingDays: [],
    workingHours: { start: "09:00", end: "18:00" },
    pricePerHour: 0,
    bio: "",
    serviceAreas: { prefecture: '', cities: [] },
    height: undefined,
    weight: undefined,
    hobbies: [],
    specialties: [],
    avatarUrl: '',
    healthDocumentUrl: '',
    ...mappedData
  };
  
  const [profile, setProfile] = useState(initialProfile);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [healthDoc, setHealthDoc] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hobbyInput, setHobbyInput] = useState('');
  
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    
    getUserId();
    
    // Check if storage buckets exist or create them
    const checkBuckets = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log("Existing buckets:", buckets ? buckets.map(b => b.name) : []);
      } catch (error) {
        console.error("Error checking buckets:", error);
      }
    };
    
    checkBuckets();
  }, []);

  useEffect(() => {
    // Update profile if existingData changes
    if (existingData) {
      const mappedData = mapDatabaseToComponentFormat(existingData);
      setProfile(prev => ({
        ...prev,
        ...mappedData
      }));
      console.log("Updated profile with mapped data:", mappedData);
    }
  }, [existingData]);
  
  const weekdays = [
    { id: "monday", label: "月曜" },
    { id: "tuesday", label: "火曜" },
    { id: "wednesday", label: "水曜" },
    { id: "thursday", label: "木曜" },
    { id: "friday", label: "金曜" },
    { id: "saturday", label: "土曜" },
    { id: "sunday", label: "日曜" },
  ];

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5); // Max 5 images
      setGalleryImages(files);
    }
  };

  const handleHealthDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHealthDoc(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    if (!userId) {
      console.error("No user ID available for upload");
      return null;
    }
    
    try {
      console.log(`Uploading file to ${bucket}/${path}`);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      // Create bucket if it doesn't exist (will be ignored if it already exists)
      try {
        const { data, error } = await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (error && !error.message.includes('already exists')) {
          console.error("Error creating bucket:", error);
        } else {
          console.log(`Bucket ${bucket} created or already exists`);
        }
      } catch (bucketError) {
        console.log("Bucket already exists or creation error:", bucketError);
      }
      
      // Upload the file
      const { error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error(`Upload error for ${path}:`, uploadError);
        throw uploadError;
      }
      
      console.log(`File uploaded successfully to ${bucket}/${filePath}`);
      
      // Get public URL
      const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      console.log("Public URL:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${path}:`, error);
      toast.error(`${path}のアップロードに失敗しました`);
      return null;
    }
  };

  // Return mapped data for saving to database
  const mapComponentToDatabaseFormat = (data: any) => {
    // Convert working days from UI format (single characters) to database format
    // Store the full day name to make it more readable in the database
    const workingDaysMap: { [key: string]: string } = {
      '月': 'monday',
      '火': 'tuesday',
      '水': 'wednesday',
      '木': 'thursday',
      '金': 'friday',
      '土': 'saturday',
      '日': 'sunday'
    };
    
    const fullWorkingDays = Array.isArray(data.workingDays) 
      ? data.workingDays.map((day: string) => workingDaysMap[day] || day)
      : [];
    
    return {
      id: userId,
      name: data.name,
      description: data.bio,
      price: data.pricePerHour,
      specialties: Array.isArray(data.specialties) ? data.specialties : [],
      location: data.serviceAreas?.prefecture || 'Tokyo',
      image_url: data.avatarUrl,
      gallery_images: data.galleryImages || [],
      working_days: fullWorkingDays,
      working_hours: data.workingHours,
      height: data.height,
      weight: data.weight,
      hobbies: data.hobbies || [],
      health_document_url: data.healthDocumentUrl,
      service_areas: data.serviceAreas || { prefecture: 'Tokyo', cities: [] }
    };
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("ユーザー情報が見つかりません");
      return;
    }
    
    try {
      setUploading(true);
      let updatedProfile = { ...profile };
      
      // Upload profile image if selected
      if (profileImage) {
        const profileImageUrl = await uploadFile(profileImage, 'therapists', 'avatars');
        if (profileImageUrl) {
          updatedProfile.avatarUrl = profileImageUrl;
        }
      }
      
      // Upload gallery images if selected
      if (galleryImages.length > 0) {
        const galleryUrls = [];
        for (const image of galleryImages) {
          const imageUrl = await uploadFile(image, 'therapists', 'gallery');
          if (imageUrl) galleryUrls.push(imageUrl);
        }
        
        if (galleryUrls.length > 0) {
          updatedProfile.galleryImages = [
            ...(updatedProfile.galleryImages || []),
            ...galleryUrls
          ];
        }
      }
      
      // Upload health document if selected
      if (healthDoc) {
        const healthDocUrl = await uploadFile(healthDoc, 'therapists', 'documents');
        if (healthDocUrl) {
          updatedProfile.healthDocumentUrl = healthDocUrl;
        }
      }
      
      // Map data for database
      const dbData = mapComponentToDatabaseFormat(updatedProfile);
      
      console.log("Updating therapist with data:", dbData);
      
      // Update therapist data in the database
      const { data: therapistData, error: therapistCheckError } = await supabase
        .from('therapists')
        .select('id, gallery_images')
        .eq('id', userId)
        .maybeSingle();
      
      if (therapistCheckError && !therapistCheckError.message.includes('No rows found')) {
        console.error("Error checking therapist:", therapistCheckError);
        throw therapistCheckError;
      }
      
      if (!therapistData) {
        // If therapist record doesn't exist yet, insert it
        const { error: insertError } = await supabase
          .from('therapists')
          .insert([dbData]);
          
        if (insertError) {
          console.error("Error inserting therapist:", insertError);
          throw insertError;
        }
      } else {
        // Merge existing gallery images with new ones if needed
        let mergedGalleryImages = updatedProfile.galleryImages || [];
        
        // If there were existing gallery images and we didn't just reset them
        if (therapistData.gallery_images && galleryImages.length > 0) {
          mergedGalleryImages = [
            ...(therapistData.gallery_images || []),
            ...mergedGalleryImages
          ];
        } else if (therapistData.gallery_images && !updatedProfile.galleryImages) {
          // If we're not adding new images, keep existing ones
          mergedGalleryImages = therapistData.gallery_images;
        }
        
        // Update the gallery images in the database data
        dbData.gallery_images = mergedGalleryImages;
        
        // Update existing therapist record
        const { error: updateTherapistError } = await supabase
          .from('therapists')
          .update(dbData)
          .eq('id', userId);
          
        if (updateTherapistError) {
          console.error("Error updating therapist:", updateTherapistError);
          throw updateTherapistError;
        }
      }
      
      // Update profile as well for additional data
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          avatar_url: updatedProfile.avatarUrl
        })
        .eq('id', userId);
        
      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError);
        throw updateProfileError;
      }
      
      toast.success("プロフィールが更新されました");
      
      if (onSuccess) onSuccess(updatedProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("プロフィールの保存に失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleAddHobby = () => {
    if (hobbyInput.trim()) {
      // Split by commas or spaces to allow multiple entries at once
      const newHobbies = hobbyInput.split(/[,、]/).map(h => h.trim()).filter(h => h);
      
      // Filter out duplicates
      const uniqueNewHobbies = newHobbies.filter(
        hobby => !profile.hobbies.includes(hobby)
      );
      
      if (uniqueNewHobbies.length > 0) {
        setProfile({
          ...profile,
          hobbies: [...profile.hobbies, ...uniqueNewHobbies]
        });
      }
      setHobbyInput('');
    }
  };
  
  const handleRemoveHobby = (hobbyToRemove: string) => {
    setProfile({
      ...profile,
      hobbies: Array.isArray(profile.hobbies) 
        ? profile.hobbies.filter(hobby => hobby !== hobbyToRemove)
        : []
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">プロフィール設定</h2>
      <p className="text-sm text-muted-foreground mb-4">現在のプロフィール設定を変更します</p>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">プロフィール写真</h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-64 h-64 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
              {(profile.avatarUrl || profileImage) ? (
                <img 
                  src={profileImage ? URL.createObjectURL(profileImage) : profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">写真をアップロード</p>
                </div>
              )}
              <input 
                id="profile-image" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">ギャラリー写真 (最大5枚まで)</h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">写真をアップロード (最大5枚)</p>
              </div>
              <input 
                id="gallery-images" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleGalleryImagesChange}
              />
            </label>
          </div>
          {galleryImages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {galleryImages.map((image, index) => (
                <div key={index} className="w-20 h-20 relative">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Gallery ${index}`} 
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
          
          {Array.isArray(profile.galleryImages) && profile.galleryImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">現在のギャラリー写真</h4>
              <div className="flex flex-wrap gap-2">
                {profile.galleryImages.map((imageUrl: string, index: number) => (
                  <div key={index} className="w-20 h-20 relative">
                    <img 
                      src={imageUrl} 
                      alt={`Existing Gallery ${index}`} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">身長 (cm)</Label>
            <Input 
              id="height" 
              type="number" 
              value={profile.height || ""} 
              onChange={(e) => setProfile({...profile, height: parseInt(e.target.value) || undefined})}
              placeholder="173cm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">体重 (kg)</Label>
            <Input 
              id="weight" 
              type="number" 
              value={profile.weight || ""} 
              onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value) || undefined})}
              placeholder="67kg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">名前</Label>
          <Input 
            id="name" 
            placeholder="セラピスト名"
            value={profile.name || ""}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hobbies">趣味</Label>
          <div className="flex gap-2 mt-1">
            <Input 
              id="hobbies" 
              placeholder="映画鑑賞、料理、旅行など（カンマ区切り）"
              value={hobbyInput}
              onChange={(e) => setHobbyInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHobby())}
            />
            <Button 
              type="button" 
              onClick={handleAddHobby}
              variant="outline"
            >
              追加
            </Button>
          </div>
          {Array.isArray(profile.hobbies) && profile.hobbies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.hobbies.map((hobby) => (
                <div 
                  key={hobby} 
                  className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  {hobby}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveHobby(hobby)}
                    className="text-primary hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>対応エリア (都道府県)</Label>
          <Select 
            value={profile.serviceAreas?.prefecture || ""}
            onValueChange={(value) => setProfile({
              ...profile, 
              serviceAreas: {...(profile.serviceAreas || {}), prefecture: value}
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="都道府県を選択" />
            </SelectTrigger>
            <SelectContent>
              {japanesePrefectures.map((prefecture) => (
                <SelectItem key={prefecture} value={prefecture}>
                  {prefecture}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>詳細エリア (区市町村)</Label>
          <Input 
            placeholder="渋谷区、新宿区"
            value={Array.isArray(profile.serviceAreas?.cities) ? profile.serviceAreas?.cities?.join('、') : ""}
            onChange={(e) => setProfile({
              ...profile, 
              serviceAreas: {
                ...(profile.serviceAreas || {}), 
                cities: e.target.value.split('、').map(c => c.trim())
              }
            })}
          />
        </div>

        <div>
          <Label className="block mb-2">稼働可能日</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {weekdays.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={day.id}
                  checked={Array.isArray(profile.workingDays) && 
                    profile.workingDays.includes(day.label.charAt(0))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setProfile({
                        ...profile,
                        workingDays: [...(Array.isArray(profile.workingDays) ? 
                                       profile.workingDays : []), day.label.charAt(0)]
                      });
                    } else {
                      setProfile({
                        ...profile,
                        workingDays: Array.isArray(profile.workingDays) 
                          ? profile.workingDays.filter(d => d !== day.label.charAt(0))
                          : []
                      });
                    }
                  }}
                />
                <Label htmlFor={day.id}>{day.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>稼働可能時間</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="startTime" className="text-sm text-muted-foreground">開始時間</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={profile.workingHours?.start || "09:00"} 
                  onChange={(e) => setProfile({
                    ...profile, 
                    workingHours: {...(profile.workingHours || {}), start: e.target.value}
                  })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endTime" className="text-sm text-muted-foreground">終了時間</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={profile.workingHours?.end || "18:00"} 
                  onChange={(e) => setProfile({
                    ...profile, 
                    workingHours: {...(profile.workingHours || {}), end: e.target.value}
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">コース料金</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
              <Input 
                id="price" 
                type="number"
                className="pl-8"
                value={profile.pricePerHour || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setProfile({
                    ...profile, 
                    pricePerHour: isNaN(value) ? 0 : value
                  });
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">〜</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">自己PR</Label>
          <Textarea 
            id="bio" 
            placeholder="あなたの強みや特徴を記入してください"
            rows={5}
            value={profile.bio || ""}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">性病検査結果</h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              {profile.healthDocumentUrl ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {profile.healthDocumentUrl.toLowerCase().endsWith('.pdf') ? (
                    // For PDF documents
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-center text-gray-500 mt-1">現在のドキュメント</p>
                      <a 
                        href={profile.healthDocumentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline mt-1"
                      >
                        ドキュメントを表示
                      </a>
                    </div>
                  ) : (
                    // For image documents
                    <div className="flex flex-col items-center">
                      <img 
                        src={profile.healthDocumentUrl} 
                        alt="Health Document" 
                        className="h-16 object-contain mb-1" 
                      />
                      <p className="text-sm text-center text-gray-500">現在のドキュメント</p>
                      <a 
                        href={profile.healthDocumentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline mt-1"
                      >
                        拡大表示
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">証明書をアップロード</p>
                </div>
              )}
              <input 
                id="health-document" 
                type="file" 
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png" 
                onChange={handleHealthDocChange}
              />
            </label>
          </div>
          {healthDoc && (
            <p className="mt-2 text-sm text-center text-muted-foreground">
              ファイル選択済み: {healthDoc.name}
            </p>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full bg-black text-white hover:bg-black/90"
          disabled={uploading}
        >
          {uploading ? 'アップロード中...' : 'プロフィールを更新'}
        </Button>
        
        {onCancel && (
          <Button 
            onClick={onCancel} 
            variant="outline"
            className="w-full mt-2"
            disabled={uploading}
          >
            キャンセル
          </Button>
        )}
      </div>
    </div>
  );
};
