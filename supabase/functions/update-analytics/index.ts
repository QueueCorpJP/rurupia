
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current date and first day of month
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Format as ISO strings for date comparison
    const currentMonthISO = currentMonth.toISOString();
    const previousMonthISO = previousMonth.toISOString();
    
    // 1. Update monthly page views
    const { data: currentMonthViews, error: viewsError } = await supabaseAdmin
      .from('page_views')
      .select('id')
      .gte('view_date', currentMonthISO);
      
    if (viewsError) throw viewsError;
    
    const { data: previousMonthViews, error: prevViewsError } = await supabaseAdmin
      .from('page_views')
      .select('id')
      .gte('view_date', previousMonthISO)
      .lt('view_date', currentMonthISO);
      
    if (prevViewsError) throw prevViewsError;
    
    const currentViews = currentMonthViews?.length || 0;
    const previousViews = previousMonthViews?.length || 0;
    
    // Update the analytics table with the monthly page views
    await supabaseAdmin.rpc('update_analytics_metric', {
      p_metric_name: 'monthly_page_views',
      p_metric_value: currentViews,
      p_period: 'current_month',
      p_comparison_value: previousViews,
      p_comparison_period: 'previous_month'
    });
    
    // 2. Update monthly users (unique IPs)
    const { data: currentMonthIPs, error: ipsError } = await supabaseAdmin
      .from('page_views')
      .select('ip_address')
      .gte('view_date', currentMonthISO);
      
    if (ipsError) throw ipsError;
    
    const { data: previousMonthIPs, error: prevIPsError } = await supabaseAdmin
      .from('page_views')
      .select('ip_address')
      .gte('view_date', previousMonthISO)
      .lt('view_date', currentMonthISO);
      
    if (prevIPsError) throw prevIPsError;
    
    const currentUniqueIPs = new Set(currentMonthIPs.map((row: any) => row.ip_address)).size;
    const previousUniqueIPs = new Set(previousMonthIPs.map((row: any) => row.ip_address)).size;
    
    // Update the analytics table with the unique users count
    await supabaseAdmin.rpc('update_analytics_metric', {
      p_metric_name: 'monthly_users',
      p_metric_value: currentUniqueIPs,
      p_period: 'current_month',
      p_comparison_value: previousUniqueIPs,
      p_comparison_period: 'previous_month'
    });
    
    // 3. Update monthly bookings
    const { data: currentMonthBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .gte('created_at', currentMonthISO);
      
    if (bookingsError) throw bookingsError;
    
    const { data: previousMonthBookings, error: prevBookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .gte('created_at', previousMonthISO)
      .lt('created_at', currentMonthISO);
      
    if (prevBookingsError) throw prevBookingsError;
    
    const currentBookings = currentMonthBookings?.length || 0;
    const previousBookings = previousMonthBookings?.length || 0;
    
    // Update the analytics table with the bookings count
    await supabaseAdmin.rpc('update_analytics_metric', {
      p_metric_name: 'monthly_bookings',
      p_metric_value: currentBookings,
      p_period: 'current_month',
      p_comparison_value: previousBookings,
      p_comparison_period: 'previous_month'
    });
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Analytics data updated successfully",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error updating analytics:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
