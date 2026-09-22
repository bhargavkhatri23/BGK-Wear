import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Building2, 
  Hash, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Home
} from 'lucide-react';
import { useApp, isUserProfileComplete } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';
import { INDIAN_STATES_LIST, POPULAR_INDIAN_CITIES, getStateForCity } from '../data/locations';

export const MandatoryProfileModal: React.FC = () => {
  const { user, firebaseUser, saveProfileCompletion } = useApp();

  // If profile is already complete or user is a guest, don't show the modal
  const complete = isUserProfileComplete(user);

  useDynamicSEO(
    !complete && !user.isGuest
      ? {
          title: 'Complete Profile Verification | BGK WEAR',
          description: 'Verify your contact details and shipping address to ensure secure rental bookings and safe transactions on BGK WEAR.',
          type: 'website'
        }
      : null
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill fields whenever user or firebaseUser changes
  useEffect(() => {
    if (user) {
      if (user.name && user.name !== 'BGK Customer' && user.name !== 'Guest Explorer' && user.name !== 'New User') {
        setName(user.name);
      }
      const existingEmail = user.email || firebaseUser?.email || '';
      setEmail(existingEmail);

      const existingPhone = String(user.phone || firebaseUser?.phoneNumber || '').replace(/\D/g, '').slice(-10);
      setPhone(existingPhone);

      const existingWhatsapp = String(user.whatsapp || '').replace(/\D/g, '').slice(-10);
      if (existingWhatsapp && existingWhatsapp !== existingPhone) {
        setWhatsapp(existingWhatsapp);
        setSameAsMobile(false);
      } else if (existingPhone) {
        setWhatsapp(existingPhone);
        setSameAsMobile(true);
      }

      if (user.address) {
        setAddress(user.address);
      }
      if (user.city || user.district) {
        setCity(user.city || user.district || '');
      }
      if (user.state) {
        setState(user.state);
      }
      if (user.pincode) {
        setPincode(String(user.pincode).replace(/\D/g, '').slice(0, 6));
      }
    }
  }, [user, firebaseUser]);

  if (complete || user.isGuest) {
    return null;
  }

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    if (sameAsMobile) {
      setWhatsapp(clean);
    }
  };

  const handleWhatsappChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setWhatsapp(clean);
  };

  const handleToggleSameAsMobile = (checked: boolean) => {
    setSameAsMobile(checked);
    if (checked) {
      setWhatsapp(phone);
    }
  };

  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Name
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    // Validate Phone
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Validate WhatsApp
    const finalWhatsapp = sameAsMobile ? cleanPhone : whatsapp.replace(/\D/g, '');
    if (finalWhatsapp.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    // Validate Address
    if (!address.trim() || address.trim().length < 5) {
      setErrorMsg('Please enter your complete street / delivery address (at least 5 characters).');
      return;
    }

    // Validate City
    if (!city.trim() || city.trim().length < 2) {
      setErrorMsg('Please enter your City / District.');
      return;
    }

    // Validate State
    if (!state.trim()) {
      setErrorMsg('Please select your State.');
      return;
    }

    // Validate Pincode
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveProfileCompletion({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        whatsapp: finalWhatsapp,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: cleanPin
      });
    } catch (err: any) {
      console.error('Failed to save profile completion:', err);
      setErrorMsg(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="profile-completion-modal"
      className="fixed inset-0 z-[999] bg-slate-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="w-full max-w-xl bg-white rounded-3xl border border-pink-100 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border-b border-pink-100 px-6 py-6 sm:px-8 sm:py-7 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f43397] text-white flex items-center justify-center shadow-lg shadow-pink-200 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-100/90 text-[#9f2089] text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Mandatory Profile Details</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Complete Your Profile
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                आवश्यक विवरण भरें ताकि आप आसानी से ऑर्डर, रेंट और सेलिंग कर सकें।
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div>
                <span className="font-bold">Please check form details:</span>
                <p className="mt-0.5 text-red-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name (पूरा नाम) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bhargav Khatri"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f43397] focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>

          {/* 2. Email Address (Pre-filled) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address (ईमेल आईडी) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. bhargavkhatri2302@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f43397] focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>

          {/* 3. Mobile Number & WhatsApp Number Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number (फ़ोन) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f43397] focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  value={sameAsMobile ? phone : whatsapp}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  disabled={sameAsMobile}
                  placeholder="WhatsApp number"
                  maxLength={10}
                  className={`w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium outline-none transition ${
                    sameAsMobile 
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                      : 'bg-slate-50 focus:ring-2 focus:ring-[#f43397] focus:border-transparent'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Same as Mobile Checkbox */}
          <div className="flex items-center gap-2 pl-1">
            <input
              type="checkbox"
              id="same-mobile-check"
              checked={sameAsMobile}
              onChange={(e) => handleToggleSameAsMobile(e.target.checked)}
              className="w-4 h-4 rounded text-[#f43397] focus:ring-[#f43397] border-slate-300"
            />
            <label htmlFor="same-mobile-check" className="text-xs text-slate-600 font-semibold cursor-pointer select-none">
              WhatsApp number is same as mobile number (वही नंबर जो मोबाइल का है)
            </label>
          </div>

          {/* 4. Street / Delivery Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Delivery / Pickup Address (पूरा पता) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Home className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / House No., Building Name, Street / Locality, Landmark"
                rows={2}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f43397] focus:border-transparent outline-none transition resize-none"
                required
              />
            </div>
          </div>

          {/* 5. City, State & PIN Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                City / District (शहर) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => {
                    const selectedCity = e.target.value;
                    setCity(selectedCity);
                    const matchedState = getStateForCity(selectedCity);
                    if (matchedState) {
                      setState(matchedState);
                    }
                  }}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f43397] focus:border-transparent outline-none transition cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Select City --</option>
                  {POPULAR_INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                State (राज्य) <span className="text-red-500">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f43397] focus:border-transparent outline-none transition cursor-pointer"
                required
              >
                <option value="" disabled>-- Select State --</option>
                {INDIAN_STATES_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                PIN Code (पिन कोड) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="6 Digits"
                  maxLength={6}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#f43397] focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#f43397] to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Profile to Database...</span>
                </>
              ) : (
                <>
                  <span>Save Profile & Continue to Store (सेव करें और आगे बढ़ें)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-600 mt-2 font-medium">
              🔒 Your details are securely encrypted and stored on Firebase Firestore.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
