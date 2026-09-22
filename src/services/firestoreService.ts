import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  orderBy, 
  increment,
  limit
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { 
  Product, 
  UserProfile, 
  Seller,
  RentalBooking, 
  PurchaseOrder, 
  AppNotification, 
  Review, 
  ChatMessage, 
  ChatConversation 
} from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export let isFirestoreQuotaExceeded = false;

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errStr = error instanceof Error ? error.message : String(error);
  if (errStr.includes('Quota limit exceeded') || errStr.includes('resource-exhausted') || errStr.includes('quota')) {
    isFirestoreQuotaExceeded = true;
    console.warn('[Firestore Quota Exceeded]: Switching to resilient offline cache mode.');
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('[Firestore Note]:', JSON.stringify(errInfo));
}


function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === undefined) return undefined as any;
  if (obj === null) return null as any;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeFirestoreData).filter(v => v !== undefined) as any;
  
  if (obj.constructor && obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array') {
    return obj; // Leave Firestore FieldValues (like serverTimestamp) alone
  }

  const cleaned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeFirestoreData(val);
      }
    }
  }
  return cleaned;
}

function getSafeUserId(userId?: string): string {
  return auth.currentUser?.uid || (userId && userId !== 'undefined' && userId !== 'null' ? userId : 'usr-1');
}

function getSafeProductId(productId?: string): string {
  return productId && productId !== 'undefined' && productId !== 'null' ? productId : ('prod-' + Date.now());
}

function getSafeChatId(chatId?: string): string {
  return chatId && chatId !== 'undefined' && chatId !== 'null' ? chatId : ('chat-' + Date.now());
}

/* =========================================================================
   1. PRODUCTS / OUTFITS REPOSITORY (Cloud Firestore - Real-time synchronization)
   ========================================================================= */

export async function seedInitialProductsIfEmpty(): Promise<void> {
  // No-op: Default mock items removed per user request
}

export async function createProductDoc(product: Partial<Product>, currentUser: UserProfile): Promise<Product> {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Anonymous auth note:', e);
    }
  }
  const currentUserId = auth.currentUser?.uid || getSafeUserId(currentUser?.id);

  // Generate a clean Firestore document ID
  const freshPushId = doc(collection(db, 'outfits')).id;

  const safeProdId = (product?.id && typeof product.id === 'string' && product.id.trim() !== '' && product.id !== 'undefined' && product.id !== 'null' && !product.id.includes('null'))
    ? product.id
    : freshPushId;

  const newProduct: Product = {
    id: safeProdId,
    userId: currentUserId,
    createdBy: currentUserId,
    sellerId: currentUserId,
    title: product.title || 'Untitled Royal Outfit',
    description: product.description || 'Exclusive handcrafted designer attire.',
    category: product.category || 'Bridal Lehenga',
    brand: product.brand || 'BGK Signature',
    size: product.size || 'Free Size',
    color: product.color || 'Royal Gold',
    colorHex: product.colorHex || '#D4AF37',
    condition: product.condition || 'Brand New',
    listingType: product.listingType || 'both',
    rentPricePerDay: Number(product.rentPricePerDay) || 2999,
    ...(product.salePrice ? { salePrice: Number(product.salePrice) } : {}),
    securityDeposit: Number(product.securityDeposit) || 5000,
    originalRetailPrice: Number(product.originalRetailPrice) || 45000,
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: Boolean(product.featured),
    trending: true,
    newArrival: true,
    city: product.city || currentUser.city || 'Mumbai',
    state: product.state || currentUser.state || 'Maharashtra',
    seller: {
      id: currentUserId,
      name: currentUser.name || 'Verified Wardrobe Owner',
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      city: currentUser.district || currentUser.city || 'Mumbai',
      state: currentUser.state || 'Maharashtra',
      bio: currentUser.bio || 'Verified Wardrobe Owner on BGK WEAR',
      phone: currentUser.phone || currentUser.whatsapp || '',
      whatsapp: currentUser.whatsapp || currentUser.phone || '',
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
    availableFrom: product.availableFrom || new Date().toISOString().split('T')[0],
    availableTo: product.availableTo || '2026-12-31',
    status: 'active',
    fabric: product.fabric || 'Pure Silk & Handcrafted Zari',
    occasion: product.occasion || ['Wedding Ceremony', 'Reception'],
    measurements: product.measurements || { alterationMargin: '2-3 inches side margin' },
    viewsCount: 1,
    likesCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };

  const finalProduct: Product = {
    ...newProduct,
    id: safeProdId,
    collectionName: 'outfits'
  };

  const productData = {
    ...finalProduct,
    userId: currentUserId,
    sellerId: currentUserId,
    createdBy: currentUserId,
    sellerName: currentUser?.name || 'Verified Wardrobe Owner',
    rentPrice: finalProduct.rentPricePerDay || 2999,
    timestamp: serverTimestamp()
  };

  try {
    const prodRef = doc(db, 'outfits', safeProdId);
    await setDoc(prodRef, sanitizeFirestoreData(productData));
    console.log('[Firestore] Outfit saved successfully:', safeProdId);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `outfits/${safeProdId}`);
  }
  return finalProduct;
}

