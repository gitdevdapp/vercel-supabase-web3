import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  profile_picture: string | null;
  about_me: string | null;
  bio: string | null;
  is_public: boolean;
  email_verified: boolean;
  onboarding_completed: boolean;
  updated_at: string;
  created_at: string;
  last_active_at: string;
}

export interface ProfileUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  profile_picture?: string;
  about_me?: string;
  bio?: string;
  is_public?: boolean;
  email_verified?: boolean;
  onboarding_completed?: boolean;
}

/**
 * Get user profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

/**
 * Create user profile
 */
export async function createProfile(userId: string, profileData: ProfileUpdate): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
}

/**
 * Get or create user profile with enhanced default values
 */
export async function getOrCreateProfile(userId: string, email: string): Promise<Profile | null> {
  let profile = await getProfile(userId);
  
  if (!profile) {
    // Try to create profile if it doesn't exist
    const defaultUsername = email.split('@')[0];
    const defaultFullName = defaultUsername.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    profile = await createProfile(userId, {
      username: defaultUsername,
      email: email,
      full_name: defaultFullName,
      avatar_url: undefined,
      profile_picture: undefined,
      about_me: 'Welcome to my profile! I\'m excited to be part of the community.',
      bio: 'New member exploring the platform',
      is_public: false,
      email_verified: false,
      onboarding_completed: false,
    });
  }
  
  return profile;
}
