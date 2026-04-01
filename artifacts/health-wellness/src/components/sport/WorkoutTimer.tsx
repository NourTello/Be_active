import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Volume2, Loader2, Droplets } from 'lucide-react';
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

const WATER_INTERVAL_SECONDS = 600; // every 10 minutes

export function WorkoutTimer({ sport, onClose }: WorkoutTimerProps) {
  const defaultDurationSeconds = sport.duration * 60;
  const [timeLeft, setTimeLeft] = useState(defaultDurationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [showWaterAlert, setShowWaterAlert] = useState(false);
  const [waterCount, setWaterCount] = useState(0);

  const { playBlob } = useAudio();
  const playedMilestones = useRef(new Set<string>());

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

  // Countdown interval
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Milestone & water reminder announcements
  useEffect(() => {
    if (!isActive) return;

    const elapsed = defaultDurationSeconds - timeLeft;

    // Workout milestones
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

    // Water reminder every 10 minutes of elapsed exercise time
    if (elapsed > 0 && elapsed % WATER_INTERVAL_SECONDS === 0) {
      playAnnouncement('Time to drink some water! Stay hydrated during your workout.', `water-${elapsed}`);
      setShowWaterAlert(true);
      setWaterCount(c => c + 1);
      // Hide the alert banner after 8 seconds
      setTimeout(() => setShowWaterAlert(false), 8000);
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
    setShowWaterAlert(false);
    setWaterCount(0);
    playedMilestones.current.clear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const elapsed = defaultDurationSeconds - timeLeft;
  const progress = (elapsed / defaultDurationSeconds) * 100;
  const nextWaterIn = WATER_INTERVAL_SECONDS - (elapsed % WATER_INTERVAL_SECONDS);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Progress glow background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 ease-linear"
        style={{
          background: `conic-gradient(from 0deg, #10b981 ${progress}%, transparent ${progress}%)`,
        }}
      />

      {/* Water alert banner */}
      <AnimatePresence>
        {showWaterAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 inset-x-0 z-20 bg-blue-500 text-white px-6 py-3 flex items-center justify-center gap-3 rounded-t-3xl"
          >
            <Droplets className="w-5 h-5 animate-bounce" />
            <span className="font-semibold">Drink some water now! Stay hydrated 💧</span>
            <Droplets className="w-5 h-5 animate-bounce" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center p-8">
        {/* Top row */}
        <div className="flex items-center justify-between w-full mb-6" style={{ marginTop: showWaterAlert ? '2.5rem' : 0, transition: 'margin 0.3s' }}>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium backdrop-blur-md">
              {sport.intensity} Intensity
            </span>
            {isTTSLoading && <Loader2 className="w-4 h-4 text-green-400 animate-spin" />}
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors text-sm">
            ✕ Close
          </button>
        </div>

        <h3 className="text-3xl font-bold mb-1 text-center">{sport.sport}</h3>
        <p className="text-white/60 text-center max-w-sm mb-8 text-sm">{sport.description}</p>

        {/* Timer display */}
        <div className="text-8xl md:text-[10rem] font-bold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg mb-6">
          {formatTime(timeLeft)}
        </div>

        {/* Water reminder info row */}
        <div className="flex items-center gap-4 mb-8">
          {isActive && elapsed > 0 ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-sm text-blue-300">
              <Droplets className="w-4 h-4" />
              <span>
                {elapsed % WATER_INTERVAL_SECONDS === 0 && elapsed > 0
                  ? 'Drink water now!'
                  : `Next water break in ${formatTime(nextWaterIn)}`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-white/40">
              <Droplets className="w-4 h-4" />
              <span>Water reminders every 10 min</span>
            </div>
          )}
          {waterCount > 0 && (
            <div className="flex items-center gap-1 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded-full text-xs text-green-300">
              <Droplets className="w-3 h-3" />
              <span>×{waterCount} hydrated</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={resetTimer}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-95"
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
