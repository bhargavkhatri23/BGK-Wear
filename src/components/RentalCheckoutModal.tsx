import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  CreditCard,
  QrCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const RentalCheckoutModal: React.FC = () => {
  const { 
    selectedProduct, 
    activeModal, 
    setActiveModal, 
    createRentalBooking, 
    user 
  } = useApp();

  useDynamicSEO(
    activeModal === 'rental_checkout' && selectedProduct
      ? {
          title: `Rent ${selectedProduct.title} | Secure Escrow Booking | BGK WEAR`,
          description: `Book ${selectedProduct.title} for ₹${selectedProduct.rentalPrice}/day with 100% verified security deposit refund guarantee, door-to-door insured delivery, and fitting insurance.`,
          image: selectedProduct.images?.[0] || '/icon-512.png',
          type: 'product'
        }
      : null
  );

  const [rentalDays, setRentalDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [fittingInsurance, setFittingInsurance] = useState<boolean>(true);
  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [street, setStreet] = useState('Flat 402, Royal Palms, Bandra West');
  const [city, setCity] = useState(user.city || 'Mumbai');
  const [state, setState] = useState(user.state || 'Maharashtra');
  const [pincode, setPincode] = useState('400050');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  if (activeModal !== 'checkout_rent' || !selectedProduct) return null;

  // Calculate return date
  const sDate = new Date(startDate);
  const eDate = new Date(sDate);
  eDate.setDate(eDate.getDate() + rentalDays);
  const returnDateStr = eDate.toISOString().split('T')[0];

  // Pricing calculations
  const rentTotal = selectedProduct.rentPricePerDay * rentalDays;
  const deposit = selectedProduct.securityDeposit;
  const insuranceFee = fittingInsurance ? 499 : 0;
  const grandTotal = rentTotal + deposit + insuranceFee;

  const handleConfirmRental = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking = createRentalBooking({
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        productImage: selectedProduct.images[0],
        category: selectedProduct.category,
        sellerName: selectedProduct.seller.name,
        sellerPhone: selectedProduct.seller.phone,
        sellerWhatsapp: selectedProduct.seller.whatsapp,
        startDate: startDate,
        endDate: returnDateStr,
        totalDays: rentalDays,
        rentAmount: rentTotal,
        securityDeposit: deposit,
        fittingInsurance: fittingInsurance,
        cleaningFee: 0,
        totalPaid: grandTotal,
        deliveryAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          pincode
        }
      });

      setConfirmedBookingId(newBooking.id);
      setIsSubmitting(false);
      setBookingSuccess(true);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Fallback
      }
    }, 1200);
  };

  const handleClose = () => {
    setActiveModal(null);
    setBookingSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9f2089] animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {bookingSuccess ? 'Rental Request Confirmed' : 'Reserve Wedding Outfit on Rent'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 no-scrollbar">
          
          {bookingSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-[#9f2089] rounded-full mx-auto flex items-center justify-center text-slate-900 shadow-md">
                <CheckCircle className="w-9 h-9 stroke-[2.5]" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-pink-50 text-[#9f2089] text-xs font-bold uppercase tracking-wider border border-pink-200">
                  Booking ID: #{confirmedBookingId}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                  Your Rental Request is Placed!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2">
                  We've notified seller <strong className="text-[#9f2089]">{selectedProduct.seller.name}</strong>. You can now coordinate directly via in-app chat, WhatsApp, or phone for outfit fitting, handover, and dates.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between text-slate-600">
                  <span>Rental Period:</span>
                  <span className="font-bold text-slate-900">{startDate} to {returnDateStr} ({rentalDays} Days)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-emerald-700">₹{deposit.toLocaleString('en-IN')} (Refunded upon safe return)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Buyer Handover Location:</span>
                  <span className="font-bold text-slate-900 text-right">{street}, {city}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="px-8 py-3.5 bg-[#9f2089] text-white hover:bg-[#80146f] rounded-full text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                View My Bookings & Manage
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmRental} className="space-y-6">
              
              {/* Product preview summary card */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-16 h-20 rounded-2xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-[#9f2089] tracking-wider">{selectedProduct.brand}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{selectedProduct.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-slate-600">Size: <strong className="text-slate-900">{selectedProduct.size}</strong></span>
                    <span className="text-slate-600">City: <strong className="text-slate-900">{selectedProduct.city}</strong></span>
                    <span className="text-[#9f2089] font-bold">₹{selectedProduct.rentPricePerDay.toLocaleString('en-IN')}/day</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Duration & Dates Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#9f2089] uppercase tracking-wider block">
                  1. Select Rental Duration & Event Date
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 7, 10].map((days) => (
                    <button
                      type="button"
                      key={days}
                      onClick={() => setRentalDays(days)}
                      className={`py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        rentalDays === days
                          ? 'border border-[#9f2089] bg-pink-50 text-[#9f2089] shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Event / Fitting Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Return Handover Date</label>
                    <input
                      type="date"
                      value={returnDateStr}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Buyer Contact & Handover Details */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#9f2089] uppercase tracking-wider block">
                  2. Buyer Contact & Handover Location
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
                      placeholder="Flat, Building, Street Address (For Handover/Meetup)"
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

              {/* Step 3: Cleaning & Alteration Care Option */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#9f2089] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Fitting & Minor Cleaning Allowance</h5>
                    <p className="text-[11px] text-slate-500">Optional allowance for minor stain removal and seam adjustments.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFittingInsurance(!fittingInsurance)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-colors cursor-pointer ${
                    fittingInsurance ? 'bg-[#9f2089] text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {fittingInsurance ? '+ ₹499 Added' : 'Add ₹499'}
                </button>
              </div>

              {/* Step 4: Payment Summary */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <h4 className="font-bold text-[#9f2089] uppercase tracking-wider mb-2">Price Breakdown</h4>
                
                <div className="flex justify-between text-slate-600">
                  <span>Rental Charge ({rentalDays} Days × ₹{selectedProduct.rentPricePerDay}):</span>
                  <span className="font-bold text-slate-900">₹{rentTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#9f2089]" />
                    Refundable Security Deposit:
                  </span>
                  <span className="font-bold text-emerald-700">₹{deposit.toLocaleString('en-IN')}</span>
                </div>

                {fittingInsurance && (
                  <div className="flex justify-between text-slate-600">
                    <span>Cleaning & Fitting Allowance:</span>
                    <span>₹499</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Direct Buyer-Seller Coordination:</span>
                  <span className="text-emerald-700 font-bold">FREE (0% Commission)</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold">
                  <span className="text-slate-900">Total Amount Payable:</span>
                  <span className="text-xl font-black text-[#9f2089]">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                id="submit-rental-checkout-btn"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Placing Rental Request...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Confirm Rental</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
