import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Upload, Loader2, Info } from 'lucide-react';
import { useAnalyzeFoodImage, FoodImageAnalysisResponse } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FoodScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodImageAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const analyzeMutation = useAnalyzeFoodImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64String: string) => {
    try {
      // Remove data URL prefix for cleaner payload if needed, but usually APIs handle it.
      // Assuming our API handles standard data URIs or raw base64. Let's send the full string.
      const result = await analyzeMutation.mutateAsync({
        data: { imageBase64: base64String }
      });
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to analyze image", error);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-black/5 border border-border">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
          <Camera className="w-32 h-32" />
        </div>
        <h3 className="text-2xl font-display font-bold relative z-10">AI Food Scanner</h3>
        <p className="text-white/70 text-sm mt-2 relative z-10">Snap a photo of your meal to estimate calories and macros instantly.</p>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!imagePreview ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-2xl bg-muted/30"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <p className="text-foreground font-semibold mb-2">Upload or take a photo</p>
              
              {/* Hidden file input with environment capture for mobile cameras */}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-xl font-bold bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Scan Food
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
                    Scan another
                  </button>
                </div>
              </div>

              {analyzeMutation.isPending && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                  <p>AI is analyzing your meal...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-accent/10 rounded-2xl border border-accent/20">
                    <div>
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">Estimated</span>
                      <h4 className="text-3xl font-display font-bold text-foreground">{analysis.totalCalories} kcal</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confidence</span>
                      <p className="font-semibold text-foreground">{analysis.confidence}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-foreground">Detected Items</h5>
                    {analysis.foods.map((food, idx) => (
                      <div key={idx} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h6 className="font-bold text-lg">{food.name}</h6>
                          <p className="text-sm text-muted-foreground">{food.estimatedPortion}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-semibold">
                          <div className="text-center"><span className="block text-xs text-muted-foreground font-normal">Prot</span>{food.protein}g</div>
                          <div className="text-center"><span className="block text-xs text-muted-foreground font-normal">Carbs</span>{food.carbs}g</div>
                          <div className="text-center"><span className="block text-xs text-muted-foreground font-normal">Fat</span>{food.fat}g</div>
                          <div className="text-center px-3 py-1 bg-muted rounded-lg">{food.calories} cal</div>
                        </div>
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
  );
}
