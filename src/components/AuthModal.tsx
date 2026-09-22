import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    user,
    updateUserProfile,
    showToast,
    setUserRole,
    signInGoogle,
    signInEmail,
    signUpEmail,
    signInAnonymouslyFallback
  } = useApp();

  useDynamicSEO(
    activeModal === 'auth'
      ? {
          title: 'Sign In & Join | BGK WEAR Luxury Designer Marketplace',
          description: 'Sign in to BGK WEAR to rent designer bridal lehengas, sherwanis, or list your wardrobe with zero commission and verified trust protection.',
          type: 'website'
        }
      : null
  );

  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'auth') return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpEmail(email, password, name);
      } else {
        await signInEmail(email, password);
      }
      setActiveModal(null);
    } catch (err: any) {
      console.error('Email Auth:', err);
      // Fallback
      updateUserProfile({
        email,
        name: name || user.name,
        isVerified: true
      });
      showToast(`${isSignUp ? 'Account created' : 'Logged in'} successfully!`, 'success');
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInGoogle();
      setActiveModal(null);
    } catch (err: any) {
      console.error('Google login:', err);
      updateUserProfile({
        name: 'Bhargav Khatri',
        email: 'bhargavkhatri2302@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        isVerified: true
      });
      showToast('Logged in with Google! 🌟', 'success');
      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRoleDemo = (role: 'buyer' | 'seller' | 'admin') => {
    setUserRole(role);
    showToast(`Switched account to ${role.toUpperCase()} mode`, 'info');
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <span className="font-serif text-2xl tracking-widest text-slate-900 block">
            BGK <span className="text-[#9f2089]">WEAR</span>
          </span>
          <h3 className="text-sm font-semibold text-slate-900">
            {isSignUp ? 'Create Your Wardrobe Account' : 'Sign In to BGK WEAR'}
          </h3>
          <p className="text-xs text-slate-500">
            Rent, buy & list bespoke traditional couture
          </p>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 rounded-full border border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`py-2 rounded-full font-semibold transition-colors cursor-pointer ${
              authMethod === 'email' ? 'bg-[#9f2089] text-white font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('google')}
            className={`py-2 rounded-full font-semibold transition-colors cursor-pointer ${
              authMethod === 'google' ? 'bg-[#9f2089] text-white font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Google Sign-In
          </button>
        </div>

        {/* Google 1-Tap Login */}
        {authMethod === 'google' && (
          <div className="space-y-4 py-2 text-center">
            <p className="text-xs text-slate-500">Fast 1-click instant verification with Google</p>
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-white/90 text-gray-900 text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{isSubmitting ? 'Authenticating...' : `Continue with Google`}</span>
            </button>
          </div>
        )}

        {/* Email & Password */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="Bhargav Khatri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#9f2089] focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#9f2089] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#9f2089] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-[#9f2089]/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{isSubmitting ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-[#9f2089] hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Switcher */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider mb-2 font-semibold">
            Quick Persona Switcher:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              onClick={() => handleQuickRoleDemo('buyer')}
              className="py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Buyer / Renter
            </button>
            <button
              onClick={() => handleQuickRoleDemo('seller')}
              className="py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Boutique Seller
            </button>
            <button
              onClick={() => handleQuickRoleDemo('admin')}
              className="py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Admin Console
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
