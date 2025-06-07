import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TherapistProfile } from "@/utils/types";
import { UploadCloud, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import MBTISelect from "@/components/MBTISelect";
import PrefectureSelect from "@/components/PrefectureSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import TherapistProfileEnhanced from "./TherapistProfileEnhanced";

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

interface ProfileState {
  name: string;
  workingDays: string[];
  workingHours: { start: string; end: string };
  pricePerHour: number;
  bio: string;
  serviceAreas: { 
    prefecture: string; 
    cities: string[];
    detailedArea?: string;
  };
  height: number | string;
  weight: number | string;
  mbtiType?: string;
  hobbies: string[];
  specialties: string[];
  image: File | null;
  previewUrl: string;
  ageRange?: string;
  facialFeatures?: string;
  serviceStyle: string[];
  bodyType: string[];
  personalityTraits: string[];
}

// Function to convert database fields to component format
const mapDatabaseToComponentFormat = (data: any) => {
  if (!data) return {};

  console.log("Raw data from database:", data);

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
      if (day in dayNameToChar) {
        return dayNameToChar[day];
      }
      return day;
    });
  }

  // Handle price formatting - default to 0 if not present
  const price = data.price || 0;

  // Handle working hours parsing - default to 9AM-5PM if not present or invalid
  let workingHours = { start: "09:00", end: "17:00" };
  if (data.working_hours) {
    try {
      if (typeof data.working_hours === 'string') {
        // If it's a string, try parsing JSON
        const parsed = JSON.parse(data.working_hours);
        workingHours = {
          start: parsed.start || "09:00",
          end: parsed.end || "17:00"
        };
      } else if (typeof data.working_hours === 'object') {
        // If it's already an object, use it directly
        workingHours = {
          start: data.working_hours.start || "09:00",
          end: data.working_hours.end || "17:00"
        };
      }
    } catch (e) {
      console.error("Error parsing working hours:", e);
    }
  }

  // Handle service areas mapping
  let serviceAreas = { 
    prefecture: data.location || '',
    cities: [] as string[],  // Specify as string[] to fix type error
    detailedArea: data.detailed_area || ''
  };

  // Handle hobbies array
  const hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];

  // Handle specialties array
  const specialties = Array.isArray(data.specialties) ? data.specialties : [];

  // Handle service style array
  const serviceStyle = Array.isArray(data.service_style) ? data.service_style : [];

  // Handle body type array
  const bodyType = Array.isArray(data.body_type) ? data.body_type : [];

  // Handle personality traits array
  const personalityTraits = Array.isArray(data.personality_traits) ? data.personality_traits : [];

  return {
    name: data.name || '',
    workingDays,
    workingHours,
    pricePerHour: price,
    bio: data.description || '',
    serviceAreas,
    height: data.height || '',
    weight: data.weight || '',
    mbtiType: data.mbti_type || '',
    hobbies,
    specialties,
    previewUrl: data.image_url || '',
    ageRange: data.age || '',
    facialFeatures: data.facial_features || '',
    serviceStyle,
    bodyType,
    personalityTraits,
    image: null  // Initialize with null to match ProfileState
  };
};

