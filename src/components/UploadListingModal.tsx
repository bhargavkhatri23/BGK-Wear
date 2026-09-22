import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  Scissors, 
  ChevronDown, 
  ChevronUp,
  Camera,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OutfitCategory, OutfitSize, ListingType, Product } from '../types';
import { CATEGORIES_DATA, CITIES_LIST, INDIAN_STATES_LIST, POPULAR_INDIAN_CITIES, getStateForCity } from '../data/mockData';
import { compressImage, validateImageFile } from '../services/imageService';
import { uploadMultipleListingImages } from '../services/storageService';
import { useDynamicSEO } from '../hooks/useDynamicSEO';

export const UploadListingModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    setActiveTab,
    addProduct, 
    updateProduct,
    editingProduct,
    setEditingProduct,
    user, 
    setSelectedProduct,
    showToast
  } = useApp();

  const isEditing = Boolean(editingProduct);

  useDynamicSEO(
    activeModal === 'upload'
      ? {
          title: isEditing 
            ? `Edit Outfit Listing: ${editingProduct?.title || 'Outfit'} | BGK WEAR` 
            : 'List Your Designer Outfit | Earn with 0% Commission | BGK WEAR',
          description: isEditing
            ? 'Update your outfit listing on BGK WEAR luxury marketplace.'
            : 'Earn up to ₹50,000/month by renting or selling your luxury bridal lehengas, sherwanis & party outfits with 0% platform commission and 100% verified security deposit.',
          type: 'website'
        }
      : null
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<OutfitCategory>('Bridal Lehenga');
  const [brand, setBrand] = useState('BGK Signature');
  const [size, setSize] = useState<OutfitSize>('M');
  const [listingType, setListingType] = useState<ListingType>('both');
  const [rentPrice, setRentPrice] = useState('3500');
  const [salePrice, setSalePrice] = useState('65000');
  const [deposit, setDeposit] = useState('6000');
  const [retailPrice, setRetailPrice] = useState('180000');
  const [city, setCity] = useState(user?.district || user?.city || '');
  const [customCity, setCustomCity] = useState('');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split('T')[0]);
  const [availableTo, setAvailableTo] = useState('2027-12-31');
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>([
    'Mutual Meetup in City'
  ]);

  // Images state (User uploaded photos)
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or prefill when editingProduct changes or modal opens
  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title || '');
      setDescription(editingProduct.description || '');
      setCategory(editingProduct.category || 'Bridal Lehenga');
      setBrand(editingProduct.brand || 'BGK Signature');
      setSize(editingProduct.size || 'M');
      setListingType(editingProduct.listingType || 'both');
      setRentPrice(editingProduct.rentPricePerDay?.toString() || '3500');
      setSalePrice(editingProduct.salePrice?.toString() || '');
      setDeposit(editingProduct.securityDeposit?.toString() || '5000');
      setRetailPrice(editingProduct.originalRetailPrice?.toString() || '50000');
      setCity(editingProduct.city || user?.city || 'Mumbai');
      setState(editingProduct.state || user?.state || 'Maharashtra');
      setAvailableFrom(editingProduct.availableFrom || new Date().toISOString().split('T')[0]);
      setAvailableTo(editingProduct.availableTo || '2027-12-31');
      setDeliveryOptions(['Mutual Meetup in City']);
      setImages(Array.isArray(editingProduct.images) ? [...editingProduct.images] : []);
    } else if (activeModal === 'upload') {
      setTitle('');
      setDescription('');
      setCategory('Bridal Lehenga');
      setBrand('BGK Signature');
      setSize('M');
      setListingType('both');
      setRentPrice('3500');
      setSalePrice('65000');
      setDeposit('6000');
      setRetailPrice('180000');
      setCity(user?.district || user?.city || 'Mumbai');
      setState(user?.state || 'Maharashtra');
      setPincode(user?.pincode || '400050');
      setDeliveryOptions(['Mutual Meetup in City']);
      setImages([]);
      setFormError(null);
    }
  }, [editingProduct, activeModal, user]);

  if (activeModal !== 'upload' && !editingProduct) return null;

  const handleClose = () => {
    setActiveModal(null);
    setEditingProduct(null);
    setFormError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormError(null);
    const newBase64Urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        showToast(validation.error || 'Invalid image file', 'error');
        continue;
      }

      try {
        const compressed = await compressImage(file, 800, 1000, 0.68);
        if (compressed.dataUrl) {
          newBase64Urls.push(compressed.dataUrl);
        } else {
          const rawBase64 = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = (evt) => resolve((evt.target?.result as string) || '');
            r.onerror = () => resolve('');
            r.readAsDataURL(file);
          });
          if (rawBase64) newBase64Urls.push(rawBase64);
        }
      } catch {
        const rawBase64 = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = (evt) => resolve((evt.target?.result as string) || '');
          r.onerror = () => resolve('');
          r.readAsDataURL(file);
        });
        if (rawBase64) newBase64Urls.push(rawBase64);
      }
    }

    if (newBase64Urls.length > 0) {
      setImages((prev) => [...prev, ...newBase64Urls]);
      showToast(`⚡ ${newBase64Urls.length} photo(s) selected successfully!`, 'success');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddCustomImageUrl = () => {
    if (customImageUrl.trim() && !images.includes(customImageUrl)) {
      setImages([...images, customImageUrl.trim()]);
      setCustomImageUrl('');
      setFormError(null);
      showToast('Photo link added!', 'success');
    }
  };

  const handleRemoveImage = (idx: number) => {
    if (images.length === 1) {
      showToast('At least one outfit image is required.', 'info');
      return;
    }
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSetMainImage = (idx: number) => {
    if (idx === 0) return;
    const selected = images[idx];
    const rest = images.filter((_, i) => i !== idx);
    setImages([selected, ...rest]);
    showToast('Cover photo updated 📸', 'info');
  };

  const handleGenerateLuxuryDescription = () => {
    setIsGeneratingDesc(true);
    setTimeout(() => {
      const brandToUse = brand || 'BGK Signature';
      setDescription(
        `Exquisite handcrafted ${category} from ${brandToUse} with intricate craftsmanship, embroidery, and premium designer finish. Professionally sanitized and stored in protective garment bag. Includes expandable side margin allowances.`
      );
      setIsGeneratingDesc(false);
      showToast('AI Description generated ⚡', 'success');
    }, 400);
  };

  const handleAutoRecommendDeposit = () => {
    const rentNum = Number(rentPrice) || 3000;
    const recommended = Math.round(rentNum * 1.8);
    setDeposit(recommended.toString());
    showToast(`Recommended security deposit set: ₹${recommended.toLocaleString('en-IN')}`, 'info');
  };

  const toggleDeliveryOption = (opt: string) => {
    if (deliveryOptions.includes(opt)) {
      if (deliveryOptions.length === 1) return;
      setDeliveryOptions(deliveryOptions.filter(o => o !== opt));
    } else {
      setDeliveryOptions([...deliveryOptions, opt]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || title.trim().length < 4) {
      setFormError('Please provide a title (at least 4 characters).');
      return;
    }

    if (images.length === 0) {
      setFormError('Please select at least 1 outfit photo.');
      return;
    }

    const rentPriceNum = Number(rentPrice);
    if (listingType !== 'buy' && (!rentPriceNum || rentPriceNum <= 0)) {
      setFormError('Please enter a valid daily rental price greater than ₹0.');
      return;
    }

    const salePriceNum = Number(salePrice);
    if (listingType !== 'rent' && (!salePriceNum || salePriceNum <= 0)) {
      setFormError('Please enter a valid selling price greater than ₹0.');
      return;
    }

    const depositNum = Number(deposit);
    if (listingType !== 'buy' && (!depositNum || depositNum < 0)) {
      setFormError('Please enter a valid security deposit amount.');
      return;
    }

    setIsSubmitting(true);
    const finalBrand = brand || 'BGK Signature';

    const productPayload: Partial<Product> = {
      title: title.trim(),
      description: description.trim() || `Exquisite handcrafted ${category}.`,
      category,
      brand: finalBrand,
      size,
      listingType,
      rentPricePerDay: listingType !== 'buy' ? rentPriceNum : 0,
      salePrice: listingType !== 'rent' && salePriceNum ? salePriceNum : undefined,
      securityDeposit: listingType !== 'buy' ? depositNum : 0,
      originalRetailPrice: Number(retailPrice) || (listingType === 'rent' ? rentPriceNum * 15 : salePriceNum * 1.5),
      images: [...images],
      city,
      state,
      availableFrom,
      availableTo,
      occasion: ['Wedding Ceremony', 'Reception', 'Sangeet & Mehendi']
    };

    try {
      if (isEditing && editingProduct) {
        const updated = await updateProduct(editingProduct.id, productPayload);
        if (updated && typeof updated === 'object' && 'id' in updated) {
          setSelectedProduct(updated);
        } else {
          setSelectedProduct(null);
        }
        showToast('🎉 Listing updated successfully!', 'success');
      } else {
        const created = await addProduct(productPayload);
        if (created && typeof created === 'object' && 'id' in created) {
          setSelectedProduct(created);
        } else {
          setSelectedProduct(null);
        }
        setActiveTab('explore');
        showToast('🎉 Outfit published successfully! Live on BGK WEAR.', 'success');
      }

      setIsSubmitting(false);
      handleClose();

      if (images && images.length > 0) {
        uploadMultipleListingImages(images, user.id).catch((err) => {
          console.warn('Background image sync note:', err);
        });
      }
    } catch (err: any) {
      console.error('Failed to submit listing:', err);
      setIsSubmitting(false);
      showToast(err?.message || 'Failed to publish outfit. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 flex justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200 text-slate-900">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9f2089] text-white flex items-center justify-center shadow-md">
              {isEditing ? <Sparkles className="w-5 h-5 stroke-[2.5]" /> : <Upload className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {isEditing ? 'Edit Outfit Listing' : 'List Outfit on BGK WEAR'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#9f2089]/10 text-[#9f2089] text-[10px] font-black uppercase tracking-wider border border-[#9f2089]/30">
                  {isEditing ? 'Editing' : '0% Commission'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isEditing ? 'Update pricing, availability or photos' : 'Earn rental income with verified buyers across India'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-6 no-scrollbar bg-white">
          
          {/* Error Banner if any */}
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Photos & HD Gallery (Real User Upload) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>1. Outfit Photos & HD Gallery</span>
                {images.length > 0 && (
                  <span className="text-slate-900 font-bold">({images.length} uploaded)</span>
                )}
              </label>
              <span className="text-[11px] font-medium text-slate-500">First photo is your Live Cover</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="gallery-file-input"
            />

            {images.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#9f2089]/40 hover:border-[#9f2089] bg-white hover:bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-sm"
                id="empty-upload-dropzone"
              >
                <div className="w-16 h-16 rounded-2xl bg-black text-[#9f2089] shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-[#9f2089]/30">
                  <Camera className="w-8 h-8 text-[#9f2089]" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">
                  Tap to Select Outfit Photos from Gallery / Camera
                </p>
                <p className="text-xs text-slate-500 max-w-sm mb-3.5">
                  Upload authentic photos of your outfit. Your first photo will be saved as the primary cover thumbnail.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 bg-[#9f2089] hover:bg-[#80146f] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4" /> Select Photos from Gallery
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Current Images Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 group bg-black shadow-sm ${
                        idx === 0 ? 'border-[#9f2089] ring-2 ring-[#9f2089]/40' : 'border-slate-200'
                      }`}
                    >
                      <img src={img} alt={`Uploaded Outfit ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Always Visible Remove Button (Top Right) */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md z-10 cursor-pointer active:scale-95 transition-transform"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>

                      {/* Hover Overlay for Set Cover */}
                      {idx !== 0 && (
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(idx)}
                            className="w-full py-1.5 rounded-lg bg-[#9f2089] hover:bg-[#80146f] text-white text-[10px] font-black shadow cursor-pointer text-center"
                          >
                            Set as Cover
                          </button>
                        </div>
                      )}

                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#9f2089] text-white text-[9px] font-black shadow-md">
                          ★ COVER THUMBNAIL
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add more button tile */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 hover:border-[#9f2089] bg-white hover:bg-[#1f1f1f] flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-[#9f2089] transition-all cursor-pointer"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[11px] font-bold">+ Add Photo</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-[#9f2089] border border-[#9f2089]/30 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add More Photos
                  </button>

                  <span className="text-xs text-[#9f2089] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {images.length} photo(s) ready to publish
                  </span>
                </div>
              </div>
            )}

            {/* Paste Custom Image URL (Optional) */}
            <div className="flex gap-2 pt-1 border-t border-slate-200">
              <input
                type="url"
                placeholder="Or paste external photo link (optional)..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomImageUrl}
                className="px-4 py-2 bg-slate-200 hover:bg-white/20 text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                + Add Link
              </button>
            </div>
          </div>

          {/* Section 2: Listing Type (Rent, Buy, Both) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block">
              2. Listing Type (Choose Transaction Model) *
            </label>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'both', label: 'Rent & Sell (Both)', sub: 'Earn rental + selling opportunity' },
                { id: 'rent', label: 'Rent Only', sub: 'Retain wardrobe ownership' },
                { id: 'buy', label: 'Sell Only', sub: 'Permanent buyer transfer' }
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setListingType(m.id as ListingType)}
                  className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    listingType === m.id
                      ? 'border-[#9f2089] bg-[#9f2089]/10 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold block text-slate-900">{m.label}</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Identity & Categorization */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-4">
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block">
              3. Outfit Identity & Details
            </label>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-900">Outfit Title *</label>
                <span className="text-[11px] text-slate-400">{title.length}/100</span>
              </div>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Sabyasachi Royal Crimson Velvet Heritage Bridal Lehenga"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as OutfitCategory)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:border-[#9f2089] focus:outline-none"
                >
                  {CATEGORIES_DATA.map((c) => (
                    <option key={c.name} value={c.name} className="bg-slate-50 text-slate-900">{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">Size Availability *</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as OutfitSize)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:border-[#9f2089] focus:outline-none"
                >
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom Fit'].map((s) => (
                    <option key={s} value={s} className="bg-slate-50 text-slate-900">{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: AI Description & Copywriter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider">
                4. Description & Styling Details
              </label>
              <button
                type="button"
                onClick={handleGenerateLuxuryDescription}
                disabled={isGeneratingDesc}
                className="text-xs font-bold text-[#9f2089] hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingDesc ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#9f2089]" />
                    <span>AI Description Generator</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight embroidery, can-can volume, blouse padding, latkans, dupatta drapes, and dry-clean status..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:border-[#9f2089] focus:outline-none"
            />
          </div>

          {/* Section 5: Pricing & Security Deposit */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3.5">
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block">
              5. Pricing, Security Deposit & Retail Value
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {listingType !== 'buy' && (
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">Daily Rental Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-[#9f2089] font-bold">₹</span>
                    <input
                      type="number"
                      value={rentPrice}
                      onChange={(e) => setRentPrice(e.target.value)}
                      placeholder="3500"
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-7 pr-3 text-xs text-[#9f2089] font-bold focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {listingType !== 'rent' && (
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">Direct Purchase Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="65000"
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-7 pr-3 text-xs text-slate-900 font-bold focus:border-[#9f2089] focus:outline-none"
                      required={listingType === 'buy'}
                    />
                  </div>
                </div>
              )}

              {listingType !== 'buy' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-900">Security Deposit (₹) *</label>
                    <button
                      type="button"
                      onClick={handleAutoRecommendDeposit}
                      className="text-[11px] font-bold text-[#9f2089] hover:underline cursor-pointer"
                    >
                      Auto-Calc
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-[#9f2089] font-bold">₹</span>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="6000"
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-7 pr-3 text-xs text-slate-900 font-bold focus:border-[#9f2089] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">Original Retail Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    placeholder="180000"
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-7 pr-3 text-xs text-slate-900 font-semibold focus:border-[#9f2089] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9f2089] flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Direct Handover Security:</strong> Security deposit is agreed directly between buyer and seller and refunded upon safe return inspection.
              </span>
            </div>
          </div>

          {/* Section 6: Location & Handover */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3.5">
            <label className="text-xs font-black text-[#9f2089] uppercase tracking-wider block">
              6. Location & Handover Options
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">City Location *</label>
                <select
                  value={city}
                  onChange={(e) => {
                    const selCity = e.target.value;
                    setCity(selCity);
                    const matchedState = getStateForCity(selCity);
                    if (matchedState) {
                      setState(matchedState);
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:border-[#9f2089] focus:outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Select City --</option>
                  {POPULAR_INDIAN_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-50 text-slate-900">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:border-[#9f2089] focus:outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Select State --</option>
                  {INDIAN_STATES_LIST.map((st) => (
                    <option key={st} value={st} className="bg-slate-50 text-slate-900">{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">Pincode / Local Area</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="400050"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:border-[#9f2089] focus:outline-none"
                />
              </div>
            </div>

            {/* Handover Methods */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-900 block">Supported Handover & Pickup Arrangements</label>
              <div className="flex flex-wrap gap-2">
                <div className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-[#9f2089] bg-[#9f2089]/10 text-[#9f2089]">
                  <Check className="w-3.5 h-3.5 text-[#9f2089]" />
                  <span>Mutual Meetup in City</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Buyer and seller coordinate a convenient public spot or mutual meetup location in the city.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-4 rounded-full bg-[#9f2089] hover:bg-[#80146f] text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#9f2089]/20 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              id="publish-outfit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  <span>{isEditing ? 'Save & Update Listing' : 'Publish Outfit to BGK WEAR'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
