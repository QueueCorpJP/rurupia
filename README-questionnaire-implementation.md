# Therapist Matching Questionnaire Implementation

This document describes the implementation of a questionnaire-based system for matching therapists with users. The system includes MBTI personality type matching and other characteristics for better therapist-client matching.

## Overview

The matching system works as follows:

1. Therapists complete a profile with their MBTI type and answer questions about their therapy style, personality traits, age, etc.
2. Users answer similar questions on the Index page
3. The system filters and recommends therapists based on the matches between user preferences and therapist characteristics

## Database Changes

The following SQL script adds the necessary columns to the `therapists` table:

```sql
-- Add MBTI type and questionnaire data columns to therapists table
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS mbti_type text,
ADD COLUMN IF NOT EXISTS questionnaire_data jsonb DEFAULT '{}'::jsonb;

-- Add comment to describe the structure
COMMENT ON COLUMN public.therapists.questionnaire_data IS 
'Stores therapist answers to match with user preferences in the format:
{
  "mood": "relax|stress|heal|talk",
  "therapistType": "mature|bright|inclusive|cool",
  "treatmentType": "gentle|strong|technique",
  "therapistAge": "early20s|late20s|30plus|noPreference"
}';

-- Set up RLS policy for the new columns
DROP POLICY IF EXISTS "Therapists can update their own questionnaire data" ON public.therapists;
CREATE POLICY "Therapists can update their own questionnaire data" ON public.therapists
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

### How to Apply the SQL Changes

To apply these database changes, you can:

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the SQL script above
4. Execute the script

Alternatively, if you have access to the PostgreSQL database directly:

```bash
psql -h <YOUR_SUPABASE_HOST> -d postgres -U postgres -f add-questionnaire-columns.sql
```

## Components Added

### 1. MBTI Selection Component

`src/components/MBTISelect.tsx` - A reusable component for selecting MBTI personality types with Japanese labels.

### 2. Prefecture Selection Component

`src/components/PrefectureSelect.tsx` - A reusable component for selecting Japanese prefectures.

## Pages Modified

### 1. TherapistProfileForm

Updates to `src/components/therapist/TherapistProfileForm.tsx`:
- Added a new tab for questionnaire data
- Added MBTI type selector
- Added questions matching those in the Index page questionnaire

### 2. Index Page

Updates to `src/pages/Index.tsx`:
- Added MBTI type question to the questionnaire
- Changed location input to use PrefectureSelect dropdown
- Updated the search submission to include the new parameters

### 3. Therapists Page

Updates to `src/pages/Therapists.tsx`:
- Added handling for MBTI type and questionnaire filters
- Updated the filtering logic to search based on the new fields
- Updated the TherapistFilters component integration

### 4. TherapistFilters Component

Updates to `src/components/TherapistFilters.tsx`:
- Added MBTI type selector
- Added filters for all questionnaire questions
- Updated the filter handling to include the new fields

## Questionnaire Questions

The questionnaire includes the following questions:

1. **Mood/Therapy Specialization**
   - "リラックスさせる" (Relaxing)
   - "ストレス発散に効果的" (Effective for stress relief)
   - "癒し効果が高い" (Highly healing)
   - "会話を楽しめる" (Enjoyable conversation)

2. **Therapist Personality Type**
   - "落ち着いた・大人っぽい" (Calm and mature)
   - "明るくて話しやすい" (Bright and easy to talk to)
   - "包容力がある" (Inclusive)
   - "クールで控えめ" (Cool and reserved)

3. **Treatment Style**
   - "ゆっくり丁寧なプレイ" (Slow and careful)
   - "しっかり強めのプレイ" (Firm and strong)
   - "ハンドテクニックメイン" (Hand technique focus)

4. **Therapist Age**
   - "20代前半" (Early 20s)
   - "20代後半" (Late 20s)
   - "30代以上" (30s and above)
   - "特にない" (No preference)

5. **MBTI Type**
   - All 16 MBTI types with Japanese descriptions
   - "わからない" (I don't know) option

## Type Definitions

Updates to `src/utils/types.ts`:
- Added `QuestionnaireData` interface
- Updated `Therapist` and `TherapistProfile` interfaces to include MBTI and questionnaire data
- Updated `Filters` interface to include the new filter options

## Testing and Usage

After implementing these changes:

1. Therapists can complete their profile with MBTI and questionnaire data
2. Users can answer questions on the Index page to find matching therapists
3. The Therapists page will filter results based on matching criteria

This system allows for better matching between therapists and clients based on personality types and preferences. 