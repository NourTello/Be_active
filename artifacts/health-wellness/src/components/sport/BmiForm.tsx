import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Activity, Calculator, Heart, Scale } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useLanguage } from '@/context/LanguageContext';

const healthIssueOptions = [
  'Heart Condition', 'Diabetes', 'Joint Problems',
  'High Blood Pressure', 'Obesity', 'Pregnancy',
  'Back Pain', 'Asthma',
] as const;

const formSchema = z.object({
  weight: z.coerce.number().min(30, 'Weight seems too low').max(300, 'Weight seems too high'),
  height: z.coerce.number().min(100, 'Height seems too low').max(250, 'Height seems too high'),
  gender: z.enum(['male', 'female', 'other'] as const),
  healthIssues: z.array(z.string()).default([]),
  fitnessGoal: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BmiFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500 bg-blue-50 border-blue-200' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600 bg-green-50 border-green-200' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500 bg-orange-50 border-orange-200' };
  return { label: 'Obese', color: 'text-red-500 bg-red-50 border-red-200' };
}

export function BmiForm({ onSubmit, isLoading }: BmiFormProps) {
  const { profile, updateProfile } = useUserProfile();
  const { t } = useLanguage();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: profile.weight || undefined,
      height: profile.height || undefined,
      gender: profile.gender || undefined,
      healthIssues: profile.healthIssues || [],
      fitnessGoal: 'stay active',
    },
  });

  const selectedIssues = watch('healthIssues') || [];
  const watchedWeight = watch('weight');
  const watchedHeight = watch('height');

  const liveBmi = (watchedWeight && watchedHeight && watchedHeight >= 100)
    ? watchedWeight / Math.pow(watchedHeight / 100, 2)
    : null;
  const liveBmiCategory = liveBmi ? getBmiCategory(liveBmi) : null;

  const handleFormSubmit = (data: FormData) => {
    updateProfile({
      weight: data.weight,
      height: data.height,
      gender: data.gender,
      healthIssues: data.healthIssues,
    });
    onSubmit(data);
  };

  const toggleIssue = (issue: string) => {
    if (selectedIssues.includes(issue)) {
      setValue('healthIssues', selectedIssues.filter(i => i !== issue));
    } else {
      setValue('healthIssues', [...selectedIssues, issue]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-border"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">{t.healthProfile}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.healthProfileSub}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" /> {t.weight}
            </label>
            <input
              {...register('weight')}
              type="number" step="0.1"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
              placeholder="e.g. 70"
            />
            {errors.weight && <p className="text-destructive text-xs font-medium">{errors.weight.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> {t.height}
            </label>
            <input
              {...register('height')}
              type="number" step="1"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
              placeholder="e.g. 175"
            />
            {errors.height && <p className="text-destructive text-xs font-medium">{errors.height.message}</p>}
          </div>
        </div>

        {/* Live BMI Preview */}
        {liveBmi && liveBmiCategory && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between px-5 py-4 rounded-2xl border ${liveBmiCategory.color}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-display font-bold">{liveBmi.toFixed(1)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{t.bmiLive}</p>
              </div>
              <div className="w-px h-8 bg-current opacity-20" />
              <p className="font-semibold text-sm">{liveBmiCategory.label}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-current opacity-10 flex items-center justify-center">
              <Calculator className="w-4 h-4" style={{ opacity: 1 }} />
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">{t.gender}</label>
          <select
            {...register('gender')}
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none text-foreground"
          >
            <option value="">{t.selectGender}</option>
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
            <option value="other">{t.other}</option>
          </select>
          {errors.gender && <p className="text-destructive text-xs font-medium">{errors.gender.message}</p>}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-destructive" /> {t.healthIssues}
          </label>
          <div className="flex flex-wrap gap-2">
            {healthIssueOptions.map(issue => {
              const isSelected = selectedIssues.includes(issue);
              const label = t.healthIssueLabels[issue] ?? issue;
              return (
                <button
                  key={issue}
                  type="button"
                  onClick={() => toggleIssue(issue)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-destructive/10 text-destructive border-2 border-destructive/20'
                      : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t.analyzing}
              </span>
            ) : t.analyze}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
