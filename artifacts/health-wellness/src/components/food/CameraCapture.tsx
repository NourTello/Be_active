import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(s => {
        if (!active) { s.getTracks().forEach(tr => tr.stop()); return; }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      })
      .catch(() => {
        setError('Cannot access camera. Please allow camera access or use Upload File instead.');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(tr => tr.stop());
    };
  }, [stream]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stream?.getTracks().forEach(tr => tr.stop());
    onCapture(dataUrl);
  };

  const handleClose = () => {
    stream?.getTracks().forEach(tr => tr.stop());
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-lg bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900">
          <span className="text-white font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent" /> {t.cameraTitle}
          </span>
          <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video or Error */}
        {error ? (
          <div className="p-8 text-center text-white/70 text-sm">{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover bg-black"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Capture button */}
        {!error && (
          <div className="flex items-center justify-center py-5 bg-slate-900">
            <button
              onClick={capture}
              className="w-16 h-16 rounded-full bg-white border-4 border-accent shadow-lg hover:scale-105 active:scale-95 transition-transform"
              aria-label={t.capture}
            />
          </div>
        )}
      </div>

      <button onClick={handleClose} className="mt-4 text-white/60 hover:text-white text-sm">
        {t.cancelCamera}
      </button>
    </motion.div>
  );
}
