/**
 * App Version & Remote Update Service
 * BGK Wear In-App Auto Update System
 */

export const CURRENT_APP_VERSION = "1.0.0";

export interface AppVersionInfo {
  version: string;
  downloadUrl: string;
  releaseNotes: string[];
  releaseDate?: string;
  isMandatory?: boolean;
  minSupportedVersion?: string;
  fileSize?: string;
}

// Default fallback remote config if external endpoint is unreachable
export const DEFAULT_REMOTE_VERSION_CONFIG: AppVersionInfo = {
  version: "1.0.1",
  downloadUrl: "https://github.com/bgkwear/app/releases/latest",
  releaseNotes: [
    "⚡ Superfast photo upload & bridal gallery loading",
    "💬 Direct 1-Click WhatsApp seller connect without saving numbers",
    "🛡️ Verified closet owners badge & 0% commission deals",
    "📍 Automatic State & District location filters",
    "✨ Enhanced UI performance & stability fixes"
  ],
  releaseDate: "2026-08-14",
  isMandatory: false,
  fileSize: "14.2 MB"
};

/**
 * Compare two semver strings (e.g. "1.0.0" vs "1.0.1")
 * Returns true if remoteVersion > currentVersion
 */
export function isNewerVersion(currentVersion: string, remoteVersion: string): boolean {
  if (!remoteVersion || !currentVersion) return false;
  
  const currentParts = currentVersion.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const remoteParts = remoteVersion.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);

  const maxLength = Math.max(currentParts.length, remoteParts.length);

  for (let i = 0; i < maxLength; i++) {
    const current = currentParts[i] || 0;
    const remote = remoteParts[i] || 0;

    if (remote > current) {
      return true;
    }
    if (remote < current) {
      return false;
    }
  }

  return false;
}

const DISMISSED_VERSION_KEY = "bgk_wear_dismissed_update_version";
const CUSTOM_REMOTE_CONFIG_KEY = "bgk_wear_custom_version_config";

/**
 * Check for updates against remote URL, custom storage, or default remote config
 */
export async function fetchLatestAppVersion(remoteUrl?: string): Promise<AppVersionInfo> {
  // 1. Check if user configured a custom remote config in localStorage for testing
  try {
    const customConfig = localStorage.getItem(CUSTOM_REMOTE_CONFIG_KEY);
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed && parsed.version) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore JSON errors
  }

  // 2. If a live remote endpoint URL is provided or configured in window/env, attempt fetch
  const targetUrl = remoteUrl || (typeof window !== 'undefined' && (window as any).__BGK_UPDATE_URL__) || null;

  if (targetUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(targetUrl, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.version) {
          return {
            version: data.version,
            downloadUrl: data.downloadUrl || data.download_url || DEFAULT_REMOTE_VERSION_CONFIG.downloadUrl,
            releaseNotes: data.releaseNotes || data.release_notes || DEFAULT_REMOTE_VERSION_CONFIG.releaseNotes,
            releaseDate: data.releaseDate || data.release_date || DEFAULT_REMOTE_VERSION_CONFIG.releaseDate,
            isMandatory: Boolean(data.isMandatory ?? data.is_mandatory),
            fileSize: data.fileSize || data.file_size || DEFAULT_REMOTE_VERSION_CONFIG.fileSize
          };
        }
      }
    } catch (err) {
      console.warn("Version fetch failed, using fallback config:", err);
    }
  }

  // 3. Fallback to default remote configuration
  return DEFAULT_REMOTE_VERSION_CONFIG;
}

/**
 * Check if the user previously dismissed this specific update version
 */
export function isVersionDismissed(version: string): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISSED_VERSION_KEY);
    return dismissed === version;
  } catch {
    return false;
  }
}

/**
 * Remember that the user dismissed this update version
 */
export function markVersionDismissed(version: string): void {
  try {
    localStorage.setItem(DISMISSED_VERSION_KEY, version);
  } catch {}
}

/**
 * Clear dismissed version flag
 */
export function clearDismissedVersion(): void {
  try {
    localStorage.removeItem(DISMISSED_VERSION_KEY);
  } catch {}
}
