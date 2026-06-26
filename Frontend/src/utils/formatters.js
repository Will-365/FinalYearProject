import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return dateStr;
  return format(d, 'EEE, d MMM yyyy');
};

export const formatDateWithSlot = (dateStr, slot) => {
  const datePart = formatDate(dateStr);
  if (!slot) return datePart;
  const slotLabel =
    slot === 'morning'
      ? 'Morning'
      : slot === 'afternoon'
        ? 'Afternoon'
        : slot === 'evening'
          ? 'Evening'
          : slot;
  return `${datePart} • ${slotLabel}`;
};

export const wasteTypeConfig = {
  organic: { label: 'Organic', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🌿' },
  inorganic: { label: 'Inorganic', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🗑️' },
  hazardous: { label: 'Hazardous', color: 'bg-red-100 text-red-800 border-red-200', icon: '⚠️' },
  recyclable: { label: 'Recyclable', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '♻️' },
  unknown: { label: 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '❓' },
  mixed: { label: 'Mixed', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '📦' },
};

export const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600' },
};

export const binColorMap = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  gray: 'bg-slate-400',
};

export const categoryIcons = {
  food: '🍽️',
  transport: '🚌',
  utilities: '💡',
  shopping: '🛒',
  health: '🏥',
  other: '🎁',
};

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const validateImageFile = (file) => {
  if (!file) return 'Please select an image';
  if (!file.type.startsWith('image/')) return 'File must be an image (JPEG, PNG, or WebP)';
  if (file.size > 5 * 1024 * 1024) return 'Image must be under 5MB';
  return null;
};
