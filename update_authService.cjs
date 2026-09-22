const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

const targetImport = `  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';`;

const replacementImport = `  signInWithPhoneNumber, 
  signInAnonymously,
  RecaptchaVerifier, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';`;

code = code.replace(targetImport, replacementImport);

const targetExport = `export async function loginWithEmail(`;

const anonymousFunc = `export async function loginAnonymously(): Promise<FirebaseUser> {
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error: any) {
    console.error('Anonymous auth failed:', error);
    throw new Error(error.message || 'Failed to authenticate anonymously');
  }
}

`;

code = code.replace(targetExport, anonymousFunc + targetExport);

fs.writeFileSync('src/services/authService.ts', code);