export function subscribeToProducts(callback: (products: Product[]) => void, userId?: string, limitCount: number = 100): () => void {
  try {
    const q = query(collection(db, 'outfits'), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        if (item) {
          const product: Product = {
            ...item,
            id: docSnap.id,
            collectionName: 'outfits'
          } as any;
          if (!userId || product.userId === userId || product.sellerId === userId) {
            list.push(product);
          }
        }
      });
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'outfits');
    });
  } catch (err) {
    console.warn('[Firestore] Subscription init error:', err);
    callback([]);
    return () => {};
  }
}

export async function updateProductDoc(productId: string, updates: Partial<Product>, collectionName: string = 'outfits'): Promise<void> {
  if (!productId || productId === 'undefined' || productId === 'null') return;
  try {
    const prodRef = doc(db, collectionName, productId);
    await updateDoc(prodRef, sanitizeFirestoreData({
      ...updates,
      updatedAt: serverTimestamp()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${productId}`);
  }
}

export async function deleteProductDoc(productId: string, collectionName: string = 'outfits'): Promise<void> {
  if (!productId || productId === 'undefined' || productId === 'null') {
    console.warn('[Firestore] Attempted to delete with invalid ID:', productId);
    return;
  }

  try {
    const prodRef = doc(db, collectionName, productId);
    await deleteDoc(prodRef);
    console.log(`[Firestore] Successfully removed product: ${productId}`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${productId}`);
  }
}

export async function incrementProductStat(productId: string, stat: 'views' | 'likes', amount: number = 1, collectionName: string = 'outfits'): Promise<void> {
  if (!productId || productId === 'undefined' || productId === 'null') return;
  try {
    const prodRef = doc(db, collectionName, productId);
    const field = stat === 'views' ? 'viewsCount' : 'likesCount';
    await updateDoc(prodRef, {
      [field]: increment(amount)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${productId}`);
  }
}

/* =========================================================================
   2. USER PROFILES
   ========================================================================= */

export async function saveUserProfileDoc(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const cacheKey = `bgk_user_profile_${userId}`;
  try {
    const safeUserId = getSafeUserId(userId);
    const updated = {
      uid: safeUserId,
      ...profile,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(cacheKey, JSON.stringify(updated));

    if (isFirestoreQuotaExceeded) return;

    const userRef = doc(db, 'users', safeUserId);
    await setDoc(userRef, sanitizeFirestoreData(updated), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
  }
}

export async function getUserProfileDoc(userId: string): Promise<UserProfile | null> {
  const cacheKey = `bgk_user_profile_${userId}`;
  try {
    if (!userId || userId === 'undefined' || userId === 'null') return null;

    if (isFirestoreQuotaExceeded) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
      return null;
    }

    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    }
    return null;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    return null;
  }
}

export function subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void): () => void {
  const cacheKey = `bgk_user_profile_${userId}`;
  if (isFirestoreQuotaExceeded) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { callback(JSON.parse(cached)); } catch {}
    }
    return () => {};
  }

  try {
    const safeUserId = getSafeUserId(userId);
    const userRef = doc(db, 'users', safeUserId);
    return onSnapshot(userRef, (snapshot) => {
      const data = snapshot.exists() ? (snapshot.data() as UserProfile) : null;
      if (data) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${safeUserId}`);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try { callback(JSON.parse(cached)); } catch {}
      }
    });
  } catch {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { callback(JSON.parse(cached)); } catch {}
    }
    return () => {};
  }
}

