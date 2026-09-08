// app/verification/niveau-2/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  Shield,
  RefreshCw,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  User,
  ScanFace,
  Lightbulb,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

// ============================================
// TYPES POUR LA CAPTURE BIOMÉTRIQUE
// ============================================
type CaptureType = 'FACE' | 'PROFIL_GAUCHE' | 'PROFIL_DROIT';
type CaptureStatus = 'IDLE' | 'GUIDING' | 'CAPTURING' | 'SUCCESS' | 'ERROR';

export default function VerificationNiveau2Page() {
  // ============================================
  // ÉTATS POUR LE DOCUMENT
  // ============================================
  const [documentType, setDocumentType] = useState<'CNI' | 'PASSPORT'>('CNI');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [passportImage, setPassportImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentCameraTarget, setCurrentCameraTarget] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    documentNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    expiryDate: '',
  });

  // ============================================
  // ÉTATS POUR LA BIOMÉTRIE
  // ============================================
  const [biometricStep, setBiometricStep] = useState<CaptureType>('FACE');
  const [biometricStatus, setBiometricStatus] = useState<CaptureStatus>('IDLE');
  const [biometricGuidance, setBiometricGuidance] = useState('');
  const [biometricError, setBiometricError] = useState('');
  const [isBiometricCameraReady, setIsBiometricCameraReady] = useState(false);
  const [biometricImages, setBiometricImages] = useState<{
    face?: string;
    profilGauche?: string;
    profilDroit?: string;
  }>({});

  // ============================================
  // REFS
  // ============================================
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const biometricVideoRef = useRef<HTMLVideoElement>(null);
  const biometricStreamRef = useRef<MediaStream | null>(null);
  const biometricCanvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================
  // 📸 GESTION CAMÉRA DOCUMENT
  // ============================================
  const openCamera = async (target: string) => {
    setCurrentCameraTarget(target);
    setIsCameraOpen(true);
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCurrentCameraTarget(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      switch (currentCameraTarget) {
        case 'front':
          setFrontImage(imageDataUrl);
          break;
        case 'back':
          setBackImage(imageDataUrl);
          break;
        case 'passport':
          setPassportImage(imageDataUrl);
          break;
        case 'selfie':
          setSelfieImage(imageDataUrl);
          break;
      }
      
      closeCamera();
    }
  };

  // ============================================
  // 🤖 GESTION CAMÉRA BIOMÉTRIQUE
  // ============================================
    const startBiometricCamera = async () => {
    setBiometricError('');
    setBiometricStatus('GUIDING');
    setBiometricGuidance('Initialisation de la caméra...');

    // 👉 Afficher la vidéo immédiatement pour que le ref existe
    setIsBiometricCameraReady(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      biometricStreamRef.current = stream;

      // 👉 Attendre que le <video> soit monté
      setTimeout(() => {
        if (biometricVideoRef.current) {
          biometricVideoRef.current.srcObject = stream;
          biometricVideoRef.current.play().catch(() => {});
        }
      }, 100);

      startBiometricGuidance();
    } catch (err) {
      setBiometricError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setBiometricStatus('ERROR');
      setIsBiometricCameraReady(false);
    }
  };

  const stopBiometricCamera = () => {
  if (biometricStreamRef.current) {
    biometricStreamRef.current.getTracks().forEach(track => track.stop());
    biometricStreamRef.current = null;
  }
  setIsBiometricCameraReady(false);
  setBiometricStatus('IDLE');
  setBiometricGuidance('');
};

  const startBiometricGuidance = () => {
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

    const steps = guidanceByStep[biometricStep];
    let stepIndex = 0;

    setBiometricGuidance(steps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setBiometricGuidance(steps[stepIndex]);
        if (stepIndex === steps.length - 1) {
          setBiometricStatus('CAPTURING');
        }
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const captureBiometricPhoto = () => {
    if (biometricVideoRef.current && biometricCanvasRef.current) {
      const video = biometricVideoRef.current;
      const canvas = biometricCanvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        const newImages = { ...biometricImages };
        if (biometricStep === 'FACE') {
          newImages.face = imageDataUrl;
        } else if (biometricStep === 'PROFIL_GAUCHE') {
          newImages.profilGauche = imageDataUrl;
        } else if (biometricStep === 'PROFIL_DROIT') {
          newImages.profilDroit = imageDataUrl;
        }
        setBiometricImages(newImages);
        
        setBiometricStatus('SUCCESS');
        
        setTimeout(() => {
          if (biometricStep === 'FACE') {
            setBiometricStep('PROFIL_GAUCHE');
            setBiometricStatus('GUIDING');
            startBiometricGuidance();
          } else if (biometricStep === 'PROFIL_GAUCHE') {
            setBiometricStep('PROFIL_DROIT');
            setBiometricStatus('GUIDING');
            startBiometricGuidance();
          } else if (biometricStep === 'PROFIL_DROIT') {
            stopBiometricCamera();
            setBiometricStatus('SUCCESS');
          }
        }, 1500);
      }
    }
  };

  const resetBiometricCapture = () => {
    stopBiometricCamera();
    setBiometricImages({});
    setBiometricStep('FACE');
    setBiometricStatus('IDLE');
    setBiometricGuidance('');
  };

  useEffect(() => {
    return () => {
      stopBiometricCamera();
    };
  }, []);

  // ============================================
  // ✅ VALIDATION
  // ============================================
  const validateStrict = () => {
    setError('');

    if (!formData.documentNumber || !formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.expiryDate) {
      setError('Tous les champs sont obligatoires');
      return false;
    }

    if (formData.documentNumber.length < 6) {
      setError('Numéro de document invalide');
      return false;
    }

    const expiry = new Date(formData.expiryDate);
    if (expiry < new Date()) {
      setError('Le document est expiré');
      return false;
    }

    if (documentType === 'CNI') {
      if (!frontImage || !backImage) {
        setError('Les photos recto et verso de la CNI sont obligatoires');
        return false;
      }
    } else {
      if (!passportImage) {
        setError('La photo du passeport est obligatoire');
        return false;
      }
    }

    if (!selfieImage) {
      setError('Le selfie de vérification est obligatoire');
      return false;
    }

    // Validation biométrique
    if (!biometricImages.face || !biometricImages.profilGauche || !biometricImages.profilDroit) {
      setError('Les photos biométriques (face, profil gauche, profil droit) sont obligatoires');
      return false;
    }

    return true;
  };

  // ============================================
  // 📤 SOUMISSION
  // ============================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit déclenché !');
    
    if (!validateStrict()) {
      console.log('Validation échouée:', error);
      return;
    }

    console.log('Validation réussie, envoi en cours...');
    setIsSubmitting(true);
    setError('');

    // ============================================
    // 🚀 BACKEND : ICI ON ENVERRA LES DONNÉES
    // ============================================
    // const formDataToSend = new FormData();
    // formDataToSend.append('documentNumber', formData.documentNumber);
    // formDataToSend.append('firstName', formData.firstName);
    // formDataToSend.append('lastName', formData.lastName);
    // formDataToSend.append('dateOfBirth', formData.dateOfBirth);
    // formDataToSend.append('expiryDate', formData.expiryDate);
    // formDataToSend.append('documentType', documentType);
    // formDataToSend.append('frontImage', frontImage);
    // formDataToSend.append('backImage', backImage);
    // formDataToSend.append('selfieImage', selfieImage);
    // formDataToSend.append('biometricFace', biometricImages.face);
    // formDataToSend.append('biometricProfilGauche', biometricImages.profilGauche);
    // formDataToSend.append('biometricProfilDroit', biometricImages.profilDroit);
    //
    // const response = await fetch('/api/kyc/verify', {
    //   method: 'POST',
    //   body: formDataToSend,
    // });
    // ============================================

    setTimeout(() => {
      console.log('Envoi simulé terminé !');
      setIsSubmitting(false);
      alert('✅ Documents soumis avec succès !');
      window.location.href = '/verification/statut';
    }, 2000);
  };

  // ============================================
  // 🎨 CLASSES CSS
  // ============================================
  const inputClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2";

  // ============================================
  // 📄 RENDU
  // ============================================
  return (
    <div className="max-w-4xl mx-auto">
      {/* Modal Caméra Document */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-bold text-gray-900">Prendre la photo</h3>
              <button onClick={closeCamera} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-[400px] object-cover bg-black"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-white border-opacity-50 rounded-lg w-3/4 h-3/4" />
              </div>
            </div>
            <div className="p-4 flex justify-center gap-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vérification d'Identité - Niveau 2</h1>
        <p className="text-gray-700 mt-1 font-medium">
          Les photos doivent être prises directement avec votre caméra
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de document */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Type de document</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setDocumentType('CNI');
                setPassportImage(null);
                setError('');
              }}
              className={`p-6 border-2 rounded-xl transition-colors ${
                documentType === 'CNI'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className={`h-10 w-10 mx-auto mb-3 ${documentType === 'CNI' ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900">Carte Nationale d'Identité</h3>
              <p className="text-sm text-gray-700 mt-1 font-medium">Recto et verso requis</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setDocumentType('PASSPORT');
                setFrontImage(null);
                setBackImage(null);
                setError('');
              }}
              className={`p-6 border-2 rounded-xl transition-colors ${
                documentType === 'PASSPORT'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className={`h-10 w-10 mx-auto mb-3 ${documentType === 'PASSPORT' ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900">Passeport</h3>
              <p className="text-sm text-gray-700 mt-1 font-medium">Page d'identification</p>
            </button>
          </div>

          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Non acceptés : Carte d'électeur, Carte eID, Permis de conduire
            </p>
          </div>
        </div>

        {/* Photos des documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Photos des documents</h2>
          <p className="text-sm font-semibold text-red-600 mb-4">
            ⚠️ Les photos doivent être prises directement avec votre caméra.
          </p>
          
          {documentType === 'CNI' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>Recto de la CNI *</label>
                <button
                  type="button"
                  onClick={() => openCamera('front')}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors"
                >
                  {frontImage ? (
                    <div className="relative">
                      <img src={frontImage} alt="Recto CNI" className="w-full h-48 object-cover rounded-lg" />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Camera className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-900">Cliquez pour prendre la photo</p>
                    </div>
                  )}
                </button>
              </div>

              <div>
                <label className={labelClassName}>Verso de la CNI *</label>
                <button
                  type="button"
                  onClick={() => openCamera('back')}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors"
                >
                  {backImage ? (
                    <div className="relative">
                      <img src={backImage} alt="Verso CNI" className="w-full h-48 object-cover rounded-lg" />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Camera className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-900">Cliquez pour prendre la photo</p>
                    </div>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className={labelClassName}>Passeport *</label>
              <button
                type="button"
                onClick={() => openCamera('passport')}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors"
              >
                {passportImage ? (
                  <div className="relative">
                    <img src={passportImage} alt="Passeport" className="w-full h-64 object-cover rounded-lg" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <Camera className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-900">Cliquez pour prendre la photo</p>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Selfie */}
          <div className="mt-6">
            <label className={labelClassName}>Selfie de vérification *</label>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Prenez une photo de vous tenant votre document
            </p>
            <button
              type="button"
              onClick={() => openCamera('selfie')}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors"
            >
              {selfieImage ? (
                <div className="relative">
                  <img src={selfieImage} alt="Selfie" className="w-full h-48 object-cover rounded-lg" />
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <User className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">Cliquez pour prendre le selfie</p>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* SECTION BIOMÉTRIQUE AVEC GUIDAGE IA */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ScanFace className="h-6 w-6 text-blue-600" />
            Photos Biométriques (Face et Profils)
          </h2>
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Prenez 3 photos : face, profil gauche et profil droit. L'IA vous guidera.
          </p>

          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {[
              { type: 'FACE', label: 'Face', imgKey: 'face' as const },
              { type: 'PROFIL_GAUCHE', label: 'Profil gauche', imgKey: 'profilGauche' as const },
              { type: 'PROFIL_DROIT', label: 'Profil droit', imgKey: 'profilDroit' as const },
            ].map((step, index) => (
              <div key={step.type} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    biometricStep === step.type 
                      ? 'bg-blue-600 text-white' 
                      : biometricImages[step.imgKey]
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                  }`}>
                    {biometricImages[step.imgKey] ? (
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

          {/* Message d'erreur biométrique */}
          {biometricError && (
            <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-700">{biometricError}</p>
              </div>
            </div>
          )}

          {/* Zone de capture biométrique */}
          {!isBiometricCameraReady ? (
          <div className="text-center py-8">
            <ScanFace className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-bold mb-4">
              {biometricStep === 'FACE' && 'Prenez une photo de face'}
              {biometricStep === 'PROFIL_GAUCHE' && 'Tournez votre tête vers la gauche'}
              {biometricStep === 'PROFIL_DROIT' && 'Tournez votre tête vers la droite'}
            </p>
            <button
              type="button"
              onClick={startBiometricCamera}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              <Camera className="h-5 w-5" />
              Démarrer la capture
            </button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <video
                ref={biometricVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[350px] object-cover rounded-lg bg-black"
              />

                {/* Guide de cadrage ovale */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-64 border-4 border-white border-opacity-50 rounded-full" />
                </div>

                {/* Guidage IA */}
                {biometricGuidance && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-3 rounded-lg max-w-[90%]">
                    <p className="text-sm font-bold flex items-center gap-2">
                      {biometricStatus === 'CAPTURING' ? (
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      )}
                      {biometricGuidance}
                    </p>
                  </div>
                )}
              </div>

              {/* Boutons de contrôle */}
              <div className="flex justify-center gap-4 mt-4">
                {biometricStatus === 'CAPTURING' && (
                  <button
                    type="button"
                    onClick={captureBiometricPhoto}
                    className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-8 w-8" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetBiometricCapture}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Recommencer
                </button>
              </div>
            </div>
          )}

          {/* Prévisualisation des photos biométriques */}
          {Object.keys(biometricImages).length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {biometricImages.face && (
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Face ✓</p>
                  <img src={biometricImages.face} alt="Face" className="w-full h-28 object-cover rounded-lg" />
                </div>
              )}
              {biometricImages.profilGauche && (
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Profil gauche ✓</p>
                  <img src={biometricImages.profilGauche} alt="Profil gauche" className="w-full h-28 object-cover rounded-lg" />
                </div>
              )}
              {biometricImages.profilDroit && (
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-1">Profil droit ✓</p>
                  <img src={biometricImages.profilDroit} alt="Profil droit" className="w-full h-28 object-cover rounded-lg" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas caché pour la capture biométrique */}
        <canvas ref={biometricCanvasRef} className="hidden" />

        {/* Informations du document */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Informations du document</h2>
          <p className="text-sm font-semibold text-red-600 mb-4">
            ⚠️ Ces informations doivent correspondre EXACTEMENT à celles sur votre document
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>Numéro du document *</label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                className={inputClassName}
                placeholder="Ex: CI1234567"
                style={{ color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className={labelClassName}>Nom *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className={inputClassName}
                placeholder="KOUASSI"
                style={{ color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className={labelClassName}>Prénoms *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className={inputClassName}
                placeholder="Jean Marc"
                style={{ color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className={labelClassName}>Date de naissance *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className={inputClassName}
                style={{ color: '#000000' }}
                required
              />
            </div>
            <div>
              <label className={labelClassName}>Date d'expiration *</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className={inputClassName}
                style={{ color: '#000000' }}
                required
              />
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-colors ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Vérification en cours...
            </span>
          ) : (
            'Soumettre pour vérification'
          )}
        </button>
      </form>
    </div>
  );
}