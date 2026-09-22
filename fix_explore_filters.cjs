const fs = require('fs');
let content = fs.readFileSync('src/components/ExploreView.tsx', 'utf8');

const target = `{/* Action Controls Container */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          
          {/* Quick City Dropdown */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#9f2089]" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                updateFilter({ city: e.target.value });
              }}
              className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All Cities" className="bg-white text-slate-900">All India</option>
              {CITIES_LIST.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#9f2089]" />
            <select
              value={filterState.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as any })}
              className="bg-transparent text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-white text-slate-900">Featured First</option>
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            id="explore-filters-btn"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#9f2089] text-[10px] flex items-center justify-center font-black ml-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>`;

const replacement = `{/* Action Controls Container - Equal Width Columns */}
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
        </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/ExploreView.tsx', content);
console.log('ExploreView.tsx updated');
