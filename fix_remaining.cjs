const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/firestoreService.ts');
let content = fs.readFileSync(file, 'utf8');

// Just wrap the object literal in setDoc(msgRef, ...)
content = content.replace(/await setDoc\(msgRef, \{/g, 'await setDoc(msgRef, sanitizeFirestoreData({');
// And add the closing parenthesis
content = content.replace(/createdAt: serverTimestamp\(\)\n    \}\);/g, 'createdAt: serverTimestamp()\n    }));');
content = content.replace(/createdAt: serverTimestamp\(\)\n      \}\);/g, 'createdAt: serverTimestamp()\n      }));');

// Wrap refPath updates
content = content.replace(/await setDoc\(refPath, \{/g, 'await setDoc(refPath, sanitizeFirestoreData({');

// We have 4 occurrences of refPath setDoc, let's fix their closing parens
content = content.replace(/createdAt: new Date\(\).toISOString\(\)\n    \}\);/g, 'createdAt: new Date().toISOString()\n    }));');
content = content.replace(/createdAt: new Date\(\).toISOString\(\)\n      \}\);/g, 'createdAt: new Date().toISOString()\n      }));');


fs.writeFileSync(file, content);
