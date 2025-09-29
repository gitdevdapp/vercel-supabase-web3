'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Profile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

interface SimpleProfileFormProps {
  profile: Profile;
  userEmail: string;
}

export function SimpleProfileForm({ profile, userEmail }: SimpleProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aboutMe, setAboutMe] = useState(profile.about_me || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (aboutMe.length > 1000) {
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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          about_me: aboutMe.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError('Failed to update profile. Please try again.');
      } else {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Refresh page to show updated data
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAboutMe(profile.about_me || '');
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Welcome! Tell us about yourself.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email display */}
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="p-3 rounded-md border bg-muted text-sm">
            {userEmail}
          </div>
        </div>

        {/* Username display */}
        <div className="space-y-2">
          <Label>Username</Label>
          <div className="p-3 rounded-md border bg-muted text-sm">
            {profile.username || 'Not set'}
          </div>
        </div>

        {/* About me section */}
        <div className="space-y-2">
          <Label htmlFor="about_me">About Me</Label>
          {isEditing ? (
            <textarea
              id="about_me"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={1000}
              rows={6}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
            />
          ) : (
            <div className="min-h-[100px] p-3 rounded-md border bg-muted text-sm whitespace-pre-wrap">
              {profile.about_me || 'No description added yet. Click "Edit" to add your story!'}
            </div>
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              {aboutMe.length}/1000 characters
            </p>
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
              Edit About Me
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

