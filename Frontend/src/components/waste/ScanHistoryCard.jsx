import { formatDate } from '@/utils/formatters';
import { WasteTypeBadge } from '@/components/ui/Badge';

export function ScanHistoryCard({ scan, onClick }) {
  const id = scan._id || scan.scanId || scan.id;

  return (
    <button
      type="button"
      onClick={() => onClick?.(scan)}
      className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {scan.wasteType === 'organic' ? '🌿' : scan.wasteType === 'recyclable' ? '♻️' : '🗑️'}
          </span>
          <div>
            <WasteTypeBadge type={scan.wasteType} />
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(scan.createdAt || scan.scannedAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-green-600">+{scan.pointsEarned || 5} pts</p>
          <p className="text-xs text-slate-400">{scan.confidence}% match</p>
        </div>
      </div>
      {scan.recommendation && (
        <p className="mt-2 line-clamp-1 text-sm text-slate-600">{scan.recommendation}</p>
      )}
    </button>
  );
}
