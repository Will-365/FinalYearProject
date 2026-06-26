import { useRef } from 'react';
import { Camera, Upload, X, ImageIcon } from 'lucide-react';
import { validateImageFile } from '@/utils/formatters';

export function ScanUploader({ preview, onPreviewChange, onError }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (file) => {
    const err = validateImageFile(file);
    if (err) {
      onError?.(err);
      return;
    }
    const url = URL.createObjectURL(file);
    onPreviewChange({ file, url, mimeType: file.type || 'image/jpeg' });
  };

  const clearPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    onPreviewChange(null);
  };

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
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md"
            >
              <Camera className="h-4 w-4" />
              Open Camera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
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
          <button
            type="button"
            onClick={clearPreview}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-600 shadow hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
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
