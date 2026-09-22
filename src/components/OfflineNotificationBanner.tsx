import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, ShieldCheck } from 'lucide-react';

export const OfflineNotificationBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-md bg-slate-900/95 border-b border-slate-800"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <p className="truncate">
                <strong className="text-amber-400 font-bold mr-1.5">Offline Mode:</strong>
                Browsing cached wardrobe & saved wishlist. Zero data interruption.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-bold shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Standalone Cache Active</span>
            </div>
          </motion.div>
        )}

        {showReconnected && !isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-600 text-white px-4 py-2.5 shadow-xl flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Connection restored! Syncing live luxury collections...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
