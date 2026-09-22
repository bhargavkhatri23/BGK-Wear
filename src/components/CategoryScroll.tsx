import React from 'react';
import { CATEGORIES_DATA } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const CategoryScroll: React.FC = () => {
  const { filterState, updateFilter, setActiveTab } = useApp();

  const handleSelectCategory = (catName: string) => {
    if (filterState.category === catName) {
      updateFilter({ category: 'All' });
    } else {
      updateFilter({ category: catName });
      setActiveTab('explore');
    }
  };

  return (
    <section className="my-6 space-y-4">
      {/* Category Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span>Explore by Categories</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-[#9f2089] border border-pink-200 font-bold">
              Top Trending
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Browse verified designer wedding & streetwear outfits</p>
        </div>
        <button
          onClick={() => {
            updateFilter({ category: 'All' });
            setActiveTab('explore');
          }}
          className="text-xs font-bold text-[#9f2089] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Pills Row */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            updateFilter({ category: 'All' });
            setActiveTab('explore');
          }}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filterState.category === 'All'
              ? 'bg-[#9f2089] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-[#9f2089] hover:text-[#9f2089]'
          }`}
        >
          ⚡ All Outfits
        </button>

        {CATEGORIES_DATA.map((cat) => {
          const isSelected = filterState.category === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => handleSelectCategory(cat.name)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#9f2089] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-[#9f2089] hover:text-[#9f2089]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Category Cards Carousel */}
      <div className="flex gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2">
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = filterState.category === cat.name;

          return (
            <div
              key={cat.name}
              onClick={() => handleSelectCategory(cat.name)}
              className={`flex-shrink-0 w-36 sm:w-44 group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 shadow-xs bg-white ${
                isSelected 
                  ? 'border-[#9f2089] ring-2 ring-pink-300 scale-[1.02]' 
                  : 'border-slate-200 hover:border-[#9f2089]/50 hover:scale-[1.01]'
              }`}
              id={`cat-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* Category Image */}
              <div className="relative h-32 sm:h-38 w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#9f2089] border border-pink-200 shadow-xs">
                  {cat.count}+ Outfits
                </span>
              </div>

              {/* Title & info */}
              <div className="p-3 bg-white">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#9f2089] truncate">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-[#9f2089] font-semibold truncate mt-0.5">
                  Rent & Direct Buy
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
