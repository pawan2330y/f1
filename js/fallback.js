// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  fallback.js
//
//  Contains ONLY static reference data that
//  cannot come from an API:
//    - Circuit profiles (overtaking, SC prob, laps)
//    - Tyre compound assignments per circuit
//    - Country flag emoji map
//    - Team colors, engine suppliers, meta
//    - Driver mentality & wet-weather scores
//      (these are YOUR team's analysis — update them)
//    - Minimal fallback data shown if ALL APIs fail
//
//  Race results, standings, and driver points
//  are loaded live from OpenF1. Do not hardcode them.
// ─────────────────────────────────────────────

const STATIC = {

  // ── DRIVER ANALYSIS SCORES ────────────────
  // Your team's research — update these each race weekend
  // These feed directly into the AI prediction prompt
  driverScores: {
    "RUS": { mentality: 9.2, wet: 8.8, starts: 193 },
    "ANT": { mentality: 8.7, wet: 7.9, starts: 2   },
    "LEC": { mentality: 8.9, wet: 8.5, starts: 142 },
    "HAM": { mentality: 9.4, wet: 9.6, starts: 359 },
    "NOR": { mentality: 8.8, wet: 9.1, starts: 121 },
    "VER": { mentality: 8.5, wet: 8.9, starts: 210 },
    "PIA": { mentality: 8.6, wet: 8.0, starts: 49  },
    "SAI": { mentality: 8.3, wet: 8.1, starts: 197 },
    "ALO": { mentality: 9.0, wet: 9.2, starts: 400 },
    "GAS": { mentality: 7.6, wet: 7.8, starts: 136 },
    "BEA": { mentality: 8.1, wet: 7.2, starts: 8   },
    "OCO": { mentality: 7.5, wet: 7.6, starts: 155 },
    "LAW": { mentality: 7.4, wet: 7.1, starts: 12  },
    "HAD": { mentality: 7.2, wet: 6.8, starts: 2   },
    "ALB": { mentality: 8.0, wet: 7.5, starts: 95  },
    "STR": { mentality: 7.1, wet: 7.0, starts: 160 },
    "HUL": { mentality: 7.8, wet: 7.4, starts: 222 },
    "ZHO": { mentality: 7.0, wet: 6.9, starts: 62  },
    "DOO": { mentality: 7.3, wet: 6.8, starts: 2   },
  },

  // ── TEAM META (colors, engine, scores) ────
  // Update pace/reliability/strategy each race weekend
  teamMeta: {
    "Mercedes":     { color: "#00A19C", engine: "Mercedes", reliability: 10.0, strategy: 9.5, pace: 9.8 },
    "Ferrari":      { color: "#DC0000", engine: "Ferrari",  reliability: 9.2,  strategy: 8.8, pace: 9.2 },
    "McLaren":      { color: "#FF8000", engine: "Mercedes", reliability: 6.0,  strategy: 9.0, pace: 9.5 },
    "Red Bull":     { color: "#3671C6", engine: "Red Bull", reliability: 7.4,  strategy: 8.5, pace: 8.0 },
    "Haas":         { color: "#B6BABD", engine: "Ferrari",  reliability: 8.8,  strategy: 7.9, pace: 7.8 },
    "RB":           { color: "#6692FF", engine: "Red Bull", reliability: 8.0,  strategy: 7.5, pace: 7.6 },
    "Alpine":       { color: "#FF87BC", engine: "Renault",  reliability: 7.8,  strategy: 8.1, pace: 7.5 },
    "Williams":     { color: "#64C4FF", engine: "Mercedes", reliability: 8.5,  strategy: 7.2, pace: 7.2 },
    "Audi":         { color: "#BB0000", engine: "Audi",     reliability: 6.5,  strategy: 7.0, pace: 7.0 },
    "Aston Martin": { color: "#358C75", engine: "Mercedes", reliability: 7.0,  strategy: 7.4, pace: 7.3 },
    "Cadillac":     { color: "#CC0033", engine: "Ferrari",  reliability: 6.8,  strategy: 7.0, pace: 6.8 },
    "Default":      { color: "#888888", engine: "Unknown",  reliability: 7.0,  strategy: 7.0, pace: 7.0 },
  },

  // ── COUNTRY FLAG MAP ──────────────────────
  countryFlags: {
    "Australia":            "🇦🇺",
    "Bahrain":              "🇧🇭",
    "Saudi Arabia":         "🇸🇦",
    "China":                "🇨🇳",
    "Japan":                "🇯🇵",
    "United States":        "🇺🇸",
    "Italy":                "🇮🇹",
    "Monaco":               "🇲🇨",
    "Spain":                "🇪🇸",
    "Canada":               "🇨🇦",
    "Austria":              "🇦🇹",
    "Great Britain":        "🇬🇧",
    "United Kingdom":       "🇬🇧",
    "Belgium":              "🇧🇪",
    "Hungary":              "🇭🇺",
    "Netherlands":          "🇳🇱",
    "Azerbaijan":           "🇦🇿",
    "Singapore":            "🇸🇬",
    "Mexico":               "🇲🇽",
    "Brazil":               "🇧🇷",
    "Las Vegas":            "🇺🇸",
    "Qatar":                "🇶🇦",
    "UAE":                  "🇦🇪",
    "Abu Dhabi":            "🇦🇪",
  },

  // ── CIRCUIT PROFILES ──────────────────────
  // Used to give AI context about each circuit
  circuitProfiles: {
    "Japanese Grand Prix":       { type:"High-speed",      overtaking:"Low",     safetyCarProb:28, tyreWear:"High",   drsZones:1, lapRecord:"1:30.983", laps:53 },
    "Bahrain Grand Prix":        { type:"Mixed",            overtaking:"Medium",  safetyCarProb:25, tyreWear:"High",   drsZones:3, lapRecord:"1:31.447", laps:57 },
    "Saudi Arabian Grand Prix":  { type:"High-speed street",overtaking:"Medium",  safetyCarProb:45, tyreWear:"Medium", drsZones:3, lapRecord:"1:27.511", laps:50 },
    "Australian Grand Prix":     { type:"Street/Park",      overtaking:"Low",     safetyCarProb:40, tyreWear:"Medium", drsZones:4, lapRecord:"1:20.235", laps:58 },
    "Chinese Grand Prix":        { type:"Mixed",            overtaking:"Medium",  safetyCarProb:30, tyreWear:"Medium", drsZones:2, lapRecord:"1:32.238", laps:56 },
    "Miami Grand Prix":          { type:"Street-style",     overtaking:"Medium",  safetyCarProb:41, tyreWear:"High",   drsZones:3, lapRecord:"1:29.708", laps:57 },
    "Emilia Romagna Grand Prix": { type:"Technical",        overtaking:"Low",     safetyCarProb:35, tyreWear:"High",   drsZones:2, lapRecord:"1:15.484", laps:63 },
    "Monaco Grand Prix":         { type:"Street",           overtaking:"Very Low",safetyCarProb:72, tyreWear:"Low",    drsZones:1, lapRecord:"1:12.909", laps:78 },
    "Spanish Grand Prix":        { type:"Technical",        overtaking:"Low",     safetyCarProb:22, tyreWear:"High",   drsZones:2, lapRecord:"1:16.330", laps:66 },
    "Canadian Grand Prix":       { type:"Street/Semi",      overtaking:"High",    safetyCarProb:68, tyreWear:"Medium", drsZones:3, lapRecord:"1:13.078", laps:70 },
    "Austrian Grand Prix":       { type:"Short/Fast",       overtaking:"High",    safetyCarProb:30, tyreWear:"High",   drsZones:3, lapRecord:"1:05.619", laps:71 },
    "British Grand Prix":        { type:"High-speed",       overtaking:"Medium",  safetyCarProb:30, tyreWear:"High",   drsZones:2, lapRecord:"1:27.097", laps:52 },
    "Belgian Grand Prix":        { type:"High-speed mixed", overtaking:"High",    safetyCarProb:35, tyreWear:"Medium", drsZones:2, lapRecord:"1:46.286", laps:44 },
    "Hungarian Grand Prix":      { type:"Twisty/Slow",      overtaking:"Low",     safetyCarProb:25, tyreWear:"High",   drsZones:2, lapRecord:"1:16.627", laps:70 },
    "Dutch Grand Prix":          { type:"Technical/Banked", overtaking:"Low",     safetyCarProb:28, tyreWear:"High",   drsZones:2, lapRecord:"1:11.097", laps:72 },
    "Italian Grand Prix":        { type:"High-speed/Low DL",overtaking:"High",    safetyCarProb:35, tyreWear:"Low",    drsZones:2, lapRecord:"1:21.046", laps:53 },
    "Azerbaijan Grand Prix":     { type:"Street",           overtaking:"High",    safetyCarProb:60, tyreWear:"Low",    drsZones:2, lapRecord:"1:43.009", laps:51 },
    "Singapore Grand Prix":      { type:"Street",           overtaking:"Low",     safetyCarProb:80, tyreWear:"Medium", drsZones:3, lapRecord:"1:35.867", laps:62 },
    "United States Grand Prix":  { type:"Mixed",            overtaking:"Medium",  safetyCarProb:38, tyreWear:"High",   drsZones:3, lapRecord:"1:36.169", laps:56 },
    "Mexico City Grand Prix":    { type:"Mixed/High alt.",  overtaking:"Medium",  safetyCarProb:30, tyreWear:"Low",    drsZones:3, lapRecord:"1:17.774", laps:71 },
    "Sao Paulo Grand Prix":      { type:"Technical",        overtaking:"High",    safetyCarProb:55, tyreWear:"Medium", drsZones:3, lapRecord:"1:10.540", laps:71 },
    "Las Vegas Grand Prix":      { type:"Street/Night",     overtaking:"High",    safetyCarProb:45, tyreWear:"Low",    drsZones:3, lapRecord:"1:35.490", laps:50 },
    "Qatar Grand Prix":          { type:"High-speed",       overtaking:"Medium",  safetyCarProb:30, tyreWear:"Very High",drsZones:2,lapRecord:"1:24.319",laps:57 },
    "Abu Dhabi Grand Prix":      { type:"Mixed",            overtaking:"Medium",  safetyCarProb:20, tyreWear:"Medium", drsZones:2, lapRecord:"1:26.103", laps:58 },
  },

  // ── TYRE COMPOUNDS PER CIRCUIT ────────────
  tyreData: {
    "Japanese Grand Prix":       { compounds:["C2","C3","C4"], strategy:"1-stop Medium to Hard",          degradation:"Medium-high" },
    "Bahrain Grand Prix":        { compounds:["C2","C3","C4"], strategy:"2-stop Soft to Medium to Hard",  degradation:"High"        },
    "Saudi Arabian Grand Prix":  { compounds:["C3","C4","C5"], strategy:"1-stop Medium to Hard",          degradation:"Medium"      },
    "Australian Grand Prix":     { compounds:["C2","C3","C4"], strategy:"1 or 2-stop variable",           degradation:"Medium"      },
    "Chinese Grand Prix":        { compounds:["C2","C3","C4"], strategy:"2-stop Soft to Medium to Hard",  degradation:"Medium"      },
    "Miami Grand Prix":          { compounds:["C3","C4","C5"], strategy:"2-stop Soft to Medium to Hard",  degradation:"High"        },
    "Emilia Romagna Grand Prix": { compounds:["C3","C4","C5"], strategy:"1-stop Medium to Hard",          degradation:"High"        },
    "Monaco Grand Prix":         { compounds:["C3","C4","C5"], strategy:"1-stop Soft to Medium",          degradation:"Low"         },
    "Spanish Grand Prix":        { compounds:["C2","C3","C4"], strategy:"2-stop Medium to Hard to Hard",  degradation:"High"        },
    "Canadian Grand Prix":       { compounds:["C3","C4","C5"], strategy:"Variable — rain risk",           degradation:"Medium"      },
    "Austrian Grand Prix":       { compounds:["C3","C4","C5"], strategy:"2-stop Soft to Medium to Hard",  degradation:"High"        },
    "British Grand Prix":        { compounds:["C2","C3","C4"], strategy:"2-stop Medium to Hard to Medium",degradation:"High"        },
    "Belgian Grand Prix":        { compounds:["C2","C3","C4"], strategy:"1-stop Medium to Hard",          degradation:"Medium"      },
    "Hungarian Grand Prix":      { compounds:["C3","C4","C5"], strategy:"2-stop Soft to Medium to Hard",  degradation:"High"        },
    "Dutch Grand Prix":          { compounds:["C3","C4","C5"], strategy:"2-stop Soft to Medium to Hard",  degradation:"High"        },
    "Italian Grand Prix":        { compounds:["C2","C3","C4"], strategy:"1-stop Medium to Hard",          degradation:"Low"         },
    "Azerbaijan Grand Prix":     { compounds:["C3","C4","C5"], strategy:"1-stop Soft to Medium",          degradation:"Low"         },
    "Singapore Grand Prix":      { compounds:["C3","C4","C5"], strategy:"2-stop Soft to Medium to Soft",  degradation:"Medium"      },
    "United States Grand Prix":  { compounds:["C2","C3","C4"], strategy:"2-stop Medium to Hard to Medium",degradation:"High"        },
    "Mexico City Grand Prix":    { compounds:["C2","C3","C4"], strategy:"1-stop Medium to Hard",          degradation:"Low"         },
    "Sao Paulo Grand Prix":      { compounds:["C3","C4","C5"], strategy:"Variable — rain very likely",    degradation:"Medium"      },
    "Las Vegas Grand Prix":      { compounds:["C3","C4","C5"], strategy:"1-stop Medium to Hard",          degradation:"Low"         },
    "Qatar Grand Prix":          { compounds:["C1","C2","C3"], strategy:"3-stop Soft to Soft to Soft",    degradation:"Very High"   },
    "Abu Dhabi Grand Prix":      { compounds:["C3","C4","C5"], strategy:"1-stop Medium to Hard",          degradation:"Medium"      },
  },

  // ── DEFAULT WEATHER (last resort fallback) ─
  defaultWeather: {
    tempMax: 22, tempMin: 15, rainMm: 0, rainProb: 10, windMax: 15, condition: "Dry"
  },

  // ── LAST RESORT FALLBACK DATA ─────────────
  // Only used if OpenF1 is completely unreachable
  // These are the only hardcoded standings — remove once OpenF1 is confirmed working

  drivers: [
    { pos:1,  code:"RUS", name:"George Russell",   team:"Mercedes",    pts:51, nationality:"GBR", number:63, mentality:9.2, wet:8.8, starts:193 },
    { pos:2,  code:"ANT", name:"Kimi Antonelli",   team:"Mercedes",    pts:47, nationality:"ITA", number:12, mentality:8.7, wet:7.9, starts:2   },
    { pos:3,  code:"LEC", name:"Charles Leclerc",  team:"Ferrari",     pts:34, nationality:"MON", number:16, mentality:8.9, wet:8.5, starts:142 },
    { pos:4,  code:"HAM", name:"Lewis Hamilton",   team:"Ferrari",     pts:33, nationality:"GBR", number:44, mentality:9.4, wet:9.6, starts:359 },
    { pos:5,  code:"BEA", name:"Oliver Bearman",   team:"Haas",        pts:17, nationality:"GBR", number:87, mentality:8.1, wet:7.2, starts:8   },
    { pos:6,  code:"NOR", name:"Lando Norris",     team:"McLaren",     pts:15, nationality:"GBR", number:1,  mentality:8.8, wet:9.1, starts:121 },
    { pos:7,  code:"GAS", name:"Pierre Gasly",     team:"Alpine",      pts:9,  nationality:"FRA", number:10, mentality:7.6, wet:7.8, starts:136 },
    { pos:8,  code:"VER", name:"Max Verstappen",   team:"Red Bull",    pts:8,  nationality:"NLD", number:33, mentality:8.5, wet:8.9, starts:210 },
    { pos:9,  code:"LAW", name:"Liam Lawson",      team:"RB",          pts:8,  nationality:"NZL", number:30, mentality:7.4, wet:7.1, starts:12  },
    { pos:10, code:"HAD", name:"Isack Hadjar",     team:"Red Bull",    pts:4,  nationality:"FRA", number:6,  mentality:7.2, wet:6.8, starts:2   },
  ],

  teams: [
    { pos:1,  name:"Mercedes",    pts:98, color:"#00A19C", engine:"Mercedes", reliability:10.0, strategy:9.5, pace:9.8 },
    { pos:2,  name:"Ferrari",     pts:67, color:"#DC0000", engine:"Ferrari",  reliability:9.2,  strategy:8.8, pace:9.2 },
    { pos:3,  name:"McLaren",     pts:18, color:"#FF8000", engine:"Mercedes", reliability:6.0,  strategy:9.0, pace:9.5 },
    { pos:4,  name:"Haas",        pts:17, color:"#B6BABD", engine:"Ferrari",  reliability:8.8,  strategy:7.9, pace:7.8 },
    { pos:5,  name:"Red Bull",    pts:12, color:"#3671C6", engine:"Red Bull", reliability:7.4,  strategy:8.5, pace:8.0 },
  ],

  results: [],

  calendar: [
    { round:1,  name:"Australian Grand Prix",    flag:"🇦🇺", circuit:"Albert Park",               date:"2026-03-08", status:"done"     },
    { round:2,  name:"Chinese Grand Prix",        flag:"🇨🇳", circuit:"Shanghai Int'l Circuit",    date:"2026-03-15", status:"done"     },
    { round:3,  name:"Japanese Grand Prix",       flag:"🇯🇵", circuit:"Suzuka Circuit",            date:"2026-03-29", status:"next"     },
    { round:4,  name:"Bahrain Grand Prix",        flag:"🇧🇭", circuit:"Bahrain International",     date:"2026-04-12", status:"upcoming" },
    { round:5,  name:"Saudi Arabian Grand Prix",  flag:"🇸🇦", circuit:"Jeddah Corniche Circuit",   date:"2026-04-19", status:"upcoming" },
    { round:6,  name:"Miami Grand Prix",          flag:"🇺🇸", circuit:"Miami International",       date:"2026-05-03", status:"upcoming" },
    { round:7,  name:"Emilia Romagna Grand Prix", flag:"🇮🇹", circuit:"Imola",                     date:"2026-05-17", status:"upcoming" },
    { round:8,  name:"Monaco Grand Prix",         flag:"🇲🇨", circuit:"Circuit de Monaco",         date:"2026-05-24", status:"upcoming" },
    { round:9,  name:"Spanish Grand Prix",        flag:"🇪🇸", circuit:"Circuit de Catalunya",      date:"2026-06-07", status:"upcoming" },
    { round:10, name:"Canadian Grand Prix",       flag:"🇨🇦", circuit:"Gilles Villeneuve",         date:"2026-06-21", status:"upcoming" },
    { round:11, name:"Austrian Grand Prix",       flag:"🇦🇹", circuit:"Red Bull Ring",             date:"2026-07-05", status:"upcoming" },
    { round:12, name:"British Grand Prix",        flag:"🇬🇧", circuit:"Silverstone",               date:"2026-07-12", status:"upcoming" },
    { round:13, name:"Belgian Grand Prix",        flag:"🇧🇪", circuit:"Circuit de Spa",            date:"2026-07-26", status:"upcoming" },
    { round:14, name:"Hungarian Grand Prix",      flag:"🇭🇺", circuit:"Hungaroring",               date:"2026-08-02", status:"upcoming" },
    { round:15, name:"Dutch Grand Prix",          flag:"🇳🇱", circuit:"Zandvoort",                 date:"2026-08-30", status:"upcoming" },
    { round:16, name:"Italian Grand Prix",        flag:"🇮🇹", circuit:"Monza",                     date:"2026-09-06", status:"upcoming" },
    { round:17, name:"Azerbaijan Grand Prix",     flag:"🇦🇿", circuit:"Baku City Circuit",         date:"2026-09-20", status:"upcoming" },
    { round:18, name:"Singapore Grand Prix",      flag:"🇸🇬", circuit:"Marina Bay Street Circuit", date:"2026-10-04", status:"upcoming" },
    { round:19, name:"United States Grand Prix",  flag:"🇺🇸", circuit:"Circuit of The Americas",   date:"2026-10-18", status:"upcoming" },
    { round:20, name:"Mexico City Grand Prix",    flag:"🇲🇽", circuit:"Autodromo Hermanos Rodriguez",date:"2026-10-25",status:"upcoming"},
    { round:21, name:"Sao Paulo Grand Prix",      flag:"🇧🇷", circuit:"Interlagos",                date:"2026-11-08", status:"upcoming" },
    { round:22, name:"Abu Dhabi Grand Prix",      flag:"🇦🇪", circuit:"Yas Marina Circuit",        date:"2026-11-29", status:"upcoming" },
  ],
};

// Aliases so predict.js and ui.js still work
// (they reference FALLBACK_DATA and TYRE_DATA)
const FALLBACK_DATA = {
  circuitProfiles: STATIC.circuitProfiles,
  get results() { return APP?.state?.results || STATIC.results; },
  get calendar() { return APP?.state?.calendar || STATIC.calendar; },
};
const TYRE_DATA = STATIC.tyreData;