import React, { useState, useEffect } from 'react';
import { X, Heart, Share2, Eye, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const StoryViewerModal: React.FC = () => {
  const { activeStory, setActiveStory, setActiveModal, products, setSelectedProduct } = useApp();
  const [progress, setProgress] = useState(0);

  useDynamicSEO(
    activeStory
      ? {
          title: `${activeStory.title} | Designer Fashion Stories | BGK WEAR`,
          description: `Watch live video and photo showcase of ${activeStory.title} worn by verified fashion enthusiasts on BGK WEAR.`,
          image: activeStory.coverImage || '/icon-512.png',
          type: 'article'
        }
      : null
  );

  useEffect(() => {
    if (!activeStory) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1.5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [activeStory]);

  if (!activeStory) return null;

  const linkedProduct = products.find((p) => activeStory.featuredProductIds.includes(p.id)) || products[0];

  const handleClose = () => {
    setActiveStory(null);
    setActiveModal(null);
  };

  const handleViewProduct = () => {
    if (linkedProduct) {
      setSelectedProduct(linkedProduct);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 sm:p-4">
      {/* Story container (9:16 mobile aspect ratio feel) */}
      <div className="relative w-full max-w-md h-full sm:h-[88vh] bg-white sm:rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200 shadow-2xl">
        
        {/* Background photo */}
        <img
          src={activeStory.coverImage}
          alt={activeStory.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70" />

        {/* Top Progress Bars & Header */}
        <div className="relative z-10 p-5 pt-4">
          {/* Progress bar */}
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-3.5">
            <div 
              className="bg-[#9f2089] h-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeStory.avatar}
                alt={activeStory.author}
                className="w-10 h-10 rounded-full border-2 border-[#9f2089] object-cover shadow-xs"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-none flex items-center gap-1.5 drop-shadow-sm">
                  {activeStory.title}
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9f2089]" />
                </h4>
                <p className="text-xs text-slate-700 mt-0.5 drop-shadow-xs">{activeStory.author} • {activeStory.tag}</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-black/60 text-slate-700 flex items-center justify-center hover:text-slate-900 hover:bg-black/90 transition-colors cursor-pointer"
              id="close-story-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Outfit Card overlay */}
        <div className="relative z-10 p-5 pb-6 space-y-3">
          {linkedProduct && (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 border border-slate-200 shadow-2xl text-slate-900">
              <div className="flex items-center gap-3">
                <img
                  src={linkedProduct.images[0]}
                  alt={linkedProduct.title}
                  className="w-16 h-20 rounded-2xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#9f2089] tracking-wider">
                    {linkedProduct.brand}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 truncate">
                    {linkedProduct.title}
                  </h5>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-black text-slate-900">
                      ₹{linkedProduct.rentPricePerDay.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/day</span>
                    </span>
                    {linkedProduct.salePrice && (
                      <span className="text-[11px] text-slate-500">
                        Buy ₹{linkedProduct.salePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Deposit: ₹{linkedProduct.securityDeposit.toLocaleString('en-IN')} (Refundable)
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleViewProduct}
                  className="flex-1 py-3 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  id="rent-story-outfit-btn"
                >
                  <span>Rent or Buy this Look</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
