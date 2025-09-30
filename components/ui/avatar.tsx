'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  editable?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-20 h-20 text-2xl',
  lg: 'w-24 h-24 md:w-30 md:h-30 text-3xl md:text-4xl',
  xl: 'w-32 h-32 md:w-40 md:h-40 text-4xl md:text-5xl',
};

export function Avatar({ 
  src, 
  alt, 
  fallbackText = 'U', 
  size = 'md',
  className,
  editable = false,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate initials from fallback text
  const getInitials = (text: string): string => {
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(fallbackText);
  const showImage = src && !imageError;

  return (
    <div 
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0 bg-primary text-primary-foreground flex items-center justify-center font-semibold transition-all',
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            className={cn(
              'object-cover transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
            onLoad={() => setIsLoading(false)}
            sizes={
              size === 'xl' ? '160px' :
              size === 'lg' ? '120px' :
              size === 'md' ? '80px' :
              '40px'
            }
            priority={size === 'lg' || size === 'xl'}
          />
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
        </>
      ) : (
        <span className="select-none">{initials}</span>
      )}
      
      {editable && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
          <span className="text-white text-xs font-medium">Change</span>
        </div>
      )}
    </div>
  );
}
