// =============================================
// ModeToggle – animated edit/play mode switch
// =============================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Play, AlertTriangle } from 'lucide-react';
import type { GameMode } from '../../types';

interface ModeToggleProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);

  function handleToggle() {
    const newMode = mode === 'edit' ? 'play' : 'edit';

    // Show confirmation when switching to play mode
    if (newMode === 'play') {
      setPendingMode(newMode);
      setShowConfirm(true);
    } else {
      onModeChange(newMode);
    }
  }

  function handleConfirm() {
    if (pendingMode) {
      onModeChange(pendingMode);
    }
    setShowConfirm(false);
    setPendingMode(null);
  }

  function handleCancel() {
    setShowConfirm(false);
    setPendingMode(null);
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                   border transition-all duration-300
                   hover:scale-105 active:scale-95"
        style={{
          background:
            mode === 'edit'
              ? 'rgba(59, 59, 255, 0.15)'
              : 'rgba(34, 197, 94, 0.15)',
          borderColor:
            mode === 'edit'
              ? 'rgba(59, 59, 255, 0.3)'
              : 'rgba(34, 197, 94, 0.3)',
        }}
      >
        <motion.div
          key={mode}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {mode === 'edit' ? (
            <Pencil className="w-3.5 h-3.5 text-neon-blue" />
          ) : (
            <Play className="w-3.5 h-3.5 text-neon-green" />
          )}
        </motion.div>
        <span
          className={`text-xs font-semibold uppercase tracking-wider
            ${mode === 'edit' ? 'text-neon-blue' : 'text-neon-green'}
          `}
        >
          {mode === 'edit' ? 'Düzenle' : 'Oynat'}
        </span>
      </button>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         z-50 w-[90%] max-w-sm glass-modal p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-gold-500/10">
                  <AlertTriangle className="w-5 h-5 text-gold-400" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Oyun Moduna Geç
                </h3>
              </div>

              <p className="text-sm text-white/60 mb-6">
                Oyun moduna geçmek istediğinize emin misiniz?
                Sorular kilitlenecek ve takımlarla oynayabileceksiniz.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="btn-ghost flex-1"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirm}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Başlat
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
