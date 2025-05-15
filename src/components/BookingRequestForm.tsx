import { useState, useEffect } from 'react';
import { Therapist } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDay, subMonths, addMonths, startOfMonth, endOfMonth, isSameDay, isSameMonth, isBefore, eachDayOfInterval, addDays, isAfter } from 'date-fns';
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
import { sendBookingNotificationToTherapist, sendBookingNotificationToStore } from '@/utils/notification-service';

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

// Day of week mapping (0 = Sunday, 1 = Monday, etc.)
const dayOfWeekMap: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

// Add the dayMap for consistency with other components
const dayMap: { [key: string]: string } = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
};

// Update TherapistWithAvailability type to match the Supabase database structure
type DatabaseTherapist = {
  id: string;
  name: string;
  image_url: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  experience: number;
  availability: string[];
  qualifications: string[];
  specialties: string[];
  created_at: string;
  long_description: string;
  working_days?: string[];
  working_hours?: {
    [key: string]: string[];
  } | {
    start: string;
    end: string;
  } | string;
};

interface BookingRequestFormProps {
  therapist: Therapist;
  onClose?: () => void;
}

const BookingRequestForm = ({ therapist, onClose }: BookingRequestFormProps) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<string>("");
  const [meetingMethod, setMeetingMethod] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableDaysByMonth, setAvailableDaysByMonth] = useState<Record<string, Date[]>>({});
  const [noAvailability, setNoAvailability] = useState(false);

  // Fetch therapist's working hours when component loads
  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        console.log(`Fetching data for therapist ID: ${therapist.id}`);
        
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', String(therapist.id))
          .single();
          
        if (error) {
          console.error('Error fetching therapist data:', error);
          setNoAvailability(true);
          return;
        }
        
        // Generate available days
        if (data) {
          // Type cast data to the database structure
          const therapistData = data as DatabaseTherapist;
          console.log('Therapist data:', therapistData);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time part
          
          // End date (one month from today)
          const endDate = addDays(new Date(), 60); // 2 months for good coverage
          
          // Create an array of available dates
          let availableDates: Date[] = [];
          
          // Create an array of all days to check in the interval
          const checkDays = eachDayOfInterval({ start: today, end: endDate });
          
          // Add more detailed logging to diagnose issues
          console.log('Working Days debug info:');
          if (therapistData.working_days) {
            console.log('  Working days array: ', therapistData.working_days);
            console.log('  Working days array type: ', Array.isArray(therapistData.working_days) ? 'Array' : typeof therapistData.working_days);
            console.log('  Working days array length: ', therapistData.working_days.length);
            therapistData.working_days.forEach((day, i) => {
              console.log(`  Day ${i}: '${day}' (type: ${typeof day})`);
            });
          } else {
            console.log('  No working days defined');
          }
          
          // Process availability first - this is day of week based recurring availability
          if (therapistData.availability && Array.isArray(therapistData.availability) && therapistData.availability.length > 0) {
            console.log('Processing availability days of week:', therapistData.availability);
            
            // For each day in the next 2 months, check if the day of week is in the availability array
            checkDays.forEach(day => {
              const dayOfWeek = dayOfWeekMap[getDay(day)];
              if (therapistData.availability.includes(dayOfWeek)) {
                // Check if this date isn't already in availableDates from working_days
                if (!availableDates.some(d => isSameDay(d, day))) {
                  availableDates.push(day);
                }
              }
            });
          }
          
          // Check if working hours are defined
          if (therapistData.working_hours) {
            try {
              const workingHours = typeof therapistData.working_hours === 'string' 
                ? JSON.parse(therapistData.working_hours) 
                : therapistData.working_hours;
              
              // If they have day-specific hours or general hours
              if ((Object.keys(workingHours).some(key => 
                    Array.isArray(workingHours[key]) && workingHours[key].length > 0)) || 
                  (workingHours.start && workingHours.end)) {
                console.log('Therapist has working hours:', workingHours);
                // Only add dates if we don't already have them from availability
                if (availableDates.length === 0) {
                  // Get dates from working_days if possible
                  if (therapistData.working_days && Array.isArray(therapistData.working_days) && therapistData.working_days.length > 0) {
                    console.log('Processing working_days dates:', therapistData.working_days);
                    
                    therapistData.working_days.forEach((dateStr: string) => {
                      try {
                        // Try to parse as a date first
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime()) && isAfter(date, today) && isBefore(date, endDate)) {
                          availableDates.push(date);
                        }
                      } catch (e) {
                        // Not a date, might be a day name
                      }
                      
                      // Check if it's a day name (like "monday", "tuesday", etc.)
                      if (typeof dateStr === 'string') {
                        // Try different formats to be more forgiving
                        const dayLower = dateStr.toLowerCase();
                        console.log('Checking if day name:', dayLower);
                        
                        // Direct check first
                        if (Object.values(dayOfWeekMap).includes(dayLower)) {
                          console.log(`Found direct match for day name: ${dayLower}`);
                          const dayOfWeekDates = checkDays.filter(day => 
                            dayOfWeekMap[getDay(day)].toLowerCase() === dayLower);
                          console.log(`Found ${dayOfWeekDates.length} dates for ${dayLower}`);
                          availableDates.push(...dayOfWeekDates);
                        } 
                        // Check if it's one of the known day keys
                        else if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(dayLower)) {
                          console.log(`Found predefined day name: ${dayLower}`);
                          const dayNum = Object.entries(dayOfWeekMap).find(([_, val]) => val.toLowerCase() === dayLower)?.[0];
                          if (dayNum) {
                            const dayOfWeekDates = checkDays.filter(day => getDay(day) === Number(dayNum));
                            console.log(`Found ${dayOfWeekDates.length} dates for ${dayLower} using day number ${dayNum}`);
                            availableDates.push(...dayOfWeekDates);
                          } else {
                            console.log(`Could not find day number for ${dayLower}`);
                          }
                        } else {
                          console.log(`Day format not recognized: ${dayLower}`);
                        }
                      }
                    });
                  } else {
                    // If no working_days specified but they have working hours, 
                    // assume they work all days in the next 2 months
                    console.log('No working_days but has working hours - assuming all days available');
                    availableDates = eachDayOfInterval({ start: today, end: endDate });
                  }
                }
              }
            } catch (e) {
              console.error('Error parsing working hours:', e);
            }
          } else {
            // Process specific working days if no other availability is found
            if (availableDates.length === 0 && 
                therapistData.working_days && Array.isArray(therapistData.working_days) && 
                therapistData.working_days.length > 0) {
              console.log('Processing working_days as last resort:', therapistData.working_days);
              
              therapistData.working_days.forEach((dateStr: string) => {
                try {
                  const date = new Date(dateStr);
                  if (!isNaN(date.getTime()) && isAfter(date, today) && isBefore(date, endDate)) {
                    availableDates.push(date);
                  }
                } catch (e) {
                  console.error('Error parsing date:', dateStr, e);
                }
              });
            }
          }
          
          if (availableDates.length === 0) {
            console.log('No availability data found from standard methods');
            
            // Last resort: If therapist has working hours, try to use default days
            if (therapistData.working_hours) {
              try {
                const workingHours = typeof therapistData.working_hours === 'string' 
                  ? JSON.parse(therapistData.working_hours) 
                  : therapistData.working_hours;
                
                if (workingHours.start && workingHours.end) {
                  console.log("Using working hours as fallback for availability");
                  
                  // Find which days of the week should be considered working days
                  let workingDaysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']; // Default to weekdays
                  
                  if (therapistData.working_days && Array.isArray(therapistData.working_days) && therapistData.working_days.length > 0) {
                    // Try to extract day names from working_days
                    const dayNames = therapistData.working_days.filter(day => 
                      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day.toLowerCase())
                    );
                    
                    if (dayNames.length > 0) {
                      workingDaysOfWeek = dayNames.map(d => d.toLowerCase());
                      console.log("Using explicit working days of week:", workingDaysOfWeek);
                    }
                  }
                  
                  // Create dates for all working days in the next 2 months
                  checkDays.forEach(day => {
                    const dayOfWeek = dayOfWeekMap[getDay(day)].toLowerCase();
                    if (workingDaysOfWeek.includes(dayOfWeek)) {
                      availableDates.push(day);
                    }
                  });
                  
                  console.log(`Added ${availableDates.length} dates as fallback availability`);
                  setNoAvailability(availableDates.length === 0);
                  
                  // Update byMonth directly since we're bypassing the normal flow
                  if (availableDates.length > 0) {
                    const byMonth: Record<string, Date[]> = {};
                    
                    availableDates.forEach(date => {
                      const monthKey = format(date, 'yyyy-MM');
                      if (!byMonth[monthKey]) {
                        byMonth[monthKey] = [];
                      }
                      byMonth[monthKey].push(date);
                    });
                    
                    setAvailableDaysByMonth(byMonth);
                    setNoAvailability(false);
                    return; // Exit early since we've handled this case
                  }
                }
              } catch (e) {
                console.error("Error in fallback availability processing:", e);
              }
            }
            
            // If we get here, genuinely no availability
            setNoAvailability(true);
          } else {
            console.log('Final available dates:', availableDates);
            
            // Group by month
            const byMonth: Record<string, Date[]> = {};
            
            availableDates.forEach(date => {
              const monthKey = format(date, 'yyyy-MM');
              if (!byMonth[monthKey]) {
                byMonth[monthKey] = [];
              }
              byMonth[monthKey].push(date);
            });
            
            setAvailableDaysByMonth(byMonth);
            setNoAvailability(false);
          }
        }
      } catch (error) {
        console.error('Error in fetchTherapistData:', error);
        setNoAvailability(true);
      }
    };
    
    fetchTherapistData();
  }, [therapist.id]);
  
  // Add a helper function to generate time slots from start and end times
  const generateTimeSlotsFromRange = (start: string, end: string, intervalMinutes: number = 60): string[] => {
    try {
      // Parse hours and minutes
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);
      
      // Convert to minutes for easier calculation
      let startTimeInMinutes = startHour * 60 + startMinute;
      let endTimeInMinutes = endHour * 60 + endMinute;
      
      // Handle overnight hours
      if (endTimeInMinutes <= startTimeInMinutes) {
        endTimeInMinutes += 24 * 60; // Add 24 hours
      }
      
      const slots: string[] = [];
      
      // Generate slots at the specified interval
      for (let timeInMinutes = startTimeInMinutes; timeInMinutes < endTimeInMinutes - intervalMinutes; timeInMinutes += intervalMinutes) {
        const slotStartHour = Math.floor((timeInMinutes % (24 * 60)) / 60);
        const slotStartMinute = timeInMinutes % 60;
        const slotEndHour = Math.floor(((timeInMinutes + intervalMinutes) % (24 * 60)) / 60);
        const slotEndMinute = (timeInMinutes + intervalMinutes) % 60;
        
        const formattedStart = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
        const formattedEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
        
        slots.push(`${formattedStart} - ${formattedEnd}`);
      }
      
      console.log('Generated slots from range:', slots);
      return slots;
    } catch (error) {
      console.error('Error generating time slots from range:', error);
      return [];
    }
  };

  // Update the fetchAvailableTimeSlots function
  const fetchAvailableTimeSlots = async (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    setIsLoadingTimeSlots(true);
    try {
      // Format the date 
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log(`Fetching time slots for date: ${formattedDate} and therapist ID: ${therapist.id}`);
      
      // Get therapist data from Supabase
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', String(therapist.id))
        .single();
        
      if (error) {
        console.error('Error fetching therapist data:', error);
        setAvailableTimeSlots([]);
        return;
      }
      
      console.log('Therapist data for time slots:', data);
      
      // Type cast data to the proper structure
      const therapistData = data as DatabaseTherapist;
      
      // If no working_hours field, use default time slots
      if (!therapistData.working_hours) {
        console.log('No working_hours data found');
        setAvailableTimeSlots([]);
        return;
      }
      
      // Parse working_hours - handle both string and object formats
      const workingHours = typeof therapistData.working_hours === 'string' 
        ? JSON.parse(therapistData.working_hours) 
        : therapistData.working_hours;
      
      console.log('Working hours data:', workingHours);
      
      // Check if therapist is available on this day (based on working_days)
      const dayOfWeek = dayOfWeekMap[getDay(selectedDate)];
      console.log(`Selected day of week: ${dayOfWeek}`);
      
      // Check if the therapist has day-specific availability
      if (workingHours[dayOfWeek] && Array.isArray(workingHours[dayOfWeek]) && workingHours[dayOfWeek].length > 0) {
        console.log(`Found time slots for ${dayOfWeek}:`, workingHours[dayOfWeek]);
        setAvailableTimeSlots(workingHours[dayOfWeek]);
      } 
      // Check if the therapist has start/end time range format
      else if (workingHours.start && workingHours.end) {
        console.log(`Found working hours range: ${workingHours.start} - ${workingHours.end}`);
        
        // Check if the selected day is in working_days
        const isWorkingDay = !therapistData.working_days || 
          therapistData.working_days.some(day => {
            // Check if it's a direct match with the day of week
            if (day.toLowerCase() === dayOfWeek.toLowerCase()) {
              return true;
            }
            
            // Check if it's one of the predefined days
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day.toLowerCase())) {
              return day.toLowerCase() === dayOfWeek.toLowerCase();
            }
            
            return false;
          }) ||
          (therapistData.availability && therapistData.availability.includes(dayOfWeek));
        
        if (isWorkingDay) {
          // Generate time slots from the start-end range
          const generatedSlots = generateTimeSlotsFromRange(workingHours.start, workingHours.end);
          
          if (generatedSlots.length > 0) {
            setAvailableTimeSlots(generatedSlots);
            return;
          }
        } else {
          console.log(`${dayOfWeek} is not a working day for this therapist`);
        }
        
        // No valid slots found
        setAvailableTimeSlots([]);
      } else {
        console.log(`No specific time slots for ${dayOfWeek}`);
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error getting available time slots:', error);
      setAvailableTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Add back the useEffect hook that was removed
  useEffect(() => {
    fetchAvailableTimeSlots(selectedDate);
  }, [selectedDate, therapist.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!selectedDate || !selectedTime || !meetingMethod) {
      toast.error("すべての必須項目を入力してください");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("ログインしていません");
        setIsSubmitting(false);
        return;
      }

      // Extract start time from the time slot (format: "10:00 - 11:00")
      const startTime = selectedTime.split(' - ')[0];
      
      // Combine date and time
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${startTime}:00`;
      console.log("Creating date with string:", dateTimeString);
      const dateTime = new Date(dateTimeString);
      
      // Validate the date object is valid
      if (isNaN(dateTime.getTime())) {
        throw new Error(`Invalid date created from: ${dateTimeString}`);
      }

      // Extract therapist location (prefecture)
      const therapistLocation = therapist.location || "不明";

      // Format full location
      const fullLocation = locationDetails 
        ? `${therapistLocation} ${locationDetails}` 
        : therapistLocation;

      // Include meeting method in notes
      const meetingMethodLabel = meetingMethod === "meetup" ? "待ち合わせ" : 
                                 meetingMethod === "hotel" ? "ホテル" : 
                                 meetingMethod === "home" ? "自宅" : 
                                 meetingMethod;
      const notesWithMethod = notes ? `${notes}\n\n合流方法: ${meetingMethodLabel}` : `合流方法: ${meetingMethodLabel}`;

      console.log("Submitting booking with date:", dateTime.toISOString());
      
      // Insert booking into Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          therapist_id: String(therapist.id), 
          user_id: user.id,
          date: dateTime.toISOString(),
          price: therapist.price,
          location: fullLocation,
          notes: notesWithMethod
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
        
        // Close the form if onClose provided
        if (onClose) onClose();
        
        try {
          // Get user's name for notification
          const { data: userData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();
            
          const userName = userData?.name || user.email || 'クライアント';
            
          // Send notification to therapist
          await sendBookingNotificationToTherapist(String(therapist.id), userName, dateTime);
            
          // Send notification to store
          await sendBookingNotificationToStore(String(therapist.id), userName, dateTime);
        } catch (notificationError) {
          console.error('Error sending booking notifications:', notificationError);
          // Continue with redirection even if notifications fail
        }
        
        // Redirect to user bookings page
        navigate('/user-bookings');
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden animate-fade-in">
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">予約リクエストを送信</h2>
        </div>

        {noAvailability ? (
          <div className="text-center p-8 space-y-4">
            <p className="text-muted-foreground">
              このセラピストは現在予約を受け付けていません。
            </p>
            <Button onClick={onClose}>戻る</Button>
          </div>
        ) : (
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
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium">
                        {format(currentDate, 'yyyy年MM月', { locale: ja })}
                      </h3>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                          variant="outline"
                          className="h-7 w-7 bg-transparent p-0"
                          disabled={isBefore(startOfMonth(currentDate), new Date())}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                          variant="outline"
                          className="h-7 w-7 bg-transparent p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {eachDayOfInterval({ 
                        start: startOfMonth(currentDate), 
                        end: endOfMonth(currentDate) 
                      }).map((day, i) => {
                        // Check if the day is available based on therapist availability
                        const isAvailable = availableDaysByMonth[format(currentDate, 'yyyy-MM')]?.some(
                          date => isSameDay(date, day)
                        );
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                        const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());
                        
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              if (isAvailable && !isPast) {
                                setSelectedDate(day);
                                setSelectedTime(null); // Reset time selection
                              }
                            }}
                            disabled={!isAvailable || isPast}
                            className={cn(
                              "h-9 w-9 p-0 font-normal text-center text-sm rounded-md",
                              !isSameMonth(day, currentDate) && "text-muted-foreground/30",
                              isPast && "text-muted-foreground/50 cursor-not-allowed",
                              isSelected && "bg-primary text-primary-foreground",
                              isAvailable && !isSelected && !isPast && "bg-primary/10 text-primary hover:bg-primary/20",
                              !isAvailable && !isPast && "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {format(day, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                希望時間 <span className="text-red-500">*</span>
              </Label>
              
              {isLoadingTimeSlots ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span className="ml-2">時間スロットを読み込み中...</span>
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">利用可能な時間帯</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableTimeSlots.map((slot, index) => (
                      <button
                        key={index}
                        className={`p-2 rounded border ${
                          selectedTime === slot 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedTime(slot)}
                        type="button"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {selectedDate 
                    ? "この日に予約可能な時間はありません。他の日を選択してください。" 
                    : "希望日を先に選択してください"}
                </div>
              )}
            </div>

            {/* Prefecture - Now static display */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                エリア（都道府県）
              </Label>
              <div className="p-2 border rounded-md bg-muted/30">
                {therapist.location || "不明"}
              </div>
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

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                備考
              </Label>
              <Textarea
                id="notes"
                placeholder="何かリクエストや質問があれば入力してください"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Fee Information */}
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <h4 className="font-medium mb-2">料金情報</h4>
              <p className="text-sm text-muted-foreground mb-1">
                セラピスト料金: {therapist.price.toLocaleString()}円 / 時間
              </p>
              <p className="text-xs text-muted-foreground">
                ※ 実際の料金は予約確定時に決定します。
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  送信中...
                </>
              ) : (
                "予約リクエストを送信"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingRequestForm;
