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

  // Parse questionnaire data from JSONB
  const questionnaireData = data.questionnaire_data || {};

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
    qualifications: data.qualifications || [],
    avatarUrl: data.image_url || data.avatarUrl || '',
    galleryImages: data.gallery_images || data.galleryImages || [],
    healthDocumentUrl: data.health_document_url || '',
    mbtiType: data.mbti_type || 'unknown',
    questionnaireData: {
      mood: questionnaireData.mood || '',
      therapistType: questionnaireData.therapistType || '',
      treatmentType: questionnaireData.treatmentType || '',
      therapistAge: questionnaireData.therapistAge || ''
    }
  };
};

interface ProfileState {
  name: string;
  workingDays: string[];
  workingHours: { start: string; end: string };
  pricePerHour: number;
  bio: string;
  serviceAreas: { prefecture: string; cities: [] };
  height: number | undefined;
  weight: number | undefined;
  experience: number | undefined;
  hobbies: string[];
  specialties: string[];
  qualifications: string[]; // Keep for database compatibility
  avatarUrl: string;
  galleryImages: string[];
  healthDocumentUrl: string;
  mbtiType: string;
  questionnaireData: {
    mood: string;
    therapistType: string;
    treatmentType: string;
    therapistAge: string;
  };
}

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
    workingHours: { start: "09:00", end: "18:00" },
    pricePerHour: 0,
    bio: "",
    serviceAreas: { prefecture: '', cities: [] },
    height: undefined,
    weight: undefined,
    experience: undefined,
    hobbies: [],
    specialties: [],
    qualifications: [],
    avatarUrl: '',
    galleryImages: [],
    healthDocumentUrl: '',
    mbtiType: 'unknown',
    questionnaireData: {
      mood: '',
      therapistType: '',
      treatmentType: '',
      therapistAge: ''
    },
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
    if (profile.avatarUrl) {
      setProfilePreviewUrl(profile.avatarUrl);
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
      if (mappedData.avatarUrl) {
        setProfilePreviewUrl(mappedData.avatarUrl);
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
    if (!userId) {
      console.error("No user ID available for upload");
      return null;
    }
    
    try {
      console.log(`Preparing to upload file to path: "${path}"`);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      // Get a list of all buckets and try them in order
      let bucketToUse = "";
      let bucketError = null;
      
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error listing buckets:", error);
          throw error;
        }
        
        console.log("Available buckets:", buckets ? buckets.map(b => `${b.name} (ID: ${b.id})`) : "No buckets found");
        
        // Try to find the Therapist files bucket by name or any bucket that contains "therapist"
        const therapistBucket = buckets?.find(b => b.name === "Therapist files") || 
                               buckets?.find(b => b.name.toLowerCase().includes("therapist")) ||
                               buckets?.[0]; // Fallback to first bucket if none found
        
        if (therapistBucket) {
          bucketToUse = therapistBucket.id; // Use the bucket ID, not the name
          console.log(`Found appropriate bucket: ${therapistBucket.name} with ID: ${bucketToUse}`);
        } else {
          throw new Error("No suitable bucket found for upload");
        }
      } catch (error) {
        bucketError = error;
        console.error("Error finding buckets:", error);
        // Default fallback
        bucketToUse = "therapists";
      }
      
      // Potential bucket IDs to try
      const bucketOptions = [
        bucketToUse,            // Try the found bucket ID first
        "therapists",           // Then try the assumed ID
        "Therapist files",      // Then try the display name
        "therapist-files",      // Then try a hyphenated version
        "Therapist_files",      // Then try an underscore version
        "therapist_files",      // Then try lowercase with underscore
      ];
      
      let uploadResult = null;
      let uploadError = null;
      
      // Try each bucket option until one works
      for (const bucketName of bucketOptions) {
        try {
          console.log(`Attempting upload to bucket: ${bucketName}, file path: ${filePath}`);
          
          const { data, error } = await supabase
            .storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (error) {
            console.log(`Upload to ${bucketName} failed:`, error);
            continue; // Try next bucket
          }
          
          console.log(`File uploaded successfully to ${bucketName}/${filePath}`);
          
          // Get public URL
          const { data: urlData } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(filePath);
          
          uploadResult = urlData.publicUrl;
          console.log(`Public URL for ${path}:`, uploadResult);
          break; // Stop trying once successful
        } catch (error) {
          console.log(`Error trying bucket ${bucketName}:`, error);
          uploadError = error;
        }
      }
      
      if (uploadResult) {
        return uploadResult;
      } else {
        throw uploadError || new Error("Failed to upload to any bucket");
      }
    } catch (error) {
      console.error(`Error uploading file for ${path}:`, error);
      toast.error(`ファイルのアップロードに失敗しました: ${file.name}`);
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
    
    const workingDays = data.workingDays.map((day: string) => {
      return workingDaysMap[day] || day;
    });
    
    return {
      name: data.name,
      working_days: workingDays,
      working_hours: data.workingHours,
      price: data.pricePerHour,
      description: data.bio,
      service_areas: data.serviceAreas,
      location: data.serviceAreas.prefecture || '',
      height: data.height,
      weight: data.weight,
      hobbies: data.hobbies,
      specialties: [], // Keep for backward compatibility
      image_url: data.avatarUrl,
      gallery_images: data.galleryImages,
      health_document_url: data.healthDocumentUrl,
      mbti_type: data.mbtiType,
      questionnaire_data: data.questionnaireData
    };
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("ユーザー情報が見つかりません");
      return;
    }
    
    try {
      setUploading(true);
      console.log("Starting profile save process for user ID:", userId);
      
      // Debug query to check table structure
      try {
        const { data: tableInfo, error: tableError } = await supabase
          .from('therapists')
          .select('*')
          .limit(1);
          
        if (tableError) {
          console.error("Error querying therapist table:", tableError);
        } else {
          console.log("Therapist table structure sample:", tableInfo);
          if (tableInfo && tableInfo.length > 0) {
            console.log("Available columns:", Object.keys(tableInfo[0]));
          }
        }
      } catch (debugError) {
        console.error("Debug query error:", debugError);
      }
      
      let updatedProfile = { ...profile };
      
      // Upload profile image if selected
      if (profileImage) {
        console.log("Uploading profile image...");
        const profileImageUrl = await uploadFile(profileImage, 'Therapist files', 'avatars');
        if (profileImageUrl) {
          console.log("Profile image uploaded successfully, URL:", profileImageUrl);
          updatedProfile.avatarUrl = profileImageUrl;
        } else {
          console.warn("Profile image upload failed, continuing without updating avatar");
        }
      }
      
      // Upload gallery images if selected
      if (galleryImages.length > 0) {
        console.log(`Uploading ${galleryImages.length} gallery images...`);
        const galleryUrls = [];
        for (const image of galleryImages) {
          const imageUrl = await uploadFile(image, 'Therapist files', 'gallery');
          if (imageUrl) {
            console.log("Gallery image uploaded successfully, URL:", imageUrl);
            galleryUrls.push(imageUrl);
          }
        }
        
        if (galleryUrls.length > 0) {
          console.log(`Successfully uploaded ${galleryUrls.length} gallery images`);
          updatedProfile.galleryImages = [
            ...(updatedProfile.galleryImages || []),
            ...galleryUrls
          ];
          
          // Clear gallery previews and selected files after successful upload
          setGalleryPreviews([]);
          setGalleryImages([]);
        }
      }
      
      // Upload health document if selected
      if (healthDoc) {
        console.log("Uploading health document...");
        const healthDocUrl = await uploadFile(healthDoc, 'Therapist files', 'documents');
        if (healthDocUrl) {
          console.log("Health document uploaded successfully, URL:", healthDocUrl);
          updatedProfile.healthDocumentUrl = healthDocUrl;
        } else {
          console.warn("Health document upload failed");
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
      
      if (therapistCheckError) {
        console.error("Error checking therapist:", therapistCheckError);
        if (!therapistCheckError.message.includes('No rows found')) {
          throw therapistCheckError;
        } else {
          console.log("No existing therapist record found, will create a new one");
        }
      }
      
      if (!therapistData) {
        // If therapist record doesn't exist yet, insert it
        console.log("Inserting new therapist record...");
        const { data, error: insertError } = await supabase
          .from('therapists')
          .insert([{ id: userId, ...dbData }])
          .select();
          
        if (insertError) {
          console.error("Error inserting therapist:", insertError);
          throw insertError;
        }
        
        console.log("Successfully inserted new therapist record:", data);
        toast.success(`プロフィールが作成されました (${activeTab}タブ)`, { 
          duration: 5000,
          position: 'top-center'
        });
      } else {
        // Merge existing gallery images with new ones if needed
        console.log("Found existing therapist record:", therapistData);
        let mergedGalleryImages = updatedProfile.galleryImages || [];
        
        // If there were existing gallery images and we didn't just reset them
        if (therapistData.gallery_images && galleryImages.length > 0) {
          console.log("Merging new gallery images with existing ones");
          mergedGalleryImages = [
            ...(therapistData.gallery_images || []),
            ...mergedGalleryImages
          ];
        } else if (therapistData.gallery_images && !updatedProfile.galleryImages) {
          // If we're not adding new images, keep existing ones
          console.log("Keeping existing gallery images");
          mergedGalleryImages = therapistData.gallery_images;
        }
        
        // Update the gallery images in the database data
        dbData.gallery_images = mergedGalleryImages;
        
        // Update existing therapist record
        console.log("Updating existing therapist record...");
        const { data, error: updateTherapistError } = await supabase
          .from('therapists')
          .update(dbData)
          .eq('id', userId)
          .select();
          
        if (updateTherapistError) {
          console.error("Error updating therapist:", updateTherapistError);
          throw updateTherapistError;
        }
        
        console.log("Successfully updated therapist record:", data);
        toast.success(`プロフィールが更新されました (${activeTab}タブ)`, {
          duration: 5000,
          position: 'top-center'
        });
      }
      
      if (onSuccess) onSuccess(updatedProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("プロフィールの保存に失敗しました");
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
    if (profile.avatarUrl) {
      setProfilePreviewUrl(profile.avatarUrl);
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

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {/* Circular Profile Picture Uploader */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="プロフィール画像をアップロード"
          />
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-md relative">
            {profilePreviewUrl ? (
              <img 
                src={profilePreviewUrl} 
                alt="プロフィール" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                <User size={40} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <UploadCloud size={30} className="text-white" />
            </div>
          </div>
          <p className="text-center mt-2 text-sm text-muted-foreground">プロフィール写真</p>
        </div>
      </div>
      
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
                value={profile.name}
                onChange={handleInputChange}
                className="w-full"
                placeholder="セラピスト名"
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

            <div>
              <Label htmlFor="location" className="block text-sm font-medium mb-1">
                エリア (都道府県) <span className="text-red-500">*</span>
              </Label>
              <PrefectureSelect
                value={profile.serviceAreas?.prefecture || ''}
                onValueChange={(value) => handleServiceAreasChange('prefecture', value)}
              />
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
        
        <TabsContent value="profile">
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
            
            <div>
              <Label htmlFor="gallery-images" className="block text-sm font-medium mb-1">
                ギャラリー画像
              </Label>
              {/* Only show file input if total images is less than 5 */}
              {(galleryPreviews.length + (profile.galleryImages?.length || 0) < 5) ? (
                <>
                  <Input
                    id="gallery-images"
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryImagesChange}
                    className="w-full"
                    multiple
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    最大5枚まで選択できます。現在 {galleryPreviews.length + (profile.galleryImages?.length || 0)}/5 枚。
                  </p>
                </>
              ) : (
                <p className="text-sm text-amber-500 font-medium mt-1 mb-2">
                  画像の最大数（5枚）に達しています。新しい画像を追加するには、既存の画像を削除してください。
                </p>
              )}
              
              {/* Gallery image previews */}
              {(galleryPreviews.length > 0 || profile.galleryImages?.length > 0) && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {/* Show new uploads */}
                  {galleryPreviews.map((url, index) => (
                    <div key={`preview-${index}`} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={url} 
                        alt={`Gallery preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = [...galleryPreviews];
                          URL.revokeObjectURL(newPreviews[index]);
                          newPreviews.splice(index, 1);
                          setGalleryPreviews(newPreviews);
                          
                          const newImages = [...galleryImages];
                          newImages.splice(index, 1);
                          setGalleryImages(newImages);
                        }}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Show existing gallery images */}
                  {profile.galleryImages && profile.galleryImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={url} 
                        alt={`Gallery image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                        aria-label="Remove existing image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                value={profile.questionnaireData.mood} 
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
                value={profile.questionnaireData.therapistType} 
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
                value={profile.questionnaireData.treatmentType} 
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
                value={profile.questionnaireData.therapistAge} 
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
    </form>
  );
};

export default TherapistProfileForm;
