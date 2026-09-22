import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShoppingBag, 
  CheckCircle, 
  Truck, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const BuyCheckoutModal: React.FC = () => {
  const { 
    selectedProduct, 
    activeModal, 
    setActiveModal, 
    createPurchaseOrder, 
    user 
  } = useApp();

  useDynamicSEO(
    activeModal === 'checkout_buy' && selectedProduct
      ? {
          title: `Buy ${selectedProduct.title} for ₹${selectedProduct.salePrice?.toLocaleString('en-IN')} | BGK WEAR`,
          description: `Complete your secure purchase of ${selectedProduct.title} with buyer protection, guaranteed authenticity, and express insured delivery.`,
          image: selectedProduct.images?.[0] || '/icon-512.png',
          type: 'product'
        }
      : null
  );

  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [street, setStreet] = useState('Flat 402, Royal Palms, Bandra West');
  const [city, setCity] = useState(user.city || 'Mumbai');
  const [state, setState] = useState(user.state || 'Maharashtra');
  const [pincode, setPincode] = useState('400050');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  if (activeModal !== 'checkout_buy' || !selectedProduct || !selectedProduct.salePrice) return null;

  const salePrice = selectedProduct.salePrice;
  const shippingFee = 0; // FREE Express
  const total = salePrice + shippingFee;

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const order = createPurchaseOrder({
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        productImage: selectedProduct.images[0],
        sellerName: selectedProduct.seller.name,
        sellerPhone: selectedProduct.seller.phone,
        salePrice: salePrice,
        shippingFee: shippingFee,
        totalPaid: total,
        deliveryAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          pincode
        }
      });

      setConfirmedOrderId(order.id);
      setIsSubmitting(false);
      setOrderSuccess(true);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }, 1200);
  };

  const handleClose = () => {
    setActiveModal(null);
    setOrderSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-[#9f2089]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {orderSuccess ? 'Purchase Request Confirmed' : 'Purchase Wedding Outfit'}
            </h3>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 no-scrollbar">
          {orderSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-[#9f2089] rounded-full mx-auto flex items-center justify-center text-slate-900 shadow-md">
                <CheckCircle className="w-9 h-9 stroke-[2.5]" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-pink-50 text-[#9f2089] text-xs font-bold uppercase tracking-wider border border-pink-200">
                  Request #{confirmedOrderId}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                  Purchase Request Sent!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2">
                  Seller <strong className="text-[#9f2089]">{selectedProduct.seller.name}</strong> has received your purchase request. Coordinate directly via in-app chat, WhatsApp, or phone for item inspection, payment, and handover.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="px-8 py-3.5 bg-[#9f2089] text-white hover:bg-[#80146f] rounded-full text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                View My Purchases & Chat
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmPurchase} className="space-y-5">
              
              {/* Product Preview */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-16 h-20 rounded-2xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-[#9f2089] tracking-wider">{selectedProduct.brand}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{selectedProduct.title}</h4>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-slate-600">Size: <strong className="text-slate-900">{selectedProduct.size}</strong></span>
                    <span className="text-base font-black text-slate-900">₹{salePrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Buyer Contact & Location */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#9f2089] uppercase tracking-wider block">
                  Buyer Contact & Handover / Meetup Location
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <input
                      type="text"
                      placeholder="Buyer Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Contact Phone / WhatsApp"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Full Street Address / Meetup Area"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="PIN Code"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Agreed Price:</span>
                  <span className="font-bold text-slate-900">₹{salePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Direct Buyer-Seller Coordination:</span>
                  <span className="text-emerald-700 font-bold">FREE (0% Commission)</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold">
                  <span className="text-slate-900">Total Amount:</span>
                  <span className="text-xl font-black text-[#9f2089]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Submitting Purchase Request...' : `Place Purchase Request (₹${total.toLocaleString('en-IN')})`}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
