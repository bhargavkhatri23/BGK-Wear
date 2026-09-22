const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

const target = `  signInWithPhoneNumber, 
  signOut,`;

const replacement = `  signInWithPhoneNumber, 
  signInAnonymously,
  signOut,`;

code = code.replace(target, replacement);

fs.writeFileSync('src/services/authService.ts', code);
