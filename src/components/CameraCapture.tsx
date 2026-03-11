import { useEffect, useRef, useState } from 'react';
import { Camera, Square, Circle, Pause, Play, Power } from 'lucide-react';
import { insertPlantImage, insertPlantAnalysis } from '../lib/api';
import { analyzeRicePlantImage } from '../utils/imageAnalysis';

interface CameraCaptureProps {
  onCapture: () => void;
  onCameraStart?: () => void;
  onCaptureStop?: () => void;
}

export function CameraCapture({ onCapture, onCameraStart, onCaptureStop }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAutoCaptureOn, setIsAutoCaptureOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const clearIntervals = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsAutoCaptureOn(false);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    clearIntervals();
    setIsStreaming(false);
    setCountdown(5);
    onCaptureStop?.();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setIsStarting(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        onCameraStart?.();
      } else {
        setError('Camera element not ready. Please try again.');
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const startAutoCapture = () => {
    clearIntervals();
    setCountdown(5);
    setIsAutoCaptureOn(true);

    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 5 : prev - 1));
    }, 1000);

    intervalRef.current = window.setInterval(() => captureImage(), 5000);
  };

  const pauseAutoCapture = () => {
    clearIntervals();
    setCountdown(5);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setError('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.5);

      const imageRecord = await insertPlantImage(imageData, new Date().toISOString());
      const analysis = await analyzeRicePlantImage(imageData);

      await insertPlantAnalysis({
        image_id: imageRecord.id,
        health_status: analysis.healthStatus,
        health_score: analysis.healthScore,
        green_percentage: analysis.greenPercentage,
        yellow_percentage: analysis.yellowPercentage,
        brown_percentage: analysis.brownPercentage,
        harvest_ready: analysis.harvestReady,
        recommendations: analysis.recommendations,
      });

      onCapture();
    } catch (err) {
      setError(`Capture error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative h-[90.5%] overflow-hidden rounded-2xl border border-emerald-200">
      {/* Video/canvas always mounted so refs exist when starting camera */}
      <div
        className={
          isStreaming
            ? 'relative aspect-video w-full overflow-hidden rounded-t-2xl bg-emerald-50'
            : 'absolute left-0 top-0 h-px w-px overflow-hidden opacity-0 [pointer-events:none]'
        }
      >
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {isStreaming && (
          <>
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 shadow">
              <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-800">LIVE</span>
            </div>
            {isAutoCaptureOn && (
              <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-2 shadow">
                <span className="text-sm font-semibold text-emerald-800">
                  Next capture in {countdown}s
                </span>
              </div>
            )}
            {!isAutoCaptureOn && (
              <div className="absolute left-3 top-3 rounded-lg bg-amber-100 px-3 py-2 shadow">
                <span className="text-sm font-semibold text-amber-800">Auto-capture paused</span>
              </div>
            )}
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            )}
          </>
        )}
      </div>

      {error ? (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-amber-50 p-8">
          <Camera className="mb-4 h-14 w-14 text-amber-500" />
          <p className="mb-6 text-center text-amber-800">{error}</p>
          <button
            onClick={startCamera}
            disabled={isStarting}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-70"
          >
            <Power className="h-5 w-5" />
            {isStarting ? 'Starting…' : 'Try Again'}
          </button>
        </div>
      ) : !isStreaming ? (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-emerald-50/80 p-8">
          <div className="mb-4 rounded-full bg-emerald-100 p-4">
            <Camera className="h-12 w-12 text-emerald-600" />
          </div>
          <p className="mb-2 text-center font-medium text-emerald-800">Camera is off</p>
          <p className="mb-6 text-center text-sm text-emerald-600">Click below to start monitoring</p>
          <button
            onClick={startCamera}
            disabled={isStarting}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-70"
          >
            <Power className="h-5 w-5" />
            {isStarting ? 'Starting…' : 'Start Camera'}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-4">
          <button
            onClick={captureImage}
            disabled={!isStreaming || isCapturing}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            title="Capture now"
          >
            <Square className="h-5 w-5" />
            Capture Now
          </button>
          {isAutoCaptureOn ? (
            <button
              onClick={pauseAutoCapture}
              disabled={!isStreaming || isCapturing}
              className="flex items-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-2.5 font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Pause auto-capture"
            >
              <Pause className="h-5 w-5" />
              Pause Auto-Capture
            </button>
          ) : (
            <button
              onClick={startAutoCapture}
              disabled={!isStreaming || isCapturing}
              className="flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-50 px-5 py-2.5 font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Resume auto-capture"
            >
              <Play className="h-5 w-5" />
              Resume Auto-Capture
            </button>
          )}
          <button
            onClick={stopCamera}
            disabled={!isStreaming}
            className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-2.5 font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            title="Stop camera"
          >
            <Power className="h-5 w-5" />
            Stop Camera
          </button>
        </div>
      )}
    </div>
  );
}
