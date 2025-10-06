'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { type Profile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import { Camera, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { ProfileImageUploader } from "@/components/profile-image-uploader";

interface SimpleProfileFormProps {
  profile: Profile;
  userEmail: string;
}

export function SimpleProfileForm({ profile, userEmail }: SimpleProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aboutMe, setAboutMe] = useState(profile.about_me || '');
  const [profilePicture, setProfilePicture] = useState(profile.profile_picture || profile.avatar_url || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

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
          profile_picture: profilePicture.trim() || null,
          avatar_url: profilePicture.trim() || null, // Keep both fields in sync
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
    setProfilePicture(profile.profile_picture || profile.avatar_url || '');
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = (url: string) => {
    setProfilePicture(url);
    setShowUploader(false);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardContent className="pt-6 space-y-4">
        {/* Compact Header - Always Visible */}
        <div className="flex items-center gap-4">
          <Avatar 
            src={profilePicture || profile.profile_picture || profile.avatar_url}
            alt={profile.username || userEmail}
            fallbackText={profile.username || userEmail}
            size="md"
            className="ring-2 ring-background shadow-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">
              {profile.username || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Edit Profile Button - Toggles Expansion */}
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className="w-full"
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? (
            <>
              Collapse <ChevronUp className="ml-2 w-4 h-4" />
            </>
          ) : (
            <>
              Edit Profile <ChevronDown className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>

        {/* Expandable Content - Only shows when editing */}
        {isEditing && (
          <div className="space-y-6 pt-2 border-t">
        {/* Profile Picture Upload Section */}
        {showUploader ? (
          <div className="p-4 rounded-lg border bg-card">
            <ProfileImageUploader
              userId={profile.id}
              currentImageUrl={profilePicture || profile.profile_picture || profile.avatar_url}
              username={profile.username || userEmail}
              onUploadComplete={handleImageUpload}
            />
          </div>
        ) : (
          <div className="space-y-3 p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="profile_picture" className="text-sm font-medium">
                  Profile Picture
                </Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploader(true)}
                disabled={isLoading}
              >
                Upload Image
              </Button>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  id="profile_picture"
                  type="url"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your profile picture, or use &ldquo;Upload Image&rdquo; above
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-md border bg-muted text-sm break-all">
                {profilePicture || 'No profile picture set'}
              </div>
            )}
          </div>
        )}

        {/* About Me Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="about_me" className="text-sm font-medium">
              About Me
            </Label>
          </div>
          <div className="space-y-2">
            <textarea
              id="about_me"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={1000}
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {aboutMe.length}/1000 characters
              </p>
              {aboutMe.length > 900 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {1000 - aboutMe.length} characters remaining
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md dark:text-green-400 dark:bg-green-950 dark:border-green-800 flex items-start gap-2">
            <span className="text-lg">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
          </div>
        )}

        {/* Read-only "About Me" preview when not editing */}
        {!isEditing && profile.about_me && (
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground line-clamp-2">
              {profile.about_me}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}