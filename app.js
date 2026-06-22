// Geige Musik-Quiz — App-Logik
(function () {
  "use strict";

  const QUESTIONS_PER_ROUND = 20;
  const OPTION_COUNT = 4;

  // ---------- Audio (Web Audio API) ----------
  let audioCtx = null;

  function playFreq(freq) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle"; // wärmer als Sinus, geigenähnlicher
      osc.frequency.value = freq;

      // Lautstärke-Hüllkurve (Attack/Decay), damit es nicht klickt.
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.35);
    } catch (e) {
      /* Audio nicht verfügbar – Modus bleibt trotzdem spielbar über Replay-Versuche. */
    }
  }

  // ---------- Hilfsfunktionen ----------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Wähle (n) Distraktoren aus pool, die nicht gleich correct sind.
  function pickDistractors(pool, correct, n) {
    const unique = [...new Set(pool)].filter((x) => x !== correct);
    return shuffle(unique).slice(0, n);
  }

  function buildOptions(correct, pool) {
    const distractors = pickDistractors(pool, correct, OPTION_COUNT - 1);
    return shuffle([correct, ...distractors]);
  }

  // ---------- Anzeige-Formatierung ----------
  function countLabel(k) {
    if (k.count === 0) return "keine Vorzeichen";
    const sym = k.type === "#" ? "♯" : "♭";
    return k.count + " " + sym;
  }

  function accidentalLabel(k) {
    return k.accidentals.length ? k.accidentals.join(", ") : "keine";
  }

  function positionLabel(p) {
    if (p.finger === 0) return "leere " + p.string + "-Saite";
    let s = p.string + "-Saite, " + p.finger + ". Finger";
    if (p.qualifier) s += " (" + p.qualifier + ")";
    return s;
  }

  // Nur der Finger-Teil (Saite ist in der Frage vorgegeben) -> als Antwortoption.
  function fingerLabel(p) {
    if (p.finger === 0) return "leere Saite (0)";
    return p.finger + ". Finger" + (p.qualifier ? " (" + p.qualifier + ")" : "");
  }

  function noteWithTr(note) {
    const tr = NOTE_TR[note];
    return tr ? note + " (" + tr + ")" : note;
  }

  // ---------- Fragengenerierung ----------
  function makeKeyQuestions() {
    const qs = [];
    const countPool = KEYS.map(countLabel);
    const keyPool = KEYS.map((k) => k.key);
    const accPool = KEYS.map(accidentalLabel);

    KEYS.forEach((k) => {
      // Wie viele Vorzeichen?
      qs.push({
        mode: "Tonarten & Vorzeichen",
        text: "Wie viele Vorzeichen hat " + k.key + "?",
        sub: k.tr,
        answers: [countLabel(k)],
        options: buildOptions(countLabel(k), countPool)
      });

      // Welche Vorzeichen?
      qs.push({
        mode: "Tonarten & Vorzeichen",
        text: "Welche Vorzeichen hat " + k.key + "?",
        sub: k.tr,
        answers: [accidentalLabel(k)],
        options: buildOptions(accidentalLabel(k), accPool)
      });

      // Umgekehrt: Welche Tonart hat ...?
      if (k.count > 0) {
        qs.push({
          mode: "Tonarten & Vorzeichen",
          text: "Welche Tonart hat " + countLabel(k) + "?",
          sub: "Tonart bestimmen",
          answers: [k.key],
          options: buildOptions(k.key, keyPool)
        });
      }
    });

    return qs;
  }

  function makeFingerboardQuestions() {
    const qs = [];
    const notePool = [...new Set(FINGERBOARD.map((p) => noteWithTr(p.note)))];
    const fingerPool = [...new Set(FINGERBOARD.map(fingerLabel))];

    FINGERBOARD.forEach((p) => {
      // Vorwärts: Position -> Ton. Eindeutig, da Saite + Finger + tief/hoch die Position festlegen.
      qs.push({
        mode: "Griffbrett",
        text: positionLabel(p) + " — welcher Ton?",
        sub: "Ton benennen",
        answers: [noteWithTr(p.note)],
        options: buildOptions(noteWithTr(p.note), notePool)
      });

      // Rückwärts: Ton + Saite -> Finger. Eindeutig, da jeder Ton pro Saite nur einmal vorkommt.
      qs.push({
        mode: "Griffbrett",
        text: "Welcher Finger spielt " + noteWithTr(p.note) + " auf der " + p.string + "-Saite?",
        sub: "Finger finden",
        answers: [fingerLabel(p)],
        options: buildOptions(fingerLabel(p), fingerPool)
      });
    });

    return qs;
  }

  function makeEarQuestions() {
    const qs = [];
    const namePool = [...new Set(TONE_NAMES.map((t) => noteWithTr(t.note)))];
    const octaves = [0, 12]; // Oktave 4 und 5 -> mehr Fragen und Abwechslung

    TONE_NAMES.forEach((t) => {
      octaves.forEach((o) => {
        const midi = t.midi + o;
        qs.push({
          mode: "Gehörbildung",
          text: "Welcher Ton erklingt?",
          sub: "Ton anhören und Namen wählen",
          answers: [noteWithTr(t.note)],
          options: buildOptions(noteWithTr(t.note), namePool),
          freq: 440 * Math.pow(2, (midi - 69) / 12)
        });
      });
    });

    return qs;
  }

  function buildRound(mode) {
    let all;
    if (mode === "keys") all = makeKeyQuestions();
    else if (mode === "ear") all = makeEarQuestions();
    else all = makeFingerboardQuestions();
    return shuffle(all).slice(0, QUESTIONS_PER_ROUND);
  }

  // ---------- Spielzustand ----------
  const state = { mode: null, questions: [], index: 0, score: 0, answered: false };
  // Session-Gesamtwertung über mehrere Runden (bleibt bis zum Neuladen / Zurücksetzen).
  const session = { correct: 0, answered: 0, rounds: 0 };

  // ---------- DOM ----------
  const el = (id) => document.getElementById(id);
  const screens = {
    home: el("screen-home"),
    quiz: el("screen-quiz"),
    result: el("screen-result")
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
    if (name === "home") updateSessionSummary();
    window.scrollTo(0, 0);
  }

  function updateSessionSummary() {
    const box = el("session-summary");
    if (session.rounds === 0) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    el("session-summary-text").textContent =
      "Session: " + session.correct + "/" + session.answered +
      " richtig · " + session.rounds + (session.rounds === 1 ? " Runde" : " Runden");
  }

  // ---------- Rendern ----------
  function renderLegend() {
    const ul = el("legend-list");
    ul.innerHTML = "";
    LEGEND.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ul.appendChild(li);
    });
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    state.answered = false;

    el("q-counter").textContent =
      "Frage " + (state.index + 1) + "/" + state.questions.length;
    el("q-score").textContent = state.score + " ✓";
    el("progress-fill").style.width =
      (state.index / state.questions.length) * 100 + "%";

    el("question-mode").textContent = q.mode;
    el("question-text").textContent = q.text;
    el("question-sub").textContent = q.sub || "";

    // Audio-Fragen (Gehörbildung): Replay-Button zeigen und Ton einmal abspielen.
    const replay = el("btn-replay");
    if (q.freq) {
      replay.hidden = false;
      replay.onclick = () => playFreq(q.freq);
      playFreq(q.freq);
    } else {
      replay.hidden = true;
      replay.onclick = null;
    }

    const opts = el("options");
    opts.innerHTML = "";
    q.options.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "option";
      b.textContent = opt;
      b.addEventListener("click", () => onAnswer(b, opt, q.answers));
      opts.appendChild(b);
    });

    const fb = el("feedback");
    fb.hidden = true;
    el("feedback-text").className = "";
  }

  function onAnswer(button, chosen, answers) {
    if (state.answered) return;
    state.answered = true;

    const buttons = el("options").querySelectorAll(".option");
    buttons.forEach((b) => {
      b.disabled = true;
      if (answers.includes(b.textContent)) b.classList.add("correct");
    });

    const fbText = el("feedback-text");
    if (answers.includes(chosen)) {
      state.score++;
      button.classList.add("correct");
      fbText.textContent = "Richtig! 🎵";
      fbText.className = "good";
    } else {
      button.classList.add("wrong");
      fbText.textContent = "Falsch — richtig ist: " + answers.join(" oder ");
      fbText.className = "bad";
    }

    el("q-score").textContent = state.score + " ✓";
    el("feedback").hidden = false;
    el("btn-next").textContent =
      state.index + 1 >= state.questions.length ? "Ergebnis →" : "Weiter →";
  }

  function nextQuestion() {
    state.index++;
    if (state.index >= state.questions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }

  function showResult() {
    const total = state.questions.length;
    const score = state.score;
    el("result-score").textContent = score + "/" + total;

    // Runde in die Session-Gesamtwertung übernehmen.
    session.correct += score;
    session.answered += total;
    session.rounds += 1;

    const pct = score / total;
    let emoji, msg;
    if (pct === 1) { emoji = "🏆"; msg = "Perfekt! Alles richtig! / Mükemmel!"; }
    else if (pct >= 0.7) { emoji = "🎉"; msg = "Sehr gut! / Çok iyi!"; }
    else if (pct >= 0.4) { emoji = "🙂"; msg = "Weiter üben! / Çalışmaya devam!"; }
    else { emoji = "💪"; msg = "Übung macht den Meister. / Tekrar dene!"; }

    el("result-emoji").textContent = emoji;
    el("result-msg").textContent = msg;
    el("result-session").textContent =
      "Session gesamt: " + session.correct + "/" + session.answered +
      " (" + session.rounds + (session.rounds === 1 ? " Runde" : " Runden") + ")";
    showScreen("result");
  }

  function resetSession() {
    session.correct = 0;
    session.answered = 0;
    session.rounds = 0;
    updateSessionSummary();
  }

  function startRound(mode) {
    state.mode = mode;
    state.questions = buildRound(mode);
    state.index = 0;
    state.score = 0;
    renderQuestion();
    showScreen("quiz");
  }

  // ---------- PIN-Sperre ----------
  // Hinweis: rein clientseitig – schützt nur vor Gelegenheitszugriff, keine echte Sicherheit.
  const PIN = "0203";
  let pinEntry = "";

  function isUnlocked() {
    try { return sessionStorage.getItem("quizUnlocked") === "1"; } catch (e) { return false; }
  }

  function renderPinDots() {
    const dots = el("pin-dots").children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle("filled", i < pinEntry.length);
    }
  }

  function unlock() {
    try { sessionStorage.setItem("quizUnlocked", "1"); } catch (e) { /* egal */ }
    el("screen-lock").classList.remove("active");
    showScreen("home");
  }

  function pinFailed() {
    const dots = el("pin-dots");
    el("pin-error").hidden = false;
    dots.classList.add("shake");
    setTimeout(() => {
      pinEntry = "";
      renderPinDots();
      dots.classList.remove("shake");
    }, 450);
  }

  function handlePinKey(k) {
    if (k === "del") {
      pinEntry = pinEntry.slice(0, -1);
      el("pin-error").hidden = true;
      renderPinDots();
      return;
    }
    if (pinEntry.length >= 4) return;
    el("pin-error").hidden = true;
    pinEntry += k;
    renderPinDots();
    if (pinEntry.length === 4) {
      if (pinEntry === PIN) unlock();
      else pinFailed();
    }
  }

  function initLock() {
    el("pin-dots") && document.querySelectorAll(".keypad .key[data-key]").forEach((btn) => {
      btn.addEventListener("click", () => handlePinKey(btn.dataset.key));
    });
    // Physische Tastatur (Desktop): Ziffern und Backspace.
    document.addEventListener("keydown", (e) => {
      if (!el("screen-lock").classList.contains("active")) return;
      if (e.key >= "0" && e.key <= "9") handlePinKey(e.key);
      else if (e.key === "Backspace") handlePinKey("del");
    });

    if (isUnlocked()) unlock();
  }

  // ---------- Events ----------
  function init() {
    renderLegend();
    initLock();

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => startRound(btn.dataset.mode));
    });

    el("btn-next").addEventListener("click", nextQuestion);
    el("btn-quit").addEventListener("click", () => showScreen("home"));
    el("btn-home").addEventListener("click", () => showScreen("home"));
    el("btn-retry").addEventListener("click", () => startRound(state.mode));
    el("btn-reset-session").addEventListener("click", resetSession);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
