import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealPlanForm } from './MealPlanForm';
import { FoodScanner } from './FoodScanner';
import { useGetFoodRecommendation, FoodRecommendationResponse } from '@workspace/api-client-react';
import { CheckCircle2, Flame, AlertCircle } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useLanguage } from '@/context/LanguageContext';

export function FoodSection() {
  const [mealPlan, setMealPlan] = useState<FoodRecommendationResponse | null>(null);
  const [bmiError, setBmiError] = useState(false);
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const foodMutation = useGetFoodRecommendation();

  const handleFormSubmit = async (data: any) => {
    // Require BMI data before generating plan
    if (!profile.weight || !profile.height) {
      setBmiError(true);
      setTimeout(() => setBmiError(false), 5000);
      return;
    }
    setBmiError(false);
    try {
      const result = await foodMutation.mutateAsync({ data });
      setMealPlan(result);
    } catch (error) {
      console.error('Failed to generate meal plan', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-display font-bold text-foreground mb-4">{t.fuelBody}</h2>
        <p className="text-lg text-muted-foreground">{t.fuelSubtitle}</p>
      </div>

      {/* BMI error banner */}
      <AnimatePresence>
        {bmiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive font-medium"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{t.bmiRequiredError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-8">
        {/* Scanner & Form */}
        <div className="w-full space-y-8">
          <FoodScanner />
          <MealPlanForm onSubmit={handleFormSubmit} isLoading={foodMutation.isPending} />
        </div>

        {/* Meal Plan Results */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {mealPlan && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Target Card */}
                <div className="bg-gradient-to-r from-accent to-orange-400 rounded-3xl p-8 text-white shadow-xl shadow-accent/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-medium text-white/90 mb-1">{t.dailyTarget}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-bold">{mealPlan.dailyCalorieTarget}</span>
                      <span className="text-lg font-medium opacity-80">kcal</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/20 px-6 py-4 rounded-2xl backdrop-blur-sm">
                    <Flame className="w-8 h-8 text-white" />
                    <p className="text-sm font-medium">{t.optimized}</p>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-6">
                  {mealPlan.meals.map((meal, idx) => (
                    <div key={idx} className="bg-card rounded-2xl p-6 shadow-md border border-border">
                      <h4 className="text-2xl font-display font-bold mb-4 capitalize text-foreground border-b border-border pb-3">
                        {meal.mealType}
                      </h4>

                      <div className="space-y-4">
                        {meal.foods.map((food, fIdx) => (
                          <div key={fIdx} className="group relative pl-4 sm:pl-0">
                            <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent/20 rounded-full sm:hidden" />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors">
                              <div className="flex-1">
                                <h5 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">{food.name}</h5>
                                <p className="text-sm text-muted-foreground">{food.portion}</p>
                                <p className="text-xs text-secondary font-medium mt-1">{food.benefits}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-card sm:bg-transparent p-3 sm:p-0 rounded-xl border border-border sm:border-transparent">
                                <div className="text-center min-w-[3rem]">
                                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">{t.protein}</span>
                                  <span className="font-semibold">{food.protein}g</span>
                                </div>
                                <div className="text-center min-w-[3rem]">
                                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">{t.carbs}</span>
                                  <span className="font-semibold">{food.carbs}g</span>
                                </div>
                                <div className="text-center min-w-[3rem]">
                                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">{t.fat}</span>
                                  <span className="font-semibold">{food.fat}g</span>
                                </div>
                                <div className="text-center px-3 py-1.5 bg-accent/10 text-accent rounded-lg min-w-[4rem]">
                                  <span className="font-bold">{food.calories}</span>
                                  <span className="block text-[10px] uppercase font-bold">{t.calories}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips — black text */}
                <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
                  <h4 className="font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-secondary" /> {t.nutritionTips}
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mealPlan.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-black dark:text-white">
                        <span className="mt-1 text-secondary">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
