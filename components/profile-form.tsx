'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Profile, type ProfileUpdate } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

interface ProfileFormProps {
  profile: Profile;
  userEmail: string;
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile.username || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    about_me: profile.about_me || '',
    profile_picture: profile.profile_picture || '',
    is_public: profile.is_public || false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate username
      if (!formData.username.trim()) {
        setError('Username is required');
        setIsLoading(false);
        return;
      }

      if (formData.username.length < 3 || formData.username.length > 30) {
        setError('Username must be between 3 and 30 characters');
        setIsLoading(false);
        return;
      }

      // Validate username format (alphanumeric, hyphens, underscores only)
      if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        setError('Username can only contain letters, numbers, hyphens, and underscores');
        setIsLoading(false);
        return;
      }

      // Validate full name
      if (formData.full_name && formData.full_name.length > 100) {
        setError('Full name must be less than 100 characters');
        setIsLoading(false);
        return;
      }

      // Validate bio
      if (formData.bio && formData.bio.length > 160) {
        setError('Bio must be less than 160 characters');
        setIsLoading(false);
        return;
      }

      // Validate about me
      if (formData.about_me && formData.about_me.length > 1000) {
        setError('About me must be less than 1000 characters');
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      const updates: ProfileUpdate = {
        username: formData.username.trim(),
        full_name: formData.full_name.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        about_me: formData.about_me.trim() || undefined,
        profile_picture: formData.profile_picture.trim() || undefined,
        is_public: formData.is_public,
      };

      // Update profile using client-side Supabase
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError('Failed to update profile. Please try again.');
      } else if (updatedProfile) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile.username || '',
      full_name: profile.full_name || '',
      bio: profile.bio || '',
      about_me: profile.about_me || '',
      profile_picture: profile.profile_picture || '',
      is_public: profile.is_public || false,
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Generate avatar letter from username or email
  const avatarLetter = (formData.username || userEmail || 'U').charAt(0).toUpperCase();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and basic info section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-semibold">
              {avatarLetter}
            </div>
          </div>
          
          {/* Basic info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              {isEditing ? (
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  maxLength={30}
                />
              ) : (
                <Input
                  id="username"
                  value={profile.username || 'Not set'}
                  disabled
                  className="bg-muted"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={100}
                />
              ) : (
                <Input
                  id="full_name"
                  value={profile.full_name || 'Not set'}
                  disabled
                  className="bg-muted"
                />
              )}
            </div>
          </div>
        </div>

        {/* Profile picture section */}
        <div className="space-y-2">
          <Label htmlFor="profile_picture">Profile Picture URL</Label>
          {isEditing ? (
            <Input
              id="profile_picture"
              value={formData.profile_picture}
              onChange={(e) => handleInputChange('profile_picture', e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              type="url"
            />
          ) : (
            <Input
              id="profile_picture"
              value={profile.profile_picture || 'No custom picture set'}
              disabled
              className="bg-muted"
            />
          )}
        </div>

        {/* Bio section */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          {isEditing ? (
            <Input
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="A short bio about yourself..."
              maxLength={160}
            />
          ) : (
            <Input
              id="bio"
              value={profile.bio || 'No bio added yet'}
              disabled
              className="bg-muted"
            />
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/160 characters
            </p>
          )}
        </div>

        {/* About me section */}
        <div className="space-y-2">
          <Label htmlFor="about_me">About Me</Label>
          {isEditing ? (
            <textarea
              id="about_me"
              value={formData.about_me}
              onChange={(e) => handleInputChange('about_me', e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={1000}
              rows={6}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
            />
          ) : (
            <div className="min-h-[100px] p-3 rounded-md border bg-muted text-sm">
              {profile.about_me || 'No description added yet.'}
            </div>
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              {formData.about_me.length}/1000 characters
            </p>
          )}
        </div>

        {/* Public profile toggle */}
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="space-y-1">
            <Label htmlFor="is_public" className="text-base">Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to view your profile information
            </p>
          </div>
          {isEditing ? (
            <Checkbox
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => handleInputChange('is_public', checked || false)}
            />
          ) : (
            <div className="text-sm font-medium">
              {profile.is_public ? 'Public' : 'Private'}
            </div>
          )}
        </div>

        {/* Error and success messages */}
        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md dark:text-green-400 dark:bg-green-950 dark:border-green-800">
            {success}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-4">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="flex-1 md:flex-none"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 md:flex-none"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex-1 md:flex-none"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
