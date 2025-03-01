
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { BookingSlot } from '../utils/types';
import { format } from 'date-fns';

interface AvailabilityCalendarProps {
  availabilitySlots: BookingSlot[];
}

const AvailabilityCalendar = ({ availabilitySlots }: AvailabilityCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Convert array of booking slots to a map for easier access
  const availabilityMap = availabilitySlots.reduce((acc, slot) => {
    acc[slot.date] = slot.timeSlots;
    return acc;
  }, {} as Record<string, string[]>);

  // Get time slots for the selected date
  const getTimeSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return availabilityMap[dateKey] || [];
  };

  // Get all dates that have available time slots
  const availableDates = availabilitySlots.map(slot => new Date(slot.date));
  
  // Determine if a date has available slots (for highlighting in the calendar)
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      availableDate.getDate() === date.getDate() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getFullYear() === date.getFullYear()
    );
  };

  const timeSlots = getTimeSlotsForSelectedDate();

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Availability</h3>
        <p className="text-sm text-muted-foreground">
          Select a date to see available time slots
        </p>
      </div>
      
      <div className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border w-full"
          modifiers={{
            available: availableDates
          }}
          modifiersStyles={{
            available: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: 'var(--primary)'
            }
          }}
        />
      </div>
      
      <div className="p-4 border-t">
        <h4 className="font-medium">
          {selectedDate 
            ? `Available times for ${format(selectedDate, 'EEEE, MMMM d')}`
            : 'Select a date to see available times'}
        </h4>
        
        {selectedDate && (
          <div className="mt-3">
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((timeSlot, index) => (
                  <button
                    key={index}
                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors"
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No available time slots for this date.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
