# LINE Login Integration Setup

This document explains how to set up LINE Login integration with your application.

## 1. Create a LINE Login Channel

1. Go to the [LINE Developers Console](https://developers.line.biz/)
2. Create a new provider (if you don't have one):
   - Click "Create a New Provider"
   - Enter your company/app name as the provider name
   - Agree to terms and create

3. Create a new channel:
   - Select "Create a New Channel"
   - Choose "LINE Login" as the channel type
   - Fill in the required information:
     - Channel name
     - Channel description
     - App types (select Web)
     - Region
   - Agree to terms and create

4. Configure your channel:
   - In the "Basic settings" tab, locate your Channel ID and Channel Secret
   - In the "App settings" tab:
     - Add `https://your-domain.com/line-callback` as a Callback URL
     - For local development, add `http://localhost:8080/line-callback`
     - Enable "Web app" as the App Type
     - Set scopes (at minimum: "profile", "openid", "email")

## 2. Update Config in Your App

1. Open `src/pages/Login.tsx` and `src/pages/Signup.tsx`
2. Replace the placeholder LINE_CLIENT_ID with your actual Channel ID:

```javascript
const LINE_CLIENT_ID = "YOUR_ACTUAL_CHANNEL_ID";
```

3. Open `src/pages/LineCallback.tsx`
4. Update both LINE_CLIENT_ID and LINE_CLIENT_SECRET with your actual values:

```javascript
const LINE_CLIENT_ID = "YOUR_ACTUAL_CHANNEL_ID";
const LINE_CLIENT_SECRET = "YOUR_ACTUAL_CHANNEL_SECRET";
```

## 3. Run Database Migration

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Add line_id column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS line_id TEXT;

-- Create an index for faster lookups by line_id
CREATE INDEX IF NOT EXISTS profiles_line_id_idx ON public.profiles (line_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.line_id IS 'LINE User ID for LINE login integration';
```

## 4. Testing the Integration

1. Start your application
2. Go to the login or signup page
3. Click the LINE login button
4. You should be redirected to LINE's authentication page
5. After authorizing, you'll be redirected back to your application

## Troubleshooting

- **CORS Issues**: Ensure your callback domain is correctly configured in LINE Developer Console
- **Redirect Errors**: Verify the redirect URL format matches exactly what's registered in LINE Developer Console
- **Authentication Errors**: Check that your CLIENT_ID and CLIENT_SECRET are correctly copied
- **Database Errors**: Verify the line_id column exists in your profiles table

## Security Considerations

- In production, it's best to handle the token exchange on a server rather than client-side
- Consider using environment variables for sensitive credentials instead of hardcoding
- Implement proper error handling and logging

## Additional Resources

- [LINE Login Official Documentation](https://developers.line.biz/en/docs/line-login/)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-16)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) 