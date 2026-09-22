import React, { useState } from 'react';
import { Heart, WifiOff, CloudCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';

export const WishlistView: React.FC = () => {
  const { wishlist, products, cachedWishlistProducts, isOffline, syncOfflineWishlist, setActiveTab } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  // Use live wishlisted products, falling back to cached wishlist products if offline
  const liveWishlisted = products.filter((p) => wishlist.includes(p.id));
  const displayProducts = liveWishlisted.length > 0 ? liveWishlisted : cachedWishlistProducts;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineWishlist();
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
      
      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-amber-900 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                Offline Mode Active
                <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  PWA Ready
                </span>
              </p>
              <p className="text-[11px] sm:text-xs text-amber-800/90 truncate">
                Browsing your cached wardrobe. Photos, sizing, and pricing are fully accessible offline.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-white/80 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0">
            {displayProducts.length} Saved Looks
          </span>
        </div>
      )}

      {/* Clean Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 fill-[#6d052a] text-[#6d052a]" />
          <h1 className="text-xl sm:text-2xl font-serif text-slate-900 tracking-tight">
            My Saved Outfits
          </h1>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full ml-2">
            {displayProducts.length}
          </span>
        </div>

        {/* Offline Cache Status & Sync Button */}
        {displayProducts.length > 0 && !isOffline && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Available Offline
            </span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-slate-600 hover:text-[#6d052a] bg-slate-100 hover:bg-pink-50 border border-slate-200 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Sync and precache all wishlist photos to Service Worker cache"
            >
              <RefreshCw className={`w-3 h-3 text-[#6d052a] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Caching...' : 'Sync Cache'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Grid / Empty State */}
      {displayProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-5 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto text-[#6d052a]">
            <Heart className="w-8 h-8 fill-[#6d052a]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Your Saved Wardrobe is Empty</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Explore heritage bridal lehengas, royal groom sherwanis, and fine jewelry to bookmark your favorite looks.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('explore')}
              className="w-full py-3 bg-[#6d052a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#6d052a]/20 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              Explore Designer Wear
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="w-full py-3 bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer border border-slate-200"
            >
              Back to Home Feed
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

    </div>
  );
};
