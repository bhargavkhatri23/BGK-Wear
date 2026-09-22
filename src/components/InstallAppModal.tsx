import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Apple, 
  Laptop, 
  Download, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  Zap, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall, DevicePlatform } from '../hooks/usePWAInstall';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const InstallAppModal: React.FC = () => {
  const { activeModal, setActiveModal } = useApp();
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

  useDynamicSEO(
    activeModal === 'install'
      ? {
          title: 'Download & Install BGK WEAR | iPhone, Windows PC & Android App',
          description: 'Install BGK WEAR on iPhone (iOS), Windows 10/11 PC, Android & Mac. Enjoy 0MB instant installation, offline catalog caching, and smooth standalone desktop experience.',
          type: 'website'
        }
      : null
  );

  // Determine initial tab based on detected platform
  const initialTab: DevicePlatform = 
    isIOS ? 'ios' : isWindows ? 'windows' : isAndroid ? 'android' : isMac ? 'mac' : 'windows';

  const [selectedTab, setSelectedTab] = useState<DevicePlatform>(initialTab);
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (activeModal !== 'install') {
    return null;
  }

  const handleNativeInstall = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setActiveModal(null);
      }, 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
      id="install-app-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveModal(null);
      }}
    >
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        id="install-app-modal-card"
      >
        {/* Top Header */}
        <div className="relative px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-[#9f2089] via-[#b31e84] to-[#c2185b] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
              <Download className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
                  Download & Install BGK WEAR
                </h2>
                <Sparkles className="w-3.5 h-3.5 text-pink-200" />
              </div>
              <p className="text-[11px] sm:text-xs text-pink-100 font-medium mt-1">
                Full Support for iPhone (iOS), Windows PC, Android & Mac
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            id="close-install-modal-btn"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Selection Tabs */}
        <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Your Device / OS:
          </p>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {/* iPhone / iOS Tab */}
            <button
              onClick={() => setSelectedTab('ios')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedTab === 'ios'
                  ? 'bg-white text-[#9f2089] border-[#9f2089] shadow-sm ring-1 ring-[#9f2089]/20'
                  : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
              }`}
              id="tab-install-ios"
            >
              <Apple className="w-4 h-4 shrink-0" />
              <span className="text-[11px] sm:text-xs">iPhone / iOS</span>
              {isIOS && (
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-pink-100 text-[#9f2089] text-[9px] rounded-full font-extrabold">
                  You
                </span>
              )}
            </button>

            {/* Windows PC Tab */}
            <button
              onClick={() => setSelectedTab('windows')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedTab === 'windows'
                  ? 'bg-white text-[#9f2089] border-[#9f2089] shadow-sm ring-1 ring-[#9f2089]/20'
                  : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
              }`}
              id="tab-install-windows"
            >
              <Monitor className="w-4 h-4 shrink-0" />
              <span className="text-[11px] sm:text-xs">Windows PC</span>
              {isWindows && (
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-pink-100 text-[#9f2089] text-[9px] rounded-full font-extrabold">
                  You
                </span>
              )}
            </button>

            {/* Android Tab */}
            <button
              onClick={() => setSelectedTab('android')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedTab === 'android'
                  ? 'bg-white text-[#9f2089] border-[#9f2089] shadow-sm ring-1 ring-[#9f2089]/20'
                  : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
              }`}
              id="tab-install-android"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="text-[11px] sm:text-xs">Android</span>
              {isAndroid && (
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-pink-100 text-[#9f2089] text-[9px] rounded-full font-extrabold">
                  You
                </span>
              )}
            </button>

            {/* Mac / PC Tab */}
            <button
              onClick={() => setSelectedTab('mac')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedTab === 'mac'
                  ? 'bg-white text-[#9f2089] border-[#9f2089] shadow-sm ring-1 ring-[#9f2089]/20'
                  : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
              }`}
              id="tab-install-mac"
            >
              <Laptop className="w-4 h-4 shrink-0" />
              <span className="text-[11px] sm:text-xs">Mac / Laptop</span>
              {isMac && (
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-pink-100 text-[#9f2089] text-[9px] rounded-full font-extrabold">
                  You
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 space-y-4">
          
          {/* Status banner if already running in standalone */}
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-800">
                You are currently using the installed standalone application of BGK WEAR!
              </p>
            </div>
          )}

          {/* 1. IPHONE (iOS) GUIDE */}
          {selectedTab === 'ios' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <Apple className="w-4.5 h-4.5 text-pink-400" />
                  <h3 className="text-sm font-bold text-white">
                    iPhone & iPad Installation Guide
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apple iOS does not use .apk files. Instead, iOS uses <strong>Apple Progressive Web App (PWA)</strong> technology. It installs in <strong>2 seconds</strong>, requires no App Store credentials, and works in full-screen edge-to-edge mode.
                </p>
              </div>

              {/* 3 Steps for iOS */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#9f2089] text-white flex items-center justify-center text-[10px] font-black">
                    1
                  </span>
                  Step 1: Open in Safari & Tap Share
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Share className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Open this website in <strong>Safari</strong> on your iPhone/iPad. Tap the <strong>Share</strong> button (the square icon with an upward arrow) in the Safari bottom bar (or top bar on iPad).
                  </div>
                </div>

                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <span className="w-5 h-5 rounded-full bg-[#9f2089] text-white flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  Step 2: Tap "Add to Home Screen"
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-[#9f2089] shrink-0">
                    <PlusSquare className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Scroll down the Safari action sheet and select <strong>"Add to Home Screen"</strong> (होम स्क्रीन में जोड़ें).
                  </div>
                </div>

                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                  <span className="w-5 h-5 rounded-full bg-[#9f2089] text-white flex items-center justify-center text-[10px] font-black">
                    3
                  </span>
                  Step 3: Tap "Add" (Done!)
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Tap <strong>"Add"</strong> in the top right. The <strong>BGK WEAR</strong> luxury app icon will immediately appear on your iPhone home screen!
                  </div>
                </div>
              </div>

              {/* iOS Features */}
              <div className="p-3 rounded-xl bg-pink-50/70 border border-pink-200 text-xs text-[#9f2089] font-medium flex items-center justify-between">
                <span>✨ Native fullscreen, offline image caching & fast gestures</span>
                <span className="font-black">iOS 14+</span>
              </div>
            </div>
          )}

          {/* 2. WINDOWS PC GUIDE */}
          {selectedTab === 'windows' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <Monitor className="w-4.5 h-4.5 text-blue-300" />
                  <h3 className="text-sm font-bold text-white">
                    Windows 11 / 10 Desktop Application
                  </h3>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  BGK WEAR installs as a dedicated native desktop application on Windows via Microsoft Edge or Google Chrome. It pins to your <strong>Windows Taskbar</strong> and <strong>Start Menu</strong>, opening in its own clean window without any browser borders.
                </p>
              </div>

              {/* Direct 1-Click Install Button if supported by current browser */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-2 border-[#9f2089]/30 text-center space-y-3">
                  <p className="text-xs font-bold text-slate-800">
                    Your browser supports 1-Click Windows Desktop Installation:
                  </p>
                  <button
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#9f2089] to-[#c2185b] hover:from-[#80146f] hover:to-[#a2134a] text-white font-extrabold text-xs shadow-lg shadow-pink-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="install-windows-prompt-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Opening Windows Installer...' : 'Install to Windows Desktop Now'}</span>
                  </button>
                  {installSuccess && (
                    <p className="text-xs font-bold text-emerald-600">
                      Installation accepted! Adding to your Windows desktop...
                    </p>
                  )}
                </div>
              )}

              {/* Step-by-step for Edge / Chrome on Windows */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  How to Install via Microsoft Edge or Chrome:
                </h4>
                
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Look at the <strong>top-right of your browser address bar</strong> (URL bar). Click the <strong>"Install BGK WEAR"</strong> or <strong>"App available"</strong> monitor icon.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Alternatively, click the <strong>3 dots (⋮)</strong> menu in Chrome or Edge, go to <strong>"Apps"</strong>, and select <strong>"Install BGK WEAR"</strong>.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#9f2089] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Click <strong>Install</strong>. Select <em>"Pin to taskbar"</em> and <em>"Pin to Start"</em> for instant 1-click access anytime!
                  </div>
                </div>
              </div>

              {/* Windows benefits */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Monitor className="w-4 h-4 text-[#9f2089] mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-800">Clean Window</p>
                  <p className="text-[9px] text-slate-400">No browser tabs</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-800">Ultra Fast</p>
                  <p className="text-[9px] text-slate-400">Hardware accelerated</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Wifi className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-800">Offline Ready</p>
                  <p className="text-[9px] text-slate-400">Cached catalogue</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. ANDROID GUIDE */}
          {selectedTab === 'android' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <Smartphone className="w-4.5 h-4.5 text-emerald-300" />
                  <h3 className="text-sm font-bold text-white">
                    Android Installation Options
                  </h3>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  On Android, you have <strong>two convenient ways</strong> to run BGK WEAR. You can install the instant web app or download the official APK file.
                </p>
              </div>

              {/* Option A: Instant PWA Install */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#9f2089]" />
                    <span className="text-xs font-black text-slate-900">Option 1: Instant App (Recommended)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase">
                    Zero Storage
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Installs in under 3 seconds directly onto your Android home screen and app drawer. Automatically stays updated with 0MB download hassle.
                </p>

                {isInstallable ? (
                  <button
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    id="install-android-pwa-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Installing...' : 'Install Instant App (1-Click)'}</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    In Chrome, tap the <strong>3 dots (⋮)</strong> at top right &gt; tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </div>
                )}
              </div>

              {/* Option B: Official APK Download */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-900">Option 2: Official Android APK</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase">
                    Direct APK
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download the official verified .apk file directly from our secure Google Cloud repository.
                </p>

                <a
                  href="https://drive.google.com/file/d/1KaeLzgzeEGzq3vBFUSM7M_uIDdieyiyq/view?usp=drivesdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                  id="download-official-apk-modal-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verified APK</span>
                </a>
              </div>
            </div>
          )}

          {/* 4. MAC / LAPTOP / COMPUTER */}
          {selectedTab === 'mac' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 text-white shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <Laptop className="w-4.5 h-4.5 text-purple-300" />
                  <h3 className="text-sm font-bold text-white">
                    Mac, Chromebook & Desktop Computer
                  </h3>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed">
                  On macOS, Linux, and Chromebooks, you can run BGK WEAR as a dedicated desktop software via Google Chrome, Microsoft Edge, or Safari (macOS Sonoma+).
                </p>
              </div>

              {/* 1-Click Install if available */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-800">
                    One-Click Mac / Desktop Installation Available:
                  </p>
                  <button
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#9f2089] hover:bg-[#80146f] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    id="install-mac-prompt-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Opening Installer...' : 'Install as Mac App'}</span>
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  How to Install on macOS / Chrome:
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    In <strong>Google Chrome</strong> or <strong>Edge</strong>, click the <strong>Install</strong> icon in the address bar, or click <strong>File &gt; Add to Dock</strong> in Safari on macOS Sonoma.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    The app launches in its own native macOS window, appears in your <strong>Applications</strong> folder and <strong>Dock</strong>, and supports all native trackpad gestures!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cross-Platform Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-[11px] text-slate-500 leading-tight">
              <strong className="text-slate-800">100% Safe & Secure:</strong> All versions connect directly to official Google Firebase infrastructure. No malware, no ads, completely encrypted checkout.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#9f2089]" />
            <span>Universal Responsive Engine</span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            id="modal-close-bottom-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
