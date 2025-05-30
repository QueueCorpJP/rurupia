import { supabase } from '@/integrations/supabase/client';

export interface TherapistSearchFilters {
  location?: string;
  mbtiType?: string;
  ageRange?: string;
  heightRange?: string;
  serviceStyles?: string[];
  facialFeatures?: string;
  bodyTypes?: string[];
  personalityTraits?: string[];
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface TherapistSearchResult {
  id: string;
  name: string;
  description: string;
  location: string;
  detailedArea?: string;
  price: number;
  mbtiType?: string;
  age?: string;
  height?: string;
  serviceStyle?: string[];
  facialFeatures?: string;
  bodyType?: string[];
  personalityTraits?: string[];
  imageUrl?: string;
  rating: number;
  reviewCount: number;
}

export const searchTherapists = async (
  filters: TherapistSearchFilters
): Promise<{
  data: TherapistSearchResult[];
  count: number;
  error: string | null;
}> => {
  try {
    // Prepare search parameters
    const {
      location,
      mbtiType,
      ageRange,
      heightRange,
      serviceStyles,
      facialFeatures,
      bodyTypes,
      personalityTraits,
      minPrice,
      maxPrice,
      searchTerm,
      limit = 20,
      offset = 0
    } = filters;

    // Call the enhanced search function
    const { data, error } = await supabase.rpc(
      'search_therapists_with_filters',
      {
        p_location: location,
        p_mbti_type: mbtiType,
        p_age_range: ageRange,
        p_height_range: heightRange,
        p_service_styles: serviceStyles,
        p_facial_features: facialFeatures,
        p_body_types: bodyTypes,
        p_personality_traits: personalityTraits,
        p_min_price: minPrice,
        p_max_price: maxPrice,
        p_search_term: searchTerm,
        p_limit: limit,
        p_offset: offset
      }
    );

    if (error) {
      console.error('Error searching therapists:', error);
      return {
        data: [],
        count: 0,
        error: error.message
      };
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('therapists')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (countError) {
      console.error('Error counting therapists:', countError);
    }

    // Map data to frontend format
    const formattedData: TherapistSearchResult[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      location: item.location,
      detailedArea: item.detailed_area,
      price: item.price,
      mbtiType: item.mbti_type,
      age: item.age,
      height: item.height,
      serviceStyle: item.service_style,
      facialFeatures: item.facial_features,
      bodyType: item.body_type,
      personalityTraits: item.personality_traits,
      imageUrl: item.image_url,
      rating: item.rating,
      reviewCount: item.review_count
    }));

    return {
      data: formattedData,
      count: count || 0,
      error: null
    };
  } catch (err) {
    console.error('Unexpected error searching therapists:', err);
    return {
      data: [],
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};

export const getTherapistById = async (
  id: string
): Promise<{
  data: TherapistSearchResult | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching therapist:', error);
      return {
        data: null,
        error: error.message
      };
    }

    // Get rating and review count
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('therapist_id', id);

    let rating = 0;
    let reviewCount = 0;

    if (!reviewError && reviewData) {
      reviewCount = reviewData.length;
      rating =
        reviewCount > 0
          ? reviewData.reduce((sum: number, item: any) => sum + item.rating, 0) /
            reviewCount
          : 0;
    }

    // Format the therapist data
    const formattedData: TherapistSearchResult = {
      id: data.id,
      name: data.name,
      description: data.description,
      location: data.location,
      detailedArea: data.detailed_area,
      price: data.price,
      mbtiType: data.mbti_type,
      age: data.age,
      height: data.height,
      serviceStyle: data.service_style,
      facialFeatures: data.facial_features,
      bodyType: data.body_type,
      personalityTraits: data.personality_traits,
      imageUrl: data.image_url,
      rating,
      reviewCount
    };

    return {
      data: formattedData,
      error: null
    };
  } catch (err) {
    console.error('Unexpected error fetching therapist:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}; 