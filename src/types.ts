export type ListingType = 'rent' | 'buy' | 'both';

export type OutfitCondition = 'Brand New' | 'Like New (Worn Once)' | 'Gently Used' | 'Vintage Mint';

export type OutfitCategory = 
  | 'Bridal Lehenga'
  | 'Groom Sherwani'
  | 'Saree'
  | 'Gown'
  | 'Indo Western'
  | 'Pant'
  | 'Shirt'
  | 'Pant & Shirt (Combo Set)'
  | 'Blazer / Coat'
  | 'Sherwani for Others'
  | 'Kurta Pajama'
  | 'Kids Wedding Wear'
  | 'Jewelry'
  | 'Accessories'
  | 'Shoes'
  | 'Designer Wear';

export type OutfitSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size' | 'Custom Fit';

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  userCity: string;
  rating: number;
  date: string;
  comment: string;
  fitFeedback: 'True to Size' | 'Runs Small' | 'Runs Large' | 'Perfect Custom Fit';
  photos?: string[];
  occasion: string;
  likes: number;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  city: string;
  state: string;
  bio: string;
  phone: string;
  whatsapp: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalListings: number;
  joinedYear: string;
  responseTime: string;
}

export interface Product {
  id: string;
  userId?: string; // ID of the user who created/owns this outfit listing
  createdBy?: string; // Creator ID for ownership checking
  sellerId?: string; // Seller profile ID
  title: string;
  description: string;
  category: OutfitCategory;
  brand: string;
  size: OutfitSize;
  color: string;
  colorHex: string;
  condition: OutfitCondition;
  listingType: ListingType;
  rentPricePerDay: number; // in INR ₹
  salePrice?: number; // in INR ₹
  securityDeposit: number; // in INR ₹
  originalRetailPrice: number; // in INR ₹
  images: string[];
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  city: string;
  state: string;
  seller: Seller;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  availableFrom: string; // YYYY-MM-DD
  availableTo: string; // YYYY-MM-DD
  status: 'active' | 'pending_approval' | 'rented' | 'sold' | 'rejected';
  fabric: string;
  occasion: string[];
  measurements?: {
    bust?: string;
    waist?: string;
    length?: string;
    shoulder?: string;
    hip?: string;
    alterationMargin?: string;
  };
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  collectionName?: 'products' | 'outfits';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address?: string;
  avatar: string;
  city: string;
  district?: string;
  state: string;
  pincode?: string;
  bio: string;
  role: 'buyer' | 'seller' | 'admin';
  isVerified: boolean;
  joinedDate: string;
  balanceEarnings?: number;
  isGuest?: boolean;
  isProfileComplete?: boolean;
}

export interface RentalBooking {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  category: string;
  sellerId?: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  renterId?: string;
  renterName?: string;
  renterPhone?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentAmount: number;
  securityDeposit: number;
  fittingInsurance: boolean;
  cleaningFee: number;
  totalPaid: number;
  status: 'Pending Confirmation' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'In Use' | 'Returned' | 'Completed' | 'Cancelled' | 'Rejected';
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  bookingDate: string;
  trackingNumber?: string;
  depositRefundStatus: 'Active Security Deposit' | 'Refund Initiated' | 'Refunded to Renter' | 'Refunded to Source' | 'Deducted for damage';
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId?: string;
  sellerName: string;
  sellerPhone: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  salePrice: number;
  shippingFee: number;
  totalPaid: number;
  status: 'Processing' | 'Seller Approved' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Completed' | 'Cancelled';
  orderDate: string;
  trackingNumber?: string;
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface ChatOfferData {
  productId: string;
  productTitle: string;
  productImage: string;
  offerType: 'rent' | 'buy';
  originalPrice: number;
  offeredPrice: number;
  rentalDays?: number;
  startDate?: string;
  endDate?: string;
  note?: string;
  counterPrice?: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  text: string;
  type: 'text' | 'image' | 'offer' | 'order_update' | 'system';
  imageUrl?: string;
  offerData?: ChatOfferData;
  orderData?: {
    orderId: string;
    orderType: 'rental' | 'purchase';
    status: string;
    amount: number;
  };
  timestamp: string;
  createdAt?: any;
  delivered: boolean;
  read: boolean;
}

export interface ChatParticipantInfo {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  city?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participantDetails: {
    [userId: string]: ChatParticipantInfo;
  };
  lastMessage: string;
  lastMessageTime: string;
  lastSenderId: string;
  unreadCount: {
    [userId: string]: number;
  };
  productId?: string;
  productTitle?: string;
  productImage?: string;
  productPrice?: number;
  isArchived?: {
    [userId: string]: boolean;
  };
  isBlocked?: {
    [userId: string]: boolean;
  };
  typing?: {
    [userId: string]: boolean;
  };
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  type: 'rental_request' | 'purchase_request' | 'message' | 'offer' | 'approval' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  relatedProductId?: string;
  relatedBookingId?: string;
  actionRequired?: boolean;
  actionState?: 'pending' | 'accepted' | 'declined';
  senderAvatar?: string;
  senderName?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  listingType: 'all' | 'rent' | 'buy' | 'both';
  city: string;
  minRentPrice: number;
  maxRentPrice: number;
  minSalePrice: number;
  maxSalePrice: number;
  sizes: string[];
  colors: string[];
  fabrics: string[];
  brands: string[];
  conditions: string[];
  availabilityOnly?: boolean;
  sortBy: 'featured' | 'newest' | 'price_low' | 'price_high' | 'rating' | 'discount' | 'views' | 'saved';
}

export interface WeddingStory {
  id: string;
  title: string;
  author: string;
  avatar: string;
  coverImage: string;
  tag: string;
  itemsCount: number;
  featuredProductIds: string[];
}
