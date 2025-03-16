
import { useState } from 'react';
import { Therapist } from '@/utils/types';
import { Calendar, Clock, MapPin, Users, DollarSign, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

// Japanese prefecture list
const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", 
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", 
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", 
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", 
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", 
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", 
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

// Meeting methods
const meetingMethods = [
  { value: "meetup", label: "待ち合わせ" },
  { value: "hotel", label: "ホテル" },
  { value: "home", label: "自宅" }
];

// Time slots
const timeSlots = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", 
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

interface BookingRequestFormProps {
  therapist: Therapist;
  onClose?: () => void;
}

const BookingRequestForm = ({ therapist, onClose }: BookingRequestFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [budget, setBudget] = useState<string>("");
  const [prefecture, setPrefecture] = useState<string>("");
  const [locationDetails, setLocationDetails] = useState<string>("");
  const [meetingMethod, setMeetingMethod] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!selectedDate || !selectedTime || !budget || !prefecture || !meetingMethod) {
      toast.error("すべての必須項目を入力してください");
      setIsSubmitting(false);
      return;
    }

    try {
      // Combine date and time
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const dateTime = new Date(dateTimeString);

      // Insert booking into Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          therapist_id: therapist.id.toString(), // Convert number to string if needed
          date: dateTime.toISOString(),
          price: parseInt(budget),
          location: `${prefecture} ${locationDetails}`,
          notes: notes,
          status: 'pending'
        });

      if (error) {
        console.error("Error submitting booking:", error);
        toast.error("予約リクエストの送信に失敗しました", {
          description: error.message,
        });
      } else {
        toast.success("予約リクエストを送信しました", {
          description: `${therapist.name}へのリクエストが送信されました。確認後に連絡があります。`,
        });
        
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">予約リクエストを送信</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              希望日 <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'yyyy年MM月dd日 (EEE)', { locale: ja })
                  ) : (
                    <span>日付を選択してください</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ja}
                  className="pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              希望時間 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={selectedTime === time ? "default" : "outline"}
                  className={cn(
                    "text-center",
                    selectedTime === time && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              希望予算 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="budget"
                type="number"
                placeholder="例: 15000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-8"
                min="0"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
            </div>
          </div>

          {/* Prefecture */}
          <div className="space-y-2">
            <Label htmlFor="prefecture" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              エリア（都道府県） <span className="text-red-500">*</span>
            </Label>
            <Select value={prefecture} onValueChange={setPrefecture}>
              <SelectTrigger>
                <SelectValue placeholder="都道府県を選択" />
              </SelectTrigger>
              <SelectContent>
                {prefectures.map((pref) => (
                  <SelectItem key={pref} value={pref}>
                    {pref}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Details */}
          <div className="space-y-2">
            <Label htmlFor="locationDetails" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              場所の詳細
            </Label>
            <Textarea
              id="locationDetails"
              placeholder="例: ○○駅周辺、○○ホテル、など"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              rows={2}
            />
          </div>

          {/* Meeting Method */}
          <div className="space-y-2">
            <Label htmlFor="meetingMethod" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              合流方法 <span className="text-red-500">*</span>
            </Label>
            <Select value={meetingMethod} onValueChange={setMeetingMethod}>
              <SelectTrigger>
                <SelectValue placeholder="合流方法を選択" />
              </SelectTrigger>
              <SelectContent>
                {meetingMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              備考・要望など
            </Label>
            <Textarea
              id="notes"
              placeholder="その他の希望や質問などがあればご記入ください"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "送信中..." : "予約リクエストを送信"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BookingRequestForm;
