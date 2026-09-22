import React from 'react';
import { 
  Rocket, 
  Download, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  HardDrive, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDynamicSEO } from '../hooks/useDynamicSEO';
import { CURRENT_APP_VERSION } from '../services/versionService';

export const AppUpdateModal: React.FC = () => {
  const { 
    showUpdateModal, 
    setShowUpdateModal, 
    updateInfo, 
    dismissUpdate 
  } = useApp();

  useDynamicSEO(
    showUpdateModal && updateInfo
      ? {
          title: `Update Available (v${updateInfo.latestVersion}) | BGK WEAR`,
          description: `Download and install the latest BGK WEAR update v${updateInfo.latestVersion} for brand new designer collections, faster checkout, and enhanced security.`,
          type: 'website'
        }
      : null
  );

  if (!showUpdateModal || !updateInfo) {
    return null;
  }

  const handleUpdateClick = () => {
    if (updateInfo.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = () => {
    dismissUpdate();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-50 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-pink-200 shadow-2xl shadow-pink-900/30 overflow-hidden animate-in zoom-in-95 duration-200"
        id="app-update-modal-card"
      >
        {/* Top Decorative Gradient Header */}
        <div className="bg-gradient-to-br from-[#9f2089] via-[#b51f7b] to-[#c2185b] p-6 text-white relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-yellow-300/15 rounded-full blur-xl pointer-events-none" />

          {/* Close button (only if not mandatory) */}
          {!updateInfo.isMandatory && (
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer"
              title="Close"
              id="update-modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="relative z-10 space-y-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mx-auto text-yellow-300 shadow-lg mb-2 animate-bounce">
              <Rocket className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-yellow-200 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BGK Wear Version Update</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              🚀 Naya Update Aagya Hai!
            </h2>
            <p className="text-xs text-pink-100 font-medium max-w-xs mx-auto leading-relaxed">
              Aap BGK Wear ka purana version use kar rahe hain. Naye features ke liye abhi update karein.
            </p>
          </div>
        </div>

        {/* Version Difference & Details */}
        <div className="p-6 space-y-5">
          {/* Version Pill Comparator */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Version</span>
              <span className="font-bold text-slate-600">v{CURRENT_APP_VERSION}</span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-[#9f2089] text-white text-[11px] font-black uppercase tracking-wider">
              Update to →
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-[#9f2089]">Latest Version</span>
              <span className="font-black text-emerald-600 flex items-center gap-1 justify-end">
                <span>v{updateInfo.version}</span>
                <Sparkles className="w-3 h-3 text-emerald-500" />
              </span>
            </div>
          </div>

          {/* Meta Info (Size, Date) */}
          {(updateInfo.fileSize || updateInfo.releaseDate) && (
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
              {updateInfo.fileSize && (
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Size: {updateInfo.fileSize}</span>
                </span>
              )}
              {updateInfo.releaseDate && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Released: {updateInfo.releaseDate}</span>
                </span>
              )}
            </div>
          )}

          {/* What's New Section */}
          {updateInfo.releaseNotes && updateInfo.releaseNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#9f2089]" />
                <span>What's New in v{updateInfo.version}</span>
              </h4>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 max-h-40 overflow-y-auto">
                {updateInfo.releaseNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9f2089] mt-1.5 flex-shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & 0% Commission Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Safe Update from BGK Wear</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleUpdateClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#9f2089] via-[#b51f7b] to-[#c2185b] text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:from-[#80146e] hover:to-[#9f2089] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="update-now-btn"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Update Now (अभी अपडेट करें)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>

            {!updateInfo.isMandatory && (
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                id="update-later-btn"
              >
                Later / Dismiss (बाद में)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
