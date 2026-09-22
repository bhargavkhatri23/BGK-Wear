import React from 'react';
import { X, Phone, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const CallSellerModal: React.FC = () => {
  const { activeModal, setActiveModal, targetSeller, openCall, user } = useApp();

  useDynamicSEO(
    activeModal === 'call_seller' && targetSeller
      ? {
          title: `Contact Verified Seller: ${targetSeller.name} | BGK WEAR`,
          description: `Directly call ${targetSeller.name} in ${targetSeller.city} to confirm outfit measurements, trial availability, and rental terms.`,
          image: targetSeller.avatar || '/icon-512.png',
          type: 'profile'
        }
      : null
  );

  if (activeModal !== 'call_seller' || !targetSeller) return null;

  const isGuest = user.isGuest;

  const handleDial = () => {
    if (isGuest) {
      setActiveModal('auth');
      return;
    }
    openCall(targetSeller.phone);
  };

  const maskedPhone = targetSeller.phone.replace(/(\+\d{2}\s?\d{2})\d{3}(\d{2})\d{3}/, '$1*** **$2');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-5 shadow-2xl text-center relative text-slate-900">
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full border-2 border-[#9f2089] p-0.5 mx-auto shadow-md">
          <img
            src={targetSeller.avatar}
            alt={targetSeller.name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900">{targetSeller.name}</h3>
            {targetSeller.isVerified && <ShieldCheck className="w-4 h-4 text-[#9f2089]" />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{targetSeller.city}, {targetSeller.state}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Verified Phone:</span>
            {isGuest ? (
              <span className="font-mono text-slate-700 tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#9f2089]" />
                {maskedPhone}
              </span>
            ) : (
              <span className="font-bold text-slate-900">{targetSeller.phone}</span>
            )}
          </div>
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Average Response:</span>
            <span className="text-[#9f2089] font-bold">{targetSeller.responseTime}</span>
          </div>
        </div>

        {isGuest ? (
          <button
            onClick={handleDial}
            className="w-full py-3.5 rounded-full bg-[#9f2089] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#80146f] flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            id="login-reveal-dial-btn"
          >
            <Lock className="w-4 h-4" />
            <span>Login to Reveal Number & Call</span>
          </button>
        ) : (
          <button
            onClick={handleDial}
            className="w-full py-3.5 rounded-full bg-[#9f2089] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#80146f] flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            id="direct-dial-btn"
          >
            <Phone className="w-4 h-4" />
            <span>Call Now ({targetSeller.phone})</span>
          </button>
        )}

        <p className="text-[10px] text-slate-400">
          BGK WEAR connects buyers and sellers directly. Always inspect items in person during handover.
        </p>
      </div>
    </div>
  );
};
