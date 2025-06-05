import { useState, useEffect, useRef } from "react";
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
  // Track whether URL updates came from filter state changes
  const isUrlUpdateFromState = useRef(false);
  // Track previous filters to avoid unnecessary fetches
  const prevFiltersRef = useRef<string>('');
  // Track whether initialization is complete
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState({
    location: "",
    specialties: [] as string[],
    experience: 0,
    priceRange: [0, 50000] as [number, number],
    availability: [] as string[],
    mbtiType: "",
    mood: "",
    therapistType: "",
    treatmentType: "",
    therapistAge: ""
  });

  // Parse URL parameters once when component mounts
  useEffect(() => {
    const parseUrlParameters = () => {
      console.log('Therapists: Initial parsing of URL parameters', location.search);
      
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
      
      // Get questionnaire params
      const mbtiType = params.get('mbtiType');
      const mood = params.get('mood');
      const therapistType = params.get('therapistType');
      const treatmentType = params.get('treatmentType');
      const therapistAge = params.get('therapistAge');
      
      // Get budget parameter and convert to price range if needed
      const budget = params.get('budget');
      let priceRange = [0, 50000] as [number, number];
      
      if (minPrice || maxPrice) {
        priceRange = [
          minPrice ? parseInt(minPrice, 10) : 0,
          maxPrice ? parseInt(maxPrice, 10) : 50000
        ];
      } else if (budget) {
        // Map budget to price range similar to Index.tsx
        switch (budget) {
          case 'under5000':
            priceRange = [0, 5000];
            break;
          case '5000to10000':
            priceRange = [5000, 10000];
            break;
          case '10000to20000':
            priceRange = [10000, 20000];
            break;
          case 'over20000':
            priceRange = [20000, 50000];
            break;
          // If 'noPreference' is selected, keep the full range
          case 'noPreference':
            priceRange = [0, 50000];
            break;
        }
      }
      
      // Update filters based on URL parameters
      setFilters(prev => {
        const newFilters = {
          ...prev,
          location: locationParam || '',
          priceRange: priceRange,
          mbtiType: mbtiType || '',
          mood: mood || '',
          therapistType: therapistType || '',
          treatmentType: treatmentType || '',
          therapistAge: therapistAge || ''
        };
        
        console.log('Therapists: Initialized filters from URL params', newFilters);
        return newFilters;
      });
      
      // Mark initialization as complete
      setIsInitialized(true);
    };
    
    parseUrlParameters();
  }, []); // Empty dependency array means this runs once on mount
  
  // Handle URL changes after initial mount
  useEffect(() => {
    // Skip if initialization is not complete or URL was just updated by handleFilterChange
    if (!isInitialized || isUrlUpdateFromState.current) {
      console.log('Therapists: Skipping URL parse because initialization not complete or URL was just updated by state change');
      isUrlUpdateFromState.current = false;
      return;
    }
    
    console.log('Therapists: Parsing URL parameters after init', location.search);
    
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
    
    // Get questionnaire params
    const mbtiType = params.get('mbtiType');
    const mood = params.get('mood');
    const therapistType = params.get('therapistType');
    const treatmentType = params.get('treatmentType');
    const therapistAge = params.get('therapistAge');
    
    // Get budget parameter and convert to price range if needed
    const budget = params.get('budget');
    let priceRange = [0, 50000] as [number, number];
    
    if (minPrice || maxPrice) {
      priceRange = [
        minPrice ? parseInt(minPrice, 10) : 0,
        maxPrice ? parseInt(maxPrice, 10) : 50000
      ];
    } else if (budget) {
      // Map budget to price range similar to Index.tsx
      switch (budget) {
        case 'under5000':
          priceRange = [0, 5000];
          break;
        case '5000to10000':
          priceRange = [5000, 10000];
          break;
        case '10000to20000':
          priceRange = [10000, 20000];
          break;
        case 'over20000':
          priceRange = [20000, 50000];
          break;
        // If 'noPreference' is selected, keep the full range
        case 'noPreference':
          priceRange = [0, 50000];
          break;
      }
    }
    
    // Update filters based on URL parameters
    setFilters(prev => {
      const newFilters = {
        ...prev,
        location: locationParam || '',
        priceRange: priceRange,
        mbtiType: mbtiType || '',
        mood: mood || '',
        therapistType: therapistType || '',
        treatmentType: treatmentType || '',
        therapistAge: therapistAge || ''
      };
      
      console.log('Therapists: Updated filters from URL params after init', newFilters);
      return newFilters;
    });
    
  }, [location.search, isInitialized]); // Depend on search parameters and initialization state

  // Debug log - uncomment to see current filters
  useEffect(() => {
    console.log('Therapists: Current filters updated:', filters);
  }, [filters]);

  // Fetch therapists when filters or search term change
  useEffect(() => {
    // Skip if initialization is not complete
    if (!isInitialized) {
      console.log('Therapists: Skipping fetch because not initialized');
      return;
    }
  
    // Convert current filters to string for comparison
    const filtersString = JSON.stringify({ ...filters, searchTerm });
    
    // Skip fetch if filters haven't actually changed
    if (filtersString === prevFiltersRef.current) {
      console.log('Therapists: Skipping fetch because filters unchanged');
      return;
    }
    
    // Update previous filters reference
    prevFiltersRef.current = filtersString;
    
    const fetchTherapists = async () => {
      try {
        console.log('Starting therapist fetch with filters:', {
          ...filters,
          searchTerm: searchTerm || 'none'
        });
        
        setIsLoading(true);
        // Type assertion to simplify the query type and avoid deep instantiation
        let query = supabase
          .from('therapists')
          .select('*') as any;  // Use 'any' type to avoid TypeScript deep instantiation errors

        // Apply search term filter if provided
        if (searchTerm && searchTerm.trim()) {
          const searchPattern = `%${searchTerm.trim()}%`;
          query = query.or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`);
        }
        
        // Apply location filter if provided
        if (filters.location && filters.location.trim()) {
          query = query.ilike('location', `%${filters.location.trim()}%`);
        }
        
        // Apply specialty filters if any
        if (filters.specialties && filters.specialties.length > 0) {
          query = query.contains('specialties', filters.specialties);
        }
        
        // Apply experience filter if provided
        if (filters.experience && filters.experience > 0) {
          query = query.gte('experience', filters.experience);
        }
        
        // Apply price range filters
        if (filters.priceRange && filters.priceRange.length === 2) {
          // Apply min price (if it's greater than 0)
          if (filters.priceRange[0] > 0) {
            query = query.gte('price', filters.priceRange[0]);
          }
          
          // Apply max price (if it's less than the max possible value)
          if (filters.priceRange[1] < 50000) {
            query = query.lte('price', filters.priceRange[1]);
          }
        }
        
        // Apply availability filter if provided
        if (filters.availability && filters.availability.length > 0) {
          query = query.overlaps('availability', filters.availability);
        }
        
        // Apply MBTI filter if provided
        if (filters.mbtiType && filters.mbtiType !== 'unknown') {
          query = query.eq('mbti_type', filters.mbtiType);
        }

        console.log('Questionnaire filters:', filters);

        // Apply questionnaire filters - use simple approach to avoid TypeScript errors
        // Instead of trying to combine filters, apply them one by one directly
        if (filters.mood && filters.mood.trim()) {
          // Use the correct PostgreSQL operator for JSONB text value comparison
          query = query.filter(`questionnaire_data->>'mood'`, 'eq', filters.mood);
          console.log('Applied mood filter:', filters.mood);
        }

        if (filters.therapistType && filters.therapistType.trim()) {
          query = query.filter(`questionnaire_data->>'therapistType'`, 'eq', filters.therapistType);
          console.log('Applied therapist type filter:', filters.therapistType);
        }

        if (filters.treatmentType && filters.treatmentType.trim()) {
          query = query.filter(`questionnaire_data->>'treatmentType'`, 'eq', filters.treatmentType);
          console.log('Applied treatment type filter:', filters.treatmentType);
        }

        if (filters.therapistAge && filters.therapistAge !== 'noPreference' && filters.therapistAge.trim()) {
          query = query.filter(`questionnaire_data->>'therapistAge'`, 'eq', filters.therapistAge);
          console.log('Applied therapist age filter:', filters.therapistAge);
        }

        console.log('Executing Supabase query for therapists with filters:', filters);
        // Add a timeout to prevent hanging forever in case of network issues
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
          setTimeout(() => reject(new Error('Supabase query timeout')), 10000);
        });

        const { data, error } = await Promise.race([
          query,
          timeoutPromise
        ]) as any;
        
        // Debug: Log the raw SQL query if possible
        console.log('Query executed, data items returned:', data?.length || 0);
        
        if (error) {
          console.error("Error fetching therapists:", error);
          toast.error("セラピスト情報の取得に失敗しました");
          setTherapists([]);
          return;
        }
        
        console.log(`Found ${data?.length || 0} matching therapists`);
        
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
          workingDays: therapist.working_days || [],
          workingHours: therapist.working_hours || null,
          qualifications: therapist.qualifications || [],
          specialties: therapist.specialties || [],
          mbtiType: therapist.mbti_type || 'unknown',
          questionnaireData: therapist.questionnaire_data || {},
          services: [] // Services will be loaded in the detail view
        }));
        
        setTherapists(mappedTherapists);
        console.log('Therapists state updated with', mappedTherapists.length, 'therapists');
      } catch (error) {
        console.error("Error in fetchTherapists:", error);
        toast.error("エラーが発生しました");
        setTherapists([]);
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchTherapists();
  }, [filters, searchTerm, isInitialized]);

  // Function to handle filter changes from TherapistFilters component
  const handleFilterChange = (newFilters: any) => {
    // Set flag to indicate URL update is coming from state change
    isUrlUpdateFromState.current = true;
    
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
    
    // Update questionnaire filters
    const questionnaireParams = ['mbtiType', 'mood', 'therapistType', 'treatmentType', 'therapistAge'];
    questionnaireParams.forEach(param => {
      if (newFilters[param] && newFilters[param] !== 'unknown') {
        params.set(param, newFilters[param]);
      } else {
        params.delete(param);
      }
    });
    
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
            {/* Only render TherapistFilters after initialization is complete */}
            {isInitialized ? (
              <TherapistFilters 
                onFilterChange={handleFilterChange} 
                initialFilters={filters} 
              />
            ) : (
              <div className="bg-card rounded-lg shadow-sm border mb-4 p-3">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            )}
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
