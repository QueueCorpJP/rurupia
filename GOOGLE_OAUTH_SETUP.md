# Google OAuth Setup Guide

## Issue
Getting error: "You can't sign in because this app sent an invalid request. Error 400: redirect_uri_mismatch"

## Root Cause
The redirect URI configured in Google Cloud Console doesn't match what the application is sending.

## Solution

### Step 1: Fix Application Code (✅ COMPLETED)
- Updated `src/pages/Login.tsx` to use `/google-auth-callback` route
- Updated `src/pages/Signup.tsx` to use `/google-auth-callback` route
- Changed redirect URL to use `window.location.origin + '/google-auth-callback'` for dynamic domain support

### Step 2: Configure Google Cloud Console (❗ REQUIRES MANUAL ACTION)

1. **Access Google Cloud Console**:
   - Go to: https://console.cloud.google.com/
   - Select your project (or create a new one)

2. **Navigate to OAuth Settings**:
   - Go to "APIs & Services" > "Credentials"
   - Find your OAuth 2.0 client ID (or create one if it doesn't exist)
   - Click on the client ID to edit it

3. **Add Authorized Redirect URIs**:
   Add these exact URLs to the "Authorized redirect URIs" section:

   **Production URLs:**
   ```
   https://rupipia.jp/google-auth-callback
   https://dqv3ckdbgwb1i.cloudfront.net/google-auth-callback
   ```

   **Supabase Auth URL (Required):**
   ```
   https://vvwkuqnotnilsbcswfqu.supabase.co/auth/v1/callback
   ```

   **Development URLs (Optional):**
   ```
   http://localhost:3000/google-auth-callback
   http://localhost:5173/google-auth-callback
   ```

4. **Save the Configuration**:
   - Click "Save" at the bottom of the form
   - Changes may take a few minutes to propagate

### Step 3: Configure Supabase Auth Settings

1. **Access Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/vvwkuqnotnilsbcswfqu
   - Navigate to "Authentication" > "Providers"

2. **Configure Google Provider**:
   - Enable Google provider if not already enabled
   - Add your Google OAuth client ID and client secret
   - Set authorized redirect URLs to match your Google Cloud Console settings

3. **Site URL Configuration**:
   Make sure your Site URL in Supabase Auth settings includes:
   ```
   https://rupipia.jp
   https://dqv3ckdbgwb1i.cloudfront.net
   ```

### Step 4: Test the Configuration

1. **Deploy the fixed code**:
   ```bash
   npm run build
   aws s3 sync dist/ s3://therapist-connectivity-frontend-93b9faa0
   aws cloudfront create-invalidation --distribution-id E2P3Q41GY0N3CJ --paths "/*"
   ```

2. **Test Google OAuth**:
   - Go to https://rupipia.jp/login
   - Click "Googleでログイン"
   - Should redirect to Google's consent screen
   - After consent, should redirect back to your app at `/google-auth-callback`

## Troubleshooting

### If you still get redirect_uri_mismatch:
1. **Check the exact error URL**: 
   - Look at the browser's network tab to see what redirect_uri was sent
   - Ensure it exactly matches one in your Google Cloud Console

2. **Common Issues**:
   - Missing trailing slash: `/google-auth-callback` vs `/google-auth-callback/`
   - HTTP vs HTTPS mismatch
   - Subdomain mismatch (www vs no-www)
   - Case sensitivity

3. **Verify Configuration**:
   - Double-check all URLs are saved in Google Cloud Console
   - Wait 5-10 minutes for changes to propagate
   - Clear browser cache and cookies

### If OAuth works but user isn't logged in:
1. Check that `GoogleAuthCallback.tsx` component is handling the session correctly
2. Verify Supabase project settings and RLS policies
3. Check browser console for errors

## Security Notes

- Never commit Google OAuth client secrets to your repository
- Use environment variables for sensitive configuration
- Regularly rotate OAuth secrets in production
- Monitor OAuth usage in Google Cloud Console

## Related Files Modified
- `src/pages/Login.tsx` - Updated Google OAuth redirect URL
- `src/pages/Signup.tsx` - Updated Google OAuth redirect URL  
- `src/pages/GoogleAuthCallback.tsx` - Handles OAuth callback processing
- `src/App.tsx` - Defines `/google-auth-callback` route 