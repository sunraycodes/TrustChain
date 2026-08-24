import React, { useRef, useState, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, ScanLine, Zap } from 'lucide-react';

export default function QRScanner({ onScan, disabled = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      setLastScannedCode(code.data);
      onScan(code.data);
      stopCamera();
      return;
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [onScan, stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setLastScannedCode(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', true);
        await videoRef.current.play();
        setScanning(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device. Use the text input below instead.');
      } else {
        setCameraError(`Camera error: ${err.message}. Use the text input below instead.`);
      }
    }
  }, [scanFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-3">
      {/* Scanner Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
        {scanning ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-56 object-cover"
              muted
              playsInline
            />
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner markers */}
              <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
              {/* Scanning line animation */}
              <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2" />
              {/* Status label */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/80 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Scanning for QR Code…</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2 px-4">
            {lastScannedCode ? (
              <>
                <Zap className="w-8 h-8 text-emerald-400" />
                <p className="text-xs text-emerald-400 font-semibold text-center">
                  Scanned: <span className="font-mono">{lastScannedCode}</span>
                </p>
              </>
            ) : cameraError ? (
              <>
                <CameraOff className="w-8 h-8 text-rose-400" />
                <p className="text-xs text-rose-300 text-center">{cameraError}</p>
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 opacity-40" />
                <p className="text-xs">Tap "Start Scanner" to activate camera QR scanning</p>
              </>
            )}
          </div>
        )}
        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Scanner Controls */}
      <div className="flex items-center justify-center space-x-2">
        {scanning ? (
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:bg-rose-500/30 transition-all"
          >
            <CameraOff className="w-3.5 h-3.5" />
            <span>Stop Scanner</span>
          </button>
        ) : (
          <button
            onClick={startCamera}
            disabled={disabled}
            className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{lastScannedCode ? 'Scan Again' : 'Start Scanner'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
