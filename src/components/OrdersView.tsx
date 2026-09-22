import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Phone, 
  Receipt, 
  Sparkles, 
  MapPin, 
  ExternalLink,
  Package,
  Star,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RentalBooking, PurchaseOrder } from '../types';

export const OrdersView: React.FC = () => {
  const { 
    user, 
    rentalBookings, 
    purchaseOrders, 
    sellerRentalBookings, 
    sellerPurchaseOrders, 
    updateRentalStatus, 
    updatePurchaseStatus, 
    openCall, 
    products, 
    setSelectedProduct, 
    setActiveModal, 
    setActiveTab,
    showToast
  } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'buyer_rentals' | 'buyer_purchases' | 'seller_rentals' | 'seller_purchases'>('buyer_rentals');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<RentalBooking | PurchaseOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const isSellerMode = user.role === 'seller' || user.role === 'admin';

  const handleUpdateTracking = async (orderId: string, isRental: boolean) => {
    if (!trackingInput.trim()) {
      showToast('Please enter a handover note or reference code', 'error');
      return;
    }

    if (isRental) {
      await updateRentalStatus(orderId, 'Dispatched', undefined, trackingInput.trim());
    } else {
      await updatePurchaseStatus(orderId, 'Shipped', trackingInput.trim());
    }
    setEditingOrderId(null);
    setTrackingInput('');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 pb-24 space-y-6 text-slate-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#9f2089] font-bold">Direct Marketplace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Wedding Couture Bookings & Coordination
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct buyer-to-seller coordination for fittings, pickup/handover, security deposits, and in-app chat.
          </p>
        </div>

        {/* Quick Role Switcher Pill */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200 self-start">
          <button
            onClick={() => setActiveTabMode('buyer_rentals')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTabMode.startsWith('buyer') 
                ? 'bg-[#9f2089] text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Orders (Buyer)
          </button>
          <button
            onClick={() => setActiveTabMode('seller_rentals')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTabMode.startsWith('seller') 
                ? 'bg-[#9f2089] text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Studio Orders (Seller)
          </button>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {activeTabMode.startsWith('buyer') ? (
          <>
            <button
              onClick={() => setActiveTabMode('buyer_rentals')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTabMode === 'buyer_rentals'
                  ? 'bg-pink-50 text-[#9f2089] border border-pink-200 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Rental Bookings ({rentalBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTabMode('buyer_purchases')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTabMode === 'buyer_purchases'
                  ? 'bg-pink-50 text-[#9f2089] border border-pink-200 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Outright Purchases ({purchaseOrders.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTabMode('seller_rentals')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTabMode === 'seller_rentals'
                  ? 'bg-pink-50 text-[#9f2089] border border-pink-200 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Incoming Rentals ({sellerRentalBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTabMode('seller_purchases')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTabMode === 'seller_purchases'
                  ? 'bg-pink-50 text-[#9f2089] border border-pink-200 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Incoming Purchases ({sellerPurchaseOrders.length})</span>
            </button>
          </>
        )}
      </div>

      {/* Marketplace Banner */}
      <div className="p-4 rounded-3xl bg-pink-50/80 border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#9f2089] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">BGK Wear Direct Marketplace Coordination</h4>
            <p className="text-xs text-slate-600">
              Direct connection with verified curators across India. Agree on handover and return details directly with the owner.
            </p>
          </div>
        </div>
      </div>

      {/* LIST OF ORDERS / BOOKINGS */}
      {activeTabMode === 'buyer_rentals' && (
        <div className="space-y-4">
          {rentalBookings.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
              <Calendar className="w-12 h-12 mx-auto text-[#9f2089]/40" />
              <h3 className="text-lg font-black text-slate-900">No Rental Bookings Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore designer lehengas, sherwanis, and sarees for 3 to 14 days with direct seller coordination.
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-6 py-2.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                Browse Outfits to Rent
              </button>
            </div>
          ) : (
            rentalBookings.map((booking) => (
              <div 
                key={booking.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#9f2089] transition-all shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">ID: #{booking.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">Booked on {booking.bookingDate}</span>
                  </div>

                  {/* Status badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                    booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    booking.status === 'In Use' ? 'bg-pink-50 text-[#9f2089] border border-pink-200 animate-pulse' :
                    booking.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    booking.status === 'Returned' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    booking.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {booking.status === 'Dispatched' ? 'Handover Initiated' : booking.status}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Product image & details */}
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.productImage}
                      alt={booking.productTitle}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#9f2089] tracking-wider">
                        {booking.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">
                        {booking.productTitle}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Curator: <strong className="text-slate-900">{booking.sellerName}</strong>
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#9f2089]" />
                          {booking.startDate} to {booking.endDate} ({booking.totalDays} Days)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs w-full md:w-64">
                    <div className="flex justify-between text-slate-600">
                      <span>Rental Fee:</span>
                      <span className="font-bold text-slate-900">₹{booking.rentAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Security Deposit:</span>
                      <span>₹{booking.securityDeposit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 text-sm">
                      <span>Total Paid:</span>
                      <span className="text-[#9f2089]">₹{booking.totalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#9f2089]" />
                      <span>Deposit Status: {booking.depositRefundStatus || 'Refundable on Return'}</span>
                    </div>
                  </div>
                </div>

                {/* Handover & Coordination Note */}
                {booking.trackingNumber && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#9f2089]" />
                      <span>Handover / Coordination: <strong className="text-[#9f2089] font-mono">{booking.trackingNumber}</strong></span>
                    </div>
                    <span className="text-[11px] text-slate-500">Direct Handover</span>
                  </div>
                )}

                {/* Action Buttons for Buyer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCall(booking.sellerPhone)}
                      className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                      title="Call Curator"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#9f2089]" />
                      <span>Call Curator</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'Dispatched' && (
                      <button
                        onClick={() => updateRentalStatus(booking.id, 'In Use')}
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                      >
                        Confirm Received & In Use
                      </button>
                    )}

                    {booking.status === 'In Use' && (
                      <button
                        onClick={() => updateRentalStatus(booking.id, 'Returned', 'Refund Processing')}
                        className="px-4 py-2 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                      >
                        Initiate Return Handover to Seller
                      </button>
                    )}

                    {booking.status === 'Completed' && (
                      <button
                        onClick={() => {
                          const prod = products.find((p) => p.id === booking.productId);
                          if (prod) {
                            setSelectedProduct(prod);
                            setActiveModal('productDetail');
                          }
                        }}
                        className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-[#9f2089]" />
                        <span>Rate & Review Outfit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* BUYER PURCHASES TAB */}
      {activeTabMode === 'buyer_purchases' && (
        <div className="space-y-4">
          {purchaseOrders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#9f2089]/40" />
              <h3 className="text-lg font-black text-slate-900">No Purchase Orders Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Buy pre-loved and sample bridal wear permanently with verified designer certificates.
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-6 py-2.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                Explore Outfits for Sale
              </button>
            </div>
          ) : (
            purchaseOrders.map((order) => (
              <div 
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#9f2089] transition-all shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Order #{order.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{order.orderDate}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'Processing' ? 'bg-pink-50 text-[#9f2089] border border-pink-200' :
                    order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status === 'Shipped' ? 'Handover Initiated' : order.status === 'Delivered' ? 'Received & Completed' : order.status}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">{order.productTitle}</h3>
                      <p className="text-xs text-slate-600">Seller: <strong className="text-slate-900">{order.sellerName}</strong></p>
                      <p className="text-sm font-black text-[#9f2089]">Total: ₹{order.totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCall(order.sellerPhone)}
                      className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#9f2089]" />
                      <span>Call Seller</span>
                    </button>
                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => updatePurchaseStatus(order.id, 'Delivered')}
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Confirm Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SELLER RENTALS TAB */}
      {activeTabMode === 'seller_rentals' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            👑 As a Seller/Curator, review rental requests, chat with renters to coordinate fitting/handover, and release security deposits upon return inspection.
          </div>

          {sellerRentalBookings.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
              <Calendar className="w-12 h-12 mx-auto text-[#9f2089]/40" />
              <h3 className="text-lg font-black text-slate-900">No Incoming Rental Requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once brides or grooms request your listed outfits, their requests and contact coordination details will appear here.
              </p>
            </div>
          ) : (
            sellerRentalBookings.map((booking) => (
              <div 
                key={booking.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#9f2089] transition-all shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Request #{booking.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{booking.bookingDate}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-50 text-[#9f2089] border border-pink-200">
                    {booking.status === 'Dispatched' ? 'Handover Initiated' : booking.status}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.productImage}
                      alt={booking.productTitle}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{booking.productTitle}</h4>
                      <p className="text-xs text-slate-600">Renter: <strong className="text-slate-900">{booking.deliveryAddress.fullName}</strong> ({booking.deliveryAddress.city})</p>
                      <p className="text-xs text-[#9f2089] font-bold">Dates: {booking.startDate} to {booking.endDate}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">Payout Earnings</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{booking.rentAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Seller Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => openCall(booking.renterPhone || booking.sellerPhone)}
                    className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-[#9f2089] flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#9f2089]" />
                    <span>Call Renter</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {booking.status === 'Confirmed' && (
                      editingOrderId === booking.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Handover Note / Details"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#9f2089]"
                          />
                          <button
                            onClick={() => handleUpdateTracking(booking.id, true)}
                            className="px-3 py-1.5 rounded-full bg-[#9f2089] text-white text-xs font-bold cursor-pointer"
                          >
                            Save Handover
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingOrderId(booking.id)}
                          className="px-4 py-2 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                        >
                          Mark Ready / Handed Over
                        </button>
                      )
                    )}

                    {booking.status === 'Returned' && (
                      <button
                        onClick={() => updateRentalStatus(booking.id, 'Completed', 'Refunded to Renter')}
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Inspect & Settle Security Deposit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SELLER PURCHASES TAB */}
      {activeTabMode === 'seller_purchases' && (
        <div className="space-y-4">
          {sellerPurchaseOrders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#9f2089]/40" />
              <h3 className="text-lg font-black text-slate-900">No Outright Sales Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Orders for garments listed for sale will appear here.
              </p>
            </div>
          ) : (
            sellerPurchaseOrders.map((order) => (
              <div 
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#9f2089] transition-all shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono text-slate-400">Order #{order.id}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{order.productTitle}</h4>
                      <p className="text-xs text-slate-500">Buyer: {order.buyerName}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#9f2089]">₹{order.salePrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
