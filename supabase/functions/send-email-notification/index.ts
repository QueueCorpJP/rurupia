import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-auth',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, title, message, type, data } = await req.json()

    console.log('=== EMAIL NOTIFICATION FUNCTION CALLED ===')
    console.log(`UserId: ${userId}`)
    console.log(`Title: ${title}`)
    console.log(`Message: ${message}`)
    console.log(`Type: ${type}`)
    console.log(`Data:`, data)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get user email
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      console.error('ユーザー取得エラー:', userError)
      return new Response(
        JSON.stringify({ success: false, error: 'ユーザーが見つかりません' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        },
      )
    }

    const userEmail = user.user.email
    if (!userEmail) {
      console.error('ユーザーのメールアドレスが見つかりません')
      return new Response(
        JSON.stringify({ success: false, error: 'ユーザーのメールアドレスが見つかりません' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        },
      )
    }

    console.log(`送信先メールアドレス: ${userEmail}`)

    // Check if SendGrid API key is configured
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (!sendGridApiKey) {
      console.error('SendGrid API key not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        },
      )
    }

    console.log('SendGrid API key configured:', sendGridApiKey ? 'YES' : 'NO')
    console.log('FROM_EMAIL:', Deno.env.get('FROM_EMAIL'))
    console.log('FROM_NAME:', Deno.env.get('FROM_NAME'))

    // Create HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>るぴぴあ通知</title>
  <style>
    body { font-family: 'Hiragino Sans', 'Yu Gothic UI', sans-serif; margin: 0; padding: 20px; background-color: #fdf2f8; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(236,72,153,0.1); }
    .header { background: linear-gradient(135deg, #f8bbd9, #fce7f3); color: #831843; padding: 20px; text-align: center; }
    .content { padding: 30px; background-color: white; }
    .footer { background-color: #fdf2f8; padding: 20px; text-align: center; font-size: 12px; color: #831843; }
    .button { display: inline-block; background-color: #f8bbd9; color: #831843; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
    .button:hover { background-color: #f472b6; }
    h2 { color: #831843; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>るぴぴあ</h1>
    </div>
    <div class="content">
      <h2>新しい通知があります</h2>
      <p>${message}</p>
      <a href="https://rupipia.jp/messages" class="button">メッセージを確認する</a>
    </div>
    <div class="footer">
      <p>このメールに心当たりがない場合は、お手数ですが削除してください。</p>
      <p>© 2025 るぴぴあ. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: userEmail }],
          subject: title
        }],
        from: { 
          email: Deno.env.get('FROM_EMAIL') ?? 'noreply@rupipia.jp',
          name: Deno.env.get('FROM_NAME') ?? 'るぴぴあ'
        },
        content: [{
          type: 'text/html',
          value: htmlContent
        }]
      })
    })

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text()
      console.error(`SendGrid error: ${sendGridResponse.status} - ${errorText}`)
      console.error('SendGrid response headers:', Object.fromEntries(sendGridResponse.headers.entries()))
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `メール送信エラー: ${sendGridResponse.status}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        },
      )
    }

    const responseText = await sendGridResponse.text()
    console.log('✅ メール送信成功')
    console.log(`宛先: ${userEmail}`)
    console.log(`件名: ${title}`)
    console.log(`種類: ${type}`)
    console.log('SendGrid response:', responseText)
    console.log('SendGrid response headers:', Object.fromEntries(sendGridResponse.headers.entries()))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'メール通知が正常に送信されました' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )

  } catch (error) {
    console.error('send-email-notification function エラー:', error)
    return new Response(
      JSON.stringify({ success: false, error: `内部エラー: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )
  }
}) 