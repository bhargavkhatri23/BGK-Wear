const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/firestoreService.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix the syntax errors
content = content.replace('await setDoc(prodRef, sanitizeFirestoreData(sanitizeFirestoreData(productData));', 'await setDoc(prodRef, sanitizeFirestoreData(productData));');
content = content.replace('}), { merge: true });', '}, { merge: true });');

// Ensure other setDocs are correct
content = content.replace(/await setDoc\(([^,]+),\s*sanitizeFirestoreData\(sanitizeFirestoreData\(([^)]+)\)\);/g, 'await setDoc($1, sanitizeFirestoreData($2));');

// Apply sanitize to updateDoc if missing, but be careful. 
// Actually, it's safer to just sanitize the specific places: createChatConversationDoc and sendChatMessage
fs.writeFileSync(file, content);