// Function to convert component format to database fields
const mapComponentToDatabase = (state: ProfileState) => {
  return {
    name: state.name,
    working_days: state.workingDays.map(day => {
      // Map Japanese day first characters to full day names for DB
      const charToDayName: { [key: string]: string } = {
        '月': 'monday',
        '火': 'tuesday',
        '水': 'wednesday',
        '木': 'thursday',
        '金': 'friday',
        '土': 'saturday',
        '日': 'sunday'
      };
      
      return day in charToDayName ? charToDayName[day] : day;
    }),
    working_hours: JSON.stringify(state.workingHours),
    price: state.pricePerHour,
    description: state.bio,
    location: state.serviceAreas.prefecture,
    detailed_area: state.serviceAreas.detailedArea,
    height: state.height,
    weight: state.weight,
    image_url: state.previewUrl,
    mbti_type: state.mbtiType,
    hobbies: state.hobbies,
    specialties: state.specialties,
    age: state.ageRange,
    facial_features: state.facialFeatures,
    service_style: state.serviceStyle,
    body_type: state.bodyType,
    personality_traits: state.personalityTraits
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
  
  const initialProfile: ProfileState = {
    name: '',
    workingDays: [],
    workingHours: { start: "09:00", end: "17:00" },
    pricePerHour: 0,
    bio: "",
    serviceAreas: { prefecture: '', cities: [] },
    height: '',
    weight: '',
    mbtiType: '',
    hobbies: [],
    specialties: [],
    image: null,
    previewUrl: '',
    ageRange: '',
    facialFeatures: '',
    serviceStyle: [],
    bodyType: [],
    personalityTraits: [],
    ...mappedData
  };
  
  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [healthDoc, setHealthDoc] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hobbyInput, setHobbyInput] = useState('');
  const [activeTab, setActiveTab] = useState("basic");
  
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
    
    // Set initial preview URL if avatarUrl exists
    if (profile.previewUrl) {
      setProfilePreviewUrl(profile.previewUrl);
    }
    
    // Cleanup function for object URLs
    return () => {
      if (profilePreviewUrl && !profilePreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
      
      // Clean up gallery preview URLs
      galleryPreviews.forEach(url => {
        if (url && !url.startsWith('http')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    // Update profile if existingData changes
    if (existingData) {
      const mappedData = mapDatabaseToComponentFormat(existingData);
      setProfile(prev => ({
        ...prev,
        ...mappedData
      }));
      
      // Update preview URL if avatarUrl exists
      if (mappedData.previewUrl) {
        setProfilePreviewUrl(mappedData.previewUrl);
      }
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfile(prev => ({
      ...prev,
      pricePerHour: value ? parseInt(value, 10) : 0
    }));
  };

  // Handle numeric inputs (height, weight)
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value ? parseInt(value, 10) : undefined
    }));
  };

  const handleWorkingDaysChange = (day: string, checked: boolean) => {
    setProfile(prev => {
      const currentDays = prev.workingDays || [];
      const newDays = checked
        ? [...currentDays, day]
        : currentDays.filter(d => d !== day);
      return { ...prev, workingDays: newDays };
    });
  };

  const handleWorkingHoursChange = (part: 'start' | 'end', value: string) => {
    setProfile(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [part]: value }
    }));
  };

  const handleServiceAreasChange = (field: 'prefecture' | 'cities', value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      serviceAreas: {
        ...prev.serviceAreas,
        [field]: value
      }
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Clean up previous object URL if it exists and isn't a remote URL
      if (profilePreviewUrl && !profilePreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
      
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setProfilePreviewUrl(previewUrl);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Calculate how many slots are available
      const currentTotal = (profile.galleryImages?.length || 0) + galleryPreviews.length;
      const remainingSlots = 5 - currentTotal;
      
      if (remainingSlots <= 0) {
        toast.error("画像は最大5枚までです");
        return;
      }
      
      // Only take as many files as we have remaining slots
      const files = Array.from(e.target.files).slice(0, remainingSlots);
      setGalleryImages(prev => [...prev, ...files]);
      
      // Create preview URLs for the gallery images
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...previewUrls]);
      
      if (e.target.files.length > remainingSlots) {
        toast.warning(`${files.length}枚の画像のみアップロードされます（最大5枚まで）`);
      }
    }
  };

  const handleHealthDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHealthDoc(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    if (!userId) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      console.log(`Preparing to upload file to path: "${filePath}"`);

      // Use the correct bucket name for therapists
      const bucketName = "therapists";
      
      console.log(`Attempting upload to bucket: ${bucketName}, file path: ${filePath}`);
      
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error(`Upload failed:`, error);
        throw error;
      }
      
      console.log(`File uploaded successfully to ${bucketName}/${filePath}`);
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      const uploadResult = urlData.publicUrl;
      console.log(`Public URL for ${path}:`, uploadResult);
      
      return uploadResult;
    } catch (error) {
      console.error(`Error uploading file for ${path}:`, error);
      toast.error(`ファイルのアップロードに失敗しました: ${file.name}`);
      return null;
    }
  };

  const handleSave = async () => {
    setUploading(true);

    try {
      // Create a copy of the profile for updates
      const updatedProfile = { ...profile };
      
      // Upload profile image if provided
      if (profileImage) {
        const profileImageUrl = await uploadFile(profileImage, 'Therapist files', 'avatars');
        
        if (profileImageUrl) {
          console.log("Profile image uploaded successfully, URL:", profileImageUrl);
          updatedProfile.previewUrl = profileImageUrl;
        } else {
          console.warn("Profile image upload failed, continuing without updating avatar");
        }
      }
      
      // Upload health document if provided
      let healthDocumentUrl = null;
      if (healthDoc) {
        healthDocumentUrl = await uploadFile(healthDoc, 'Therapist files', 'health-documents');
        
        if (healthDocumentUrl) {
          console.log("Health document uploaded successfully, URL:", healthDocumentUrl);
        } else {
          console.warn("Health document upload failed, continuing without updating health document");
        }
      }
      
      // Convert component state to database fields (after updating profile image URL)
      const dbFields = {
        ...mapComponentToDatabase(updatedProfile),
        ...(healthDocumentUrl && { health_document_url: healthDocumentUrl })
      };
      
      // Upload final data to database
      const { data, error } = await supabase
        .from('therapists')
        .update(dbFields)
        .eq('id', userId);
      
      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      
      toast.success("プロフィールが正常に更新されました");
      
      if (onSuccess) onSuccess(updatedProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("プロフィールの更新中にエラーが発生しました");
    } finally {
      setUploading(false);
    }
  };

  // Handle MBTI type change
  const handleMBTIChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      mbtiType: value
    }));
  };

  // Handle questionnaire data change
  const handleQuestionnaireChange = (question: keyof typeof profile.questionnaireData, answer: string) => {
    setProfile(prev => ({
      ...prev,
      questionnaireData: {
        ...prev.questionnaireData,
        [question]: answer
      }
    }));
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

  // Add this with the other handler functions
  const handleRemoveExistingImage = (indexToRemove: number) => {
    setProfile(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Clean up object URLs on unmount or when they change
  useEffect(() => {
    // Set initial preview URL if avatarUrl exists
    if (profile.previewUrl) {
      setProfilePreviewUrl(profile.previewUrl);
    }
    
    // Cleanup function for object URLs
    return () => {
      if (profilePreviewUrl && !profilePreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
      
      // Clean up gallery preview URLs
      galleryPreviews.forEach(url => {
        if (url && !url.startsWith('http')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [profilePreviewUrl, galleryPreviews]);

  // Add this function to handle the detailed area input
  const handleDetailedAreaChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      serviceAreas: {
        ...prev.serviceAreas,
        detailedArea: value
      }
    }));
  };

  // Add this function to handle the age input
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      ageRange: e.target.value
    }));
  };

  // Add handlers for new enhanced profile fields
  const handleServiceStyleChange = (values: string[]) => {
    setProfile({
      ...profile,
      serviceStyle: values
    });
  };

  const handleFacialFeaturesChange = (value: string) => {
    setProfile({
      ...profile,
      facialFeatures: value
    });
  };

  const handleBodyTypeChange = (values: string[]) => {
    setProfile({
      ...profile,
      bodyType: values
    });
  };

  const handlePersonalityTraitsChange = (values: string[]) => {
    setProfile({
      ...profile,
      personalityTraits: values
    });
  };

  // Add handler for height range change
  const handleHeightRangeChange = (value: string) => {
    setProfile({
      ...profile,
      height: value
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">セラピストプロフィール編集</h1>
        <p className="text-sm text-muted-foreground">
          お客様に伝わるプロフィールを作成しましょう。より詳細な情報を提供することで、マッチング率が向上します。
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto mb-6">
          <TabsList className="inline-flex h-12 sm:h-10 p-1 rounded-lg bg-muted min-w-full w-max">
            <TabsTrigger 
              value="basic" 
              className="text-sm sm:text-base font-medium px-4 sm:px-6 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap flex-shrink-0"
            >
              基本情報
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="text-sm sm:text-base font-medium px-4 sm:px-6 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap flex-shrink-0"
            >
              サービス
            </TabsTrigger>
            <TabsTrigger 
              value="enhanced" 
              className="text-sm sm:text-base font-medium px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap flex-shrink-0"
            >
              詳細プロフィール
            </TabsTrigger>
            <TabsTrigger 
              value="images" 
              className="text-sm sm:text-base font-medium px-4 sm:px-6 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap flex-shrink-0"
            >
              画像
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="text-sm sm:text-base font-medium px-3 sm:px-4 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap flex-shrink-0"
            >
              健康証明書
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="basic">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium mb-1">
                名前 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full"
                placeholder="セラピスト名"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="age" className="block text-sm font-medium mb-1">
                年齢 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                name="ageRange"
                value={profile.ageRange}
                onChange={handleAgeChange}
                className="w-full"
                placeholder="例: 20代後半"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="bio" className="block text-sm font-medium mb-1">
                プロフィール説明 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                className="w-full min-h-[150px]"
                placeholder="あなたのセラピーについて説明してください"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="workingDays" className="block text-sm font-medium mb-1">
                営業日 <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-4">
                {weekdays.map((day) => (
                  <div className="flex items-center space-x-2" key={day.id}>
                    <Checkbox 
                      id={`day-${day.id}`}
                      checked={profile.workingDays.includes(day.label.charAt(0))} 
                      onCheckedChange={(checked) => 
                        handleWorkingDaysChange(day.label.charAt(0), checked === true)
                      }
                    />
                    <Label 
                      htmlFor={`day-${day.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workingHoursStart" className="block text-sm font-medium mb-1">
                  営業開始時間
                </Label>
                <Input 
                  id="workingHoursStart"
                  type="time" 
                  value={profile.workingHours.start}
                  onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="workingHoursEnd" className="block text-sm font-medium mb-1">
                  営業終了時間
                </Label>
                <Input 
                  id="workingHoursEnd"
                  type="time" 
                  value={profile.workingHours.end}
                  onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold mb-3">サービス提供エリア</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <Label htmlFor="prefecture" className="block text-sm font-medium mb-1">
                    都道府県 <span className="text-red-500">*</span>
                  </Label>
                  <PrefectureSelect
                    value={profile.serviceAreas.prefecture}
                    onValueChange={(value) => handleServiceAreasChange('prefecture', value)}
                    placeholder="都道府県を選択"
                  />
                </div>
                
                <div>
                  <Label htmlFor="detailedArea" className="block text-sm font-medium mb-1">
                    詳細エリア <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="detailedArea"
                    value={profile.serviceAreas.detailedArea || ''}
                    onChange={(e) => handleDetailedAreaChange(e.target.value)}
                    className="w-full"
                    placeholder="例: 渋谷区、新宿区、中央区など"
                    rows={2}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    あなたがサービスを提供できる詳細なエリアを入力してください。市区町村名や地域名など具体的に記載するとお客様が見つけやすくなります。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="pricePerHour" className="block text-sm font-medium mb-1">
                料金 (1時間あたり) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pricePerHour"
                name="pricePerHour"
                type="number"
                value={profile.pricePerHour || ''}
                onChange={handlePriceChange}
                className="w-full"
                placeholder="5000"
                min="0"
              />
            </div>
            
            <div className="mt-4">
              <Label htmlFor="hobbies" className="block text-sm font-medium mb-2">
                趣味
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="hobbies-input"
                  value={hobbyInput}
                  onChange={(e) => setHobbyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHobby();
                    }
                  }}
                  placeholder="趣味を入力してEnterキーを押してください"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddHobby} 
                  size="sm">追加</Button>
              </div>
              
              {profile.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.hobbies.map((hobby, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {hobby}
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => handleRemoveHobby(hobby)} 
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                複数の趣味を追加するには、一つずつ入力してEnterを押してください
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <div className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="mbti-type" className="block text-sm font-medium mb-2">
                MBTIタイプ
              </Label>
              <MBTISelect 
                value={profile.mbtiType} 
                onValueChange={handleMBTIChange} 
              />
              <p className="text-sm text-muted-foreground mt-1">
                あなたのMBTI性格タイプを選択してください。わからない場合は「わからない」を選択してください。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="height" className="block text-sm font-medium mb-1">
                  身長 (cm)
                </Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={profile.height || ''}
                  onChange={handleNumericInputChange}
                  className="w-full"
                  placeholder="165"
                  min="100"
                  max="250"
                />
              </div>
              
              <div>
                <Label htmlFor="weight" className="block text-sm font-medium mb-1">
                  体重 (kg)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={profile.weight || ''}
                  onChange={handleNumericInputChange}
                  className="w-full"
                  placeholder="55"
                  min="30"
                  max="150"
                />
              </div>
            </div>
            
            {/* Gallery images section removed - now only available in dedicated Images tab */}
          </div>
        </TabsContent>
        
        <TabsContent value="enhanced" className="space-y-6 p-4 border rounded-md">
          <TherapistProfileEnhanced 
            serviceStyle={profile.serviceStyle}
            facialFeatures={profile.facialFeatures}
            bodyType={profile.bodyType}
            personalityTraits={profile.personalityTraits}
            onServiceStyleChange={handleServiceStyleChange}
            onFacialFeaturesChange={handleFacialFeaturesChange}
            onBodyTypeChange={handleBodyTypeChange}
            onPersonalityTraitsChange={handlePersonalityTraitsChange}
            heightRange={profile.height as string || ''}
            onHeightRangeChange={handleHeightRangeChange}
          />
        </TabsContent>
        
        <TabsContent value="images">
          <div className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="profile-image-main" className="block text-sm font-medium mb-1">
                プロフィール画像
              </Label>
              <Input
                id="profile-image-main"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                メインのプロフィール画像を設定してください。ギャラリー画像は別のギャラリータブで管理できます。
              </p>
              
              {/* Profile image preview */}
              {profilePreviewUrl && (
                <div className="mt-3 w-32 h-32 relative rounded-md overflow-hidden border">
                  <img 
                    src={profilePreviewUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (profilePreviewUrl && !profilePreviewUrl.startsWith('http')) {
                        URL.revokeObjectURL(profilePreviewUrl);
                      }
                      setProfilePreviewUrl(null);
                      setProfileImage(null);
                    }}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="health">
          <div className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="health-document" className="block text-sm font-medium mb-1">
                健康証明書 (STD検査結果など)
              </Label>
              <Input
                id="health-document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleHealthDocChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                STD検査結果や健康証明書をアップロードしてください。店舗側が確認できるようになります。
              </p>
              
              {/* Health document preview */}
              {healthDoc && (
                <div className="mt-3 p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        📄
                      </div>
                      <div>
                        <p className="text-sm font-medium">{healthDoc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(healthDoc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHealthDoc(null)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove document"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end pt-4 border-t">
        <Button 
          type="button" 
          onClick={handleSave} 
          disabled={uploading}
          className="ml-auto"
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">◌</span>
              保存中...
            </>
          ) : (
            '保存する'
          )}
        </Button>
      </div>
    </div>
  );
};

export default TherapistProfileForm;
