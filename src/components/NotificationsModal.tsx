import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  XCircle, 
  Sparkles, 
  Clock, 
  MessageCircle, 
  Tag, 
  ShieldCheck, 
  CheckCheck,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';
import { AppNotification } from '../types';

export const NotificationsModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    notifications, 
    markNotificationRead, 
    handleNotificationAction,
    setSelectedProduct,
    products
  } = useApp();

  useDynamicSEO(
    activeModal === 'notifications'
      ? {
          title: 'Notifications & Order Updates | BGK WEAR',
          description: 'Stay updated on rental requests, buyer inquiries, booking confirmations, and special offers on BGK WEAR.',
          type: 'website'
        }
      : null
  );

  const [activeFilter, setActiveFilter] = useState<'all' | 'rental_request' | 'purchase_request' | 'offers' | 'messages'>('all');

  if (activeModal !== 'notifications') return null;

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'rental_request') return n.type === 'rental_request';
    if (activeFilter === 'purchase_request') return n.type === 'purchase_request';
    if (activeFilter === 'offers') return n.type === 'offer';
    if (activeFilter === 'messages') return n.type === 'message';
    return true;
  });

  const handleOpenProduct = (prodId?: string) => {
    if (!prodId) return;
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setSelectedProduct(prod);
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="relative w-full h-full flex flex-col">
        
        {/* Premium Header - Meesho Style */}
        <div className="flex items-center justify-between px-5 py-4 border-b-4 border-pink-50 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveModal(null)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Notifications & Activity</h3>
              <p className="text-[10px] text-pink-600 font-bold uppercase tracking-widest">Your Couture Updates</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-[#9f2089] shadow-sm border border-pink-100">
            <Bell className="w-5 h-5 fill-pink-100" />
          </div>
        </div>

        {/* Filter Grid - Non-Scrolling Rectangle Tabs */}
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'rental_request', label: 'Rentals' },
              { id: 'purchase_request', label: 'Buying' },
              { id: 'offers', label: 'Offers' },
              { id: 'messages', label: 'Chats' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-1 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer border flex flex-col items-center justify-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-[#9f2089] border-[#9f2089] text-white shadow-md scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300 hover:text-[#9f2089]'
                }`}
              >
                {tab.id === 'all' && <Bell className="w-3.5 h-3.5" />}
                {tab.id === 'rental_request' && <Clock className="w-3.5 h-3.5" />}
                {tab.id === 'purchase_request' && <ShoppingBag className="w-3.5 h-3.5" />}
                {tab.id === 'offers' && <Tag className="w-3.5 h-3.5" />}
                {tab.id === 'messages' && <MessageCircle className="w-3.5 h-3.5" />}
                <span className="truncate w-full text-center px-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No notifications in this category.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.relatedProductId) handleOpenProduct(n.relatedProductId);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  n.read
                    ? 'bg-white border-slate-200/90 hover:border-slate-300'
                    : 'bg-pink-50/60 border-pink-200 shadow-sm hover:border-pink-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {n.senderAvatar ? (
                    <img
                      src={n.senderAvatar}
                      alt="Sender"
                      className="w-10 h-10 rounded-full object-cover border border-pink-300 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-[#9f2089] shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">{n.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.description}</p>

                    {/* Action buttons for rental requests */}
                    {n.actionRequired && n.actionState === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(n.id, 'accepted');
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(n.id, 'declined');
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}

                    {n.actionState === 'accepted' && (
                      <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Accepted • Outfit reserved for renter</span>
                      </div>
                    )}

                    {n.actionState === 'declined' && (
                      <div className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Declined</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
