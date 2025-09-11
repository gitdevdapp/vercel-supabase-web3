# Minimum Viable Profile Page Plan

## Overview
This plan outlines the creation of a basic user profile page that integrates seamlessly with the existing Next.js + Supabase template. The profile page will include essential user information while maintaining consistency with the current design system.

## Current System Analysis

### Available Technologies & Dependencies
- **Next.js**: Latest version with App Router
- **Supabase**: Authentication and database
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Shadcn/ui**: Component library with available components:
  - Button (with variants: default, destructive, outline, secondary, ghost, link)
  - Card (with Header, Title, Description, Content, Footer)
  - Input (styled form inputs)
  - Label (form labels)
  - Badge (status indicators)
  - Checkbox, Dropdown Menu
- **Lucide React**: Icon library
- **next-themes**: Dark/light mode support
- **Class Variance Authority**: Component variant management

### Current Authentication System
- User authentication via Supabase Auth
- Protected routes using middleware
- User claims accessible via `supabase.auth.getClaims()`
- Email-based authentication with user metadata

### Existing Styling System
- Tailwind CSS with custom CSS variables for theming
- Consistent color scheme (light/dark mode support)
- Component-based architecture with shadcn/ui
- Responsive design patterns already established

## Profile Page Requirements

### Core Features
1. **Profile Picture**: Avatar display with placeholder for missing images
2. **Username**: Display name field (editable)
3. **Email**: User email (read-only from auth)
4. **About Me**: Single text area for bio/description

### Technical Requirements
- Use existing UI components only
- Maintain current styling consistency
- Responsive design (mobile/desktop)
- No new dependencies
- Integration with Supabase database

## Implementation Plan

### Phase 1: Database Setup
**File**: SQL migration for Supabase

Create `profiles` table with the following schema:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  about_me TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, about_me)
  VALUES (new.id, new.raw_user_meta_data->>'email', null, null);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Phase 2: Component Architecture

**File**: `components/profile-form.tsx`
- Form component using existing Input, Label, Button components
- Handles profile data display and editing
- Uses Card components for layout structure
- Avatar placeholder using first letter of username/email

**File**: `app/protected/profile/page.tsx`
- Main profile page component
- Fetches user data from Supabase
- Renders ProfileForm component
- Handles loading and error states

### Phase 3: Data Operations

**File**: `lib/profile.ts`
- Functions for profile CRUD operations
- `getProfile(userId)`: Fetch user profile
- `updateProfile(userId, data)`: Update profile data
- `createProfile(userId, data)`: Create new profile

### Phase 4: Integration

**Navigation Enhancement**:
- Add profile link to existing auth button component
- Integrate profile route into protected area navigation

**Styling Consistency**:
- Use existing Card components for layout
- Implement form styling with current Input/Label components
- Avatar placeholder using existing badge/button styling
- Maintain spacing and typography consistency

## File Structure

```
docs/
├── profile-plan.md                    # This plan document

app/protected/
├── profile/
│   └── page.tsx                       # Main profile page

components/
├── profile-form.tsx                   # Profile form component
└── ui/                               # Existing UI components (unchanged)

lib/
├── profile.ts                        # Profile data operations
└── supabase/                         # Existing Supabase setup (unchanged)
```

## Component Design

### Profile Page Layout
```
┌─────────────────────────────────────┐
│ Navigation (existing)               │
├─────────────────────────────────────┤
│                                     │
│ ┌─── Profile Card ───────────────┐  │
│ │ Profile Picture | Username     │  │
│ │ (Avatar)       | Email        │  │
│ │                | About Me     │  │
│ │                | [Save] [Edit]│  │
│ └───────────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop**: Side-by-side layout with avatar and form
- **Mobile**: Stacked layout with avatar on top
- Uses existing Tailwind responsive classes (`md:`, `lg:`)

## Avatar Implementation
Since no image upload is required for MVP:
- Use first letter of username or email as avatar
- Styled with existing Button/Badge components
- Circular background with consistent theming
- Placeholder for future image upload feature

## Form Validation
- Username: Required, unique, 3-50 characters
- About Me: Optional, max 500 characters
- Client-side validation using existing patterns
- Server-side validation in Supabase

## Error Handling
- Loading states using existing component patterns
- Error messages with consistent styling
- Graceful fallbacks for missing data

## Security Considerations
- Row Level Security (RLS) enabled on profiles table
- Users can only access their own profile data
- Input sanitization on all form fields
- Proper authentication checks on all routes

## Testing Strategy
- Manual testing on desktop and mobile viewports
- Verify responsive design breakpoints
- Test form submission and data persistence
- Validate security policies in Supabase
- Test light/dark mode compatibility

## Future Enhancements (Not in MVP)
- Profile image upload to Supabase Storage
- Additional profile fields (location, website, bio)
- Public profile viewing
- Profile privacy settings
- Social links integration

## Implementation Notes
- Reuse existing component patterns from auth forms
- Follow established file naming conventions
- Maintain existing code style and formatting
- Use existing utility functions where applicable
- Preserve current navigation and layout structure

This plan ensures minimal disruption to the existing codebase while providing a functional, well-integrated profile system that matches the current design language and user experience.
