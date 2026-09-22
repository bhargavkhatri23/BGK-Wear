const fs = require('fs');
let code = fs.readFileSync('src/services/firestoreService.ts', 'utf8');

code = code.replace(
  `await update(chatRef, { \`unreadCount.\${userId}\`: 0 });`,
  `await update(chatRef, { [\`unreadCount.\${userId}\`]: 0 });`
);

code = code.replace(
  `await update(chatRef, { \`typing.\${userId}\`: isTyping });`,
  `await update(chatRef, { [\`typing.\${userId}\`]: isTyping });`
);

code = code.replace(
  `await update(chatRef, { \`isArchived.\${userId}\`: isArchived });`,
  `await update(chatRef, { [\`isArchived.\${userId}\`]: isArchived });`
);

code = code.replace(
  `await update(chatRef, { \`isBlocked.\${userId}\`: isBlocked });`,
  `await update(chatRef, { [\`isBlocked.\${userId}\`]: isBlocked });`
);

fs.writeFileSync('src/services/firestoreService.ts', code);
console.log('Fixed computed property keys in firestoreService.ts');
