const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/services/firestoreService.ts');
let content = fs.readFileSync(file, 'utf8');

const sanitizeFn = `
function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === undefined) return undefined as any;
  if (obj === null) return null as any;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeFirestoreData).filter(v => v !== undefined) as any;
  
  if (obj.constructor && obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array') {
    return obj; // Leave Firestore FieldValues (like serverTimestamp) alone
  }

  const cleaned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeFirestoreData(val);
      }
    }
  }
  return cleaned;
}
`;

if (!content.includes('sanitizeFirestoreData')) {
  content = content.replace('function getSafeUserId', sanitizeFn + '\nfunction getSafeUserId');
}

// Replace all setDoc with sanitized versions
content = content.replace(/await setDoc\(([^,]+),\s*([^)]+)\);/g, 'await setDoc($1, sanitizeFirestoreData($2));');
content = content.replace(/await setDoc\(([^,]+),\s*([\s\S]+?),\s*\{\s*merge:\s*true\s*\}\);/g, 'await setDoc($1, sanitizeFirestoreData($2), { merge: true });');

// Replace all updateDoc with sanitized versions
content = content.replace(/await updateDoc\(([^,]+),\s*([^)]+)\);/g, 'await updateDoc($1, sanitizeFirestoreData($2));');
// updateDoc can also take inline objects, let's just make sure we capture it all.
// Actually, updateDoc(ref, { ... }) is caught by the second group if it doesn't contain unclosed parens.
// A better way is to wrap the second argument in sanitizeFirestoreData.

fs.writeFileSync(file, content);
console.log('Sanitization applied');
