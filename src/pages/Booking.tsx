import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import BookingForm from "../components/BookingForm";
import { Therapist } from "../utils/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!id) {
        setError("セラピストIDが指定されていません");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('therapists')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Error fetching therapist:", error);
          setError("セラピストが見つかりませんでした");
          return;
        }
        
        if (!data) {
          setError("セラピストが見つかりませんでした");
          return;
        }
        
        // Map Supabase data to the Therapist format
        const mappedTherapist: Therapist = {
          id: data.id,
          name: data.name || "",
          imageUrl: data.image_url || "",
          description: data.description || "",
          location: data.location || "",
          price: data.price || 0,
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          availability: data.availability || [],
          qualifications: data.qualifications || [],
          specialties: data.specialties || [],
          services: [] // Services will be loaded separately if needed
        };
        
        setTherapist(mappedTherapist);
      } catch (err) {
        console.error("Error in fetchTherapist:", err);
        setError("データ取得中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapist();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !therapist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">{error || "セラピストが見つかりません"}</h2>
          <p className="text-muted-foreground mt-2">
            お探しのセラピストは存在しないか、削除されました。
          </p>
          <button
            onClick={() => navigate('/therapists')}
            className="inline-flex items-center mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            全てのセラピストに戻る
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8">
        <button
          onClick={() => navigate(`/therapist/${id}`)}
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          セラピスト詳細に戻る
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{therapist.name} へ予約</h1>
            <BookingForm 
              therapist={therapist} 
              onClose={() => navigate(`/therapist/${id}`)} 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Booking;