/* =========================================================================
   3. WISHLIST REPOSITORY
   ========================================================================= */

export function subscribeToUserWishlist(userId: string, callback: (productIds: string[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const q = query(collection(db, 'wishlist'), where('userId', '==', safeUserId));
    return onSnapshot(q, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.productId) {
          ids.push(data.productId);
        }
      });
      callback(ids);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `wishlist`);
    });
  } catch {
    return () => {};
  }
}

export async function addToWishlistDoc(userId: string, productId: string): Promise<void> {
  try {
    const safeUserId = getSafeUserId(userId);
    const safeProdId = getSafeProductId(productId);
    const wishlistId = `${safeUserId}_${safeProdId}`;
    const wRef = doc(db, 'wishlist', wishlistId);
    await setDoc(wRef, sanitizeFirestoreData({
      userId: safeUserId,
      productId: safeProdId,
      createdAt: new Date().toISOString()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `wishlist`);
  }
}

export async function removeFromWishlistDoc(userId: string, productId: string): Promise<void> {
  try {
    const safeUserId = getSafeUserId(userId);
    const safeProdId = getSafeProductId(productId);
    const wishlistId = `${safeUserId}_${safeProdId}`;
    const wRef = doc(db, 'wishlist', wishlistId);
    await deleteDoc(wRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `wishlist`);
  }
}

/* =========================================================================
   4. RENTAL ORDERS & PURCHASES
   ========================================================================= */

export async function createRentalBookingDoc(booking: RentalBooking, userId: string): Promise<RentalBooking> {
  const safeBookingId = booking?.id && booking.id !== 'undefined' ? booking.id : ('rent-' + Date.now());
  const safeUserId = getSafeUserId(userId);
  try {
    const refPath = doc(db, 'rentalOrders', safeBookingId);
    await setDoc(refPath, sanitizeFirestoreData({
      ...booking,
      rentalId: safeBookingId,
      renterId: safeUserId,
      ownerId: booking.sellerPhone || 'owner_id',
      createdAt: new Date().toISOString()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `rentalOrders/${safeBookingId}`);
  }
  return booking;
}

export function subscribeToUserRentals(userId: string, callback: (bookings: RentalBooking[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const q = query(collection(db, 'rentalOrders'), where('renterId', '==', safeUserId));
    return onSnapshot(q, (snapshot) => {
      const list: RentalBooking[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RentalBooking);
      });
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'rentalOrders');
    });
  } catch {
    return () => {};
  }
}

export async function createPurchaseOrderDoc(order: PurchaseOrder, userId: string): Promise<PurchaseOrder> {
  const safeOrderId = order?.id && order.id !== 'undefined' ? order.id : ('ord-' + Date.now());
  const safeUserId = getSafeUserId(userId);
  try {
    const refPath = doc(db, 'purchaseOrders', safeOrderId);
    await setDoc(refPath, sanitizeFirestoreData({
      ...order,
      orderId: safeOrderId,
      buyerId: safeUserId,
      createdAt: new Date().toISOString()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `purchaseOrders/${safeOrderId}`);
  }
  return order;
}

/* =========================================================================
   5. REVIEWS & RATINGS
   ========================================================================= */

export async function addReviewDoc(productId: string, review: Review, sellerId: string): Promise<void> {
  const safeProdId = getSafeProductId(productId);
  const revId = 'rev-' + Date.now();
  try {
    const refPath = doc(db, 'reviews', revId);
    await setDoc(refPath, sanitizeFirestoreData({
      reviewId: revId,
      productId: safeProdId,
      sellerId: sellerId || 'seller_id',
      ...review,
      createdAt: new Date().toISOString()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reviews/${revId}`);
  }
}

/* =========================================================================
   6. NOTIFICATIONS
   ========================================================================= */

export async function createNotificationDoc(notification: AppNotification, userId: string): Promise<void> {
  const safeUserId = getSafeUserId(userId);
  const safeNotifId = notification?.id && notification.id !== 'undefined' ? notification.id : ('notif-' + Date.now());
  try {
    const refPath = doc(db, 'notifications', safeNotifId);
    await setDoc(refPath, sanitizeFirestoreData({
      ...notification,
      notificationId: safeNotifId,
      userId: safeUserId,
      createdAt: new Date().toISOString()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notifications/${safeNotifId}`);
  }
}

export function subscribeToUserNotifications(userId: string, callback: (notifs: AppNotification[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const q = query(collection(db, 'notifications'), where('userId', '==', safeUserId));
    return onSnapshot(q, (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AppNotification);
      });
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });
  } catch {
    return () => {};
  }
}

export async function updateNotificationStatusDoc(notifId: string, updates: Partial<AppNotification>): Promise<void> {
  try {
    const safeNotifId = notifId && notifId !== 'undefined' ? notifId : 'notif-default';
    const refPath = doc(db, 'notifications', safeNotifId);
    await updateDoc(refPath, sanitizeFirestoreData(updates));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `notifications/${notifId}`);
  }
}

/* =========================================================================
   7. REAL-TIME CHAT & MESSAGING
   ========================================================================= */

export function subscribeToUserChats(userId: string, callback: (chats: ChatConversation[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', safeUserId));
    return onSnapshot(q, (snapshot) => {
      const list: ChatConversation[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as ChatConversation);
      });
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'chats');
    });
  } catch {
    return () => {};
  }
}

export async function createChatConversationDoc(
  buyer: UserProfile,
  seller: Seller | UserProfile,
  product?: Product
): Promise<ChatConversation> {
  const buyerId = getSafeUserId(buyer?.id);
  const sellerId = getSafeUserId(seller?.id);
  const prodId = getSafeProductId(product?.id);
  const chatId = [buyerId, sellerId, prodId].join('_').replace(/[^a-zA-Z0-9_-]/g, '_');

  const chatRef = doc(db, 'chats', chatId);
  try {
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      return { ...snap.data(), id: chatId } as ChatConversation;
    }
  } catch (err) {
    // Ignore read failure and try creating
  }

  const newChat: ChatConversation = {
    id: chatId,
    participants: [buyerId, sellerId],
    participantDetails: {
      [buyerId]: { id: buyerId, name: buyer.name, avatar: buyer.avatar, isOnline: true },
      [sellerId]: { id: sellerId, name: seller.name, avatar: seller.avatar, isOnline: true }
    },
    lastMessage: 'Conversation started',
    lastMessageTime: 'Just now',
    lastSenderId: buyerId,
    unreadCount: { [sellerId]: 1, [buyerId]: 0 },
    ...(product?.id ? { productId: product.id } : {}),
    ...(product?.title ? { productTitle: product.title } : {}),
    ...(product?.images?.[0] ? { productImage: product.images[0] } : {}),
    ...(product?.rentPricePerDay ? { productPrice: product.rentPricePerDay } : {}),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(chatRef, sanitizeFirestoreData(newChat));
    const msgId = 'msg-' + Date.now();
    const msgRef = doc(db, 'chats', chatId, 'messages', msgId);
    await setDoc(msgRef, sanitizeFirestoreData({
      id: msgId,
      chatId,
      senderId: buyerId,
      senderName: buyer.name,
      senderAvatar: buyer.avatar,
      recipientId: sellerId,
      text: product 
        ? `Hello ${seller.name}! I am interested in renting "${product.title}" in size ${product.size}. Is this available? ✨`
        : `Hello ${seller.name}! I love your collection.`,
      type: 'text',
      timestamp: 'Just now',
      delivered: true,
      read: false,
      createdAt: serverTimestamp()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}`);
  }
  return newChat;
}

export const getOrCreateChatConversation = createChatConversationDoc;

export function subscribeToChatMessages(
  chatId: string, 
  callback: (messages: ChatMessage[]) => void,
  limitCount: number = 25
): () => void {
  try {
    const safeChatId = getSafeChatId(chatId);
    const q = query(collection(db, 'chats', safeChatId, 'messages'), orderBy('createdAt', 'asc'), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as ChatMessage);
      });
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${safeChatId}/messages`);
    });
  } catch {
    return () => {};
  }
}

