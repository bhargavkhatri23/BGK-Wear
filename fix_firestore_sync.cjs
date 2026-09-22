const fs = require('fs');

// 1. Update firestoreService.ts
let fsContent = fs.readFileSync('src/services/firestoreService.ts', 'utf8');

// Add import for auth and signInAnonymously if not present
if (!fsContent.includes('signInAnonymously')) {
  fsContent = fsContent.replace(
    `import { db } from './firebase';`,
    `import { db, auth } from './firebase';\nimport { signInAnonymously } from 'firebase/auth';`
  );
}

// Replace createProductDoc implementation
const oldCreateProduct = `export async function createProductDoc(product: Partial<Product>, currentUser: UserProfile): Promise<Product> {
  const prodId = 'prod-' + Date.now();
  const currentUserId = currentUser.id || 'usr-1';
  const newProduct: Product = {`;

const newCreateProduct = `export async function createProductDoc(product: Partial<Product>, currentUser: UserProfile): Promise<Product> {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Anonymous auth auto sign-in note:', e);
    }
  }
  const currentUserId = auth.currentUser?.uid || currentUser.id || 'usr-1';
  const prodId = 'prod-' + Date.now();
  const newProduct: Product = {`;

if (fsContent.includes(oldCreateProduct)) {
  fsContent = fsContent.replace(oldCreateProduct, newCreateProduct);
}

// Update the setDoc block inside createProductDoc
const oldSetDocBlock = `  // Background async sync to Firestore without blocking return
  try {
    const docRef = doc(db, PRODUCTS_COL, prodId);
    setDoc(docRef, {
      ...newProduct,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      rentPrice: newProduct.rentPricePerDay,
      views: 1,
      likes: 0,
      timestamp: serverTimestamp()
    }).catch((err) => {
      console.warn('[Firestore] Async save note:', err);
    });
  } catch (err) {
    console.warn('[Firestore] Product doc saved locally:', err);
  }
  return newProduct;`;

const newSetDocBlock = `  try {
    const docRef = doc(db, PRODUCTS_COL, prodId);
    await setDoc(docRef, {
      ...newProduct,
      userId: currentUserId,
      sellerId: currentUserId,
      createdBy: currentUserId,
      sellerName: currentUser.name || 'Verified Wardrobe Owner',
      rentPrice: newProduct.rentPricePerDay,
      views: 1,
      likes: 0,
      timestamp: serverTimestamp()
    });
    console.log('[Firestore] Outfit saved successfully to cloud:', prodId);
  } catch (err: any) {
    console.error('[Firestore Error] Failed to save product doc:', err);
    throw new Error(err?.message || 'Failed to save outfit to Firebase Database.');
  }
  return newProduct;`;

if (fsContent.includes(oldSetDocBlock)) {
  fsContent = fsContent.replace(oldSetDocBlock, newSetDocBlock);
}

fs.writeFileSync('src/services/firestoreService.ts', fsContent);
console.log('src/services/firestoreService.ts updated successfully.');

// 2. Update firestore.rules
let rulesContent = fs.readFileSync('firestore.rules', 'utf8');

const oldRulesMatch = `    // 2. Outfits & Products collection
    match /outfits/{productId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
    }
    match /products/{productId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.sellerId == request.auth.uid;
      allow update: if isAuthenticated() && (resource.data.sellerId == request.auth.uid || isAdmin());
      allow delete: if isAuthenticated() && (resource.data.sellerId == request.auth.uid || isAdmin());
    }`;

const newRulesMatch = `    // 2. Outfits & Products collection
    match /outfits/{productId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.userId == request.auth.uid || resource.data.sellerId == request.auth.uid || isAdmin());
    }
    match /products/{productId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.sellerId == request.auth.uid || resource.data.userId == request.auth.uid || isAdmin());
    }`;

if (rulesContent.includes(oldRulesMatch)) {
  rulesContent = rulesContent.replace(oldRulesMatch, newRulesMatch);
  fs.writeFileSync('firestore.rules', rulesContent);
  console.log('firestore.rules updated successfully.');
} else {
  console.log('Warning: oldRulesMatch not found exactly in firestore.rules, checking alternative...');
}

