import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Shirt } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2.2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="welcome-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#120210] via-[#2a0624] to-[#0d010c] text-white selection:bg-rose-500/30 overflow-hidden"
        >
          {/* Ambient Glowing Background Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-gradient-to-tr from-pink-600/20 via-purple-600/20 to-amber-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute top-1/4 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -left-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Subtle Sparkles Background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <Sparkles className="absolute top-16 left-12 w-5 h-5 text-amber-300/60 animate-bounce" style={{ animationDuration: '3s' }} />
            <Sparkles className="absolute bottom-20 right-16 w-6 h-6 text-pink-300/60 animate-bounce" style={{ animationDuration: '2.5s' }} />
            <Sparkles className="absolute top-1/3 right-12 w-4 h-4 text-purple-300/60 animate-bounce" style={{ animationDuration: '4s' }} />
          </div>

          {/* Main Welcome Card Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
            
            {/* Animated Royal Icon Badge */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-3xl blur-md opacity-70 animate-pulse" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#1a0418] border border-amber-400/40 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(217,119,6,0.3)]">
                <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.8)]" />
                <motion.div 
                  initial={{ opacity: 0, rotate: -20 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-xl border border-white/20 shadow-lg"
                >
                  <Shirt className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80 mb-2 block">
                Luxury Wardrobe & Rentals
              </span>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                <span className="text-white">Welcome to </span>
                <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                  BGK Wear
                </span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm sm:text-base text-rose-100/70 max-w-xs font-light tracking-wide mb-8"
            >
              Exclusive Ethnic Fashion & Designer Outfit Rentals
            </motion.p>

            {/* Glowing Progress Loader Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-44 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 rounded-full shadow-[0_0_10px_rgba(251,113,133,0.8)]"
              />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
