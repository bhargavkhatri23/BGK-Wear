import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { compressImage } from './imageService';

export interface StorageUploadResult {
  url: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  storagePath: string;
}

/**
 * Fast parallel upload with timeout fallback so publishing NEVER hangs
 */
export async function uploadMultipleListingImages(
  images: string[],
  userId: string
): Promise<string[]> {
  if (!images || images.length === 0) return [];

  const uploadPromises = images.map(async (img, idx) => {
    // If it's already a hosted URL (e.g. unplash or https://), no upload needed
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }

    // If it's a blob URL or base64 data URL, upload or use data URL
    try {
      // 3 second timeout for storage upload so user is never blocked
      const uploadWithTimeout = new Promise<string>(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve(img); // fallback immediately to dataUrl on timeout
        }, 2500);

        try {
          let dataToUpload = img;
          if (img.startsWith('blob:')) {
            const comp = await compressImage(img, 1080, 1440, 0.78);
            dataToUpload = comp.dataUrl || img;
          }

          if (!dataToUpload.startsWith('data:')) {
            clearTimeout(timeout);
            resolve(dataToUpload);
            return;
          }

          const timestamp = Date.now();
          const safeUserId = userId || 'seller';
          const storagePath = `listings/${safeUserId}/${timestamp}_${idx}.jpg`;
          const storageRef = ref(storage, storagePath);

          await uploadString(storageRef, dataToUpload, 'data_url', {
            contentType: 'image/jpeg'
          });

          const downloadUrl = await getDownloadURL(storageRef);
          clearTimeout(timeout);
          resolve(downloadUrl);
        } catch (uploadErr) {
          clearTimeout(timeout);
          // Fallback to dataUrl on any storage error
          resolve(img);
        }
      });

      return await uploadWithTimeout;
    } catch {
      return img;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results;
}

/**
 * Single image upload helper
 */
export async function uploadListingImage(
  image: string,
  userId: string
): Promise<string> {
  const [result] = await uploadMultipleListingImages([image], userId);
  return result || image;
}
