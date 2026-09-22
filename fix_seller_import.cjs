const fs = require('fs');
let code = fs.readFileSync('src/services/firestoreService.ts', 'utf8');

code = code.replace(
  `import { 
  Product, 
  UserProfile, 
  RentalBooking, 
  PurchaseOrder, 
  AppNotification, 
  Review, 
  ChatMessage, 
  ChatConversation 
} from '../types';`,
  `import { 
  Product, 
  UserProfile, 
  Seller,
  RentalBooking, 
  PurchaseOrder, 
  AppNotification, 
  Review, 
  ChatMessage, 
  ChatConversation 
} from '../types';`
);

fs.writeFileSync('src/services/firestoreService.ts', code);
console.log('Added Seller to types import in firestoreService.ts');
