'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, Upload, X, CheckCircle } from 'lucide-react';
import { 
  optimizeProfileImage, 
  formatFileSize,
  createPreviewUrl,
  revokePreviewUrl,
  type CompressionResult 
} from '@/lib/image-optimizer';

interface ProfileImageUploaderProps {
  userId: string;
  currentImageUrl?: string | null;
  username: string;
  onUploadComplete?: (url: string) => void;
}

export function ProfileImageUploader({
  userId,
  currentImageUrl,
  username,
  onUploadComplete,
}: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setCompressionInfo(null);
    setIsProcessing(true);

    try {
      // Step 1: Optimize image (validate, crop, compress)
      console.log('Starting image optimization...');
      const result = await optimizeProfileImage(file);
      
      // Store compression info for display
      setCompressionInfo(result);
      
      // Step 2: Create preview
      const objectUrl = createPreviewUrl(result.file);
      setPreviewUrl(objectUrl);
      
      console.log('Optimization complete:', {
        originalSize: formatFileSize(result.originalSize),
        compressedSize: formatFileSize(result.compressedSize),
        compressionRatio: `${result.compressionRatio.toFixed(1)}%`,
        dimensions: `${result.dimensions.width}x${result.dimensions.height}`,
      });

      // Step 3: Upload to Supabase
      setIsProcessing(false);
      setIsUploading(true);
      
      const supabase = createClient();
      
      // Step 3a: Delete old images for this user (cleanup)
      console.log('Cleaning up old images...');
      const { data: existingFiles } = await supabase.storage
        .from('profile-images')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from('profile-images')
          .remove(filesToDelete);
        
        if (deleteError) {
          console.warn('Failed to delete old images:', deleteError);
          // Continue anyway - old images will be orphaned but new one will work
        } else {
          console.log(`Deleted ${filesToDelete.length} old image(s)`);
        }
      }

      // Step 3b: Upload new compressed image
      const fileName = `${userId}/avatar-${Date.now()}.webp`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, result.file, {
          cacheControl: '31536000', // 1 year cache
          upsert: false, // Don't upsert since we deleted old files
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      console.log('Upload successful:', uploadData.path);

      // Step 4: Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(uploadData.path);

      // Step 5: Update profile in database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl,
          profile_picture: urlData.publicUrl, // Keep both fields in sync
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (dbError) {
        console.error('Database update error:', dbError);
        throw new Error('Failed to update profile');
      }

      console.log('Profile updated with new avatar URL');

      // Step 6: Success!
      setSuccess('Profile picture updated successfully!');
      
      // Call success callback
      if (onUploadComplete) {
        onUploadComplete(urlData.publicUrl);
      }
      
      // Clean up preview URL after a delay
      setTimeout(() => {
        if (previewUrl) {
          revokePreviewUrl(previewUrl);
        }
        setPreviewUrl(null);
        setCompressionInfo(null);
        
        // Refresh page to show new image
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      
      // Clean up preview on error
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    if (previewUrl) {
      revokePreviewUrl(previewUrl);
    }
    setPreviewUrl(null);
    setCompressionInfo(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentImageUrl;
  const isProcessingOrUploading = isProcessing || isUploading;

  return (
    <div className="space-y-4">
      {/* Avatar with Upload Overlay */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar
            src={displayUrl}
            alt={username}
            fallbackText={username}
            size="xl"
            className="ring-4 ring-background shadow-xl"
          />
          
          {!isProcessingOrUploading && (
            <button
              onClick={triggerFileInput}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              aria-label="Change profile picture"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          )}
          
          {isProcessing && (
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 mx-auto animate-spin" />
                <p className="text-xs mt-2">Processing...</p>
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <div className="text-center text-white">
                <Upload className="w-8 h-8 mx-auto animate-pulse" />
                <p className="text-xs mt-2">Uploading...</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessingOrUploading}
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={triggerFileInput}
            disabled={isProcessingOrUploading}
            variant="outline"
            size="sm"
          >
            <Camera className="w-4 h-4 mr-2" />
            {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
          
          {previewUrl && (
            <Button
              onClick={handleCancel}
              disabled={isProcessingOrUploading}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Compression info */}
      {compressionInfo && (
        <div className="p-3 text-sm bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Image optimized!</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                {formatFileSize(compressionInfo.originalSize)} → {formatFileSize(compressionInfo.compressedSize)}
                {' '}({compressionInfo.compressionRatio.toFixed(1)}% smaller)
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Size: {compressionInfo.dimensions.width}×{compressionInfo.dimensions.height}px
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md dark:text-green-400 dark:bg-green-950 dark:border-green-800">
          {success}
        </div>
      )}

      {/* Upload info */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Supported: JPEG, PNG, GIF, WebP</p>
        <p>Max size: 2 MB (optimized to &lt;100 KB automatically)</p>
        <p>Non-square images will be center-cropped</p>
      </div>
    </div>
  );
}
