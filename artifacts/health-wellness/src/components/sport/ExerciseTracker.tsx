import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, ChevronRight, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { HomeExercise } from '@workspace/api-client-react';
import { useLanguage } from '@/context/LanguageContext';

interface ExerciseTrackerProps {
  exercises: HomeExercise[];
  startIndex?: number;
  onClose: () => void;
}

function parseSeconds(reps: string): number | null {
  const m = reps.match(/(\d+)(?:-\d+)?\s*(second|sec|minute|min)/i);
  if (!m) return null;
  const n = parseInt(m[1]);
  return m[2].toLowerCase().startsWith('min') ? n * 60 : n;
}

const REST_DUR = 15;

type Phase = 'active' | 'resting' | 'exdone' | 'alldone';

export function ExerciseTracker({ exercises, startIndex = 0, onClose }: ExerciseTrackerProps) {
  const { lang, t } = useLanguage();

  const [exIdx, setExIdx] = useState(startIndex);
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [phase, setPhase] = useState<Phase>('active');
  const [restLeft, setRestLeft] = useState(REST_DUR);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);

  const voiceRef = useRef(voiceOn);
  voiceRef.current = voiceOn;
  const langRef = useRef(lang);
  langRef.current = lang;

  const ex = exercises[exIdx];
  const totalSets = ex.sets;
  const timeSec = parseSeconds(ex.reps);
  const isTimeBased = timeSec !== null;

  function speak(text: string) {
    if (!voiceRef.current) return;
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langRef.current === 'ar' ? 'ar-SA' : 'en-US';
      u.rate = 0.9;
      window.speechSynthesis?.speak(u);
    } catch {}
  }

  function announcePhase(p: Phase, sc: number, name: string) {
    if (p === 'active') {
      const setNum = sc + 1;
      lang === 'ar'
        ? speak(`المجموعة ${setNum} من ${totalSets}. ${name}`)
        : speak(`Set ${setNum} of ${totalSets}. ${name}`);
    } else if (p === 'resting') {
      speak(lang === 'ar' ? 'مجموعة مكتملة. استرح.' : 'Set complete. Rest.');
    } else if (p === 'exdone') {
      speak(lang === 'ar' ? 'اكتمل التمرين!' : 'Exercise complete!');
    } else if (p === 'alldone') {
      speak(lang === 'ar' ? 'أحسنت! أكملت جميع التمارين!' : 'Amazing! You completed all exercises!');
    }
  }

  function transitionPhase(newPhase: Phase, sc: number) {
    setPhase(newPhase);
    announcePhase(newPhase, sc, ex.name);
    if (newPhase === 'active') {
      if (isTimeBased && timeSec) setTimerLeft(timeSec);
    }
    if (newPhase === 'resting') {
      setRestLeft(REST_DUR);
    }
  }

  function handleSetComplete() {
    const next = setsCompleted + 1;
    setSetsCompleted(next);
    if (next >= totalSets) {
      transitionPhase('exdone', next);
    } else {
      transitionPhase('resting', next);
    }
  }

  function beginNextSet() {
    const nextSetNum = setsCompleted + 2;
    lang === 'ar' ? speak(`ابدأ المجموعة ${nextSetNum}`) : speak(`Begin set ${nextSetNum}`);
    setPhase('active');
    if (isTimeBased && timeSec) setTimerLeft(timeSec);
  }

  function handleNextExercise() {
    if (exIdx + 1 >= exercises.length) {
      setPhase('alldone');
      announcePhase('alldone', 0, '');
    } else {
      const nextIdx = exIdx + 1;
      const nextEx = exercises[nextIdx];
      setExIdx(nextIdx);
      setSetsCompleted(0);
      setTimerLeft(null);
      setPhase('active');
      announcePhase('active', 0, nextEx.name);
      if (parseSeconds(nextEx.reps) !== null) setTimerLeft(parseSeconds(nextEx.reps));
    }
  }

  useEffect(() => {
    announcePhase('active', 0, ex.name);
    if (isTimeBased && timeSec) setTimerLeft(timeSec);
  }, []);

  useEffect(() => {
    if (phase !== 'active' || !isTimeBased || timerLeft === null || timerLeft <= 0) return;
    if (timerLeft <= 5 && timerLeft > 0) speak(String(timerLeft));
    const id = setTimeout(() => {
      setTimerLeft(prev => {
        const next = (prev ?? 1) - 1;
        if (next <= 0) {
          setTimeout(() => handleSetComplete(), 0);
        }
        return next;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [timerLeft, phase]);

  useEffect(() => {
    if (phase !== 'resting' || restLeft <= 0) return;
    if (restLeft === 0) { beginNextSet(); return; }
    const id = setTimeout(() => {
      setRestLeft(prev => {
        if (prev <= 1) { setTimeout(() => beginNextSet(), 0); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [restLeft, phase]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isRTL = lang === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 60, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className={`relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-accent/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-accent uppercase tracking-widest">
              {lang === 'ar' ? `تمرين ${exIdx + 1} / ${exercises.length}` : `Exercise ${exIdx + 1} / ${exercises.length}`}
            </p>
            <h3 className="text-lg font-bold text-foreground mt-0.5 truncate">{ex.name}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setVoiceOn(v => { if (v) window.speechSynthesis?.cancel(); return !v; }); }}
              className="w-9 h-9 rounded-full bg-background/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={voiceOn ? 'Mute voice' : 'Unmute voice'}
            >
              {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-background/60 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Set progress bar */}
          {phase !== 'alldone' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">
                  {lang === 'ar'
                    ? `المجموعة ${Math.min(setsCompleted + 1, totalSets)} من ${totalSets}`
                    : `Set ${Math.min(setsCompleted + 1, totalSets)} of ${totalSets}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {setsCompleted}/{totalSets} {lang === 'ar' ? 'مكتملة' : 'done'}
                </p>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: totalSets }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 rounded-full flex-1 transition-all duration-500 ${
                      i < setsCompleted
                        ? 'bg-accent'
                        : phase === 'active' && i === setsCompleted
                        ? 'bg-accent/40'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Target muscles */}
          {ex.targetMuscles.length > 0 && phase !== 'alldone' && (
            <div className="flex flex-wrap gap-1.5">
              {ex.targetMuscles.map((m, i) => (
                <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">{m}</span>
              ))}
            </div>
          )}

          {/* ── ACTIVE: TIME-BASED ── */}
          {phase === 'active' && isTimeBased && timerLeft !== null && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground text-center leading-relaxed">{ex.description}</p>
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="9" className="text-muted" />
                  <circle
                    cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - timerLeft / (timeSec ?? 1))}
                    className="text-accent transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display font-bold text-foreground tabular-nums">{formatTime(timerLeft)}</span>
                  <span className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'ثانية' : 'remaining'}</span>
                </div>
              </div>
              <button
                onClick={handleSetComplete}
                className="w-full py-4 bg-accent text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-accent/30"
              >
                <CheckCircle2 className="w-5 h-5" />
                {lang === 'ar' ? 'أكمل المجموعة' : 'Complete Set'}
              </button>
            </div>
          )}

          {/* ── ACTIVE: REP-BASED ── */}
          {phase === 'active' && !isTimeBased && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{ex.description}</p>
              <div className="bg-accent/10 rounded-2xl px-5 py-5 text-center">
                <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">{t.reps}</p>
                <p className="text-4xl font-display font-bold text-foreground">{ex.reps}</p>
              </div>
              <button
                onClick={handleSetComplete}
                className="w-full py-4 bg-accent text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-accent/30"
              >
                <CheckCircle2 className="w-5 h-5" />
                {lang === 'ar' ? 'أكمل المجموعة' : 'Complete Set'}
              </button>
            </div>
          )}

          {/* ── RESTING ── */}
          {phase === 'resting' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <p className="text-lg font-semibold text-muted-foreground">
                {lang === 'ar' ? '💤 استراحة...' : '💤 Resting...'}
              </p>
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle
                    cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (restLeft / REST_DUR)}
                    className="text-green-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display font-bold text-foreground tabular-nums">{restLeft}</span>
                  <span className="text-xs text-muted-foreground">s</span>
                </div>
              </div>
              <button
                onClick={beginNextSet}
                className="w-full py-3.5 bg-muted text-foreground font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-muted/70 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                {lang === 'ar' ? 'تخطي الراحة' : 'Skip Rest'}
              </button>
            </div>
          )}

          {/* ── EXERCISE DONE ── */}
          {phase === 'exdone' && (
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl animate-bounce">🎉</div>
              <p className="text-xl font-bold text-foreground">{lang === 'ar' ? 'اكتمل التمرين!' : 'Exercise Complete!'}</p>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? `أتممت ${setsCompleted} مجموعات` : `${setsCompleted} sets completed`}
              </p>
              {exIdx + 1 < exercises.length ? (
                <button
                  onClick={handleNextExercise}
                  className="w-full py-4 bg-accent text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-accent/30"
                >
                  {lang === 'ar' ? 'التمرين التالي' : 'Next Exercise'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleNextExercise}
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-500/30"
                >
                  {lang === 'ar' ? 'إنهاء جميع التمارين 🏆' : 'Finish All Exercises 🏆'}
                </button>
              )}
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                {lang === 'ar' ? 'خروج' : 'Exit'}
              </button>
            </div>
          )}

          {/* ── ALL DONE ── */}
          {phase === 'alldone' && (
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center text-5xl">🏆</div>
              <p className="text-2xl font-bold text-foreground">{lang === 'ar' ? 'أحسنت!' : 'Amazing!'}</p>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar'
                  ? `أكملت ${exercises.length} تمارين منزلية بنجاح!`
                  : `You completed all ${exercises.length} home exercises!`}
              </p>
              <button
                onClick={onClose}
                className="w-full py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-accent/30"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
