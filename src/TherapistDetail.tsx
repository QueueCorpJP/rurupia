
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BookingForm from '../components/BookingForm';
import TherapistGallery from '../components/TherapistGallery';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { therapists } from '../utils/data';
import { Therapist, BookingSlot } from '../utils/types';
import { 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  Calendar, 
  MessageSquare, 
  ArrowLeft, 
  Image as ImageIcon
} from 'lucide-react';

const TherapistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'book' | 'availability'>('book');
  
  // Mock additional images for the gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // Mock availability data
  const [availabilityData, setAvailabilityData] = useState<BookingSlot[]>([]);

  useEffect(() => {
    // Simulate loading for a smooth experience
    const timer = setTimeout(() => {
      if (id) {
        const foundTherapist = therapists.find(t => t.id === parseInt(id));
        setTherapist(foundTherapist || null);
        
        if (foundTherapist) {
          // Generate additional mock images for the gallery
          const mockImages = [
            foundTherapist.imageUrl,
            `https://source.unsplash.com/random/800x600?massage,spa&sig=${foundTherapist.id}1`,
            `https://source.unsplash.com/random/800x600?massage,wellness&sig=${foundTherapist.id}2`,
            `https://source.unsplash.com/random/800x600?therapist,spa&sig=${foundTherapist.id}3`,
          ];
          setGalleryImages(mockImages);
          
          // Generate mock availability data
          const today = new Date();
          const mockAvailability: BookingSlot[] = [];
          
          // Generate availability for the next 30 days
          for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Only add availability for dates that match the therapist's availability days
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (foundTherapist.availability.includes(dayName)) {
              const timeSlots = [
                '9:00 AM', 
                '10:30 AM', 
                '1:00 PM',
                '2:30 PM', 
                '4:00 PM'
              ];
              
              mockAvailability.push({
                date: date.toISOString().split('T')[0],
                timeSlots: timeSlots
              });
            }
          }
          
          setAvailabilityData(mockAvailability);
        }
      }
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!therapist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Therapist Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The therapist you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/therapists')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Therapists
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => navigate('/therapists')}
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Therapists
      </button>
      
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Gallery */}
          <TherapistGallery images={galleryImages} />
          
          <div className="rounded-lg overflow-hidden border">            
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{therapist.name}</h1>
                  <div className="flex items-center mt-2 text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
                      <span className="font-medium">{therapist.rating}</span>
                      <span className="text-muted-foreground ml-1">({therapist.reviews} reviews)</span>
                    </div>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {therapist.location}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ${therapist.price}
                    <span className="text-muted-foreground font-normal"> / hour</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {therapist.experience} years experience
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => navigate(`/messages/${therapist.id}`)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
                <button
                  onClick={() => window.location.href = `tel:+1234567890`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Book Now
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {therapist.specialties.map((specialty, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
              
              <div className="mt-6">
                <h2 className="font-semibold text-lg mb-2">About</h2>
                <p className="text-muted-foreground">
                  {therapist.longDescription}
                </p>
              </div>
              
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 mt-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-3">
                    <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                    Qualifications
                  </h3>
                  <ul className="space-y-2">
                    {therapist.qualifications.map((qualification, index) => (
                      <li key={index} className="text-sm">
                        • {qualification}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center mb-3">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Availability
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {therapist.availability.map((day, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="font-semibold text-lg mb-3">Services Offered</h2>
                <div className="space-y-3">
                  {therapist.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {service.duration} min
                          </span>
                          <span className="font-medium">
                            ${service.price}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden sticky top-20">
            <div className="p-0">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('book')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm flex items-center justify-center gap-1 ${
                    activeTab === 'book'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Book a Session
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`flex-1 py-3 px-4 text-center font-medium text-sm flex items-center justify-center gap-1 ${
                    activeTab === 'availability'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  View Availability
                </button>
              </div>
              
              <div className="p-1">
                {activeTab === 'book' ? (
                  <BookingForm therapist={therapist} />
                ) : (
                  <AvailabilityCalendar availabilitySlots={availabilityData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TherapistDetail;
