// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  app.js
//  Main app controller — all data from OpenF1
// ─────────────────────────────────────────────

const APP = {

  state: {
    drivers:        [],
    teams:          [],
    calendar:       [],
    results:        [],
    forecast:       null,
    lastSessionKey: null,
    initialized:    false,
    loading:        true,
  },

  async init() {
    // Show skeleton loading state immediately
    this.showSkeleton();

    // Check API key
    if (CONFIG.GEMINI_API_KEY.includes("PASTE_YOUR_GEMINI_KEY")) {
      const banner = document.getElementById("api-banner");
      if (banner) banner.style.display = "block";
    }

    try {
      // Load all live data from OpenF1
      const data = await LOADER.loadAll();

      this.state.drivers        = data.drivers;
      this.state.teams          = data.teams;
      this.state.calendar       = data.calendar;
      this.state.results        = data.results;
      this.state.lastSessionKey = data.lastSessionKey;
      this.state.loading        = false;

      // Render everything
      this.renderAll();
      console.log(`Loaded: ${this.state.calendar.length} races, ${this.state.drivers.length} drivers, ${this.state.results.length} results`);

    } catch (e) {
      console.error("Data load failed, using static fallback:", e);
      this.state.drivers  = STATIC.drivers;
      this.state.teams    = STATIC.teams;
      this.state.calendar = STATIC.calendar;
      this.state.results  = STATIC.results;
      this.state.loading  = false;
      this.renderAll();
    }
  },

  showSkeleton() {
    const skeletonRow = `<div class="skeleton-row"></div>`;
    ["driver-tbody","team-tbody","history-tbody"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = Array(5).fill(`<tr><td colspan="7">${skeletonRow}</td></tr>`).join("");
    });
    ["completed-races","upcoming-races"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = Array(3).fill(`<div class="race-row">${skeletonRow}</div>`).join("");
    });
  },

  // ── RENDER ALL PAGES ──────────────────────

  renderAll() {
    const nextRace = this.state.calendar.find(r => r.status === "next");

    try { UI.renderOverview({ nextRace, standings: { drivers: this.state.drivers, teams: this.state.teams } }); }
    catch(e) { console.error("renderOverview:", e); }

    try { UI.renderCalendar(this.state.calendar, this.state.results); }
    catch(e) { console.error("renderCalendar:", e); }

    try { UI.renderDriverStandings(this.state.drivers); }
    catch(e) { console.error("renderDriverStandings:", e); }

    try { UI.renderTeamStandings(this.state.teams); }
    catch(e) { console.error("renderTeamStandings:", e); }

    try { UI.renderHistory(this.state.results); }
    catch(e) { console.error("renderHistory:", e); }

    this.loadChampionsForecast();
    this.state.initialized = true;
  },

  // ── OPEN RACE MODAL ───────────────────────

  async openRace(round) {
    const race   = this.state.calendar.find(r => r.round === round);
    const result = this.state.results.find(r => r.round === round);
    if (!race) return;

    // Completed race — show result
    if (race.status === "done" && result) {
      this.showCompletedRace(race, result);
      return;
    }

    // Upcoming — fetch weather + run AI prediction
    document.getElementById("race-modal").classList.add("open");
    document.body.style.overflow = "hidden";
    document.getElementById("modal-title").textContent = race.flag + " " + race.name;
    document.getElementById("modal-body").innerHTML = `
      <div class="loading-screen">
        <div class="spinner lg"></div>
        <div class="loading-steps">
          <div class="load-step active" id="ls1">Fetching weather from Open-Meteo...</div>
          <div class="load-step" id="ls2">Reading circuit and tyre data...</div>
          <div class="load-step" id="ls3">Sending data to Gemini AI...</div>
          <div class="load-step" id="ls4">Building prediction...</div>
        </div>
      </div>`;

    const step = (n) => {
      document.getElementById(`ls${n-1}`)?.classList.replace("active","done");
      document.getElementById(`ls${n}`)?.classList.add("active");
    };

    const weather = await API.getWeather(race.name, race.date);
    step(2); await this.delay(200);
    step(3);

    const prediction = await PREDICTOR.getPrediction(
      race, weather,
      this.state.drivers,
      this.state.teams,
      this.state.results
    );
    step(4); await this.delay(150);

    UI.renderRacePrediction(race, weather, prediction);
  },

  showCompletedRace(race, result) {
    const modal = document.getElementById("race-modal");
    document.getElementById("modal-title").textContent =
      race.flag + " " + race.name + " — Round " + race.round + " Result";

    const tc = t => (STATIC.teamMeta[t] || STATIC.teamMeta["Default"]).color;

    document.getElementById("modal-body").innerHTML = `
      <div class="modal-grid">
        <div class="modal-section full-width">
          <div class="section-label">Official race result</div>
          ${result.podium.map(p => `
            <div class="podium-row">
              <span class="pod-pos pos${p.pos}">${p.pos===1?"🥇":p.pos===2?"🥈":"🥉"}</span>
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
            <div class="factor-item"><div class="fi-label">Fastest lap</div><div class="fi-val">${result.fastestLap || "—"}</div></div>
            <div class="factor-item"><div class="fi-label">Pred. accuracy</div><div class="fi-val">${result.predAccuracy ? result.predAccuracy + "%" : "Pending"}</div></div>
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
      console.error("Championship forecast error:", e);
      UI.renderChampionshipForecast(PREDICTOR.getFallbackForecast());
    }
  },

  delay(ms) { return new Promise(r => setTimeout(r, ms)); },
};

// ── BOOT ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => UI.switchTab(tab.dataset.tab));
  });
  document.getElementById("modal-close")?.addEventListener("click", () => UI.closeModal());
  document.getElementById("race-modal")?.addEventListener("click", e => {
    if (e.target.id === "race-modal") UI.closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") UI.closeModal();
  });
  APP.init();
});