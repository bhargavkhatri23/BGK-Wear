import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw, 
  MapPin,
  ArrowUpDown,
  Tag,
  X,
  History,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { CATEGORIES_DATA, CITIES_LIST } from '../data/mockData';
import { 
  getRecentSearches, 
  addRecentSearch, 
  removeRecentSearch, 
  clearRecentSearches 
} from '../utils/recentSearchUtils';

export const ExploreView: React.FC = () => {
  const { 
    filteredProducts, 
    filterState, 
    updateFilter, 
    resetFilters, 
    setActiveModal,
    selectedCity,
    setSelectedCity 
  } = useApp();

  const [searchInput, setSearchInput] = useState(filterState.searchQuery || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    }
    updateFilter({ searchQuery: query });
    setIsSearchFocused(false);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchInput(query);
    updateFilter({ searchQuery: query });
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());
    setIsSearchFocused(false);
  };

  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(query);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilter({ searchQuery: '' });
  };

  const activeFiltersCount = [
    filterState.searchQuery ? 1 : 0,
    filterState.category !== 'All' ? 1 : 0,
    filterState.listingType !== 'all' ? 1 : 0,
    filterState.city !== 'All Cities' || selectedCity !== 'All Cities' ? 1 : 0,
    filterState.sizes.length,
    filterState.colors.length,
    filterState.fabrics.length,
    filterState.brands.length,
    filterState.conditions.length,
    filterState.maxRentPrice < 25000 ? 1 : 0,
    filterState.availabilityOnly ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6 text-slate-900">
      
      {/* Top Header Row with Title & Quick Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[#9f2089] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#9f2089]" />
            Exclusive Wardrobe Marketplace
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore Wedding & Designer Outfits
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> creations available directly from verified curators across India
          </p>
        </div>

        {/* Global Keyword Search in Explore */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              updateFilter({ searchQuery: e.target.value });
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search by outfit, designer, fabric, city..."
            className="w-full bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 pl-10 pr-10 py-3 rounded-full border border-slate-200 focus:outline-none focus:border-[#9f2089] shadow-xs transition-all font-medium"
            id="explore-search-input"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9f2089]" />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isSearchFocused && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-pink-100 rounded-2xl shadow-xl mt-2 py-2 z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="px-4 py-1.5 flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3 h-3 text-[#9f2089]" />
                  Recent Searches (Latest 4)
                </span>
                <button
                  type="button"
                  onMouseDown={handleClearAllRecent}
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
                    onMouseDown={() => handleRecentSearchClick(query)}
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
        </form>
      </div>

      {/* Filter & Sort Controls Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Listing Mode Chips (All / Rent / Buy) */}
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
          {(['all', 'rent', 'buy'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => updateFilter({ listingType: mode })}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterState.listingType === mode
                  ? 'bg-[#9f2089] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === 'all' ? 'All' : mode === 'rent' ? 'Rent' : 'Buy'}
            </button>
          ))}
        </div>

        {/* Action Controls Container - Equal Width Columns */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto pb-1 sm:pb-0">
          
          {/* Quick City Dropdown */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] sm:text-xs font-bold text-slate-800 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#9f2089] shrink-0 hidden sm:block" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                updateFilter({ city: e.target.value });
              }}
              className="bg-transparent text-[10px] sm:text-xs text-slate-800 font-bold focus:outline-none cursor-pointer w-full text-center sm:text-left truncate appearance-none sm:appearance-auto"
            >
              <option value="All Cities" className="bg-white text-slate-900">All India</option>
              {CITIES_LIST.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] sm:text-xs font-bold text-slate-800 min-w-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#9f2089] shrink-0 hidden sm:block" />
            <select
              value={filterState.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as any })}
              className="bg-transparent text-[10px] sm:text-xs text-slate-800 font-bold focus:outline-none cursor-pointer w-full text-center sm:text-left truncate appearance-none sm:appearance-auto"
            >
              <option value="featured" className="bg-white text-slate-900">Featured</option>
              <option value="newest" className="bg-white text-slate-900">Newly Added</option>
              <option value="price_low" className="bg-white text-slate-900">Price: Low to High</option>
              <option value="price_high" className="bg-white text-slate-900">Price: High to Low</option>
              <option value="rating" className="bg-white text-slate-900">Top Rated</option>
              <option value="discount" className="bg-white text-slate-900">Highest % Discount</option>
            </select>
          </div>

          {/* Detailed Filters Modal Trigger */}
          <button
            onClick={() => setActiveModal('filters')}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 sm:py-1.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 min-w-0"
            id="explore-filters-btn"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2] shrink-0" />
            <span className="truncate">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#9f2089] text-[9px] flex items-center justify-center font-black ml-0.5 shrink-0">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Horizontal Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => updateFilter({ category: 'All' })}
          className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
            filterState.category === 'All'
              ? 'bg-[#9f2089] text-white shadow-xs font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-[#9f2089]'
          }`}
        >
          All Categories
        </button>

        {CATEGORIES_DATA.map((c) => (
          <button
            key={c.name}
            onClick={() => updateFilter({ category: c.name })}
            className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              filterState.category === c.name
                ? 'bg-[#9f2089] text-white shadow-xs font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-[#9f2089] hover:text-[#9f2089]'
            }`}
          >
            <span>{c.name}</span>
            <span className="text-[10px] opacity-60">({c.count})</span>
          </button>
        ))}
      </div>

      {/* Active Filter Badges with Quick Dismiss */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#9f2089]" />
            Active ({activeFiltersCount}):
          </span>

          {filterState.searchQuery && (
            <span className="px-3 py-1 rounded-full bg-pink-50 text-[#9f2089] font-bold border border-pink-200 flex items-center gap-1.5">
              <span>"{filterState.searchQuery}"</span>
              <button onClick={handleClearSearch} className="text-[#9f2089] hover:text-slate-900 cursor-pointer">✕</button>
            </span>
          )}

          {filterState.category !== 'All' && (
            <span className="px-3 py-1 rounded-full bg-pink-50 text-[#9f2089] font-bold border border-pink-200 flex items-center gap-1.5">
              <span>{filterState.category}</span>
              <button onClick={() => updateFilter({ category: 'All' })} className="text-[#9f2089] hover:text-slate-900 cursor-pointer">✕</button>
            </span>
          )}

          {(filterState.city !== 'All Cities' || selectedCity !== 'All Cities') && (
            <span className="px-3 py-1 rounded-full bg-pink-50 text-[#9f2089] font-bold border border-pink-200 flex items-center gap-1.5">
              <span>City: {selectedCity !== 'All Cities' ? selectedCity : filterState.city}</span>
              <button onClick={() => { setSelectedCity('All Cities'); updateFilter({ city: 'All Cities' }); }} className="text-[#9f2089] hover:text-slate-900 cursor-pointer">✕</button>
            </span>
          )}

          {filterState.sizes.map((s) => (
            <span key={s} className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center gap-1">
              <span>Size {s}</span>
              <button onClick={() => updateFilter({ sizes: filterState.sizes.filter((x) => x !== s) })} className="text-slate-400 hover:text-slate-800 cursor-pointer">✕</button>
            </span>
          ))}

          {filterState.brands.map((b) => (
            <span key={b} className="px-3 py-1 rounded-full bg-pink-50 text-[#9f2089] font-bold border border-pink-200 flex items-center gap-1">
              <span>{b}</span>
              <button onClick={() => updateFilter({ brands: filterState.brands.filter((x) => x !== b) })} className="text-[#9f2089] hover:text-slate-900 cursor-pointer">✕</button>
            </span>
          ))}

          <button
            onClick={() => {
              setSearchInput('');
              setSelectedCity('All Cities');
              resetFilters();
            }}
            className="text-[#9f2089] font-bold hover:underline ml-2 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>
      )}

      {/* Outfits Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-5 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto text-[#9f2089]">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">No Matching Outfits Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We couldn't find any creations matching your active search and filter criteria. Try broadening your keywords or resetting filters.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchInput('');
                setSelectedCity('All Cities');
                resetFilters();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#9f2089] hover:bg-[#80146f] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
            <button
              onClick={() => {
                setSearchInput('');
                updateFilter({ category: 'Bridal Lehenga', searchQuery: '' });
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-200"
            >
              Browse Bridal Lehengas
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((prod, index) => (
            <ProductCard key={`${prod.id}-${index}`} product={prod} />
          ))}
        </div>
      )}

    </div>
  );
};