export async function sendChatMessage(
  chatId: string,
  messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'delivered' | 'read'>
): Promise<ChatMessage> {
  const safeChatId = getSafeChatId(chatId);
  const msgId = 'msg-' + Date.now();
  const newMsg: ChatMessage = {
    ...messageData,
    id: msgId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    delivered: true,
    read: false
  };

  try {
    const msgRef = doc(db, 'chats', safeChatId, 'messages', msgId);
    await setDoc(msgRef, sanitizeFirestoreData({
      ...newMsg,
      createdAt: serverTimestamp()
    }));

    const chatRef = doc(db, 'chats', safeChatId);
    await updateDoc(chatRef, {
      lastMessage: newMsg.type === 'image' ? '📷 Photo' : newMsg.text,
      lastMessageTime: newMsg.timestamp,
      lastSenderId: newMsg.senderId,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `chats/${safeChatId}/messages/${msgId}`);
  }
  return newMsg;
}

export async function markChatAsRead(chatId: string, userId: string): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = doc(db, 'chats', safeChatId);
    await updateDoc(chatRef, sanitizeFirestoreData({ [`unreadCount.${userId}`]: 0 }));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`);
  }
}

export async function setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = doc(db, 'chats', safeChatId);
    await updateDoc(chatRef, sanitizeFirestoreData({ [`typing.${userId}`]: isTyping }));
  } catch {}
}

export async function archiveChatDoc(chatId: string, userId: string, isArchived: boolean): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = doc(db, 'chats', safeChatId);
    await updateDoc(chatRef, sanitizeFirestoreData({ [`isArchived.${userId}`]: isArchived }));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`);
  }
}

