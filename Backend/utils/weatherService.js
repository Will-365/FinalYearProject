/**
 * Local weather for compost turning advisory (Open-Meteo — no API key).
 * Coordinates for Kigali districts / Rwanda.
 */
const LOCATIONS = {
  kigali: { lat: -1.9403, lon: 30.0619, label: 'Kigali City' },
  gasabo: { lat: -1.9365, lon: 30.0823, label: 'Gasabo' },
  kicukiro: { lat: -1.989, lon: 30.112, label: 'Kicukiro' },
  nyarugenge: { lat: -1.97, lon: 30.04, label: 'Nyarugenge' },
  musanze: { lat: -1.499, lon: 29.634, label: 'Musanze' },
  huye: { lat: -2.607, lon: 29.737, label: 'Huye' },
};

const resolveLocation = (district) => {
  if (!district) return LOCATIONS.kigali;
  const key = district.toLowerCase().replace(/\s+/g, '');
  return LOCATIONS[key] || LOCATIONS.kigali;
};

/** Score ambient conditions for compost pile turning (0–100). */
const scoreTurningConditions = ({ temp, humidity, wind, precipitation, hour }) => {
  let score = 100;
  const reasons = [];

  if (temp < 15) {
    score -= 35;
    reasons.push('Too cold for effective aeration');
  } else if (temp > 32) {
    score -= 25;
    reasons.push('High heat — turn early morning or evening');
  } else if (temp >= 20 && temp <= 28) {
    reasons.push('Ideal temperature range');
  }

  if (humidity > 85) {
    score -= 30;
    reasons.push('Very humid — risk of anaerobic pockets');
  } else if (humidity < 35) {
    score -= 15;
    reasons.push('Dry air — moisten pile after turning');
  }

  if (wind > 25) {
    score -= 20;
    reasons.push('Strong wind may dry the pile too fast');
  }

  if (precipitation > 0.5) {
    score -= 40;
    reasons.push('Rain expected — wait for dry window');
  } else if (precipitation > 0.1) {
    score -= 15;
    reasons.push('Light rain possible');
  }

  // Prefer morning (6–10) or late afternoon (16–18) for manual turning
  if (hour >= 11 && hour <= 14 && temp > 26) {
    score -= 10;
    reasons.push('Midday heat — better before 10am or after 4pm');
  }

  score = Math.max(0, Math.min(100, score));

  let recommendation = 'optimal';
  if (score >= 75) recommendation = 'optimal';
  else if (score >= 55) recommendation = 'good';
  else if (score >= 35) recommendation = 'fair';
  else recommendation = 'wait';

  return { score, recommendation, reasons: [...new Set(reasons)] };
};

export const fetchTurningAdvisory = async (district = 'Kigali') => {
  const loc = resolveLocation(district);

  const params = new URLSearchParams({
    latitude: String(loc.lat),
    longitude: String(loc.lon),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
    hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
    timezone: 'Africa/Kigali',
    forecast_days: '2',
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather service unavailable');

  const data = await res.json();
  const now = new Date();
  const hour = now.getHours();

  const current = {
    temp: Math.round(data.current?.temperature_2m ?? 0),
    humidity: Math.round(data.current?.relative_humidity_2m ?? 0),
    wind: Math.round(data.current?.wind_speed_10m ?? 0),
    precipitation: data.current?.precipitation ?? 0,
    time: data.current?.time || now.toISOString(),
  };

  const currentEval = scoreTurningConditions({ ...current, hour });

  const hourly = (data.hourly?.time || []).slice(0, 48).map((time, i) => {
    const t = new Date(time);
    const entry = {
      time,
      label: t.toLocaleTimeString('en-RW', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(data.hourly.temperature_2m[i]),
      humidity: Math.round(data.hourly.relative_humidity_2m[i]),
      wind: Math.round(data.hourly.wind_speed_10m[i]),
      precipitation: data.hourly.precipitation[i],
    };
    const evalResult = scoreTurningConditions({ ...entry, hour: t.getHours() });
    return { ...entry, score: evalResult.score, recommendation: evalResult.recommendation };
  });

  const bestWindows = hourly
    .filter((h) => h.score >= 55 && h.precipitation < 0.2)
    .slice(0, 6);

  const batchesAwaitingTurn = null; // filled by controller if needed

  const messages = {
    optimal: 'Conditions are ideal — proceed with compost turning now.',
    good: 'Good conditions for turning. Complete within the next few hours.',
    fair: 'Turning is possible but not ideal. Monitor moisture after turning.',
    wait: 'Hold turning — wait for a better weather window below.',
  };

  return {
    location: { district: loc.label, lat: loc.lat, lon: loc.lon },
    current,
    score: currentEval.score,
    recommendation: currentEval.recommendation,
    reasons: currentEval.reasons,
    message: messages[currentEval.recommendation],
    bestWindows,
    fetchedAt: new Date().toISOString(),
    batchesAwaitingTurn,
  };
};
