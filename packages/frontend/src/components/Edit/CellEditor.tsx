// =============================================
// CellEditor – lightweight inline editor for quick edits
// =============================================
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CellEditorProps {
  /** Initial value */
  value: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the editor is visible */
  isOpen: boolean;
  /** Called when the value is committed */
  onSave: (value: string) => void;
  /** Called when the editor is closed */
  onClose: () => void;
  /** Maximum character count */
  maxLength?: number;
}

export default function CellEditor({
  value: initialValue,
  placeholder = 'Enter text...',
  isOpen,
  onSave,
  onClose,
  maxLength = 200,
}: CellEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync value when prop changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to let the animation start
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }

  function handleSave() {
    const trimmed = value.trim();
    if (trimmed !== initialValue.trim()) {
      onSave(trimmed);
    }
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-20 flex flex-col
                     bg-jeopardy-deep/95 backdrop-blur-md
                     rounded-lg border border-neon-blue/30 p-2"
        >
          <div className="flex items-start justify-between gap-1 mb-1">
            <span className="text-[9px] text-white/30 uppercase tracking-wider">
              Edit
            </span>
            <button
              onClick={onClose}
              className="p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3 text-white/40" />
            </button>
          </div>

          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            className="flex-1 bg-transparent text-white text-xs
                       placeholder-white/20 resize-none
                       focus:outline-none"
          />

          <div className="flex items-center justify-between mt-1">
            <span className="text-[8px] text-white/20">
              {value.length}/{maxLength}
            </span>
            <span className="text-[8px] text-white/20">
              Enter = save
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
