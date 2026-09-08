// components/kyc/BiometricCapture.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  CheckCircle, 
  User, 
  RotateCcw,
  ScanFace,
  AlertCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

// Types
type CaptureType = 'FACE' | 'PROFIL_GAUCHE' | 'PROFIL_DROIT';
type CaptureStatus = 'IDLE' | 'GUIDING' | 'CAPTURING' | 'SUCCESS' | 'ERROR';

interface BiometricCaptureProps {
  onComplete: (images: {
    face: string;
    profilGauche: string;
    profilDroit: string;
  }) => void;
}

export default function BiometricCapture({ onComplete }: BiometricCaptureProps) {
  const [currentStep, setCurrentStep] = useState<CaptureType>('FACE');
  const [status, setStatus] = useState<CaptureStatus>('IDLE');
  const [capturedImages, setCapturedImages] = useState<{
    face?: string;
    profilGauche?: string;
    profilDroit?: string;
  }>({});
  const [aiGuidance, setAiGuidance] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================
  // 🎥 DÉMARRER LA CAMÉRA
  // ============================================
  const startCamera = useCallback(async () => {
    setError('');
    setStatus('GUIDING');
    setAiGuidance('Initialisation de la caméra...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
      
      startGuidance();
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setStatus('ERROR');
    }
  }, []);

  // ============================================
  // 🛑 ARRÊTER LA CAMÉRA
  // ============================================
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
    setStatus('IDLE');
    setAiGuidance('');
  }, []);

  // ============================================
  // 🤖 GUIDAGE IA
  // ============================================
  const startGuidance = () => {
    const guidanceByStep: Record<CaptureType, string[]> = {
      'FACE': [
        'Placez votre visage dans le cercle ovale',
        'Regardez droit devant vous',
        'Gardez une expression neutre',
        'Assurez-vous d\'avoir un bon éclairage',
        '✅ Position parfaite ! Cliquez pour capturer.'
      ],
      'PROFIL_GAUCHE': [
        'Tournez votre tête vers la GAUCHE',
        'Montrez votre profil gauche complet',
        'Gardez les épaules droites',
        'Ne bougez plus...',
        '✅ Position parfaite ! Cliquez pour capturer.'
      ],
      'PROFIL_DROIT': [
        'Tournez votre tête vers la DROITE',
        'Montrez votre profil droit complet',
        'Gardez les épaules droites',
        'Ne bougez plus...',
        '✅ Position parfaite ! Cliquez pour capturer.'
      ],
    };

    const steps = guidanceByStep[currentStep];
    let stepIndex = 0;

    setAiGuidance(steps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setAiGuidance(steps[stepIndex]);
        if (stepIndex === steps.length - 1) {
          setStatus('CAPTURING');
        }
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  // ============================================
  // 📸 CAPTURER LA PHOTO
  // ============================================
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        // Sauvegarder l'image
        const newImages = { ...capturedImages };
        if (currentStep === 'FACE') {
          newImages.face = imageDataUrl;
        } else if (currentStep === 'PROFIL_GAUCHE') {
          newImages.profilGauche = imageDataUrl;
        } else if (currentStep === 'PROFIL_DROIT') {
          newImages.profilDroit = imageDataUrl;
        }
        setCapturedImages(newImages);
        
        setStatus('SUCCESS');
        
        // Passer à l'étape suivante
        setTimeout(() => {
          if (currentStep === 'FACE') {
            setCurrentStep('PROFIL_GAUCHE');
            setStatus('GUIDING');
            startGuidance();
          } else if (currentStep === 'PROFIL_GAUCHE') {
            setCurrentStep('PROFIL_DROIT');
            setStatus('GUIDING');
            startGuidance();
          } else if (currentStep === 'PROFIL_DROIT') {
            // Toutes les photos sont prises
            stopCamera();
            onComplete({
              face: newImages.face!,
              profilGauche: newImages.profilGauche!,
              profilDroit: imageDataUrl,
            });
          }
        }, 1500);
      }
    }
  };

  // ============================================
  // 🔄 RÉINITIALISER
  // ============================================
  const resetCapture = () => {
    stopCamera();
    setCapturedImages({});
    setCurrentStep('FACE');
    setStatus('IDLE');
    setAiGuidance('');
  };

  // ============================================
  // 🧹 NETTOYAGE
  // ============================================
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ============================================
  // 📋 ÉTAPES
  // ============================================
  const steps = [
    { type: 'FACE' as CaptureType, label: 'Face', imgKey: 'face' as const },
    { type: 'PROFIL_GAUCHE' as CaptureType, label: 'Profil gauche', imgKey: 'profilGauche' as const },
    { type: 'PROFIL_DROIT' as CaptureType, label: 'Profil droit', imgKey: 'profilDroit' as const },
  ];

  return (
    <div className="space-y-4">
      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {steps.map((step, index) => (
          <div key={step.type} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep === step.type 
                  ? 'bg-blue-600 text-white' 
                  : capturedImages[step.imgKey]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
              }`}>
                {capturedImages[step.imgKey] ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <span className="text-xs font-bold text-gray-900 mt-1">{step.label}</span>
            </div>
            {index < 2 && <ArrowRight className="h-5 w-5 text-gray-400" />}
          </div>
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Zone de capture */}
      {!isCameraReady ? (
        <div className="text-center py-8">
          <ScanFace className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-bold mb-4">
            {currentStep === 'FACE' && 'Photo de face'}
            {currentStep === 'PROFIL_GAUCHE' && 'Photo de profil gauche'}
            {currentStep === 'PROFIL_DROIT' && 'Photo de profil droit'}
          </p>
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            <Camera className="h-5 w-5" />
            Démarrer la capture
          </button>
        </div>
      ) : (
        <div>
          {/* Vidéo */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-[350px] object-cover rounded-lg bg-black"
            />

            {/* Guide de cadrage ovale */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-64 border-4 border-white border-opacity-50 rounded-full" />
            </div>

            {/* Guidage IA */}
            {aiGuidance && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-3 rounded-lg max-w-[90%]">
                <p className="text-sm font-bold flex items-center gap-2">
                  {status === 'CAPTURING' ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  )}
                  {aiGuidance}
                </p>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-center gap-4 mt-4">
            {status === 'CAPTURING' && (
              <button
                type="button"
                onClick={capturePhoto}
                className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-8 w-8" />
              </button>
            )}
            <button
              type="button"
              onClick={resetCapture}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold flex items-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Recommencer
            </button>
          </div>
        </div>
      )}

      {/* Prévisualisation */}
      {Object.keys(capturedImages).length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {capturedImages.face && (
            <div>
              <p className="text-xs font-bold text-gray-900 mb-1">Face ✓</p>
              <img src={capturedImages.face} alt="Face" className="w-full h-28 object-cover rounded-lg" />
            </div>
          )}
          {capturedImages.profilGauche && (
            <div>
              <p className="text-xs font-bold text-gray-900 mb-1">Profil gauche ✓</p>
              <img src={capturedImages.profilGauche} alt="Profil gauche" className="w-full h-28 object-cover rounded-lg" />
            </div>
          )}
          {capturedImages.profilDroit && (
            <div>
              <p className="text-xs font-bold text-gray-900 mb-1">Profil droit ✓</p>
              <img src={capturedImages.profilDroit} alt="Profil droit" className="w-full h-28 object-cover rounded-lg" />
            </div>
          )}
        </div>
      )}

      {/* Canvas caché */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}