import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BmiForm } from './BmiForm';
import { WorkoutTimer } from './WorkoutTimer';
import { useGetSportRecommendation, SportRecommendationResponse, SportRecommendation } from '@workspace/api-client-react';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, Flame, Timer, Target, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useUserProfile, calcTargetWeight } from '@/context/UserProfileContext';

export function SportSection() {
  const [recommendation, setRecommendation] = useState<SportRecommendationResponse | null>(null);
  const [activeSport, setActiveSport] = useState<SportRecommendation | null>(null);
  const [submittedWeight, setSubmittedWeight] = useState<number | null>(null);
  const [submittedHeight, setSubmittedHeight] = useState<number | null>(null);

  const { updateProfile } = useUserProfile();
  const sportMutation = useGetSportRecommendation();

  const handleFormSubmit = async (data: any) => {
    try {
      setSubmittedWeight(data.weight);
      setSubmittedHeight(data.height);
      const result = await sportMutation.mutateAsync({ data });
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
        <h2 className="text-4xl font-display font-bold text-foreground mb-4">Discover Your Perfect Activity</h2>
        <p className="text-lg text-muted-foreground">Our AI analyzes your body metrics and health profile to recommend sports that match your capabilities and goals perfectly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <BmiForm onSubmit={handleFormSubmit} isLoading={sportMutation.isPending} />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!recommendation && !sportMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center bg-card/50"
              >
                <img 
                  src={`${import.meta.env.BASE_URL}images/sport-illustration.png`} 
                  alt="Sport illustration" 
                  className="w-64 h-64 object-contain opacity-80 mix-blend-multiply mb-6"
                />
                <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Your Profile</h3>
                <p className="text-muted-foreground max-w-sm">Fill out the form to get personalized, AI-driven sport recommendations tailored to your health.</p>
              </motion.div>
            )}

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
                    <h3 className="text-xl font-bold mb-2">Your Body Mass Index</h3>
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
                        <h4 className={`font-bold ${trendColor}`}>Your Target Weight</h4>
                      </div>
                      <div className="flex flex-wrap items-end gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ideal (BMI 22)</p>
                          <p className="text-3xl font-bold text-foreground">{tw.ideal} <span className="text-base font-normal text-muted-foreground">kg</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Healthy Range</p>
                          <p className="text-lg font-semibold text-foreground">{tw.min} – {tw.max} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                        </div>
                        {!isNormal && (
                          <div className="ml-auto text-right">
                            <p className="text-xs text-muted-foreground mb-1">To reach ideal</p>
                            <p className={`text-xl font-bold flex items-center gap-1 ${trendColor}`}>
                              <TrendIcon className="w-5 h-5" />
                              {Math.abs(diff)} kg {diff < 0 ? 'to lose' : 'to gain'}
                            </p>
                          </div>
                        )}
                        {isNormal && (
                          <div className="ml-auto text-right">
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="text-base font-bold text-primary flex items-center gap-1"><Minus className="w-4 h-4" /> Already at goal!</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {isNormal
                          ? 'Great news — your weight is already within the healthy BMI range. Focus on maintaining it.'
                          : isUnderweight
                          ? `You need to gain ${Math.abs(diff)} kg to reach an ideal BMI of 22. Focus on strength and nutrition.`
                          : `You need to lose ${Math.abs(diff)} kg to reach an ideal BMI of 22. This is pre-filled in your nutrition plan.`}
                      </p>
                    </div>
                  );
                })()}

                {/* Cautions */}
                {recommendation.cautions.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
                    <h4 className="flex items-center gap-2 font-bold text-destructive mb-3">
                      <AlertTriangle className="w-5 h-5" /> Medical Considerations
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
                <h3 className="text-2xl font-display font-bold pt-4">Recommended Activities</h3>
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
              </motion.div>
            )}

            {activeSport && (
              <WorkoutTimer 
                key="timer" 
                sport={activeSport} 
                onClose={() => setActiveSport(null)} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
