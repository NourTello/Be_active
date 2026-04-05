import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BmiForm } from './BmiForm';
import { WorkoutTimer } from './WorkoutTimer';
import { ExerciseTracker } from './ExerciseTracker';
import { useGetSportRecommendation, SportRecommendationResponse, SportRecommendation } from '@workspace/api-client-react';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Flame, Timer, Target, TrendingDown, TrendingUp, Minus, Home, Dumbbell } from 'lucide-react';
import { useUserProfile, calcTargetWeight } from '@/context/UserProfileContext';
import { useLanguage } from '@/context/LanguageContext';

export function SportSection() {
  const [recommendation, setRecommendation] = useState<SportRecommendationResponse | null>(null);
  const [activeSport, setActiveSport] = useState<SportRecommendation | null>(null);
  const [submittedWeight, setSubmittedWeight] = useState<number | null>(null);
  const [submittedHeight, setSubmittedHeight] = useState<number | null>(null);
  const [trackerIndex, setTrackerIndex] = useState<number | null>(null);

  const { updateProfile } = useUserProfile();
  const { t, lang } = useLanguage();
  const sportMutation = useGetSportRecommendation();

  const handleFormSubmit = async (data: any) => {
    try {
      setSubmittedWeight(data.weight);
      setSubmittedHeight(data.height);
      const result = await sportMutation.mutateAsync({ data: { ...data, language: lang } });
      setRecommendation(result);

      // Calculate and store the target weight in shared context
      const tw = calcTargetWeight(data.height);
      const bmi = data.weight / Math.pow(data.height / 100, 2);
      // If already normal, target = current; otherwise aim for ideal (BMI 22)
      const targetWeight = bmi >= 18.5 && bmi <= 24.9 ? data.weight : tw.ideal;
      updateProfile({ targetWeight });
    } catch (e) {
      console.error('Failed to get recommendation', e);
    }
  };

  const getBmiColor = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('normal')) return 'text-primary bg-primary/10 border-primary/20';
    if (lower.includes('overweight')) return 'text-accent bg-accent/10 border-accent/20';
    if (lower.includes('obese') || lower.includes('underweight')) return 'text-destructive bg-destructive/10 border-destructive/20';
    return 'text-secondary bg-secondary/10 border-secondary/20';
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-display font-bold text-foreground mb-4">{t.discoverActivity}</h2>
        <p className="text-lg text-muted-foreground">{t.discoverSubtitle}</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Form Column */}
        <div className="w-full">
          <BmiForm onSubmit={handleFormSubmit} isLoading={sportMutation.isPending} />
        </div>

        {/* Results Column */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {recommendation && !activeSport && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* BMI Card */}
                <div className="bg-card rounded-3xl p-6 shadow-xl shadow-black/5 border border-border flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-8 border-primary/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />
                    <div className="text-center">
                      <span className="block text-3xl font-display font-bold text-foreground">{recommendation.bmi.toFixed(1)}</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">BMI</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold mb-2">{t.yourBmi}</h3>
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${getBmiColor(recommendation.bmiCategory)}`}>
                      {recommendation.bmiCategory}
                    </div>
                  </div>
                </div>

                {/* Target Weight Card */}
                {submittedHeight && submittedWeight && (() => {
                  const tw = calcTargetWeight(submittedHeight);
                  const bmi = recommendation.bmi;
                  const isNormal = bmi >= 18.5 && bmi <= 24.9;
                  const isUnderweight = bmi < 18.5;
                  const diff = isNormal ? 0 : Math.round((tw.ideal - submittedWeight) * 10) / 10;
                  const TrendIcon = isNormal ? Minus : isUnderweight ? TrendingUp : TrendingDown;
                  const trendColor = isNormal ? 'text-primary' : isUnderweight ? 'text-blue-500' : 'text-orange-500';
                  const bgColor = isNormal ? 'bg-primary/5 border-primary/20' : isUnderweight ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200';
                  return (
                    <div className={`rounded-2xl p-5 border ${bgColor}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className={`w-5 h-5 ${trendColor}`} />
                        <h4 className={`font-bold ${trendColor}`}>{t.targetWeight}</h4>
                      </div>
                      <div className="flex flex-wrap items-end gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.ideal}</p>
                          <p className="text-3xl font-bold text-foreground">{tw.ideal} <span className="text-base font-normal text-muted-foreground">kg</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.healthyRange}</p>
                          <p className="text-lg font-semibold text-foreground">{tw.min} – {tw.max} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                        </div>
                        {!isNormal && (
                          <div className="ml-auto text-right">
                            <p className="text-xs text-muted-foreground mb-1">{t.toReachIdeal}</p>
                            <p className={`text-xl font-bold flex items-center gap-1 ${trendColor}`}>
                              <TrendIcon className="w-5 h-5" />
                              {Math.abs(diff)} kg {diff < 0 ? t.toLose : t.toGain}
                            </p>
                          </div>
                        )}
                        {isNormal && (
                          <div className="ml-auto text-right">
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="text-base font-bold text-primary flex items-center gap-1"><Minus className="w-4 h-4" /> {t.alreadyAtGoal}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {isNormal
                          ? t.alreadyNormal
                          : isUnderweight
                          ? t.needGain.replace('{n}', String(Math.abs(diff)))
                          : t.needLose.replace('{n}', String(Math.abs(diff)))}
                      </p>
                    </div>
                  );
                })()}

                {/* Cautions */}
                {recommendation.cautions.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
                    <h4 className="flex items-center gap-2 font-bold text-destructive mb-3">
                      <AlertTriangle className="w-5 h-5" /> {t.medicalConsiderations}
                    </h4>
                    <ul className="space-y-2">
                      {recommendation.cautions.map((caution, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-destructive/80">
                          <span className="mt-1">•</span> {caution}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <h3 className="text-2xl font-display font-bold pt-4">{t.recommendedActivities}</h3>
                <div className="space-y-4">
                  {recommendation.recommendations.map((rec, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx}
                      className="group bg-card rounded-2xl p-6 shadow-md shadow-black/5 border border-border hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => setActiveSport(rec)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{rec.sport}</h4>
                          <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {rec.duration} min</span>
                            <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {rec.intensity}</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {rec.benefits.map((benefit, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" /> {benefit}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Home Exercises */}
                {recommendation.homeExercises && recommendation.homeExercises.length > 0 && (
                  <div className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2.5 bg-accent/10 rounded-2xl text-accent">
                        <Home className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-foreground">{t.homeExercisesTitle}</h3>
                        <p className="text-sm text-muted-foreground">{t.homeExercisesSub}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendation.homeExercises.map((ex, idx) => {
                        const diffColor =
                          ex.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : ex.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-red-100 text-red-700 border-red-200';
                        const diffLabel =
                          ex.difficulty === 'beginner'
                            ? t.difficultyBeginner
                            : ex.difficulty === 'intermediate'
                            ? t.difficultyIntermediate
                            : t.difficultyAdvanced;
                        const diffEmoji =
                          ex.difficulty === 'beginner' ? '🟢' : ex.difficulty === 'intermediate' ? '🟡' : '🔴';

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Dumbbell className="w-4 h-4 text-accent shrink-0" />
                                  <h4 className="font-bold text-foreground">{ex.name}</h4>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${diffColor}`}>
                                  {diffEmoji} {diffLabel}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{ex.description}</p>

                            <div className="flex gap-3 mb-3">
                              <div className="flex-1 text-center bg-muted/50 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{t.sets}</p>
                                <p className="font-display font-bold text-lg text-foreground">{ex.sets}</p>
                              </div>
                              <div className="flex-1 text-center bg-muted/50 rounded-xl px-3 py-2.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{t.reps}</p>
                                <p className="font-display font-bold text-lg text-foreground">{ex.reps}</p>
                              </div>
                            </div>

                            {ex.targetMuscles && ex.targetMuscles.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {ex.targetMuscles.map((m, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() => setTrackerIndex(idx)}
                              className="w-full py-2.5 bg-accent text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow shadow-accent/30 hover:shadow-md hover:shadow-accent/40"
                            >
                              ▶ {lang === 'ar' ? 'ابدأ التمرين' : 'Start Exercise'}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeSport && (
              <WorkoutTimer 
                key="timer" 
                sport={activeSport} 
                onClose={() => setActiveSport(null)} 
              />
            )}
            {trackerIndex !== null && recommendation?.homeExercises && recommendation.homeExercises.length > 0 && (
              <ExerciseTracker
                key="exerciseTracker"
                exercises={recommendation.homeExercises}
                startIndex={trackerIndex}
                onClose={() => setTrackerIndex(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
