import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@workspace/api-client-react';
import { useAudio } from '@/hooks/use-audio';

const REMINDER_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

export function useWaterReminder() {
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();
  const ttsMutation = useTextToSpeech();
  const { playBlob } = useAudio();

  const triggerReminder = useCallback(async () => {
    toast({
      title: "💧 Time to hydrate!",
      description: "Take a sip of water to stay fresh and focused.",
      duration: 5000,
    });

    try {
      const audioBlob = await ttsMutation.mutateAsync({
        data: { text: "It's time to drink some water. Stay hydrated!" }
      });
      playBlob(audioBlob);
    } catch (e) {
      console.error("Failed to fetch/play water reminder audio", e);
    }
  }, [toast, ttsMutation, playBlob]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      // Set interval for every 20 mins
      interval = setInterval(triggerReminder, REMINDER_INTERVAL_MS);
      
      // Initial toast to confirm activation
      toast({
        title: "Water Reminders Active",
        description: "We'll remind you to hydrate every 20 minutes.",
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, triggerReminder, toast]);

  const toggle = () => setIsActive(prev => !prev);

  return { isActive, toggle };
}
