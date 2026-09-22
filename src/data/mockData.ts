import { Product, WeddingStory, AppNotification, UserProfile } from '../types';
export {
  INDIAN_STATES_LIST,
  POPULAR_INDIAN_CITIES,
  CITIES_LIST,
  CITY_TO_STATE_MAP,
  getStateForCity
} from './locations';
import { CITIES_LIST } from './locations';

export const CATEGORIES_DATA = [
  {
    name: 'Bridal Lehenga',
    count: 0,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy Zardozi, Velvet & Raw Silk Masterpieces for Brides'
  },
  {
    name: 'Groom Sherwani',
    count: 0,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Royal Silk, Chikankari & Brocade Ensembles'
  },
  {
    name: 'Saree',
    count: 0,
    image: 'https://images.unsplash.com/photo-1610030469668-9655ecdd3e14?auto=format&fit=crop&w=800&q=80',
    description: 'Pure Banarasi, Kanjeevaram, Organza & Chiffon'
  },
  {
    name: 'Gown',
    count: 0,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    description: 'Cocktail, Sangeet & Reception Flared Gowns'
  },
  {
    name: 'Indo Western',
    count: 0,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    description: 'Modern silhouettes, Jacket sets & Jodhpuri suits'
  },
  {
    name: 'Pant',
    count: 0,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    description: 'Tailored formal trousers, festive pants & chinos'
  },
  {
    name: 'Shirt',
    count: 0,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Formal silk, crisp cotton & luxury designer party shirts'
  },
  {
    name: 'Pant & Shirt (Combo Set)',
    count: 0,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Coordinated formal sets, matching festive pairs & combinations'
  },
  {
    name: 'Blazer / Coat',
    count: 0,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    description: 'Tuxedos, slim fit party blazers, Nehru jackets & evening coats'
  },
  {
    name: 'Sherwani for Others',
    count: 0,
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    description: 'Designer sherwanis, kurtas & achkans for groomsmen, family & guests'
  },
  {
    name: 'Kurta Pajama',
    count: 0,
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional and designer kurta sets for festive occasions'
  },
  {
    name: 'Kids Wedding Wear',
    count: 0,
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80',
    description: 'Mini Lehengas, Kurta Pajamas & Prince Coat Sets'
  },
  {
    name: 'Jewelry',
    count: 0,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Kundan, Polki, Temple Gold & Jadau Bridal Sets'
  },
  {
    name: 'Accessories',
    count: 0,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Potlis, Dupattas, Safas, Kalgi, Belts & Brooches'
  },
  {
    name: 'Shoes',
    count: 0,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted Zari Mojaris, Juttis & Embellished Heels'
  },
  {
    name: 'Designer Wear',
    count: 0,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    description: 'Couture collections from celebrated fashion houses'
  }
];

export const BRANDS_LIST = [
  'Sabyasachi Heritage',
  'Manish Malhotra Couture',
  'Tarun Tahiliani',
  'Anita Dongre',
  'Raw Mango',
  'Manyavar & Mohey',
  'Abhinav Mishra',
  'Ritu Kumar',
  'Seema Gujral',
  'BGK Signature'
];

export const FABRICS_LIST = [
  'Raw Silk & Zari',
  'Micro Velvet',
  'Pure Banarasi Silk',
  'Organza & Tissue',
  'Chiffon & Georgette',
  'Chikankari Cotton Silk',
  'Net & Tulle',
  'Brocade',
  'Kanjeevaram Silk'
];

export const COLORS_LIST = [
  { name: 'Royal Crimson Red', hex: '#800020' },
  { name: 'Emerald Green', hex: '#124E3F' },
  { name: 'Mustard Haldi Gold', hex: '#D4AF37' },
  { name: 'Dusty Rose Pink', hex: '#D88A8A' },
  { name: 'Ivory & Champagne', hex: '#EAE6DF' },
  { name: 'Royal Sapphire Blue', hex: '#1A365D' },
  { name: 'Midnight Black', hex: '#1A1A1A' },
  { name: 'Lavender & Lilac', hex: '#B39DDB' }
];

