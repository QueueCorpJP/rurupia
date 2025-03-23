# Therapist Self-Registration Implementation

This document explains the changes made to allow therapists to self-register through the invitation link and insert their records into the `therapists` table directly.

## Changes Overview

1. **Row Level Security Policies**: Added RLS policies to the `therapists` table to allow users to insert records where the ID matches their own auth ID.

2. **Signup Flow**: Modified the therapist signup process to create a basic therapist record during registration.

3. **Store Approval Process**: Updated the store approval process to work with the new flow where therapists already have records in the therapists table but still need approval.

## Database Changes

A new migration file `20240802_enable_therapist_self_insert.sql` has been created with the necessary RLS policies:

- Enables Row Level Security on the therapists table
- Allows therapists to insert their own record (where auth.uid() = id)
- Allows therapists to update their own record
- Allows therapists to view their own record
- Allows anyone to view therapist records (for public viewing)
- Allows stores to view therapists they have relationships with
- Allows stores to update therapists they have relationships with

## Code Changes

### TherapistSignup.tsx

- Added a new function `createTherapistRecord` to insert a basic therapist record during signup
- Modified the signup flow to call this function after profile creation
- Updated documentation to reflect the new process

### StoreTherapists.tsx

- Updated the approval process to work with the new flow where therapists already have records
- Simplified the therapist record check and creation process
- Added better error messaging for edge cases

## How to Apply Changes

1. Run the new migration to apply the RLS policies:
   ```
   npx supabase migration up
   ```

2. Deploy the updated frontend code to allow therapists to create their own records during signup.

## Testing

After applying these changes, test the following scenarios:

1. **Therapist Signup**: Invite a new therapist and verify they can register and their record is created in both `profiles` and `therapists` tables.

2. **Store Approval**: Verify stores can approve therapists and the correct relationships are created.

3. **Therapist Profile Management**: Verify therapists can update their own information after approval.

## Security Considerations

- Therapists can only insert and update their own records (matching their auth ID)
- Therapists cannot modify other therapists' records
- Stores can only update therapists' records when they have an active relationship
- These changes maintain the approval workflow while improving security through proper RLS 

## Authentication Persistence Fix

A critical improvement has been made to the Supabase client configuration to ensure user authentication persists across browser sessions:

1. **Updated Supabase Client**: Modified `src/integrations/supabase/client.ts` to explicitly configure localStorage persistence:
   
   ```typescript
   export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
     auth: {
       persistSession: true,
       storageKey: 'therapist-app-auth',
       storage: localStorage
     },
   });
   ```

2. **Impact of this Change**:
   - Fixes the issue where navigation elements disappeared after reopening the browser
   - Maintains user login state between sessions
   - Prevents unauthorized redirects to login pages when reloading the application

This enhancement ensures a seamless user experience by maintaining authentication state properly between browser sessions. 