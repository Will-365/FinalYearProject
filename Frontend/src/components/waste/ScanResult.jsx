import { binColorMap, wasteTypeConfig } from '@/utils/formatters';
import { WasteTypeBadge } from '@/components/ui/Badge';
import { Progress } from '@/app/components/ui/progress';
import { Info, Lightbulb } from 'lucide-react';

export function ScanResult({ result, onRequestCollection }) {
  if (!result) return null;

  const typeConfig = wasteTypeConfig[result.wasteType] || wasteTypeConfig.unknown;
  const binClass = binColorMap[result.binColor] || binColorMap.green;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-start gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${binClass} text-2xl shadow-sm`}>
          🗑️
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <WasteTypeBadge type={result.wasteType} />
            {result.binLabel && (
              <span className="text-sm text-slate-500">{result.binLabel}</span>
            )}
          </div>
          <p className="text-lg font-bold text-slate-900">{result.recommendation}</p>
        </div>
      </div>

      {/* Points info callout — scan does NOT award points */}
      <div className="mb-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">✅ Classified as {result.wasteType}.</span>{' '}
          Points are awarded after your collection is approved by admin — not on scan.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-slate-500">Confidence</span>
          <span className="font-semibold text-slate-900">{result.confidence}%</span>
        </div>
        <Progress value={result.confidence} className="h-2" />
      </div>

      {result.detectedItems?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {result.detectedItems.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {result.reasoning && (
        <p className="mb-4 text-sm text-slate-600">{result.reasoning}</p>
      )}

      {result.tips && (
        <div className="mb-5 flex gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm text-green-900">{result.tips}</p>
        </div>
      )}

      {onRequestCollection && (
        <button
          type="button"
          onClick={() => onRequestCollection(result)}
          className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md"
        >
          Request Collection for This Waste →
        </button>
      )}
    </div>
  );
}
