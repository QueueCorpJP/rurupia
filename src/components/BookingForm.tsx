
import { useState } from 'react';
import { Therapist, Service, BookingSlot } from '../utils/types';
import { Calendar, Clock, CalendarCheck } from 'lucide-react';
import { availableSlots } from '../utils/data';
import { toast } from 'sonner';

interface BookingFormProps {
  therapist: Therapist;
  onClose?: () => void;
}

const BookingForm = ({ therapist, onClose }: BookingFormProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const slots = availableSlots[therapist.id] || [];
  
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const getAvailableTimesForDate = (date: string): string[] => {
    const slotForDate = slots.find(slot => slot.date === date);
    return slotForDate ? slotForDate.timeSlots : [];
  };
  
  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    
    // Here you would typically make an API call to book the appointment
    toast.success('Booking successful!', {
      description: `Your appointment with ${therapist.name} has been booked for ${selectedDate} at ${selectedTime}.`,
    });
    
    if (onClose) onClose();
  };
  
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Book a Session</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              Select a Service
            </h3>
            
            <div className="grid gap-3">
              {therapist.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className={`flex justify-between items-center p-4 rounded-lg border transition-all ${
                    selectedService?.id === service.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${service.price}</p>
                    <p className="text-sm text-muted-foreground">{service.duration} min</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {step === 2 && selectedService && (
          <div className="space-y-6">
            <div>
              <button 
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4"
              >
                ← Back to services
              </button>
              
              <div className="bg-muted/50 p-3 rounded-lg mb-6">
                <h4 className="font-medium">{selectedService.name}</h4>
                <p className="text-sm text-muted-foreground">${selectedService.price} • {selectedService.duration} min</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                Select a Date
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.date}
                    onClick={() => handleDateSelect(slot.date)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedDate === slot.date 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-muted-foreground">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {selectedDate && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-medium flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                  Select a Time
                </h3>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {getAvailableTimesForDate(selectedDate).map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedTime === time 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedTime && (
              <button
                onClick={handleBooking}
                className="w-full mt-6 bg-primary text-primary-foreground flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md transition-all hover:bg-primary/90 animate-fade-in"
              >
                <CalendarCheck className="h-4 w-4" />
                Confirm Booking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
