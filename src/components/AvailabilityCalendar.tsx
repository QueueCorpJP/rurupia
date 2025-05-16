import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays, isAfter, isBefore, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilityCalendarProps {
  therapistId: string | number;
}

// Day of week mapping between number and Japanese text
const dayOfWeekMap: Record<number, string> = {
  0: '日',
  1: '月',
  2: '火',
  3: '水',
  4: '木',
  5: '金',
  6: '土'
};

// Update the DatabaseTherapist type definition
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

const AvailabilityCalendar = ({ therapistId }: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [therapistData, setTherapistData] = useState<DatabaseTherapist | null>(null);
  const [hasAnyAvailability, setHasAnyAvailability] = useState<boolean>(false);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate the end date for availability (one month from today)
  const endDate = addDays(new Date(), 30);
  
  // Fetch therapist availability data from Supabase
  useEffect(() => {
    const fetchTherapistAvailability = async () => {
      setIsLoading(true);
      try {
        // Log the query we're about to make
        console.log(`Fetching availability data for therapist ID: ${therapistId}`);
        
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', String(therapistId))
          .single();
        
        if (error) {
          console.error('Error fetching therapist availability:', error);
          setIsLoading(false);
          return;
        }
        
        // Log the fetched data to debug
        console.log('Therapist data fetched:', data);
        
        // Type cast to our expected database structure
        const therapistData = data as DatabaseTherapist;
        setTherapistData(therapistData);
        
        // Process the available days
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part
        
        // Create an array of available dates
        let availableDates: Date[] = [];
        let hasAvailabilityInfo = false;
        
        // Process specific working days if they exist
        if (therapistData.working_days && Array.isArray(therapistData.working_days) && therapistData.working_days.length > 0) {
          console.log('Processing working_days:', therapistData.working_days);
          hasAvailabilityInfo = true;
          
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
        } else {
          console.log('No working_days found or it is empty');
        }
        
        // Process recurring availability (day of week)
        if (therapistData.availability && Array.isArray(therapistData.availability) && therapistData.availability.length > 0) {
          console.log('Processing availability:', therapistData.availability);
          hasAvailabilityInfo = true;
          
          // For each day in the next month, check if the day of week is in the availability array
          const checkDays = eachDayOfInterval({ start: today, end: endDate });
          
          checkDays.forEach(day => {
            const dayOfWeek = dayOfWeekMap[getDay(day)];
            if (therapistData.availability && therapistData.availability.includes(dayOfWeek)) {
              // Check if this date isn't already in availableDates from working_days
              if (!availableDates.some(d => isSameDay(d, day))) {
                availableDates.push(day);
              }
            }
          });
        } else {
          console.log('No availability found or it is empty');
        }
        
        // Only set hasAnyAvailability to true if we have actual available dates
        setHasAnyAvailability(availableDates.length > 0 && hasAvailabilityInfo);
        console.log('Final available dates:', availableDates, 'hasAnyAvailability:', availableDates.length > 0 && hasAvailabilityInfo);
        setAvailableDays(availableDates);
        
      } catch (error: any) {
        console.error('Error in fetchTherapistAvailability:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTherapistAvailability();
  }, [therapistId]);
  
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleDateClick = (day: Date) => {
    const isAvailable = availableDays.some(date => isSameDay(date, day));
    if (isAvailable) {
      setSelectedDate(day);
      
      // Get available time slots for this day
      const timeSlots = getAvailableTimesForDate(day);
      setAvailableTimeSlots(timeSlots);
    }
  };
  
  // Add helper function to generate time slots from a time range
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
        
        const formattedTime = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMinute.toString().padStart(2, '0')}`;
        slots.push(formattedTime);
      }
      
      return slots;
    } catch (error) {
      console.error('Error generating time slots from range:', error);
      return [];
    }
  };
  
  // Update the getAvailableTimesForDate function
  const getAvailableTimesForDate = (date: Date): string[] => {
    if (!therapistData) {
      return [];
    }
    
    try {
      if (!therapistData.working_hours) {
        return [];
      }
      
      // Parse working_hours
      const workingHours = typeof therapistData.working_hours === 'string' 
        ? JSON.parse(therapistData.working_hours) 
        : therapistData.working_hours;
      
      // First, check day-specific format
      const dayOfWeek = dayOfWeekMap[getDay(date)].toLowerCase();
      
      if (workingHours[dayOfWeek] && Array.isArray(workingHours[dayOfWeek]) && workingHours[dayOfWeek].length > 0) {
        return workingHours[dayOfWeek];
      }
      
      // Then, check start/end format
      if (workingHours.start && workingHours.end) {
        console.log(`Found working hours range: ${workingHours.start} - ${workingHours.end}`);
        
        // Check if the selected day is in working_days or availability
        const isWorkingDay = 
          (therapistData.working_days && therapistData.working_days.some(day => {
            try {
              // Check if it's a date string that matches the selected date
              const dateObj = new Date(day);
              return !isNaN(dateObj.getTime()) && isSameDay(dateObj, date);
            } catch (e) {
              // Not a valid date, might be a day name
              return false;
            }
          })) ||
          (therapistData.availability && therapistData.availability.includes(dayOfWeekMap[getDay(date)]));
        
        if (isWorkingDay) {
          // Generate time slots from the start-end range
          const generatedSlots = generateTimeSlotsFromRange(workingHours.start, workingHours.end);
          
          if (generatedSlots.length > 0) {
            return generatedSlots;
          }
        }
      }
      
      // No hours found for this day
      return [];
    } catch (error) {
      console.error('Error parsing working hours:', error);
      return [];
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
          {format(currentDate, 'yyyy年MM月', { locale: ja })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-md hover:bg-muted"
            disabled={isBefore(monthStart, new Date())}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-md hover:bg-muted"
            disabled={isAfter(monthStart, endDate)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
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
        {daysInMonth.map((day, i) => {
          const isAvailable = availableDays.some(date => isSameDay(date, day));
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());
          
          return (
            <button
              key={i}
              onClick={() => handleDateClick(day)}
              disabled={!isAvailable || isPast}
              className={`p-2 text-center text-sm rounded-md ${
                !isSameMonth(day, currentDate)
                  ? 'text-muted-foreground/30'
                  : isPast
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isAvailable
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
      
      {selectedDate && (
        <div className="mt-6 animate-fade-in">
          <h4 className="text-sm font-medium mb-2">
            {format(selectedDate, 'yyyy年MM月dd日 (EEE)', { locale: ja })}の予約可能時間:
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((time) => (
                <div
                  key={time}
                  className="text-center p-2 text-sm bg-muted rounded-md hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  {time}
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center p-4 text-sm text-muted-foreground">
                この日に予約可能な時間はありません
              </div>
            )}
          </div>
        </div>
      )}
      
      {!isLoading && !hasAnyAvailability && (
        <div className="text-center p-4 text-sm text-red-500">
          このセラピストは現在予約を受け付けていません
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
