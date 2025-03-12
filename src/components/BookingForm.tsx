
import { useState } from 'react';
import { Therapist, Service, BookingSlot } from '../utils/types';
import { Calendar, Clock, CalendarCheck, ClipboardList } from 'lucide-react';
import { availableSlots } from '../utils/data';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import BookingRequestForm from './BookingRequestForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BookingFormProps {
  therapist: Therapist;
  onClose?: () => void;
}

const BookingForm = ({ therapist, onClose }: BookingFormProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<'direct' | 'request'>('direct');
  
  const slots = availableSlots[therapist.id] || [];
  
  // Translate service names to Japanese
  const japaneseServices = therapist.services.map(service => ({
    ...service,
    name: service.name === "Swedish Massage" ? "スウェーディッシュマッサージ" :
          service.name === "Deep Tissue Massage" ? "ディープティシューマッサージ" :
          service.name === "Sports Massage" ? "スポーツマッサージ" :
          service.name === "Hot Stone Massage" ? "ホットストーンマッサージ" :
          service.name === "Aromatherapy Massage" ? "アロマセラピーマッサージ" :
          service.name === "Relaxation Massage" ? "リラクゼーションマッサージ" :
          service.name,
    description: "リラックス効果の高い優しいタッチで全身の疲れを癒します。"
  }));
  
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
    toast.success('予約が完了しました！', {
      description: `${therapist.name}との予約が${format(new Date(selectedDate), 'yyyy年MM月dd日', { locale: ja })}の${selectedTime}に確定しました。`,
    });
    
    if (onClose) onClose();
  };
  
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">セッションを予約</h2>
        
        <Tabs 
          defaultValue="direct" 
          onValueChange={(value) => setBookingType(value as 'direct' | 'request')}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              直接予約
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              リクエスト予約
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                  メニューを選択
                </h3>
                
                <div className="grid gap-3">
                  {japaneseServices.map((service) => (
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
                        <p className="font-medium">¥{(service.price * 150).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{service.duration}分</p>
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
                    ← メニュー選択に戻る
                  </button>
                  
                  <div className="bg-muted/50 p-3 rounded-lg mb-6">
                    <h4 className="font-medium">{
                      selectedService.name === "Swedish Massage" ? "スウェーディッシュマッサージ" :
                      selectedService.name === "Deep Tissue Massage" ? "ディープティシューマッサージ" :
                      selectedService.name === "Sports Massage" ? "スポーツマッサージ" :
                      selectedService.name === "Hot Stone Massage" ? "ホットストーンマッサージ" :
                      selectedService.name === "Aromatherapy Massage" ? "アロマセラピーマッサージ" :
                      selectedService.name === "Relaxation Massage" ? "リラクゼーションマッサージ" :
                      selectedService.name
                    }</h4>
                    <p className="text-sm text-muted-foreground">¥{(selectedService.price * 150).toLocaleString()} • {selectedService.duration}分</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    日付を選択
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
                        <p className="font-medium">{format(new Date(slot.date), 'MM月dd日', { locale: ja })}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(slot.date), 'EEE', { locale: ja })}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedDate && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                      時間を選択
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
                    予約を確定する
                  </button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="request">
            <BookingRequestForm therapist={therapist} onClose={onClose} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BookingForm;
