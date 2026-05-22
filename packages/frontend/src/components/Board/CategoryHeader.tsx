// =============================================
// CategoryHeader – column header cell on the board
// =============================================
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Category, GameMode } from '../../types';

interface CategoryHeaderProps {
  category: Category;
  mode: GameMode;
  onUpdate: (name: string) => void;
}

export default function CategoryHeader({
  category,
  mode,
  onUpdate,
}: CategoryHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when category updates from socket
  useEffect(() => {
    setEditValue(category.name);
  }, [category.name]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleClick() {
    if (mode === 'edit') {
      setIsEditing(true);
    }
  }

  function handleBlur() {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== category.name) {
      onUpdate(trimmed);
    } else {
      setEditValue(category.name);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setEditValue(category.name);
      setIsEditing(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: category.position * 0.05 }}
      onClick={handleClick}
      className={`
        board-cell group relative flex items-center justify-center
        rounded-lg overflow-hidden
        ${mode === 'edit' ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{
        background: `linear-gradient(135deg, ${category.color}dd, ${category.color}88)`,
        minHeight: '60px',
        aspectRatio: 'auto',
      }}
    >
      {/* Shine overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${category.color}, transparent)`,
        }}
      />

      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 bg-black/40 border border-white/20
                     rounded text-center text-white text-xs sm:text-sm font-bold
                     uppercase focus:outline-none focus:border-neon-blue/50
                     z-10"
          maxLength={30}
        />
      ) : (
        <span
          className="relative z-10 px-2 text-[10px] sm:text-xs md:text-sm
                     font-extrabold uppercase tracking-wider text-white
                     text-center leading-tight line-clamp-2"
          title={category.name}
        >
          {category.name}
        </span>
      )}

      {/* Edit hint */}
      {mode === 'edit' && !isEditing && (
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100
                        transition-opacity">
          <span className="text-[8px] text-white/40">✏️</span>
        </div>
      )}
    </motion.div>
  );
}
