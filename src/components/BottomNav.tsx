import React from 'react';
import { 
  Home, 
  Compass, 
  Plus, 
  Heart, 
  User,
  ShieldAlert,
  Download,
  Apple,
  Monitor
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    wishlist, 
    setActiveModal, 
    user 
  } = useApp();

  const { isInstalled, isIOS, isWindows } = usePWAInstall();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 sm:h-18 md:h-screen md:w-24 lg:w-64 md:top-0 md:border-t-0 md:border-r bg-gradient-to-r from-pink-50/95 via-fuchsia-50/90 to-purple-50/95 md:bg-gradient-to-b backdrop-blur-xl border-t border-pink-200/80 md:border-pink-200/60 shadow-[0_-4px_20px_rgba(159,32,137,0.08)] md:shadow-none flex items-center justify-around md:flex-col md:justify-start md:py-8 px-2 sm:px-12 md:px-0 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] md:pb-8">
      
      {/* Logo Area (Desktop Only) */}
      <div className="hidden md:flex flex-col items-center justify-center w-full pb-8 mb-6 border-b border-slate-100">
        <h1 className="text-xl lg:text-3xl font-serif font-black tracking-tighter text-[#9f2089] lg:flex lg:items-center lg:gap-1">
          <span className="hidden lg:inline">BGK</span>
          <span className="text-slate-900 hidden lg:inline">WEAR</span>
          <span className="lg:hidden">BGK</span>
        </h1>
        <p className="text-[8px] lg:text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1 hidden lg:block">
          Luxury Signature
        </p>
      </div>

      <div className="flex items-center justify-around md:flex-col md:justify-start md:gap-4 lg:gap-2 w-full max-w-lg md:max-w-full mx-auto md:h-full md:px-4">
        
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col lg:flex-row items-center lg:justify-start lg:px-4 lg:w-full lg:rounded-xl gap-1 lg:gap-4 transition-all cursor-pointer flex-1 md:flex-none py-1 md:py-3 shrink-0 ${
            activeTab === 'home' 
              ? 'text-[#9f2089] lg:bg-pink-50' 
              : 'text-slate-500 hover:text-slate-900 lg:hover:bg-slate-50'
          }`}
          id="bottom-nav-home"
        >
          <Home className={`w-5 h-5 md:w-6 md:h-6 shrink-0 stroke-[2] ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] lg:text-[13px] font-bold tracking-tight">
            Home
          </span>
        </button>

        {/* Explore / Categories */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col lg:flex-row items-center lg:justify-start lg:px-4 lg:w-full lg:rounded-xl gap-1 lg:gap-4 transition-all cursor-pointer flex-1 md:flex-none py-1 md:py-3 shrink-0 ${
            activeTab === 'explore' 
              ? 'text-[#9f2089] lg:bg-pink-50' 
              : 'text-slate-500 hover:text-slate-900 lg:hover:bg-slate-50'
          }`}
          id="bottom-nav-explore"
        >
          <Compass className={`w-5 h-5 md:w-6 md:h-6 shrink-0 stroke-[2] ${activeTab === 'explore' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] lg:text-[13px] font-bold tracking-tight">
            Explore
          </span>
        </button>

        {/* Center SELL (+) Button */}
        <button
          onClick={() => setActiveModal('upload')}
          className="flex flex-col lg:flex-row items-center lg:justify-start lg:px-4 lg:w-full lg:rounded-xl gap-1 lg:gap-4 -mt-6 sm:-mt-7 md:mt-2 lg:mt-2 mb-2 lg:mb-2 group cursor-pointer flex-1 md:flex-none shrink-0"
          id="bottom-nav-sell"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-10 md:h-10 lg:w-10 lg:h-10 bg-gradient-to-tr from-[#9f2089] to-[#c2185b] hover:from-[#80146f] hover:to-[#a2134a] rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-pink-600/30 group-hover:scale-105 group-active:scale-95 transition-transform text-white shrink-0">
            <Plus className="w-6 h-6 md:w-5 md:h-5 stroke-[3] shrink-0 text-white" />
          </div>
          <span className="text-[10px] lg:text-[13px] font-bold uppercase lg:capitalize tracking-tight text-[#9f2089] mt-0.5 lg:mt-0">
            Sell <span className="lg:hidden">/ Rent</span>
          </span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex flex-col lg:flex-row items-center lg:justify-start lg:px-4 lg:w-full lg:rounded-xl gap-1 lg:gap-4 transition-all relative cursor-pointer flex-1 md:flex-none py-1 md:py-3 shrink-0 ${
            activeTab === 'wishlist' 
              ? 'text-[#9f2089] lg:bg-pink-50' 
              : 'text-slate-500 hover:text-slate-900 lg:hover:bg-slate-50'
          }`}
          id="bottom-nav-wishlist"
        >
          <div className="relative flex items-center justify-center">
            <Heart className={`w-5 h-5 md:w-6 md:h-6 shrink-0 stroke-[2] ${activeTab === 'wishlist' ? 'stroke-[2.5] fill-[#9f2089] text-[#9f2089]' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-[#9f2089] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] lg:text-[13px] font-bold tracking-tight">
            Wishlist
          </span>
        </button>

        {/* Profile / Admin */}
        <button
          onClick={() => setActiveTab(user.role === 'admin' ? 'admin' : 'profile')}
          className={`flex flex-col lg:flex-row items-center lg:justify-start lg:px-4 lg:w-full lg:rounded-xl gap-1 lg:gap-4 transition-all cursor-pointer flex-1 md:flex-none py-1 md:py-3 shrink-0 ${
            activeTab === 'profile' || activeTab === 'admin'
              ? 'text-[#9f2089] lg:bg-pink-50' 
              : 'text-slate-500 hover:text-slate-900 lg:hover:bg-slate-50'
          }`}
          id="bottom-nav-profile"
        >
          {user.role === 'admin' ? (
            <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-[#9f2089] shrink-0 stroke-[2]" />
          ) : (
            <User className={`w-5 h-5 md:w-6 md:h-6 shrink-0 stroke-[2] ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
          )}
          <span className="text-[10px] lg:text-[13px] font-bold tracking-tight">
            {user.role === 'admin' ? 'Admin' : 'Profile'}
          </span>
        </button>

        {/* Desktop Sidebar Install App Button */}
        {!isInstalled && (
          <div className="hidden md:block w-full mt-auto pt-4 border-t border-slate-200/60">
            <button
              onClick={() => setActiveModal('install')}
              className="flex flex-col lg:flex-row items-center lg:justify-start lg:px-4 lg:w-full lg:rounded-xl gap-1 lg:gap-3 py-2.5 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-200 text-[#9f2089] transition-all cursor-pointer shadow-xs active:scale-95"
              id="sidebar-install-app-btn"
              title="Install BGK WEAR on Windows / Mac / Phone"
            >
              {isIOS ? (
                <Apple className="w-5 h-5 text-[#9f2089] shrink-0" />
              ) : isWindows ? (
                <Monitor className="w-5 h-5 text-[#9f2089] shrink-0" />
              ) : (
                <Download className="w-5 h-5 text-[#9f2089] shrink-0" />
              )}
              <div className="hidden lg:block text-left">
                <span className="text-xs font-black block leading-tight">
                  {isWindows ? 'Windows App' : isIOS ? 'iPhone App' : 'Install App'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block">
                  Cross-Platform
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
