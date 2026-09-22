import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Tag, 
  Phone, 
  Video, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  ShieldCheck, 
  Crown,
  ShoppingBag, 
  Calendar, 
  ArrowLeft, 
  Search, 
  Archive, 
  Trash2, 
  Ban, 
  X,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatConversation, ChatOfferData, Product } from '../types';

export const ChatMessengerView: React.FC = () => {
  const {
    user,
    products,
    chats,
    activeChatId,
    activeChat,
    activeChatMessages,
    setActiveChatId,
    sendTextMessage,
    sendImageMessage,
    sendOffer,
    respondToOffer,
    setChatTyping,
    archiveChat,
    blockUserChat,
    deleteChat,
    setActiveTab,
    setSelectedProduct,
    setActiveModal,
    showToast
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerType, setOfferType] = useState<'rent' | 'buy'>('rent');
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerEndDate, setOfferEndDate] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getProductForConvo = (c: ChatConversation): Product | null => {
    if (!c.productId) return null;
    const found = products.find((p) => p.id === c.productId);
    if (found) return found;
    return {
      id: c.productId,
      title: c.productTitle || 'Designer Luxury Couture',
      description: 'Exclusive bridal & festive luxury outfit.',
      images: [c.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'],
      rentPricePerDay: c.productPrice || 2999,
      salePrice: (c.productPrice || 2999) * 8,
      category: 'Bridal Lehenga',
      brand: 'BGK Signature',
      size: 'Free Size',
      color: 'Lime Noir',
      colorHex: '#C4F400',
      condition: 'Like New (Worn Once)',
      listingType: 'both',
      securityDeposit: 5000,
      originalRetailPrice: 45000,
      city: 'Mumbai',
      state: 'Maharashtra',
      rating: 5.0,
      reviewsCount: 1,
      status: 'active',
      fabric: 'Pure Silk & Zari',
      measurements: { alterationMargin: '2-3 inches' },
      viewsCount: 10,
      likesCount: 5,
      createdAt: new Date().toISOString()
    } as Product;
  };

  const getOtherParticipant = (c: ChatConversation) => {
    const otherId = c.participants.find((p) => p !== user.id) || c.participants[0] || 'seller-1';
    return c.participantDetails?.[otherId] || {
      id: otherId,
      name: 'Curator Closet',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isOnline: true
    };
  };

  const activeProduct = activeChat ? getProductForConvo(activeChat) : null;

  // Auto-select first chat if none selected
  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats, setActiveChatId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  // Set default offer price when opening offer modal
  useEffect(() => {
    if (activeProduct) {
      if (offerType === 'rent') {
        setOfferPrice(Math.round(activeProduct.rentPricePerDay * 0.9)); // 10% discount suggestion
      } else if (activeProduct.salePrice) {
        setOfferPrice(Math.round(activeProduct.salePrice * 0.9));
      }
    }
  }, [activeProduct, offerType, showOfferModal]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const text = inputMessage;
    setInputMessage('');
    setIsSending(true);

    if (activeChatId) {
      setChatTyping(activeChatId, false);
    }

    try {
      await sendTextMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (!activeChatId) return;

    setChatTyping(activeChatId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (activeChatId) setChatTyping(activeChatId, false);
    }, 2000);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSending(true);
    try {
      await sendImageMessage(file);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputMessage(promptText);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || offerPrice <= 0) {
      showToast('Please specify a valid offer amount', 'error');
      return;
    }

    const offerData: ChatOfferData = {
      productId: activeProduct.id,
      productTitle: activeProduct.title,
      productImage: activeProduct.images[0] || '',
      offerType: offerType,
      originalPrice: offerType === 'rent' ? activeProduct.rentPricePerDay : (activeProduct.salePrice || 0),
      offeredPrice: offerPrice,
      status: 'pending',
      startDate: offerType === 'rent' ? offerStartDate : undefined,
      endDate: offerType === 'rent' ? offerEndDate : undefined,
      note: offerNote
    };

    setIsSending(true);
    try {
      await sendOffer(offerData);
      setShowOfferModal(false);
      setOfferNote('');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = chats.filter((c) => {
    const isArchivedForMe = Boolean(c.isArchived?.[user.id]);
    if (activeFilter === 'archived' && !isArchivedForMe) return false;
    if (activeFilter === 'active' && isArchivedForMe) return false;

    if (chatSearch.trim()) {
      const q = chatSearch.toLowerCase();
      const other = getOtherParticipant(c);
      const matchName = other.name.toLowerCase().includes(q);
      const matchProduct = (c.productTitle || '').toLowerCase().includes(q);
      const matchLastMsg = (c.lastMessage || '').toLowerCase().includes(q);
      return matchName || matchProduct || matchLastMsg;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-24 text-slate-900">
      {/* Top Breadcrumb / Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#9f2089] font-bold">Direct Concierge</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#9f2089] animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 tracking-tight">
            Direct Chat & Outfit Negotiation
          </h1>
        </div>

        <button
          onClick={() => setActiveTab('explore')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:text-[#9f2089] hover:border-[#9f2089] transition-all"
        >
          <Search className="w-3.5 h-3.5 text-[#9f2089]" />
          <span>Browse More Outfits</span>
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl min-h-[680px] max-h-[820px] flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#9f2089]" />
                Conversations
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search curator, client, outfit..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9f2089]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {(['all', 'active', 'archived'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeFilter === tab
                      ? 'bg-[#9f2089] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3 text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto text-[#9f2089]/30" />
                <p className="text-xs font-semibold text-slate-600">No active conversations found.</p>
                <p className="text-[11px] text-slate-400">Browse any outfit and click "Chat with Seller" to start negotiating.</p>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isSelected = convo.id === activeChatId;
                const other = getOtherParticipant(convo);
                const unread = convo.unreadCount?.[user.id] || 0;

                return (
                  <button
                    key={convo.id}
                    onClick={() => setActiveChatId(convo.id)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-all hover:bg-slate-50 cursor-pointer ${
                      isSelected ? 'bg-[#9f2089]/10 border-l-4 border-[#9f2089]' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#9f2089]/30 bg-slate-100">
                        <img
                          src={other.avatar}
                          alt={other.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {other.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#9f2089] border-2 border-white" />
                      )}
                    </div>

                    {/* Chat Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                          {other.name}
                          <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {convo.lastMessageTime || 'Recently'}
                        </span>
                      </div>

                      {convo.productTitle && (
                        <p className="text-[10px] text-[#9f2089] font-bold truncate mt-0.5 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {convo.productTitle}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 truncate mt-1">
                        {convo.lastMessage || 'Tap to start conversation'}
                      </p>
                    </div>

                    {/* Unread Counter Badge */}
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#9f2089] text-white text-[10px] font-extrabold flex items-center justify-center shadow-md flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Room */}
        {activeChat ? (
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            
            {/* Active Chat Top Header */}
            {(() => {
              const other = getOtherParticipant(activeChat);
              const isArchivedForMe = Boolean(activeChat.isArchived?.[user.id]);

              return (
                <>
                  <div className="p-4 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setActiveChatId(null)}
                        className="md:hidden p-2 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      {/* Avatar & User info */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-[#9f2089]/40 bg-slate-100">
                          <img
                            src={other.avatar}
                            alt={other.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-sm font-bold text-slate-900">
                            {other.name}
                          </h2>
                          <span className="px-1.5 py-0.5 rounded bg-[#9f2089]/10 text-[#9f2089] text-[9px] font-black uppercase tracking-wider">
                            Verified Curator
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9f2089] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9f2089] animate-pulse" />
                          {other.isOnline ? 'Active Now' : 'Typically replies fast'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast('Direct voice connect...', 'info')}
                        className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#9f2089] hover:border-[#9f2089]/40 transition-colors"
                        title="Voice Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => showToast('Virtual Video Fitting connect...', 'info')}
                        className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#9f2089] hover:border-[#9f2089]/40 transition-colors"
                        title="Video Fitting"
                      >
                        <Video className="w-4 h-4" />
                      </button>

                      {/* More Options dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-300 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                            <button
                              onClick={() => {
                                archiveChat(activeChat.id, !isArchivedForMe);
                                setShowMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-slate-700"
                            >
                              <Archive className="w-3.5 h-3.5 text-[#9f2089]" />
                              <span>{isArchivedForMe ? 'Unarchive Chat' : 'Archive Chat'}</span>
                            </button>
                            <button
                              onClick={() => {
                                blockUserChat(activeChat.id, true);
                                setShowMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-amber-600"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Block User</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteChat(activeChat.id);
                                setShowMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Conversation</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contextual Product Banner at top of chat */}
                  {activeProduct && (
                    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => {
                          setSelectedProduct(activeProduct);
                          setActiveModal('productDetail');
                        }}
                      >
                        <img
                          src={activeProduct.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80'}
                          alt={activeProduct.title}
                          className="w-10 h-10 rounded-xl object-cover border border-[#9f2089]/40 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#9f2089] transition-colors truncate max-w-[200px] sm:max-w-xs">
                            {activeProduct.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>Rent: <strong className="text-[#9f2089]">₹{activeProduct.rentPricePerDay.toLocaleString('en-IN')}/day</strong></span>
                            {activeProduct.salePrice && (
                              <span>• Buy: <strong className="text-slate-900">₹{activeProduct.salePrice.toLocaleString('en-IN')}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowOfferModal(true)}
                          className="px-3 py-1.5 rounded-full bg-[#9f2089]/10 border border-[#9f2089]/40 text-[#9f2089] text-xs font-bold hover:bg-[#9f2089] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Tag className="w-3 h-3" />
                          <span>Make Offer</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProduct(activeProduct);
                            setActiveModal('rentalCheckout');
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#9f2089] text-white text-xs font-extrabold hover:bg-[#80146f] transition-all hidden sm:flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Book Now</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Direct Communication Notice */}
              <div className="max-w-md mx-auto p-3 rounded-2xl bg-white border border-amber-200 text-center space-y-1 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600">
                  <Crown className="w-4 h-4 fill-amber-500" />
                  <span>Direct Buyer-Seller Communication</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Coordinate fitting, rental dates, and handover directly with the curator. Inspect outfits thoroughly upon handover.
                </p>
              </div>

              {activeChatMessages.map((msg) => {
                const isMe = msg.senderId === user.id;

                {/* 1. SYSTEM MESSAGE */}
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="px-4 py-1.5 rounded-full bg-slate-200/80 border border-slate-300 text-[11px] text-slate-700 text-center font-medium">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                {/* 2. OFFER MESSAGE CARD */}
                if (msg.type === 'offer' && msg.offerData) {
                  const offer = msg.offerData;
                  const canRespond = !isMe && offer.status === 'pending';

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-sm sm:max-w-md w-full p-4 rounded-3xl bg-white border-2 border-[#9f2089]/40 shadow-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#9f2089]">
                            <Tag className="w-4 h-4" />
                            <span>Formal Offer Proposal</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                            offer.status === 'declined' ? 'bg-red-100 text-red-700 border border-red-300' :
                            'bg-[#9f2089]/10 text-[#9f2089] border border-[#9f2089]/30 animate-pulse'
                          }`}>
                            {offer.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {offer.productImage && (
                            <img
                              src={offer.productImage}
                              alt={offer.productTitle}
                              className="w-14 h-14 rounded-2xl object-cover border border-[#9f2089]/30"
                            />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">{offer.productTitle}</p>
                            <p className="text-[11px] text-slate-500 capitalize">Type: {offer.offerType === 'rent' ? 'Rental Booking' : 'Outright Purchase'}</p>
                            {offer.startDate && offer.endDate && (
                              <p className="text-[10px] text-[#9f2089]">Dates: {offer.startDate} to {offer.endDate}</p>
                            )}
                          </div>
                        </div>

                        {/* Price highlight */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">
                            <span>Original: </span>
                            <span className="line-through">₹{offer.originalPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#9f2089] block font-semibold uppercase">Offered Price</span>
                            <span className="text-lg font-black text-[#9f2089]">
                              ₹{offer.offeredPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {offer.note && (
                          <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl">
                            "{offer.note}"
                          </p>
                        )}

                        {/* Response Actions */}
                        {canRespond && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => respondToOffer(msg.id, 'accepted')}
                              className="py-2 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => respondToOffer(msg.id, 'declined')}
                              className="py-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}

                        {offer.status === 'accepted' && isMe && (
                          <button
                            onClick={() => {
                              if (activeProduct) {
                                setSelectedProduct(activeProduct);
                                setActiveModal(offer.offerType === 'rent' ? 'rentalCheckout' : 'buyCheckout');
                              }
                            }}
                            className="w-full py-2.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Proceed to Booking</span>
                          </button>
                        )}

                        <div className="flex items-center justify-end text-[9px] text-slate-400 gap-1 pt-1">
                          <span>{msg.timestamp || 'Just now'}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-[#9f2089]" />}
                        </div>
                      </div>
                    </div>
                  );
                }

                {/* 3. IMAGE MESSAGE */}
                if (msg.type === 'image') {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs sm:max-w-sm p-2 rounded-3xl shadow-sm ${
                        isMe ? 'bg-white border border-[#9f2089]/40' : 'bg-white border border-slate-200'
                      }`}>
                        <div 
                          className="rounded-2xl overflow-hidden cursor-pointer"
                          onClick={() => setSelectedImagePreview(msg.imageUrl || null)}
                        >
                          <img
                            src={msg.imageUrl}
                            alt="Uploaded message photograph"
                            className="w-full h-auto max-h-64 object-cover hover:scale-102 transition-transform"
                          />
                        </div>
                        <div className="flex items-center justify-between px-2 pt-1.5 text-[9px] text-slate-400">
                          <span>{msg.senderName}</span>
                          <div className="flex items-center gap-1">
                            <span>{msg.timestamp}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-[#9f2089]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                {/* 4. STANDARD TEXT MESSAGE */}
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs sm:max-w-md p-3.5 rounded-3xl shadow-sm ${
                      isMe 
                        ? 'bg-[#9f2089] text-white font-semibold rounded-tr-sm' 
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-sm'
                    }`}>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isMe ? 'text-white/80' : 'text-slate-400'
                      }`}>
                        <span>{msg.timestamp || 'Just now'}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0 uppercase tracking-wider">
                Quick replies:
              </span>
              {[
                'Is this available for my dates? ⚡',
                'What are the exact bust & waist measurements?',
                'Can we arrange a quick trial or pickup?',
                'Will it come professionally sanitized & dry-cleaned?'
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#9f2089]/10 hover:text-[#9f2089] border border-slate-200 text-[11px] text-slate-700 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Composer Box */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Upload Image Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#9f2089] hover:border-[#9f2089]/40 transition-colors cursor-pointer"
                  title="Send Outfit Photo or Fitting"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Make Offer Button */}
                <button
                  type="button"
                  onClick={() => setShowOfferModal(true)}
                  className="p-3 rounded-2xl bg-[#9f2089]/10 border border-[#9f2089]/40 text-[#9f2089] hover:bg-[#9f2089] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                  title="Propose Counter Offer"
                >
                  <Tag className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  placeholder="Type your message to seller..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9f2089] transition-all"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="p-3 rounded-2xl bg-[#9f2089] text-white font-extrabold hover:bg-[#80146f] disabled:opacity-40 transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          /* Empty Chat View */
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-12 text-center bg-slate-50 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-[#9f2089]/10 border border-[#9f2089]/30 flex items-center justify-center text-[#9f2089]">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Select a Conversation</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Communicate securely with verified bridal & designer closet curators across India.
            </p>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-6 py-2.5 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              Explore Outfits
            </button>
          </div>
        )}

      </div>

      {/* MAKE FORMAL OFFER MODAL */}
      {showOfferModal && activeProduct && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Tag className="w-4 h-4 text-[#9f2089]" />
                <span>Make a Price Offer</span>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-1 rounded-full text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product recap */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 border border-slate-100">
              <img
                src={activeProduct.images[0]}
                alt={activeProduct.title}
                className="w-12 h-12 rounded-xl object-cover border border-[#9f2089]/30"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{activeProduct.title}</h4>
                <p className="text-[11px] text-slate-500">Current Rate: ₹{activeProduct.rentPricePerDay.toLocaleString('en-IN')}/day</p>
              </div>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              {/* Type selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOfferType('rent')}
                  className={`py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    offerType === 'rent'
                      ? 'bg-[#9f2089] text-white border-[#9f2089]'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  Rental Offer
                </button>
                {activeProduct.salePrice && (
                  <button
                    type="button"
                    onClick={() => setOfferType('buy')}
                    className={`py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      offerType === 'buy'
                        ? 'bg-[#9f2089] text-white border-[#9f2089]'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Purchase Offer
                  </button>
                )}
              </div>

              {/* Price input */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Your Proposed Offer Price (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm font-bold text-[#9f2089] focus:outline-none focus:border-[#9f2089]"
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-slate-400">
                    {offerType === 'rent' ? '/ day' : 'total'}
                  </span>
                </div>
              </div>

              {/* Dates if rental */}
              {offerType === 'rent' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Rental Start</label>
                    <input
                      type="date"
                      value={offerStartDate}
                      onChange={(e) => setOfferStartDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Rental End</label>
                    <input
                      type="date"
                      value={offerEndDate}
                      onChange={(e) => setOfferEndDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Note / Message */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Optional Note to Seller
                </label>
                <textarea
                  rows={2}
                  placeholder="E.g., I love this piece for my event..."
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9f2089]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white font-extrabold uppercase tracking-wider text-xs transition-all shadow-lg cursor-pointer"
                >
                  Send Formal Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW */}
      {selectedImagePreview && (
        <div 
          className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={selectedImagePreview}
              alt="Full Preview"
              className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-200/70 text-slate-900 hover:text-[#9f2089]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
