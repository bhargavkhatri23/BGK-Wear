const fs = require('fs');
let code = fs.readFileSync('src/data/mockData.ts', 'utf8');

const target = `export const INITIAL_USER: UserProfile = {
  id: 'usr-1',
  name: 'Bhargav Khatri',
  email: 'bhargavkhatri2302@gmail.com',
  phone: '+91 98765 43210',
  whatsapp: '+919876543210',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  city: 'Mumbai',
  state: 'Maharashtra',
  bio: 'Wedding fashion enthusiast & curator. Renting and curating luxury traditional couture across India.',
  role: 'seller',
  isVerified: true,
  joinedDate: 'Joined Recently',
  balanceEarnings: 0
};`;

const replacement = `export const INITIAL_USER: UserProfile = {
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
};`;

code = code.replace(target, replacement);
fs.writeFileSync('src/data/mockData.ts', code);
