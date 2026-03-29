import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, Calculator, Heart, Scale } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';
import { SportRecommendationRequestGender } from '@workspace/api-client-react';

const healthIssueOptions = [
  "Heart Condition", "Diabetes", "Joint Problems", 
  "High Blood Pressure", "Obesity", "Pregnancy", 
  "Back Pain", "Asthma"
];

const formSchema = z.object({
  weight: z.coerce.number().min(30, "Weight seems too low").max(300, "Weight seems too high"),
  height: z.coerce.number().min(100, "Height seems too low").max(250, "Height seems too high"),
  age: z.coerce.number().min(12, "Must be at least 12").max(120, "Age seems too high"),
  gender: z.enum(['male', 'female', 'other'] as const),
  healthIssues: z.array(z.string()).default([]),
  fitnessGoal: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BmiFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export function BmiForm({ onSubmit, isLoading }: BmiFormProps) {
  const { profile, updateProfile } = useUserProfile();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: profile.weight || undefined,
      height: profile.height || undefined,
      age: profile.age || undefined,
      gender: profile.gender || undefined,
      healthIssues: profile.healthIssues || [],
      fitnessGoal: 'stay active',
    }
  });

  const selectedIssues = watch('healthIssues') || [];

  const handleFormSubmit = (data: FormData) => {
    // Update global context so food form can use it
    updateProfile({
      weight: data.weight,
      height: data.height,
      age: data.age,
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
      className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-border"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Health Profile</h2>
          <p className="text-muted-foreground text-sm mt-1">Let's calculate your BMI and find perfect activities.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" /> Weight (kg)
            </label>
            <input 
              {...register('weight')} 
              type="number" step="0.1"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="e.g. 70"
            />
            {errors.weight && <p className="text-destructive text-xs font-medium">{errors.weight.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Height (cm)
            </label>
            <input 
              {...register('height')} 
              type="number" step="1"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="e.g. 175"
            />
            {errors.height && <p className="text-destructive text-xs font-medium">{errors.height.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Age
            </label>
            <input 
              {...register('age')} 
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="e.g. 30"
            />
            {errors.age && <p className="text-destructive text-xs font-medium">{errors.age.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              Gender
            </label>
            <select 
              {...register('gender')}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
            >
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-destructive text-xs font-medium">{errors.gender.message}</p>}
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-destructive" /> Existing Health Conditions
          </label>
          <div className="flex flex-wrap gap-2">
            {healthIssueOptions.map(issue => {
              const isSelected = selectedIssues.includes(issue);
              return (
                <button
                  key={issue}
                  type="button"
                  onClick={() => toggleIssue(issue)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-destructive/10 text-destructive border-2 border-destructive/20' 
                      : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80'}
                  `}
                >
                  {issue}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Profile...
              </span>
            ) : "Get AI Recommendations"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
