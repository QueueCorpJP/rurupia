import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import TherapistCard from "../components/TherapistCard";
import TherapistFilters from "../components/TherapistFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Therapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    specialties: [],
    experience: 0,
    priceRange: [0, 50000],
    availability: [],
  });

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('therapists').select('*');

        // Apply filters if any
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        
        if (filters.specialties.length > 0) {
          query = query.contains('specialties', filters.specialties);
        }
        
        if (filters.experience > 0) {
          query = query.gte('experience', filters.experience);
        }
        
        // Price range
        query = query.gte('price', filters.priceRange[0]);
        query = query.lte('price', filters.priceRange[1]);
        
        if (filters.availability.length > 0) {
          query = query.overlaps('availability', filters.availability);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching therapists:", error);
          toast.error("セラピスト情報の取得に失敗しました");
          return;
        }
        
        setTherapists(data || []);
      } catch (error) {
        console.error("Error in fetchTherapists:", error);
        toast.error("エラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapists();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">セラピスト一覧</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <TherapistFilters onFilterChange={handleFilterChange} />
          </div>
          
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : therapists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {therapists.map((therapist: any) => (
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
