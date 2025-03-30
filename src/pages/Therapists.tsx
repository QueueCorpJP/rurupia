import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TherapistCard from "../components/TherapistCard";
import TherapistFilters from "../components/TherapistFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Therapist } from "../utils/types";

const Therapists = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState({
    location: "",
    specialties: [] as string[],
    experience: 0,
    priceRange: [0, 50000] as [number, number],
    availability: [] as string[],
  });

  // Parse query parameters when component mounts or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Get search term
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
    
    // Get location filter
    const locationParam = params.get('location');
    
    // Get price range
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    
    // Get date/time filters
    const dateParam = params.get('date');
    const timeSlotParam = params.get('timeSlot');
    
    // Update filters based on URL parameters
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Update location
      if (locationParam) {
        newFilters.location = locationParam;
      }
      
      // Update price range
      if (minPrice || maxPrice) {
        newFilters.priceRange = [
          minPrice ? parseInt(minPrice, 10) : prev.priceRange[0],
          maxPrice ? parseInt(maxPrice, 10) : prev.priceRange[1]
        ];
      }
      
      // Add date/time handling if needed
      // For now, we'll just pass these as URL parameters but not use them in the filter
      // as the current filter system doesn't handle specific dates/times
      
      return newFilters;
    });
    
  }, [location]);

  // Fetch therapists when filters or search term change
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('therapists').select('*');

        // Apply text search if provided
        if (searchTerm) {
          // Only apply search for terms that are meaningful (3+ characters)
          // or exact matches for shorter terms
          if (searchTerm.length >= 3) {
            // Proper filter syntax with .or() method for Supabase
            query = query.or(
              `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
            );
          } else {
            // For short search terms (1-2 chars), only look for exact matches
            // or matches at the beginning of words to avoid random matches
            query = query.or(
              `name.ilike.${searchTerm}%,name.ilike.% ${searchTerm}%`
            );
          }
        }
        
        // Apply location filter if provided
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        
        // Apply specialty filters if any
        if (filters.specialties.length > 0) {
          query = query.contains('specialties', filters.specialties);
        }
        
        // Apply experience filter if provided
        if (filters.experience > 0) {
          query = query.gte('experience', filters.experience);
        }
        
        // Apply price range filter
        query = query.gte('price', filters.priceRange[0]);
        query = query.lte('price', filters.priceRange[1]);
        
        // Apply availability filter if provided
        if (filters.availability.length > 0) {
          query = query.overlaps('availability', filters.availability);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching therapists:", error);
          toast.error("セラピスト情報の取得に失敗しました");
          return;
        }
        
        // Map the Supabase data to the format expected by TherapistCard
        const mappedTherapists = (data || []).map((therapist: any) => ({
          id: therapist.id,
          name: therapist.name || "名前なし",
          imageUrl: therapist.image_url || "", // Set to empty string to trigger the avatar fallback
          description: therapist.description || "詳細情報はありません",
          location: therapist.location || "場所未設定",
          price: therapist.price || 0,
          rating: therapist.rating || 0,
          reviews: therapist.reviews || 0,
          availability: therapist.availability || ["月", "水", "金"],
          qualifications: therapist.qualifications || [],
          specialties: therapist.specialties || [],
          services: [] // Services will be loaded in the detail view
        }));
        
        setTherapists(mappedTherapists);
      } catch (error) {
        console.error("Error in fetchTherapists:", error);
        toast.error("エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapists();
  }, [filters, searchTerm]);

  // Function to handle filter changes from TherapistFilters component
  const handleFilterChange = (newFilters: any) => {
    // Update URL with new filters
    const params = new URLSearchParams(location.search);
    
    // Update location parameter
    if (newFilters.location) {
      params.set('location', newFilters.location);
    } else {
      params.delete('location');
    }
    
    // Update price range parameters
    if (newFilters.priceRange && newFilters.priceRange.length === 2) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    
    // Keep the search parameter if it exists
    const search = params.get('search');
    if (!search && searchTerm) {
      params.set('search', searchTerm);
    }
    
    // Update URL
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
    // Update filters state
    setFilters(newFilters);
  };

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">セラピスト一覧</h1>
        
        {/* Display search term if present */}
        {searchTerm && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              「{searchTerm}」の検索結果: {therapists.length}件
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            {/* Pass current filters to TherapistFilters */}
            <TherapistFilters onFilterChange={handleFilterChange} />
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : therapists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {therapists.map((therapist: Therapist) => (
                  <TherapistCard key={therapist.id.toString()} therapist={therapist} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">セラピストが見つかりませんでした</h3>
                <p className="text-muted-foreground">検索条件を変更して再度お試しください。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Therapists;
