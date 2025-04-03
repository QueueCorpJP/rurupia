/**
 * Utility functions for image optimization to improve SEO and page speed
 */

// Default quality setting for images
const DEFAULT_QUALITY = 80;

/**
 * Creates an optimized image URL using imgix-style parameters
 * Works with Supabase storage and other providers like Cloudinary
 * 
 * @param imageUrl - The original image URL
 * @param width - Desired width of the image
 * @param height - Desired height of the image
 * @param quality - Image quality (1-100)
 * @param objectFit - How the image should fit its container (cover, contain, fill)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  width?: number,
  height?: number,
  quality = DEFAULT_QUALITY,
  objectFit: 'cover' | 'contain' | 'fill' = 'cover'
): string {
  // Bail early if no image URL provided
  if (!imageUrl) return '';
  
  try {
    // Parse the URL to get its components
    const url = new URL(imageUrl);
    
    // Handle Supabase storage URLs
    if (url.hostname.includes('supabase')) {
      // Supabase storage URLs with resize API
      url.searchParams.set('quality', quality.toString());
      
      if (width) {
        url.searchParams.set('width', width.toString());
      }
      
      if (height) {
        url.searchParams.set('height', height.toString());
      }
      
      // Add resize mode based on objectFit
      if (width && height) {
        // Map objectFit to Supabase resize mode
        const resizeMode = objectFit === 'contain' ? 'fit' : 
                          objectFit === 'fill' ? 'fill' : 'cover';
        url.searchParams.set('resize', resizeMode);
      }
      
      return url.toString();
    }
    
    // Handle placeholder images
    if (imageUrl.includes('placehold.co')) {
      // For placeholder images, we can modify the dimensions in the URL
      const widthStr = width ? width.toString() : '600';
      const heightStr = height ? height.toString() : '400';
      
      return `https://placehold.co/${widthStr}x${heightStr}/png`;
    }
    
    // For unsplash images
    if (url.hostname.includes('unsplash.com')) {
      // Unsplash already provides an optimization API
      url.searchParams.set('q', quality.toString());
      
      if (width) {
        url.searchParams.set('w', width.toString());
      }
      
      if (height) {
        url.searchParams.set('h', height.toString());
      }
      
      // Add fit parameter based on objectFit
      if (width && height) {
        // Map objectFit to Unsplash fit parameter
        const fitMode = objectFit === 'contain' ? 'max' : 
                       objectFit === 'fill' ? 'fill' : 'crop';
        url.searchParams.set('fit', fitMode);
      }
      
      return url.toString();
    }
    
    // For other image providers, return the original URL
    return imageUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    // Return the original URL if there was an error
    return imageUrl;
  }
}

/**
 * Creates an optimized avatar image URL
 * Specifically designed for profile pictures, preserving aspect ratio
 * 
 * @param imageUrl - The original image URL
 * @param size - Size of the avatar (width and height)
 * @param quality - Image quality (1-100)
 * @returns Optimized avatar image URL
 */
export function getAvatarImageUrl(
  imageUrl: string, 
  size: number = 128, 
  quality = DEFAULT_QUALITY
): string {
  if (!imageUrl) return '';
  
  try {
    const url = new URL(imageUrl);
    
    // Handle Supabase storage URLs
    if (url.hostname.includes('supabase')) {
      // For avatars, we use 'fit' resize mode to preserve aspect ratio
      // while ensuring the entire image is visible
      url.searchParams.set('width', size.toString());
      url.searchParams.set('height', size.toString());
      url.searchParams.set('resize', 'contain');
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('background', 'transparent');
      return url.toString();
    }
    
    // Handle unsplash images
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('w', size.toString());
      url.searchParams.set('h', size.toString());
      url.searchParams.set('fit', 'max');
      url.searchParams.set('q', quality.toString());
      return url.toString();
    }
    
    // For other providers, use standard optimization
    return getOptimizedImageUrl(imageUrl, size, size, quality, 'contain');
  } catch (error) {
    console.error('Error creating avatar URL:', error);
    return imageUrl;
  }
}

/**
 * Creates a blurred placeholder image URL for lazy loading
 * 
 * @param imageUrl - The original image URL
 * @returns Blurred placeholder image URL
 */
export function getBlurredPlaceholderUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  try {
    const url = new URL(imageUrl);
    
    // Handle Supabase storage URLs
    if (url.hostname.includes('supabase')) {
      url.searchParams.set('width', '10');
      url.searchParams.set('blur', '10');
      return url.toString();
    }
    
    // Handle unsplash images
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('w', '10');
      url.searchParams.set('blur', '20');
      return url.toString();
    }
    
    // For other providers, return a simple placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/x8AAuMB8DtguhUAAAAASUVORK5CYII=';
  } catch (error) {
    console.error('Error creating placeholder URL:', error);
    return '';
  }
}

/**
 * Generates image srcset for responsive images
 * 
 * @param imageUrl - The original image URL
 * @param sizes - Array of image widths to include in srcset
 * @param objectFit - How the image should fit its container
 * @returns srcset string for use in img element
 */
export function generateSrcset(
  imageUrl: string, 
  sizes: number[] = [320, 640, 960, 1280],
  objectFit: 'cover' | 'contain' | 'fill' = 'cover'
): string {
  if (!imageUrl) return '';
  
  try {
    return sizes
      .map(size => `${getOptimizedImageUrl(imageUrl, size, undefined, DEFAULT_QUALITY, objectFit)} ${size}w`)
      .join(', ');
  } catch (error) {
    console.error('Error generating srcset:', error);
    return '';
  }
} 