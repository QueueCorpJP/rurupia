
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TherapistProfile } from "@/utils/types";
import { UploadCloud } from "lucide-react";

interface TherapistProfileFormProps {
  therapist?: TherapistProfile;
  existingData?: any;
  onCancel?: () => void;
  onSuccess?: (data: any) => void;
}

export const TherapistProfileForm = ({ 
  therapist, 
  existingData, 
  onCancel, 
  onSuccess 
}: TherapistProfileFormProps) => {
  // Use existingData if provided, otherwise use therapist
  const [profile, setProfile] = useState(existingData || therapist || {
    workingDays: [],
    workingHours: { start: "09:00", end: "18:00" },
    pricePerHour: 0,
    bio: "",
    serviceAreas: {}
  });
  
  const weekdays = [
    { id: "monday", label: "月曜" },
    { id: "tuesday", label: "火曜" },
    { id: "wednesday", label: "水曜" },
    { id: "thursday", label: "木曜" },
    { id: "friday", label: "金曜" },
    { id: "saturday", label: "土曜" },
    { id: "sunday", label: "日曜" },
  ];

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving profile:", profile);
    // Add success toast
    if (onSuccess) onSuccess(profile);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">プロフィール設定</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">プロフィール写真</h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-64 h-64 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">写真をアップロード</p>
                </div>
              )}
              <input id="dropzone-file" type="file" className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">ギャラリー写真 (最大5枚まで)</h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">写真をアップロード</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" multiple />
            </label>
          </div>
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
          <Label htmlFor="hobbies">趣味</Label>
          <Input 
            id="hobbies" 
            placeholder="映画鑑賞、料理、旅行など"
            value={profile.hobbies?.join(', ') || ""}
            onChange={(e) => setProfile({...profile, hobbies: e.target.value.split(',').map(h => h.trim())})}
          />
        </div>

        <div className="space-y-2">
          <Label>対応エリア (都道府県)</Label>
          <Input 
            placeholder="東京都"
            value={profile.serviceAreas?.prefecture || ""}
            onChange={(e) => setProfile({
              ...profile, 
              serviceAreas: {...profile.serviceAreas, prefecture: e.target.value} as any
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>詳細エリア (区市町村)</Label>
          <Input 
            placeholder="渋谷区、新宿区"
            value={profile.serviceAreas?.cities?.join('、') || ""}
            onChange={(e) => setProfile({
              ...profile, 
              serviceAreas: {
                ...profile.serviceAreas, 
                cities: e.target.value.split('、').map(c => c.trim())
              } as any
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
                  checked={profile.workingDays.includes(day.label.charAt(0))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setProfile({
                        ...profile,
                        workingDays: [...profile.workingDays, day.label.charAt(0)]
                      });
                    } else {
                      setProfile({
                        ...profile,
                        workingDays: profile.workingDays.filter(d => d !== day.label.charAt(0))
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
                  value={profile.workingHours.start} 
                  onChange={(e) => setProfile({
                    ...profile, 
                    workingHours: {...profile.workingHours, start: e.target.value}
                  })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endTime" className="text-sm text-muted-foreground">終了時間</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={profile.workingHours.end} 
                  onChange={(e) => setProfile({
                    ...profile, 
                    workingHours: {...profile.workingHours, end: e.target.value}
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
                type="text" 
                className="pl-8"
                value={profile.pricePerHour.toString()}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                  setProfile({...profile, pricePerHour: parseInt(onlyNums) || 0});
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
            value={profile.bio}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">性病検査結果</h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">証明書をアップロード</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" />
            </label>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full bg-black text-white hover:bg-black/90"
        >
          プロフィールを更新
        </Button>
        
        {onCancel && (
          <Button 
            onClick={onCancel} 
            variant="outline"
            className="w-full mt-2"
          >
            キャンセル
          </Button>
        )}
      </div>
    </div>
  );
};
