import { Product, UserProfile } from '../types';

/**
 * Checks if the currently logged-in user is the owner/creator of the given outfit listing.
 * Validates against product.userId, product.createdBy, product.sellerId, product.seller.id,
 * with fallbacks to verified user phone/email.
 */
export function isOutfitOwner(product?: Product | null, currentUser?: UserProfile | null): boolean {
  if (!product || !currentUser || !currentUser.id) {
    return false;
  }

  const currentUserId = String(currentUser.id).trim();

  // 1. Direct match on listing.userId
  if (product.userId && String(product.userId).trim() === currentUserId) {
    return true;
  }

  // 2. Direct match on listing.createdBy
  if (product.createdBy && String(product.createdBy).trim() === currentUserId) {
    return true;
  }

  // 3. Direct match on listing.sellerId
  if (product.sellerId && String(product.sellerId).trim() === currentUserId) {
    return true;
  }

  // 4. Direct match on listing.seller.id
  if (product.seller?.id && String(product.seller.id).trim() === currentUserId) {
    return true;
  }

  // 5. Match by verified user phone number (digits only comparison)
  if (currentUser.phone && product.seller?.phone) {
    const cleanUserPhone = currentUser.phone.replace(/\D/g, '');
    const cleanSellerPhone = product.seller.phone.replace(/\D/g, '');
    if (cleanUserPhone.length >= 10 && cleanUserPhone === cleanSellerPhone) {
      return true;
    }
  }

  // 6. Match by user WhatsApp number (digits only comparison)
  if (currentUser.whatsapp && product.seller?.whatsapp) {
    const cleanUserWA = currentUser.whatsapp.replace(/\D/g, '');
    const cleanSellerWA = product.seller.whatsapp.replace(/\D/g, '');
    if (cleanUserWA.length >= 10 && cleanUserWA === cleanSellerWA) {
      return true;
    }
  }

  // 7. Match by user email if available
  if (currentUser.email && product.seller?.phone && currentUser.email.toLowerCase() === product.seller.phone.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Determines if a user can edit or delete a listing (owner or admin).
 */
export function canManageListing(product?: Product | null, currentUser?: UserProfile | null): boolean {
  if (!product || !currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return isOutfitOwner(product, currentUser);
}
