import React, { useState, useEffect } from 'react';
import { PinchZoomViewer } from './PinchZoomViewer';
import { 
  X, 
  Heart, 
  Share2, 
  Star, 
  Crown,
  MapPin, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  ZoomIn,
  Flag,
  AlertTriangle,
  Edit,
  Trash2,
  Camera,
  CheckCircle,
  ImageIcon,
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Truck,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { nativeShare, triggerHaptic } from '../services/nativeService';
import { isOutfitOwner } from '../utils/permissionUtils';
import { ProductCard } from './ProductCard';
import { getUserProfileDoc } from '../services/firestoreService';
import { UserProfile } from '../types';
import { loadAndShowInterstitial } from '../services/adService';
import { useDynamicSEO } from '../hooks/useDynamicSEO';
import { compressImage } from '../utils/imageUtils';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    isWishlisted, 
    toggleWishlist, 
    openWhatsApp, 
    openCall,
    setActiveModal,
    setEditingProduct,
    deleteProduct,
    requestDeleteProduct,
    showToast,
    addReview,
    updateReview,
    deleteReview,
    products,
    user
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate Details');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewFit, setNewReviewFit] = useState<'True to Size' | 'Runs Small' | 'Runs Large' | 'Perfect Custom Fit'>('True to Size');
  const [newReviewOccasion, setNewReviewOccasion] = useState('Wedding Reception');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAllReviewsOverlay, setShowAllReviewsOverlay] = useState(false);
  const [selectedReviewForOverlay, setSelectedReviewForOverlay] = useState<any>(null);

  // Review Edit State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewComment, setEditReviewComment] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewFit, setEditReviewFit] = useState<'True to Size' | 'Runs Small' | 'Runs Large' | 'Perfect Custom Fit'>('True to Size');
  const [editReviewPhotos, setEditReviewPhotos] = useState<string[]>([]);
  const [isEditUploadingPhoto, setIsEditUploadingPhoto] = useState(false);

  // Ownership permission check: only listing creator or admin can edit/delete
  const isOwner = selectedProduct ? (isOutfitOwner(selectedProduct, user) || user?.role === 'admin') : false;

  // Dynamic SEO, Open Graph & Twitter Tags for Product Sharing
  useDynamicSEO(
    selectedProduct
      ? {
          title: `${selectedProduct.title} | Rent ₹${selectedProduct.rentalPrice}/day • Buy ₹${selectedProduct.salePrice?.toLocaleString('en-IN')}`,
          description: `Rent or buy ${selectedProduct.title} (${selectedProduct.category}) by ${selectedProduct.brand || 'Luxury Designer'}. Size: ${selectedProduct.size}, Color: ${selectedProduct.color}, Fabric: ${selectedProduct.fabric}. City: ${selectedProduct.city}. ${selectedProduct.description ? selectedProduct.description.slice(0, 130) + '...' : ''}`,
          image: selectedProduct.images?.[0] || '/icon-512.png',
          imageAlt: selectedProduct.title,
          type: 'product',
          price: selectedProduct.rentalPrice || selectedProduct.salePrice,
          currency: 'INR',
          category: selectedProduct.category,
          brand: selectedProduct.brand || 'Luxury Designer',
          availability: selectedProduct.status === 'active' ? 'InStock' : 'OutOfStock',
          keywords: [
            selectedProduct.title,
            selectedProduct.category,
            selectedProduct.color,
            selectedProduct.fabric,
            'wedding wear rental India',
            'bridal lehenga rent',
            'BGK WEAR'
          ]
        }
      : null
  );

  const handleEditOutfit = () => {
    if (!selectedProduct) return;
    if (!isOwner) {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      return;
    }
    setEditingProduct(selectedProduct);
    setSelectedProduct(null);
    setActiveModal('upload');
  };

  const handleDeleteOutfit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProduct) return;
    if (!isOwner) {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      return;
    }
    const prod = selectedProduct;
    setSelectedProduct(null);
    requestDeleteProduct(prod);
  };

  const handleCloseModal = async () => {
    console.log('ProductDetailModal: handleCloseModal triggered');
    try {
      // We don't await this if we want the modal to close immediately, 
      // but the user wants to ensure it's called.
      // Calling it and letting it run while the modal closes is usually better for UX.
      loadAndShowInterstitial();
    } catch (e) {
      console.warn("ProductDetailModal: Ad service call failed", e);
    }
    setSelectedProduct(null);
  };

  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    
    if (selectedProduct) {
      const ownerId = selectedProduct.userId || 
                      selectedProduct.createdBy || 
                      selectedProduct.sellerId || 
                      (selectedProduct.seller?.id && !selectedProduct.seller.id.startsWith('seller-') ? selectedProduct.seller.id : null);
      
      if (ownerId) {
        getUserProfileDoc(ownerId)
          .then((profile) => {
            if (profile) {
              setOwnerProfile(profile);
            } else {
              setOwnerProfile(null);
            }
          })
          .catch((err) => {
            console.error('Error fetching owner profile:', err);
            setOwnerProfile(null);
          });
      } else {
        setOwnerProfile(null);
      }
    } else {
      setOwnerProfile(null);
    }
  }, [selectedProduct?.id]);

  if (!selectedProduct || typeof selectedProduct !== 'object' || !('id' in selectedProduct) || typeof selectedProduct.id !== 'string') {
    return null;
  }

  const safeImages = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80'];

  const safeSeller = {
    id: ownerProfile?.id || selectedProduct.seller?.id || 'seller-' + selectedProduct.id,
    name: ownerProfile?.name || selectedProduct.seller?.name || 'Verified Closet Curator',
    avatar: ownerProfile?.avatar || selectedProduct.seller?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    city: ownerProfile?.city || ownerProfile?.district || selectedProduct.city || selectedProduct.seller?.city || user?.district || user?.city || 'Mumbai',
    state: ownerProfile?.state || selectedProduct.state || selectedProduct.seller?.state || user?.state || 'Maharashtra',
    phone: ownerProfile?.phone || selectedProduct.seller?.phone || user?.phone || '',
    whatsapp: ownerProfile?.whatsapp || ownerProfile?.phone || selectedProduct.seller?.whatsapp || selectedProduct.seller?.phone || user?.whatsapp || user?.phone || '',
    isVerified: ownerProfile?.isVerified ?? selectedProduct.seller?.isVerified ?? true,
    rating: selectedProduct.seller?.rating || 5.0,
    totalReviews: selectedProduct.seller?.totalReviews || 1,
    totalListings: selectedProduct.seller?.totalListings || 1,
    responseTime: 'Under 10 mins'
  };

  const sellerWhatsAppNumber = safeSeller.whatsapp?.trim() || safeSeller.phone?.trim() || '';
  const sellerPhoneNumber = safeSeller.phone?.trim() || '';

  const wish = isWishlisted(selectedProduct.id);

  // Similar Outfits
  const similarProducts = products
    .filter((p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.brand === selectedProduct.brand))
    .slice(0, 4);

  const handleShare = async () => {
    triggerHaptic('light');
    const rentBuyText = selectedProduct.listingType === 'buy'
      ? `Buy for ₹${selectedProduct.salePrice?.toLocaleString('en-IN')}`
      : selectedProduct.listingType === 'both'
        ? `Rent for ₹${selectedProduct.rentalPrice}/day • Buy for ₹${selectedProduct.salePrice?.toLocaleString('en-IN')}`
        : `Rent for ₹${selectedProduct.rentalPrice}/day`;
    const shareText = `✨ ${selectedProduct.title} (${selectedProduct.category})\n💰 ${rentBuyText}\n👗 Size: ${selectedProduct.size} | Color: ${selectedProduct.color} | Fabric: ${selectedProduct.fabric}\n📍 ${selectedProduct.city}\n\nRent & Buy authentic designer wear with 0% commission on BGK WEAR:`;
    const shared = await nativeShare(
      selectedProduct.title,
      shareText,
      window.location.href
    );
    if (!shared) {
      showToast('Listing link & details copied to clipboard! 📋', 'info');
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReportModal(false);
    showToast(`Listing flagged for review (${reportReason}). Our Trust & Safety team will inspect within 2 hours.`, 'info');
  };

  const handleWhatsAppChat = () => {
    if (!sellerWhatsAppNumber) {
      showToast('Seller WhatsApp number is not available', 'error');
      return;
    }
    const priceText = selectedProduct.listingType === 'buy'
      ? `Listed for Buy at ₹${selectedProduct.salePrice?.toLocaleString('en-IN')}`
      : selectedProduct.listingType === 'both'
        ? `Listed at ₹${selectedProduct.rentPricePerDay}/day or Buy at ₹${selectedProduct.salePrice?.toLocaleString('en-IN')}`
        : `Listed at ₹${selectedProduct.rentPricePerDay}/day`;
    const text = `Namaste! I am inquiring about "${selectedProduct.title}" (Brand: ${selectedProduct.brand}, Size: ${selectedProduct.size}, ${priceText}) on BGK WEAR. Please confirm availability for my wedding dates.`;
    openWhatsApp(sellerWhatsAppNumber, text);
  };

  const handleCallSeller = () => {
    if (!sellerPhoneNumber) {
      showToast('Seller phone number is not available', 'error');
      return;
    }
    openCall(sellerPhoneNumber);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const compressionPromises = Array.from(files).map((file: File) => compressImage(file, 600));
      const compressedPhotos = await Promise.all(compressionPromises);
      setReviewPhotos(prev => [...prev, ...compressedPhotos]);
    }
  };

  const removeReviewPhoto = (index: number) => {
    setReviewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsEditUploadingPhoto(true);
      try {
        const compressionPromises = Array.from(files).map((file: File) => compressImage(file, 600));
        const compressedPhotos = await Promise.all(compressionPromises);
        setEditReviewPhotos(prev => [...prev, ...compressedPhotos]);
        showToast('Photo added! Remember to save changes.', 'info');
      } catch (err) {
        showToast('Failed to process image. Please try another photo.', 'error');
      } finally {
        setIsEditUploadingPhoto(false);
      }
    }
  };

  const removeEditReviewPhoto = (index: number) => {
    setEditReviewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeletePhotoFromReviewDirect = (reviewId: string, photoIdx: number) => {
    if (!selectedProduct) return;
    const targetReview = selectedProduct.reviews?.find(r => r.id === reviewId);
    if (!targetReview) return;
    const currentPhotos = targetReview.photos || [];
    const updatedPhotos = currentPhotos.filter((_, idx) => idx !== photoIdx);
    updateReview(selectedProduct.id, reviewId, { photos: updatedPhotos });
    showToast('Photo deleted from review 🗑️', 'info');
  };

  const handleAddPhotoToReviewDirect = async (reviewId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProduct) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const targetReview = selectedProduct.reviews?.find(r => r.id === reviewId);
    if (!targetReview) return;

    try {
      showToast('Optimizing photo...', 'info');
      const compressionPromises = Array.from(files).map((file: File) => compressImage(file, 600));
      const compressedPhotos = await Promise.all(compressionPromises);
      const updatedPhotos = [...(targetReview.photos || []), ...compressedPhotos];
      updateReview(selectedProduct.id, reviewId, { photos: updatedPhotos });
      showToast('Photo added to review! 📸', 'success');
    } catch (err) {
      showToast('Failed to upload photo.', 'error');
    }
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      showToast('Please enter a review comment.', 'error');
      return;
    }

    setIsReviewSubmitting(true);
    
    try {
      await addReview(selectedProduct.id, {
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        fitFeedback: newReviewFit,
        occasion: newReviewOccasion,
        photos: reviewPhotos,
        userName: user?.name || 'Guest User',
        userAvatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'G U')}&background=random`,
        userCity: user?.city || 'India'
      });

      // Show success state
      setShowSuccessMessage(true);
      
      // Reset form after delay
      setTimeout(() => {
        setShowReviewModal(false);
        setShowSuccessMessage(false);
        setNewReviewComment('');
        setNewReviewRating(5);
        setReviewPhotos([]);
        setIsReviewSubmitting(false);
      }, 2000);

    } catch (error) {
      showToast('Failed to submit review. Please try again.', 'error');
      setIsReviewSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-0 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white sm:rounded-3xl border border-pink-100 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
        
        {/* Dedicated Stylish Top Header Bar with Glassmorphism */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-pink-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(159,32,137,0.04)]">
          
          {/* Left: Close & Owner Actions (Edit & Delete) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCloseModal}
              className="flex items-center justify-center gap-1.5 h-10 px-3.5 sm:px-4 rounded-full bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-[#9f2089] text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-200/80 hover:border-pink-200 shadow-2xs active:scale-95 shrink-0 group"
              title="Back to Feed"
              id="product-modal-back-btn"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700 group-hover:text-[#9f2089] group-hover:-translate-x-0.5 transition-all shrink-0" />
              <span className="font-extrabold">Back</span>
            </button>

            {/* Authentic Couture Guarantee Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 rounded-full border border-pink-200/70 text-[10px] font-black tracking-wider text-[#9f2089] uppercase shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#9f2089] animate-pulse" />
              <span>100% Authentic Luxury</span>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-1 border-l border-slate-200 shrink-0">
                <button
                  onClick={() => setEditingProduct(selectedProduct)}
                  className="flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#9f2089] text-xs font-black transition-all cursor-pointer active:scale-95 border border-pink-200/60 shadow-2xs shrink-0"
                  title="Edit Outfit"
                >
                  <Edit className="w-3.5 h-3.5 text-[#9f2089] shrink-0" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => requestDeleteProduct ? requestDeleteProduct(selectedProduct.id) : deleteProduct(selectedProduct.id)}
                  className="flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-all cursor-pointer active:scale-95 border border-rose-200/60 shadow-2xs shrink-0"
                  title="Remove Outfit"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Like, Report, Share */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('light');
                toggleWishlist(selectedProduct.id);
              }}
              className={`h-10 w-10 flex items-center justify-center rounded-full transition-all cursor-pointer border shadow-2xs active:scale-90 shrink-0 ${
                isWishlisted(selectedProduct.id)
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 border-rose-400 text-white shadow-md shadow-pink-500/25 ring-2 ring-pink-200'
                  : 'bg-white border-slate-200/80 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-200'
              }`}
              title={isWishlisted(selectedProduct.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
              id="product-modal-like-btn"
            >
              <Heart className={`w-4.5 h-4.5 transition-transform ${isWishlisted(selectedProduct.id) ? 'fill-white scale-110' : ''}`} />
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-amber-600 hover:bg-amber-50/60 hover:border-amber-200 transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0"
              title="Report Outfit"
              id="product-modal-report-btn"
            >
              <Flag className="w-4 h-4 text-amber-500 shrink-0" />
            </button>
            <button
              onClick={handleShare}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-[#9f2089] hover:bg-pink-50/60 hover:border-pink-200 transition-all cursor-pointer shadow-2xs active:scale-90 shrink-0"
              title="Share Listing"
              id="product-modal-share-btn"
            >
              <Share2 className="w-4.5 h-4.5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto no-scrollbar bg-white">
          
          {/* Top Section: High-End Fashion Gallery + Core Info Panel */}
          <div className="flex flex-col lg:flex-row">
            
            {/* Left: Framed High-Quality Gallery with Light Meesho Theme */}
            <div className="lg:w-7/12 relative bg-gradient-to-br from-pink-50/70 via-rose-50/40 to-purple-50/40 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-pink-100/80">
              
              {/* Main Photo Frame */}
              <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border-2 border-pink-200/90 shadow-[0_10px_30px_rgba(159,32,137,0.08)] group bg-white">
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={safeImages[activeImageIndex] || safeImages[0]}
                    alt={selectedProduct.title || 'Outfit'}
                    initial={{ opacity: 0, scale: 0.98, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98, x: -20 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      const threshold = 50;
                      if (info.offset.x < -threshold) {
                        setActiveImageIndex((prev) => (prev + 1) % safeImages.length);
                      } else if (info.offset.x > threshold) {
                        setActiveImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
                      }
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/offline-image-fallback.svg') {
                        target.src = '/offline-image-fallback.svg';
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-grab active:cursor-grabbing"
                  />
                </AnimatePresence>

                {/* Overlaid Badges (Meesho Style) */}
                <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-20 pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-slate-900 border border-pink-200/80 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{selectedProduct.rating || '4.9'}</span>
                    <span className="text-[10px] text-slate-400 font-bold">({selectedProduct.reviewsCount || 18})</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-[#9f2089]/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider shadow-sm w-fit">
                    Verified Cleaned
                  </div>
                </div>

                {/* Subtle Navigation Arrows */}
                {safeImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 border border-white shadow-md flex items-center justify-center transition-all cursor-pointer opacity-90 group-hover:opacity-100 hover:scale-105 active:scale-95"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft strokeWidth={2} className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % safeImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 border border-white shadow-md flex items-center justify-center transition-all cursor-pointer opacity-90 group-hover:opacity-100 hover:scale-105 active:scale-95"
                      aria-label="Next photo"
                    >
                      <ChevronRight strokeWidth={2} className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Zoom HD Overlay Button */}
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute bottom-3.5 right-3.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md text-slate-800 border border-white/80 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer z-10 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider"
                  id="product-zoom-btn"
                >
                  <ZoomIn strokeWidth={2} className="w-3.5 h-3.5 text-[#9f2089]" />
                  <span>HD Zoom</span>
                </button>
              </div>

              {/* High-Fashion Thumbnail Carousel Tray */}
              {safeImages.length > 1 && (
                <div className="w-full max-w-md mt-4 flex items-center justify-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {safeImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-2 border-[#9f2089] ring-3 ring-pink-300/60 scale-105 shadow-md'
                          : 'border border-pink-100 opacity-60 hover:opacity-100 hover:border-pink-300'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      {activeImageIndex === idx && (
                        <div className="absolute inset-0 bg-[#9f2089]/10 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Specifications & Pricing - Compact & Ultra-Attractive */}
            <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between bg-white">
              
              <div className="space-y-5">
                {/* Brand & Designer Header with Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#9f2089] bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/70 px-3 py-1 rounded-full shadow-2xs">
                    <Crown className="w-3.5 h-3.5 text-[#9f2089]" />
                    <span>{selectedProduct.brand || 'Luxury Designer'}</span>
                  </div>

                  {/* High-Trust Green Rating Pill (Meesho Style) */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs">
                    <span>{selectedProduct.rating || '4.9'}</span>
                    <Star strokeWidth={2.5} className="w-3 h-3 fill-current" />
                    <span className="text-[10px] text-emerald-100 font-semibold border-l border-emerald-500 pl-1.5">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Title - Elegant & High Impact */}
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 leading-snug tracking-tight">
                  {selectedProduct.title}
                </h1>

                {/* Price Matrix - Vibrant Meesho Style */}
                <div className={`grid ${selectedProduct.listingType === 'both' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  {/* Rent Per Day - Light Pink / Vibrant Accent */}
                  {selectedProduct.listingType !== 'buy' && (
                    <div className="p-4 rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50/70 to-pink-100/60 border-2 border-pink-200 shadow-xs flex flex-col justify-between relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#9f2089]">Rent Per Day</span>
                        <span className="text-[9px] font-black uppercase tracking-wide text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          Save 85%
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-[#6d052a]">
                          ₹{selectedProduct.rentPricePerDay.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-slate-500">/day</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">
                        3-Day Wedding Rental: ₹{(selectedProduct.rentPricePerDay * 3).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  {/* Buy Outright - Bold Luxury Magenta / Gold Accent */}
                  {selectedProduct.listingType !== 'rent' && selectedProduct.salePrice && (
                    <div className="p-4 rounded-3xl bg-gradient-to-br from-[#73032d] via-[#8c0839] to-[#50001d] text-white shadow-md flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-pink-200">Buy Outright</span>
                        <span className="text-[9px] font-black uppercase tracking-wide bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                          Own Forever
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-amber-300">
                          ₹{selectedProduct.salePrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] line-through text-pink-200/60 font-semibold">
                          ₹{(selectedProduct.salePrice * 3).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-pink-100/80 mt-1">
                        Pre-loved authentic designer wear
                      </p>
                    </div>
                  )}
                </div>

                {/* Attributes Highlights Grid (Size, Deposit, Delivery, Hygiene) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl border border-pink-100 bg-pink-50/40 flex flex-col gap-0.5">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Size & Fit</span>
                    <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1">
                      {selectedProduct.size}
                      <span className="text-[9px] font-normal text-slate-500 lowercase">(alterable)</span>
                    </span>
                  </div>
                  {selectedProduct.listingType !== 'buy' ? (
                    <div className="p-3 rounded-2xl border border-pink-100 bg-pink-50/40 flex flex-col gap-0.5">
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Security Deposit</span>
                      <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        ₹{selectedProduct.securityDeposit.toLocaleString('en-IN')}
                        <span className="text-[9px] text-emerald-600 font-bold">✓ 100% Refundable</span>
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl border border-pink-100 bg-pink-50/40 flex flex-col gap-0.5">
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Quality Status</span>
                      <span className="text-xs font-black text-emerald-700">Verified Authentic</span>
                    </div>
                  )}
                  <div className="p-3 rounded-2xl border border-pink-100 bg-pink-50/40 flex flex-col gap-0.5">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Hygiene Promise</span>
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#9f2089]" />
                      UV Sanitized
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl border border-pink-100 bg-pink-50/40 flex flex-col gap-0.5">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Location</span>
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {selectedProduct.city || safeSeller.city || 'Available Locally'}
                    </span>
                  </div>
                </div>

                {/* Instant Booking Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    {selectedProduct.listingType !== 'buy' && (
                      <button
                        onClick={() => setActiveModal('rentalCheckout')}
                        className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#9f2089] via-[#b31b99] to-[#c2185b] hover:from-[#80146f] hover:to-[#9f2089] text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition-all cursor-pointer active:scale-95"
                        id="product-modal-rent-now-btn"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Book Rental Now</span>
                      </button>
                    )}

                    {selectedProduct.listingType !== 'rent' && selectedProduct.salePrice && (
                      <button
                        onClick={() => setActiveModal('buyCheckout')}
                        className="flex-1 py-3.5 px-4 bg-gradient-to-r from-slate-900 to-[#50001d] hover:bg-slate-800 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all cursor-pointer active:scale-95"
                        id="product-modal-buy-now-btn"
                      >
                        <Crown className="w-4 h-4 text-amber-300" />
                        <span>Buy Outright</span>
                      </button>
                    )}
                  </div>

                  {/* Direct WhatsApp & Call Curator Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleWhatsAppChat}
                      className="py-3 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 relative overflow-hidden"
                      id="product-modal-whatsapp-btn"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-ping absolute top-2 right-2" />
                      <MessageCircle strokeWidth={2.5} className="w-4 h-4" />
                      <span>WhatsApp Seller</span>
                    </button>
                    <button
                      onClick={handleCallSeller}
                      className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-slate-900/20 transition-all cursor-pointer active:scale-95"
                      id="product-modal-call-btn"
                    >
                      <Phone strokeWidth={2.5} className="w-4 h-4" />
                      <span>Call Curator</span>
                    </button>
                  </div>
                </div>

                {/* Description Snippet */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                    "{selectedProduct.description}"
                  </p>
                </div>
              </div>
            </div>
          </div>



          {/* Seller & Location Section - Soft Light Theme Card with Dynamic Location */}
          <div className="p-6 sm:p-8 bg-white border-b border-pink-100/80">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-pink-50/40 via-rose-50/20 to-purple-50/30 border border-pink-200/80 shadow-xs">
              
              {/* Seller Grid Info */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative">
                  <img
                    src={safeSeller.avatar}
                    alt={safeSeller.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-pink-200"
                  />
                  {safeSeller.isVerified && (
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-amber-400 text-slate-950 shadow-sm border border-white">
                      <Crown strokeWidth={2.5} className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-serif font-black text-slate-900 leading-tight">{safeSeller.name}</h4>
                    {safeSeller.isVerified && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        <Crown className="w-3 h-3 fill-amber-500" />
                        Verified Curator
                      </span>
                    )}
                  </div>
                  
                  {/* Dynamic City & State Highlighted */}
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[#9f2089] bg-pink-100/90 px-3 py-1 rounded-xl font-black tracking-wide border border-pink-200 shadow-2xs">
                      <MapPin strokeWidth={2.5} className="w-3.5 h-3.5 text-[#9f2089]" />
                      {selectedProduct.city || safeSeller.city || 'Surat'}, {selectedProduct.state || safeSeller.state || 'Gujarat'}
                    </span>
                    <span className="text-slate-500 font-semibold">• {safeSeller.totalReviews || 12} Verified Reviews</span>
                  </div>
                </div>
              </div>

              {/* Compact Seller Stats & Quick Contact */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex bg-white p-3 rounded-2xl border border-pink-100 shadow-2xs divide-x divide-pink-100">
                  <div className="text-center px-3.5">
                    <div className="text-base font-black text-slate-900 flex items-center justify-center gap-1">
                      <span>4.9</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Curator Rating</div>
                  </div>
                  <div className="text-center px-3.5">
                    <div className="text-base font-black text-slate-900">{safeSeller.totalListings}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Closet Items</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews & Ratings Section - Meesho Style */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-serif font-black text-slate-900">Customer Reviews</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                    Verified
                  </span>
                </div>
                
                <div className="flex items-start gap-6">
                  {/* Big Number */}
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-slate-900 leading-none">{selectedProduct.rating ?? 0}</span>
                    <div className="flex items-center gap-0.5 mt-2 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= (selectedProduct.rating ?? 0) ? 'fill-slate-900 text-slate-900' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedProduct.reviewsCount ?? 0} Reviews</span>
                  </div>

                  {/* Bars Breakdown */}
                  <div className="flex-1 max-w-[200px] space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const allReviews = selectedProduct.reviews || [];
                      const count = allReviews.filter(r => Math.round(r.rating) === star).length;
                      const total = Math.max(allReviews.length, 1);
                      const percentage = (count / total) * 100;
                      
                      return (
                        <div key={star} className="flex items-center gap-2 text-[10px] text-slate-600 font-bold">
                          <span className="w-1.5">{star}</span>
                          <Star className="w-2.5 h-2.5 text-slate-400" />
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-4 text-right text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end justify-center">
                <button
                  onClick={() => setShowReviewModal(!showReviewModal)}
                  className="px-6 py-3.5 rounded-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shadow-md"
                  id="product-write-review-btn"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* Smart Real Customer Photos Reel (Meesho Style) */}
            {(selectedProduct.reviews || []).some(r => r.photos && r.photos.length > 0) && (
              <div className="p-4 rounded-3xl bg-pink-50/40 border border-pink-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#9f2089]" />
                    Real Outfit Photos from Renters
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {(selectedProduct.reviews || []).flatMap(r => r.photos || []).length} Photos
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {(selectedProduct.reviews || [])
                    .flatMap(r => r.photos || [])
                    .slice(0, 6)
                    .map((photo, idx) => {
                      const totalPhotos = (selectedProduct.reviews || []).flatMap(r => r.photos || []).length;
                      const isLast = idx === 5 && totalPhotos > 6;
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setShowAllReviewsOverlay(true)}
                          className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-2xs border border-pink-100"
                        >
                          <img src={photo} alt="Customer Review" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          {isLast && (
                            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                              <span className="text-white font-black text-sm">+{totalPhotos - 6}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Add Review Inline Form - Premium & Animated */}
            <AnimatePresence>
              {showReviewModal && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleAddReviewSubmit} className="mb-6 p-6 sm:p-8 rounded-none border border-slate-200 bg-white shadow-sm space-y-6">
                    {showSuccessMessage ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-16 h-16 bg-slate-900 rounded-none flex items-center justify-center text-white"
                        >
                          <CheckCircle className="w-8 h-8" />
                        </motion.div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase">Review Submitted</h4>
                          <p className="text-sm text-slate-500 mt-2 font-medium">Thank you for sharing your experience. Your review helps others make better choices.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-4">Write A Review</h4>
                        
                        <div className="space-y-4 pt-2">
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">Overall Rating *</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setNewReviewRating(star)}
                                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                                  title={`Rate ${star} star`}
                                >
                                  <Star className={`w-8 h-8 ${star <= newReviewRating ? 'fill-slate-900 text-slate-900' : 'text-slate-200 hover:text-slate-300'}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">Review *</label>
                              <textarea
                                rows={4}
                                value={newReviewComment}
                                onChange={(e) => setNewReviewComment(e.target.value)}
                                placeholder="What did you like or dislike? How was the fit?"
                                className="w-full bg-slate-50 border border-slate-200 rounded-none p-4 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all outline-none font-medium placeholder:text-slate-400"
                                required
                              />
                            </div>

                            {/* Photo Upload Flow */}
                            <div className="space-y-3">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">Add Photos (Optional)</label>
                              <div className="flex flex-wrap gap-3">
                                {reviewPhotos.map((photo, idx) => (
                                  <div key={idx} className="relative w-20 h-20 bg-slate-50 border border-slate-200 overflow-hidden">
                                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => removeReviewPhoto(idx)}
                                      className="absolute top-1 right-1 p-1 bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {reviewPhotos.length < 5 && (
                                  <label className="w-20 h-20 border border-dashed border-slate-300 hover:border-slate-900 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-slate-50 group hover:bg-slate-100">
                                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 uppercase">Add</span>
                                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 mt-6">
                            <button
                              type="button"
                              onClick={() => setShowReviewModal(false)}
                              className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isReviewSubmitting}
                              className={`px-8 py-3 bg-slate-900 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-all hover:bg-slate-800 active:scale-95 ${isReviewSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {isReviewSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reviews List - Compact & Premium */}
            {(!(selectedProduct.reviews || []) || (selectedProduct.reviews || []).length === 0) ? (
              <div className="p-10 rounded-3xl bg-pink-50/30 border border-pink-100 text-center space-y-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xs text-[#9f2089]">
                  <Star className="w-6 h-6 fill-pink-100 text-[#9f2089]" />
                </div>
                <p className="text-xs text-slate-600 font-bold">Be the first to share your wedding look!</p>
                <p className="text-[11px] text-slate-400">Rent this outfit and leave a photo review to inspire others.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(selectedProduct.reviews || []).map((rev) => (
                  <div key={rev.id} className="p-4 sm:p-5 rounded-3xl bg-white border border-pink-100 hover:border-pink-200 transition-all shadow-2xs space-y-3.5">
                    {/* Review Header: User details on left, Edit & Delete actions on right */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-2.5 border-b border-slate-100/80">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img 
                          src={rev.userAvatar} 
                          alt={rev.userName} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-pink-100 shadow-2xs shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-xs font-black text-slate-900 truncate max-w-[140px] sm:max-w-none">{rev.userName}</span>
                            <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
                              Verified Renter
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-slate-400">
                            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-2.5 h-2.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                              {rev.date} • {rev.userCity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit & Delete Action Buttons - Dedicated non-overlapping container */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center ml-auto sm:ml-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReviewId(rev.id);
                            setEditReviewComment(rev.comment);
                            setEditReviewRating(rev.rating);
                            setEditReviewFit(rev.fitFeedback || 'True to Size');
                            setEditReviewPhotos(rev.photos ? [...rev.photos] : []);
                          }}
                          className="p-2 text-slate-500 hover:text-[#9f2089] bg-slate-50 hover:bg-pink-50 rounded-full transition-all cursor-pointer border border-slate-200 hover:border-pink-200 shrink-0 shadow-2xs active:scale-95"
                          title="Edit your review"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteReview(selectedProduct.id, rev.id)}
                          className="p-2 text-red-500 hover:text-white bg-red-50/70 hover:bg-red-600 rounded-full transition-all cursor-pointer border border-red-100 hover:border-red-600 shrink-0 shadow-2xs active:scale-95"
                          title="Delete your review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingReviewId === rev.id ? (
                      <div className="space-y-4 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rating:</span>
                            <div className="flex items-center gap-1 text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setEditReviewRating(star)}
                                  className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
                                >
                                  <Star className={`w-4 h-4 ${star <= editReviewRating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fit:</span>
                            <select
                              value={editReviewFit}
                              onChange={(e) => setEditReviewFit(e.target.value as any)}
                              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#9f2089]"
                            >
                              <option value="True to Size">True to Size</option>
                              <option value="Runs Small">Runs Small</option>
                              <option value="Runs Large">Runs Large</option>
                              <option value="Perfect Custom Fit">Perfect Custom Fit</option>
                            </select>
                          </div>
                        </div>

                        <textarea
                          value={editReviewComment}
                          onChange={(e) => setEditReviewComment(e.target.value)}
                          rows={3}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#9f2089] text-slate-800 font-medium bg-slate-50/50"
                          placeholder="Update your review..."
                        />

                        {/* Photo Management in Edit Review */}
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-[#9f2089]" />
                              Review Photos ({editReviewPhotos.length})
                            </span>
                            {editReviewPhotos.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setEditReviewPhotos([])}
                                className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                              >
                                Delete All Photos
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2.5 items-center py-1">
                            {editReviewPhotos.map((photo, pIdx) => (
                              <div key={pIdx} className="relative w-18 h-22 rounded-2xl overflow-hidden border border-pink-200 shadow-2xs group shrink-0 bg-slate-50">
                                <img src={photo} alt={`Review photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeEditReviewPhoto(pIdx)}
                                  title="Delete this photo"
                                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 active:scale-90 transition-all shadow-md cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {editReviewPhotos.length < 5 && (
                              <label className="w-18 h-22 rounded-2xl border-2 border-dashed border-pink-200 hover:border-[#9f2089] bg-pink-50/30 hover:bg-pink-50/70 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors group shrink-0">
                                <Plus className="w-5 h-5 text-[#9f2089] group-hover:scale-110 transition-transform" />
                                <span className="text-[8px] font-black text-[#9f2089] uppercase tracking-wider text-center px-1">
                                  {isEditUploadingPhoto ? 'Adding...' : 'Add Photo'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  disabled={isEditUploadingPhoto}
                                  onChange={handleEditPhotoUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Save & Cancel Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateReview(selectedProduct.id, rev.id, {
                                comment: editReviewComment,
                                rating: editReviewRating,
                                fitFeedback: editReviewFit,
                                photos: editReviewPhotos
                              });
                              setEditingReviewId(null);
                              setEditReviewPhotos([]);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#9f2089] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#851671] transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-95 shrink-0"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReviewId(null);
                              setEditReviewPhotos([]);
                            }}
                            className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-700 leading-relaxed font-normal break-words">"{rev.comment}"</p>
                        
                        {rev.photos && rev.photos.length > 0 ? (
                          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 items-center">
                            {rev.photos.map((p, i) => (
                              <div key={i} className="relative w-18 h-22 rounded-2xl overflow-hidden border border-pink-100 shadow-2xs group/photo shrink-0 bg-slate-50">
                                <img 
                                  src={p} 
                                  alt="Customer Review Photo" 
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-all" 
                                  onClick={() => {
                                    setSelectedReviewForOverlay(rev);
                                    setShowAllReviewsOverlay(true);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhotoFromReviewDirect(rev.id, i);
                                  }}
                                  title="Delete this photo"
                                  className="absolute top-1 right-1 w-6 h-6 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95 z-10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {/* Direct Add Photo button */}
                            <label 
                              className="w-18 h-22 rounded-2xl border-2 border-dashed border-pink-200 hover:border-[#9f2089] bg-pink-50/40 hover:bg-pink-50/80 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shrink-0 group"
                              title="Add photo to this review"
                            >
                              <Plus className="w-4 h-4 text-[#9f2089] group-hover:scale-110 transition-transform" />
                              <span className="text-[8px] font-black text-[#9f2089] uppercase tracking-wider text-center">Add Photo</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => handleAddPhotoToReviewDirect(rev.id, e)} 
                                className="hidden" 
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="pt-1">
                            <label 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-pink-300 hover:border-[#9f2089] bg-pink-50/40 hover:bg-pink-50/80 text-[10px] font-bold text-[#9f2089] cursor-pointer transition-all w-fit group shrink-0"
                            >
                              <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              <span>+ Add Photo to Review</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => handleAddPhotoToReviewDirect(rev.id, e)} 
                                className="hidden" 
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {(selectedProduct.reviews || []).length > 3 && (
                  <button 
                    onClick={() => setShowAllReviewsOverlay(true)}
                    className="w-full py-3.5 rounded-2xl bg-slate-50 hover:bg-pink-50 text-[10px] font-black uppercase tracking-wider text-[#9f2089] transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-100"
                  >
                    <span>View All {(selectedProduct.reviews || []).length} Reviews</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div className="border-t border-slate-200 pt-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#9f2089] text-xs font-black uppercase tracking-wider">
                    Curated Alternatives
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Similar Designer Outfits
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {similarProducts.map((simProd, index) => (
                  <ProductCard key={`${simProd.id}-${index}`} product={simProd} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Fullscreen HD Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            title="Close Zoom"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <PinchZoomViewer
              src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
              alt={selectedProduct.title}
            />

            {/* Previous image */}
            {selectedProduct.images.length > 1 && (
              <button
                onClick={() =>
                  setActiveImageIndex(
                    (prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length
                  )
                }
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next image */}
            {selectedProduct.images.length > 1 && (
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length)
                }
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            {selectedProduct.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-12 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx ? 'border-[#9f2089] scale-110' : 'border-white/20 opacity-50'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Reviews & Photos Overlay - Meesho Style */}
      {showAllReviewsOverlay && (
        <div className="fixed inset-0 z-[110] bg-slate-50 flex items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-serif text-slate-900">User Photos & Reviews</h3>
              <button 
                onClick={() => setShowAllReviewsOverlay(false)}
                className="p-2 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar space-y-6">
              {/* Filter / Photo Grid Section */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Customer Photos</span>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {(selectedProduct.reviews || []).flatMap(r => (r.photos || []).map((photo, pIdx) => ({ photo, reviewId: r.id, pIdx }))).map((item, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group">
                      <img src={item.photo} alt="Customer" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeletePhotoFromReviewDirect(item.reviewId, item.pIdx)}
                        title="Delete photo"
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow transition-all cursor-pointer opacity-90 hover:opacity-100 hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Reviews List */}
              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Feedback</span>
                {(selectedProduct.reviews || []).map((rev) => (
                  <div key={rev.id} className="space-y-4 border-b border-slate-100 pb-6 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={rev.userAvatar} alt={rev.userName} className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-2">
                            <span className="truncate max-w-[140px] sm:max-w-none">{rev.userName}</span>
                            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span className="text-[10px] text-slate-700">{rev.rating}</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">{rev.date} • {rev.userCity}</p>
                        </div>
                      </div>

                      {/* Edit & Delete Actions in Overlay - Clean & Isolated */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center ml-auto sm:ml-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAllReviewsOverlay(false);
                            setEditingReviewId(rev.id);
                            setEditReviewComment(rev.comment);
                            setEditReviewRating(rev.rating);
                            setEditReviewFit(rev.fitFeedback || 'True to Size');
                            setEditReviewPhotos(rev.photos ? [...rev.photos] : []);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:text-[#9f2089] bg-slate-50 hover:bg-pink-50 rounded-xl transition-all cursor-pointer border border-slate-200 hover:border-pink-200 shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
                          title="Edit your review"
                        >
                          <Edit className="w-3 h-3 text-[#9f2089]" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteReview(selectedProduct.id, rev.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:text-white bg-red-50/70 hover:bg-red-600 rounded-xl transition-all cursor-pointer border border-red-100 hover:border-red-600 shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
                          title="Delete your review"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pl-0 sm:pl-13">
                      <p className="text-xs text-slate-600 leading-relaxed font-normal break-words">"{rev.comment}"</p>
                      
                      {rev.photos && rev.photos.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar items-center py-1">
                          {rev.photos.map((p, i) => (
                            <div key={i} className="relative w-20 h-26 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50 group">
                              <img 
                                src={p} 
                                alt="Customer" 
                                className="w-full h-full object-cover" 
                              />
                              <button
                                type="button"
                                onClick={() => handleDeletePhotoFromReviewDirect(rev.id, i)}
                                title="Delete this photo"
                                className="absolute top-1 right-1 w-6 h-6 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95 z-10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <label 
                            className="w-20 h-26 rounded-xl border-2 border-dashed border-pink-200 hover:border-[#9f2089] bg-pink-50/40 hover:bg-pink-50/80 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shrink-0 group"
                            title="Add photo to this review"
                          >
                            <Plus className="w-4 h-4 text-[#9f2089] group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black text-[#9f2089] uppercase tracking-wider text-center">Add Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple 
                              onChange={(e) => handleAddPhotoToReviewDirect(rev.id, e)} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <label 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-pink-300 hover:border-[#9f2089] bg-pink-50/40 hover:bg-pink-50/80 text-[10px] font-bold text-[#9f2089] cursor-pointer transition-all w-fit group shrink-0"
                          >
                            <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span>+ Add Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple 
                              onChange={(e) => handleAddPhotoToReviewDirect(rev.id, e)} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Fit: <span className="text-slate-900">{rev.fitFeedback}</span></span>
                        <span>Occasion: <span className="text-slate-900">{rev.occasion}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-50">
              <button 
                onClick={() => setShowAllReviewsOverlay(false)}
                className="w-full py-3 bg-[#6d052a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#6d052a]/20"
              >
                Back to Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Listing Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Report Listing</span>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Help us keep the BGK WEAR couture marketplace authentic, verified, and secure. Why are you reporting this outfit?
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-2">
                {[
                  'Inaccurate Details / Misrepresented Size',
                  'Potential Counterfeit / Replica',
                  'Unreasonable Security Deposit or Fee',
                  'Inappropriate Photos or Content',
                  'Seller Unresponsive / Suspicious Behavior',
                  'Other Policy Violation'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      reportReason === reason
                        ? 'bg-pink-50 border-[#9f2089] text-[#9f2089] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="accent-[#9f2089]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 font-bold hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