export const POPULAR_SEARCHES = [
  'Sabyasachi Bridal Lehenga',
  'Manish Malhotra Sequins',
  'Royal Sherwani for Groom',
  'Banarasi Pure Silk Saree',
  'Reception Flared Gown',
  'Tarun Tahiliani Draped Saree',
  'Haldi Yellow Outfit',
  'Cocktail Indo Western'
];

export const FEATURED_DESIGNER_HOUSES = [
  {
    id: 'des-1',
    name: 'Sabyasachi Heritage Atelier',
    designer: 'Sabyasachi Mukherjee',
    location: 'Kolkata & Mumbai',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    tagline: 'Handcrafted bridal couture, heritage zardozi & vintage royal ensembles',
    totalOutfits: 0,
    rating: 4.98,
    verified: true
  },
  {
    id: 'des-2',
    name: 'Manish Malhotra Couture Lounge',
    designer: 'Manish Malhotra',
    location: 'Mumbai & Delhi NCR',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    tagline: 'Contemporary glamour, sequined cocktail lehengas & modern reception gowns',
    totalOutfits: 0,
    rating: 4.95,
    verified: true
  },
  {
    id: 'des-3',
    name: 'Tarun Tahiliani Atelier',
    designer: 'Tarun Tahiliani',
    location: 'Delhi NCR',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    tagline: 'Sculpted drapes, delicate chikankari, and regal groom sherwanis',
    totalOutfits: 0,
    rating: 4.92,
    verified: true
  },
  {
    id: 'des-4',
    name: 'Anita Dongre Sustainable Closet',
    designer: 'Anita Dongre',
    location: 'Jaipur & Mumbai',
    image: 'https://images.unsplash.com/photo-1610030469668-9655ecdd3e14?auto=format&fit=crop&w=600&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    tagline: 'Rajasthani Gota Patti, handwoven organic silks & timeless pastels',
    totalOutfits: 0,
    rating: 4.96,
    verified: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_STORIES: WeddingStory[] = [
  {
    id: 'story-1',
    title: 'Royal Udaipur Bride',
    author: 'Avantika Couture',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    tag: 'Bridal Inspiration',
    itemsCount: 0,
    featuredProductIds: []
  },
  {
    id: 'story-2',
    title: 'Bespoke Groom Looks',
    author: 'Royal Heritage',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    tag: 'Groom Sherwanis',
    itemsCount: 0,
    featuredProductIds: []
  },
  {
    id: 'story-3',
    title: 'Heritage Kanjeevarams',
    author: 'Vaidyanathan Silk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1610030469668-9655ecdd3e14?auto=format&fit=crop&w=600&q=80',
    tag: 'Pure Zari Sarees',
    itemsCount: 0,
    featuredProductIds: []
  },
  {
    id: 'story-4',
    title: 'Cocktail Trails',
    author: 'Manish Malhotra Closet',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
    tag: 'Evening Glam',
    itemsCount: 0,
    featuredProductIds: []
  },
  {
    id: 'story-5',
    title: 'Polki & Jadau Sets',
    author: 'Johari Jewels',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    tag: 'Royal Jewelry',
    itemsCount: 0,
    featuredProductIds: []
  }
];

export const INITIAL_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  city: 'Mumbai',
  state: 'Maharashtra',
  bio: '',
  role: 'buyer',
  isVerified: false,
  joinedDate: 'Joined Recently',
  balanceEarnings: 0
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    type: 'approval',
    title: 'Welcome to BGK WEAR! ✨',
    description: 'Your premier peer-to-peer bridal & wedding outfit marketplace is live. Tap the "+ List Outfit" button to publish your first designer creation with 0% platform commission.',
    timestamp: 'Just now',
    read: false
  }
];
