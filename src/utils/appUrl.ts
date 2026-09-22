/**
 * Centralized App URL and Share Link Utilities
 * Provides verified, working live URLs for sharing, installing, and web access.
 */

// Official live deployment URL of BGK WEAR on Google Cloud Run
export const OFFICIAL_LIVE_URL = 'https://ais-pre-dhycsawcs6idisqhopoyem-10755086688.asia-southeast1.run.app';

/**
 * Returns the current working origin of the application.
 * Falls back to the verified official live URL if window is unavailable or invalid.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    // Check for null, localhost or invalid origins if needed, but allow current domain if valid
    if (
      origin && 
      origin !== 'null' && 
      !origin.includes('your-domain') && 
      !origin.includes('undefined')
    ) {
      return origin;
    }
  }
  return OFFICIAL_LIVE_URL;
}

/**
 * Returns the official 1-Click Play Store download platform URL.
 * Works on any browser (Chrome, Safari, Edge) across Android, iOS, Windows, Mac.
 */
export function getAppStoreUrl(): string {
  return `${getAppBaseUrl()}/?platform=store`;
}

/**
 * Returns the direct /download endpoint URL.
 */
export function getDirectDownloadUrl(): string {
  return `${getAppBaseUrl()}/download`;
}
