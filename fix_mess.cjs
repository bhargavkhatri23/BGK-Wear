const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/services/firestoreService.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/await setDoc\(wRef, \{/g, 'await setDoc(wRef, sanitizeFirestoreData({');
content = content.replace(/await setDoc\(userRef, \{/g, 'await setDoc(userRef, sanitizeFirestoreData({');

fs.writeFileSync(file, content);
