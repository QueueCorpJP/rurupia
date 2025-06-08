import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, title, message, type, data } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get user email
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        },
      )
    }

    const userEmail = user.user.email
    if (!userEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'User email not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        },
      )
    }

    // For now, we'll log the email details
    // In production, you would integrate with SendGrid, AWS SES, or another email service
    console.log('=== EMAIL NOTIFICATION ===')
    console.log(`To: ${userEmail}`)
    console.log(`Subject: ${title}`)
    console.log(`Message: ${message}`)
    console.log(`Type: ${type}`)
    console.log(`Data:`, data)
    console.log('========================')

    // TODO: Integrate with actual email service
    // Example SendGrid integration:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: userEmail }],
          subject: title
        }],
        from: { email: 'noreply@your-domain.com' },
        content: [{
          type: 'text/plain',
          value: message
        }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.status}`)
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification logged (replace with actual email service)' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )

  } catch (error) {
    console.error('Error in send-email-notification function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )
  }
}) 