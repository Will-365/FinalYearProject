import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, ImageIcon, ScanLine, SwitchCamera } from 'lucide-react';
import { validateImageFile } from '@/utils/formatters';

/**
 * Live camera + upload for waste scanning.
 * onAutoScan(preview) — called after camera capture so parent can scan immediately.
 */
export function ScanUploader({ preview, onPreviewChange, onError, onAutoScan, scanning = false }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [capturing, setCapturing] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
    setCameraStarting(false);
  };

  useEffect(() => () => stopCamera(), []);

  const attachStream = async (mode) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera is not supported in this browser. Please upload an image instead.');
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      throw new Error('Camera requires a secure connection (HTTPS). Please upload an image instead.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: mode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
    }
  };

  const openCamera = async () => {
    setCameraStarting(true);
    onError?.('');
    try {
      // Prefer rear camera first; fall back to any camera
      try {
        await attachStream(facingMode);
      } catch {
        await attachStream('user');
        setFacingMode('user');
      }
      setCameraOpen(true);
    } catch (err) {
      stopCamera();
      const name = err?.name || '';
      let msg = err?.message || 'Unable to open camera';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Allow camera access in your browser, or upload an image.';
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device. Please upload an image instead.';
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        msg = 'Camera is in use by another app. Close it and try again, or upload an image.';
      }
      onError?.(msg);
    } finally {
      setCameraStarting(false);
    }
  };

  const switchCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setFacingMode(next);
    try {
      await attachStream(next);
    } catch {
      onError?.('Could not switch camera. Try the other camera or upload an image.');
    }
  };

  const handleFile = (file, { autoScan = false } = {}) => {
    const err = validateImageFile(file);
    if (err) {
      onError?.(err);
      return;
    }
    const url = URL.createObjectURL(file);
    const next = { file, url, mimeType: file.type || 'image/jpeg' };
    onPreviewChange(next);
    if (autoScan) onAutoScan?.(next);
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      onError?.('Camera is not ready yet. Wait a moment and try again.');
      return;
    }
    setCapturing(true);
    onError?.('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not capture frame');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to capture photo'))),
          'image/jpeg',
          0.92
        );
      });

      if (blob.size < 1024) {
        onError?.('Captured image is too small or blank. Point at the waste and try again.');
        return;
      }
      if (blob.size > 5 * 1024 * 1024) {
        onError?.('Captured image is too large. Try again with better lighting or distance.');
        return;
      }

      const file = new File([blob], `waste-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      // Close camera as soon as we have a frame, then scan
      stopCamera();
      handleFile(file, { autoScan: true });
    } catch (err) {
      onError?.(err?.message || 'Failed to capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const clearPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    onPreviewChange(null);
  };

  // Live camera viewfinder
  if (cameraOpen) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-h-[420px] w-full object-cover"
          />
          {/* Scan frame guide */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-48 rounded-2xl border-2 border-green-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-white/90 drop-shadow">
            Center the waste in the frame, then scan
          </p>
          <button
            type="button"
            onClick={stopCamera}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Close camera"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={switchCamera}
            className="absolute left-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={stopCamera}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={capturing || scanning}
            onClick={captureFrame}
            className="flex-[1.4] inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <ScanLine className="h-4 w-4" />
            {capturing ? 'Capturing…' : 'Scan Waste'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <ImageIcon className="h-8 w-8 text-green-600" />
          </div>
          <p className="mb-1 font-semibold text-slate-900">Capture or upload waste photo</p>
          <p className="mb-6 text-sm text-slate-500">JPEG, PNG, or WebP · Max 5MB</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              disabled={cameraStarting || scanning}
              onClick={openCamera}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {cameraStarting ? 'Opening camera…' : 'Open Camera'}
            </button>
            <button
              type="button"
              disabled={scanning}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img
            src={preview.url}
            alt="Waste preview"
            className="max-h-80 w-full object-cover"
          />
          {!scanning && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-600 shadow hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file, { autoScan: false });
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function ScanLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6 h-24 w-24">
        <span className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-green-400/40" />
        <span className="absolute inset-4 rounded-full bg-green-600 shadow-lg shadow-green-600/30" />
      </div>
      <p className="text-lg font-semibold text-slate-900">Analyzing your waste…</p>
      <p className="mt-1 text-sm text-slate-500">Our AI is identifying materials and bin type</p>
    </div>
  );
}
