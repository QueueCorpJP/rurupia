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
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Generate password reset with correct redirect URL
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://rupipia.jp/reset-password'
      }
    })

    if (error) {
      console.error('Error generating password reset link:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate password reset link' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract the action link from the response
    const actionLink = data.properties?.action_link
    
    if (!actionLink) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate action link' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send custom email with correct domain
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (!sendGridApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create HTML email template for password reset
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>るぴぴあ - パスワードリセット</title>
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
      <h2>パスワードリセットのお願い</h2>
      <p>パスワードリセットのリクエストを受け付けました。</p>
      <p>下記のボタンをクリックして、新しいパスワードを設定してください。</p>
      <a href="${actionLink}" class="button">パスワードをリセット</a>
      <p><small>このリンクは24時間有効です。</small></p>
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
          to: [{ email: email }],
          subject: 'るぴぴあ - パスワードリセット'
        }],
        from: { 
          email: Deno.env.get('FROM_EMAIL') ?? 'noreply@rupipia.jp',
          name: Deno.env.get('FROM_NAME') ?? 'るぴぴあ'
        },
        content: [{
          type: 'text/html',
          value: htmlContent
        }],
        tracking_settings: {
          click_tracking: {
            enable: false
          },
          open_tracking: {
            enable: false
          }
        }
      })
    })

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text()
      console.error(`SendGrid error: ${sendGridResponse.status} - ${errorText}`)
      return new Response(
        JSON.stringify({ error: 'Failed to send password reset email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Password reset email sent successfully to:', email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'パスワードリセットのメールを送信しました' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Custom password reset function error:', error)
    return new Response(
      JSON.stringify({ error: `内部エラー: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 