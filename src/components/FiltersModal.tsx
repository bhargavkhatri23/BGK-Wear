import React, { useMemo } from 'react';
import { X, RotateCcw, SlidersHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';
import { CATEGORIES_DATA, BRANDS_LIST, CITIES_LIST, COLORS_LIST, FABRICS_LIST } from '../data/mockData';
import { getCategoryCounts } from '../utils/productUtils';

const SIZES_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom Fit'];
const CONDITIONS_OPTIONS = ['Brand New', 'Like New (Worn Once)', 'Gently Used', 'Vintage Mint'];

export const FiltersModal: React.FC = () => {
  const { activeModal, setActiveModal, filterState, updateFilter, resetFilters, filteredProducts, products } = useApp();

  useDynamicSEO(
    activeModal === 'filters'
      ? {
          title: 'Filter Designer Outfits | Price, Size, Brand & City | BGK WEAR',
          description: 'Filter luxury wedding lehengas, sherwanis, and sarees by rent price, sale price, designer brand, size, and city location on BGK WEAR.',
          type: 'website'
        }
      : null
  );

  const counts = useMemo(() => getCategoryCounts(products), [products]);

  if (activeModal !== 'filters') return null;

  const handleToggleSize = (s: string) => {
    const exists = filterState.sizes.includes(s);
    if (exists) {
      updateFilter({ sizes: filterState.sizes.filter((x) => x !== s) });
    } else {
      updateFilter({ sizes: [...filterState.sizes, s] });
    }
  };

  const handleToggleColor = (colorName: string) => {
    const exists = filterState.colors?.includes(colorName);
    if (exists) {
      updateFilter({ colors: filterState.colors.filter((c) => c !== colorName) });
    } else {
      updateFilter({ colors: [...(filterState.colors || []), colorName] });
    }
  };

  const handleToggleFabric = (fabricName: string) => {
    const exists = filterState.fabrics?.includes(fabricName);
    if (exists) {
      updateFilter({ fabrics: filterState.fabrics.filter((f) => f !== fabricName) });
    } else {
      updateFilter({ fabrics: [...(filterState.fabrics || []), fabricName] });
    }
  };

  const handleToggleBrand = (b: string) => {
    const exists = filterState.brands.includes(b);
    if (exists) {
      updateFilter({ brands: filterState.brands.filter((x) => x !== b) });
    } else {
      updateFilter({ brands: [...filterState.brands, b] });
    }
  };

  const handleToggleCondition = (c: string) => {
    const exists = filterState.conditions.includes(c);
    if (exists) {
      updateFilter({ conditions: filterState.conditions.filter((x) => x !== c) });
    } else {
      updateFilter({ conditions: [...filterState.conditions, c] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#9f2089]/15 border border-[#9f2089]/30 flex items-center justify-center text-[#9f2089]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Filter & Refine Outfits</h3>
              <p className="text-[11px] text-slate-500 font-medium">{filteredProducts.length} outfits match your criteria</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-slate-600 font-bold hover:text-[#9f2089] flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 bg-[#202020] shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#9f2089]" />
              <span>Reset All</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar bg-white">
          
          {/* Listing Type: All / Rent / Buy */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2.5">
              Listing Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All (Rent & Buy)' },
                { id: 'rent', label: 'Rent Only' },
                { id: 'buy', label: 'Buy Only' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateFilter({ listingType: item.id as any })}
                  className={`py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filterState.listingType === item.id
                      ? 'border border-[#9f2089] bg-[#9f2089] text-white shadow-md'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instant Availability Toggle */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#9f2089]" />
                <span>Instant Booking Available</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Show only outfits ready for immediate rental request / handover</p>
            </div>
            <button
              onClick={() => updateFilter({ availabilityOnly: !filterState.availabilityOnly })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                filterState.availabilityOnly ? 'bg-[#9f2089]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  filterState.availabilityOnly ? 'left-6 bg-black' : 'left-1 bg-white'
                }`}
              />
            </button>
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2">
              City / Region
            </label>
            <select
              value={filterState.city}
              onChange={(e) => updateFilter({ city: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:border-[#9f2089] focus:outline-none cursor-pointer"
            >
              <option value="All Cities" className="bg-white text-slate-900">All India (All Cities)</option>
              {CITIES_LIST.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter({ category: 'All' })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterState.category === 'All'
                    ? 'bg-[#9f2089] text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES_DATA.map((cat) => {
                const count = counts[cat.name.toLowerCase().trim()] || 0;
                return (
                  <button
                    key={cat.name}
                    onClick={() => updateFilter({ category: cat.name })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      filterState.category === cat.name
                        ? 'bg-[#9f2089] text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                    }`}
                  >
                    {cat.name} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rent Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider">
                Max Daily Rent Price:
              </label>
              <span className="text-sm font-black text-[#9f2089]">₹{filterState.maxRentPrice.toLocaleString('en-IN')}/day</span>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={filterState.maxRentPrice}
              onChange={(e) => updateFilter({ maxRentPrice: Number(e.target.value) })}
              className="w-full accent-[#9f2089]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>₹500</span>
              <span>₹12,500</span>
              <span>₹25,000+</span>
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2.5">
              Colors & Royal Palettes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLORS_LIST.map((col) => {
                const selected = filterState.colors?.includes(col.name);
                return (
                  <button
                    key={col.name}
                    onClick={() => handleToggleColor(col.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'border border-[#9f2089] bg-[#9f2089]/20 text-[#9f2089]'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" 
                      style={{ backgroundColor: col.hex }} 
                    />
                    <span className="truncate">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fabrics */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2.5">
              Fabric & Weave
            </label>
            <div className="flex flex-wrap gap-2">
              {FABRICS_LIST.map((fabric) => {
                const selected = filterState.fabrics?.includes(fabric);
                return (
                  <button
                    key={fabric}
                    onClick={() => handleToggleFabric(fabric)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#9f2089] text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                    }`}
                  >
                    {fabric}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2.5">
              Sizes
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES_OPTIONS.map((sz) => {
                const selected = filterState.sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => handleToggleSize(sz)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#9f2089] text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Designer Brands */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2.5">
              Designer & Brand Houses
            </label>
            <div className="flex flex-wrap gap-2">
              {BRANDS_LIST.map((b) => {
                const selected = filterState.brands.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => handleToggleBrand(b)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#9f2089] text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2.5">
              Garment Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS_OPTIONS.map((c) => {
                const selected = filterState.conditions.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => handleToggleCondition(c)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#9f2089] text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#9f2089]/50 hover:text-slate-900'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block mb-2">
              Sort By
            </label>
            <select
              value={filterState.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as any })}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:border-[#9f2089] focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-white text-slate-900">Featured & Curated</option>
              <option value="newest" className="bg-white text-slate-900">Newly Added Outfits</option>
              <option value="price_low" className="bg-white text-slate-900">Rent Price: Low to High</option>
              <option value="price_high" className="bg-white text-slate-900">Rent Price: High to Low</option>
              <option value="rating" className="bg-white text-slate-900">Top Customer Rated</option>
              <option value="discount" className="bg-white text-slate-900">Highest Retail Discount</option>
              <option value="views" className="bg-white text-slate-900">Most Viewed</option>
              <option value="saved" className="bg-white text-slate-900">Most Wishlisted</option>
            </select>
          </div>

        </div>

        {/* Footer Apply Button */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={() => setActiveModal(null)}
            className="w-full py-3.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-[#9f2089]/20 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>Show {filteredProducts.length} Matching Outfits</span>
          </button>
        </div>

      </div>
    </div>
  );
};
