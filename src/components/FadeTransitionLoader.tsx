import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FadeTransitionLoaderProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
}

export const FadeTransitionLoader: React.FC<FadeTransitionLoaderProps> = ({
  isLoading,
  message = 'Đang tải dữ liệu gia phả...',
  subMessage = 'Ẩm Thủy Tư Nguyên • Vạn Đại Trường Tồn',
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          id="fade-transition-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950/90 backdrop-blur-md select-none"
        >
          {/* Decorative radial aura */}
          <div className="absolute w-96 h-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

          {/* Central Medallion */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative flex flex-col items-center z-10"
          >
            {/* Rotating outer Dong Son ring */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
              {/* Outer dashed spinning ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/60 animate-spin [animation-duration:12s]" />

              {/* Middle glowing ring */}
              <div className="absolute inset-2 rounded-full border border-amber-600/40 animate-pulse [animation-duration:3s]" />

              {/* Inner core medallion */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-2xl shadow-amber-950/80 ring-2 ring-amber-400/50 flex items-center justify-center transform rotate-45 transition-transform">
                <div className="w-full h-full rounded-2xl bg-stone-950/85 flex items-center justify-center transform -rotate-45">
                  <span className="font-serif font-bold text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                    范
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Traditional Text */}
            <div className="text-center space-y-2 max-w-sm px-4">
              <p className="text-[11px] font-bold tracking-[0.25em] text-amber-500 uppercase">
                GIA TỘC HỌ PHẠM ĐẠI TÔN
              </p>
              <h3 className="text-base sm:text-lg font-semibold text-stone-100 tracking-wide">
                {message}
              </h3>
              <p className="text-xs text-amber-300/80 font-serif italic tracking-wider">
                {subMessage}
              </p>

              {/* Sleek progress line indicator */}
              <div className="w-48 h-1 bg-stone-800 rounded-full mx-auto mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full animate-[pulse_1.5s_infinite] w-full" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
