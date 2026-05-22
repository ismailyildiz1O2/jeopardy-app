// =============================================
// Timer – circular countdown timer for play mode
// =============================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  /** Default duration in seconds */
  duration?: number;
  /** Called when timer reaches zero */
  onTimeUp?: () => void;
}

export default function Timer({
  duration = 30,
  onTimeUp,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep callback ref fresh
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUpRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStart = useCallback(() => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
    }
    setIsRunning(true);
  }, [timeLeft, duration]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  // Calculate circular progress
  const progress = timeLeft / duration;
  const circumference = 2 * Math.PI * 44; // radius = 44
  const strokeDashoffset = circumference * (1 - progress);

  // Urgency state (< 5 seconds)
  const isUrgent = timeLeft <= 5 && timeLeft > 0 && isRunning;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circular timer */}
      <motion.div
        animate={isUrgent ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={
          isUrgent
            ? { repeat: Infinity, duration: 0.5, ease: 'easeInOut' }
            : {}
        }
        className="relative w-28 h-28 sm:w-32 sm:h-32"
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={
              isUrgent
                ? '#ef4444'
                : timeLeft <= 10
                ? '#f59e0b'
                : '#3b3bff'
            }
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: isUrgent
                ? 'drop-shadow(0 0 8px rgba(239,68,68,0.6))'
                : 'drop-shadow(0 0 4px rgba(59,59,255,0.3))',
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-3xl sm:text-4xl font-extrabold tabular-nums
              ${isUrgent ? 'text-neon-red' : 'text-white'}
              transition-colors duration-300`}
          >
            {timeLeft}
          </span>
          <span className="text-[9px] text-white/30 uppercase tracking-wider">
            saniye
          </span>
        </div>

        {/* Urgency glow ring */}
        {isUrgent && (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: '0 0 20px rgba(239,68,68,0.4), inset 0 0 20px rgba(239,68,68,0.1)',
            }}
          />
        )}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="p-2.5 rounded-full bg-neon-green/10 hover:bg-neon-green/20
                       text-neon-green transition-all hover:scale-105 active:scale-95"
            title="Başlat"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-2.5 rounded-full bg-gold-500/10 hover:bg-gold-500/20
                       text-gold-400 transition-all hover:scale-105 active:scale-95"
            title="Duraklat"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleReset}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10
                     text-white/50 transition-all hover:scale-105 active:scale-95"
          title="Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Time up indicator */}
      {timeLeft === 0 && !isRunning && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs font-bold text-neon-red uppercase tracking-wider"
        >
          ⏰ Süre Doldu!
        </motion.p>
      )}
    </div>
  );
}
