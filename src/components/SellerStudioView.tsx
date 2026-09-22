import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  CheckCircle, 
  Calculator,
  ArrowRight,
  Crown,
  Eye,
  Heart,
  Edit3,
  Trash2,
  Filter,
  Search,
  AlertCircle,
  Clock,
  ShoppingBag,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { isOutfitOwner } from '../utils/permissionUtils';

export const SellerStudioView: React.FC = () => {
  const { 
    setActiveModal, 
    user, 
    products, 
    setEditingProduct, 
    setSelectedProduct, 
    deleteProduct, 
    requestDeleteProduct,
    updateProductStatus,
    showToast 
  } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'rented' | 'sold' | 'analytics'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Earnings Calculator State
  const [estimatedOutfitValue, setEstimatedOutfitValue] = useState<number>(85000);
  const [projectedRentals, setProjectedRentals] = useState<number>(6);

  const rentPerRental = Math.round(estimatedOutfitValue * 0.05); // ~5% per 3-day rental
  const annualEarnings = rentPerRental * projectedRentals;

  // Filter listings strictly for this user using ownership check
  const myListings = products.filter(
    (p) => isOutfitOwner(p, user)
  );

  const activeListings = myListings.filter((p) => p.status === 'active');
  const pendingListings = myListings.filter((p) => p.status === 'pending_approval');
  const rentedListings = myListings.filter((p) => p.status === 'rented');
  const soldListings = myListings.filter((p) => p.status === 'sold');

  // Filtered by current tab
  const getTabListings = () => {
    let list: Product[] = [];
    switch (activeTab) {
      case 'active':
        list = activeListings;
        break;
      case 'pending':
        list = pendingListings;
        break;
      case 'rented':
        list = rentedListings;
        break;
      case 'sold':
        list = soldListings;
        break;
      case 'all':
      default:
        list = myListings;
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const displayedListings = getTabListings();

  const handleEdit = (prod: Product) => {
    if (!isOutfitOwner(prod, user) && user.role !== 'admin') {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      return;
    }
    setEditingProduct(prod);
    setActiveModal('upload');
  };

  const handleDeleteClick = (prod: Product) => {
    if (!isOutfitOwner(prod, user) && user.role !== 'admin') {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      return;
    }
    requestDeleteProduct(prod);
  };

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Listing
          </span>
        );
      case 'pending_approval':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Verification
          </span>
        );
      case 'rented':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-[#9f2089] text-[10px] font-bold uppercase tracking-wider border border-pink-200 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Out for Wedding Rental
          </span>
        );
      case 'sold':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            Sold Out
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-8 text-slate-900">
      
      {/* Studio Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xs p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-pink-50 text-[#9f2089] text-xs font-bold uppercase tracking-wider border border-pink-200 flex items-center gap-1.5 w-fit">
              <Crown className="w-4 h-4 text-[#9f2089]" />
              BGK WEAR Seller Studio
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              Seller & Designer Wardrobe Management
            </h1>

            <p className="text-xs sm:text-sm text-slate-600">
              Manage your designer bridal wear, sherwanis, and luxury couture. Accept direct rental inquiries with 0% platform fee.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => {
                setEditingProduct(null);
                setActiveModal('upload');
              }}
              className="px-8 py-4 bg-[#9f2089] text-white hover:bg-[#80146f] rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-transform active:scale-95"
              id="seller-studio-list-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ List New Outfit</span>
            </button>
          </div>
        </div>

        {/* Studio Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Total Listed Outfits</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{myListings.length}</div>
            <span className="text-[10px] text-emerald-700 font-bold">{activeListings.length} Active in Catalog</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Currently Rented</span>
            <div className="text-xl sm:text-2xl font-black text-[#9f2089]">{rentedListings.length}</div>
            <span className="text-[10px] text-slate-500">Active Rentals</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Direct Purchases</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{soldListings.length}</div>
            <span className="text-[10px] text-blue-700 font-bold">Completed Sales</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Pending Verification</span>
            <div className="text-xl sm:text-2xl font-black text-amber-700">{pendingListings.length}</div>
            <span className="text-[10px] text-slate-500">Curation Review</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `My Listings (${myListings.length})`, icon: Layers },
              { id: 'active', label: `Active (${activeListings.length})`, icon: CheckCircle },
              { id: 'pending', label: `Pending Approval (${pendingListings.length})`, icon: Clock },
              { id: 'rented', label: `Rented Items (${rentedListings.length})`, icon: Calendar },
              { id: 'sold', label: `Sold Items (${soldListings.length})`, icon: ShoppingBag },
              { id: 'analytics', label: `Earnings Calculator`, icon: Calculator }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'border border-[#9f2089] bg-pink-50 text-[#9f2089]'
                      : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Listings */}
          {activeTab !== 'analytics' && (
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by title, brand, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'analytics' ? (
        /* Interactive Rental Earnings Calculator & Benefits */
        <div className="space-y-8">
          <section className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-50 border border-pink-200 text-[#9f2089]">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Interactive Rental Return Calculator
                </h3>
                <p className="text-xs text-slate-500">
                  Estimate your passive return on investment for bridal and groom couture
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-700 font-medium">Original Outfit Purchase Price:</span>
                    <span className="text-[#9f2089] font-bold text-sm">₹{estimatedOutfitValue.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="400000"
                    step="5000"
                    value={estimatedOutfitValue}
                    onChange={(e) => setEstimatedOutfitValue(Number(e.target.value))}
                    className="w-full accent-[#9f2089] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹20,000</span>
                    <span>₹2,00,000</span>
                    <span>₹4,00,000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-700 font-medium">Expected Rentals per Year:</span>
                    <span className="text-[#9f2089] font-bold text-sm">{projectedRentals} Weddings / Events</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={projectedRentals}
                    onChange={(e) => setProjectedRentals(Number(e.target.value))}
                    className="w-full accent-[#9f2089] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>2 Bookings</span>
                    <span>8 Bookings</span>
                    <span>15 Bookings</span>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-pink-50/80 border border-pink-200 flex flex-col justify-center text-center space-y-3 shadow-xs">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Your Estimated Annual Earnings</span>
                <div className="text-3xl sm:text-5xl font-black text-[#9f2089]">
                  ₹{annualEarnings.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-600">
                  (~₹{rentPerRental.toLocaleString('en-IN')} per rental booking)
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setActiveModal('upload');
                    }}
                    className="px-7 py-3 bg-[#9f2089] hover:bg-[#80146f] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    List This Outfit Now
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* How it works steps */}
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[#9f2089] text-xs font-bold uppercase tracking-widest">
                Simple Process
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                How BGK WEAR Protects & Monetizes Your Outfits
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#9f2089] flex items-center justify-center font-bold text-lg border border-pink-200">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900">Upload in 2 Minutes</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Snap photos of your bridal lehenga, sherwani, or gown. Set your daily rent price, selling price, and refundable security deposit.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#9f2089] flex items-center justify-center font-bold text-lg border border-pink-200">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900">Accept Direct Inquiries</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chat directly on WhatsApp or phone. Agree on rental dates and security deposit directly.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#9f2089] flex items-center justify-center font-bold text-lg border border-pink-200">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900">Direct Handover & Payout</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Coordinate fitting and convenient handover directly with the buyer. Receive 100% of your earnings with 0% platform commission.
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Listings Management Grid */
        <div className="space-y-4">
          {displayedListings.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-200 text-[#9f2089] flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery ? `No listings match "${searchQuery}"` : 'No outfits found in this section'}
              </h3>
              <p className="text-xs text-slate-500">
                {searchQuery
                  ? 'Try adjusting your search keywords or clear the filter.'
                  : 'Start earning rental returns by publishing your luxury bridal or groom outfits.'}
              </p>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setActiveModal('upload');
                }}
                className="px-6 py-3 bg-[#9f2089] hover:bg-[#80146f] text-white font-bold uppercase rounded-full text-xs cursor-pointer shadow-xs"
              >
                + List First Outfit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {displayedListings.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-3xl bg-white border border-slate-200 hover:border-[#9f2089] transition-all overflow-hidden flex flex-col justify-between shadow-xs"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    
                    {/* Top Row: Thumbnail + Info */}
                    <div className="flex gap-4">
                      <div 
                        onClick={() => setSelectedProduct(prod)}
                        className="relative w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer group border border-slate-200"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                          {prod.images.length} photos
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[#9f2089] text-[10px] font-bold uppercase tracking-wider border border-pink-200 truncate">
                            {prod.category}
                          </span>
                          {getStatusBadge(prod.status)}
                        </div>

                        <h4 
                          onClick={() => setSelectedProduct(prod)}
                          className="text-sm sm:text-base font-bold text-slate-900 truncate cursor-pointer hover:text-[#9f2089] transition-colors"
                        >
                          {prod.title}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {prod.brand} • Size {prod.size} • {prod.color}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#9f2089]" />
                            {prod.city}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Eye className="w-3 h-3" />
                            {prod.viewsCount} views
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Breakdown Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Rent / Day</span>
                        <span className="font-bold text-[#9f2089]">
                          {prod.listingType !== 'buy' ? `₹${prod.rentPricePerDay?.toLocaleString('en-IN')}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Security Deposit</span>
                        <span className="font-bold text-emerald-700">
                          {prod.listingType !== 'buy' ? `₹${prod.securityDeposit?.toLocaleString('en-IN')}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Purchase Price</span>
                        <span className="font-bold text-slate-900">
                          {prod.salePrice ? `₹${prod.salePrice?.toLocaleString('en-IN')}` : 'Rent Only'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Status Selector */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500 text-[11px] font-medium">Availability Status:</span>
                      <select
                        value={prod.status}
                        onChange={(e) => {
                          updateProductStatus(prod.id, e.target.value as any);
                          showToast(`Status updated to ${e.target.value.replace('_', ' ')}`, 'info');
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900 focus:border-[#9f2089] focus:outline-none cursor-pointer"
                      >
                        <option value="active">Active (Available)</option>
                        <option value="rented">Currently Rented</option>
                        <option value="sold">Sold Out</option>
                        <option value="pending_approval">Pending Approval</option>
                      </select>
                    </div>

                  </div>

                  {/* Footer Action Buttons */}
                  <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#9f2089]" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteClick(prod)}
                        className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        id={`seller-delete-btn-${prod.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
