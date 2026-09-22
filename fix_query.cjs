const fs = require('fs');
let code = fs.readFileSync('src/services/firestoreService.ts', 'utf8');

code = code.replace(
  "q = query(productsRef, where('sellerId', '==', userId), limit(100));",
  "q = query(productsRef, where('userId', '==', userId), limit(100));"
);

fs.writeFileSync('src/services/firestoreService.ts', code);
