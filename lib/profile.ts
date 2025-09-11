import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  about_me: string | null;
  updated_at: string;
  created_at: string;
}

export interface ProfileUpdate {
  username?: string;
  avatar_url?: string;
  about_me?: string;
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
 * Get or create user profile
 */
export async function getOrCreateProfile(userId: string, email: string): Promise<Profile | null> {
  let profile = await getProfile(userId);
  
  if (!profile) {
    // Try to create profile if it doesn't exist
    profile = await createProfile(userId, {
      username: email,
      avatar_url: undefined,
      about_me: undefined,
    });
  }
  
  return profile;
}
