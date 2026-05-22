// =============================================
// Header – top navigation bar for game pages
// =============================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Copy,
  Check,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ModeToggle from './ModeToggle';
import type { GameMode } from '../../types';

interface HeaderProps {
  title: string;
  shareCode: string;
  mode: GameMode;
  gameId: string;
  isConnected: boolean;
  onlineCount: number;
  onModeChange: (mode: GameMode) => void;
  onTitleChange?: (title: string) => void;
}

export default function Header({
  title,
  shareCode,
  mode,
  gameId,
  isConnected,
  onlineCount,
  onModeChange,
  onTitleChange,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(shareCode);
      setIsCopied(true);
      toast.success('Kod kopyalandı!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Kopyalanamadı');
    }
  }

  function handleTitleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== title && onTitleChange) {
      onTitleChange(trimmed);
    } else {
      setEditTitle(title);
    }
    setIsEditingTitle(false);
  }

  function handleModeSwitch(newMode: GameMode) {
    onModeChange(newMode);
    if (newMode === 'play') {
      navigate(`/game/${gameId}/play`);
    } else {
      navigate(`/game/${gameId}/edit`);
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass sticky top-0 z-30 px-3 sm:px-5 py-2.5"
    >
      <div className="flex items-center justify-between gap-2 max-w-[1600px] mx-auto">
        {/* Left: Home + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10
                       transition-colors flex-shrink-0"
            title="Ana Sayfa"
          >
            <Home className="w-4 h-4 text-white/60" />
          </button>

          {/* Title */}
          {isEditingTitle && onTitleChange ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setEditTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              className="bg-transparent border-b border-neon-blue/30
                         text-white font-bold text-sm sm:text-base
                         focus:outline-none min-w-0 max-w-[200px]"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => onTitleChange && setIsEditingTitle(true)}
              className={`text-sm sm:text-base font-bold text-white truncate
                ${onTitleChange ? 'cursor-pointer hover:text-gold-300 transition-colors' : ''}
              `}
              title={title}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Center: Share code */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       bg-white/5 hover:bg-white/10 border border-white/10
                       transition-all group"
          >
            <span className="text-[10px] text-white/30 uppercase tracking-wider">
              Kod:
            </span>
            <span className="text-sm font-mono font-bold text-gold-400 tracking-widest">
              {shareCode}
            </span>
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-neon-green" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60
                              transition-colors" />
            )}
          </button>
        </div>

        {/* Right: Status + Mode toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-neon-green" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-neon-red" />
            )}
            {onlineCount > 0 && (
              <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                <Users className="w-3 h-3" />
                {onlineCount}
              </span>
            )}
          </div>

          {/* Mobile share code */}
          <button
            onClick={handleCopyCode}
            className="sm:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10
                       transition-colors"
            title={`Kod: ${shareCode}`}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-neon-green" />
            ) : (
              <Copy className="w-4 h-4 text-white/40" />
            )}
          </button>

          {/* Mode toggle */}
          <ModeToggle mode={mode} onModeChange={handleModeSwitch} />
        </div>
      </div>
    </motion.header>
  );
}
