import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/hooks/use-audio';
import { useUserProfile } from '@/context/UserProfileContext';

const REMINDER_INTERVAL_MS = 60 * 60 * 1000; // every 1 hour

async function fetchTtsBlob(text: string): Promise<Blob> {
  const res = await fetch('/api/wellness/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('TTS failed');
  return res.blob();
}

export function useWaterReminder() {
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();
  const { playBlob } = useAudio();
  const { profile } = useUserProfile();
  const isActiveRef = useRef(isActive);
  const isTrainingRef = useRef(profile.isTraining);
  isActiveRef.current = isActive;
  isTrainingRef.current = profile.isTraining;

  useEffect(() => {
    if (!isActive) return;

    toast({
      title: '💧 Water Reminders Active',
      description: "We'll remind you to hydrate every hour (paused during workouts).",
    });

    const interval = setInterval(async () => {
      // Skip reminder if user is currently training
      if (isTrainingRef.current) return;

      toast({
        title: '💧 Time to hydrate!',
        description: 'Take a sip of water to stay fresh and focused.',
        duration: 5000,
      });
      try {
        const blob = await fetchTtsBlob("It's time to drink some water. Stay hydrated!");
        playBlob(blob);
      } catch (e) {
        console.error('Water reminder TTS failed', e);
      }
    }, REMINDER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isActive]); // intentionally omit toast/playBlob — they are stable refs

  const toggle = () => setIsActive(prev => !prev);

  return { isActive, toggle };
}
