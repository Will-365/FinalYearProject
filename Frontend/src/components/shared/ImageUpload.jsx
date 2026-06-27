import { useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function ImageUpload({ onImageSelect, preview, label = 'Upload Image', maxSizeMB = 5 }) {
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be under ${maxSizeMB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onImageSelect(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !preview && fileRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl transition-all ${
        preview ? 'border-green-300' : 'border-gray-200 cursor-pointer hover:border-green-400 hover:bg-green-50'
      }`}
    >
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onImageSelect(null); }}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            className="absolute bottom-2 right-2 text-xs bg-black/60 text-white rounded-lg px-3 py-1 hover:bg-black/80"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400 mt-1">Click or drag & drop · Max {maxSizeMB}MB</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white">
            <Upload className="h-3.5 w-3.5" /> Browse
          </div>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function MultiImageUpload({ images = [], onImagesChange, maxImages = 5 }) {
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    if (images.length >= maxImages) { toast.error(`Max ${maxImages} images`); return; }
    const reader = new FileReader();
    reader.onload = (e) => onImagesChange([...images, e.target.result]);
    reader.readAsDataURL(file);
  };

  const remove = (idx) => onImagesChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border">
            <img src={src} className="w-full h-full object-cover" alt="" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
            >
              ×
            </button>
            {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-green-600 text-white">Main</span>}
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-green-400 hover:bg-green-50 transition-all text-gray-400"
          >
            <Upload className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
