import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Product, 
  UserProfile, 
  RentalBooking, 
  PurchaseOrder, 
  AppNotification, 
  FilterState, 
  WeddingStory, 
  Review,
  Seller,
  ChatMessage,
  ChatConversation,
  ChatOfferData
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_USER, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_STORIES 
} from '../data/mockData';
import { isOutfitOwner } from '../utils/permissionUtils';
import { 
  subscribeToProducts, 
  createProductDoc, 
  updateProductDoc, 
  deleteProductDoc, 
  seedInitialProductsIfEmpty,
  incrementProductStat,
  saveUserProfileDoc,
  subscribeToUserProfile,
  subscribeToUserWishlist,
  addToWishlistDoc,
  removeFromWishlistDoc,
  createRentalBookingDoc,
  subscribeToUserRentals,
  createPurchaseOrderDoc,
  addReviewDoc,
  createNotificationDoc,
  subscribeToUserNotifications,
  updateNotificationStatusDoc,
  subscribeToUserChats,
  getOrCreateChatConversation,
  subscribeToChatMessages,
  sendChatMessage,
  markChatAsRead,
  setTypingStatus,
  archiveChatDoc,
  blockUserChatDoc,
  deleteChatConversationDoc,
  respondToChatOfferDoc,
  subscribeToSellerRentals,
  subscribeToSellerPurchases,
  updateRentalOrderStatus,
  updatePurchaseOrderStatus
} from '../services/firestoreService';
import { uploadListingImage } from '../services/storageService';
import { compressImage } from '../services/imageService';
import { matchProductWithFuzzySearch } from '../utils/fuzzySearchUtils';
import { 
  subscribeToAuthState, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser,
  loginAnonymously
} from '../services/authService';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  CURRENT_APP_VERSION, 
  AppVersionInfo, 
  fetchLatestAppVersion, 
  isNewerVersion, 
  isVersionDismissed, 
  markVersionDismissed 
} from '../services/versionService';
import {
  cacheWishlistForOffline,
  getCachedWishlistProducts,
  isDeviceOnline
} from '../services/offlineCacheService';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'All',
  listingType: 'all',
  city: 'All Cities',
  minRentPrice: 0,
  maxRentPrice: 25000,
  minSalePrice: 0,
  maxSalePrice: 300000,
  sizes: [],
  colors: [],
  fabrics: [],
  brands: [],
  conditions: [],
  availabilityOnly: false,
  sortBy: 'featured'
};

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  isOnboarded: boolean;
  completeOnboarding: (data: { 
    name: string; 
    phone: string; 
    whatsapp: string; 
    email: string; 
    state: string; 
    district: string; 
    pincode: string;
  }) => Promise<void>;
  resetOnboarding: () => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  products: Product[];
  wishlist: string[];
  rentalBookings: RentalBooking[];
  purchaseOrders: PurchaseOrder[];
  sellerRentalBookings: RentalBooking[];
  sellerPurchaseOrders: PurchaseOrder[];
  notifications: AppNotification[];
  stories: WeddingStory[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  activeTab: 'home' | 'explore' | 'sell' | 'wishlist' | 'profile' | 'admin' | 'chat' | 'orders';
  setActiveTab: (tab: 'home' | 'explore' | 'sell' | 'wishlist' | 'profile' | 'admin' | 'chat' | 'orders') => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  productToDelete: Product | null;
  setProductToDelete: (product: Product | null) => void;
  requestDeleteProduct: (product: Product) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  activeStory: WeddingStory | null;
  setActiveStory: (story: WeddingStory | null) => void;
  targetSeller: Seller | null;
  setTargetSeller: (seller: Seller | null) => void;
  targetProduct: Product | null;
  setTargetProduct: (product: Product | null) => void;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Real-time Chat
  chats: ChatConversation[];
  activeChatId: string | null;
  activeChat: ChatConversation | null;
  activeChatMessages: ChatMessage[];
  totalUnreadChats: number;
  openChatWithSeller: (seller: Seller, product?: Product) => Promise<ChatConversation>;
  setActiveChatId: (id: string | null) => void;
  sendTextMessage: (text: string) => Promise<ChatMessage | null>;
  sendImageMessage: (fileOrDataUrl: File | string) => Promise<ChatMessage | null>;
  sendOffer: (offerData: ChatOfferData) => Promise<ChatMessage | null>;
  respondToOffer: (messageId: string, status: 'accepted' | 'declined' | 'countered', counterPrice?: number) => Promise<void>;
  markActiveChatRead: (chatId: string) => Promise<void>;
  setChatTyping: (chatId: string, isTyping: boolean) => Promise<void>;
  archiveChat: (chatId: string, isArchived: boolean) => Promise<void>;
  blockUserChat: (chatId: string, isBlocked: boolean) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;

  // Actions
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<Product | null>;
  updateProductStatus: (productId: string, status: Product['status']) => void;
  deleteProduct: (productId: string) => Promise<void>;
  createRentalBooking: (booking: Omit<RentalBooking, 'id' | 'bookingDate' | 'status' | 'depositRefundStatus'>) => Promise<RentalBooking>;
  createPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'orderDate' | 'status'>) => Promise<PurchaseOrder>;
  updateRentalStatus: (bookingId: string, status: RentalBooking['status'], depositRefundStatus?: RentalBooking['depositRefundStatus'], trackingNumber?: string) => Promise<void>;
  updatePurchaseStatus: (orderId: string, status: PurchaseOrder['status'], trackingNumber?: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  handleNotificationAction: (id: string, action: 'accepted' | 'declined') => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'date' | 'likes'>) => void;
  updateReview: (productId: string, reviewId: string, updatedData: Partial<Review>) => void;
  deleteReview: (productId: string, reviewId: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setUserRole: (role: 'buyer' | 'seller' | 'admin') => void;
  openWhatsApp: (phone: string, message: string) => void;
  openCall: (phone: string) => void;
  
  // Auth Actions
  saveProfileCompletion: (data: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInAnonymouslyFallback: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;

  // In-App Version & Updates
  currentAppVersion: string;
  showUpdateModal: boolean;
  setShowUpdateModal: (show: boolean) => void;
  updateInfo: AppVersionInfo | null;
  isCheckingUpdate: boolean;
  checkForUpdates: (manual?: boolean) => Promise<void>;
  dismissUpdate: () => void;

  filteredProducts: Product[];

  // Offline & PWA Wishlist Support
  isOffline: boolean;
  syncOfflineWishlist: () => Promise<void>;
  cachedWishlistProducts: Product[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Checks whether the user's mandatory profile fields are completed:
 * Full Name, Mobile Number, WhatsApp Number, Full Address, City/District, State, and PIN code.
 */
export function isUserProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.isGuest) return true; // Guest browsing can bypass until checkout/listing
  if (profile.isProfileComplete === true) return true;

  const hasValidName = Boolean(
    profile.name && 
    profile.name.trim().length >= 2 && 
    profile.name.trim() !== 'BGK Customer' && 
    profile.name.trim() !== 'Guest Explorer' &&
    profile.name.trim() !== 'New User'
  );

  const cleanPhone = (profile.phone || '').replace(/\D/g, '');
  const hasValidPhone = cleanPhone.length >= 10;

  const cleanWhatsapp = (profile.whatsapp || '').replace(/\D/g, '');
  const hasValidWhatsapp = cleanWhatsapp.length >= 10;

  const hasValidAddress = Boolean(
    profile.address && 
    profile.address.trim().length >= 5
  );

  const city = (profile.city || profile.district || '').trim();
  const hasValidCity = Boolean(
    city && 
    city.length >= 2 && 
    city.toLowerCase() !== 'all cities'
  );

  const hasValidState = Boolean(
    profile.state && 
    profile.state.trim().length >= 2
  );

  const cleanPin = (profile.pincode || '').replace(/\D/g, '');
  const hasValidPincode = cleanPin.length === 6;

  return Boolean(
    hasValidName && 
    hasValidPhone && 
    hasValidWhatsapp && 
    hasValidAddress && 
    hasValidCity && 
    hasValidState && 
    hasValidPincode
  );
}

// Hard localStorage reset on load to guarantee 100% clean wipe of any cached or dummy listings
try {
  
  
} catch (e) {
  // safe fallback
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Onboarding & First-time Login Check
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      const savedProfile = localStorage.getItem('bgk_wear_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.name) return true;
      }
    } catch {}
    
    // Automatically set onboarded to true so app opens directly to main screen
    try {
      const guestProfile: UserProfile = {
        ...INITIAL_USER,
        id: 'usr-' + Date.now(),
        name: 'BGK Fashion Guest',
        phone: '+91 98765 43210',
        district: 'Mumbai',
        state: 'Maharashtra',
        joinedDate: 'Joined Today',
        balanceEarnings: 0
      };
      localStorage.setItem('bgk_wear_user_profile', JSON.stringify(guestProfile));
    } catch {}
    return true;
  });

  // 1. User state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('bgk_wear_user_profile') || localStorage.getItem('bgk_wear_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_USER,
            ...parsed,
            city: parsed.district || parsed.city || INITIAL_USER.city || 'Mumbai',
            state: parsed.state || INITIAL_USER.state || 'Maharashtra'
          };
        }
      }
    } catch (e) {
      console.warn('Profile parse error:', e);
    }
    const guestProfile: UserProfile = {
      ...INITIAL_USER,
      id: 'usr-' + Date.now(),
      joinedDate: 'Joined Today',
      balanceEarnings: 0
    };
    try {
      localStorage.setItem('bgk_wear_user_profile', JSON.stringify(guestProfile));
    } catch {}
    return guestProfile;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // 2. Products state (Robust persistence cache)
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>(() => {
    try {
      const deleted = localStorage.getItem('bgk_wear_deleted_ids');
      if (deleted) {
        const parsed = JSON.parse(deleted);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const baseMap = new Map<string, Product>();

    try {
      const cached = localStorage.getItem('bgk_wear_cached_outfits');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((p: Product) => {
            if (p && p.id && !p.id.match(/^prod-(1[0-2]|[1-9])$/)) {
              baseMap.set(p.id, { ...p, status: 'active' });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached products:', e);
    }

    // Include offline wishlist products in baseMap if present
    try {
      const offlineSaved = getCachedWishlistProducts();
      if (Array.isArray(offlineSaved)) {
        offlineSaved.forEach((p: Product) => {
          if (p && p.id && !baseMap.has(p.id)) {
            baseMap.set(p.id, { ...p, status: 'active' });
          }
        });
      }
    } catch (e) {
      console.warn('Failed to restore offline wishlist products:', e);
    }

    const finalProducts = Array.from(baseMap.values());
    
    return finalProducts;
  });

  // 3. Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bgk_wear_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse wishlist from localStorage:', e);
    }
    return [];
  });

  // Offline status & synchronization state
  const [isOffline, setIsOffline] = useState<boolean>(() => !isDeviceOnline());
  const [cachedWishlistProducts, setCachedWishlistProducts] = useState<Product[]>(() => getCachedWishlistProducts());

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Back online! Syncing latest wardrobe...', 'info');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Offline Mode: Browsing your cached wishlist & photos', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Synchronize and precache wishlist whenever wishlist or products change
  useEffect(() => {
    try {
      localStorage.setItem('bgk_wear_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage:', e);
    }

    const wishlisted = products.filter((p) => wishlist.includes(p.id));
    if (wishlisted.length > 0) {
      setCachedWishlistProducts(wishlisted);
      cacheWishlistForOffline(wishlisted, wishlist);
    } else {
      const offlineList = getCachedWishlistProducts();
      setCachedWishlistProducts(offlineList);
    }
  }, [wishlist, products]);

  // Manual or UI trigger to re-cache and sync offline assets
  const syncOfflineWishlist = async () => {
    const wishlisted = products.filter((p) => wishlist.includes(p.id));
    const targetList = wishlisted.length > 0 ? wishlisted : cachedWishlistProducts;
    const res = await cacheWishlistForOffline(targetList, wishlist);
    setCachedWishlistProducts(targetList);
    if (res.success) {
      showToast(`Offline Cache Synced: ${targetList.length} outfits & ${res.imageCount} photos ready`, 'success');
    } else {
      showToast('Saved outfits cached for offline use', 'info');
    }
  };

  // 4. Rental bookings
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>(() => {
    try {
      const saved = localStorage.getItem('bgk_wear_rental_bookings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 5. Seller Rental & Purchase orders
  const [sellerRentalBookings, setSellerRentalBookings] = useState<RentalBooking[]>([]);
  const [sellerPurchaseOrders, setSellerPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // 6. Purchase orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem('bgk_wear_purchase_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 7. Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('bgk_wear_notifs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse notifications:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 8. Stories
  const [stories] = useState<WeddingStory[]>(INITIAL_STORIES);

  // 9. Real-time Chat state
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);

  // 10. Navigation & UI states
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'sell' | 'wishlist' | 'profile' | 'admin' | 'chat' | 'orders'>('home');
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProductState] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<WeddingStory | null>(null);
  const [targetSeller, setTargetSeller] = useState<Seller | null>(null);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // In-App Version & Update States
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<AppVersionInfo | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to LocalStorage (Profile)
  useEffect(() => {
    if (!user || !user.id) return;
    try {
      localStorage.setItem('bgk_wear_user_profile', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [user]);











  // Real-time Firebase Auth listener
  useEffect(() => {
    const unsubAuth = subscribeToAuthState((fbUser) => {
      setFirebaseUser(fbUser);
      setAuthLoading(false);
      if (fbUser) {
        setIsOnboarded(true);
        // Sync user profile from auth initially
        setUser((prev) => {
          const updated = {
            ...prev,
            id: fbUser.uid,
            name: fbUser.displayName || prev.name || 'BGK Customer',
            email: fbUser.email || prev.email,
            phone: fbUser.phoneNumber || prev.phone,
            avatar: fbUser.photoURL || prev.avatar,
            isVerified: true
          };
          try {
            localStorage.setItem('bgk_wear_user_profile', JSON.stringify(updated));
          } catch (e) {
            console.warn('Storage sync failed:', e);
          }
          return updated;
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Real-time User Profile Firestore Listener (Cross-session & cross-device recovery)
  useEffect(() => {
    if (!user.id || user.id.startsWith('usr-')) return;
    const unsubProfile = subscribeToUserProfile(user.id, (cloudProfile) => {
      if (cloudProfile) {
        setUser((prev) => {
          const merged = { 
            ...prev, 
            ...cloudProfile,
            id: user.id // keep consistent UID
          };
          try {
            localStorage.setItem('bgk_wear_user_profile', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });
    return () => unsubProfile();
  }, [user.id]);

  // Keep ref to latest deleted IDs to avoid listener churn while preserving filtering
  const deletedProductIdsRef = React.useRef(deletedProductIds);
  useEffect(() => {
    deletedProductIdsRef.current = deletedProductIds;
  }, [deletedProductIds]);

  // Real-time Products Firestore Listener with Caching & Anti-Flicker Protection
  useEffect(() => {
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      const activeCloud = (cloudProducts || []).filter(p => p && p.id && !deletedProductIdsRef.current.includes(p.id) && !p.id.match(/^prod-(1[0-2]|[1-9])$/));
      
      setProducts((prev) => {
        const uniqueMap = new Map<string, Product>();

        // 1. Add local/previous user-created products
        prev.forEach(p => {
          if (p && p.id && !deletedProductIdsRef.current.includes(p.id) && !p.id.match(/^prod-(1[0-2]|[1-9])$/)) {
            uniqueMap.set(p.id, p);
          }
        });

        // 2. Add active cloud products (user listings)
        activeCloud.forEach(p => {
          if (p && p.id && !deletedProductIdsRef.current.includes(p.id) && !p.id.match(/^prod-(1[0-2]|[1-9])$/)) {
            const existingLocal = uniqueMap.get(p.id);
            if (existingLocal) {
              // Merge: keep local reviews if local has more reviews than cloud (optimistic update preservation)
              const localReviewsCount = existingLocal.reviews?.length || 0;
              const cloudReviewsCount = p.reviews?.length || 0;
              
              if (localReviewsCount > cloudReviewsCount) {
                // Preserve local reviews, rating, and views
                p.reviews = existingLocal.reviews;
                p.reviewsCount = existingLocal.reviewsCount;
                p.rating = existingLocal.rating;
              }
              
              // Preserve viewsCount if local is higher
              if ((existingLocal.viewsCount || 0) > (p.viewsCount || 0)) {
                p.viewsCount = existingLocal.viewsCount;
              }
            }
            uniqueMap.set(p.id, p);
          }
        });

        const finalProducts = Array.from(uniqueMap.values());

        // Immediately sync with localStorage to preserve all user outfits across refreshes
        try {
          localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(finalProducts));
          localStorage.setItem('bgk_wear_products', JSON.stringify(finalProducts));
        } catch (e) {
          console.warn('Failed to cache outfits:', e);
        }

        return finalProducts;
      });
    });

    return () => unsubProducts();
  }, []);

  // Auto-sync migration for local products saved in the downloaded app (local storage fallback)
  const migrationDone = React.useRef(false);
  useEffect(() => {
    if (authLoading || !user.id || user.id.startsWith('usr-') || migrationDone.current) return;

    const performMigration = async () => {
      if (migrationDone.current) return;
      try {
        const localData = localStorage.getItem('bgk_wear_products');
        if (!localData) return;
        
        const localProds: Product[] = JSON.parse(localData);
        if (!Array.isArray(localProds) || localProds.length === 0) return;

        // We only migrate products that are NOT already in the cloud.
        // We check cloud presence by looking for products where collectionName is set by the listener.
        const cloudProductIds = new Set(
          products
            .filter(p => p.collectionName === 'outfits' || p.collectionName === 'products')
            .map(p => p.id)
        );
        
        // Also check by title as a secondary safeguard for identical items with different IDs
        const cloudProductTitles = new Set(
          products
            .filter(p => p.collectionName === 'outfits' || p.collectionName === 'products')
            .map(p => p.title.toLowerCase().trim())
        );
        
        let migratedCount = 0;
        for (const localProd of localProds) {
          // If product doesn't have a cloud collection marker AND its title/ID isn't in cloud yet
          const isLocalOnly = !localProd.collectionName;
          const alreadyInCloud = cloudProductIds.has(localProd.id) || 
                                cloudProductTitles.has(localProd.title.toLowerCase().trim());

          if (isLocalOnly && !alreadyInCloud) {
            try {
              console.log('[Sync] Migrating local product to Firestore:', localProd.title);
              await createProductDoc({
                ...localProd,
                id: undefined, // Let createProductDoc generate a new clean ID
              }, user);
              migratedCount++;
            } catch (err) {
              console.warn('[Sync] Failed to migrate local product:', localProd.title, err);
            }
          }
        }
        
        if (migratedCount > 0) {
          showToast(`Migrated ${migratedCount} outfits to secure cloud storage! ☁️`, 'success');
        }
        migrationDone.current = true;
      } catch (e) {
        console.warn('[Sync] Local products migration failed:', e);
      }
    };

    // Small delay to allow initial cloud products to load
    const timeoutId = setTimeout(performMigration, 5000);
    return () => clearTimeout(timeoutId);
  }, [authLoading, user.id, products.length, showToast]);

  // Real-time Wishlist Listener for current user (Syncs fully including empty states)
  useEffect(() => {
    if (!user.id) return;
    const unsubWishlist = subscribeToUserWishlist(user.id, (cloudWishlist) => {
      setWishlist(cloudWishlist || []);
    });

    return () => unsubWishlist();
  }, [user.id]);

  // Real-time Rentals Listener for current user
  useEffect(() => {
    if (!user.id) return;
    const unsubRentals = subscribeToUserRentals(user.id, (cloudRentals) => {
      if (cloudRentals.length > 0) {
        setRentalBookings(cloudRentals);
      }
    });

    return () => unsubRentals();
  }, [user.id]);

  // Real-time Seller Rentals Listener
  useEffect(() => {
    if (!user.id) return;
    const unsubSellerRentals = subscribeToSellerRentals(user.id, (cloudRentals) => {
      setSellerRentalBookings(cloudRentals);
    });

    return () => unsubSellerRentals();
  }, [user.id]);

  // Real-time Seller Purchases Listener
  useEffect(() => {
    if (!user.id) return;
    const unsubSellerPurchases = subscribeToSellerPurchases(user.id, (cloudOrders) => {
      setSellerPurchaseOrders(cloudOrders);
    });

    return () => unsubSellerPurchases();
  }, [user.id]);

  // Real-time User Chats Listener
  useEffect(() => {
    if (!user.id) return;
    const unsubChats = subscribeToUserChats(user.id, (cloudChats) => {
      setChats(cloudChats);
      if (cloudChats.length === 0) {
        const defaultSeller: Seller = {
          id: 'seller-rajeshwari',
          name: 'Rajeshwari Designer Studio',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          city: 'Mumbai',
          state: 'Maharashtra',
          bio: 'Exclusive bridal couture & royal lehengas curator.',
          phone: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          isVerified: true,
          rating: 4.9,
          totalReviews: 128,
          totalListings: 15,
          joinedYear: '2022',
          responseTime: 'Under 10 mins'
        };
        const sampleProduct = products[0];
        getOrCreateChatConversation(user, defaultSeller, sampleProduct).then((convo) => {
          setActiveChatId(convo.id);
        }).catch(() => {});
      } else if (!activeChatId && cloudChats.length > 0) {
        setActiveChatId(cloudChats[0].id);
      }
    });

    return () => unsubChats();
  }, [user.id, products]);

  // Real-time Active Chat Messages Listener
  useEffect(() => {
    if (!activeChatId) {
      setActiveChatMessages([]);
      return;
    }
    const unsubMessages = subscribeToChatMessages(activeChatId, (messages) => {
      setActiveChatMessages(messages);
      // Auto mark read if there are unread messages for me
      markChatAsRead(activeChatId, user.id);
    }, 25);

    return () => unsubMessages();
  }, [activeChatId, user.id]);

  // Active chat computation
  const activeChat = useMemo(() => {
    if (!activeChatId) return null;
    return chats.find((c) => c.id === activeChatId) || null;
  }, [chats, activeChatId]);

  // Total unread chat count
  const totalUnreadChats = useMemo(() => {
    return chats.reduce((acc, c) => acc + (c.unreadCount?.[user.id] || 0), 0);
  }, [chats, user.id]);

  // Chat Actions
  const openChatWithSeller = async (seller: Seller, product?: Product): Promise<ChatConversation> => {
    const convo = await getOrCreateChatConversation(user, seller, product);
    setActiveChatId(convo.id);
    setActiveTab('chat');
    return convo;
  };

  const sendTextMessage = async (text: string): Promise<ChatMessage | null> => {
    if (!activeChat || !text.trim()) return null;
    const otherParticipantId = activeChat.participants.find((p) => p !== user.id) || 'seller-1';

    const msg = await sendChatMessage(activeChat.id, {
      chatId: activeChat.id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      recipientId: otherParticipantId,
      text: text.trim(),
      type: 'text'
    });

    createNotificationDoc({
      id: 'notif-' + Date.now(),
      type: 'message',
      title: `New message from ${user.name}`,
      description: text.trim().substring(0, 80),
      timestamp: 'Just now',
      read: false,
      senderName: user.name,
      senderAvatar: user.avatar
    }, otherParticipantId);

    return msg;
  };

  const sendImageMessage = async (fileOrDataUrl: File | string): Promise<ChatMessage | null> => {
    if (!activeChat) return null;
    showToast('Uploading image...', 'info');
    try {
      let dataUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
      if (typeof fileOrDataUrl !== 'string') {
        const comp = await compressImage(fileOrDataUrl, 1080, 1440, 0.78);
        dataUrl = comp.dataUrl;
      }
      const uploadedUrl = await uploadListingImage(dataUrl, user.id);
      const otherParticipantId = activeChat.participants.find((p) => p !== user.id) || 'seller-1';

      const msg = await sendChatMessage(activeChat.id, {
        chatId: activeChat.id,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        recipientId: otherParticipantId,
        text: 'Sent a photograph',
        type: 'image',
        imageUrl: uploadedUrl
      });

      showToast('Image sent ✨', 'success');
      return msg;
    } catch (err: any) {
      showToast(err.message || 'Failed to send image', 'error');
      return null;
    }
  };

  const sendOffer = async (offerData: ChatOfferData): Promise<ChatMessage | null> => {
    if (!activeChat) return null;
    const otherParticipantId = activeChat.participants.find((p) => p !== user.id) || 'seller-1';

    const msg = await sendChatMessage(activeChat.id, {
      chatId: activeChat.id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      recipientId: otherParticipantId,
      text: `Made an offer of ₹${offerData.offeredPrice.toLocaleString('en-IN')}`,
      type: 'offer',
      offerData
    });

    createNotificationDoc({
      id: 'notif-' + Date.now(),
      type: 'offer',
      title: `Offer Received: ₹${offerData.offeredPrice.toLocaleString('en-IN')}`,
      description: `${user.name} sent an offer for "${offerData.productTitle}"`,
      timestamp: 'Just now',
      read: false,
      relatedProductId: offerData.productId,
      senderName: user.name,
      senderAvatar: user.avatar
    }, otherParticipantId);

    showToast(`Offer of ₹${offerData.offeredPrice.toLocaleString('en-IN')} sent! 🏷️`, 'success');
    return msg;
  };

  const respondToOffer = async (
    messageId: string, 
    status: 'accepted' | 'declined' | 'countered',
    counterPrice?: number
  ): Promise<void> => {
    if (!activeChat) return;
    await respondToChatOfferDoc(activeChat.id, messageId, status, counterPrice);
    
    const otherParticipantId = activeChat.participants.find((p) => p !== user.id) || 'buyer-1';

    if (status === 'accepted') {
      showToast('Offer Accepted! Ready for booking ✨', 'success');
      sendChatMessage(activeChat.id, {
        chatId: activeChat.id,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        recipientId: otherParticipantId,
        text: `🎉 Offer accepted at agreed terms! You can now proceed with checkout.`,
        type: 'system'
      });
    } else if (status === 'declined') {
      showToast('Offer declined', 'info');
      sendChatMessage(activeChat.id, {
        chatId: activeChat.id,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        recipientId: otherParticipantId,
        text: `Offer declined. Feel free to propose another counter-offer.`,
        type: 'system'
      });
    } else if (status === 'countered' && counterPrice) {
      showToast(`Counter offer of ₹${counterPrice.toLocaleString('en-IN')} sent!`, 'success');
      sendChatMessage(activeChat.id, {
        chatId: activeChat.id,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        recipientId: otherParticipantId,
        text: `Proposed counter offer: ₹${counterPrice.toLocaleString('en-IN')}`,
        type: 'text'
      });
    }
  };

  const markActiveChatRead = async (chatId: string) => {
    await markChatAsRead(chatId, user.id);
  };

  const setChatTyping = async (chatId: string, isTyping: boolean) => {
    await setTypingStatus(chatId, user.id, isTyping);
  };

  const archiveChat = async (chatId: string, isArchived: boolean) => {
    await archiveChatDoc(chatId, user.id, isArchived);
    showToast(isArchived ? 'Chat archived' : 'Chat unarchived', 'info');
  };

  const blockUserChat = async (chatId: string, isBlocked: boolean) => {
    await blockUserChatDoc(chatId, user.id, isBlocked);
    showToast(isBlocked ? 'User blocked in chat' : 'User unblocked', 'info');
  };

  const deleteChat = async (chatId: string) => {
    await deleteChatConversationDoc(chatId);
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
    showToast('Conversation deleted', 'info');
  };

  // Real-time Notifications Listener for current user
  useEffect(() => {
    if (!user.id) return;
    const unsubNotifs = subscribeToUserNotifications(user.id, (cloudNotifs) => {
      if (cloudNotifs.length > 0) {
        setNotifications(cloudNotifs);
      }
    });

    return () => unsubNotifs();
  }, [user.id]);

  // Track product views
  useEffect(() => {
    if (selectedProduct?.id) {
      incrementProductStat(selectedProduct.id, 'views', 1, selectedProduct.collectionName || 'outfits');
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p))
      );
    }
  }, [selectedProduct?.id]);

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const isCurrentlyWishlisted = wishlist.includes(productId);
    const delta = isCurrentlyWishlisted ? -1 : 1;

    setWishlist((prev) => {
      if (isCurrentlyWishlisted) {
        removeFromWishlistDoc(user.id, productId);
        incrementProductStat(productId, 'likes', -1, prod?.collectionName || 'outfits');
        showToast('Removed from your Wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToWishlistDoc(user.id, productId);
        incrementProductStat(productId, 'likes', 1, prod?.collectionName || 'outfits');
        showToast('Added to your Wishlist ❤️', 'success');
        return [...prev, productId];
      }
    });

    // Dynamically update product likesCount in local state & selectedProduct
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newLikes = Math.max(0, (p.likesCount || 0) + delta);
          return { ...p, likesCount: newLikes };
        }
        return p;
      })
    );

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) =>
        prev
          ? {
              ...prev,
              likesCount: Math.max(0, (prev.likesCount || 0) + delta)
            }
          : null
      );
    }
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Safe guarded setEditingProduct
  const setEditingProduct = (prod: Product | null) => {
    if (prod) {
      const isOwner = isOutfitOwner(prod, user) || user.role === 'admin';
      if (!isOwner) {
        showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
        return;
      }
    }
    setEditingProductState(prod);
  };

  // Safe guarded delete request (opens confirmation dialog for owner)
  const requestDeleteProduct = (product: Product) => {
    if (!product) return;
    const isOwner = isOutfitOwner(product, user) || user.role === 'admin';
    if (!isOwner) {
      showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
      return;
    }
    setProductToDelete(product);
  };

  // Product management
  const addProduct = async (productData: Partial<Product>): Promise<Product> => {
    try {
      const freshId = productData.id || ('prod-' + Date.now());
      const currentUserId = user.id || 'usr-1';

      const newProd: Product = {
        id: freshId,
        userId: currentUserId,
        createdBy: currentUserId,
        sellerId: currentUserId,
        title: productData.title || 'Untitled Royal Outfit',
        description: productData.description || 'Exclusive handcrafted designer attire.',
        category: (productData.category || 'Bridal Lehenga') as any,
        brand: productData.brand || 'BGK Signature',
        size: (productData.size || 'Free Size') as any,
        color: productData.color || 'Royal Gold',
        colorHex: productData.colorHex || '#D4AF37',
        condition: (productData.condition || 'Brand New') as any,
        listingType: productData.listingType || 'both',
        rentPricePerDay: Number(productData.rentPricePerDay) || 2999,
        ...(productData.salePrice ? { salePrice: Number(productData.salePrice) } : {}),
        securityDeposit: Number(productData.securityDeposit) || 5000,
        originalRetailPrice: Number(productData.originalRetailPrice) || 45000,
        images: productData.images && productData.images.length > 0 ? productData.images : [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: Boolean(productData.featured),
        trending: true,
        newArrival: true,
        city: productData.city || user.city || 'Mumbai',
        state: productData.state || user.state || 'Maharashtra',
        seller: {
          id: currentUserId,
          name: user.name || 'Verified Wardrobe Owner',
          avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          city: user.district || user.city || 'Mumbai',
          state: user.state || 'Maharashtra',
          bio: user.bio || 'Verified Wardrobe Owner on BGK WEAR',
          phone: user.phone || user.whatsapp || '',
          whatsapp: user.whatsapp || user.phone || '',
          isVerified: true,
          rating: 5.0,
          totalReviews: 1,
          totalListings: 1,
          joinedYear: '2024',
          responseTime: 'Under 10 mins'
        },
        rating: 5.0,
        reviewsCount: 0,
        reviews: [],
        availableFrom: productData.availableFrom || new Date().toISOString().split('T')[0],
        availableTo: productData.availableTo || '2026-12-31',
        status: 'active',
        fabric: productData.fabric || 'Pure Silk & Handcrafted Zari',
        occasion: productData.occasion || ['Wedding Ceremony', 'Reception'],
        measurements: productData.measurements || { alterationMargin: '2-3 inches side margin' },
        viewsCount: 1,
        likesCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        collectionName: 'outfits'
      };

      // 0.001s INSTANT STATE & FILTER UPDATE!
      setSelectedCity('All Cities');
      setFilterState((prev) => ({ ...prev, city: 'All Cities', searchQuery: '' }));

      setProducts((prev) => {
        const updated = [newProd, ...prev.filter(p => p.id !== newProd.id)];
        try {
          localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(updated));
          localStorage.setItem('bgk_wear_products', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error on addProduct:', e);
        }
        return updated;
      });

      // Add notification
      const notif: AppNotification = {
        id: 'notif-' + Date.now(),
        type: 'approval',
        title: 'Your Outfit is Live on BGK WEAR! 🌟',
        description: `"${newProd.title}" is now visible to thousands of brides, grooms & stylists across India.`,
        timestamp: 'Just now',
        read: false,
        relatedProductId: newProd.id
      };
      setNotifications((prev) => [notif, ...prev]);
      createNotificationDoc(notif, user.id);
      showToast('Outfit listed successfully! 🌟', 'success');

      // Async background push to Firestore
      createProductDoc(newProd, user).catch((err) => {
        console.warn('Background Firestore save note:', err);
      });

      return newProd;
    } catch (err: any) {
      console.error('Failed to add product:', err);
      showToast('Failed to list outfit. Please try again.', 'error');
      throw err;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product | null> => {
    const existing = products.find((p) => p.id === productId);
    if (existing) {
      const isOwner = isOutfitOwner(existing, user) || user.role === 'admin';
      if (!isOwner) {
        showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
        return null;
      }
    }

    let updated: Product | null = null;
    try {
      await updateProductDoc(productId, updates, existing?.collectionName || 'outfits');
    } catch (err) {
      console.warn('[Firestore] Update error handled locally:', err);
    }
    setProducts((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === productId) {
          updated = { ...p, ...updates };
          return updated;
        }
        return p;
      });
      // Move side effects out of the updater function
      setTimeout(() => {
        try {
          localStorage.setItem('bgk_wear_products', JSON.stringify(updatedList));
          localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(updatedList));
        } catch (e) {
          console.warn('LocalStorage error on update:', e);
        }
      }, 0);
      return updatedList;
    });
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Listing updated successfully ✨', 'success');
    return updated;
  };

  const updateProductStatus = (productId: string, status: Product['status']) => {
    const existing = products.find((p) => p.id === productId);
    if (existing) {
      const isOwner = isOutfitOwner(existing, user) || user.role === 'admin';
      if (!isOwner) {
        showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
        return;
      }
    }

    updateProductDoc(productId, { status }, existing?.collectionName || 'outfits');
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status } : p))
    );
    showToast(`Listing status updated to ${status}`, 'info');
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    if (!productId) return;

    const existing = products.find((p) => p.id === productId);
    if (existing) {
      const isOwner = isOutfitOwner(existing, user) || user.role === 'admin';
      if (!isOwner) {
        showToast('Unauthorized: You can only edit or delete your own listings.', 'error');
        return;
      }
    }

    // 1. Immediately store in deleted list (persisted in localStorage)
    setDeletedProductIds((prev) => {
      const next = Array.from(new Set([...prev, productId]));
      try {
        localStorage.setItem('bgk_wear_deleted_ids', JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage error on deleted IDs:', e);
      }
      return next;
    });

    // 2. Immediately update state products
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('bgk_wear_products', JSON.stringify(updated));
        localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error on delete:', e);
      }
      return updated;
    });

    // 3. Update wishlist
    setWishlist((prev) => {
      const updated = prev.filter((id) => id !== productId);
      try {
        localStorage.setItem('bgk_wear_wishlist', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error on wishlist delete:', e);
      }
      return updated;
    });

    // 4. Close any active modals pointing to this product
    setSelectedProduct((prev) => (prev && prev.id === productId ? null : prev));
    setEditingProductState((prev) => (prev && prev.id === productId ? null : prev));
    setProductToDelete((prev) => (prev && prev.id === productId ? null : prev));

    // 5. Cloud Firestore asynchronous deletion
    try {
      await deleteProductDoc(productId, existing?.collectionName || 'outfits');
    } catch (err) {
      console.warn('[Firestore] Delete error handled locally:', err);
    }

    showToast('Listing deleted successfully 🗑️', 'info');
  };

  // Bookings
  const createRentalBooking = async (bookingData: Omit<RentalBooking, 'id' | 'bookingDate' | 'status' | 'depositRefundStatus'>): Promise<RentalBooking> => {
    const rawBooking: RentalBooking = {
      ...bookingData,
      id: 'rent-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      bookingDate: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      depositRefundStatus: 'Active Security Deposit'
    };

    const newBooking = await createRentalBookingDoc(rawBooking, user.id);
    setRentalBookings((prev) => {
      const updated = [newBooking, ...prev.filter(b => b.id !== newBooking.id)];
      try {
        localStorage.setItem('bgk_wear_rental_bookings', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Create notification for seller & renter
    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      type: 'rental_request',
      title: 'Booking Confirmed! 💍',
      description: `Rental reserved for "${newBooking.productTitle}" from ${newBooking.startDate} to ${newBooking.endDate}. Security deposit: ₹${newBooking.securityDeposit.toLocaleString('en-IN')}.`,
      timestamp: 'Just now',
      read: false,
      relatedBookingId: newBooking.id,
      relatedProductId: newBooking.productId
    };
    setNotifications((prev) => [notif, ...prev]);
    createNotificationDoc(notif, user.id);
    showToast('Rental Booked Successfully! ✨', 'success');
    return newBooking;
  };

  const createPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'orderDate' | 'status'>): Promise<PurchaseOrder> => {
    const rawOrder: PurchaseOrder = {
      ...orderData,
      id: 'ord-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Processing'
    };

    const newOrder = await createPurchaseOrderDoc(rawOrder, user.id);
    setPurchaseOrders((prev) => {
      const updated = [newOrder, ...prev.filter(o => o.id !== newOrder.id)];
      try {
        localStorage.setItem('bgk_wear_purchase_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      type: 'purchase_request',
      title: 'Order Placed Successfully! 🛍️',
      description: `Purchase request placed for "${newOrder.productTitle}". Coordinate directly with seller ${newOrder.sellerName} via in-app chat or phone.`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
    createNotificationDoc(notif, user.id);
    showToast('Purchase Order Placed! 🎉', 'success');
    return newOrder;
  };

  const updateRentalStatus = async (
    bookingId: string, 
    status: RentalBooking['status'], 
    depositRefundStatus?: RentalBooking['depositRefundStatus'],
    trackingNumber?: string
  ): Promise<void> => {
    await updateRentalOrderStatus(bookingId, status, depositRefundStatus, trackingNumber);
    setRentalBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status, ...(depositRefundStatus ? { depositRefundStatus } : {}), ...(trackingNumber ? { trackingNumber } : {}) } : b))
    );
    setSellerRentalBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status, ...(depositRefundStatus ? { depositRefundStatus } : {}), ...(trackingNumber ? { trackingNumber } : {}) } : b))
    );
    showToast(`Rental order status updated to: ${status}`, 'success');
  };

  const updatePurchaseStatus = async (
    orderId: string, 
    status: PurchaseOrder['status'], 
    trackingNumber?: string
  ): Promise<void> => {
    await updatePurchaseOrderStatus(orderId, status, trackingNumber);
    setPurchaseOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, ...(trackingNumber ? { trackingNumber } : {}) } : o))
    );
    setSellerPurchaseOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, ...(trackingNumber ? { trackingNumber } : {}) } : o))
    );
    showToast(`Purchase order status updated to: ${status}`, 'success');
  };

  const markNotificationRead = (id: string) => {
    updateNotificationStatusDoc(id, { read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleNotificationAction = (id: string, action: 'accepted' | 'declined') => {
    updateNotificationStatusDoc(id, { actionState: action, read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, actionState: action, read: true } : n))
    );
    showToast(`Rental request ${action}!`, action === 'accepted' ? 'success' : 'info');
  };

  const addReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date' | 'likes'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      likes: 0
    };

    addReviewDoc(productId, newReview, user.id);

    // Update global state and save to DB
    const targetProduct = products.find(p => p.id === productId);
    if (targetProduct) {
      const updatedReviews = [newReview, ...(targetProduct.reviews || [])];
      const newRating = Number(
        (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
      );

      // Save persistent to database
      updateProductDoc(productId, {
        reviews: updatedReviews,
        reviewsCount: updatedReviews.length,
        rating: newRating
      }, (targetProduct as any).collectionName || 'outfits');
    }

    setProducts((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === productId) {
          const updatedReviews = [newReview, ...(p.reviews || [])];
          const newRating = Number(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          const updatedProd = {
            ...p,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newRating
          };
          
          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct(updatedProd);
          }
          
          return updatedProd;
        }
        return p;
      });
      
      // Persist to local storage to ensure reviews remain visible on reload
      // even if Firestore is experiencing quota issues or offline mode.
      setTimeout(() => {
        try {
          localStorage.setItem('bgk_wear_products', JSON.stringify(updatedList));
          localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(updatedList));
        } catch (e) {
          console.warn('LocalStorage error on addReview. Photos might be too large. Stripping photos to save text/rating:', e);
          try {
            // Strip photos from all reviews to ensure the text and rating survive the 5MB localStorage limit
            const strippedList = updatedList.map(p => ({
              ...p,
              reviews: p.reviews?.map(r => ({ ...r, photos: [] }))
            }));
            localStorage.setItem('bgk_wear_products', JSON.stringify(strippedList));
            localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(strippedList));
          } catch (e2) {
            console.error('Still failed to save to localStorage after stripping photos:', e2);
          }
        }
      }, 0);
      
      return updatedList;
    });
    showToast('Thank you for sharing your review! ⭐', 'success');
  };

  const updateReview = async (productId: string, reviewId: string, updatedData: Partial<Review>) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const updatedReviews = (targetProduct.reviews || []).map(r => {
      if (r.id === reviewId) {
        return { ...r, ...updatedData };
      }
      return r;
    });

    const newRating = Number(
      (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(updatedReviews.length, 1)).toFixed(1)
    );

    updateProductDoc(productId, {
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: newRating
    }, (targetProduct as any).collectionName || 'outfits');

    setProducts((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === productId) {
          const updatedProd = {
            ...p,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newRating
          };
          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct(updatedProd);
          }
          return updatedProd;
        }
        return p;
      });

      setTimeout(() => {
        try {
          localStorage.setItem('bgk_wear_products', JSON.stringify(updatedList));
          localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(updatedList));
        } catch (e) {
          console.warn('LocalStorage error on updateReview. Stripping photos if quota exceeded:', e);
          try {
            const strippedList = updatedList.map(p => ({
              ...p,
              reviews: p.reviews?.map(r => ({ ...r, photos: [] }))
            }));
            localStorage.setItem('bgk_wear_products', JSON.stringify(strippedList));
            localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(strippedList));
          } catch (e2) {
            console.error('Still failed to save to localStorage:', e2);
          }
        }
      }, 0);

      return updatedList;
    });
    showToast('Review updated successfully! ✨', 'success');
  };

  const deleteReview = async (productId: string, reviewId: string) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const updatedReviews = (targetProduct.reviews || []).filter(r => r.id !== reviewId);
    const newRating = updatedReviews.length > 0 
      ? Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1))
      : 5.0;

    updateProductDoc(productId, {
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: newRating
    }, (targetProduct as any).collectionName || 'outfits');

    setProducts((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === productId) {
          const updatedProd = {
            ...p,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newRating
          };
          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct(updatedProd);
          }
          return updatedProd;
        }
        return p;
      });

      setTimeout(() => {
        try {
          localStorage.setItem('bgk_wear_products', JSON.stringify(updatedList));
          localStorage.setItem('bgk_wear_cached_outfits', JSON.stringify(updatedList));
        } catch (e) {
          console.warn('LocalStorage error on deleteReview:', e);
        }
      }, 0);

      return updatedList;
    });
    showToast('Review deleted successfully 🗑️', 'info');
  };

  const completeOnboarding = async (profileData: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    state: string;
    district: string;
    pincode: string;
  }) => {
    let currentId = user.id;
    if (!currentId || currentId.startsWith('usr-')) {
      try {
        
        const fbUser = await loginAnonymously();
        currentId = fbUser.uid;
      } catch (err) {
        console.warn('Anon auth failed during onboarding', err);
        currentId = 'usr-' + Date.now();
      }
    }

    const newUserProfile: UserProfile = {
      id: currentId,
      name: profileData.name.trim(),
      email: profileData.email.trim().toLowerCase(),
      phone: profileData.phone.trim(),
      whatsapp: profileData.whatsapp.trim(),
      state: profileData.state.trim(),
      district: profileData.district.trim(),
      city: profileData.district.trim(),
      pincode: profileData.pincode.trim(),
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: `Wedding wardrobe enthusiast & verified curator from ${profileData.district}, ${profileData.state}`,
      role: 'seller',
      isVerified: true,
      joinedDate: 'Joined Today',
      balanceEarnings: 0
    };

    setUser(newUserProfile);
    try {
      localStorage.setItem('bgk_wear_user_profile', JSON.stringify(newUserProfile));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    saveUserProfileDoc(newUserProfile.id, newUserProfile);
    setIsOnboarded(true);
    setActiveTab('home');
    showToast(`Welcome to BGK WEAR, ${newUserProfile.name}! ✨`, 'success');
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem('bgk_wear_user_profile');
    } catch {}
    setIsOnboarded(false);
    showToast('Signed out of BGK WEAR', 'info');
  };

  const saveProfileCompletion = async (data: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) => {
    const currentId = user.id || firebaseUser?.uid || 'usr-' + Date.now();
    const updatedProfile: UserProfile = {
      ...user,
      id: currentId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      whatsapp: data.whatsapp.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      district: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
      isVerified: true,
      isProfileComplete: true,
      isGuest: false
    };

    setUser(updatedProfile);
    try {
      localStorage.setItem('bgk_wear_user_profile', JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    await saveUserProfileDoc(currentId, updatedProfile);
    syncProfileToUserOutfits(updatedProfile);
    showToast('Profile completed successfully! Welcome to BGK WEAR ✨', 'success');
  };

  const syncProfileToUserOutfits = (updatedUser: UserProfile) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (isOutfitOwner(p, updatedUser) || p.userId === updatedUser.id || p.sellerId === updatedUser.id) {
          const updatedSeller: Seller = {
            ...p.seller,
            id: updatedUser.id,
            name: updatedUser.name || p.seller?.name || 'Verified Wardrobe Owner',
            avatar: updatedUser.avatar || p.seller?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            city: updatedUser.district || updatedUser.city || p.seller?.city || 'Mumbai',
            state: updatedUser.state || p.seller?.state || 'Maharashtra',
            bio: updatedUser.bio || p.seller?.bio || 'Verified Wardrobe Owner on BGK WEAR',
            phone: updatedUser.phone || updatedUser.whatsapp || p.seller?.phone || '',
            whatsapp: updatedUser.whatsapp || updatedUser.phone || p.seller?.whatsapp || '',
          };
          const updatedProd = {
            ...p,
            seller: updatedSeller,
            city: updatedUser.city || p.city,
            state: updatedUser.state || p.state
          };
          updateProductDoc(p.id, { seller: updatedSeller, city: updatedUser.city || p.city }, p.collectionName || 'outfits').catch(() => {});
          return updatedProd;
        }
        return p;
      })
    );
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      // Move side effects out of the updater function
      setTimeout(() => {
        try {
          if (updated.id && !updated.id.startsWith('usr-') && updated.id.trim() !== '') {
            saveUserProfileDoc(updated.id, updated).catch((err) => console.warn('[Firestore] Profile save failed:', err));
          }
          localStorage.setItem('bgk_wear_user_profile', JSON.stringify(updated));
          syncProfileToUserOutfits(updated);
        } catch (e) {
          console.warn('Profile persistence error:', e);
        }
      }, 0);
      return updated;
    });
    showToast('Profile updated successfully ✨', 'success');
  };

  const setUserRole = (role: 'buyer' | 'seller' | 'admin') => {
    setUser((prev) => {
      const updated = { ...prev, role };
      // Move side effects out of the updater function
      setTimeout(() => {
        if (updated.id && !updated.id.startsWith('usr-') && updated.id.trim() !== '') {
          saveUserProfileDoc(updated.id, updated).catch((err) => console.warn('[Firestore] Role save failed:', err));
        }
      }, 0);
      return updated;
    });
    showToast(`Switched view to ${role.toUpperCase()}`, 'info');
  };

  // Auth Methods
  const signInGoogle = async () => {
    try {
      const fbUser = await loginWithGoogle();
      if (!fbUser) {
        // User closed or cancelled sign in popup
        return;
      }
      const updatedProfile: UserProfile = {
        ...user,
        id: fbUser.uid,
        name: fbUser.displayName || user.name || 'BGK Customer',
        email: fbUser.email || user.email,
        avatar: fbUser.photoURL || user.avatar,
        isVerified: true
      };
      try {
        localStorage.setItem('bgk_wear_user_profile', JSON.stringify(updatedProfile));
      } catch {}
      setUser(updatedProfile);
      setIsOnboarded(true);
      setActiveTab('home');
      setActiveModal(null);
      if (user?.id && !user.id.startsWith('usr-') && user.id.trim() !== '') {
        saveUserProfileDoc(updatedProfile.id, updatedProfile).catch(() => {});
      }
      showToast(`Welcome back, ${fbUser.displayName || 'connoisseur'}! 🌟`, 'success');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('cancelled')) {
        return;
      }
      showToast(err.message || 'Google sign-in failed', 'error');
    }
  };

  const signInEmail = async (email: string, pass: string) => {
    try {
      const fbUser = await loginWithEmail(email, pass);
      const updatedProfile: UserProfile = {
        ...user,
        id: fbUser.uid,
        email: fbUser.email || email,
        name: fbUser.displayName || user.name || 'BGK Customer',
        isVerified: true
      };
      try {
        localStorage.setItem('bgk_wear_user_profile', JSON.stringify(updatedProfile));
      } catch {}
      setUser(updatedProfile);
      setIsOnboarded(true);
      setActiveTab('home');
      setActiveModal(null);
      if (fbUser.uid && fbUser.uid.trim() !== '') {
        saveUserProfileDoc(fbUser.uid, updatedProfile).catch(() => {});
      }
      showToast('Logged in successfully! Welcome back ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'Email login failed', 'error');
      throw err;
    }
  };

  const signUpEmail = async (email: string, pass: string, name: string) => {
    try {
      const fbUser = await registerWithEmail(email, pass, name);
      const updatedProfile: UserProfile = {
        ...user,
        id: fbUser.uid,
        email: fbUser.email || email,
        name: name || user.name || 'BGK Customer',
        isVerified: true
      };
      try {
        localStorage.setItem('bgk_wear_user_profile', JSON.stringify(updatedProfile));
      } catch {}
      setUser(updatedProfile);
      setIsOnboarded(true);
      setActiveTab('home');
      setActiveModal(null);
      if (fbUser.uid && fbUser.uid.trim() !== '') {
        saveUserProfileDoc(fbUser.uid, updatedProfile).catch(() => {});
      }
      showToast('Account created successfully! Welcome to BGK WEAR ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'Sign up failed', 'error');
      throw err;
    }
  };

  const signInAnonymouslyFallback = async () => {
    try {
      const fbUser = await loginAnonymously();
      const updatedProfile: UserProfile = {
        ...user,
        id: fbUser.uid,
        name: user.name || 'Guest Explorer',
        isVerified: true
      };
      try {
        localStorage.setItem('bgk_wear_user_profile', JSON.stringify(updatedProfile));
      } catch {}
      setUser(updatedProfile);
      setIsOnboarded(true);
      setActiveTab('home');
      setActiveModal(null);
      saveUserProfileDoc(fbUser.uid, updatedProfile);
      showToast('Welcome! Browsing in Guest Mode 🛍️', 'info');
    } catch (e) {
      console.warn('Anon auth failed', e);
      setIsOnboarded(true);
      setActiveTab('home');
      setActiveModal(null);
    }
  };

  const signOut = async () => {
    await logoutUser();
    setUser(INITIAL_USER);
    setProducts([]);
    setWishlist([]);
    setRentalBookings([]);
    setPurchaseOrders([]);
    setNotifications([]);
    try {
      localStorage.removeItem('bgk_wear_user_profile');
    } catch {}
    setIsOnboarded(false);
    showToast('Signed out successfully', 'info');
  };

  const logout = async () => {
    await logoutUser();
    setIsOnboarded(false);
    localStorage.clear();
    window.location.reload();
  };

  const updateFilter = (partial: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  };

  const resetFilters = () => {
    setFilterState(DEFAULT_FILTERS);
    showToast('Filters reset', 'info');
  };

  const openWhatsApp = (phone: string, message: string) => {
    let cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }
    if (!cleanPhone) {
      showToast('Seller contact number not available', 'error');
      return;
    }
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openCall = (phone: string) => {
    const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : '';
    if (!cleanPhone) {
      showToast('Seller contact number not available', 'error');
      return;
    }
    window.location.href = `tel:${cleanPhone}`;
  };

  // In-App Version Checker Logic
  const checkForUpdates = async (manual: boolean = false) => {
    setIsCheckingUpdate(true);
    try {
      const info = await fetchLatestAppVersion();
      setUpdateInfo(info);
      const hasNewVersion = isNewerVersion(CURRENT_APP_VERSION, info.version);

      if (hasNewVersion) {
        // If mandatory, or user manually checked, or has not dismissed this version
        if (info.isMandatory || manual || !isVersionDismissed(info.version)) {
          setShowUpdateModal(true);
        }
        if (manual) {
          showToast(`🚀 New update available: v${info.version}!`, 'success');
        }
      } else {
        if (manual) {
          showToast(`✨ BGK Wear is up to date (v${CURRENT_APP_VERSION})`, 'info');
        }
      }
    } catch (err) {
      console.warn('Update check failed:', err);
      if (manual) {
        showToast('Unable to check for updates. Please try again.', 'error');
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const dismissUpdate = () => {
    if (updateInfo) {
      markVersionDismissed(updateInfo.version);
    }
    setShowUpdateModal(false);
  };

  // Auto-check for updates on app mount after 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Filtered products calculation
  const filteredProducts = products.filter((p) => {
    // Only show active unless in admin
    if (p.status !== 'active' && user.role !== 'admin') {
      return false;
    }

    // Availability Filter
    if (filterState.availabilityOnly && p.status !== 'active') {
      return false;
    }

    // City Filter
    if (selectedCity !== 'All Cities' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (filterState.city !== 'All Cities' && p.city.toLowerCase() !== filterState.city.toLowerCase()) {
      return false;
    }

    // Search query with Typo-Tolerance & Fuzzy Matching (handles misspellings like lehanga -> lehenga, shervani -> sherwani, etc.)
    if (filterState.searchQuery.trim()) {
      if (!matchProductWithFuzzySearch(p, filterState.searchQuery)) {
        return false;
      }
    }

    // Category
    if (filterState.category && filterState.category !== 'All' && p.category !== filterState.category) {
      return false;
    }

    // Listing Type (rent, buy, both)
    if (filterState.listingType === 'rent') {
      if (p.listingType !== 'rent' && p.listingType !== 'both') return false;
    } else if (filterState.listingType === 'buy') {
      if (p.listingType !== 'buy' && p.listingType !== 'both') return false;
    }

    // Price Rent
    if (p.rentPricePerDay < filterState.minRentPrice || p.rentPricePerDay > filterState.maxRentPrice) {
      return false;
    }

    // Price Sale (if set)
    if (filterState.listingType === 'buy' && p.salePrice) {
      if (p.salePrice < filterState.minSalePrice || p.salePrice > filterState.maxSalePrice) {
        return false;
      }
    }

    // Sizes
    if (filterState.sizes.length > 0 && !filterState.sizes.includes(p.size)) {
      return false;
    }

    // Colors
    if (filterState.colors && filterState.colors.length > 0) {
      const match = filterState.colors.some(
        (c) => p.color.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(p.color.toLowerCase())
      );
      if (!match) return false;
    }

    // Fabrics
    if (filterState.fabrics && filterState.fabrics.length > 0) {
      const match = filterState.fabrics.some(
        (f) => p.fabric && p.fabric.toLowerCase().includes(f.toLowerCase())
      );
      if (!match) return false;
    }

    // Brands
    if (filterState.brands.length > 0 && !filterState.brands.includes(p.brand)) {
      return false;
    }

    // Conditions
    if (filterState.conditions.length > 0 && !filterState.conditions.includes(p.condition)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filterState.sortBy === 'price_low') {
      const priceA = filterState.listingType === 'buy' ? (a.salePrice || a.rentPricePerDay * 3) : a.rentPricePerDay;
      const priceB = filterState.listingType === 'buy' ? (b.salePrice || b.rentPricePerDay * 3) : b.rentPricePerDay;
      return priceA - priceB;
    }
    if (filterState.sortBy === 'price_high') {
      const priceA = filterState.listingType === 'buy' ? (a.salePrice || a.rentPricePerDay * 3) : a.rentPricePerDay;
      const priceB = filterState.listingType === 'buy' ? (b.salePrice || b.rentPricePerDay * 3) : b.rentPricePerDay;
      return priceB - priceA;
    }
    if (filterState.sortBy === 'rating') return b.rating - a.rating;
    if (filterState.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (filterState.sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
    if (filterState.sortBy === 'saved') return (b.likesCount || 0) - (a.likesCount || 0);
    if (filterState.sortBy === 'discount') {
      const discA = a.originalRetailPrice ? (a.originalRetailPrice - (a.salePrice || a.rentPricePerDay * 3)) / a.originalRetailPrice : 0;
      const discB = b.originalRetailPrice ? (b.originalRetailPrice - (b.salePrice || b.rentPricePerDay * 3)) / b.originalRetailPrice : 0;
      return discB - discA;
    }
    // Default featured
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        completeOnboarding,
        resetOnboarding,
        user,
        setUser,
        firebaseUser,
        authLoading,
        products,
        wishlist,
        rentalBookings,
        purchaseOrders,
        sellerRentalBookings,
        sellerPurchaseOrders,
        notifications,
        stories,
        selectedCity,
        setSelectedCity,
        activeTab,
        setActiveTab,
        filterState,
        setFilterState,
        updateFilter,
        resetFilters,
        editingProduct,
        setEditingProduct,
        productToDelete,
        setProductToDelete,
        requestDeleteProduct,
        selectedProduct,
        setSelectedProduct,
        activeModal,
        setActiveModal,
        activeStory,
        setActiveStory,
        targetSeller,
        setTargetSeller,
        targetProduct,
        setTargetProduct,
        toasts,
        showToast,
        removeToast,
        chats,
        activeChatId,
        activeChat,
        activeChatMessages,
        totalUnreadChats,
        openChatWithSeller,
        setActiveChatId,
        sendTextMessage,
        sendImageMessage,
        sendOffer,
        respondToOffer,
        markActiveChatRead,
        setChatTyping,
        archiveChat,
        blockUserChat,
        deleteChat,
        toggleWishlist,
        isWishlisted,
        addProduct,
        updateProduct,
        updateProductStatus,
        deleteProduct,
        createRentalBooking,
        createPurchaseOrder,
        updateRentalStatus,
        updatePurchaseStatus,
        markNotificationRead,
        handleNotificationAction,
        addReview,
        updateReview,
        deleteReview,
        updateUserProfile,
        setUserRole,
        openWhatsApp,
        openCall,
        saveProfileCompletion,
        signInGoogle,
        signInEmail,
        signUpEmail,
        signOut,
         logout,
        // In-App Version Updates
        currentAppVersion: CURRENT_APP_VERSION,
        showUpdateModal,
        setShowUpdateModal,
        updateInfo,
        isCheckingUpdate,
        checkForUpdates,
        dismissUpdate,
        filteredProducts,
        // Offline PWA support
        isOffline,
        syncOfflineWishlist,
        cachedWishlistProducts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
