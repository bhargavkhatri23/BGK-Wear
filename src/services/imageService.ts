/**
 * BGK WEAR - High Performance Image Processing Service
 * Instant photo selection, fast multi-image previews, and non-blocking background compression.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

/**
 * Creates an instant preview URL for any file (0ms delay)
 */
export function createInstantPreviewUrl(file: File): string {
  try {
    return URL.createObjectURL(file);
  } catch {
    return '';
  }
}

/**
 * Fast asynchronous image compression using HTML5 Canvas.
 * Non-blocking, fast and optimized for instant publishing.
 */
export async function compressImage(
  input: File | string,
  maxWidth = 1080,
  maxHeight = 1440,
  quality = 0.80
): Promise<CompressionResult> {
  return new Promise((resolve) => {
    // If it's already a regular web URL (e.g. Unsplash), return directly
    if (typeof input === 'string' && input.startsWith('http')) {
      resolve({
        dataUrl: input,
        originalSizeKB: 100,
        compressedSizeKB: 100,
        reductionPercentage: 0,
        width: 1080,
        height: 1440
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleSuccess = () => {
      try {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 1000;

        // Calculate aspect ratio preserving dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          resolve({
            dataUrl: typeof input === 'string' ? input : img.src,
            originalSizeKB: 200,
            compressedSizeKB: 200,
            reductionPercentage: 0,
            width,
            height
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const originalEstimate = typeof input === 'string' 
          ? Math.round((input.length * 3) / 4 / 1024) 
          : Math.round(input.size / 1024);
        
        const compressedSizeKB = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
        const reduction = originalEstimate > 0 
          ? Math.max(0, Math.round(((originalEstimate - compressedSizeKB) / originalEstimate) * 100))
          : 0;

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKB: originalEstimate || compressedSizeKB,
          compressedSizeKB,
          reductionPercentage: reduction,
          width,
          height
        });
      } catch (e) {
        console.warn('Canvas export fallback:', e);
        resolve({
          dataUrl: typeof input === 'string' ? input : img.src,
          originalSizeKB: 200,
          compressedSizeKB: 200,
          reductionPercentage: 0,
          width: 800,
          height: 1000
        });
      }
    };

    img.onload = handleSuccess;
    img.onerror = () => {
      // Graceful fallback to input
      resolve({
        dataUrl: typeof input === 'string' ? input : '',
        originalSizeKB: 100,
        compressedSizeKB: 100,
        reductionPercentage: 0,
        width: 800,
        height: 1000
      });
    };

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = () => {
        resolve({
          dataUrl: '',
          originalSizeKB: 0,
          compressedSizeKB: 0,
          reductionPercentage: 0,
          width: 0,
          height: 0
        });
      };
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Fast parallel compression of multiple files without freezing UI
 */
export async function compressMultipleImages(
  files: (File | string)[]
): Promise<string[]> {
  const promises = files.map((file) => compressImage(file, 1080, 1440, 0.78));
  const results = await Promise.all(promises);
  return results.map((r) => r.dataUrl).filter((url) => Boolean(url));
}

/**
 * Validates whether a file is an acceptable image format and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|gif)$/i)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPG, PNG, WebP, HEIC).'
    };
  }

  const maxSizeBytes = 30 * 1024 * 1024; // 30MB max upload
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'Image size exceeds 30MB. Please choose a smaller photo.'
    };
  }

  return { valid: true };
}
