import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Target, Utensils, Sparkles } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';

const formSchema = z.object({
  sport: z.string().min(2, "Please enter your main sport or activity"),
  currentWeight: z.coerce.number().min(30).max(300),
  targetWeight: z.coerce.number().min(30).max(300),
  height: z.coerce.number().min(100).max(250),
  age: z.coerce.number().min(12).max(120),
  gender: z.enum(['male', 'female', 'other'] as const),
  healthIssues: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface MealPlanFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export function MealPlanForm({ onSubmit, isLoading }: MealPlanFormProps) {
  const { profile } = useUserProfile();

  // Use AI-calculated target weight if available, otherwise fall back to current weight
  const defaultTargetWeight = profile.targetWeight || profile.weight || undefined;
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sport: 'Running',
      currentWeight: profile.weight || undefined,
      targetWeight: defaultTargetWeight as number | undefined,
      height: profile.height || undefined,
      age: profile.age || undefined,
      gender: profile.gender || undefined,
      healthIssues: profile.healthIssues || [],
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-accent/5 border border-border"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50">
        <div className="p-3 bg-accent/10 rounded-2xl text-accent">
          <Utensils className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Nutrition Plan</h2>
          <p className="text-muted-foreground text-sm mt-1">Get an AI meal plan tailored to your sport and goals.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            Main Sport / Activity
          </label>
          <input 
            {...register('sport')} 
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
            placeholder="e.g. Cycling, Weightlifting"
          />
          {errors.sport && <p className="text-destructive text-xs font-medium">{errors.sport.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Current Wt (kg)</label>
            <input 
              {...register('currentWeight')} 
              type="number" step="0.1"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none"
            />
            {errors.currentWeight && <p className="text-destructive text-xs font-medium">{errors.currentWeight.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1">
              <Target className="w-4 h-4 text-accent" /> Target Wt (kg)
              {profile.targetWeight ? (
                <span className="ml-1 flex items-center gap-0.5 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  <Sparkles className="w-3 h-3" /> from BMI
                </span>
              ) : null}
            </label>
            <input 
              {...register('targetWeight')} 
              type="number" step="0.1"
              className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/30 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none font-bold text-accent"
            />
            {profile.targetWeight && (
              <p className="text-xs text-muted-foreground">Auto-calculated from your BMI to reach a healthy weight. You can adjust it.</p>
            )}
            {errors.targetWeight && <p className="text-destructive text-xs font-medium">{errors.targetWeight.message}</p>}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-accent to-orange-400 shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Plan..." : "Generate Meal Plan"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
