const fs = require('fs');
let code = fs.readFileSync('src/services/firestoreService.ts', 'utf8');

const target = `export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  try {
    const productsRef = collection(db, PRODUCTS_COL);
    const q = query(productsRef, limit(100));`;

const replacement = `export function subscribeToProducts(callback: (products: Product[]) => void, userId?: string): () => void {
  try {
    const productsRef = collection(db, PRODUCTS_COL);
    let q;
    if (userId) {
      q = query(productsRef, where('sellerId', '==', userId), limit(100));
    } else {
      // If user specifically requested to only show logged-in user's outfits, we can return empty when no userId, or we can fetch all.
      // Based on instructions: "app queries Firestore specifically for outfits created by that exact mobile number / authenticated User ID"
      // So if no userId, return empty.
      callback([]);
      return () => {};
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/firestoreService.ts', code);
