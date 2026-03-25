// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  config.js
//  Paste your OpenRouter key here before deploying
// ─────────────────────────────────────────────

const CONFIG = {
  // Get your free key at https://openrouter.ai/keys
  OPENROUTER_API_KEY: "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",

  // Free Qwen models via OpenRouter (first is tried, second is fallback)
  QWEN_MODEL: "qwen/qwen3-235b-a22b:free",
  QWEN_MODEL_FALLBACK: "qwen/qwen3-8b:free",

  // API base URLs (all free, no key needed except OpenRouter)
  OPENF1_BASE: "https://api.openf1.org/v1",
  OPENMETEO_BASE: "https://api.open-meteo.com/v1",

  // Current F1 season
  SEASON: 2026,

  // Circuit coordinates for weather fetching
  CIRCUITS: {
    "Japanese Grand Prix":     { lat: 34.8431, lon: 136.5414, timezone: "Asia/Tokyo" },
    "Bahrain Grand Prix":      { lat: 26.0325, lon: 50.5106,  timezone: "Asia/Bahrain" },
    "Saudi Arabian Grand Prix":{ lat: 21.6319, lon: 39.1044,  timezone: "Asia/Riyadh" },
    "Australian Grand Prix":   { lat: -37.8497, lon: 144.9680, timezone: "Australia/Melbourne" },
    "Chinese Grand Prix":      { lat: 31.3389, lon: 121.2197, timezone: "Asia/Shanghai" },
    "Miami Grand Prix":        { lat: 25.9581, lon: -80.2389, timezone: "America/New_York" },
    "Emilia Romagna Grand Prix":{ lat: 44.3439, lon: 11.7167, timezone: "Europe/Rome" },
    "Monaco Grand Prix":       { lat: 43.7347, lon: 7.4205,   timezone: "Europe/Monaco" },
    "Spanish Grand Prix":      { lat: 41.5700, lon: 2.2611,   timezone: "Europe/Madrid" },
    "Canadian Grand Prix":     { lat: 45.5000, lon: -73.5228, timezone: "America/Toronto" },
    "Austrian Grand Prix":     { lat: 47.2197, lon: 14.7647,  timezone: "Europe/Vienna" },
    "British Grand Prix":      { lat: 52.0786, lon: -1.0169,  timezone: "Europe/London" },
    "Belgian Grand Prix":      { lat: 50.4372, lon: 5.9714,   timezone: "Europe/Brussels" },
    "Hungarian Grand Prix":    { lat: 47.5789, lon: 19.2486,  timezone: "Europe/Budapest" },
    "Dutch Grand Prix":        { lat: 52.3888, lon: 4.5409,   timezone: "Europe/Amsterdam" },
    "Italian Grand Prix":      { lat: 45.6156, lon: 9.2811,   timezone: "Europe/Rome" },
    "Azerbaijan Grand Prix":   { lat: 40.3725, lon: 49.8533,  timezone: "Asia/Baku" },
    "Singapore Grand Prix":    { lat: 1.2914,  lon: 103.8639, timezone: "Asia/Singapore" },
    "United States Grand Prix":{ lat: 30.1328, lon: -97.6411, timezone: "America/Chicago" },
    "Mexico City Grand Prix":  { lat: 19.4042, lon: -99.0907, timezone: "America/Mexico_City" },
    "São Paulo Grand Prix":    { lat: -23.7036, lon: -46.6997, timezone: "America/Sao_Paulo" },
    "Las Vegas Grand Prix":    { lat: 36.1699, lon: -115.1398, timezone: "America/Los_Angeles" },
    "Qatar Grand Prix":        { lat: 25.4900, lon: 51.4542,  timezone: "Asia/Qatar" },
    "Abu Dhabi Grand Prix":    { lat: 24.4672, lon: 54.6031,  timezone: "Asia/Dubai" },
  }
};