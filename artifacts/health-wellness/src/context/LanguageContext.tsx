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
    gender: 'Gender',
    selectGender: 'Select gender...',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    healthIssues: 'Health Issues (optional)',
    analyze: 'Analyze & Recommend',
    analyzing: 'Analyzing...',
    yourBmi: 'Your Body Mass Index',
    awaitingProfile: 'Awaiting Your Profile',
    awaitingProfileSub: 'Fill out the form to get personalized, AI-driven sport recommendations tailored to your health.',
    targetWeight: 'Your Target Weight',
    ideal: 'Ideal (BMI 22)',
    healthyRange: 'Healthy Range',
    toReachIdeal: 'To reach ideal',
    toLose: 'to lose',
    toGain: 'to gain',
    alreadyAtGoal: 'Already at goal!',
    alreadyNormal: 'Great news — your weight is already within the healthy BMI range. Focus on maintaining it.',
    needGain: 'You need to gain {n} kg to reach an ideal BMI of 22. Focus on strength and nutrition.',
    needLose: 'You need to lose {n} kg to reach an ideal BMI of 22. This is pre-filled in your nutrition plan.',
    recommendedActivities: 'Recommended Activities',
    startWorkout: 'Start Workout Timer',
    medicalConsiderations: 'Medical Considerations',
    cautions: 'Cautions',
    closeTimer: '✕ Close',
    intensity: 'Intensity',
    min: 'min',
    fuelBody: 'Fuel Your Body Right',
    fuelSubtitle: 'Get personalized meal plans matching your sport and use our AI camera to track your macros instantly.',
    aiScanner: 'AI Food Scanner',
    aiScannerSub: 'Snap a photo of your meal to estimate calories and macros instantly.',
    uploadOrPhoto: 'Take or upload a photo of your food',
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
    cameraTitle: 'Camera',
    capture: 'Capture',
    cancelCamera: 'Cancel',
    bmiLive: 'BMI',
    healthIssueLabels: {
      'Heart Condition': 'Heart Condition',
      'Diabetes': 'Diabetes',
      'Joint Problems': 'Joint Problems',
      'High Blood Pressure': 'High Blood Pressure',
      'Obesity': 'Obesity',
      'Pregnancy': 'Pregnancy',
      'Back Pain': 'Back Pain',
      'Asthma': 'Asthma',
    },
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
    gender: 'الجنس',
    selectGender: 'اختر الجنس...',
    male: 'ذكر',
    female: 'أنثى',
    other: 'آخر',
    healthIssues: 'مشاكل صحية (اختياري)',
    analyze: 'تحليل والتوصية',
    analyzing: 'جاري التحليل...',
    yourBmi: 'مؤشر كتلة جسمك',
    awaitingProfile: 'في انتظار ملفك',
    awaitingProfileSub: 'أكمل النموذج للحصول على توصيات رياضية مخصصة بالذكاء الاصطناعي.',
    targetWeight: 'وزنك المستهدف',
    ideal: 'مثالي (BMI 22)',
    healthyRange: 'النطاق الصحي',
    toReachIdeal: 'للوصول للمثالي',
    toLose: 'للخسارة',
    toGain: 'للزيادة',
    alreadyAtGoal: 'وزنك مثالي!',
    alreadyNormal: 'عظيم — وزنك ضمن النطاق الصحي. ركّز على الحفاظ عليه.',
    needGain: 'تحتاج لزيادة {n} كجم للوصول لـ BMI 22. ركّز على القوة والتغذية.',
    needLose: 'تحتاج لخسارة {n} كجم للوصول لـ BMI 22. هذا الرقم محفوظ في خطة غذائك.',
    recommendedActivities: 'الأنشطة الموصى بها',
    startWorkout: 'ابدأ مؤقت التمرين',
    medicalConsiderations: 'اعتبارات طبية',
    cautions: 'تحذيرات',
    closeTimer: '✕ إغلاق',
    intensity: 'الشدة',
    min: 'دقيقة',
    fuelBody: 'غذِّ جسمك بشكل صحيح',
    fuelSubtitle: 'احصل على خطط غذائية مخصصة تتناسب مع رياضتك واستخدم كاميرا الذكاء الاصطناعي لتتبع الماكروز.',
    aiScanner: 'ماسح الطعام بالذكاء الاصطناعي',
    aiScannerSub: 'التقط صورة لوجبتك لتقدير السعرات والماكرو فوراً.',
    uploadOrPhoto: 'التقط أو ارفع صورة طعامك',
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
    cameraTitle: 'الكاميرا',
    capture: 'التقاط',
    cancelCamera: 'إلغاء',
    bmiLive: 'مؤشر كتلة الجسم',
    healthIssueLabels: {
      'Heart Condition': 'أمراض القلب',
      'Diabetes': 'السكري',
      'Joint Problems': 'مشاكل المفاصل',
      'High Blood Pressure': 'ضغط الدم المرتفع',
      'Obesity': 'السمنة',
      'Pregnancy': 'الحمل',
      'Back Pain': 'آلام الظهر',
      'Asthma': 'الربو',
    },
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