export async function blockUserChatDoc(chatId: string, userId: string, isBlocked: boolean): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = doc(db, 'chats', safeChatId);
    await updateDoc(chatRef, sanitizeFirestoreData({ [`isBlocked.${userId}`]: isBlocked }));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`);
  }
}

export async function deleteChatConversationDoc(chatId: string): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = doc(db, 'chats', safeChatId);
    await deleteDoc(chatRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `chats/${chatId}`);
  }
}

export async function respondToChatOfferDoc(
  chatId: string,
  messageId: string,
  status: 'accepted' | 'declined' | 'countered',
  counterPrice?: number
): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const safeMsgId = messageId && messageId !== 'undefined' ? messageId : 'msg-default';
    const msgRef = doc(db, 'chats', safeChatId, 'messages', safeMsgId);
    await updateDoc(msgRef, {
      'offerData.status': status,
      ...(counterPrice ? { 'offerData.counterPrice': counterPrice } : {})
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}/messages/${messageId}`);
  }
}

/* =========================================================================
   8. SELLER & BUYER ORDER LIFECYCLE MANAGEMENT
   ========================================================================= */

export function subscribeToSellerRentals(sellerId: string, callback: (bookings: RentalBooking[]) => void): () => void {
  try {
    const safeSellerId = getSafeUserId(sellerId);
    const q = query(collection(db, 'rentalOrders'), where('sellerPhone', '==', safeSellerId));
    return onSnapshot(q, (snapshot) => {
      const list: RentalBooking[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RentalBooking);
      });
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'rentalOrders');
    });
  } catch {
    return () => {};
  }
}

export function subscribeToSellerPurchases(sellerId: string, callback: (orders: PurchaseOrder[]) => void): () => void {
  try {
    const safeSellerId = getSafeUserId(sellerId);
    const q = query(collection(db, 'purchaseOrders'), where('sellerId', '==', safeSellerId));
    return onSnapshot(q, (snapshot) => {
      const list: PurchaseOrder[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as PurchaseOrder);
      });
      callback(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'purchaseOrders');
    });
  } catch {
    return () => {};
  }
}

export async function updateRentalOrderStatus(
  bookingId: string,
  status: RentalBooking['status'],
  depositRefundStatus?: RentalBooking['depositRefundStatus'],
  trackingNumber?: string
): Promise<void> {
  try {
    const safeId = bookingId && bookingId !== 'undefined' ? bookingId : 'rent-default';
    const docRef = doc(db, 'rentalOrders', safeId);
    const updates: any = { status };
    if (depositRefundStatus) updates.depositRefundStatus = depositRefundStatus;
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    await updateDoc(docRef, sanitizeFirestoreData(updates));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `rentalOrders/${bookingId}`);
  }
}

export async function updatePurchaseOrderStatus(
  orderId: string,
  status: PurchaseOrder['status'],
  trackingNumber?: string
): Promise<void> {
  try {
    const safeId = orderId && orderId !== 'undefined' ? orderId : 'ord-default';
    const docRef = doc(db, 'purchaseOrders', safeId);
    const updates: any = { status };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    await updateDoc(docRef, sanitizeFirestoreData(updates));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `purchaseOrders/${orderId}`);
  }
}
