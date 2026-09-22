import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, User, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginDashboard({ 
  onContinueAsGuest,
}: { 
  onContinueAsGuest?: () => Promise<void> | void;
}) {
  const { signInEmail, signUpEmail, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', mobile: '' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'signup') {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUpEmail(formData.email.trim(), formData.password, formData.name.trim());
      } else {
        await signInEmail(formData.email.trim(), formData.password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = async () => {
    if (!onContinueAsGuest) return;
    setError('');
    setGuestLoading(true);
    try {
      await onContinueAsGuest();
    } catch (err: any) {
      setError(err?.message || 'Guest sign-in failed.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-extrabold text-[#f43397] mb-8 text-center">BGK Wear</h2>
      
      <div className="flex bg-gray-100 p-1 rounded-full mb-8">
        <button 
          onClick={() => { setActiveTab('login'); setError(''); }} 
          className={`flex-1 py-2 rounded-full font-semibold transition ${activeTab === 'login' ? 'bg-white text-[#f43397] shadow' : 'text-gray-500'}`}
        >
          Login
        </button>
        <button 
          onClick={() => { setActiveTab('signup'); setError(''); }} 
          className={`flex-1 py-2 rounded-full font-semibold transition flex items-center justify-center gap-1 ${activeTab === 'signup' ? 'bg-white text-[#f43397] shadow' : 'text-gray-500'}`}
        >
          Sign Up <span className="text-[10px] bg-[#f43397] text-white px-1.5 rounded">New</span>
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {activeTab === 'signup' && (
          <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f43397]" onChange={e => setFormData({...formData, name: e.target.value})} required />
        )}
        <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f43397]" onChange={e => setFormData({...formData, email: e.target.value})} required />
        {activeTab === 'signup' && (
          <input type="tel" placeholder="Mobile Number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f43397]" onChange={e => setFormData({...formData, mobile: e.target.value})} required />
        )}
        <input type="password" placeholder="Password" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f43397]" onChange={e => setFormData({...formData, password: e.target.value})} required />
        
        <button type="submit" disabled={loading || guestLoading} className="w-full bg-[#f43397] text-white font-bold py-3.5 rounded-xl hover:bg-pink-600 transition shadow-lg shadow-pink-200 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin mx-auto" /> : (activeTab === 'signup' ? 'Create Account' : 'Login')}
        </button>
      </form>

      {onContinueAsGuest && (
        <>
          <div className="my-6 flex items-center gap-4 text-gray-400 text-sm">
            <hr className="flex-1" /> OR <hr className="flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGuestClick}
            disabled={loading || guestLoading}
            className="w-full bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 font-medium py-2.5 px-4 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {guestLoading ? <Loader2 className="animate-spin w-4 h-4 text-[#f43397]" /> : null}
            <span>Explore as Guest / Preview Mode</span>
          </button>
        </>
      )}
    </div>
  );
}

