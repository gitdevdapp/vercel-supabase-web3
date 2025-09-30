/**
 * Image Optimizer Library
 * 
 * Provides client-side image optimization for profile pictures:
 * - Center-crops non-square images to square
 * - Compresses images to < 100 KB
 * - Converts to WebP format
 * - Optimized for Supabase free tier (1 GB storage)
 * 
 * @module lib/image-optimizer
 */

import imageCompression from 'browser-image-compression';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: ImageDimensions;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // File size limits
  MAX_UPLOAD_SIZE: 2 * 1024 * 1024, // 2 MB
  TARGET_SIZE: 100 * 1024, // 100 KB
  
  // Image dimensions
  TARGET_WIDTH: 512,
  TARGET_HEIGHT: 512,
  
  // Compression settings
  INITIAL_QUALITY: 0.85,
  MIN_QUALITY: 0.5,
  QUALITY_STEP: 0.1,
  
  // Output format
  OUTPUT_FORMAT: 'image/webp' as const,
  
  // Allowed input formats
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ] as const,
};

// ============================================================================
// IMAGE VALIDATION
// ============================================================================

/**
 * Validate image file before processing
 * 
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
    };
  }

  // Check file type
  if (!CONFIG.ALLOWED_TYPES.includes(file.type as typeof CONFIG.ALLOWED_TYPES[number])) {
    return {
      valid: false,
      error: 'Please upload a PNG, JPEG, GIF, or WebP image',
    };
  }

  // Check file size
  if (file.size > CONFIG.MAX_UPLOAD_SIZE) {
    const maxSizeMB = CONFIG.MAX_UPLOAD_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `Image must be less than ${maxSizeMB} MB`,
    };
  }

  return { valid: true };
}

// ============================================================================
// IMAGE DIMENSIONS
// ============================================================================

/**
 * Get image dimensions from file
 * 
 * @param file - The image file
 * @returns Promise resolving to image dimensions
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// CENTER CROP TO SQUARE
// ============================================================================

/**
 * Center crop image to square using canvas
 * 
 * For non-square images:
 * - Horizontal (landscape): crops left and right edges
 * - Vertical (portrait): crops top and bottom edges
 * - Always preserves the center portion
 * 
 * @param file - The image file to crop
 * @returns Promise resolving to cropped image file
 */
export async function centerCropToSquare(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Determine the size of the square (smaller dimension)
        const size = Math.min(img.width, img.height);
        
        // Calculate crop position (center of image)
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        // Set canvas to square size
        canvas.width = size;
        canvas.height = size;
        
        // Draw cropped image (center portion)
        ctx.drawImage(
          img,
          x, y,           // Source x, y (crop start position)
          size, size,     // Source width, height (square)
          0, 0,           // Destination x, y
          size, size      // Destination width, height
        );
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }
            
            const croppedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webp'), // Change extension to webp
              { type: 'image/webp' }
            );
            
            resolve(croppedFile);
            URL.revokeObjectURL(img.src);
          },
          'image/webp',
          0.95 // High quality for cropping (compression comes next)
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// IMAGE COMPRESSION
// ============================================================================

/**
 * Compress image to target size with progressive quality reduction
 * 
 * Strategy:
 * 1. Start with high quality (0.85)
 * 2. If result > target size, reduce quality by 0.1 and retry
 * 3. Continue until target size reached or min quality (0.5)
 * 4. Also progressively reduce dimensions if needed
 * 
 * @param file - The image file to compress
 * @param targetSizeKB - Target size in kilobytes (default 100)
 * @returns Promise resolving to compressed file
 */
export async function compressImage(
  file: File,
  targetSizeKB: number = 100
): Promise<File> {
  let quality = CONFIG.INITIAL_QUALITY;
  let maxDimension = CONFIG.TARGET_WIDTH;
  let compressedFile: File = file;
  let attempts = 0;
  const maxAttempts = 10;

  const targetBytes = targetSizeKB * 1024;

  while (compressedFile.size > targetBytes && quality >= CONFIG.MIN_QUALITY && attempts < maxAttempts) {
    attempts++;
    
    const options = {
      maxSizeMB: targetSizeKB / 1024, // Convert KB to MB
      maxWidthOrHeight: maxDimension,
      useWebWorker: true, // Use web worker for better performance
      fileType: CONFIG.OUTPUT_FORMAT,
      initialQuality: quality,
    };

    try {
      compressedFile = await imageCompression(file, options);
      
      // If still too large, adjust parameters for next iteration
      if (compressedFile.size > targetBytes) {
        quality = Math.max(CONFIG.MIN_QUALITY, quality - CONFIG.QUALITY_STEP);
        maxDimension = Math.max(256, maxDimension - 64); // Don't go below 256px
      }
    } catch (error) {
      console.error('Compression attempt failed:', error);
      throw new Error('Failed to compress image');
    }
  }

  console.log(`Compression complete after ${attempts} attempts:`);
  console.log(`  Original: ${(file.size / 1024).toFixed(2)} KB`);
  console.log(`  Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB`);
  console.log(`  Quality: ${quality}`);
  console.log(`  Dimensions: ${maxDimension}x${maxDimension}`);

  return compressedFile;
}

// ============================================================================
// COMPLETE OPTIMIZATION PIPELINE
// ============================================================================

/**
 * Complete image optimization pipeline:
 * 1. Validate file
 * 2. Get dimensions
 * 3. Center crop to square (if needed)
 * 4. Compress to < 100 KB
 * 
 * @param file - The image file to optimize
 * @returns Promise resolving to compression result
 */
export async function optimizeProfileImage(file: File): Promise<CompressionResult> {
  // Step 1: Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const originalSize = file.size;

  // Step 2: Get original dimensions
  const originalDimensions = await getImageDimensions(file);
  console.log('Original dimensions:', originalDimensions);

  // Step 3: Center crop to square if needed
  let processedFile = file;
  if (originalDimensions.width !== originalDimensions.height) {
    console.log('Image is not square, applying center crop...');
    processedFile = await centerCropToSquare(file);
  } else {
    console.log('Image is already square, skipping crop');
  }

  // Step 4: Compress
  console.log('Compressing image...');
  const compressedFile = await compressImage(processedFile);

  // Step 5: Get final dimensions
  const finalDimensions = await getImageDimensions(compressedFile);

  // Calculate compression ratio
  const compressionRatio = ((originalSize - compressedFile.size) / originalSize) * 100;

  return {
    file: compressedFile,
    originalSize,
    compressedSize: compressedFile.size,
    compressionRatio,
    dimensions: finalDimensions,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format file size to human-readable string
 * 
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "234 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Create preview URL from file
 * 
 * @param file - The file to create preview for
 * @returns Object URL (remember to revoke when done)
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 * 
 * @param url - The object URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
