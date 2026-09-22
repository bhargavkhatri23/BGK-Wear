import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveTab, updateFilter } = useApp();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-28 md:pb-14 mt-16 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs">
                <img src="/icon.svg" alt="BGK Wear Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                BGK <span className="text-[#9f2089]">WEAR</span>
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
              Wear Your Confidence. Premier peer-to-peer marketplace for renting, buying, and listing authentic designer wedding couture, luxury streetwear, and fine festive wear.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#9f2089] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#9f2089]" />
              <span>Direct Peer-to-Peer • 0% Commission</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9f2089]" />
              <span>Top Collections</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li>
                <button
                  onClick={() => { updateFilter({ category: 'Bridal Lehenga' }); setActiveTab('explore'); }}
                  className="hover:text-[#9f2089] transition-colors cursor-pointer"
                >
                  Bridal Lehengas
                </button>
              </li>
              <li>
                <button
                  onClick={() => { updateFilter({ category: 'Groom Sherwani' }); setActiveTab('explore'); }}
                  className="hover:text-[#9f2089] transition-colors cursor-pointer"
                >
                  Groom Sherwanis & Safas
                </button>
              </li>
              <li>
                <button
                  onClick={() => { updateFilter({ category: 'Saree' }); setActiveTab('explore'); }}
                  className="hover:text-[#9f2089] transition-colors cursor-pointer"
                >
                  Kanjeevaram & Banarasi Sarees
                </button>
              </li>
              <li>
                <button
                  onClick={() => { updateFilter({ category: 'Gown' }); setActiveTab('explore'); }}
                  className="hover:text-[#9f2089] transition-colors cursor-pointer"
                >
                  Cocktail & Reception Gowns
                </button>
              </li>
              <li>
                <button
                  onClick={() => { updateFilter({ category: 'Jewelry' }); setActiveTab('explore'); }}
                  className="hover:text-[#9f2089] transition-colors cursor-pointer"
                >
                  Polki & Kundan Bridal Jewelry
                </button>
              </li>
            </ul>
          </div>

          {/* Cities & Local hubs */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Top City Marketplaces
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li>Mumbai & Navi Mumbai</li>
              <li>Delhi NCR & Gurgaon</li>
              <li>Bangalore & Hyderabad</li>
              <li>Jaipur & Udaipur</li>
              <li>Ahmedabad & Surat</li>
              <li>Kolkata & Chennai</li>
            </ul>
          </div>

          {/* Peer-to-Peer Highlights */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Marketplace Trust
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li>100% Refundable Security Deposit</li>
              <li>Direct In-App Instant Chat</li>
              <li>Sanitised & Dry-Cleaned Assurance</li>
              <li>Direct WhatsApp & Call Connect</li>
              <li>Verified Closet Curators</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} BGK WEAR. All rights reserved. Wear Your Confidence.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Rental</span>
            <span>•</span>
            <span className="hover:text-slate-900 cursor-pointer">Seller Guidelines</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
