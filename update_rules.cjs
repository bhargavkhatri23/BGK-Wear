const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  `    // 2. Outfits & Products collection
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
    }`,
  `    // 2. Outfits & Products collection
    match /outfits/{productId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.userId == request.auth.uid || resource.data.sellerId == request.auth.uid || isAdmin());
    }
    match /products/{productId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.sellerId == request.auth.uid || resource.data.userId == request.auth.uid || isAdmin());
    }`
);

fs.writeFileSync('firestore.rules', rules);
console.log('firestore.rules updated successfully!');
