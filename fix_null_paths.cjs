const fs = require('fs');

let content = fs.readFileSync('src/services/firestoreService.ts', 'utf8');

// Let's add top-level helper functions for safe ID resolution at the top of firestoreService.ts
const helpersCode = `
// Safe ID resolution helpers to prevent /null paths
function getSafeUserId(userId?: string): string {
  return auth.currentUser?.uid || (userId && userId !== 'undefined' && userId !== 'null' ? userId : 'usr-1');
}
function getSafeProductId(productId?: string): string {
  return productId && productId !== 'undefined' && productId !== 'null' ? productId : ('prod-' + Date.now());
}
function getSafeChatId(chatId?: string): string {
  return chatId && chatId !== 'undefined' && chatId !== 'null' ? chatId : ('chat-' + Date.now());
}
`;

if (!content.includes('getSafeUserId')) {
  content = content.replace(
    `import { db, auth } from './firebase';`,
    `import { db, auth } from './firebase';\n${helpersCode}`
  );
}

fs.writeFileSync('src/services/firestoreService.ts', content);
console.log('Added safe ID helpers to firestoreService.ts');
