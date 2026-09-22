import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Edit3, 
  PlusCircle, 
  ShoppingBag, 
  Calendar, 
  Heart, 
  DollarSign, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Bookmark,
  Settings,
  LogOut,
  Bell,
  Sliders,
  Camera,
  Rocket,
  RefreshCw,
  Download,
  Share2,
  ChevronRight,
  Apple,
  Monitor,
  Smartphone,
  Laptop,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { POPULAR_INDIAN_CITIES, INDIAN_STATES_LIST, getStateForCity } from '../data/locations';
import { Footer } from './Footer';
import { getAppStoreUrl, getAppBaseUrl } from '../utils/appUrl';

export const UserProfileView: React.FC = () => {
  const { 
    user, 
    setUser,
    updateUserProfile, 
    logout,
    products, 
    rentalBookings, 
    purchaseOrders, 
    wishlist, 
    setActiveModal, 
    setSelectedProduct, 
    deleteProduct,
    setUserRole,
    updateFilter,
    setActiveTab,
    showToast,
    currentAppVersion,
    checkForUpdates,
    isCheckingUpdate,
    setShowUpdateModal,
    updateInfo
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<'listings' | 'rentals' | 'orders' | 'wishlist' | 'searches' | 'earnings' | 'settings'>('listings');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editCity, setEditCity] = useState(user?.district || user?.city || '');
  const [editState, setEditState] = useState(user?.state || 'Maharashtra');
  const [editPincode, setEditPincode] = useState(user?.pincode || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editWhatsapp, setEditWhatsapp] = useState(user?.whatsapp || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [coverBanner, setCoverBanner] = useState('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1600&q=80');
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadstart = () => {
        // Optional: show a loading state if needed
      };
      
      reader.onerror = (error) => {
        console.error('FileReader Error:', error);
        showToast('Failed to read image file. Please try again.', 'error');
      };

      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string' && result) {
          if (type === 'cover') {
            setCoverBanner(result);
            showToast('Cover banner updated! ✨', 'success');
          } else {
            setEditAvatar(result);
            updateUserProfile({ avatar: result });
            showToast('Profile picture updated! 👤', 'success');
          }
        } else {
          console.error('FileReader result is invalid or empty');
          showToast('Failed to process image. Please try a different file.', 'error');
        }
      };

      // Safely read the file
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image Upload Handler Exception:', err);
      showToast('An unexpected error occurred during upload.', 'error');
    } finally {
      // Clear the input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  // Sample saved searches
  const savedSearches = [
    { id: '1', title: 'Sabyasachi Bridal Lehengas under ₹8,000/day', query: 'Sabyasachi', category: 'Bridal Lehenga', maxPrice: 8000 },
    { id: '2', title: 'Groom Silk Sherwanis in Mumbai', query: 'Sherwani', category: 'Groom Sherwani', city: 'Mumbai' },
    { id: '3', title: 'Tarun Tahiliani Cocktail Gowns', query: 'Tarun Tahiliani', category: 'Gown' },
    { id: '4', title: '24K Gold Kundan Jewellery Sets', query: 'Kundan', category: 'Jewellery' }
  ];

  const myListings = (products || []).filter((p) => 
    (p.seller?.id && user?.id && p.seller.id === user.id) || 
    (p.seller?.name && user?.name && p.seller.name.toLowerCase() === user.name.toLowerCase())
  );
  const wishlistedProducts = (products || []).filter((p) => (wishlist || []).includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      address: editAddress,
      city: editCity,
      district: editCity,
      state: editState,
      pincode: editPincode,
      bio: editBio,
      phone: editPhone,
      whatsapp: editWhatsapp,
      avatar: editAvatar,
      isProfileComplete: true
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleShareApp = async () => {
    const currentUrl = getAppStoreUrl();
    const shareTitle = 'BGK WEAR: Official App Download (Play Store Platform)';
    const shareDescription = "✨ India's #1 Luxury Designer Wear Marketplace!\n👗 Rent, buy & sell bridal lehengas, sherwanis, sarees & wedding wear with 0% commission.\n📲 Click here to download & install automatically just like Play Store:\n";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl
        });
        showToast('App download platform shared successfully! 🚀', 'success');
      } catch (err) {
        console.log('Share failed or dismissed:', err);
      }
    } else {
      await handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const storeUrl = getAppStoreUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(storeUrl);
      } else {
        // Fallback for older/restricted browsers
        const textarea = document.createElement('textarea');
        textarea.value = storeUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setHasCopiedLink(true);
      showToast('Official Play Store link copied to clipboard! 📋', 'success');
      setTimeout(() => setHasCopiedLink(false), 3000);
    } catch (err) {
      showToast('Could not copy automatically. Link: ' + storeUrl, 'error');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
      
      {/* Share This App Section (Top) - Official Play Store Platform UI */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#9f2089]" />
            <span>Play Store Download Platform</span>
          </h2>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100 tracking-wider">
            1-Click Auto Install
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Share this official link with friends and customers. When they open it, they can 1-click download and automatically install the BGK WEAR app on Android, iPhone, or Windows PC just like Google Play Store!
        </p>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 space-y-1 min-w-0">
            <div 
              onClick={handleCopyLink}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-mono flex items-center justify-between hover:bg-slate-100 transition-all group overflow-hidden cursor-pointer"
              title="Click to copy official download link"
            >
              <span className="truncate mr-2 text-[11px] font-bold text-emerald-700 select-all">
                {getAppStoreUrl()}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 shrink-0">
                {hasCopiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium ml-1">
              Tap link to copy • Verified 100% safe & functional on all mobile & desktop browsers
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasCopiedLink 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
              title="Copy official link"
            >
              {hasCopiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveModal('appstore')}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Preview Platform"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Preview</span>
            </button>

            <button
              onClick={handleShareApp}
              className="px-6 py-3 bg-[#01875f] hover:bg-[#01704e] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Profile Header with Cover Banner - Compact & Aesthetic */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        
        {/* Cover Banner - Compact Height */}
        <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 group">
          <img
            src={coverBanner}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleImageUpload(e, 'cover')} 
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 border border-slate-200 text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Camera className="w-3 h-3 text-[#9f2089]" />
            <span>Change Cover</span>
          </button>
        </div>

        <div className="px-5 sm:px-8 pb-5 relative -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-5">
              <div className="relative group/avatar">
                <input 
                  type="file" 
                  ref={avatarInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'avatar')} 
                />
                <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white ring-2 ring-[#9f2089]/30 shadow-md bg-white group-hover/avatar:ring-[#9f2089] transition-all"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#9f2089] text-white flex items-center justify-center text-[10px] font-black shadow-xs border-2 border-white">
                    ✓
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{user.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-[#9f2089] text-[9px] font-bold uppercase tracking-wider border border-pink-100 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 max-w-sm line-clamp-1 italic">{user.bio || 'Professional Boutique Owner'}</p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#9f2089]/60" />
                    Location
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile & Action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:border-[#9f2089] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                id="edit-profile-btn"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setActiveModal('upload')}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#9f2089] hover:bg-[#80146f] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                id="list-new-outfit-profile-btn"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ List</span>
              </button>
            </div>

          </div>

          {/* Role Quick Toggle */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Account Role Preview:</span>
            <div className="flex gap-1.5">
              {(['buyer', 'seller', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    user.role === r ? 'bg-[#9f2089] text-white' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-slate-900">Edit Profile Details</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">Delivery / Pickup Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Flat / Building, Street, Locality"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">City / District *</label>
                  <select
                    value={editCity}
                    onChange={(e) => {
                      const selCity = e.target.value;
                      setEditCity(selCity);
                      const matchedState = getStateForCity(selCity);
                      if (matchedState) {
                        setEditState(matchedState);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089] cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select City --</option>
                    {POPULAR_INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">State *</label>
                  <select
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089] cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Select State --</option>
                    {INDIAN_STATES_LIST.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Pin Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">Bio / Boutique Description</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089]"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">Avatar Photo URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#9f2089]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9f2089] hover:bg-[#80146f] text-white rounded-full font-bold uppercase text-xs cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5 Profile Sections Navigation - Vertical Line by Line List */}
      <div className="space-y-2">
        <div className="space-y-2">
          {[
            { 
              id: 'listings', 
              label: 'My Outfits', 
              hindiLabel: 'माय आउटफिट्स',
              count: myListings.length, 
              badge: `${myListings.length} Outfits`,
              icon: Sparkles,
              description: 'Listed for rent / sale'
            },
            { 
              id: 'rentals', 
              label: 'Rentals', 
              hindiLabel: 'रेंटल्स',
              count: rentalBookings.length, 
              badge: `${rentalBookings.length} Bookings`,
              icon: Calendar,
              description: 'Active rentals & leases'
            },
            { 
              id: 'wishlist', 
              label: 'Wishlist', 
              hindiLabel: 'विशलिस्ट',
              count: wishlist.length, 
              badge: `${wishlist.length} Items`,
              icon: Heart,
              description: 'Saved favorite outfits'
            },
            { 
              id: 'searches', 
              label: 'Saved Searches', 
              hindiLabel: 'सेव्ड सर्चस',
              count: savedSearches.length, 
              badge: `${savedSearches.length} Alerts`,
              icon: Bookmark,
              description: 'Price drop & alerts'
            },
            { 
              id: 'settings', 
              label: 'Settings', 
              hindiLabel: 'सेटिंग्स',
              count: `v${currentAppVersion}`, 
              badge: 'Security',
              icon: Settings,
              description: 'Privacy & updates'
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeProfileTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-50 via-white to-pink-50/40 border-[#9f2089] ring-2 ring-[#9f2089]/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-pink-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
                id={`profile-tab-${tab.id}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-[#9f2089] text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 group-hover:bg-pink-100 group-hover:text-[#9f2089]'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs sm:text-sm font-bold tracking-tight transition-colors truncate ${
                        isActive ? 'text-[#9f2089]' : 'text-slate-900 group-hover:text-[#9f2089]'
                      }`}>
                        {tab.label}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                        ({tab.hindiLabel})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {tab.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    isActive
                      ? 'bg-pink-100 text-[#9f2089] border-pink-200 shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {tab.badge}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                    isActive ? 'bg-[#9f2089] text-white rotate-90' : 'bg-slate-100 text-slate-400 group-hover:translate-x-0.5'
                  }`}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Active Indicator Left Border Accent */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#9f2089] rounded-r-full" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: My Listings */}
      {activeProfileTab === 'listings' && (
        <motion.div
          key="listings"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">Your Listed Outfits</h3>
            <button
              onClick={() => setActiveModal('upload')}
              className="text-xs text-[#9f2089] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Another Outfit</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="py-14 text-center rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
              <p className="text-xs text-slate-500">You haven't listed any wedding outfits yet.</p>
              <button
                onClick={() => setActiveModal('upload')}
                className="px-6 py-2.5 bg-[#9f2089] hover:bg-[#80146f] text-white rounded-full text-xs font-bold uppercase cursor-pointer shadow-xs"
              >
                List Your First Outfit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {myListings.map((prod) => (
                <div key={prod.id} className="relative group">
                  <ProductCard product={prod} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(prod.id);
                    }}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-red-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                    title="Delete Outfit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 2: Rentals History & Security Deposits */}
      {activeProfileTab === 'rentals' && (
        <motion.div
          key="rentals"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <h3 className="text-lg font-black text-slate-900">Active & Past Rental Bookings</h3>

          {rentalBookings.length === 0 ? (
            <div className="py-14 text-center rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
              <p className="text-xs text-slate-500">No rental bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rentalBookings.map((booking) => (
                <div key={booking.id} className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.productImage}
                      alt={booking.productTitle}
                      className="w-16 h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[#9f2089] bg-pink-50 text-[10px] font-bold uppercase border border-pink-200">
                          {booking.status}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">ID: #{booking.id}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                        {booking.productTitle}
                      </h4>
                      <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-3">
                        <span>Period: <strong className="text-slate-900">{booking.startDate} to {booking.endDate} ({booking.totalDays} Days)</strong></span>
                        <span>Total Paid: <strong className="text-[#9f2089]">₹{booking.totalPaid.toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-bold">
                        <Lock className="w-3 h-3 text-[#9f2089]" />
                        <span>Security Deposit (₹{booking.securityDeposit.toLocaleString('en-IN')}): {booking.depositRefundStatus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                    >
                      Manage Booking
                    </button>
                    <button 
                      onClick={() => setSelectedProduct(products.find(p => p.id === booking.productId) || products[0])}
                      className="flex-1 sm:flex-initial px-5 py-2 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold uppercase cursor-pointer shadow-xs transition-all"
                    >
                      View Outfit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: Purchase Orders */}
      {activeProfileTab === 'orders' && (
        <motion.div
          key="orders"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <h3 className="text-lg font-black text-slate-900">Purchase Orders</h3>
          {purchaseOrders.length === 0 ? (
            <div className="py-14 text-center rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
              <p className="text-xs text-slate-500">No purchases yet. Browse catalog to buy outfits.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchaseOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={order.productImage} alt={order.productTitle} className="w-16 h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase border border-blue-200">
                        {order.status}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{order.productTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Ordered on {order.orderDate} • Paid: ₹{order.totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Manage Purchase & Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 4: Earnings & Summary */}
      {activeProfileTab === 'earnings' && (
        <motion.div
          key="earnings"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Available Wallet Balance</span>
              <div className="text-2xl sm:text-3xl font-black text-[#9f2089] mt-1">
                ₹{(user.balanceEarnings || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ Direct rental earnings</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Active Security Deposits</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                ₹16,000
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Coordinated directly with borrowers</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Completed Deals</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                12 Orders
              </div>
              <p className="text-[11px] text-slate-500 mt-1">5.0 Star Seller Rating</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 5: Wishlist */}
      {activeProfileTab === 'wishlist' && (
        <motion.div
          key="wishlist"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">Your Saved Outfits ({wishlistedProducts.length})</h3>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs text-[#9f2089] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore More Designs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {wishlistedProducts.length === 0 ? (
            <div className="py-14 text-center rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
              <p className="text-xs text-slate-500">Your wishlist is currently empty. Tap the heart icon on any outfit to save it.</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-6 py-2.5 bg-[#9f2089] hover:bg-[#80146f] text-white rounded-full text-xs font-bold uppercase cursor-pointer shadow-xs"
              >
                Browse Outfits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {wishlistedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 6: Saved Searches */}
      {activeProfileTab === 'searches' && (
        <motion.div
          key="searches"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900">Saved Searches & Couture Alerts</h3>
              <p className="text-xs text-slate-500">Receive instant WhatsApp alerts when matching outfits are listed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedSearches.map((s) => (
              <div key={s.id} className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#9f2089] shadow-xs transition-colors flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-[#9f2089] text-[10px] font-bold uppercase tracking-wider border border-pink-200">
                      {s.category}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      Alerts Active
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{s.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Keyword: "{s.query}" • {s.city ? `City: ${s.city}` : 'All Cities'}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      updateFilter({
                        searchQuery: s.query,
                        category: s.category as any,
                        city: s.city || 'All Cities'
                      });
                      setActiveTab('explore');
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold uppercase cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Run Search</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => showToast(`Search alert removed: "${s.title}"`, 'info')}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer font-bold"
                  >
                    Remove Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 7: Settings & Security */}
      {activeProfileTab === 'settings' && (
        <motion.div
          key="settings"
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-6 max-w-3xl"
        >
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9f2089]" />
              <span>Account Security & Verified Marketplace</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <h5 className="font-bold text-slate-900">Direct Marketplace Verification</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Connect with verified boutique owners and authentic brides across India with zero platform commission.</p>
                </div>
                <span className="text-emerald-600 font-bold text-xs">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <h5 className="font-bold text-slate-900">Phone & WhatsApp Verification</h5>
                  <p className="text-slate-500 text-[11px] mt-0.5">Mask your phone number from unauthenticated guest visitors.</p>
                </div>
                <span className="text-emerald-600 font-bold text-xs">PROTECTED</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#9f2089]" />
              <span>Notification Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="text-slate-800 font-medium">Instant WhatsApp notifications for new booking requests</span>
                <input type="checkbox" defaultChecked className="accent-[#9f2089] w-4 h-4 cursor-pointer" />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="text-slate-800 font-medium">Price drop & rental discount alerts for wishlisted outfits</span>
                <input type="checkbox" defaultChecked className="accent-[#9f2089] w-4 h-4 cursor-pointer" />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="text-slate-800 font-medium">Return window reminders (24h before rental period ends)</span>
                <input type="checkbox" defaultChecked className="accent-[#9f2089] w-4 h-4 cursor-pointer" />
              </label>
            </div>
          </div>

          {/* App Version & In-App Updates */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#9f2089]" />
                <span>BGK Wear Version & Updates</span>
              </h3>
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                v{currentAppVersion}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              In-app update system automatically checks for the latest APK & features on every launch.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => checkForUpdates(true)}
                disabled={isCheckingUpdate}
                className="px-5 py-2.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                id="check-updates-btn"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Checking Server...' : 'Check for Updates'}</span>
              </button>

              <button
                onClick={() => setShowUpdateModal(true)}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                id="preview-update-modal-btn"
              >
                <Download className="w-3.5 h-3.5 text-[#9f2089]" />
                <span>Preview Update Alert</span>
              </button>
            </div>
          </div>

          {/* Universal Cross-Platform App Download & Install Hub */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-pink-50/40 to-slate-50 border border-pink-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-[#9f2089]" />
                <span>Get BGK WEAR on Any Device</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-[#9f2089] border border-pink-200 text-[10px] font-black uppercase tracking-wider">
                Cross-Platform
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              BGK WEAR runs natively across all devices with instant hardware acceleration, full offline catalog caching, and zero lag. Choose your device below to install or download:
            </p>

            {/* Supported Devices Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-800 shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-slate-900 leading-none">iPhone / iPad</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">iOS Safari PWA</p>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-slate-900 leading-none">Windows PC</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Desktop App</p>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-slate-900 leading-none">Android</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">App & Direct APK</p>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-slate-900 leading-none">Mac & Web</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Standalone App</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={() => setActiveModal('appstore')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#01875f] hover:bg-[#01704e] text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 text-center"
                  id="open-universal-install-hub-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>Google Play Store Platform (Auto Install)</span>
                </button>

                <button
                  onClick={handleShareApp}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 text-center"
                  id="share-official-app-btn"
                >
                  <Share2 className="w-4 h-4 text-[#9f2089]" />
                  <span>Share Platform Link</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 font-semibold italic">
                iPhone users install via Safari "Add to Home Screen". Android & Windows PC users install automatically in 1 click!
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Account Session</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-800 font-bold">Signed in as {user.name} ({user.phone})</p>
                <p className="text-[11px] text-slate-500">You can sign out to switch accounts or browse as a guest.</p>
              </div>

              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4 w-full text-xs font-bold"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer is only visible on the Profile Screen */}
      <div className="mt-8">
        <Footer />
      </div>

    </div>
  );
};
