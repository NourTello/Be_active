import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useAnalyzeFoodImage, FoodImageAnalysisResponse } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { CameraCapture } from './CameraCapture';

interface FoodItem {
  name: string;
  estimatedPortion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: string[];
}

export function FoodScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodImageAnalysisResponse | null>(null);
  const [expandedIngredients, setExpandedIngredients] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const analyzeMutation = useAnalyzeFoodImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (base64: string) => {
    setShowCamera(false);
    setImagePreview(base64);
    analyzeImage(base64);
  };

  const analyzeImage = async (base64String: string) => {
    try {
      const result = await analyzeMutation.mutateAsync({ data: { imageBase64: base64String } });
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze image', error);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setAnalysis(null);
    setExpandedIngredients(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Camera modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
        )}
      </AnimatePresence>

      <div className="bg-card rounded-3xl overflow-hidden shadow-xl shadow-black/5 border border-border">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
            <Camera className="w-32 h-32" />
          </div>
          <h3 className="text-2xl font-display font-bold relative z-10">{t.aiScanner}</h3>
          <p className="text-white/70 text-sm mt-2 relative z-10">{t.aiScannerSub}</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!imagePreview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-border rounded-2xl bg-muted/30"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-foreground font-semibold mb-4 text-center">{t.uploadOrPhoto}</p>

                {/* Hidden file upload input */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                <div className="flex gap-3 flex-wrap justify-center">
                  <button
                    onClick={() => setShowCamera(true)}
                    className="px-5 py-3 rounded-xl font-bold bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" /> {t.takePhoto}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-3 rounded-xl font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors flex items-center gap-2 border border-border"
                  >
                    <Upload className="w-5 h-5" /> {t.uploadFile}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-md">
                  <img src={imagePreview} alt="Food preview" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <button onClick={reset} className="text-white text-sm font-semibold hover:underline">
                      {t.scanAnother}
                    </button>
                  </div>
                </div>

                {analyzeMutation.isPending && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                    <p>{t.aiAnalyzing}</p>
                  </div>
                )}

                {analysis && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-accent/10 rounded-2xl border border-accent/20">
                      <div>
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">{t.estimated}</span>
                        <h4 className="text-3xl font-display font-bold text-foreground">{analysis.totalCalories} kcal</h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-bold text-foreground">{t.detectedItems}</h5>
                      {(analysis.foods as FoodItem[]).map((food, idx) => (
                        <div key={idx} className="border border-border rounded-xl overflow-hidden">
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h6 className="font-bold text-lg text-foreground">{food.name}</h6>
                              <p className="text-sm text-muted-foreground">{food.estimatedPortion}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-semibold">
                              <div className="text-center"><span className="block text-xs text-muted-foreground font-normal">{t.protein}</span>{food.protein}g</div>
                              <div className="text-center"><span className="block text-xs text-muted-foreground font-normal">{t.carbs}</span>{food.carbs}g</div>
                              <div className="text-center"><span className="block text-xs text-muted-foreground font-normal">{t.fat}</span>{food.fat}g</div>
                              <div className="text-center px-3 py-1 bg-muted rounded-lg">{food.calories} {t.calories}</div>
                            </div>
                          </div>

                          {food.ingredients && food.ingredients.length > 0 && (
                            <>
                              <button
                                onClick={() => setExpandedIngredients(expandedIngredients === idx ? null : idx)}
                                className="w-full flex items-center justify-between px-4 py-2 bg-muted/40 text-sm text-muted-foreground hover:bg-muted/60 transition-colors border-t border-border"
                              >
                                <span className="font-semibold">{t.ingredients}</span>
                                {expandedIngredients === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <AnimatePresence>
                                {expandedIngredients === idx && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 py-3 flex flex-wrap gap-2 bg-muted/20">
                                      {food.ingredients.map((ing, i) => (
                                        <span key={i} className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-medium text-foreground">
                                          {ing}
                                        </span>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {analysis.advice && (
                      <div className="flex gap-3 p-4 bg-secondary/10 rounded-xl text-secondary-foreground text-sm">
                        <Info className="w-5 h-5 shrink-0 text-secondary" />
                        <p>{analysis.advice}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
