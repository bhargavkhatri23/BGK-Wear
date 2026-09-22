import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isOutfitOwner } from '../utils/permissionUtils';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const DeleteOutfitConfirmModal: React.FC = () => {
  const { 
    productToDelete, 
    setProductToDelete, 
    deleteProduct, 
    user, 
    showToast 
  } = useApp();

  useDynamicSEO(
    productToDelete
      ? {
          title: `Delete Listing: ${productToDelete.title} | BGK WEAR`,
          description: `Manage and remove your listing for ${productToDelete.title} from BGK WEAR marketplace.`,
          type: 'website'
        }
      : null
  );

  const [isDeleting, setIsDeleting] = useState(false);

  if (!productToDelete) return null;

  const isOwner = isOutfitOwner(productToDelete, user) || user.role === 'admin';

  const handleConfirmDelete = async () => {
    if (!isOwner) {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      setProductToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      showToast('Failed to delete listing. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setProductToDelete(null);
    }
  };

  const thumbnail = Array.isArray(productToDelete.images) && productToDelete.images.length > 0
    ? productToDelete.images[0]
    : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50"
        onClick={handleClose}
        id="delete-confirmation-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
          id="delete-confirmation-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            id="close-delete-modal-btn"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Warning Icon Badge */}
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-xs">
            <Trash2 className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* Title and Description */}
          <div className="text-center mb-5">
            <h3 
              id="delete-modal-title"
              className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-2"
            >
              Delete Outfit Listing?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Are you sure you want to permanently remove this outfit from your wardrobe? This action cannot be undone.
            </p>
          </div>

          {/* Product Preview Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
            <img 
              src={thumbnail} 
              alt={productToDelete.title} 
              className="w-16 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#9f2089] bg-[#9f2089]/15 px-2 py-0.5 rounded-full mb-1">
                {productToDelete.category}
              </span>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {productToDelete.title}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                Brand: <span className="font-semibold text-slate-800">{productToDelete.brand}</span> • Size {productToDelete.size}
              </p>
              <p className="text-xs font-black text-[#9f2089] mt-1">
                ₹{productToDelete.rentPricePerDay.toLocaleString('en-IN')}/day
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              id="cancel-delete-outfit-btn"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-slate-900 text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              id="confirm-delete-outfit-btn"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
