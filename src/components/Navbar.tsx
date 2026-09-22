import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles,
  Crown,
  X,
  History,
  Trash2,
  Download,
  Apple,
  Monitor,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  getRecentSearches, 
  addRecentSearch, 
  removeRecentSearch, 
  clearRecentSearches 
} from '../utils/recentSearchUtils';

export const Navbar: React.FC = () => {
  const { 
    user, 
    notifications, 
    activeTab, 
    setActiveTab, 
    filterState, 
    updateFilter, 
    setActiveModal
  } = useApp();

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const { 
    isInstalled, 
    isInstallable, 
    isIOS, 
    isWindows, 
    install 
  } = usePWAInstall();

  const handleInstallClick = () => {
    setActiveModal('appstore');
  };

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const unreadNotifs = (notifications || []).filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = filterState.searchQuery.trim();
    if (query) {
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    }
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
    setIsFocused(false);
  };

  const handleSelectRecent = (query: string) => {
    updateFilter({ searchQuery: query });
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());
    setIsFocused(false);
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(query);
    setRecentSearches(updated);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white backdrop-blur-md border-b border-pink-100/80 text-slate-900 shadow-sm">
      {/* Top Announcement Bar with Single Line Oscillating Pink LED Light */}
      <div className="led-border-wrap shadow-md">
        <div className="led-line-beam-vertical" />
        <div className="led-line-beam-horizontal" />
        <div className="led-border-content h-6 sm:h-7 bg-gradient-to-r from-[#9f2089] via-[#c72591] to-[#e12a9a] px-3 text-[9px] sm:text-[10px] text-white flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap select-none shrink-0">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-200 animate-pulse shrink-0" />
          <span className="font-extrabold tracking-wider truncate uppercase">
            India's #1 Luxury Designer Marketplace • Peer Rentals • 0% Commission
          </span>
          <button 
            type="button"
            className="hidden md:inline-flex items-center text-pink-200 font-black underline cursor-pointer ml-1.5 hover:text-white transition-colors shrink-0" 
            onClick={() => setActiveModal('upload')}
            id="banner-list-outfit-link"
          >
            EARN ₹50,000/mo
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 gap-3 sm:gap-4 md:gap-6 w-full">
          
          {/* Brand Name with Crown Icon */}
          <div className="flex items-center shrink-0">
            <button 
              onClick={() => { setActiveTab('home'); }}
              className="flex items-center gap-1.5 text-left group focus:outline-none cursor-pointer shrink-0"
              id="brand-logo-btn"
            >
              <div className="shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-[16px] sm:text-lg md:text-xl lg:text-2xl font-black tracking-tighter text-slate-900 uppercase block leading-none flex items-center gap-1">
                    BGK <span className="text-[#9f2089]">WEAR</span>
                    <Crown className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-500 fill-amber-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] ml-0.5" />
                  </span>
                </div>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase hidden sm:block mt-1">
                  Luxury Signature
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar - Wider & Sleeker */}
          <div className="flex-1 min-w-0 mx-1 sm:mx-2 md:mx-4 lg:mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <input
                type="text"
                placeholder="Search Bridal Lehengas, Designer Sherwanis..."
                value={filterState.searchQuery}
                onFocus={() => {
                  setRecentSearches(getRecentSearches());
                  setIsFocused(true);
                }}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onChange={(e) => {
                  updateFilter({ searchQuery: e.target.value });
                  if (activeTab !== 'explore' && e.target.value.length > 2) {
                    setActiveTab('explore');
                  }
                }}
                className="w-full bg-slate-100/50 hover:bg-white focus:bg-white border-2 border-slate-200/50 hover:border-pink-200 focus:border-[#9f2089] rounded-xl pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-2.5 md:py-3 text-[11px] sm:text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-sm transition-all duration-300"
                id="search-input-header"
              />
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#9f2089] absolute left-3.5 sm:left-4.5 top-1/2 -translate-y-1/2 shrink-0 stroke-[3] group-focus-within:scale-110 transition-transform" />
              {filterState.searchQuery && (
                <button
                  type="button"
                  onClick={() => updateFilter({ searchQuery: '' })}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  id="search-clear-btn"
                >
                  <X className="w-4 h-4 shrink-0" />
                </button>
              )}
            </form>

            {/* Recent Searches Dropdown (Max 3-4 items) */}
            {isFocused && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-pink-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="px-4 py-1.5 flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3 text-[#9f2089]" />
                    Recent Searches (Latest 4)
                  </span>
                  <button
                    type="button"
                    onMouseDown={handleClearAll}
                    className="text-[10px] font-bold text-[#9f2089] hover:text-[#80146f] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {recentSearches.slice(0, 4).map((query) => (
                    <div
                      key={query}
                      onMouseDown={() => handleSelectRecent(query)}
                      className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-pink-50/60 hover:text-[#9f2089] flex items-center justify-between gap-2 font-medium cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#9f2089] shrink-0" />
                        <span className="truncate">{query}</span>
                      </div>
                      <button
                        type="button"
                        onMouseDown={(e) => handleRemoveRecent(e, query)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors shrink-0"
                        title="Remove search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons Group - Balanced Spacing */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3.5 shrink-0">
            
            {/* Download / Install App Button */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-200/90 text-[#9f2089] text-[11px] sm:text-xs font-black shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
                title="Install BGK WEAR on iPhone, Windows PC, or Android"
                id="navbar-install-app-btn"
              >
                {isIOS ? (
                  <Apple className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9f2089] shrink-0" />
                ) : isWindows ? (
                  <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9f2089] shrink-0" />
                ) : (
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9f2089] shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {isIOS ? 'iPhone App' : isWindows ? 'Install for PC' : 'Install App'}
                </span>
                <span className="sm:hidden font-extrabold">App</span>
              </button>
            )}

            {/* Notifications Button */}
            <button
              onClick={() => setActiveModal('notifications')}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 hover:text-[#9f2089] hover:border-[#9f2089] hover:shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
              title="Notifications"
              id="notifications-nav-btn"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0 stroke-[2.2] stroke-current" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#9f2089] rounded-full border-2 border-white shadow-sm"></span>
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 p-0.5 transition-all cursor-pointer active:scale-95 ${
                activeTab === 'profile'
                  ? 'ring-2 ring-[#9f2089] ring-offset-2 ring-offset-white'
                  : 'hover:ring-2 hover:ring-pink-100 hover:ring-offset-1'
              }`}
              title={`Profile (${user.name})`}
              id="profile-nav-btn"
            >
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden shadow-md">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
