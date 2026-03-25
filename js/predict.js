// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  · predict.js
//  Prediction engine using Google Gemini API
//  Endpoint: generativelanguage.googleapis.com
// ─────────────────────────────────────────────

const PREDICTOR = {

  // ── BUILD THE RACE PREDICTION PROMPT ─────

  buildPrompt(race, weather, drivers, teams, recentResults) {
    const circuit = FALLBACK_DATA.circuitProfiles[race.name] || {};
    const tyres   = TYRE_DATA[race.name] || { compounds:["C2","C3","C4"], strategy:"1-stop", degradation:"Medium" };

    const topDrivers = drivers.slice(0, 10).map(d =>
      `  - ${d.name} (${d.team}): ${d.pts}pts | Mentality: ${d.mentality}/10 | Wet: ${d.wet}/10 | Starts: ${d.starts}`
    ).join("\n");

    const teamPace = teams.slice(0, 6).map(t =>
      `  - ${t.name}: Pace ${t.pace}/10 | Reliability ${t.reliability}/10 | Strategy ${t.strategy}/10`
    ).join("\n");

    const history = recentResults.slice(-3).map(r =>
      `  - R${r.round} ${r.name}: 1st ${r.podium[0].driver} | 2nd ${r.podium[1].driver} | 3rd ${r.podium[2].driver}`
    ).join("\n");

    return `You are an expert Formula 1 race analyst. Analyse the data below and return a race prediction as a single valid JSON object. No markdown, no explanation, just the JSON.

RACE: ${race.name} Round ${race.round}
Circuit: ${race.circuit} | Type: ${circuit.type || "Mixed"} | Laps: ${circuit.laps || 55}
Overtaking: ${circuit.overtaking || "Medium"} | Safety car probability: ${circuit.safetyCarProb || 30}%

WEATHER: ${weather.condition} | Temp: ${weather.tempMax}C | Rain chance: ${weather.rainProb}% | Wind: ${weather.windMax}km/h

TYRES: ${tyres.compounds.join(", ")} | Strategy: ${tyres.strategy} | Wear: ${tyres.degradation}

DRIVER STANDINGS (top 10):
${topDrivers}

TEAM PERFORMANCE:
${teamPace}

RECENT RESULTS:
${history}

Return this exact JSON structure (numbers must be real decimals, not 0.00):
{
  "podium": [
    { "position": 1, "driver": "Full Name", "team": "Team", "winProbability": 0.38, "reasoning": "2-3 sentence reasoning" },
    { "position": 2, "driver": "Full Name", "team": "Team", "winProbability": 0.21, "reasoning": "2-3 sentence reasoning" },
    { "position": 3, "driver": "Full Name", "team": "Team", "winProbability": 0.15, "reasoning": "2-3 sentence reasoning" }
  ],
  "fastestLap": { "driver": "Full Name", "probability": 0.35 },
  "safetyCarLikely": true,
  "keyFactors": ["factor 1", "factor 2", "factor 3", "factor 4"],
  "weatherImpact": "Low/Medium/High - brief explanation",
  "tyreStrategy": "brief optimal strategy description",
  "upsetRisk": "Low/Medium/High - who could surprise and why",
  "overallAnalysis": "3-4 sentence narrative summarising the prediction",
  "wdcImpact": "one sentence on championship impact",
  "confidenceScore": 78
}`;
  },

  // ── SHARED GEMINI FETCH HELPER ────────────

  async callGemini(prompt, maxTokens = 1200, temperature = 0.4) {
    const tryModel = async (modelId) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          },
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { msg = JSON.parse(text)?.error?.message || msg; } catch {}
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      let parsed;
      try { parsed = JSON.parse(text); } catch {
        throw new Error("Invalid response from Gemini");
      }

      // Extract text content from Gemini response structure
      let content = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Strip any accidental markdown fences
      content = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      if (!content) throw new Error("Empty response from Gemini");
      return content;
    };

    try {
      return await tryModel(CONFIG.GEMINI_MODEL);
    } catch (e) {
      // Retry with fallback model on rate limit or server error
      if (e.status === 429 || e.status === 503 || e.status === 500) {
        console.warn(`Primary model failed (${e.status}), retrying with fallback`);
        return await tryModel(CONFIG.GEMINI_MODEL_FALLBACK);
      }
      throw e;
    }
  },

  // ── RACE PREDICTION ───────────────────────

  async getPrediction(race, weather, drivers, teams, recentResults) {
    const cacheKey = `pred_${race.round}_${race.date}`;
    const cached = CACHE.get(cacheKey);
    if (cached) return cached;

    const prompt = this.buildPrompt(race, weather, drivers, teams, recentResults);

    try {
      UI.showPredictionLoading(true);
      const content = await this.callGemini(prompt, 1200, 0.4);
      const prediction = JSON.parse(content);
      prediction._generatedAt = new Date().toISOString();
      prediction._model = CONFIG.GEMINI_MODEL;
      CACHE.set(cacheKey, prediction);
      return prediction;
    } catch (e) {
      console.error("Prediction failed:", e);
      return this.getFallbackPrediction(race, e.message);
    } finally {
      UI.showPredictionLoading(false);
    }
  },

  // ── CHAMPIONSHIP FORECAST ─────────────────

  async getChampionshipForecast(drivers, teams, remainingRaces) {
    const cacheKey = `champ_forecast_r${FALLBACK_DATA.results.length}`;
    const cached = CACHE.get(cacheKey);
    if (cached) return cached;

    const prompt = `You are an F1 championship probability analyst. Return a forecast as a single valid JSON object. No markdown, no explanation, just JSON.

DRIVER STANDINGS:
${drivers.slice(0,8).map(d => `${d.pos}. ${d.name} (${d.team}) - ${d.pts} pts`).join("\n")}

CONSTRUCTOR STANDINGS:
${teams.slice(0,5).map(t => `${t.pos}. ${t.name} - ${t.pts} pts`).join("\n")}

SEASON: ${FALLBACK_DATA.results.length} of 22 races done | ${remainingRaces} remaining | ${remainingRaces * 25} points still available

TEAM PERFORMANCE:
${teams.slice(0,5).map(t => `${t.name}: Pace ${t.pace}/10 | Reliability ${t.reliability}/10`).join("\n")}

Return this exact JSON (probabilities must sum to 1.0 within each section):
{
  "wdc": {
    "favourite": "Driver Full Name",
    "favouriteTeam": "Team Name",
    "probability": 0.72,
    "contenders": [
      { "driver": "Name", "team": "Team", "probability": 0.18, "gap": 4 },
      { "driver": "Name", "team": "Team", "probability": 0.07, "gap": 17 },
      { "driver": "Name", "team": "Team", "probability": 0.03, "gap": 18 }
    ],
    "analysis": "3-4 sentence narrative about the WDC picture",
    "keyRisks": ["risk 1", "risk 2", "risk 3"]
  },
  "wcc": {
    "favourite": "Constructor Name",
    "probability": 0.81,
    "contenders": [
      { "team": "Name", "probability": 0.14, "gap": 31 },
      { "team": "Name", "probability": 0.05, "gap": 80 }
    ],
    "analysis": "3-4 sentence narrative about the WCC picture",
    "keyRisks": ["risk 1", "risk 2"]
  }
}`;

    try {
      const content = await this.callGemini(prompt, 900, 0.3);
      const forecast = JSON.parse(content);
      CACHE.set(cacheKey, forecast);
      return forecast;
    } catch (e) {
      console.error("Championship forecast failed:", e);
      return this.getFallbackForecast();
    }
  },

  // ── FALLBACK DATA (shown when API is unavailable) ──

  getFallbackPrediction(race, errorMsg) {
    return {
      _error: errorMsg,
      _fallback: true,
      podium: [
        { position:1, driver:"George Russell",  team:"Mercedes", winProbability:0.38, reasoning:"Mercedes pace advantage at high-speed circuits based on 2026 season form." },
        { position:2, driver:"Kimi Antonelli",  team:"Mercedes", winProbability:0.21, reasoning:"Strong internal battle; Antonelli's China win shows he can lead Mercedes." },
        { position:3, driver:"Charles Leclerc", team:"Ferrari",  winProbability:0.15, reasoning:"Ferrari best of the rest; Leclerc's qualifying ability key at this venue." },
      ],
      fastestLap: { driver:"George Russell", probability:0.35 },
      safetyCarLikely: false,
      keyFactors: ["Mercedes car pace", "Weather conditions", "Tyre strategy", "Safety car timing"],
      weatherImpact: "Low - Dry conditions expected",
      tyreStrategy: "1-stop medium to hard",
      upsetRisk: "Medium - Rain could mix up the order",
      overallAnalysis: "Based on 2026 season form, Mercedes holds the performance advantage. Russell's consistency and the W17's all-round pace make him the clear favourite. Ferrari will push hard on strategy.",
      wdcImpact: "A Russell win extends his championship lead; an Antonelli win closes the gap to zero.",
      confidenceScore: 72,
    };
  },

  getFallbackForecast() {
    return {
      wdc: {
        favourite: "George Russell", favouriteTeam: "Mercedes", probability: 0.72,
        contenders: [
          { driver:"Kimi Antonelli",  team:"Mercedes", probability:0.18, gap:4  },
          { driver:"Charles Leclerc", team:"Ferrari",  probability:0.07, gap:17 },
          { driver:"Lewis Hamilton",  team:"Ferrari",  probability:0.03, gap:18 },
        ],
        analysis: "Russell holds a slim but meaningful points lead backed by the fastest car on the grid. With 20 races remaining, the championship is his to lose — but Antonelli's maiden win in China signals a genuine internal threat.",
        keyRisks: ["Antonelli momentum after China win", "McLaren reliability improving", "Rain weekends neutralising car advantage"],
      },
      wcc: {
        favourite: "Mercedes", probability: 0.81,
        contenders: [
          { team:"Ferrari",  probability:0.14, gap:31 },
          { team:"McLaren",  probability:0.05, gap:80 },
        ],
        analysis: "Mercedes' 31-point lead over Ferrari is already substantial after just two rounds. Back-to-back 1-2 finishes signal a dominant car that could mirror their historic periods of dominance.",
        keyRisks: ["McLaren double DNF was a fluke - their pace is real", "Ferrari's development rate through the season"],
      },
    };
  },
};