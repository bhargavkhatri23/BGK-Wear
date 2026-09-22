const fs = require('fs');

// 1. Update src/services/firebase.ts to export database
let fbContent = `import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  setLogLevel
} from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
const database = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

setPersistence(auth, browserLocalPersistence).catch(() => {});

try { setLogLevel('silent'); } catch (_) {}

export const isFirebaseLive = (): boolean => true;

export { app, auth, db, database, storage, googleProvider };
`;

fs.writeFileSync('src/services/firebase.ts', fbContent);
console.log('Updated src/services/firebase.ts with Realtime Database (database export)');

// 2. Rewrite src/services/firestoreService.ts to use Firebase Realtime Database (ref, set, get, update, remove, push, onValue, serverTimestamp)
let rtdbServiceContent = `import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  push, 
  onValue, 
  serverTimestamp 
} from 'firebase/database';
import { database, auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { 
  Product, 
  UserProfile, 
  RentalBooking, 
  PurchaseOrder, 
  AppNotification, 
  Review, 
  ChatMessage, 
  ChatConversation 
} from '../types';

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
   1. PRODUCTS / OUTFITS REPOSITORY (Realtime Database)
   ========================================================================= */

export async function seedInitialProductsIfEmpty(): Promise<void> {
  return;
}

export async function createProductDoc(product: Partial<Product>, currentUser: UserProfile): Promise<Product> {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Anonymous auth note:', e);
    }
  }
  const currentUserId = getSafeUserId(currentUser?.id);
  const prodId = getSafeProductId(product?.id);

  const newProduct: Product = {
    id: prodId,
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
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
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

  try {
    const prodRef = ref(database, \`outfits/\${prodId}\`);
    await set(prodRef, {
      ...newProduct,
      userId: currentUserId,
      sellerId: currentUserId,
      createdBy: currentUserId,
      sellerName: currentUser.name || 'Verified Wardrobe Owner',
      rentPrice: newProduct.rentPricePerDay,
      timestamp: serverTimestamp()
    });
    console.log('[RTDB] Outfit saved successfully:', prodId);
  } catch (err: any) {
    console.error('[RTDB Error] Failed to save product:', err);
    throw new Error(err?.message || 'Failed to save outfit to Realtime Database.');
  }
  return newProduct;
}

export function subscribeToProducts(callback: (products: Product[]) => void, userId?: string): () => void {
  try {
    const outfitsRef = ref(database, 'outfits');
    return onValue(outfitsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const list: Product[] = [];
      Object.keys(val).forEach((key) => {
        const item = val[key];
        if (item) {
          const product: Product = {
            ...item,
            id: key,
            collectionName: 'outfits'
          };
          if (!userId || product.userId === userId || product.sellerId === userId) {
            list.push(product);
          }
        }
      });
      callback(list);
    }, (error) => {
      console.warn('[RTDB] Outfits subscription error:', error);
      callback([]);
    });
  } catch (err) {
    console.warn('[RTDB] Subscription init error:', err);
    callback([]);
    return () => {};
  }
}

export async function updateProductDoc(productId: string, updates: Partial<Product>, collectionName: string = 'outfits'): Promise<void> {
  try {
    const safeId = getSafeProductId(productId);
    const prodRef = ref(database, \`\${collectionName}/\${safeId}\`);
    await update(prodRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[RTDB] Update error:', err);
  }
}

export async function deleteProductDoc(productId: string, collectionName: string = 'outfits'): Promise<void> {
  try {
    const safeId = getSafeProductId(productId);
    const prodRef = ref(database, \`\${collectionName}/\${safeId}\`);
    await remove(prodRef);
  } catch (err) {
    console.warn('[RTDB] Delete error:', err);
  }
}

export async function incrementProductStat(productId: string, stat: 'views' | 'likes', collectionName: string = 'outfits'): Promise<void> {
  try {
    const safeId = getSafeProductId(productId);
    const prodRef = ref(database, \`\${collectionName}/\${safeId}\`);
    const snap = await get(prodRef);
    if (snap.exists()) {
      const data = snap.val();
      const field = stat === 'views' ? 'viewsCount' : 'likesCount';
      const current = data[field] || data[stat] || 0;
      await update(prodRef, { [field]: current + 1 });
    }
  } catch (err) {
    console.warn('[RTDB] Increment stat error:', err);
  }
}

/* =========================================================================
   2. USER PROFILES (Realtime Database)
   ========================================================================= */

export async function saveUserProfileDoc(userId: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const safeUserId = getSafeUserId(userId);
    const userRef = ref(database, \`users/\${safeUserId}\`);
    await update(userRef, {
      uid: safeUserId,
      ...profile,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RTDB] User profile save error:', err);
  }
}

export function subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const userRef = ref(database, \`users/\${safeUserId}\`);
    return onValue(userRef, (snapshot) => {
      callback(snapshot.val() || null);
    }, () => {});
  } catch {
    return () => {};
  }
}

/* =========================================================================
   3. WISHLIST REPOSITORY (Realtime Database)
   ========================================================================= */

export function subscribeToUserWishlist(userId: string, callback: (productIds: string[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const wRef = ref(database, \`wishlist/\${safeUserId}\`);
    return onValue(wRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const ids = Object.keys(val).filter(k => val[k]);
      callback(ids);
    }, () => {});
  } catch {
    return () => {};
  }
}

export async function addToWishlistDoc(userId: string, productId: string): Promise<void> {
  try {
    const safeUserId = getSafeUserId(userId);
    const safeProdId = getSafeProductId(productId);
    const wRef = ref(database, \`wishlist/\${safeUserId}/\${safeProdId}\`);
    await set(wRef, true);
  } catch (err) {
    console.warn('[RTDB] Add wishlist error:', err);
  }
}

export async function removeFromWishlistDoc(userId: string, productId: string): Promise<void> {
  try {
    const safeUserId = getSafeUserId(userId);
    const safeProdId = getSafeProductId(productId);
    const wRef = ref(database, \`wishlist/\${safeUserId}/\${safeProdId}\`);
    await remove(wRef);
  } catch (err) {
    console.warn('[RTDB] Remove wishlist error:', err);
  }
}

/* =========================================================================
   4. RENTAL ORDERS & PURCHASES (Realtime Database)
   ========================================================================= */

export async function createRentalBookingDoc(booking: RentalBooking, userId: string): Promise<RentalBooking> {
  try {
    const safeBookingId = booking?.id && booking.id !== 'undefined' ? booking.id : ('rent-' + Date.now());
    const safeUserId = getSafeUserId(userId);
    const refPath = ref(database, \`rentalOrders/\${safeBookingId}\`);
    await set(refPath, {
      ...booking,
      rentalId: safeBookingId,
      renterId: safeUserId,
      ownerId: booking.sellerPhone || 'owner_id',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RTDB] Rental booking error:', err);
  }
  return booking;
}

export function subscribeToUserRentals(userId: string, callback: (bookings: RentalBooking[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const rentalsRef = ref(database, 'rentalOrders');
    return onValue(rentalsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const list: RentalBooking[] = [];
      Object.keys(val).forEach(k => {
        const item = val[k];
        if (item && item.renterId === safeUserId) {
          list.push(item);
        }
      });
      callback(list);
    }, () => {});
  } catch {
    return () => {};
  }
}

export async function createPurchaseOrderDoc(order: PurchaseOrder, userId: string): Promise<PurchaseOrder> {
  try {
    const safeOrderId = order?.id && order.id !== 'undefined' ? order.id : ('ord-' + Date.now());
    const safeUserId = getSafeUserId(userId);
    const refPath = ref(database, \`purchaseOrders/\${safeOrderId}\`);
    await set(refPath, {
      ...order,
      orderId: safeOrderId,
      buyerId: safeUserId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RTDB] Purchase order error:', err);
  }
  return order;
}

/* =========================================================================
   5. REVIEWS & RATINGS (Realtime Database)
   ========================================================================= */

export async function addReviewDoc(productId: string, review: Review, sellerId: string): Promise<void> {
  try {
    const safeProdId = getSafeProductId(productId);
    const revId = 'rev-' + Date.now();
    const refPath = ref(database, \`reviews/\${revId}\`);
    await set(refPath, {
      reviewId: revId,
      productId: safeProdId,
      sellerId: sellerId || 'seller_id',
      ...review,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RTDB] Add review error:', err);
  }
}

/* =========================================================================
   6. NOTIFICATIONS (Realtime Database)
   ========================================================================= */

export async function createNotificationDoc(notification: AppNotification, userId: string): Promise<void> {
  try {
    const safeUserId = getSafeUserId(userId);
    const safeNotifId = notification?.id && notification.id !== 'undefined' ? notification.id : ('notif-' + Date.now());
    const refPath = ref(database, \`notifications/\${safeNotifId}\`);
    await set(refPath, {
      ...notification,
      notificationId: safeNotifId,
      userId: safeUserId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RTDB] Notification error:', err);
  }
}

export function subscribeToUserNotifications(userId: string, callback: (notifs: AppNotification[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const notifRef = ref(database, 'notifications');
    return onValue(notifRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const list: AppNotification[] = [];
      Object.keys(val).forEach(k => {
        const item = val[k];
        if (item && item.userId === safeUserId) {
          list.push(item);
        }
      });
      callback(list);
    }, () => {});
  } catch {
    return () => {};
  }
}

export async function updateNotificationStatusDoc(notifId: string, updates: Partial<AppNotification>): Promise<void> {
  try {
    const safeNotifId = notifId && notifId !== 'undefined' ? notifId : 'notif-default';
    const refPath = ref(database, \`notifications/\${safeNotifId}\`);
    await update(refPath, updates);
  } catch {}
}

/* =========================================================================
   7. REAL-TIME CHAT & MESSAGING (Realtime Database)
   ========================================================================= */

export function subscribeToUserChats(userId: string, callback: (chats: ChatConversation[]) => void): () => void {
  try {
    const safeUserId = getSafeUserId(userId);
    const chatsRef = ref(database, 'chats');
    return onValue(chatsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const list: ChatConversation[] = [];
      Object.keys(val).forEach(chatId => {
        const chat = val[chatId];
        if (chat && chat.participants && Array.isArray(chat.participants) && chat.participants.includes(safeUserId)) {
          list.push({ ...chat, id: chatId });
        }
      });
      callback(list);
    }, () => {});
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

  const chatRef = ref(database, \`chats/\${chatId}\`);
  const snap = await get(chatRef);
  if (snap.exists()) {
    return { ...snap.val(), id: chatId };
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
    productId: product?.id,
    productTitle: product?.title,
    productImage: product?.images?.[0],
    productPrice: product?.rentPricePerDay,
    updatedAt: new Date().toISOString()
  };

  try {
    await set(chatRef, newChat);
    const msgId = 'msg-' + Date.now();
    const msgRef = ref(database, \`chats/\${chatId}/messages/\${msgId}\`);
    await set(msgRef, {
      id: msgId,
      chatId,
      senderId: buyerId,
      senderName: buyer.name,
      senderAvatar: buyer.avatar,
      recipientId: sellerId,
      text: product 
        ? \`Hello \${seller.name}! I am interested in renting "\${product.title}" in size \${product.size}. Is this available? ✨\`
        : \`Hello \${seller.name}! I love your collection.\`,
      type: 'text',
      timestamp: 'Just now',
      delivered: true,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[RTDB] Create chat error:', err);
  }
  return newChat;
}

export function subscribeToChatMessages(
  chatId: string, 
  callback: (messages: ChatMessage[]) => void
): () => void {
  try {
    const safeChatId = getSafeChatId(chatId);
    const msgRef = ref(database, \`chats/\${safeChatId}/messages\`);
    return onValue(msgRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const list: ChatMessage[] = [];
      Object.keys(val).forEach(mId => {
        list.push({ ...val[mId], id: mId });
      });
      list.sort((a, b) => (a.createdAt && b.createdAt ? 0 : 0));
      callback(list);
    }, () => {});
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
    const msgRef = ref(database, \`chats/\${safeChatId}/messages/\${msgId}\`);
    await set(msgRef, {
      ...newMsg,
      createdAt: serverTimestamp()
    });

    const chatRef = ref(database, \`chats/\${safeChatId}\`);
    await update(chatRef, {
      lastMessage: newMsg.type === 'image' ? '📷 Photo' : newMsg.text,
      lastMessageTime: newMsg.timestamp,
      lastSenderId: newMsg.senderId,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[RTDB] Send message error:', err);
  }
  return newMsg;
}

export async function markChatAsRead(chatId: string, userId: string): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = ref(database, \`chats/\${safeChatId}\`);
    await update(chatRef, { \`unreadCount.\${userId}\`: 0 });
  } catch {}
}

export async function setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = ref(database, \`chats/\${safeChatId}\`);
    await update(chatRef, { \`typing.\${userId}\`: isTyping });
  } catch {}
}

export async function archiveChatDoc(chatId: string, userId: string, isArchived: boolean): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = ref(database, \`chats/\${safeChatId}\`);
    await update(chatRef, { \`isArchived.\${userId}\`: isArchived });
  } catch {}
}

export async function blockUserChatDoc(chatId: string, userId: string, isBlocked: boolean): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = ref(database, \`chats/\${safeChatId}\`);
    await update(chatRef, { \`isBlocked.\${userId}\`: isBlocked });
  } catch {}
}

export async function deleteChatConversationDoc(chatId: string): Promise<void> {
  try {
    const safeChatId = getSafeChatId(chatId);
    const chatRef = ref(database, \`chats/\${safeChatId}\`);
    await remove(chatRef);
  } catch {}
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
    const msgRef = ref(database, \`chats/\${safeChatId}/messages/\${safeMsgId}\`);
    await update(msgRef, {
      'offerData/status': status,
      ...(counterPrice ? { 'offerData/counterPrice': counterPrice } : {})
    });
  } catch {}
}

/* =========================================================================
   8. SELLER & BUYER ORDER LIFECYCLE MANAGEMENT (Realtime Database)
   ========================================================================= */

export function subscribeToSellerRentals(sellerId: string, callback: (bookings: RentalBooking[]) => void): () => void {
  try {
    const safeSellerId = getSafeUserId(sellerId);
    const rentalsRef = ref(database, 'rentalOrders');
    return onValue(rentalsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const list: RentalBooking[] = [];
      Object.keys(val).forEach(k => {
        const item = val[k];
        if (item && item.sellerPhone === safeSellerId) {
          list.push(item);
        }
      });
      callback(list);
    }, () => {});
  } catch {
    return () => {};
  }
}

export function subscribeToSellerPurchases(sellerId: string, callback: (orders: PurchaseOrder[]) => void): () => void {
  try {
    const safeSellerId = getSafeUserId(sellerId);
    const ordersRef = ref(database, 'purchaseOrders');
    return onValue(ordersRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback([]);
        return;
      }
      const list: PurchaseOrder[] = [];
      Object.keys(val).forEach(k => {
        const item = val[k];
        if (item && item.sellerId === safeSellerId) {
          list.push(item);
        }
      });
      callback(list);
    }, () => {});
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
    const docRef = ref(database, \`rentalOrders/\${safeId}\`);
    const updates: any = { status };
    if (depositRefundStatus) updates.depositRefundStatus = depositRefundStatus;
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    await update(docRef, updates);
  } catch (err) {
    console.warn('[RTDB] Update rental order error:', err);
  }
}

export async function updatePurchaseOrderStatus(
  orderId: string,
  status: PurchaseOrder['status'],
  trackingNumber?: string
): Promise<void> {
  try {
    const safeId = orderId && orderId !== 'undefined' ? orderId : 'ord-default';
    const docRef = ref(database, \`purchaseOrders/\${safeId}\`);
    const updates: any = { status };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    await update(docRef, updates);
  } catch (err) {
    console.warn('[RTDB] Update purchase order error:', err);
  }
}
`;

fs.writeFileSync('src/services/firestoreService.ts', rtdbServiceContent);
console.log('Successfully rewrote firestoreService.ts using Firebase Realtime Database methods (ref, set, get, update, remove, onValue)!');
