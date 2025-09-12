/**
 * Authentication helper functions for managing redirect URLs
 * across different environments (development, preview, production)
 */

/**
 * Get the correct redirect URL for the current environment
 * @param path - The path to append to the base URL
 * @returns Complete URL for redirects
 */
export function getRedirectURL(path: string = ''): string {
  // Priority order for determining base URL
  let url = 
    process.env.NEXT_PUBLIC_APP_URL ||           // Production custom domain (e.g., https://devdapp.com)
    process.env.NEXT_PUBLIC_SITE_URL ||          // Fallback site URL
    process.env.NEXT_PUBLIC_VERCEL_URL ||        // Vercel deployment URL
    (typeof window !== 'undefined' ? window.location.origin : '') ||  // Browser fallback
    'http://localhost:3000';                     // Development fallback

  // Ensure HTTPS in production
  if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
    url = `https://${url.replace(/^https?:\/\//, '')}`;
  }

  // Remove trailing slash and add path
  url = url.replace(/\/$/, '');
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${url}${fullPath}`;
}

/**
 * Get auth redirect URL with fallback for authentication flows
 * @param redirectPath - The path to redirect to after auth (default: /protected/profile)
 * @returns Complete URL for auth redirects
 */
export function getAuthRedirectURL(redirectPath: string = '/protected/profile'): string {
  return getRedirectURL(redirectPath);
}

/**
 * Get the current environment type
 * @returns Environment string
 */
export function getEnvironment(): 'development' | 'preview' | 'production' {
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }
  
  return 'production';
}

/**
 * Check if the current environment is production
 * @returns True if production environment
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Get the base URL without any path
 * @returns Base URL for the current environment
 */
export function getBaseURL(): string {
  return getRedirectURL('').replace(/\/$/, '');
}
