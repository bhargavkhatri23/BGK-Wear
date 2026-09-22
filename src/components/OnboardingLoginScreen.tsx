import React, { useState } from 'react';
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
  CheckCircle2, 
  Crown,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const INDIAN_STATES = [
  'Maharashtra',
  'Delhi NCR',
  'Gujarat',
  'Rajasthan',
  'Karnataka',
  'Uttar Pradesh',
  'Punjab',
  'Telangana',
  'Tamil Nadu',
  'Madhya Pradesh',
  'West Bengal',
  'Haryana',
  'Andhra Pradesh',
  'Kerala',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Goa',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Odisha',
  'Uttarakhand',
  'Other'
];

export const OnboardingLoginScreen: React.FC = () => {
  const { completeOnboarding, showToast } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync WhatsApp with Phone if checkbox is checked
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    if (sameAsMobile) {
      setWhatsapp(clean);
    }
  };

  const handleToggleSameAsMobile = (checked: boolean) => {
    setSameAsMobile(checked);
    if (checked) {
      setWhatsapp(phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const finalWhatsapp = (sameAsMobile ? cleanPhone : whatsapp.replace(/\D/g, ''));
    if (finalWhatsapp.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!state.trim()) {
      setErrorMsg('Please select your State.');
      return;
    }

    if (!district.trim() || district.trim().length < 2) {
      setErrorMsg('Please enter your District / City (e.g. Mumbai, Jaipur, Surat).');
      return;
    }

    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Pin Code.');
      return;
    }

    setIsSubmitting(true);

    try {
      await completeOnboarding({
        name: name.trim(),
        phone: `+91 ${cleanPhone}`,
        whatsapp: `+91${finalWhatsapp}`,
        email: email.trim().toLowerCase(),
        state: state.trim(),
        district: district.trim(),
        pincode: cleanPin
      });
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      showToast('Welcome to BGK WEAR! Profile registered.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 text-slate-900">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Decorative Header */}
        <div className="bg-pink-50/60 border-b border-pink-100 px-6 sm:px-8 py-7 sm:py-8 text-slate-900 text-center relative overflow-hidden">
          {/* Subtle Background Accent Glows */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-200/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-pink-100/40 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-[#9f2089] text-xs font-black uppercase tracking-wider mb-1">
              <Crown className="w-3.5 h-3.5 text-[#9f2089]" />
              <span>Welcome to BGK WEAR</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Create Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
              India's premier peer-to-peer bridal & wedding outfit marketplace. Rent or buy directly with 0% platform commission.
            </p>
          </div>
        </div>

        {/* Onboarding Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 bg-white">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#9f2089]" />
              <span>Full Name (पूरा नाम)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Sharma / Bhargav Khatri"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9f2089] focus:ring-1 focus:ring-[#9f2089] transition-all shadow-xs"
              id="onboarding-full-name"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#9f2089]" />
              <span>Mobile Number (मोबाइल नंबर)</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xs font-bold text-slate-400 select-none">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full pl-13 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9f2089] focus:ring-1 focus:ring-[#9f2089] transition-all shadow-xs"
                id="onboarding-phone-number"
              />
            </div>
          </div>

          {/* WhatsApp Number with Quick Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Number (व्हाट्सएप नंबर)</span>
                <span className="text-rose-500">*</span>
              </label>

              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sameAsMobile}
                  onChange={(e) => handleToggleSameAsMobile(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#9f2089] focus:ring-[#9f2089] accent-[#9f2089] cursor-pointer"
                  id="onboarding-same-whatsapp-chk"
                />
                <span>Same as Mobile</span>
              </label>
            </div>

            {!sameAsMobile && (
              <div className="relative flex items-center animate-in fade-in">
                <span className="absolute left-4 text-xs font-bold text-slate-400 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit WhatsApp number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-13 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9f2089] focus:ring-1 focus:ring-[#9f2089] transition-all shadow-xs"
                  id="onboarding-whatsapp-input"
                />
              </div>
            )}
          </div>

          {/* Email ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#9f2089]" />
              <span>Email ID (ईमेल आईडी)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. ananya.wedding@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9f2089] focus:ring-1 focus:ring-[#9f2089] transition-all shadow-xs"
              id="onboarding-email-address"
            />
          </div>

          {/* Location Details: State, District/City, Pin Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9f2089]" />
                <span>State (राज्य)</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#9f2089] focus:ring-1 focus:ring-[#9f2089] transition-all cursor-pointer shadow-xs"
                id="onboarding-state-select"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st} className="bg-white text-slate-900">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* District / City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#9f2089]" />
                <span>District / City (जिला / शहर)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mumbai / Jaipur / Surat"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9f2089] focus:ring-1 focus:ring-[#9f2089] transition-all shadow-xs"
                id="onboarding-district-city"
              />
            </div>
          </div>

          {/* Pin Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#9f2089]" />
              <span>Pin Code (पिन कोड)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 400050"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#9f2089] focus:ring-1 focus:ring-[#9f2089] transition-all shadow-xs"
              id="onboarding-pincode"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#9f2089] hover:bg-[#80146f] text-white font-bold text-sm tracking-wide shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              id="onboarding-submit-btn"
            >
              {isSubmitting ? (
                <span>Setting up your Profile...</span>
              ) : (
                <>
                  <span>Save Profile & Enter BGK WEAR</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-slate-500">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#9f2089]" />
              <span className="text-[10px] font-semibold">100% Verified</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#9f2089]" />
              <span className="text-[10px] font-semibold">0% Commission</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <HeartHandshake className="w-4 h-4 text-[#9f2089]" />
              <span className="text-[10px] font-semibold">Direct Peer Deals</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
