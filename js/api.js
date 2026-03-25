// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  api.js
//  All live data from OpenF1 + Open-Meteo
//  No hardcoded race results or standings
// ─────────────────────────────────────────────

const API = {

  BASE: "https://api.openf1.org/v1",

  // ── GENERIC FETCH WITH ERROR HANDLING ────

  async get(path) {
    try {
      const res = await fetch(`${API.BASE}${path}`);
      if (!res.ok) throw new Error(`OpenF1 ${res.status}: ${path}`);
      return await res.json();
    } catch (e) {
      console.warn("OpenF1 fetch failed:", path, e.message);
      return null;
    }
  },

  // ── MEETINGS (race calendar) ──────────────
  // Returns all race weekends for a given year

  async getMeetings(year = CONFIG.SEASON) {
    const data = await this.get(`/meetings?year=${year}`);
    if (!data || !data.length) return null;
    return data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  },

  // ── SESSIONS for a meeting ────────────────

  async getSessions(meetingKey) {
    return await this.get(`/sessions?meeting_key=${meetingKey}`);
  },

  // Get all race sessions for a year
  async getRaceSessions(year = CONFIG.SEASON) {
    const data = await this.get(`/sessions?year=${year}&session_type=Race`);
    if (!data || !data.length) return null;
    return data.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  },

  // ── RACE RESULT for a session ─────────────
  // /session_result gives final classified positions

  async getSessionResult(sessionKey) {
    const data = await this.get(`/session_result?session_key=${sessionKey}`);
    if (!data || !data.length) return null;
    return data.sort((a, b) => (a.position || 99) - (b.position || 99));
  },

  // ── DRIVER INFO for a session ─────────────

  async getDrivers(sessionKey) {
    const data = await this.get(`/drivers?session_key=${sessionKey}`);
    if (!data || !data.length) return null;
    // Key by driver_number for easy lookup
    const map = {};
    data.forEach(d => { map[d.driver_number] = d; });
    return map;
  },

  // ── CHAMPIONSHIP STANDINGS ────────────────
  // /championship_drivers returns points_current & position_current
  // Use the latest available race session_key for current standings

  async getDriverChampionship(sessionKey) {
    const data = await this.get(`/championship_drivers?session_key=${sessionKey}`);
    if (!data || !data.length) return null;
    return data.sort((a, b) => (a.position_current || 99) - (b.position_current || 99));
  },

  async getConstructorChampionship(sessionKey) {
    const data = await this.get(`/championship_teams?session_key=${sessionKey}`);
    if (!data || !data.length) return null;
    return data.sort((a, b) => (a.position_current || 99) - (b.position_current || 99));
  },

  // ── STINTS (tyre data) ────────────────────

  async getStints(sessionKey) {
    return await this.get(`/stints?session_key=${sessionKey}`);
  },

  // ── WEATHER at a circuit ──────────────────
  // Open-Meteo — free, no key needed

  async getWeather(raceName, raceDate) {
    const circuit = CONFIG.CIRCUITS[raceName];
    if (!circuit) return STATIC.defaultWeather;
    try {
      const date = (raceDate || new Date().toISOString()).split("T")[0];
      const url = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${circuit.lat}&longitude=${circuit.lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max` +
        `&start_date=${date}&end_date=${date}` +
        `&timezone=${encodeURIComponent(circuit.timezone)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API ${res.status}`);
      const data = await res.json();
      const rainMm   = data.daily?.precipitation_sum?.[0] ?? 0;
      const rainProb = data.daily?.precipitation_probability_max?.[0] ?? 10;
      return {
        tempMax:   data.daily?.temperature_2m_max?.[0]  ?? 22,
        tempMin:   data.daily?.temperature_2m_min?.[0]  ?? 15,
        rainMm,
        rainProb,
        windMax:   data.daily?.windspeed_10m_max?.[0]   ?? 15,
        condition: rainMm > 2 ? "Wet" : rainProb > 50 ? "Damp risk" : rainProb > 25 ? "Possible rain" : "Dry",
      };
    } catch (e) {
      console.warn("Weather fetch failed:", e.message);
      return STATIC.defaultWeather;
    }
  },

  // ── FASTEST LAP in a session ──────────────

  async getFastestLap(sessionKey) {
    const data = await this.get(`/laps?session_key=${sessionKey}&is_pit_out_lap=false`);
    if (!data || !data.length) return null;
    const valid = data.filter(l => l.lap_duration && l.lap_duration > 0);
    if (!valid.length) return null;
    return valid.reduce((best, l) => l.lap_duration < best.lap_duration ? l : best);
  },
};


// ─────────────────────────────────────────────
//  DATA LOADER
//  Orchestrates all API calls and builds the
//  complete app state from live data
// ─────────────────────────────────────────────

const LOADER = {

  // Master load — called once on boot
  async loadAll() {
    console.log("Loading live F1 data...");

    // 1. Get full calendar
    const meetings = await API.getMeetings(CONFIG.SEASON);
    if (!meetings) {
      console.warn("Meetings unavailable, using static calendar");
      return this.buildFromStatic();
    }

    // 2. Get all completed race sessions
    const raceSessions = await API.getRaceSessions(CONFIG.SEASON);
    const completedSessions = (raceSessions || []).filter(s =>
      s.date_end && new Date(s.date_end) < new Date()
    );

    const lastSession = completedSessions[completedSessions.length - 1];

    // 3. Fetch championship standings from last completed session
    let driverStandings = null;
    let teamStandings = null;
    let driverMap = {};

    if (lastSession) {
      const [champDrivers, champTeams, drivers] = await Promise.all([
        API.getDriverChampionship(lastSession.session_key),
        API.getConstructorChampionship(lastSession.session_key),
        API.getDrivers(lastSession.session_key),
      ]);
      if (drivers) driverMap = drivers;
      if (champDrivers) driverStandings = this.parseDriverStandings(champDrivers, driverMap);
      if (champTeams)   teamStandings   = this.parseTeamStandings(champTeams);
    }

    // 4. Build race results for completed rounds
    const results = await this.loadResults(completedSessions, meetings);

    // 5. Build calendar (merge meetings with session status)
    const calendar = this.buildCalendar(meetings, raceSessions || []);

    return {
      drivers:  driverStandings  || STATIC.drivers,
      teams:    teamStandings    || STATIC.teams,
      calendar,
      results,
      lastSessionKey: lastSession?.session_key || null,
    };
  },

  // Build race results from all completed sessions
  async loadResults(completedSessions, meetings) {
    const results = [];

    // Load in parallel — but cap at 5 most recent to avoid rate limiting
    const toLoad = completedSessions.slice(-5);

    await Promise.all(toLoad.map(async (session) => {
      const meeting = meetings.find(m => m.meeting_key === session.meeting_key);
      if (!meeting) return;

      const [result, drivers] = await Promise.all([
        API.getSessionResult(session.session_key),
        API.getDrivers(session.session_key),
      ]);

      if (!result || result.length < 3) return;

      const podium = result.slice(0, 3).map(r => {
        const d = drivers?.[r.driver_number] || {};
        return {
          pos: r.position,
          driver: d.full_name || `#${r.driver_number}`,
          team: d.team_name || "Unknown",
          code: d.name_acronym || String(r.driver_number),
        };
      });

      // Find round number by matching meeting order
      const round = meetings.findIndex(m => m.meeting_key === meeting.meeting_key) + 1;
      const flag = STATIC.countryFlags[meeting.country_name] || "🏁";

      results.push({
        round,
        name: meeting.meeting_name,
        flag,
        circuit: meeting.circuit_short_name || meeting.location,
        date: session.date_start?.split("T")[0] || "",
        sessionKey: session.session_key,
        podium,
        fastestLap: "—",
        weather: STATIC.defaultWeather,
        notes: `Round ${round} — ${meeting.location}`,
        predAccuracy: null, // not hardcoded — will be calculated after predictions
      });
    }));

    return results.sort((a, b) => a.round - b.round);
  },

  // Build calendar from meetings + sessions
  buildCalendar(meetings, raceSessions) {
    const now = new Date();
    const calendar = [];

    meetings.forEach((meeting, idx) => {
      const raceSession = raceSessions.find(s =>
        s.meeting_key === meeting.meeting_key && s.session_type === "Race"
      );
      const raceDate = raceSession?.date_start || meeting.date_start;
      const raceEnd  = raceSession?.date_end;
      const flag = STATIC.countryFlags[meeting.country_name] || "🏁";

      let status = "upcoming";
      if (raceEnd && new Date(raceEnd) < now) status = "done";
      else if (raceDate && new Date(raceDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
               && new Date(raceDate) > now) status = "next";
      // Mark the very next upcoming race as "next" if none found in 7-day window
      if (status === "upcoming" && calendar.filter(c => c.status === "next").length === 0
          && raceDate && new Date(raceDate) > now) status = "next";

      calendar.push({
        round:   idx + 1,
        name:    meeting.meeting_name,
        flag,
        circuit: meeting.circuit_short_name || meeting.location,
        date:    raceDate?.split("T")[0] || "",
        status,
        meetingKey:  meeting.meeting_key,
        sessionKey:  raceSession?.session_key || null,
        location:    meeting.location,
        countryName: meeting.country_name,
      });
    });

    // Ensure exactly one "next"
    const nextIdx = calendar.findIndex(c => c.status === "next");
    if (nextIdx === -1) {
      const firstUpcoming = calendar.find(c => c.status === "upcoming");
      if (firstUpcoming) firstUpcoming.status = "next";
    }

    return calendar;
  },

  // Parse OpenF1 championship_drivers into our driver format
  parseDriverStandings(champData, driverMap) {
    return champData.map((c, idx) => {
      const d = driverMap[c.driver_number] || {};
      const teamName = d.team_name || "Unknown";
      return {
        pos:         c.position_current || idx + 1,
        code:        d.name_acronym || String(c.driver_number),
        name:        d.full_name || `Driver #${c.driver_number}`,
        team:        teamName,
        pts:         c.points_current || 0,
        nationality: d.country_code || "—",
        number:      c.driver_number,
        // Mentality & wet scores kept as static — these are your team's analysis inputs
        mentality:   STATIC.driverScores[d.name_acronym]?.mentality || 7.5,
        wet:         STATIC.driverScores[d.name_acronym]?.wet       || 7.5,
        starts:      STATIC.driverScores[d.name_acronym]?.starts    || 0,
      };
    });
  },

  // Parse OpenF1 championship_teams into our team format
  parseTeamStandings(champData) {
    return champData.map((c, idx) => {
      const teamName = c.team_name || `Team ${idx + 1}`;
      const meta = STATIC.teamMeta[teamName] || STATIC.teamMeta["Default"];
      return {
        pos:         c.position_current || idx + 1,
        name:        teamName,
        pts:         c.points_current || 0,
        color:       meta.color,
        engine:      meta.engine,
        reliability: meta.reliability,
        strategy:    meta.strategy,
        pace:        meta.pace,
      };
    });
  },

  // Fallback: build state entirely from STATIC data
  buildFromStatic() {
    return {
      drivers:  STATIC.drivers,
      teams:    STATIC.teams,
      calendar: STATIC.calendar,
      results:  STATIC.results,
      lastSessionKey: null,
    };
  },
};