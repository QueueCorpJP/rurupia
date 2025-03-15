
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { availableSlots } from '../utils/data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AvailabilityCalendarProps {
  therapistId: number;
}

type SlotStatus = 'available' | 'partial' | 'booked' | 'past';

const getSlotStatusIcon = (status: SlotStatus) => {
  switch (status) {
    case 'available':
      return <Check className="h-3 w-3 text-green-500" />;
    case 'partial':
      return <div className="h-3 w-3 bg-amber-400 rounded-full" />;
    case 'booked':
      return <X className="h-3 w-3 text-red-500" />;
    case 'past':
      return <div className="h-3 w-3 bg-gray-300 rounded-full" />;
  }
};

const getSlotTooltip = (status: SlotStatus) => {
  switch (status) {
    case 'available':
      return "予約可能";
    case 'partial':
      return "一部の時間帯で予約可能";
    case 'booked':
      return "予約済み";
    case 'past':
      return "過去の日付";
  }
};

const AvailabilityCalendar = ({ therapistId }: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const therapistSlots = availableSlots[therapistId] || [];
  
  // Convert string dates to Date objects
  const availableDates = therapistSlots.map(slot => new Date(slot.date));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleDateClick = (day: Date) => {
    // Allow clicking on any date to see details or mark as selected
    setSelectedDate(isSameDay(day, selectedDate as Date) ? null : day);
  };
  
  const getAvailableTimesForDate = (date: Date) => {
    const slot = therapistSlots.find(slot => isSameDay(new Date(slot.date), date));
    return slot ? slot.timeSlots : [];
  };
  
  const getDateStatus = (day: Date): SlotStatus => {
    // Past dates
    if (day < new Date() && !isToday(day)) {
      return 'past';
    }
    
    // Check if the date is in available slots
    const slot = therapistSlots.find(slot => isSameDay(new Date(slot.date), day));
    
    if (!slot) {
      return 'booked'; // No slot available means fully booked
    }
    
    // If there are some time slots available
    if (slot.timeSlots.length > 0) {
      // If there are fewer than 4 time slots, consider it partially booked
      return slot.timeSlots.length < 4 ? 'partial' : 'available';
    }
    
    return 'booked';
  };
  
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
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-md hover:bg-muted"
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
          const status = getDateStatus(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          
          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleDateClick(day)}
                    className={`p-2 text-center text-sm rounded-md flex flex-col items-center justify-center ${
                      !isSameMonth(day, currentDate)
                        ? 'text-muted-foreground/30'
                        : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : status === 'available'
                        ? 'hover:bg-green-100'
                        : status === 'partial'
                        ? 'hover:bg-amber-100'
                        : status === 'booked'
                        ? 'hover:bg-red-100'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span>{format(day, 'd')}</span>
                    {isSameMonth(day, currentDate) && (
                      <span className="mt-1">{getSlotStatusIcon(status)}</span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(day, 'yyyy年MM月dd日 (EEE)', { locale: ja })}</p>
                  <p>{getSlotTooltip(status)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {selectedDate && (
        <div className="mt-6 animate-fade-in">
          <h4 className="text-sm font-medium mb-2">
            {format(selectedDate, 'yyyy年MM月dd日 (EEE)', { locale: ja })}の予約可能時間:
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {getAvailableTimesForDate(selectedDate).length > 0 ? (
              getAvailableTimesForDate(selectedDate).map((time) => (
                <div
                  key={time}
                  className="text-center p-2 text-sm bg-muted rounded-md hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  {time}
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center p-4 text-muted-foreground">
                この日は予約できません
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">予約状況</h4>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <div className="mr-2">{getSlotStatusIcon('available')}</div>
            <span className="text-xs">予約可能</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2">{getSlotStatusIcon('partial')}</div>
            <span className="text-xs">一部の時間帯で予約可能</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2">{getSlotStatusIcon('booked')}</div>
            <span className="text-xs">予約済み</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
