
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current date
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Previous month for comparison
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    // First day of current month
    const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1)
    
    // First day of previous month
    const firstDayPreviousMonth = new Date(previousMonthYear, previousMonth, 1)
    
    // Last day of previous month
    const lastDayPreviousMonth = new Date(currentYear, currentMonth, 0)
    
    // Calculate monthly page views
    const { count: currentMonthPageViews, error: currentPageViewsError } = await supabaseClient
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('view_date', firstDayCurrentMonth.toISOString())
    
    if (currentPageViewsError) throw currentPageViewsError
    
    const { count: previousMonthPageViews, error: previousPageViewsError } = await supabaseClient
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('view_date', firstDayPreviousMonth.toISOString())
      .lt('view_date', lastDayPreviousMonth.toISOString())
    
    if (previousPageViewsError) throw previousPageViewsError
    
    // Calculate monthly users
    const { count: currentMonthUsers, error: currentUsersError } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayCurrentMonth.toISOString())
    
    if (currentUsersError) throw currentUsersError
    
    const { count: previousMonthUsers, error: previousUsersError } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayPreviousMonth.toISOString())
      .lt('created_at', lastDayPreviousMonth.toISOString())
    
    if (previousUsersError) throw previousUsersError
    
    // Calculate monthly bookings
    const { count: currentMonthBookings, error: currentBookingsError } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayCurrentMonth.toISOString())
    
    if (currentBookingsError) throw currentBookingsError
    
    const { count: previousMonthBookings, error: previousBookingsError } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayPreviousMonth.toISOString())
      .lt('created_at', lastDayPreviousMonth.toISOString())
    
    if (previousBookingsError) throw previousBookingsError
    
    // Calculate average rating
    const { data: therapistsData, error: therapistsError } = await supabaseClient
      .from('therapists')
      .select('rating')
    
    if (therapistsError) throw therapistsError
    
    const totalRating = therapistsData.reduce((sum, therapist) => sum + Number(therapist.rating), 0)
    const currentAverageRating = therapistsData.length > 0 ? Number((totalRating / therapistsData.length).toFixed(1)) : 0
    
    // Get previous average rating from analytics
    const { data: previousRatingData, error: previousRatingError } = await supabaseClient
      .from('analytics')
      .select('metric_value')
      .eq('metric_name', 'average_rating')
      .eq('period', 'previous_month')
      .order('recorded_date', { ascending: false })
      .limit(1)
    
    if (previousRatingError) throw previousRatingError
    
    const previousAverageRating = previousRatingData.length > 0 ? Number(previousRatingData[0].metric_value) : currentAverageRating
    
    // Update analytics metrics
    const metrics = [
      {
        name: 'monthly_page_views',
        current: currentMonthPageViews || 0,
        previous: previousMonthPageViews || 0
      },
      {
        name: 'monthly_users',
        current: currentMonthUsers || 0,
        previous: previousMonthUsers || 0
      },
      {
        name: 'monthly_bookings',
        current: currentMonthBookings || 0,
        previous: previousMonthBookings || 0
      },
      {
        name: 'average_rating',
        current: currentAverageRating,
        previous: previousAverageRating
      }
    ]
    
    // Update each metric
    for (const metric of metrics) {
      const { error } = await supabaseClient.rpc('update_analytics_metric', {
        p_metric_name: metric.name,
        p_metric_value: metric.current,
        p_period: 'current_month',
        p_comparison_value: metric.previous,
        p_comparison_period: 'previous_month'
      })
      
      if (error) throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        metrics
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error updating analytics:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
