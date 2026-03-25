// ─────────────────────────────────────────────
//  F1 PREDICTOR 2026  ·  fallback.js
//  Seed data used when APIs are unreachable
//  Update this after each race weekend manually
// ─────────────────────────────────────────────

const FALLBACK_DATA = {

  // ── DRIVER STANDINGS (update after each race) ──
  drivers: [
    { pos:1,  code:"RUS", name:"George Russell",      team:"Mercedes",    pts:51,  nationality:"British",    number:63, mentality:9.2, wet:8.8, starts:193 },
    { pos:2,  code:"ANT", name:"Kimi Antonelli",       team:"Mercedes",    pts:47,  nationality:"Italian",    number:12, mentality:8.7, wet:7.9, starts:2   },
    { pos:3,  code:"LEC", name:"Charles Leclerc",      team:"Ferrari",     pts:34,  nationality:"Monégasque", number:16, mentality:8.9, wet:8.5, starts:142 },
    { pos:4,  code:"HAM", name:"Lewis Hamilton",       team:"Ferrari",     pts:33,  nationality:"British",    number:44, mentality:9.4, wet:9.6, starts:359 },
    { pos:5,  code:"BEA", name:"Oliver Bearman",       team:"Haas",        pts:17,  nationality:"British",    number:87, mentality:8.1, wet:7.2, starts:8   },
    { pos:6,  code:"NOR", name:"Lando Norris",         team:"McLaren",     pts:15,  nationality:"British",    number:4,  mentality:8.8, wet:9.1, starts:121 },
    { pos:7,  code:"GAS", name:"Pierre Gasly",         team:"Alpine",      pts:9,   nationality:"French",     number:10, mentality:7.6, wet:7.8, starts:136 },
    { pos:8,  code:"VER", name:"Max Verstappen",       team:"Red Bull",    pts:8,   nationality:"Dutch",      number:1,  mentality:8.5, wet:8.9, starts:210 },
    { pos:8,  code:"LAW", name:"Liam Lawson",          team:"RB",          pts:8,   nationality:"New Zealander",number:30,mentality:7.4, wet:7.1, starts:12  },
    { pos:10, code:"HAD", name:"Isack Hadjar",         team:"Red Bull",    pts:4,   nationality:"French",     number:6,  mentality:7.2, wet:6.8, starts:2   },
    { pos:11, code:"PIA", name:"Oscar Piastri",        team:"McLaren",     pts:3,   nationality:"Australian", number:81, mentality:8.6, wet:8.0, starts:49  },
    { pos:12, code:"ALB", name:"Alexander Albon",      team:"Williams",    pts:2,   nationality:"Thai",       number:23, mentality:8.0, wet:7.5, starts:95  },
    { pos:13, code:"OCO", name:"Esteban Ocon",         team:"Haas",        pts:0,   nationality:"French",     number:31, mentality:7.5, wet:7.6, starts:155 },
    { pos:14, code:"HUL", name:"Nico Hülkenberg",      team:"Audi",        pts:1,   nationality:"German",     number:27, mentality:7.8, wet:7.4, starts:222 },
    { pos:15, code:"SAI", name:"Carlos Sainz",         team:"Williams",    pts:0,   nationality:"Spanish",    number:55, mentality:8.3, wet:8.1, starts:197 },
    { pos:16, code:"STR", name:"Lance Stroll",         team:"Aston Martin",pts:0,   nationality:"Canadian",   number:18, mentality:7.1, wet:7.0, starts:160 },
    { pos:17, code:"ALO", name:"Fernando Alonso",      team:"Aston Martin",pts:0,   nationality:"Spanish",    number:14, mentality:9.0, wet:9.2, starts:400 },
    { pos:18, code:"ZHO", name:"Guanyu Zhou",          team:"Audi",        pts:0,   nationality:"Chinese",    number:24, mentality:7.0, wet:6.9, starts:62  },
    { pos:19, code:"BAR", name:"Jack Doohan",          team:"Alpine",      pts:0,   nationality:"Australian", number:7,  mentality:7.3, wet:6.8, starts:2   },
    { pos:20, code:"MAZ", name:"Robert Shwartzman",    team:"Cadillac",    pts:0,   nationality:"Israeli",    number:99, mentality:6.9, wet:6.5, starts:0   },
  ],

  // ── CONSTRUCTOR STANDINGS ──
  teams: [
    { pos:1,  name:"Mercedes",    pts:98,  color:"#00A19C", engine:"Mercedes", reliability:10.0, strategy:9.5, pace:9.8 },
    { pos:2,  name:"Ferrari",     pts:67,  color:"#DC0000", engine:"Ferrari",  reliability:9.2,  strategy:8.8, pace:9.2 },
    { pos:3,  name:"McLaren",     pts:18,  color:"#FF8000", engine:"Mercedes", reliability:5.5,  strategy:9.0, pace:9.5 },
    { pos:4,  name:"Haas",        pts:17,  color:"#B6BABD", engine:"Ferrari",  reliability:8.8,  strategy:7.9, pace:7.8 },
    { pos:5,  name:"Red Bull",    pts:12,  color:"#3671C6", engine:"Red Bull", reliability:7.4,  strategy:8.5, pace:8.0 },
    { pos:6,  name:"RB",          pts:8,   color:"#6692FF", engine:"Red Bull", reliability:8.0,  strategy:7.5, pace:7.6 },
    { pos:7,  name:"Alpine",      pts:9,   color:"#FF87BC", engine:"Renault",  reliability:7.8,  strategy:8.1, pace:7.5 },
    { pos:8,  name:"Williams",    pts:2,   color:"#64C4FF", engine:"Mercedes", reliability:8.5,  strategy:7.2, pace:7.2 },
    { pos:9,  name:"Audi",        pts:1,   color:"#BB0000", engine:"Audi",     reliability:6.5,  strategy:7.0, pace:7.0 },
    { pos:10, name:"Aston Martin",pts:0,   color:"#358C75", engine:"Mercedes", reliability:7.0,  strategy:7.4, pace:7.3 },
    { pos:11, name:"Cadillac",    pts:0,   color:"#CC0033", engine:"Ferrari",  reliability:6.8,  strategy:7.0, pace:6.8 },
  ],

  // ── RACE HISTORY (completed rounds) ──
  results: [
    {
      round: 1, name: "Australian Grand Prix", flag: "🇦🇺",
      circuit: "Albert Park, Melbourne", date: "2026-03-08",
      sessionKey: 9158,
      podium: [
        { pos: 1, driver: "George Russell",   team: "Mercedes", code: "RUS" },
        { pos: 2, driver: "Kimi Antonelli",   team: "Mercedes", code: "ANT" },
        { pos: 3, driver: "Charles Leclerc",  team: "Ferrari",  code: "LEC" },
      ],
      fastestLap: "Russell",
      weather: { condition: "Dry", tempMax: 24, rainProb: 5 },
      notes: "Mercedes dominant 1-2. Leclerc recovered from P6 on lap 1.",
      predAccuracy: 87,
    },
    {
      round: 2, name: "Chinese Grand Prix", flag: "🇨🇳",
      circuit: "Shanghai International Circuit", date: "2026-03-15",
      sessionKey: 9161,
      podium: [
        { pos: 1, driver: "Kimi Antonelli",  team: "Mercedes", code: "ANT" },
        { pos: 2, driver: "George Russell",  team: "Mercedes", code: "RUS" },
        { pos: 3, driver: "Lewis Hamilton",  team: "Ferrari",  code: "HAM" },
      ],
      fastestLap: "Antonelli",
      weather: { condition: "Dry", tempMax: 19, rainProb: 8 },
      notes: "Antonelli's maiden F1 win. Hamilton's first Ferrari podium. McLaren double DNF on lap 1.",
      predAccuracy: 71,
    },
  ],

  // ── 2026 CALENDAR ──
  calendar: [
    { round:1,  name:"Australian Grand Prix",    flag:"🇦🇺", circuit:"Albert Park",              date:"2026-03-08", status:"done"     },
    { round:2,  name:"Chinese Grand Prix",        flag:"🇨🇳", circuit:"Shanghai Int'l Circuit",   date:"2026-03-15", status:"done"     },
    { round:3,  name:"Japanese Grand Prix",       flag:"🇯🇵", circuit:"Suzuka Circuit",           date:"2026-03-29", status:"next"     },
    { round:4,  name:"Bahrain Grand Prix",        flag:"🇧🇭", circuit:"Bahrain International",    date:"2026-04-12", status:"upcoming" },
    { round:5,  name:"Saudi Arabian Grand Prix",  flag:"🇸🇦", circuit:"Jeddah Corniche Circuit",  date:"2026-04-19", status:"upcoming" },
    { round:6,  name:"Miami Grand Prix",          flag:"🇺🇸", circuit:"Miami International",      date:"2026-05-03", status:"upcoming" },
    { round:7,  name:"Emilia Romagna Grand Prix", flag:"🇮🇹", circuit:"Imola",                    date:"2026-05-17", status:"upcoming" },
    { round:8,  name:"Monaco Grand Prix",         flag:"🇲🇨", circuit:"Circuit de Monaco",        date:"2026-05-24", status:"upcoming" },
    { round:9,  name:"Spanish Grand Prix",        flag:"🇪🇸", circuit:"Circuit de Catalunya",     date:"2026-06-07", status:"upcoming" },
    { round:10, name:"Canadian Grand Prix",       flag:"🇨🇦", circuit:"Gilles Villeneuve",        date:"2026-06-21", status:"upcoming" },
    { round:11, name:"Austrian Grand Prix",       flag:"🇦🇹", circuit:"Red Bull Ring",            date:"2026-07-05", status:"upcoming" },
    { round:12, name:"British Grand Prix",        flag:"🇬🇧", circuit:"Silverstone",              date:"2026-07-12", status:"upcoming" },
    { round:13, name:"Belgian Grand Prix",        flag:"🇧🇪", circuit:"Circuit de Spa",           date:"2026-07-26", status:"upcoming" },
    { round:14, name:"Hungarian Grand Prix",      flag:"🇭🇺", circuit:"Hungaroring",              date:"2026-08-02", status:"upcoming" },
    { round:15, name:"Dutch Grand Prix",          flag:"🇳🇱", circuit:"Zandvoort",                date:"2026-08-30", status:"upcoming" },
    { round:16, name:"Italian Grand Prix",        flag:"🇮🇹", circuit:"Monza",                    date:"2026-09-06", status:"upcoming" },
    { round:17, name:"Azerbaijan Grand Prix",     flag:"🇦🇿", circuit:"Baku City Circuit",        date:"2026-09-20", status:"upcoming" },
    { round:18, name:"Singapore Grand Prix",      flag:"🇸🇬", circuit:"Marina Bay Street Circuit",date:"2026-10-04", status:"upcoming" },
    { round:19, name:"United States Grand Prix",  flag:"🇺🇸", circuit:"Circuit of The Americas",  date:"2026-10-18", status:"upcoming" },
    { round:20, name:"Mexico City Grand Prix",    flag:"🇲🇽", circuit:"Autodromo Hermanos Rodriguez",date:"2026-10-25",status:"upcoming"},
    { round:21, name:"São Paulo Grand Prix",      flag:"🇧🇷", circuit:"Interlagos",               date:"2026-11-08", status:"upcoming" },
    { round:22, name:"Abu Dhabi Grand Prix",      flag:"🇦🇪", circuit:"Yas Marina Circuit",       date:"2026-11-29", status:"upcoming" },
  ],

  // ── CIRCUIT PROFILES (for prediction context) ──
  circuitProfiles: {
    "Japanese Grand Prix":      { type:"High-speed",   overtaking:"Low",    safetyCarProb:28, tyreWear:"High",   drsZones:1, lapRecord:"1:30.983 (Verstappen 2019)", laps:53 },
    "Bahrain Grand Prix":       { type:"Mixed",        overtaking:"Medium", safetyCarProb:25, tyreWear:"High",   drsZones:3, lapRecord:"1:31.447 (De la Rosa 2005)",  laps:57 },
    "Saudi Arabian Grand Prix": { type:"Street/High-speed",overtaking:"Medium",safetyCarProb:45,tyreWear:"Medium",drsZones:3,lapRecord:"1:27.511 (Leclerc 2022)",    laps:50 },
    "Australian Grand Prix":    { type:"Street/Park",  overtaking:"Low",    safetyCarProb:40, tyreWear:"Medium", drsZones:4, lapRecord:"1:20.235 (Leclerc 2022)",    laps:58 },
    "Chinese Grand Prix":       { type:"Mixed",        overtaking:"Medium", safetyCarProb:30, tyreWear:"Medium", drsZones:2, lapRecord:"1:32.238 (Michael Schumacher 2004)", laps:56 },
    "Miami Grand Prix":         { type:"Street-style", overtaking:"Medium", safetyCarProb:41, tyreWear:"High",   drsZones:3, lapRecord:"1:29.708 (Verstappen 2023)",  laps:57 },
    "Monaco Grand Prix":        { type:"Street",       overtaking:"Very Low",safetyCarProb:72, tyreWear:"Low",   drsZones:1, lapRecord:"1:12.909 (Leclerc 2021)",    laps:78 },
    "Spanish Grand Prix":       { type:"Technical",    overtaking:"Low",    safetyCarProb:22, tyreWear:"High",   drsZones:2, lapRecord:"1:16.330 (Verstappen 2023)",  laps:66 },
    "Canadian Grand Prix":      { type:"Street/Semi",  overtaking:"High",   safetyCarProb:68, tyreWear:"Medium", drsZones:3, lapRecord:"1:13.078 (Bottas 2019)",     laps:70 },
    "British Grand Prix":       { type:"High-speed",   overtaking:"Medium", safetyCarProb:30, tyreWear:"High",   drsZones:2, lapRecord:"1:27.097 (Hamilton 2020)",   laps:52 },
    "Italian Grand Prix":       { type:"High-speed",   overtaking:"High",   safetyCarProb:35, tyreWear:"Low",    drsZones:2, lapRecord:"1:21.046 (Rubens Barrichello 2004)", laps:53 },
    "Singapore Grand Prix":     { type:"Street",       overtaking:"Low",    safetyCarProb:80, tyreWear:"Medium", drsZones:3, lapRecord:"1:35.867 (Leclerc 2023)",    laps:62 },
    "Abu Dhabi Grand Prix":     { type:"Mixed",        overtaking:"Medium", safetyCarProb:20, tyreWear:"Medium", drsZones:2, lapRecord:"1:26.103 (Verstappen 2021)",  laps:58 },
  },

  // ── DEFAULT WEATHER (fallback) ──
  weather: {
    tempMax: 22, tempMin: 15, rainMm: 0, rainProb: 10, windMax: 15, condition: "Dry"
  },

  // ── NEXT SESSION FALLBACK ──
  nextSession: {
    session_name: "Race",
    location: "Suzuka",
    country_name: "Japan",
    date_start: "2026-03-29T05:00:00+00:00",
    circuit_short_name: "Suzuka",
  },

  sessions: [],
};

