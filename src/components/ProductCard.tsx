import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  Sparkles, 
  ShoppingBag, 
  Crown,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { isOutfitOwner } from '../utils/permissionUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    isWishlisted, 
    toggleWishlist, 
    setSelectedProduct, 
    setEditingProduct,
    setActiveModal,
    requestDeleteProduct,
    openWhatsApp,
    user,
    showToast
  } = useApp();

  const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80';

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  if (!product || typeof product !== 'object' || !product.id) return null;

  // Ownership permission check: only listing creator or admin can edit/delete
  const isOwner = isOutfitOwner(product, user) || user?.role === 'admin';

  const safeImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images.filter(img => typeof img === 'string' && img.trim().length > 0)
    : [];

  const mainImg = safeImages[currentImageIndex] || safeImages[0];
  const currentImageSrc = !mainImg ? DEFAULT_FALLBACK_IMAGE : mainImg;

  const sellerWhatsAppNumber = product.seller?.whatsapp?.trim() || product.seller?.phone?.trim() || user?.whatsapp?.trim() || user?.phone?.trim() || '';
  const isSellerVerified = product.seller ? product.seller.isVerified : true;

  const wish = isWishlisted(product.id);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sellerWhatsAppNumber) {
      showToast('Seller WhatsApp contact is not available', 'error');
      return;
    }
    const text = `Hello! I am interested in renting/buying "${product.title}" (${product.brand}, Size: ${product.size}) on BGK WEAR. Is it available?`;
    openWhatsApp(sellerWhatsAppNumber, text);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOwner) {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      return;
    }
    setEditingProduct(product);
    setActiveModal('upload');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOwner) {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      return;
    }
    requestDeleteProduct(product);
  };

  const discountPercent = product.originalRetailPrice
    ? Math.round(((product.originalRetailPrice - (product.salePrice || product.rentPricePerDay * 3)) / product.originalRetailPrice) * 100)
    : null;

  return (
    <motion.div 
      onClick={() => setSelectedProduct(product)}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="card-led-border-wrap group relative cursor-pointer text-slate-900 h-full"
      id={`product-card-${product.id}`}
    >
      <div className="card-led-content bg-gradient-to-b from-[#fce7f3] via-[#fae8ff] to-[#f3e8ff] p-2.5 sm:p-3 flex flex-col justify-between border border-pink-300/60 shadow-2xs rounded-[calc(1rem-1.5px)]">
        <div>
        {/* Top Header Row with Brand & Seller Verification & Edit/Delete/Wishlist Controls */}
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="bg-white/95 text-[#80146f] text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-pink-300/80 shadow-2xs truncate max-w-[90px] sm:max-w-[140px]">
              {product.brand}
            </span>
            {isSellerVerified && (
              <span className="inline-flex items-center shrink-0" title="BGK Signature Verified">
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
              </span>
            )}
          </div>

          {/* Quick Actions: Edit, Delete (only for outfit owner), Wishlist */}
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={handleEdit}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 hover:bg-[#9f2089] text-slate-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
                  title="Edit Outfit Details & Photos"
                  id={`edit-btn-${product.id}`}
                >
                  <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>

                <button
                  onClick={handleDelete}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
                  title="Delete this Outfit"
                  id={`delete-btn-${product.id}`}
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-pink-100 flex items-center justify-center text-slate-400 hover:text-[#9f2089] hover:bg-pink-50 transition-all active:scale-90 cursor-pointer shadow-2xs"
              id={`wishlist-btn-${product.id}`}
              aria-label="Wishlist"
              title="Save to Wishlist"
            >
              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${wish ? 'fill-[#9f2089] text-[#9f2089] stroke-[#9f2089] scale-110' : 'group-hover:text-slate-800'}`} />
            </button>
          </div>
        </div>

        {/* Product Image Area - Clean & Minimalist */}
        <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-2 relative overflow-hidden border border-slate-100">
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={currentImageIndex}
              src={currentImageSrc}
              alt={product.title || 'Outfit'}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                const threshold = 30;
                if (info.offset.x < -threshold) {
                  handleNextImage({ stopPropagation: () => {} } as any);
                } else if (info.offset.x > threshold) {
                  handlePrevImage({ stopPropagation: () => {} } as any);
                }
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!navigator.onLine || target.src === DEFAULT_FALLBACK_IMAGE) {
                  target.src = '/offline-image-fallback.svg';
                } else {
                  target.src = DEFAULT_FALLBACK_IMAGE;
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 block cursor-grab active:cursor-grabbing"
              loading="lazy"
            />
          </AnimatePresence>

          {/* Carousel arrows - Subtle on hover */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/70 backdrop-blur-md border border-white/40 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer z-10 shadow-xs"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/70 backdrop-blur-md border border-white/40 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer z-10 shadow-xs"
                aria-label="Next image"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Discount Tag */}
          {discountPercent && discountPercent > 0 && (
            <div className="absolute bottom-1.5 left-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full backdrop-blur-xs tracking-tight shadow-xs">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Title, Specs & Location */}
        <div className="space-y-1 px-0.5">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-[#9f2089] transition-colors leading-tight flex-1 min-w-0" title={product.title}>
              {product.title}
            </h3>
            <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/80 shadow-2xs">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
              <span className="text-[10px] font-black text-amber-900">{product.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 min-w-0">
              <span className="bg-slate-900 text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded uppercase shrink-0">
                {product.size}
              </span>
              <span className="text-slate-600 text-[10px] font-semibold truncate">
                {product.category}
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-slate-500 shrink-0 max-w-[40%]">
              <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
              <span className="text-[9px] font-semibold truncate">{product.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing and Action Area */}
      <div className="px-0.5 pb-0.5">
        <div className="flex flex-wrap justify-between items-center mt-2 pt-1.5 border-t border-pink-300/70 gap-x-1 gap-y-1">
          <div className="space-y-0.5 min-w-0 flex-1">
            {product.listingType !== 'buy' && (
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 flex-wrap sm:flex-nowrap">
                  <span className="text-[#9f2089] font-black text-[14px] sm:text-[15px] truncate max-w-full" title={`₹${product.rentPricePerDay.toLocaleString('en-IN')}`}>
                    ₹{product.rentPricePerDay.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight whitespace-nowrap">/day</span>
                </div>
                {product.originalRetailPrice && (
                  <p className="text-[9px] text-slate-400 line-through truncate">
                    MRP ₹{product.originalRetailPrice.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
            {product.listingType === 'buy' && (
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 flex-wrap sm:flex-nowrap">
                  <span className="text-slate-900 font-black text-[14px] sm:text-[15px] truncate max-w-full" title={`₹${product.salePrice?.toLocaleString('en-IN')}`}>
                    ₹{product.salePrice?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight whitespace-nowrap">Buy</span>
                </div>
                {product.originalRetailPrice && (
                  <p className="text-[9px] text-slate-400 line-through truncate">
                    MRP ₹{product.originalRetailPrice.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>

          {(product.listingType === 'both') && (
            <div className="text-right shrink-0 max-w-[45%]">
              <div className="text-slate-900 font-black text-[12px] sm:text-[13px] truncate" title={`₹${product.salePrice?.toLocaleString('en-IN')}`}>
                ₹{product.salePrice?.toLocaleString('en-IN')}
              </div>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Buy Price</p>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {product.listingType !== 'buy' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
              }}
              className={`${product.listingType === 'rent' ? 'col-span-2' : ''} btn-rent-sparkle w-full text-white font-extrabold py-1.5 rounded-xl text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95`}
              id={`rent-now-btn-${product.id}`}
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-100" />
              <span>Rent</span>
            </button>
          )}

          {product.listingType !== 'rent' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
              }}
              className={`${product.listingType === 'buy' ? 'col-span-2' : ''} btn-buy-sparkle w-full text-white font-extrabold py-1.5 rounded-xl text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95`}
              id={`buy-now-btn-${product.id}`}
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-200" />
              <span>Buy</span>
            </button>
          )}
        </div>
      </div>
    </div>
    </motion.div>
  );
};
