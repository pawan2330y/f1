// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  api.js
//  Fetches live data from OpenF1 & Open-Meteo
// ─────────────────────────────────────────────

const API = {

  // ── OPENF1 ────────────────────────────────

  async getDriverStandings() {
    try {
      // OpenF1 gives us session data; we reconstruct standings from race results
      const res = await fetch(`${CONFIG.OPENF1_BASE}/drivers?session_key=latest`);
      const drivers = await res.json();
      return drivers;
    } catch (e) {
      console.warn("OpenF1 drivers fetch failed, using cache", e);
      return CACHE.drivers || FALLBACK_DATA.drivers;
    }
  },

  async getSessions(year = CONFIG.SEASON) {
    try {
      const res = await fetch(`${CONFIG.OPENF1_BASE}/sessions?year=${year}&session_type=Race`);
      const sessions = await res.json();
      return sessions;
    } catch (e) {
      console.warn("OpenF1 sessions fetch failed", e);
      return FALLBACK_DATA.sessions;
    }
  },

  async getRaceResults(sessionKey) {
    try {
      const [positions, drivers] = await Promise.all([
        fetch(`${CONFIG.OPENF1_BASE}/position?session_key=${sessionKey}`).then(r => r.json()),
        fetch(`${CONFIG.OPENF1_BASE}/drivers?session_key=${sessionKey}`).then(r => r.json()),
      ]);
      // Build a map of driver_number -> driver info
      const driverMap = {};
      drivers.forEach(d => { driverMap[d.driver_number] = d; });
      // Get final positions (last position entry per driver)
      const finalPos = {};
      positions.forEach(p => {
        if (!finalPos[p.driver_number] || p.date > finalPos[p.driver_number].date) {
          finalPos[p.driver_number] = p;
        }
      });
      return Object.values(finalPos)
        .sort((a, b) => a.position - b.position)
        .map(p => ({
          position: p.position,
          driver_number: p.driver_number,
          driver: driverMap[p.driver_number] || {},
        }));
    } catch (e) {
      console.warn("Race results fetch failed", e);
      return [];
    }
  },

  async getNextSession() {
    try {
      const res = await fetch(`${CONFIG.OPENF1_BASE}/sessions?year=${CONFIG.SEASON}&session_type=Race`);
      const sessions = await res.json();
      const now = new Date();
      const upcoming = sessions
        .filter(s => new Date(s.date_start) > now)
        .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
      return upcoming[0] || null;
    } catch (e) {
      console.warn("Next session fetch failed", e);
      return FALLBACK_DATA.nextSession;
    }
  },

  async getDriversForSession(sessionKey) {
    try {
      const res = await fetch(`${CONFIG.OPENF1_BASE}/drivers?session_key=${sessionKey}`);
      return await res.json();
    } catch (e) {
      return FALLBACK_DATA.drivers;
    }
  },

  async getLapTimes(sessionKey, driverNumber) {
    try {
      const res = await fetch(`${CONFIG.OPENF1_BASE}/laps?session_key=${sessionKey}&driver_number=${driverNumber}`);
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getTyreStints(sessionKey) {
    try {
      const res = await fetch(`${CONFIG.OPENF1_BASE}/stints?session_key=${sessionKey}`);
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getCarData(sessionKey) {
    try {
      const res = await fetch(`${CONFIG.OPENF1_BASE}/car_data?session_key=${sessionKey}&speed>=300`);
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  // ── OPEN-METEO ────────────────────────────

  async getWeather(raceName, raceDate) {
    const circuit = CONFIG.CIRCUITS[raceName];
    if (!circuit) return FALLBACK_DATA.weather;
    try {
      const date = raceDate ? raceDate.split("T")[0] : new Date().toISOString().split("T")[0];
      const url = `${CONFIG.OPENMETEO_BASE}/forecast?` +
        `latitude=${circuit.lat}&longitude=${circuit.lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max` +
        `&hourly=temperature_2m,precipitation_probability,windspeed_10m,weathercode` +
        `&start_date=${date}&end_date=${date}` +
        `&timezone=${encodeURIComponent(circuit.timezone)}`;
      const res = await fetch(url);
      const data = await res.json();
      return {
        tempMax: data.daily?.temperature_2m_max?.[0] ?? 22,
        tempMin: data.daily?.temperature_2m_min?.[0] ?? 15,
        rainMm: data.daily?.precipitation_sum?.[0] ?? 0,
        rainProb: data.daily?.precipitation_probability_max?.[0] ?? 10,
        windMax: data.daily?.windspeed_10m_max?.[0] ?? 15,
        condition: data.daily?.precipitation_sum?.[0] > 1 ? "Wet" :
                   data.daily?.precipitation_probability_max?.[0] > 40 ? "Damp risk" : "Dry",
      };
    } catch (e) {
      console.warn("Weather fetch failed", e);
      return FALLBACK_DATA.weather;
    }
  },

  // ── RACE SCHEDULE (static 2026 calendar) ─

  getCalendar() {
    return FALLBACK_DATA.calendar;
  },
};

// ── LOCAL CACHE ───────────────────────────────
const CACHE = {
  drivers: null,
  standings: null,
  weather: {},
  predictions: {},
  set(key, val) { this[key] = val; localStorage.setItem("f1_" + key, JSON.stringify(val)); },
  get(key) {
    if (this[key]) return this[key];
    try { return JSON.parse(localStorage.getItem("f1_" + key)); } catch { return null; }
  }
};