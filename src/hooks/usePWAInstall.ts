import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type DevicePlatform = 'ios' | 'windows' | 'android' | 'mac' | 'other';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<DevicePlatform>('other');
  const [isIOS, setIsIOS] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [browserName, setBrowserName] = useState<string>('browser');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed & running as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Detect device platform & OS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDev = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isWinDev = /windows|win32|win64/.test(ua);
    const isAndDev = /android/.test(ua);
    const isMacDev = /macintosh|mac os x/.test(ua) && !isIosDev;

    setIsIOS(isIosDev);
    setIsWindows(isWinDev);
    setIsAndroid(isAndDev);
    setIsMac(isMacDev);

    if (isIosDev) setPlatform('ios');
    else if (isWinDev) setPlatform('windows');
    else if (isAndDev) setPlatform('android');
    else if (isMacDev) setPlatform('mac');
    else setPlatform('other');

    // Detect browser
    if (/edg/.test(ua)) setBrowserName('edge');
    else if (/chrome|crios/.test(ua)) setBrowserName('chrome');
    else if (/safari/.test(ua) && !/chrome|crios|fxios/.test(ua)) setBrowserName('safari');
    else if (/firefox|fxios/.test(ua)) setBrowserName('firefox');

    // Listen for beforeinstallprompt (Chromium / Windows / Android / Mac Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isWindows,
    isAndroid,
    isMac,
    platform,
    browserName,
    install,
    deferredPrompt,
  };
}
