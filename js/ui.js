// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  ui.js
//  All DOM rendering functions
// ─────────────────────────────────────────────

const UI = {

  teamColors: {
    "Mercedes":"#00A19C","Ferrari":"#DC0000","McLaren":"#FF8000",
    "Red Bull":"#3671C6","Haas":"#B6BABD","Alpine":"#FF87BC",
    "RB":"#6692FF","Williams":"#64C4FF","Aston Martin":"#358C75",
    "Audi":"#BB0000","Cadillac":"#CC0033"
  },

  tc(team) { return this.teamColors[team] || "#888"; },

  pct(val) { return Math.round((val || 0) * 100) + "%"; },

  bar(pct, color, height = 5) {
    return `<div class="bar-track" style="height:${height}px">
      <div class="bar-fill" style="width:${Math.round(pct*100)}%;background:${color}"></div>
    </div>`;
  },

  badge(text, type = "gray") {
    return `<span class="badge badge-${type}">${text}</span>`;
  },

  // ── NAVIGATION ────────────────────────────

  switchTab(tabId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    const page = document.getElementById(tabId);
    if (page) page.classList.add("active");
    const tab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    if (tab) tab.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // ── LOADING STATES ─────────────────────────

  showPredictionLoading(show) {
    document.querySelectorAll(".pred-loading").forEach(el => {
      el.style.display = show ? "flex" : "none";
    });
    document.querySelectorAll(".pred-content").forEach(el => {
      el.style.display = show ? "none" : "block";
    });
  },

  setLoading(elementId, text = "Loading...") {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = `<div class="loading-row"><div class="spinner"></div><span>${text}</span></div>`;
  },

  // ── OVERVIEW PAGE ─────────────────────────

  set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  renderOverview(data) {
    const { nextRace, standings } = data;

    this.set("wdc-leader-name", standings.drivers[0]?.name || "—");
    this.set("wdc-leader-pts", (standings.drivers[0]?.pts ?? "—") + " pts");
    this.set("wcc-leader-name", standings.teams[0]?.name || "—");
    this.set("wcc-leader-pts", (standings.teams[0]?.pts ?? "—") + " pts");
    this.set("races-done", FALLBACK_DATA.results.length);
    this.set("races-total", FALLBACK_DATA.calendar.length);

    if (nextRace) {
      this.set("next-race-name", nextRace.flag + " " + nextRace.name);
      this.set("next-race-date", new Date(nextRace.date).toLocaleDateString("en-GB", { day:"numeric", month:"short" }));
    }

    this.renderMiniStandings("overview-wdc", standings.drivers.slice(0,5), "pts", 300, d => this.tc(d.team));
    this.renderMiniStandings("overview-wcc", standings.teams.slice(0,4), "pts", 400, t => this.tc(t.name));
  },

  renderMiniStandings(containerId, items, ptsKey, maxPts, colorFn) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map(item => `
      <div class="mini-row">
        <span class="mini-name">${item.name || item.code}</span>
        <div class="mini-bar-wrap">
          <div class="mini-bar" style="width:${Math.min(100, Math.round((item[ptsKey]/maxPts)*100))}%;background:${colorFn(item)}"></div>
        </div>
        <span class="mini-pts">${item[ptsKey]}</span>
      </div>`).join("");
  },

  // ── RACE CALENDAR ─────────────────────────

  renderCalendar(calendar, results) {
    const completedEl = document.getElementById("completed-races");
    const upcomingEl  = document.getElementById("upcoming-races");
    const completed   = calendar.filter(r => r.status === "done");
    const upcoming    = calendar.filter(r => r.status !== "done");

    if (completedEl) completedEl.innerHTML = completed.map(r => this.raceRowHTML(r, results)).join("") || "<p class='empty-note'>No completed races yet.</p>";
    if (upcomingEl)  upcomingEl.innerHTML  = upcoming.map(r => this.raceRowHTML(r, results)).join("");
  },

  raceRowHTML(race, results) {
    const result = results.find(r => r.round === race.round);
    const isNext = race.status === "next";
    const statusBadge = isNext ? this.badge("Next Race", "red")
                      : race.status === "done" ? this.badge("Completed", "green")
                      : this.badge("Upcoming", "gray");

    const resultSnippet = result ? `
      <div class="race-result-row">
        <span class="res-pos p1">P1</span><span class="res-driver">${result.podium[0].code}</span>
        <span class="res-pos p2">P2</span><span class="res-driver">${result.podium[1].code}</span>
        <span class="res-pos p3">P3</span><span class="res-driver">${result.podium[2].code}</span>
        <span class="res-acc">${result.predAccuracy}% accurate</span>
      </div>` : "";

    return `
      <div class="race-row ${isNext ? "race-row-next" : ""}" onclick="APP.openRace(${race.round})">
        <span class="race-round">R${race.round}</span>
        <span class="race-flag-lg">${race.flag}</span>
        <div class="race-row-info">
          <div class="race-row-name">${race.name}</div>
          <div class="race-row-circuit">${race.circuit}</div>
          ${resultSnippet}
        </div>
        <div class="race-row-right">
          ${statusBadge}
          <span class="race-row-date">${new Date(race.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>
        </div>
      </div>`;
  },

  // ── RACE PREDICTION MODAL ─────────────────

  renderRacePrediction(race, weather, prediction) {
    const modal = document.getElementById("race-modal");
    const title = document.getElementById("modal-title");
    const body  = document.getElementById("modal-body");

    title.textContent = race.flag + " " + race.name + " — Round " + race.round;

    const isFallback = prediction._fallback;
    const conf = prediction.confidenceScore || 0;
    const circuit = FALLBACK_DATA.circuitProfiles[race.name] || {};
    const tyres   = TYRE_DATA[race.name] || { strategy: "1-stop", degradation: "Medium" };

    body.innerHTML = `
      ${isFallback ? `<div class="api-warning">AI prediction unavailable — showing model estimate. Check your OpenRouter API key in config.js</div>` : ""}

      <div class="modal-grid">

        <!-- Weather & Circuit -->
        <div class="modal-section">
          <div class="section-label">Conditions</div>
          <div class="factor-grid">
            <div class="factor-item"><div class="fi-label">Weather</div><div class="fi-val">${weather.condition} · ${weather.tempMax}°C</div></div>
            <div class="factor-item"><div class="fi-label">Rain chance</div><div class="fi-val">${weather.rainProb}%</div></div>
            <div class="factor-item"><div class="fi-label">Tyre strategy</div><div class="fi-val">${tyres.strategy}</div></div>
            <div class="factor-item"><div class="fi-label">Tyre wear</div><div class="fi-val">${tyres.degradation}</div></div>
            <div class="factor-item"><div class="fi-label">SC probability</div><div class="fi-val">${circuit.safetyCarProb || 30}%</div></div>
            <div class="factor-item"><div class="fi-label">Overtaking</div><div class="fi-val">${circuit.overtaking || "Medium"}</div></div>
          </div>
        </div>

        <!-- Podium Prediction -->
        <div class="modal-section">
          <div class="section-label">Predicted podium</div>
          <div class="pred-loading" style="display:none;align-items:center;gap:10px;padding:1rem 0;">
            <div class="spinner"></div><span style="font-size:13px;color:var(--gray-500)">Qwen AI is analysing…</span>
          </div>
          <div class="pred-content">
            ${prediction.podium.map((p, i) => `
              <div class="podium-row">
                <span class="pod-pos pos${p.position}">${p.position === 1 ? "🥇" : p.position === 2 ? "🥈" : "🥉"}</span>
                <div class="pod-info">
                  <div class="pod-name">${p.driver}</div>
                  <div class="pod-team" style="color:${this.tc(p.team)}">${p.team}</div>
                  <div class="pod-reason">${p.reasoning}</div>
                </div>
                <div class="pod-pct">
                  <div class="pod-pct-num">${this.pct(p.winProbability)}</div>
                  ${this.bar(p.winProbability, this.tc(p.team), 4)}
                </div>
              </div>`).join("")}
          </div>
        </div>

        <!-- Analysis -->
        <div class="modal-section full-width">
          <div class="section-label">AI analysis</div>
          <div class="analysis-text">${prediction.overallAnalysis}</div>
        </div>

        <!-- Key Factors -->
        <div class="modal-section">
          <div class="section-label">Key factors</div>
          <ul class="factor-list">
            ${(prediction.keyFactors || []).map(f => `<li>${f}</li>`).join("")}
          </ul>
        </div>

        <!-- Extra intel -->
        <div class="modal-section">
          <div class="section-label">Additional intel</div>
          <div class="factor-grid">
            <div class="factor-item"><div class="fi-label">Weather impact</div><div class="fi-val">${prediction.weatherImpact || "—"}</div></div>
            <div class="factor-item"><div class="fi-label">Upset risk</div><div class="fi-val">${prediction.upsetRisk || "—"}</div></div>
            <div class="factor-item"><div class="fi-label">Fastest lap pick</div><div class="fi-val">${prediction.fastestLap?.driver || "—"} (${this.pct(prediction.fastestLap?.probability)})</div></div>
            <div class="factor-item"><div class="fi-label">Safety car</div><div class="fi-val">${prediction.safetyCarLikely ? "Likely" : "Unlikely"}</div></div>
          </div>
          <div class="champ-impact">
            <span class="ci-label">Championship impact</span>
            <span class="ci-text">${prediction.wdcImpact || "—"}</span>
          </div>
        </div>

        <!-- Confidence -->
        <div class="modal-section full-width">
          <div class="section-label">Model confidence</div>
          <div class="conf-bar-wrap">
            <div class="conf-bar" style="width:${conf}%;background:${conf > 75 ? '#22c55e' : conf > 60 ? '#f59e0b' : '#ef4444'}"></div>
          </div>
          <div class="conf-labels"><span>${conf}%</span><span style="color:var(--gray-400);font-size:11px;">Powered by Qwen · ${prediction._model || CONFIG.QWEN_MODEL} · via OpenRouter</span></div>
        </div>

      </div>`;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  closeModal() {
    document.getElementById("race-modal").classList.remove("open");
    document.body.style.overflow = "";
  },

  // ── DRIVER STANDINGS ──────────────────────

  renderDriverStandings(drivers) {
    const tbody = document.getElementById("driver-tbody");
    if (!tbody) return;
    tbody.innerHTML = drivers.map(d => `
      <tr>
        <td><span class="pos-num ${d.pos <= 3 ? 'top3' : ''}">${d.pos}</span></td>
        <td>
          <div class="driver-cell">
            <span class="team-dot" style="background:${this.tc(d.team)}"></span>
            <div>
              <div class="d-name"><span class="d-code">${d.code}</span> ${d.name}</div>
              <div class="d-team">${d.team}</div>
            </div>
          </div>
        </td>
        <td><span class="mono">${d.nationality}</span></td>
        <td>
          <div class="score-cell">
            <span class="mono">${d.mentality}</span>
            ${this.bar(d.mentality / 10, "#6366f1", 3)}
          </div>
        </td>
        <td>
          <div class="score-cell">
            <span class="mono">${d.wet}</span>
            ${this.bar(d.wet / 10, "#3b82f6", 3)}
          </div>
        </td>
        <td class="pts-cell">${d.pts}</td>
      </tr>`).join("");
  },

  // ── CONSTRUCTOR STANDINGS ─────────────────

  renderTeamStandings(teams) {
    const tbody = document.getElementById("team-tbody");
    if (!tbody) return;
    tbody.innerHTML = teams.map(t => `
      <tr>
        <td><span class="pos-num ${t.pos <= 3 ? 'top3' : ''}">${t.pos}</span></td>
        <td>
          <div class="team-name-cell">
            <span class="team-dot lg" style="background:${this.tc(t.name)}"></span>
            ${t.name}
          </div>
        </td>
        <td class="mono" style="font-size:12px;color:var(--gray-500)">${t.engine}</td>
        <td>
          <div class="score-cell">
            <span class="mono">${t.pace}</span>
            ${this.bar(t.pace / 10, this.tc(t.name), 3)}
          </div>
        </td>
        <td>
          <div class="score-cell">
            <span class="mono">${t.reliability}</span>
            ${this.bar(t.reliability / 10, "#22c55e", 3)}
          </div>
        </td>
        <td>
          <div class="score-cell">
            <span class="mono">${t.strategy}</span>
            ${this.bar(t.strategy / 10, "#f59e0b", 3)}
          </div>
        </td>
        <td class="pts-cell">${t.pts}</td>
      </tr>`).join("");
  },

  // ── CHAMPIONSHIP FORECAST ─────────────────

  renderChampionshipForecast(forecast) {
    const wdcEl = document.getElementById("wdc-forecast");
    const wccEl = document.getElementById("wcc-forecast");
    if (!forecast || !wdcEl) return;

    const { wdc, wcc } = forecast;

    wdcEl.innerHTML = `
      <div class="champ-leader-row">
        <div class="champ-avatar">${(wdc.favourite || "").split(" ").map(n=>n[0]).join("")}</div>
        <div class="champ-leader-info">
          <div class="champ-leader-name">${wdc.favourite}</div>
          <div class="champ-leader-team" style="color:${this.tc(wdc.favouriteTeam)}">${wdc.favouriteTeam}</div>
        </div>
        <div class="champ-pct-block">
          <div class="champ-pct-num">${Math.round((wdc.probability||0)*100)}%</div>
          <div class="champ-pct-label">championship probability</div>
        </div>
      </div>
      <div class="champ-bar-full">
        <div class="champ-bar-fill" style="width:${Math.round((wdc.probability||0)*100)}%;background:${this.tc(wdc.favouriteTeam)}"></div>
      </div>
      <div class="champ-analysis">${wdc.analysis}</div>
      <div class="section-label" style="margin-top:1rem">Contenders</div>
      ${(wdc.contenders||[]).map(c => `
        <div class="contender-row">
          <span class="con-name">${c.driver}</span>
          <span class="con-team" style="color:${this.tc(c.team)}">${c.team}</span>
          <span class="con-gap">-${c.gap}pts</span>
          <div class="con-bar-wrap">${this.bar(c.probability, this.tc(c.team), 4)}</div>
          <span class="con-pct">${Math.round(c.probability*100)}%</span>
        </div>`).join("")}
      <div class="section-label" style="margin-top:1rem">Key risks</div>
      <ul class="factor-list">${(wdc.keyRisks||[]).map(r=>`<li>${r}</li>`).join("")}</ul>`;

    wccEl.innerHTML = `
      <div class="champ-leader-row">
        <div class="champ-avatar team-av" style="background:${this.tc(wcc.favourite)}20;color:${this.tc(wcc.favourite)}">${(wcc.favourite||"").substring(0,3)}</div>
        <div class="champ-leader-info">
          <div class="champ-leader-name">${wcc.favourite}</div>
          <div class="champ-leader-team">Constructor</div>
        </div>
        <div class="champ-pct-block">
          <div class="champ-pct-num">${Math.round((wcc.probability||0)*100)}%</div>
          <div class="champ-pct-label">championship probability</div>
        </div>
      </div>
      <div class="champ-bar-full">
        <div class="champ-bar-fill" style="width:${Math.round((wcc.probability||0)*100)}%;background:${this.tc(wcc.favourite)}"></div>
      </div>
      <div class="champ-analysis">${wcc.analysis}</div>
      <div class="section-label" style="margin-top:1rem">Contenders</div>
      ${(wcc.contenders||[]).map(c => `
        <div class="contender-row">
          <span class="con-name" style="color:${this.tc(c.team)}">${c.team}</span>
          <span class="con-gap">-${c.gap}pts</span>
          <div class="con-bar-wrap">${this.bar(c.probability, this.tc(c.team), 4)}</div>
          <span class="con-pct">${Math.round(c.probability*100)}%</span>
        </div>`).join("")}
      <div class="section-label" style="margin-top:1rem">Key risks</div>
      <ul class="factor-list">${(wcc.keyRisks||[]).map(r=>`<li>${r}</li>`).join("")}</ul>`;
  },

  // ── RACE HISTORY ──────────────────────────

  renderHistory(results) {
    const tbody = document.getElementById("history-tbody");
    if (!tbody) return;
    tbody.innerHTML = [...results].reverse().map(r => `
      <tr>
        <td><span class="mono">R${r.round}</span></td>
        <td>
          <div class="race-name-cell">${r.flag} ${r.name}</div>
          <div class="race-circuit-cell">${r.circuit}</div>
        </td>
        <td><span class="mono" style="font-size:11px">${new Date(r.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span></td>
        <td>
          <div class="podium-inline">
            ${r.podium.map(p => `<span class="pi-pos pos${p.pos} mono">${p.code}</span>`).join(" ")}
          </div>
        </td>
        <td><span class="badge badge-${r.predAccuracy >= 80 ? 'green' : r.predAccuracy >= 65 ? 'amber' : 'gray'}">${r.predAccuracy}%</span></td>
        <td style="font-size:12px;color:var(--gray-500);max-width:200px">${r.notes}</td>
      </tr>`).join("");
  },
};