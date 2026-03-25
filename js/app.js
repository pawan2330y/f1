// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  app.js
//  Main application controller
// ─────────────────────────────────────────────

const APP = {

  state: {
    drivers: [],
    teams: [],
    calendar: [],
    results: [],
    forecast: null,
    currentRace: null,
    initialized: false,
  },

  async init() {
    // Load fallback data immediately so the UI isn't blank
    this.state.drivers  = FALLBACK_DATA.drivers;
    this.state.teams    = FALLBACK_DATA.teams;
    this.state.calendar = FALLBACK_DATA.calendar;
    this.state.results  = FALLBACK_DATA.results;

    // Render with seed data right away
    this.renderAll();

    // Then try to refresh live from OpenF1 in the background
    this.refreshLiveData();
  },

  // ── LIVE DATA REFRESH ─────────────────────

  async refreshLiveData() {
    try {
      // Update API key warning banner
      if (CONFIG.OPENROUTER_API_KEY.includes("PASTE_YOUR_KEY")) {
        document.getElementById("api-banner")?.classList.remove("hidden");
      }

      // Try to get the latest session from OpenF1
      const sessions = await API.getSessions(CONFIG.SEASON);
      if (sessions && sessions.length > 0) {
        // Sessions data is available — could refresh standings here
        console.log(`OpenF1: ${sessions.length} race sessions found for ${CONFIG.SEASON}`);
      }
    } catch (e) {
      console.warn("Live data refresh failed, using seed data", e);
    }
  },

  // ── RENDER ALL PAGES ──────────────────────

  renderAll() {
    // Overview
    const nextRace = this.state.calendar.find(r => r.status === "next");
    UI.renderOverview({
      nextRace,
      standings: { drivers: this.state.drivers, teams: this.state.teams },
      results: this.state.results,
    });

    // Calendar
    UI.renderCalendar(this.state.calendar, this.state.results);

    // Standings tables
    UI.renderDriverStandings(this.state.drivers);
    UI.renderTeamStandings(this.state.teams);

    // History
    UI.renderHistory(this.state.results);

    // Champions page - load in background
    this.loadChampionsForecast();

    this.state.initialized = true;
  },

  // ── OPEN RACE MODAL ───────────────────────

  async openRace(round) {
    const race    = this.state.calendar.find(r => r.round === round);
    const result  = this.state.results.find(r => r.round === round);
    if (!race) return;

    // For completed races, show the actual result
    if (race.status === "done" && result) {
      this.showCompletedRace(race, result);
      return;
    }

    // For upcoming races, fetch weather and run AI prediction
    document.getElementById("race-modal").classList.add("open");
    document.body.style.overflow = "hidden";
    document.getElementById("modal-title").textContent = race.flag + " " + race.name;
    document.getElementById("modal-body").innerHTML = `
      <div class="loading-screen">
        <div class="spinner lg"></div>
        <div class="loading-steps" id="loading-steps">
          <div class="load-step active" id="ls1">Fetching weather from Open-Meteo…</div>
          <div class="load-step" id="ls2">Reading circuit & tyre data…</div>
          <div class="load-step" id="ls3">Sending data to Qwen AI…</div>
          <div class="load-step" id="ls4">Building prediction…</div>
        </div>
      </div>`;

    // Step 1: Weather
    const weather = await API.getWeather(race.name, race.date);
    document.getElementById("ls1").classList.remove("active");
    document.getElementById("ls1").classList.add("done");
    document.getElementById("ls2").classList.add("active");
    await this.delay(300);

    // Step 2: Circuit data (already in memory)
    document.getElementById("ls2").classList.remove("active");
    document.getElementById("ls2").classList.add("done");
    document.getElementById("ls3").classList.add("active");
    await this.delay(200);

    // Step 3: AI Prediction
    const prediction = await PREDICTOR.getPrediction(
      race, weather,
      this.state.drivers,
      this.state.teams,
      this.state.results
    );

    document.getElementById("ls3").classList.remove("active");
    document.getElementById("ls3").classList.add("done");
    document.getElementById("ls4").classList.add("active");
    await this.delay(200);

    // Step 4: Render
    UI.renderRacePrediction(race, weather, prediction);
  },

  showCompletedRace(race, result) {
    const modal = document.getElementById("race-modal");
    const title = document.getElementById("modal-title");
    const body  = document.getElementById("modal-body");

    title.textContent = race.flag + " " + race.name + " — Round " + race.round + " Result";

    const tc = (team) => UI.teamColors[team] || "#888";

    body.innerHTML = `
      <div class="modal-grid">
        <div class="modal-section full-width">
          <div class="section-label">Official race result</div>
          ${result.podium.map(p => `
            <div class="podium-row">
              <span class="pod-pos pos${p.pos}">${p.pos === 1 ? "🥇" : p.pos === 2 ? "🥈" : "🥉"}</span>
              <div class="pod-info">
                <div class="pod-name">${p.driver}</div>
                <div class="pod-team" style="color:${tc(p.team)}">${p.team}</div>
              </div>
            </div>`).join("")}
        </div>
        <div class="modal-section">
          <div class="section-label">Conditions</div>
          <div class="factor-grid">
            <div class="factor-item"><div class="fi-label">Weather</div><div class="fi-val">${result.weather?.condition || "—"}</div></div>
            <div class="factor-item"><div class="fi-label">Temperature</div><div class="fi-val">${result.weather?.tempMax || "—"}°C</div></div>
            <div class="factor-item"><div class="fi-label">Fastest lap</div><div class="fi-val">${result.fastestLap}</div></div>
            <div class="factor-item"><div class="fi-label">Pred. accuracy</div><div class="fi-val">${result.predAccuracy}%</div></div>
          </div>
        </div>
        <div class="modal-section">
          <div class="section-label">Race notes</div>
          <div class="analysis-text">${result.notes}</div>
        </div>
      </div>`;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  // ── CHAMPIONSHIP FORECAST ─────────────────

  async loadChampionsForecast() {
    const remaining = this.state.calendar.filter(r => r.status !== "done").length;
    try {
      const forecast = await PREDICTOR.getChampionshipForecast(
        this.state.drivers, this.state.teams, remaining
      );
      this.state.forecast = forecast;
      UI.renderChampionshipForecast(forecast);
    } catch (e) {
      console.warn("Championship forecast failed", e);
      UI.renderChampionshipForecast(PREDICTOR.getFallbackForecast());
    }
  },

  // ── HELPERS ───────────────────────────────

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); },
};

// ── BOOT ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Wire nav tabs
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => UI.switchTab(tab.dataset.tab));
  });

  // Wire modal close
  document.getElementById("modal-close")?.addEventListener("click", () => UI.closeModal());
  document.getElementById("race-modal")?.addEventListener("click", e => {
    if (e.target.id === "race-modal") UI.closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") UI.closeModal();
  });

  // Start the app
  APP.init();
});