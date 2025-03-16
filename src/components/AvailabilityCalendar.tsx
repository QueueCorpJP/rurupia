
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { availableSlots } from '../utils/data';

interface AvailabilityCalendarProps {
  therapistId: string | number;
}

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
    const isAvailable = availableDates.some(date => isSameDay(date, day));
    if (isAvailable) {
      setSelectedDate(day);
    }
  };
  
  const getAvailableTimesForDate = (date: Date) => {
    const slot = therapistSlots.find(slot => isSameDay(new Date(slot.date), date));
    return slot ? slot.timeSlots : [];
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
          const isAvailable = availableDates.some(date => isSameDay(date, day));
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          
          return (
            <button
              key={i}
              onClick={() => handleDateClick(day)}
              disabled={!isAvailable}
              className={`p-2 text-center text-sm rounded-md ${
                !isSameMonth(day, currentDate)
                  ? 'text-muted-foreground/30'
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
            {getAvailableTimesForDate(selectedDate).map((time) => (
              <div
                key={time}
                className="text-center p-2 text-sm bg-muted rounded-md hover:bg-primary/10 hover:text-primary cursor-pointer"
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
