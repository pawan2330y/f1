// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  predict.js
//  Qwen AI prediction engine via OpenRouter
// ─────────────────────────────────────────────

const PREDICTOR = {

  // ── BUILD THE PREDICTION PROMPT ───────────

  buildPrompt(race, weather, drivers, teams, recentResults) {
    const circuit = FALLBACK_DATA.circuitProfiles[race.name] || {};
    const tyres = TYRE_DATA[race.name] || { compounds:["C2","C3","C4"], strategy:"1-stop", degradation:"Medium" };

    const topDrivers = drivers.slice(0, 10).map(d =>
      `  - ${d.name} (${d.team}) — ${d.pts}pts | Mentality: ${d.mentality}/10 | Wet: ${d.wet}/10 | Exp: ${d.starts} starts`
    ).join("\n");

    const teamPace = teams.slice(0, 6).map(t =>
      `  - ${t.name}: Pace ${t.pace}/10 | Reliability ${t.reliability}/10 | Strategy ${t.strategy}/10`
    ).join("\n");

    const history = recentResults.slice(-3).map(r =>
      `  - R${r.round} ${r.name}: 1st ${r.podium[0].driver} | 2nd ${r.podium[1].driver} | 3rd ${r.podium[2].driver} | Model accuracy: ${r.predAccuracy}%`
    ).join("\n");

    return `You are an expert Formula 1 race analyst and prediction model. Analyze the following data and generate a detailed prediction for the upcoming race.

## RACE: ${race.name} — Round ${race.round}
Circuit: ${race.circuit}
Date: ${race.date}
Laps: ${circuit.laps || "~55"} | Circuit type: ${circuit.type || "Mixed"}
DRS zones: ${circuit.drsZones || 2} | Overtaking potential: ${circuit.overtaking || "Medium"}
Safety car probability: ${circuit.safetyCarProb || 30}%
Lap record: ${circuit.lapRecord || "N/A"}

## WEATHER CONDITIONS
Condition: ${weather.condition}
Temperature: ${weather.tempMax}°C (max) / ${weather.tempMin}°C (min)
Rain probability: ${weather.rainProb}%
Rain total: ${weather.rainMm}mm
Wind: ${weather.windMax} km/h max

## TYRE COMPOUNDS AVAILABLE
Compounds: ${tyres.compounds.join(", ")}
Expected strategy: ${tyres.strategy}
Tyre degradation level: ${tyres.degradation}

## CURRENT DRIVER STANDINGS (Top 10)
${topDrivers}

## TEAM PERFORMANCE SCORES
${teamPace}

## RECENT RACE RESULTS
${history}

## PREDICTION TASK
Generate a detailed race prediction in the following EXACT JSON format. No extra text before or after, just the JSON:

{
  "podium": [
    { "position": 1, "driver": "Full Name", "team": "Team Name", "winProbability": 0.00, "reasoning": "2-3 sentence specific reasoning" },
    { "position": 2, "driver": "Full Name", "team": "Team Name", "winProbability": 0.00, "reasoning": "2-3 sentence specific reasoning" },
    { "position": 3, "driver": "Full Name", "team": "Team Name", "winProbability": 0.00, "reasoning": "2-3 sentence specific reasoning" }
  ],
  "fastestLap": { "driver": "Full Name", "probability": 0.00 },
  "safetyCarLikely": true,
  "keyFactors": ["factor 1", "factor 2", "factor 3", "factor 4"],
  "weatherImpact": "Low/Medium/High — brief explanation",
  "tyreStrategy": "Brief description of optimal strategy",
  "upsetRisk": "Low/Medium/High — brief explanation of who could surprise",
  "overallAnalysis": "3-4 sentence comprehensive narrative about why these outcomes are predicted",
  "wdcImpact": "How this race affects the championship picture",
  "confidenceScore": 0
}

RULES:
- winProbability must be between 0.01 and 0.99 and sum to no more than 1.0 across the three podium positions
- confidenceScore between 50 and 95 (higher when conditions are clear and dry, lower when rain is likely)
- Base predictions on ALL provided data: weather, tyres, driver mentality, team reliability, circuit type, championship context
- Be specific — reference actual driver names, teams, and circuit characteristics in reasoning
- Return ONLY valid JSON, no markdown fences, no explanation text`;
  },

  // ── SHARED FETCH HELPER ───────────────────

  async callQwen(messages, maxTokens = 1200, temperature = 0.4, model = null) {
    const tryModel = async (modelId) => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.href,
          // ASCII only - em-dash and other non-ISO-8859-1 chars crash the fetch
          "X-Title": "F1 Predictor 2026 College Edition",
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      // Read body as text first - .json() on a 401/429/503 throws "unexpected end"
      const text = await res.text();

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { msg = JSON.parse(text)?.error?.message || msg; } catch {}
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      let content = "";
      try {
        content = JSON.parse(text)?.choices?.[0]?.message?.content || "";
      } catch {
        throw new Error("Invalid JSON response from OpenRouter");
      }

      // Strip markdown fences Qwen sometimes wraps around JSON output
      content = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return content;
    };

    const primary  = model || CONFIG.QWEN_MODEL;
    const fallback = CONFIG.QWEN_MODEL_FALLBACK;

    try {
      return await tryModel(primary);
    } catch (e) {
      // On rate-limit or unavailable, retry with smaller fallback model
      if (e.status === 429 || e.status === 503 || e.status === 502) {
        console.warn(`Primary model failed (${e.status}), retrying with fallback model`);
        return await tryModel(fallback);
      }
      throw e;
    }
  },

  // ── CALL QWEN VIA OPENROUTER ──────────────

  async getPrediction(race, weather, drivers, teams, recentResults) {
    const cacheKey = `pred_${race.round}_${race.date}`;
    const cached = CACHE.get(cacheKey);
    if (cached) return cached;

    const prompt = this.buildPrompt(race, weather, drivers, teams, recentResults);

    try {
      UI.showPredictionLoading(true);

      const content = await this.callQwen(
        [{ role: "user", content: prompt }],
        1200, 0.4
      );

      const prediction = JSON.parse(content);
      prediction._generatedAt = new Date().toISOString();
      prediction._model = CONFIG.QWEN_MODEL;

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

    const prompt = `You are an F1 statistics and championship probability analyst.

## CURRENT DRIVER STANDINGS
${drivers.slice(0,8).map(d => `${d.pos}. ${d.name} (${d.team}) - ${d.pts} pts`).join("\n")}

## CURRENT CONSTRUCTOR STANDINGS
${teams.slice(0,5).map(t => `${t.pos}. ${t.name} - ${t.pts} pts`).join("\n")}

## SEASON CONTEXT
Races completed: ${FALLBACK_DATA.results.length} of 22
Races remaining: ${remainingRaces}
Points available remaining: ${remainingRaces * 25} (wins only)
Max points remaining (inc. fastest lap): ${remainingRaces * 26}

## TEAM PERFORMANCE
${teams.slice(0,5).map(t => `${t.name}: Pace ${t.pace}/10 | Reliability ${t.reliability}/10`).join("\n")}

Generate championship forecasts in this EXACT JSON (no extra text, no markdown fences):

{
  "wdc": {
    "favourite": "Driver Full Name",
    "favouriteTeam": "Team",
    "probability": 0.72,
    "contenders": [
      { "driver": "Name", "team": "Team", "probability": 0.18, "gap": 4 },
      { "driver": "Name", "team": "Team", "probability": 0.07, "gap": 17 },
      { "driver": "Name", "team": "Team", "probability": 0.03, "gap": 18 }
    ],
    "analysis": "3-4 sentence narrative on WDC picture",
    "keyRisks": ["risk 1", "risk 2", "risk 3"]
  },
  "wcc": {
    "favourite": "Constructor Name",
    "probability": 0.81,
    "contenders": [
      { "team": "Name", "probability": 0.14, "gap": 31 },
      { "team": "Name", "probability": 0.05, "gap": 80 }
    ],
    "analysis": "3-4 sentence narrative on WCC picture",
    "keyRisks": ["risk 1", "risk 2"]
  }
}

Probabilities must be realistic (0.01-0.99) and sum to 1.0 within each category. Return ONLY valid JSON, no extra text.`;

    try {
      const content = await this.callQwen(
        [{ role: "user", content: prompt }],
        900, 0.3
      );

      const forecast = JSON.parse(content);
      CACHE.set(cacheKey, forecast);
      return forecast;
    } catch (e) {
      console.error("Championship forecast failed:", e);
      return this.getFallbackForecast();
    }
  },

  // ── FALLBACK PREDICTIONS (if API fails) ───

  getFallbackPrediction(race, errorMsg) {
    return {
      _error: errorMsg,
      _fallback: true,
      podium: [
        { position:1, driver:"George Russell",  team:"Mercedes", winProbability:0.38, reasoning:"Mercedes pace advantage at high-speed circuits based on 2026 form." },
        { position:2, driver:"Kimi Antonelli",  team:"Mercedes", winProbability:0.21, reasoning:"Strong teammate battle; Antonelli's win in China shows he can lead Mercedes." },
        { position:3, driver:"Charles Leclerc", team:"Ferrari",  winProbability:0.15, reasoning:"Ferrari best of the rest; Leclerc's qualifying ability key at this venue." },
      ],
      fastestLap: { driver: "George Russell", probability: 0.35 },
      safetyCarLikely: false,
      keyFactors: ["Mercedes car pace", "Weather conditions", "Tyre strategy", "Safety car timing"],
      weatherImpact: "Low — Dry conditions expected",
      tyreStrategy: "1-stop medium to hard",
      upsetRisk: "Medium — Rain could mix up the order",
      overallAnalysis: "Based on 2026 season form, Mercedes holds the performance advantage. Russell's consistency and the W17's all-round pace make him the clear favourite.",
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
        analysis: "Russell holds a slim but meaningful points lead supported by the fastest car on the grid. With 20 races remaining and his internal battle with Antonelli the primary threat, the championship is his to lose.",
        keyRisks: ["Antonelli momentum after China win", "McLaren reliability improving", "Rain weekends neutralising car advantage"],
      },
      wcc: {
        favourite: "Mercedes", probability: 0.81,
        contenders: [
          { team:"Ferrari",  probability:0.14, gap:31 },
          { team:"McLaren",  probability:0.05, gap:80 },
        ],
        analysis: "Mercedes' 31-point lead over Ferrari is already substantial after just two rounds. Back-to-back 1-2 finishes signal a dominant car that could mirror their 2020 dominance unless a rival makes a major upgrade step.",
        keyRisks: ["McLaren double DNF was a fluke — their pace is real", "Ferrari's development rate through the season"],
      },
    };
  },
};