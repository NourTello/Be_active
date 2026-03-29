import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTextToSpeech, SportRecommendation } from '@workspace/api-client-react';
import { useAudio } from '@/hooks/use-audio';

interface WorkoutTimerProps {
  sport: SportRecommendation;
  onClose: () => void;
}

export function WorkoutTimer({ sport, onClose }: WorkoutTimerProps) {
  const defaultDurationSeconds = sport.duration * 60;
  const [timeLeft, setTimeLeft] = useState(defaultDurationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  
  const { playBlob } = useAudio();
  const ttsMutation = useTextToSpeech();
  
  // Keep track of milestones played to avoid repeating
  const playedMilestones = useRef(new Set<string>());

  const playAnnouncement = async (text: string, milestoneKey: string) => {
    if (playedMilestones.current.has(milestoneKey)) return;
    
    try {
      setIsTTSLoading(true);
      const audioBlob = await ttsMutation.mutateAsync({ data: { text } });
      playBlob(audioBlob);
      playedMilestones.current.add(milestoneKey);
    } catch (e) {
      console.error("Failed to play TTS", e);
    } finally {
      setIsTTSLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Check milestones
          if (newTime === defaultDurationSeconds - 1) {
            playAnnouncement(`Your ${sport.sport} workout begins now! Let's go!`, 'start');
          } else if (newTime === Math.floor(defaultDurationSeconds / 2)) {
            playAnnouncement("Halfway there! Keep up the great work!", 'halfway');
          } else if (newTime === 60) {
            playAnnouncement("One minute remaining! Give it your all!", '1min');
          } else if (newTime === 0) {
            playAnnouncement(`Great job! Your ${sport.sport} workout is complete!`, 'end');
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#3b82f6', '#f97316']
            });
            setIsActive(false);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, defaultDurationSeconds, sport.sport]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    // If starting for the very first time, trigger the first audio immediately if we haven't
    if (!isActive && timeLeft === defaultDurationSeconds && !playedMilestones.current.has('start')) {
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
      {/* Background Progress Circle */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 ease-linear"
        style={{
          background: `conic-gradient(from 0deg, hsl(var(--primary)) ${progress}%, transparent ${progress}%)`
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium backdrop-blur-md">
              {sport.intensity} Intensity
            </span>
            {isTTSLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <h3 className="text-3xl font-display font-bold mb-2 text-center">{sport.sport}</h3>
        <p className="text-white/60 text-center max-w-sm mb-12">{sport.description}</p>

        <div className="text-8xl md:text-[10rem] font-display font-bold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg mb-12">
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
            className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-all active:scale-95 hover:-translate-y-1"
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
