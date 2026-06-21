# 🎻 Geige Musik-Quiz

Ein einfaches, statisches Web-Quiz für angehende Geiger:innen — läuft komplett
im Browser, kein Backend, mobil-freundlich. Deutsche Notennamen (H = B,
B = Bb) mit türkischen Bezeichnungen als Zweitreferenz.

## Modi

1. **Tonarten & Vorzeichen** (Tonlar & Arızalar) — Dur-Tonarten und ihre
   Vorzeichen: C, G, D, A, E, H, F.
2. **Griffbrett** (Klavye / Parmak Pozisyonları) — Töne der 1. Lage auf
   G-, D-, A- und E-Saite, Finger 0–4 (inkl. tief/hoch).

Jede Runde: 10 zufällige Multiple-Choice-Fragen, sofortiges Feedback,
Punktestand und Ergebnis-Screen mit Wiederholung.

## Dateien

- `index.html` — Struktur / Screens
- `style.css` — Styling (mobil-first)
- `app.js` — Quiz-Logik
- `data.js` — alle Quiz-Daten

## Lokal starten

Einfach `index.html` im Browser öffnen (kein Build-Schritt nötig).

## Deployment

Wird automatisch via GitHub Actions auf GitHub Pages veröffentlicht
(siehe `.github/workflows/deploy.yml`), sobald Änderungen nach `main`
gepusht werden.
