import { useCallback, useEffect, useState } from 'react';
import { adminWasteIntakeService } from '@/services/adminService';
import { ThermometerSun, Wind, Droplets, CloudRain, Clock, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const DISTRICTS = ['Kigali', 'Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Huye'];

const RECOMMEND_STYLES = {
  optimal: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle2 },
  good: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: CheckCircle2 },
  fair: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: AlertTriangle },
  wait: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: AlertTriangle },
};

export function TurningWeatherWidget({ compact = false, defaultDistrict = 'Gasabo' }) {
  const [district, setDistrict] = useState(defaultDistrict);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await adminWasteIntakeService.getTurningAdvisory({ district });
      setData(res.data || res);
    } catch (err) {
      setError(err.message || 'Could not load weather');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [district]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(true), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const style = RECOMMEND_STYLES[data?.recommendation] || RECOMMEND_STYLES.fair;
  const StatusIcon = style.icon;

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Loading local weather…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        {error}
        <button type="button" className="ml-2 underline" onClick={() => load()}>Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`rounded-xl border p-4 ${style.bg} ${compact ? '' : 'shadow-sm'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ThermometerSun className={`h-5 w-5 ${style.text}`} />
          <div>
            <p className={`font-semibold text-sm ${style.text}`}>Compost turning advisory</p>
            <p className="text-xs text-gray-600">{data.location?.district} · live Open-Meteo</p>
          </div>
        </div>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-full sm:w-36 h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="rounded-lg bg-white/80 px-2.5 py-2 text-center">
          <p className="text-lg font-bold text-gray-900">{data.current?.temp}°C</p>
          <p className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5"><ThermometerSun className="h-3 w-3" /> Temp</p>
        </div>
        <div className="rounded-lg bg-white/80 px-2.5 py-2 text-center">
          <p className="text-lg font-bold text-gray-900">{data.current?.humidity}%</p>
          <p className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5"><Droplets className="h-3 w-3" /> Humidity</p>
        </div>
        <div className="rounded-lg bg-white/80 px-2.5 py-2 text-center">
          <p className="text-lg font-bold text-gray-900">{data.current?.wind}</p>
          <p className="text-[10px] text-gray-500 flex items-center justify-center gap-0.5"><Wind className="h-3 w-3" /> km/h wind</p>
        </div>
        <div className="rounded-lg bg-white/80 px-2.5 py-2 text-center">
          <p className="text-lg font-bold text-gray-900">{data.score}</p>
          <p className="text-[10px] text-gray-500">Turn score</p>
        </div>
      </div>

      <div className={`flex items-start gap-2 rounded-lg px-3 py-2 bg-white/70 ${style.text}`}>
        <StatusIcon className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold capitalize">{data.recommendation} — {data.message}</p>
          {data.reasons?.length > 0 && (
            <ul className="mt-1 text-xs opacity-90 list-disc pl-4">
              {data.reasons.slice(0, 3).map((r) => <li key={r}>{r}</li>)}
            </ul>
          )}
        </div>
      </div>

      {!compact && data.bestWindows?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Best windows to turn
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.bestWindows.map((w) => (
              <span key={w.time} className="text-[11px] font-medium bg-white/90 border border-gray-200 rounded-full px-2.5 py-1">
                {w.label} · {w.temp}°C · score {w.score}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.batchesAwaitingTurn > 0 && (
        <p className="mt-2 text-xs text-gray-600">
          <CloudRain className="h-3 w-3 inline mr-1" />
          {data.batchesAwaitingTurn} organic batch{data.batchesAwaitingTurn > 1 ? 'es' : ''} in sorting/turning in database
        </p>
      )}
    </div>
  );
}
