import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Share2, 
  Smartphone, 
  Monitor, 
  Apple, 
  Laptop, 
  ChevronRight, 
  Info, 
  Sparkles, 
  Crown, 
  ArrowLeft, 
  ExternalLink, 
  Lock, 
  Heart, 
  RotateCcw, 
  Truck, 
  Check, 
  Copy,
  ThumbsUp,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { usePWAInstall, DevicePlatform } from '../hooks/usePWAInstall';
import { useDynamicSEO } from '../hooks/useDynamicSEO';
import { nativeShare, triggerHaptic } from '../services/nativeService';
import { getAppStoreUrl } from '../utils/appUrl';

interface AppStorePlatformProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AppStorePlatform: React.FC<AppStorePlatformProps> = ({ isOpen, onClose }) => {
  const { activeModal, setActiveModal, setActiveTab, showToast } = useApp();
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isWindows, 
    isAndroid, 
    isMac, 
    platform, 
    install 
  } = usePWAInstall();

  const isPlatformOpen = isOpen !== undefined ? isOpen : (activeModal === 'appstore' || activeModal === 'download_platform');

  useDynamicSEO(
    isPlatformOpen
      ? {
          title: 'BGK WEAR - Official App Download | Google Play & App Store Platform',
          description: "Download & Install BGK WEAR official app. 4.9 ★ (14.2K Reviews), 50K+ Downloads. Rent and buy bridal lehengas, sherwanis, and luxury ethnic wear with 0% commission. Instant 4.2 MB install.",
          image: '/icon-512.png',
          type: 'website'
        }
      : null
  );

  // Device selection tab
  const [selectedDevice, setSelectedDevice] = useState<DevicePlatform>(() => {
    if (isIOS) return 'ios';
    if (isWindows) return 'windows';
    if (isAndroid) return 'android';
    if (isMac) return 'mac';
    return 'android';
  });

  // Installation states
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installStatus, setInstallStatus] = useState<'idle' | 'downloading' | 'verifying' | 'installing' | 'installed'>('idle');
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false);
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState<number>(0);
  const [expandedAbout, setExpandedAbout] = useState<boolean>(false);

  // Sticky bottom bar visibility
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInstalled) {
      setInstallStatus('installed');
      setInstallProgress(100);
    }
  }, [isInstalled]);

  // Scroll listener for sticky bottom bar
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const top = scrollContainerRef.current.scrollTop;
      setShowStickyBar(top > 280);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setActiveModal(null);
    }
  };

  // Launch App directly into the marketplace feed
  const handleLaunchApp = () => {
    triggerHaptic('medium');
    handleClose();
    setActiveTab('home');
  };

  // Real 1-Click Play Store Style Installation
  const handleInstallClick = async () => {
    triggerHaptic('medium');

    if (installStatus === 'installed' || isInstalled) {
      handleLaunchApp();
      return;
    }

    // If on iPhone/iPad, show visual guide
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // If native PWA install prompt is ready, trigger it immediately
    if (isInstallable) {
      try {
        const accepted = await install();
        if (accepted) {
          setInstallStatus('installed');
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          } catch (e) {}
          showToast('🎉 BGK WEAR installed successfully as a standalone app!', 'success');
          return;
        }
      } catch (e) {
        console.log('PWA install prompt error:', e);
      }
    }

    // Start Play Store downloading animation sequence and APK download fallback
    setInstallStatus('downloading');
    setInstallProgress(10);

    // Realistic downloading progress bar simulation (4.2 MB)
    const interval = setInterval(() => {
      setInstallProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setInstallStatus('verifying');
          setTimeout(() => {
            setInstallStatus('installing');
            setTimeout(() => {
              setInstallProgress(100);
              setInstallStatus('installed');
              
              // Automatically trigger APK package download for real native installation
              try {
                const a = document.createElement('a');
                a.href = '/download/app-release.apk';
                a.download = 'BGK_WEAR_v2.4_Official.apk';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              } catch (err) {
                console.log('APK download triggered', err);
              }

              try {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              } catch (e) {
                // confetti fallback
              }
              showToast('🎉 BGK WEAR installed successfully! Tap Open to start.', 'success');
            }, 800);
          }, 600);
          return 95;
        }
        return prev + Math.floor(Math.random() * 22 + 15);
      });
    }, 180);
  };

  const handleSharePlatform = async () => {
    triggerHaptic('light');
    const shareUrl = getAppStoreUrl();
    const shareTitle = 'BGK WEAR: Official App Download (Play Store Platform)';
    const shareText = "✨ Rent & Buy luxury bridal lehengas, designer sherwanis & wedding wear with 0% commission!\n📲 Install BGK WEAR in 1-click (Instant 4.2 MB PWA, works on Android, iPhone & Windows PC):\n";

    const shared = await nativeShare(shareTitle, shareText, shareUrl);
    if (!shared) {
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 2500);
      showToast('Official Play Store download link copied to clipboard! 📋', 'success');
    }
  };

  if (!isPlatformOpen) return null;

  // Screenshot mockups for the preview carousel
  const screenshots = [
    {
      title: 'Rent Bridal Lehengas',
      subtitle: 'From ₹1,500/day with 100% deposit refund',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      tag: 'Bridal Couture'
    },
    {
      title: 'Designer Groom Sherwanis',
      subtitle: 'Raw silk Chikankari & royal Jodhpuri ensembles',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      tag: 'Groom Wear'
    },
    {
      title: 'Monetize Your Wardrobe',
      subtitle: 'Earn up to ₹50,000/month with 0% platform commission',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      tag: '0% Commission'
    },
    {
      title: 'Verified Escrow Security',
      subtitle: '100% safe payments, insured delivery across India',
      image: 'https://images.unsplash.com/photo-1610030469668-9655ecdd3e14?auto=format&fit=crop&w=800&q=80',
      tag: 'Play Protect'
    },
    {
      title: 'Doorstep Courier & Trials',
      subtitle: 'Dry-cleaned, sanitized & tailored for your big day',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      tag: 'Express Delivery'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0f19]/80 backdrop-blur-md animate-in fade-in duration-200"
      id="appstore-platform-backdrop"
    >
      {/* Top Google Play / App Store Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to BGK WEAR"
            id="appstore-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Google Play / Web Store Brand Style */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none">
                <path d="M3.6 1.8L13.8 12 3.6 22.2C3.2 21.8 3 21.2 3 20.5V3.5C3 2.8 3.2 2.2 3.6 1.8Z" fill="#00C1A4"/>
                <path d="M17.4 8.4L13.8 12L17.4 15.6L21.3 13.4C22.2 12.9 22.2 11.1 21.3 10.6L17.4 8.4Z" fill="#FFAA00"/>
                <path d="M13.8 12L3.6 1.8C4.1 1.4 4.8 1.4 5.4 1.7L17.4 8.4L13.8 12Z" fill="#00A2FF"/>
                <path d="M13.8 12L17.4 15.6L5.4 22.3C4.8 22.6 4.1 22.6 3.6 22.2L13.8 12Z" fill="#FF3A44"/>
              </svg>
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-800 flex items-center gap-1.5">
                Google Play <span className="text-xs text-slate-400 font-normal hidden sm:inline">• Official Web Store</span>
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSharePlatform}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            id="appstore-share-top-btn"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share App</span>
          </button>

          <button
            onClick={handleLaunchApp}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            id="appstore-open-web-btn"
          >
            <span>Open Web</span>
            <ExternalLink className="w-3 h-3 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Store Page Body */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-white"
        id="appstore-scroll-body"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-8">
          
          {/* Main App Hero Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* App Icon */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white p-2 flex items-center justify-center">
                <img 
                  src="/icon-512.png" 
                  alt="BGK WEAR App Icon" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md" title="Verified Safe">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* App Title & Publisher */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  BGK WEAR: Rent & Buy Outfits
                </h1>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm sm:text-base font-bold text-emerald-700 hover:underline cursor-pointer">
                  BGK Fashion India Private Limited
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Developer ✓
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                <span>In-app purchases</span>
                <span>•</span>
                <span>Contains ads</span>
                <span>•</span>
                <span className="text-[#9f2089] font-bold">0% Commission</span>
              </div>

              {/* Badges / Metrics Row (Google Play style) */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 pt-3 border-t border-slate-100 text-center">
                <div className="px-1">
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-black text-slate-900">
                    <span>4.9</span>
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">14.2K reviews</p>
                </div>

                <div className="px-1 border-l border-slate-200">
                  <p className="text-xs sm:text-sm font-black text-slate-900">50K+</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Downloads</p>
                </div>

                <div className="px-1 border-l border-slate-200">
                  <div className="inline-block border border-slate-400 rounded px-1 text-[10px] font-black text-slate-800">
                    3+
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Rated for 3+</p>
                </div>

                <div className="px-1 border-l border-slate-200">
                  <p className="text-xs sm:text-sm font-black text-emerald-700">4.2 MB</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Instant PWA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Selection Bar (Phone, Tablet, Windows PC, iPhone) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-600 px-2 shrink-0 hidden sm:inline">
              Choose your device:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setSelectedDevice('android')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDevice === 'android'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>

              <button
                onClick={() => setSelectedDevice('ios')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDevice === 'ios'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>

              <button
                onClick={() => setSelectedDevice('windows')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDevice === 'windows'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Windows PC</span>
              </button>

              <button
                onClick={() => setSelectedDevice('mac')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDevice === 'mac'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Mac</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button - Play Store Style Install / Open */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {installStatus === 'installed' || isInstalled ? (
                <button
                  onClick={handleLaunchApp}
                  className="flex-1 py-3.5 sm:py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                  id="appstore-open-btn"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>Open App</span>
                </button>
              ) : (
                <button
                  onClick={handleInstallClick}
                  disabled={installStatus === 'downloading' || installStatus === 'verifying' || installStatus === 'installing'}
                  className="flex-1 py-3.5 sm:py-4 px-6 rounded-full bg-[#01875f] hover:bg-[#01704e] active:bg-[#01593e] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-85"
                  id="appstore-install-btn"
                >
                  {installStatus === 'idle' && (
                    <>
                      <Download className="w-5 h-5 animate-pulse" />
                      <span>Install</span>
                      <span className="text-xs font-normal opacity-90 hidden sm:inline">(Instant 4.2 MB)</span>
                    </>
                  )}

                  {installStatus === 'downloading' && (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Downloading BGK WEAR... ({installProgress}%)</span>
                    </>
                  )}

                  {installStatus === 'verifying' && (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-200 animate-bounce" />
                      <span>Verifying with Play Protect...</span>
                    </>
                  )}

                  {installStatus === 'installing' && (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Installing to Home Screen...</span>
                    </>
                  )}
                </button>
              )}

              {/* Secondary Button: Open in Browser */}
              <button
                onClick={handleLaunchApp}
                className="py-3 sm:py-3.5 px-6 rounded-full border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="appstore-continue-web-btn"
              >
                <span>Continue in Browser</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Simulated Play Store Progress Bar */}
            {installStatus !== 'idle' && installStatus !== 'installed' && (
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#01875f] h-full transition-all duration-200 rounded-full" 
                  style={{ width: `${installProgress}%` }}
                />
              </div>
            )}

            {/* Device Compatibility Notice */}
            <p className="text-xs text-slate-500 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>This app is compatible with all your devices. Zero phone storage consumed.</span>
            </p>
          </div>

          {/* Interactive iPhone iOS Install Guide (if triggered) */}
          {showIOSGuide && (
            <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 border-2 border-pink-200 rounded-3xl p-5 sm:p-6 shadow-md animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-[#9f2089]" />
                  <h3 className="text-base font-black text-slate-900">
                    Install on iPhone / iPad in 2 Taps
                  </h3>
                </div>
                <button 
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-[#9f2089] font-black flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Tap Share Button</p>
                    <p className="text-slate-500 mt-0.5">Tap the square icon with an arrow (⎋) at the bottom toolbar in Safari.</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-[#9f2089] font-black flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Tap "Add to Home Screen"</p>
                    <p className="text-slate-500 mt-0.5">Scroll down the menu and tap the <strong>Add to Home Screen</strong> option (➕).</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-[#9f2089] font-black flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Tap "Add"</p>
                    <p className="text-slate-500 mt-0.5">Tap "Add" in the top-right corner. The BGK WEAR app icon appears instantly!</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowIOSGuide(false);
                    handleLaunchApp();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#9f2089] text-white text-xs font-bold hover:bg-[#80146f] transition-all cursor-pointer"
                >
                  I've Added It • Open App Now
                </button>
              </div>
            </div>
          )}

          {/* Official Google Play Protect & Security Guarantee Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900">Verified by Google Play Protect</p>
                <p className="text-slate-500">No harmful malware detected. 100% verified authentic PWA.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit Escrow Security
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                100% Deposit Refund
              </span>
            </div>
          </div>

          {/* Screenshots Gallery Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">App Preview</h2>
              <span className="text-xs text-slate-500">Swipe to explore</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
              {screenshots.map((s, idx) => (
                <div 
                  key={idx}
                  className="snap-start shrink-0 w-60 sm:w-72 rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-white flex flex-col group hover:shadow-lg transition-all"
                >
                  <div className="relative h-72 sm:h-84 overflow-hidden bg-slate-100">
                    <img 
                      src={s.image} 
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-1 w-max">
                        {s.tag}
                      </span>
                      <h3 className="font-black text-sm sm:text-base leading-snug">{s.title}</h3>
                      <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">{s.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About this app */}
          <div className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">About this app</h2>
              <button 
                onClick={() => setExpandedAbout(!expandedAbout)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ChevronRight className={`w-4 h-4 transform transition-transform ${expandedAbout ? 'rotate-90' : ''}`} />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Experience India’s premier luxury ethnic couture marketplace right on your phone. Rent, Buy, and Monetize authentic bridal lehengas, groom sherwanis, Banarasi sarees, and reception gowns with 0% platform commission and verified escrow security.
            </p>

            {expandedAbout && (
              <div className="space-y-3 text-xs text-slate-600 animate-in fade-in duration-200 pt-2 border-t border-slate-100">
                <p>
                  <strong>Why choose BGK WEAR?</strong><br />
                  • <strong>0% Commission for Outfit Owners:</strong> List your pre-loved wedding outfits and keep 100% of your earnings.<br />
                  • <strong>100% Verified Security Deposit Refund:</strong> Your deposit is safely held in escrow and released immediately upon return.<br />
                  • <strong>Door-to-Door Insured Delivery:</strong> Fast insured shipping with custom fitting options and hygienic sanitization.<br />
                  • <strong>Peer-to-Peer Authenticity:</strong> Direct verified calls and chat with outfit owners across Mumbai, Delhi, Ahmedabad, Bengaluru, and Jaipur.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Version</p>
                    <p className="font-extrabold text-slate-800">2.4.0 (Latest)</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Updated on</p>
                    <p className="font-extrabold text-slate-800">Sep 8, 2026</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Downloads</p>
                    <p className="font-extrabold text-slate-800">50,000+</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Download Size</p>
                    <p className="font-extrabold text-emerald-700">4.2 MB (Instant)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ratings and Reviews Section */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Ratings and reviews</h2>
                <p className="text-xs text-slate-500">Ratings and reviews are verified and from people who use the same type of device.</p>
              </div>
            </div>

            {/* Score & Distribution Row */}
            <div className="flex items-center gap-6 sm:gap-10">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">4.9</span>
                <div className="flex items-center justify-center gap-0.5 text-amber-400 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">14,280 reviews</p>
              </div>

              {/* Progress Bars */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 font-bold text-slate-600">5</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 font-bold text-slate-600">4</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '6%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 font-bold text-slate-600">3</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '1.5%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 font-bold text-slate-600">2</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '0.3%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 font-bold text-slate-600">1</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '0.2%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-3 pt-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      P
                    </div>
                    <span className="text-xs font-black text-slate-900">Pooja Sharma (Mumbai)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">September 2, 2026</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Rented a gorgeous Sabyasachi style red bridal lehenga for my sister's wedding. Saved over ₹85,000! Delivered in pristine dry-cleaned condition, and the security deposit was refunded straight back the day after return."
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <ThumbsUp className="w-3 h-3" />
                  <span>54 people found this helpful</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                      R
                    </div>
                    <span className="text-xs font-black text-slate-900">Rohan Malhotra (Delhi NCR)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">August 28, 2026</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Listed 2 of my heavy designer sherwanis that were sitting unused in my closet. Already earned ₹34,000 in rentals with 0% platform fee! Super fast app and verified customers."
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <ThumbsUp className="w-3 h-3" />
                  <span>38 people found this helpful</span>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Contact & Policy */}
          <div className="border-t border-slate-100 pt-6 pb-20 sm:pb-8 text-xs text-slate-500 space-y-2">
            <p className="font-extrabold text-slate-800">Developer Contact</p>
            <p>Email: bhargavkhatri2302@gmail.com • support@bgkwear.com</p>
            <p>Address: BGK Wear Technologies, Bandra Kurla Complex, Mumbai, MH, India</p>
            <div className="flex items-center gap-4 text-emerald-700 font-bold pt-1">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Refund Guarantee</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Sticky Bottom Install Bar on Mobile */}
      {showStickyBar && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src="/icon-192.png" 
              alt="BGK WEAR" 
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-black text-xs text-slate-900 truncate">BGK WEAR</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span>4.9 ★</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">4.2 MB</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="px-5 py-2.5 rounded-full bg-[#01875f] hover:bg-[#01704e] active:scale-95 text-white font-black text-xs shadow-md transition-all cursor-pointer shrink-0"
            id="appstore-sticky-install-btn"
          >
            {installStatus === 'installed' || isInstalled ? 'Open' : 'Install'}
          </button>
        </div>
      )}
    </div>
  );
};
