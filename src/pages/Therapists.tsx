
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TherapistCard from '../components/TherapistCard';
import TherapistFilters from '../components/TherapistFilters';
import { Therapist, Filters } from '@/utils/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

const Therapists = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const { data, error } = await supabase
          .from('therapists')
          .select('*');
        
        if (error) {
          console.error("Error fetching therapists:", error);
          toast.error("セラピスト情報の取得に失敗しました");
          return;
        }
        
        // Transform data to match Therapist type
        const transformedData: Therapist[] = data.map((item, index) => ({
          id: parseInt(item.id) || index + 1,
          name: item.name,
          specialties: item.specialties,
          experience: item.experience,
          rating: parseFloat(item.rating),
          reviews: item.reviews,
          description: item.description,
          longDescription: item.long_description || "",
          location: item.location,
          price: item.price,
          availability: item.availability,
          imageUrl: item.image_url || "/placeholder.svg",
          services: [],
          qualifications: item.qualifications
        }));
        
        setTherapists(transformedData);
        setFilteredTherapists(transformedData);
      } catch (error) {
        console.error("Error in fetchTherapists:", error);
        toast.error("エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const handleFilterChange = (filters: Filters) => {
    const filtered = therapists.filter((therapist) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = therapist.name.toLowerCase().includes(searchLower);
        const locationMatch = therapist.location.toLowerCase().includes(searchLower);
        const specialtiesMatch = therapist.specialties.some(
          (specialty) => specialty.toLowerCase().includes(searchLower)
        );
        
        if (!nameMatch && !locationMatch && !specialtiesMatch) {
          return false;
        }
      }
      
      // Specialties filter
      if (filters.specialties.length > 0) {
        const hasSpecialty = filters.specialties.some((specialty) =>
          therapist.specialties.includes(specialty)
        );
        
        if (!hasSpecialty) {
          return false;
        }
      }
      
      // Price filter
      if (filters.minPrice !== null && therapist.price < filters.minPrice) {
        return false;
      }
      
      if (filters.maxPrice !== null && therapist.price > filters.maxPrice) {
        return false;
      }
      
      // Rating filter
      if (filters.minRating !== null && therapist.rating < filters.minRating) {
        return false;
      }
      
      // Availability filter
      if (filters.availability && filters.availability.length > 0) {
        const hasAvailability = filters.availability.some((day) =>
          therapist.availability.includes(day)
        );
        
        if (!hasAvailability) {
          return false;
        }
      }
      
      // Location filter
      if (filters.location && filters.location.length > 0) {
        if (!filters.location.includes(therapist.location)) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredTherapists(filtered);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a Therapist</h1>
          <p className="text-muted-foreground mt-2">
            下記のセラピストはただいま<span className="text-green-600 font-semibold">営業中</span>です。ご予約はお早めに。
          </p>
        </div>
        
        <TherapistFilters onFilterChange={handleFilterChange} />
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
              <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
              <div className="w-3 h-3 rounded-full bg-primary loading-dot"></div>
            </div>
          </div>
        ) : filteredTherapists.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-xl font-semibold">No therapists found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters to find therapists that match your criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTherapists.map((therapist) => (
              <TherapistCard key={therapist.id.toString()} therapist={therapist} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Therapists;
