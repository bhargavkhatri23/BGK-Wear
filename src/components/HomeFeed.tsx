import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';

export const HomeFeed: React.FC = () => {
  const { 
    user,
    products, 
    updateFilter, 
    setActiveTab, 
    setActiveModal 
  } = useApp();

  const [activeFilterType, setActiveFilterType] = useState<'all' | 'rent' | 'buy'>('all');

  const displayedProducts = products.filter((p) => {
    if (activeFilterType === 'rent') return p.listingType === 'rent' || p.listingType === 'both';
    if (activeFilterType === 'buy') return p.listingType === 'buy' || p.listingType === 'both';
    return true;
  });

  const hasListedOutfit = (products || []).some((p) => p.userId === user?.id);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 space-y-8 text-slate-900">
      
      {/* Dynamic Products Grid Section */}
      <section className="space-y-5" id="home-dynamic-products-section">
        {products.length === 0 ? (
          /* 100% Blank Clean State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs text-center max-w-2xl mx-auto space-y-4 my-6">
            <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto text-[#9f2089]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Marketplace is Clean & Ready!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                Click below to list your outfit and start earning with 0% platform commission.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveModal('upload')}
                className="px-8 py-3.5 bg-[#9f2089] hover:bg-[#80146f] text-white font-bold rounded-full text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                id="empty-home-publish-btn"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Publish First Outfit</span>
              </button>
            </div>
          </div>
        ) : (
          /* Real User-Uploaded Products Grid */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[#9f2089] text-xs font-bold uppercase tracking-wider">
                  Live Collection
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                  All Outfits ({displayedProducts.length})
                </h2>
              </div>

              {/* Quick Type Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFilterType('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeFilterType === 'all'
                      ? 'bg-[#9f2089] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setActiveFilterType('rent')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeFilterType === 'rent'
                      ? 'bg-[#9f2089] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  For Rent
                </button>
                <button
                  onClick={() => setActiveFilterType('buy')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeFilterType === 'buy'
                      ? 'bg-[#9f2089] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  For Buy
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#9f2089] border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Advanced Filters</span>
                </button>
              </div>
            </div>

            {/* Dynamic Product Cards Grid with Framer Motion Staggered Entrance */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
            >
              {displayedProducts.map((prod, index) => (
                <motion.div
                  key={`${prod.id}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                  }}
                >
                  <ProductCard product={prod} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </section>



      {/* Featured Hero Banner - Moved to Bottom */}
      <section className="opacity-90 scale-[0.98] transition-all hover:scale-100 hover:opacity-100">
        <HeroBanner />
      </section>

      {/* Earn with BGK WEAR Promo Banner */}
      {!hasListedOutfit && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-50/80 via-purple-50/60 to-slate-50 border border-pink-200 shadow-xs p-6 sm:p-10">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="bg-pink-100 border border-pink-200 text-[#9f2089] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block shadow-xs">
              For Closet Curators & Designers
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Turn Your Designer Wardrobe into Steady Income
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Don't let your designer bridal lehengas, sherwanis, or streetwear sit idle. Rent or sell directly to verified fashion lovers across India with 0% platform commission.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveModal('upload')}
                className="px-8 py-3.5 bg-[#9f2089] hover:bg-[#80146f] text-white font-bold rounded-full text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                id="home-cta-list-outfit"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>List Your Outfit (Free)</span>
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
