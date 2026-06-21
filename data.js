// Geige Musik-Quiz — Quiz-Daten
// Deutsche Notennamen (H = B, B = Bb), türkische Bezeichnungen als Zweitreferenz.

// Notenlegende / Türkische Solmisation
const NOTE_TR = {
  "C": "Do",
  "Cis": "Do diyez",
  "D": "Re",
  "Dis": "Re diyez",
  "E": "Mi",
  "F": "Fa",
  "Fis": "Fa diyez",
  "G": "Sol",
  "Gis": "Sol diyez",
  "A": "La",
  "B": "Si bemol",   // deutsch B = Bb
  "H": "Si"          // deutsch H = B (natural)
};

// Mode 1 — Tonarten & Vorzeichen (Keys & Accidentals)
// count: Anzahl Vorzeichen, type: "#" (Kreuz) oder "b" (Be)
const KEYS = [
  { key: "C-Dur", tr: "Do Majör",  count: 0, type: null, accidentals: [] },
  { key: "G-Dur", tr: "Sol Majör", count: 1, type: "#",  accidentals: ["Fis"] },
  { key: "D-Dur", tr: "Re Majör",  count: 2, type: "#",  accidentals: ["Fis", "Cis"] },
  { key: "A-Dur", tr: "La Majör",  count: 3, type: "#",  accidentals: ["Fis", "Cis", "Gis"] },
  { key: "E-Dur", tr: "Mi Majör",  count: 4, type: "#",  accidentals: ["Fis", "Cis", "Gis", "Dis"] },
  { key: "H-Dur", tr: "Si Majör",  count: 5, type: "#",  accidentals: ["Fis", "Cis", "Gis", "Dis", "Ais"] },
  { key: "F-Dur", tr: "Fa Majör",  count: 1, type: "b",  accidentals: ["B"] }
];

// Mode 2 — Griffbrett (Fingerboard), 1. Lage
// string: Saite, finger: Fingernummer, qualifier: "tief"/"hoch"/null, note: deutscher Ton
const FINGERBOARD = [
  // G-Saite: G A H/B C D
  { string: "G", finger: 0, qualifier: null,   note: "G" },
  { string: "G", finger: 1, qualifier: null,   note: "A" },
  { string: "G", finger: 2, qualifier: "tief", note: "B" },
  { string: "G", finger: 2, qualifier: "hoch", note: "H" },
  { string: "G", finger: 3, qualifier: null,   note: "C" },
  { string: "G", finger: 4, qualifier: null,   note: "D" },

  // D-Saite: D E F/Fis G A
  { string: "D", finger: 0, qualifier: null,   note: "D" },
  { string: "D", finger: 1, qualifier: null,   note: "E" },
  { string: "D", finger: 2, qualifier: "tief", note: "F" },
  { string: "D", finger: 2, qualifier: "hoch", note: "Fis" },
  { string: "D", finger: 3, qualifier: null,   note: "G" },
  { string: "D", finger: 4, qualifier: null,   note: "A" },

  // A-Saite: A H C/Cis D E
  { string: "A", finger: 0, qualifier: null,   note: "A" },
  { string: "A", finger: 1, qualifier: null,   note: "H" },
  { string: "A", finger: 2, qualifier: "tief", note: "C" },
  { string: "A", finger: 2, qualifier: "hoch", note: "Cis" },
  { string: "A", finger: 3, qualifier: null,   note: "D" },
  { string: "A", finger: 4, qualifier: null,   note: "E" },

  // E-Saite: E F/Fis G/Gis A H
  { string: "E", finger: 0, qualifier: null,   note: "E" },
  { string: "E", finger: 1, qualifier: "tief", note: "F" },
  { string: "E", finger: 1, qualifier: "hoch", note: "Fis" },
  { string: "E", finger: 2, qualifier: "tief", note: "G" },
  { string: "E", finger: 2, qualifier: "hoch", note: "Gis" },
  { string: "E", finger: 3, qualifier: null,   note: "A" },
  { string: "E", finger: 4, qualifier: null,   note: "H" }
];

// Mode 3 — Gehörbildung (Ton hören & benennen)
// midi: MIDI-Notennummer in Oktave 4 (A4 = 69 = 440 Hz). App spielt zusätzlich Oktave 5.
const TONE_NAMES = [
  { note: "C",   midi: 60 },
  { note: "Cis", midi: 61 },
  { note: "D",   midi: 62 },
  { note: "Dis", midi: 63 },
  { note: "E",   midi: 64 },
  { note: "F",   midi: 65 },
  { note: "Fis", midi: 66 },
  { note: "G",   midi: 67 },
  { note: "Gis", midi: 68 },
  { note: "A",   midi: 69 },
  { note: "B",   midi: 70 },
  { note: "H",   midi: 71 }
];

// Legende für die Startseite
const LEGEND = [
  "b = tiefer (-es), z. B. B = Bb",
  "# = höher (-is), z. B. Fis = F#",
  "Deutsch: H = B (natural), B = Bb",
  "Türkçe: # = diyez, b = bemol"
];
