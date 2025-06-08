# Email Notification Testing Setup

## Current Email Notification System Summary

### Account Types and Notification Triggers

#### 1. **User Accounts** (Regular customers)
**Notification Types:**
- **Message Notifications**: When receiving messages from therapists
- **Booking Status Updates**: When booking is confirmed/cancelled/updated  
- **Review Requests**: After completed sessions
- **Follow Notifications**: When therapists or other users follow them
- **Like Notifications**: When posts are liked
- **Promotion Notifications**: Marketing messages

**Triggers:**
- `sendMessageNotification()` - New message from therapist
- `sendBookingNotification()` - Booking status changes
- `sendBookingConfirmationToClient()` - Final booking confirmation
- `sendReviewRequestNotification()` - Post-session review request
- `sendFollowNotification()` - New follower
- `sendLikeNotification()` - Post liked
- `sendPromotionNotification()` - Marketing campaigns

#### 2. **Therapist Accounts**
**Notification Types:**
- **Message Notifications**: When receiving messages from customers
- **Booking Requests**: New booking requests from customers
- **Approval/Rejection**: Store approval status updates
- **Account Status**: Account deactivation notifications

**Triggers:**
- `sendMessageNotification()` - New message from customer
- `sendBookingNotificationToTherapist()` - New booking request
- `sendTherapistApprovalNotification()` - Application approved
- `sendTherapistRejectionNotification()` - Application rejected  
- `sendTherapistDeactivationNotification()` - Account deactivated

#### 3. **Store Admin Accounts**
**Notification Types:**
- **Booking Requests**: New booking requests for their therapists
- **Therapist Applications**: New therapist registrations
- **Administrative Updates**: System notifications

**Triggers:**
- `sendBookingNotificationToStore()` - New booking for store therapists
- Manual notifications from admin panels

#### 4. **System Admin Accounts**
**Notification Types:**
- **Store Registration Requests**: New store applications (manual handling)
- **Contact Form Submissions**: Customer inquiries (manual handling)
- **System Issues**: Error notifications (manual handling)

**Current State**: Limited admin notification system - mainly manual review through admin dashboards

## Email Setup Required for Testing

### Database Updates Needed

```sql
-- 1. Create test user account (must be done through Supabase Auth dashboard)
-- Email: einar.tokyo@gmail.com
-- Password: 12345678

-- 2. Update therapist たけし email
UPDATE therapists 
SET email = 'einar.tokyo@gmail.com' 
WHERE name = 'たけし';

-- 3. Update store 東京秘密基地 email (if separate store email field exists)
UPDATE stores 
SET email = 'einar.tokyo@gmail.com' 
WHERE name = '東京秘密基地';

-- 4. Update store admin email (owner of 東京秘密基地)
UPDATE profiles 
SET email = 'einar.tokyo@gmail.com' 
WHERE id IN (
  SELECT user_id FROM store_admins 
  WHERE store_id = (SELECT id FROM stores WHERE name = '東京秘密基地')
);

-- 5. Set admin notification email (if admin_settings table exists)
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('notification_email', 'einar.tokyo@gmail.com')
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = 'einar.tokyo@gmail.com';
```

### Manual Steps Required

1. **Create User Account**:
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Create User"
   - Email: `einar.tokyo@gmail.com`
   - Password: `12345678`
   - Confirm email if required

2. **Update Database Records**:
   - Execute the SQL commands above through Supabase SQL Editor
   - Or use Supabase admin interface to update records

3. **Test Each Notification Type**:
   - Login as the test user and trigger various actions
   - Check if notifications appear in the app
   - Monitor if emails are sent (check logs)

## Current Implementation Status

### ✅ **Implemented Notifications**
- In-app notifications system with database storage
- User notification preferences (enable/disable by type)
- Message notifications between users and therapists
- Booking lifecycle notifications
- Follow/like social notifications
- Therapist approval workflow notifications

### ⚠️ **Partial Implementation** 
- Email sending infrastructure exists but uses console.log instead of actual email service
- Admin notifications exist in UI but limited email automation

### ❌ **Missing Email Integration**
- Contact form submissions → No automated admin email
- Store registration requests → No automated admin email  
- System errors → No automated admin email
- Actual email delivery service (SendGrid, AWS SES, etc.)

## Next Steps for Full Email Implementation

1. **Email Service Integration**: Configure Supabase Edge Function with email provider
2. **Admin Email Routing**: Set up automated emails for admin notifications
3. **Email Templates**: Create Japanese email templates for all notification types
4. **Email Preferences**: Allow users to manage email notification preferences
5. **Email Verification**: Implement email verification for account security

## Testing Checklist

- [ ] User registration and login with test email
- [ ] Message sending between user and therapist たけし
- [ ] Booking request for therapist たけし
- [ ] Contact form submission
- [ ] Store admin actions triggering notifications
- [ ] Therapist approval/rejection workflow
- [ ] Follow/like actions between accounts 