import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SportRecommendation } from '@workspace/api-client-react';
import { useAudio } from '@/hooks/use-audio';

interface WorkoutTimerProps {
  sport: SportRecommendation;
  onClose: () => void;
}

async function fetchTtsBlob(text: string): Promise<Blob> {
  const res = await fetch('/api/wellness/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('TTS failed');
  return res.blob();
}

export function WorkoutTimer({ sport, onClose }: WorkoutTimerProps) {
  const defaultDurationSeconds = sport.duration * 60;
  const [timeLeft, setTimeLeft] = useState(defaultDurationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);

  const { playBlob } = useAudio();
  const playedMilestones = useRef(new Set<string>());
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const playAnnouncement = useCallback(async (text: string, milestoneKey: string) => {
    if (playedMilestones.current.has(milestoneKey)) return;
    playedMilestones.current.add(milestoneKey);
    try {
      setIsTTSLoading(true);
      const blob = await fetchTtsBlob(text);
      playBlob(blob);
    } catch (e) {
      console.error('Failed to play TTS', e);
    } finally {
      setIsTTSLoading(false);
    }
  }, [playBlob]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft === defaultDurationSeconds - 1) {
      playAnnouncement(`Your ${sport.sport} workout begins now! Let's go!`, 'start');
    } else if (timeLeft === Math.floor(defaultDurationSeconds / 2)) {
      playAnnouncement('Halfway there! Keep up the great work!', 'halfway');
    } else if (timeLeft === 60 && defaultDurationSeconds > 60) {
      playAnnouncement('One minute remaining! Give it your all!', '1min');
    } else if (timeLeft === 0) {
      playAnnouncement(`Great job! Your ${sport.sport} workout is complete!`, 'end');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#f97316'] });
      setIsActive(false);
    }
  }, [timeLeft, isActive, defaultDurationSeconds, sport.sport, playAnnouncement]);

  const toggleTimer = () => {
    const starting = !isActive;
    setIsActive(starting);
    if (starting && timeLeft === defaultDurationSeconds) {
      playAnnouncement(`Your ${sport.sport} workout begins now! Let's go!`, 'start');
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(defaultDurationSeconds);
    playedMilestones.current.clear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((defaultDurationSeconds - timeLeft) / defaultDurationSeconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 ease-linear"
        style={{
          background: `conic-gradient(from 0deg, hsl(var(--primary)) ${progress}%, transparent ${progress}%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium backdrop-blur-md">
              {sport.intensity} Intensity
            </span>
            {isTTSLoading && <Loader2 className="w-4 h-4 text-green-400 animate-spin" />}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            Close
          </button>
        </div>

        <h3 className="text-3xl font-bold mb-2 text-center">{sport.sport}</h3>
        <p className="text-white/60 text-center max-w-sm mb-12">{sport.description}</p>

        <div className="text-8xl md:text-[10rem] font-bold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg mb-12">
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={resetTimer}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
            aria-label="Reset"
          >
            <Square className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={toggleTimer}
            className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/40 hover:shadow-green-500/60 transition-all active:scale-95 hover:-translate-y-1"
          >
            {isActive ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-2" />
            )}
          </button>

          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/5 text-white/40">
            <Volume2 className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
