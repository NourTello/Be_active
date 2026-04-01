import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'en' | 'ar';

const translations = {
  en: {
    appName: 'Be Active',
    appTagline: 'your health is important',
    sportTab: '🏃 Activity & Sport',
    foodTab: '🥗 Nutrition & Diet',
    waterReminder: 'Water Reminder',
    waterEveryHour: 'Every hour',
    waterOff: 'Off',
    darkMode: 'Dark Mode',
    language: 'عربي',
    discoverActivity: 'Discover Your Perfect Activity',
    discoverSubtitle: 'Our AI analyzes your body metrics and health profile to recommend sports that match your capabilities and goals perfectly.',
    healthProfile: 'Health Profile',
    healthProfileSub: "Let's calculate your BMI and find perfect activities.",
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    age: 'Age',
    gender: 'Gender',
    selectGender: 'Select gender...',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    healthIssues: 'Health Issues (optional)',
    analyze: 'Analyze & Recommend',
    analyzing: 'Analyzing...',
    yourBmi: 'Your BMI',
    targetWeight: 'Your Target Weight',
    ideal: 'Ideal (BMI 22)',
    healthyRange: 'Healthy Range',
    toReachIdeal: 'To reach ideal',
    toLose: 'to lose',
    toGain: 'to gain',
    alreadyAtGoal: 'Already at goal!',
    recommendedActivities: 'Recommended Activities',
    startWorkout: 'Start Workout Timer',
    cautions: 'Cautions',
    timerFor: 'Timer for',
    start: 'Start',
    pause: 'Pause',
    stop: 'Stop',
    workout: 'Workout',
    timeLeft: 'Time Left',
    waterBreakIn: 'Next water break in',
    hydrationCount: 'Hydration',
    drinkNow: 'Drink water now!',
    stayHydrated: '💧 Stay Hydrated',
    fuelBody: 'Fuel Your Body Right',
    fuelSubtitle: 'Get personalized meal plans matching your sport and use our AI camera to track your macros instantly.',
    aiScanner: 'AI Food Scanner',
    aiScannerSub: 'Snap a photo of your meal to estimate calories and macros instantly.',
    uploadOrPhoto: 'Upload or take a photo',
    takePhoto: 'Take Photo',
    uploadFile: 'Upload File',
    scanAnother: 'Scan another',
    aiAnalyzing: 'AI is analyzing your meal...',
    estimated: 'Estimated',
    detectedItems: 'Detected Items',
    ingredients: 'Ingredients',
    nutritionPlan: 'Nutrition Plan',
    nutritionPlanSub: 'Get an AI meal plan tailored to your sport and goals.',
    mainSport: 'Main Sport / Activity',
    currentWt: 'Current Wt (kg)',
    targetWt: 'Target Wt (kg)',
    fromBmi: 'from BMI',
    autoCalculated: 'Auto-calculated from your BMI to reach a healthy weight. You can adjust it.',
    generatePlan: 'Generate Meal Plan',
    generating: 'Generating Plan...',
    bmiRequiredError: 'Please fill in your BMI details in the Sport section first.',
    awaitingParams: 'Awaiting Parameters',
    awaitingParamsSub: 'Generate a plan to see your optimal daily nutrition break down.',
    dailyTarget: 'Daily Target',
    optimized: 'Optimized for your activity level',
    nutritionTips: 'Nutrition Tips',
    protein: 'Prot',
    carbs: 'Carb',
    fat: 'Fat',
    calories: 'cal',
    benefits: 'Benefits',
  },
  ar: {
    appName: 'كن نشيطاً',
    appTagline: 'صحتك تهمنا',
    sportTab: '🏃 النشاط والرياضة',
    foodTab: '🥗 التغذية والحمية',
    waterReminder: 'تذكير المياه',
    waterEveryHour: 'كل ساعة',
    waterOff: 'إيقاف',
    darkMode: 'الوضع الداكن',
    language: 'English',
    discoverActivity: 'اكتشف نشاطك المثالي',
    discoverSubtitle: 'يحلل الذكاء الاصطناعي مقاييس جسمك وملفك الصحي لتوصية رياضات تتناسب مع قدراتك وأهدافك.',
    healthProfile: 'ملفك الصحي',
    healthProfileSub: 'لنحسب مؤشر كتلة جسمك ونجد الأنشطة المناسبة لك.',
    weight: 'الوزن (كجم)',
    height: 'الطول (سم)',
    age: 'العمر',
    gender: 'الجنس',
    selectGender: 'اختر الجنس...',
    male: 'ذكر',
    female: 'أنثى',
    other: 'آخر',
    healthIssues: 'مشاكل صحية (اختياري)',
    analyze: 'تحليل والتوصية',
    analyzing: 'جاري التحليل...',
    yourBmi: 'مؤشر كتلة جسمك',
    targetWeight: 'وزنك المستهدف',
    ideal: 'مثالي (BMI 22)',
    healthyRange: 'النطاق الصحي',
    toReachIdeal: 'للوصول للمثالي',
    toLose: 'للخسارة',
    toGain: 'للزيادة',
    alreadyAtGoal: 'وزنك مثالي!',
    recommendedActivities: 'الأنشطة الموصى بها',
    startWorkout: 'ابدأ مؤقت التمرين',
    cautions: 'تحذيرات',
    timerFor: 'مؤقت لـ',
    start: 'ابدأ',
    pause: 'إيقاف مؤقت',
    stop: 'إيقاف',
    workout: 'تمرين',
    timeLeft: 'الوقت المتبقي',
    waterBreakIn: 'استراحة الماء التالية في',
    hydrationCount: 'الترطيب',
    drinkNow: 'اشرب الماء الآن!',
    stayHydrated: '💧 حافظ على ترطيبك',
    fuelBody: 'غذِّ جسمك بشكل صحيح',
    fuelSubtitle: 'احصل على خطط غذائية مخصصة تتناسب مع رياضتك واستخدم كاميرا الذكاء الاصطناعي لتتبع الماكروز.',
    aiScanner: 'ماسح الطعام بالذكاء الاصطناعي',
    aiScannerSub: 'التقط صورة لوجبتك لتقدير السعرات والماكرو فوراً.',
    uploadOrPhoto: 'ارفع أو التقط صورة',
    takePhoto: 'التقاط صورة',
    uploadFile: 'رفع صورة',
    scanAnother: 'مسح آخر',
    aiAnalyzing: 'الذكاء الاصطناعي يحلل وجبتك...',
    estimated: 'تقديري',
    detectedItems: 'العناصر المكتشفة',
    ingredients: 'المكونات',
    nutritionPlan: 'خطة التغذية',
    nutritionPlanSub: 'احصل على خطة غذائية بالذكاء الاصطناعي تتناسب مع رياضتك وأهدافك.',
    mainSport: 'الرياضة / النشاط الرئيسي',
    currentWt: 'الوزن الحالي (كجم)',
    targetWt: 'الوزن المستهدف (كجم)',
    fromBmi: 'من مؤشر الكتلة',
    autoCalculated: 'محسوب تلقائياً من مؤشر كتلة جسمك. يمكنك تعديله.',
    generatePlan: 'توليد خطة الغذاء',
    generating: 'جاري التوليد...',
    bmiRequiredError: 'يرجى ملء بيانات مؤشر كتلة الجسم في قسم الرياضة أولاً.',
    awaitingParams: 'في انتظار البيانات',
    awaitingParamsSub: 'أنشئ خطة لعرض التوزيع الغذائي اليومي الأمثل.',
    dailyTarget: 'الهدف اليومي',
    optimized: 'محسّن لمستوى نشاطك',
    nutritionTips: 'نصائح التغذية',
    protein: 'بروتين',
    carbs: 'كارب',
    fat: 'دهون',
    calories: 'سعرة',
    benefits: 'الفوائد',
  },
};

type Translations = typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
