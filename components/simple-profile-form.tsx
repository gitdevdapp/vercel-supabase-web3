'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { type Profile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import { Camera, Mail, User, FileText } from "lucide-react";
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
      <CardHeader className="space-y-1 pb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex justify-center md:justify-start">
            <Avatar 
              src={profilePicture || profile.profile_picture || profile.avatar_url}
              alt={profile.username || userEmail}
              fallbackText={profile.username || userEmail}
              size="lg"
              className="ring-4 ring-background shadow-xl"
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <CardTitle className="text-2xl md:text-3xl">My Profile</CardTitle>
            <CardDescription className="text-base mt-1">
              Welcome! Tell us about yourself.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
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

        {/* Email Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
          </div>
          <div className="p-3 rounded-md border bg-muted text-sm">
            {userEmail}
          </div>
        </div>

        {/* Username Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
          </div>
          <div className="p-3 rounded-md border bg-muted text-sm">
            {profile.username || 'Not set'}
          </div>
        </div>

        {/* About Me Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="about_me" className="text-sm font-medium">
              About Me
            </Label>
          </div>
          {isEditing ? (
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
          ) : (
            <div className="min-h-[120px] p-4 rounded-md border bg-muted text-sm whitespace-pre-wrap">
              {profile.about_me || 'No description added yet. Click "Edit Profile" to add your story!'}
            </div>
          )}
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
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="flex-1 sm:flex-none sm:min-w-[140px] h-11"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none sm:min-w-[140px] h-11"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-none sm:min-w-[140px] h-11"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}