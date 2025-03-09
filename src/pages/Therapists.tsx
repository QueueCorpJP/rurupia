
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TherapistCard from '../components/TherapistCard';
import TherapistFilters from '../components/TherapistFilters';
import { therapists } from '../utils/data';
import { Therapist, Filters } from '../utils/types';

const Therapists = () => {
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>(therapists);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for a smooth experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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
            Browse our selection of professional male massage therapists.
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
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Therapists;