// ── TYRE COMPOUND DATA PER CIRCUIT ────────────────
const TYRE_DATA = {
  "Japanese Grand Prix":      { compounds:["C2","C3","C4"], strategy:"1-stop (M→H)", degradation:"Medium-high" },
  "Australian Grand Prix":    { compounds:["C2","C3","C4"], strategy:"1 or 2-stop",  degradation:"Medium"      },
  "Chinese Grand Prix":       { compounds:["C2","C3","C4"], strategy:"2-stop (S→M→H)",degradation:"Medium"     },
  "Miami Grand Prix":         { compounds:["C3","C4","C5"], strategy:"2-stop (S→M→H)",degradation:"High"       },
  "Monaco Grand Prix":        { compounds:["C3","C4","C5"], strategy:"1-stop (S→M)",  degradation:"Low"        },
  "Canadian Grand Prix":      { compounds:["C3","C4","C5"], strategy:"Variable/wet risk",degradation:"Medium"  },
  "British Grand Prix":       { compounds:["C2","C3","C4"], strategy:"2-stop (M→H→M)",degradation:"High"       },
  "Italian Grand Prix":       { compounds:["C2","C3","C4"], strategy:"1-stop (M→H)",  degradation:"Low"        },
  "Singapore Grand Prix":     { compounds:["C3","C4","C5"], strategy:"2-stop (S→M→S)",degradation:"Medium"     },
  "Abu Dhabi Grand Prix":     { compounds:["C3","C4","C5"], strategy:"1-stop (M→H)",  degradation:"Medium"     },
};