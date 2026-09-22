import React from 'react';
import { 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroBanner: React.FC = () => {
  const { updateFilter, setActiveTab, setActiveModal } = useApp();

  return (
    <div className="relative w-full rounded-3xl overflow-hidden my-4 border border-pink-100 shadow-md bg-gradient-to-br from-pink-50/60 via-white to-slate-50 min-h-[340px] sm:min-h-[380px] flex items-center">
      {/* Background Decorative Pattern & Image */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 overflow-hidden pointer-events-none opacity-20 sm:opacity-35">
        <img
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80"
          alt="Luxury Wedding Couture"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 p-5 sm:p-8 lg:p-12 max-w-2xl">
        
        {/* Accent Badge */}
        <div className="inline-flex items-center gap-1.5 bg-pink-100 border border-pink-200 text-[#9f2089] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#9f2089]" />
          <span>India's Mega Fashion Marketplace</span>
        </div>

        {/* High-Contrast Crisp Headline with Fluid Scaling */}
        <h1 className="fluid-h1 font-black mb-3 leading-tight text-slate-900 tracking-tight">
          Wear Your Confidence with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9f2089] via-[#c2185b] to-[#7c3aed]">
            Designer Wear @ 90% Less
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 fluid-body font-normal max-w-lg mb-5 sm:mb-6 leading-relaxed">
          Rent and buy verified designer bridal lehengas, sherwanis, sarees & premium streetwear directly from curators with 0% middleman fees.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              updateFilter({ category: 'Bridal Lehenga', listingType: 'rent' });
              setActiveTab('explore');
            }}
            className="px-6 sm:px-8 py-3.5 bg-[#9f2089] hover:bg-[#80146f] text-white font-bold rounded-full text-xs sm:text-sm shadow-md shadow-pink-900/15 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            id="hero-rent-bridal-btn"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Rent from ₹1,499/day</span>
          </button>

          <button
            onClick={() => {
              updateFilter({ category: 'Groom Sherwani' });
              setActiveTab('explore');
            }}
            className="px-6 sm:px-7 py-3.5 bg-white border border-slate-300 hover:border-[#9f2089] rounded-full text-xs sm:text-sm font-bold text-slate-800 hover:text-[#9f2089] shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            id="hero-rent-groom-btn"
          >
            <span>Groom Sherwanis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveModal('upload')}
            className="text-xs sm:text-sm font-bold text-[#9f2089] hover:underline underline-offset-4 cursor-pointer ml-1 sm:ml-2"
            id="hero-sell-outfit-btn"
          >
            + List & Earn ₹50k
          </button>
        </div>



      </div>
    </div>
  );
};
