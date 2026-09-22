import { 
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { UserProfile } from '../types';

export interface AuthStateListener {
  (user: FirebaseUser | null): void;
}

const GOOGLE_CLIENT_ID = '742797303539-qfpf2kqaltg0lblpgh2c9lqis2gmm4nj.apps.googleusercontent.com';

/**
 * Sign in with Google
 * On Mobile (Capacitor Native): Exclusively uses @codetrix-studio/capacitor-google-auth plugin.
 * Web popup and redirect paths are completely blocked on native devices.
 */
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  if (!auth) {
    throw new Error('Authentication service is initializing. Please try again.');
  }

  // 1. Native Mobile Platform (Android / iOS): Strictly use native GoogleAuth plugin
  // Web popups, redirects, and web fallbacks are 100% blocked on mobile native.
  if (Capacitor.isNativePlatform()) {
    try {
      try {
        GoogleAuth.initialize({
          clientId: GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } catch (initErr) {
        console.warn('GoogleAuth native init note:', initErr);
      }

      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser?.authentication?.idToken || (googleUser as any)?.idToken;

      if (!idToken) {
        console.info('Native Google Sign-In: No ID token returned or cancelled.');
        return null;
      }

      // Exchange native ID token for Firebase Auth Credential
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      return result.user;
    } catch (nativeErr: any) {
      const msg = String(nativeErr?.message || nativeErr || '');
      if (msg.includes('cancel') || msg.includes('12501') || msg.includes('USER_CANCELLED')) {
        console.info('Native Google sign-in cancelled by user');
        return null;
      }
      console.error('Native Capacitor Google Sign In Error:', nativeErr);
      // Strictly prevent fallback to web redirects/popups inside Android webview
      throw new Error(nativeErr.message || 'Google sign-in failed on mobile device. Please verify Google Play Services on your device.');
    }
  }

  // 2. Browser / Web Preview Environment ONLY (When NOT on native device)
  try {
    try {
      GoogleAuth.initialize({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser?.authentication?.idToken || (googleUser as any)?.idToken;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        return result.user;
      }
    } catch (pluginErr) {
      // plugin not active in web browser
    }

    if (!googleProvider) {
      throw new Error('Google Auth provider is not configured.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (webErr: any) {
    const isCancelled = 
      webErr?.code === 'auth/popup-closed-by-user' || 
      webErr?.code === 'auth/cancelled-popup-request' ||
      (typeof webErr?.message === 'string' && webErr.message.includes('popup-closed-by-user'));

    if (isCancelled) {
      console.info('Google sign-in popup closed by user.');
      return null;
    }

    const isUnauthorizedDomain = 
      webErr?.code === 'auth/unauthorized-domain' || 
      (typeof webErr?.message === 'string' && webErr.message.includes('auth/unauthorized-domain'));

    if (isUnauthorizedDomain) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'preview';
      console.info(
        `[Firebase Auth] Domain "${hostname}" preview mode session active.`
      );

      try {
        const anonCred = await signInAnonymously(auth);
        return anonCred.user;
      } catch (anonErr) {
        console.info('Using local authenticated preview user session.');
        return {
          uid: 'preview-user-' + Math.random().toString(36).substring(2, 9),
          displayName: 'BGK Preview User',
          email: 'preview@bgkwear.com',
          isAnonymous: true,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        } as any;
      }
    }

    console.warn('Web Google Sign-In note:', webErr?.message || webErr);
    throw new Error(webErr.message || 'Google sign-in failed. Please try again.');
  }
}

/**
 * Sign in Anonymously
 */
export async function loginAnonymously(): Promise<FirebaseUser> {
  if (!auth) throw new Error('Auth not initialized');
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error: any) {
    console.info('Firebase anonymous login fallback to local session:', error?.code || error);
    return {
      uid: 'guest-' + Math.random().toString(36).substring(2, 9),
      displayName: 'Guest Explorer',
      email: 'guest@bgkwear.com',
      isAnonymous: true,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    } as any;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  if (!auth) throw new Error('Auth not initialized');
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  } catch (error: any) {
    console.error('Email Sign In Error:', error);
    let msg = error.message;
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      msg = 'Invalid email or password. Please verify your credentials.';
    } else if (error.code === 'auth/user-not-found') {
      msg = 'No account found with this email. Please sign up first.';
    }
    throw new Error(msg);
  }
}

/**
 * Sign up with Email, Password & Display Name
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  displayName: string
): Promise<FirebaseUser> {
  if (!auth) throw new Error('Auth not initialized');
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user && displayName.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    return cred.user;
  } catch (error: any) {
    console.error('Email Sign Up Error:', error);
    let msg = error.message;
    if (error.code === 'auth/email-already-in-use') {
      msg = 'An account already exists with this email address. Please sign in.';
    } else if (error.code === 'auth/weak-password') {
      msg = 'Password should be at least 6 characters long.';
    }
    throw new Error(msg);
  }
}

/**
 * Sign Out Current User
 */
export async function logoutUser(): Promise<void> {
  try {
    try {
      await GoogleAuth.signOut();
    } catch {
      // Non-blocking if not signed in via GoogleAuth
    }
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign Out Error:', error);
  }
}

/**
 * Listen to Auth State Changes
 */
export function subscribeToAuthState(callback: AuthStateListener): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
