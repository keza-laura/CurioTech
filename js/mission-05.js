// ==========================================================================
// CurioTech: Mission 05 - The Creator Mission (Phase 5, Stage 5.4)
// ==========================================================================
// A guided, independent project: Idea -> Plan -> Build -> Experiment -> Save -> Celebrate.
// The building happens in the Creator's Playground, and saving uses the existing My Projects feature
// (window.CurioProjects from js/projects.js). This page never saves projects itself.
//
// COMPLETION (localStorage "curiotech_mission_05_completed"):
//   { v: 1, done: true, completedAt, projectId, projectName }
//   Written ONLY when the learner presses "Finish the mission" on the Save step AND, at that moment, a
//   project exists that
//     1. was saved while this attempt of the mission was running (its createdAt is not before the moment
//        the attempt began, so an old project cannot count and no project is overwritten), and
//     2. has some HTML, and is not just the untouched Playground starter code.
//   Opening the Playground, visiting the celebration step or ticking a box never completes the mission.
//   An existing record is never overwritten, and this file never reads or writes Mission 01's record.
//
// In-progress state (sessionStorage "curiotech_mission_05_progress", per tab) remembers the step, the
// idea, the plan and the attempt's start time, so the learner can go to the Playground and come back.
// ==========================================================================

(function () {
  "use strict";

  const STATE_KEY = "curiotech_mission_05_progress";
  const DONE_KEY = "curiotech_mission_05_completed";
  const MAX_IDEA_CHARS = 60;
  const MAX_NAME_CHARS = 40;
  const LAST_STEP = 5;

  // The Playground's own starter code. These MUST stay identical to STARTER_HTML / STARTER_CSS / STARTER_JS in
  // js/playground.js: they are only used to tell an untouched starter project from the learner's own work.
  const STARTER_HTML = [
    "<!-- Welcome to your workshop! Change any words and watch the page update. -->",
    "<h1>Hello, World!</h1>",
    "",
    "<p>This is my very first webpage. I can change any of these words!</p>",
    "",
    "<h2>Things I like</h2>",
    "<ul>",
    "  <li>🤖 Robots</li>",
    "  <li>🎨 Drawing</li>",
    "  <li>🚀 Space</li>",
    "</ul>",
    "",
    "<!-- Buttons come alive with JavaScript later! -->",
    "<button>Click me!</button>",
    ""
  ].join("\n");

  const STARTER_CSS = [
    "/* CSS makes your page beautiful!",
    "   A rule says WHAT to style, then puts the settings inside { }. */",
    "",
    "h1 {",
    "  color: #7C3AED;",
    "  text-align: center;",
    "}",
    "",
    "h2 {",
    "  color: #0369A1;",
    "}",
    "",
    "button {",
    "  padding: 0.5rem 1rem;",
    "  border-radius: 8px;",
    "}",
    ""
  ].join("\n");

  const STARTER_JS = [
    "// JavaScript makes your page DO things!",
    "// Press the Run Code button to try it. console.log() prints into the Output box.",
    "",
    'console.log("Hello from my JavaScript! 🎉");',
    "",
    'const title = document.querySelector("h1");',
    'const button = document.querySelector("button");',
    "",
    "if (title && button) {",
    '  button.addEventListener("click", function () {',
    '    title.textContent = "You clicked the button! 🎈";',
    '    console.log("The button was clicked");',
    "  });",
    "}",
    ""
  ].join("\n");

  // ---- the mission's content ----
  const STEPS = [
    { name: "Idea", next: "Continue to Plan →" },
    { name: "Plan", next: "Continue to Build →" },
    { name: "Build", next: "Continue to Experiment →" },
    { name: "Experiment", next: "Continue to Save →" },
    { name: "Save", next: "Finish the mission 🎉" },
    { name: "Celebrate", next: "" }
  ];

  const IDEAS = [
    { id: "animal", label: "🐱 My favourite animal", name: "My Favourite Animal" },
    { id: "game", label: "🎮 My favourite game", name: "My Favourite Game" },
    { id: "food", label: "🍕 My favourite food", name: "My Favourite Food" },
    { id: "me", label: "🌟 A page all about me", name: "All About Me" },
    { id: "own", label: "✏️ My own idea", name: "" }
  ];

  const PURPOSES = [
    { id: "love", label: "Show something I love" },
    { id: "story", label: "Tell a short story" },
    { id: "teach", label: "Teach something" },
    { id: "fun", label: "Just for fun" }
  ];

  const CONTENTS = [
    { id: "title", label: "A big title" },
    { id: "words", label: "A few sentences in my own words" },
    { id: "emoji", label: "Emoji or symbols as pictures" },
    { id: "button", label: "A button" },
    { id: "colour", label: "My favourite colours" }
  ];

  const PIXEL = [
    { expr: "thinking", html: "<strong>Time to be a creator! 🛠️</strong><br>Pick an idea you'd enjoy. Small is good, and you can always add more later." },
    { expr: "encouraging", html: "<strong>A tiny plan helps a lot.</strong><br>Give your project a name and decide what it's for. You'll use this name when you save." },
    { expr: "excited", html: "<strong>Let's build! 🧱</strong><br>Open the Playground and make the starter page your own. Start with the big title." },
    { expr: "happy", html: "<strong>Experiment time! 🔬</strong><br>Run your code, look at the preview, and try one change at a time. Mistakes are just clues." },
    { expr: "encouraging", html: "<strong>Save it so it stays yours! 💾</strong><br>Press <strong>Save Project</strong> in the Playground, then come back and check." },
    { expr: "excited", html: "<strong>BEEP-BEEP-HOORAY! 🎉</strong><br>You made something of your own. I'm so proud of you!" }
  ];

  // ---- page elements ----
  const $ = (id) => document.getElementById(id);
  const panels = Array.from(document.querySelectorAll(".stage-panel"));
  const pills = Array.from(document.querySelectorAll(".step-pill"));
  const prevBtn = $("m5-prev");
  const nextBtn = $("m5-next");
  const hintEl = $("m5-hint");
  const ideasHost = $("m5-ideas");
  const ownIdea = $("m5-own-idea");
  const nameInput = $("m5-name");
  const purposeSel = $("m5-purpose");
  const contentsHost = $("m5-contents");
  const builtBox = $("m5-built");
  const triedBox = $("m5-tried");
  const checkBtn = $("m5-check");
  const saveStatus = $("m5-save-status");
  const doneBanner = $("m5-done-banner");
  if (!panels.length || !prevBtn || !nextBtn || !ideasHost || !nameInput || !purposeSel) return;

  // ---- state ----
  const cleanText = (v, max) => (typeof v === "string"
    ? v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "");

  function freshState() {
    return {
      v: 1, step: 0, maxStep: 0, startedAt: new Date().toISOString(),
      ideaId: "", ideaText: "", name: "", purpose: "", contents: [],
      built: false, tried: false, completed: false, projectId: "", projectName: "", returnLabel: ""
    };
  }

  /** A saved state, checked and trimmed; null when it is missing or unusable. */
  function readState() {
    let d;
    try { d = JSON.parse(sessionStorage.getItem(STATE_KEY)); } catch (e) { return null; }
    if (!d || typeof d !== "object" || d.v !== 1 || isNaN(Date.parse(d.startedAt))) return null;
    const s = freshState();
    const step = Number.isInteger(d.step) ? Math.min(LAST_STEP, Math.max(0, d.step)) : 0;
    s.maxStep = Number.isInteger(d.maxStep) ? Math.min(LAST_STEP, Math.max(step, d.maxStep)) : step;
    s.step = step;
    s.startedAt = new Date(Date.parse(d.startedAt)).toISOString();
    s.ideaId = IDEAS.some(i => i.id === d.ideaId) ? d.ideaId : "";
    s.ideaText = cleanText(d.ideaText, MAX_IDEA_CHARS);
    s.name = cleanText(d.name, MAX_NAME_CHARS);
    s.purpose = PURPOSES.some(p => p.id === d.purpose) ? d.purpose : "";
    s.contents = Array.isArray(d.contents) ? d.contents.filter(c => CONTENTS.some(x => x.id === c)) : [];
    s.built = d.built === true;
    s.tried = d.tried === true;
    s.completed = d.completed === true;
    s.projectId = typeof d.projectId === "string" ? d.projectId.slice(0, 40) : "";
    s.projectName = cleanText(d.projectName, MAX_NAME_CHARS);
    return s;
  }

  let state = readState() || freshState();

  function saveState() {
    state.returnLabel = `Step ${state.step + 1} of 6: ${STEPS[state.step].name}`;   // shown by the Playground's "Back to Mission 05" bar
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: the page still works */ }
  }

  // ---- completion record (localStorage, never overwritten, never Mission 01's key) ----
  function readDone() {
    try {
      const d = JSON.parse(localStorage.getItem(DONE_KEY));
      if (d && d.v === 1 && d.done === true) return d;
    } catch (e) { /* missing, corrupt or unavailable: not complete */ }
    return null;
  }

  /** { ok, existed }: ok is false when the browser would not save it. */
  function writeDone(project) {
    if (readDone()) return { ok: true, existed: true };
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify({
        v: 1, done: true, completedAt: new Date().toISOString(), projectId: project.id, projectName: project.name
      }));
      return { ok: true, existed: false };
    } catch (e) {
      return { ok: false, existed: false };
    }
  }

  // ---- checking the learner's saved project ----
  function isStarterOnly(p) {
    return p.html === STARTER_HTML && p.css === STARTER_CSS && p.js === STARTER_JS;
  }

  /** What the Save step can see right now. kind: ok | none | old | full | starter | unavailable. */
  function evaluate() {
    const api = window.CurioProjects;
    if (!api || !api.isAvailable()) return { kind: "unavailable" };
    const list = api.list();   // newest first
    const began = Date.parse(state.startedAt) || 0;
    const mine = list.filter(p => Date.parse(p.createdAt) >= began);
    if (mine.length === 0) {
      if (list.length >= api.MAX_PROJECTS) return { kind: "full", count: list.length };
      return { kind: list.length ? "old" : "none", count: list.length };
    }
    const real = mine.filter(p => p.html.trim() !== "" && !isStarterOnly(p));
    if (real.length === 0) return { kind: "starter", project: mine[0] };
    return { kind: "ok", project: real[0] };
  }

  function describe(ev) {
    switch (ev.kind) {
      case "ok":
        return { good: true, text: `✅ Found it! “${ev.project.name}” is saved. You can finish the mission.` };
      case "starter":
        return { good: false, text: `I found “${ev.project.name}”, but it's still the starter page. Change it to make it yours, press Update Project in the Playground, then check again.` };
      case "old":
        return { good: false, text: "You have saved projects, but none from this mission yet. In the Playground, press Save as New Project for the page you just built, then check again." };
      case "full":
        return { good: false, text: "You already have 10 saved projects, which is the limit. In the Playground's My Projects list, delete one you don't need, then save your new project and check again." };
      case "unavailable":
        return { good: false, text: "This browser isn't letting CurioTech save projects, so I can't check. Mission 05 needs a saved project. Try a normal (not private) browser window." };
      default:
        return { good: false, text: "I don't see a saved project yet. In the Playground, open 💾 My Projects, type a name and press Save Project. Then come back and check." };
    }
  }

  // ---- small helpers ----
  function setPixel(expr, html) {
    const speech = $("m5-pixel-speech");
    const avatar = $("m5-pixel-avatar");
    const tag = $("m5-pixel-tag");
    if (speech && html) speech.innerHTML = html;
    if (avatar) {
      avatar.setAttribute("data-expression", expr);
      avatar.setAttribute("aria-label", `Pixel Mascot (${expr})`);
    }
    if (tag) {
      tag.textContent = expr.charAt(0).toUpperCase() + expr.slice(1);
      tag.className = `pixel-expression-pill expr-pill-${expr}`;
    }
  }

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  const nameOk = (name) => {
    const n = cleanText(name, 200);
    return n !== "" && Array.from(n).length <= MAX_NAME_CHARS;
  };

  const ideaLabel = () => {
    const idea = IDEAS.find(i => i.id === state.ideaId);
    if (!idea) return "";
    return idea.id === "own" ? state.ideaText : idea.label.replace(/^\S+\s/, "");
  };

  const ideaOk = () => state.ideaId !== "" && (state.ideaId !== "own" || state.ideaText.length >= 2);

  const purposeLabel = () => { const p = PURPOSES.find(x => x.id === state.purpose); return p ? p.label : ""; };

  function suggestedName() {
    const idea = IDEAS.find(i => i.id === state.ideaId);
    if (!idea) return "";
    if (idea.id !== "own") return idea.name;
    return Array.from(state.ideaText.replace(/\b\w/g, c => c.toUpperCase())).slice(0, MAX_NAME_CHARS).join("").trim();
  }

  function planCard(host) {
    host.textContent = "";
    host.appendChild(el("h3", "m5-plan-title", "Your plan"));
    const rows = [
      ["Idea", ideaLabel() || "—"],
      ["Project name", state.name || "—"],
      ["For", purposeLabel() || "—"],
      ["On my page", state.contents.length ? CONTENTS.filter(c => state.contents.includes(c.id)).map(c => c.label).join(", ") : "—"]
    ];
    rows.forEach(r => {
      const p = el("p", "m5-plan-row");
      p.appendChild(el("span", "m5-plan-label", r[0]));
      p.appendChild(el("span", "m5-plan-value", r[1]));
      host.appendChild(p);
    });
  }

  // ---- gates: what must be true before Continue works ----
  let lastEval = null;

  function gateText(step) {
    switch (step) {
      case 0: return ideaOk() ? "" : "Pick an idea first. If you choose “My own idea”, type it in the box.";
      case 1: return nameOk(state.name) && state.purpose ? "" : "Give your project a name (up to 40 characters) and choose what your page is for.";
      case 2: return state.built ? "" : "Tick the box once you've opened the Playground and started building.";
      case 3: return state.tried ? "" : "Tick the box once you've run your code and looked at your preview.";
      case 4: return lastEval && lastEval.kind === "ok" ? "" : (lastEval ? describe(lastEval).text : "Press “Check my saved project” first.");
      default: return "";
    }
  }

  let hintFlip = false;
  function showHint(text) {
    if (!hintEl) return;
    if (!text) { hintEl.textContent = ""; hintEl.hidden = true; return; }
    hintFlip = !hintFlip;
    hintEl.textContent = text + (hintFlip ? " " : "");   // an invisible change lets a repeated message be announced again
    hintEl.hidden = false;
  }

  // ---- showing the current step ----
  function renderStep(moveFocus) {
    const step = state.step;
    panels.forEach((p, i) => p.classList.toggle("active", i === step));
    pills.forEach((b, i) => {
      b.classList.toggle("active", i === step);
      b.classList.toggle("completed", i < step && i <= state.maxStep);
      b.disabled = i > state.maxStep;
      if (i === step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    const pix = PIXEL[step];
    setPixel(pix.expr, pix.html);

    prevBtn.disabled = step === 0;
    nextBtn.hidden = step === LAST_STEP;
    nextBtn.textContent = STEPS[step].next;
    showHint("");

    if (step === 1 && !nameInput.value) {
      const s = suggestedName();
      if (s) { nameInput.value = s; state.name = cleanText(s, MAX_NAME_CHARS); }
    }
    if (step === 2) planCard($("m5-plan-card-build"));
    if (step === 4) { planCard($("m5-plan-card-save")); refreshSave(false); }
    if (step === 5) renderCelebrate();
    refreshGate();
    saveState();

    if (moveFocus) {
      const h = panels[step].querySelector(".stage-title, .celebrate-title");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      const card = document.querySelector(".mission-card");
      const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (card && card.scrollIntoView) card.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    }
  }

  function refreshGate() {
    const locked = state.step < LAST_STEP && gateText(state.step) !== "";
    if (locked) nextBtn.setAttribute("aria-disabled", "true"); else nextBtn.removeAttribute("aria-disabled");
    nextBtn.classList.toggle("is-locked", locked);
  }

  function go(step, moveFocus) {
    state.step = Math.max(0, Math.min(LAST_STEP, step));
    if (state.step > state.maxStep) state.maxStep = state.step;
    renderStep(moveFocus !== false);
  }

  // ---- step 5: look for the saved project ----
  function refreshSave(announce) {
    lastEval = evaluate();
    const d = describe(lastEval);
    if (saveStatus) {
      saveStatus.textContent = d.text;
      saveStatus.classList.toggle("is-good", d.good);
      saveStatus.classList.toggle("is-warn", !d.good);
    }
    refreshGate();
    return lastEval;
  }

  // ---- finishing ----
  function finish() {
    const ev = refreshSave(true);
    if (ev.kind !== "ok") { showHint(gateText(4)); return; }
    const w = writeDone(ev.project);
    state.completed = true;
    state.projectId = ev.project.id;
    state.projectName = ev.project.name;
    completeMessage = w.ok ? (w.existed ? "existed" : "saved") : "failed";
    go(5);
  }

  let completeMessage = "";   // what happened when this page wrote the record ("" after a reload)

  function renderCelebrate() {
    // Never trust the screen alone: if the record is missing, make it now, and only with a real saved project.
    let record = readDone();
    if (!record && state.completed) {
      const ev = evaluate();
      if (ev.kind !== "ok") {
        state.completed = false;   // nothing real to celebrate: back to the Save step
        state.step = 4;
        state.maxStep = Math.min(state.maxStep, 4);
        renderStep(false);
        return;
      }
      const w = writeDone(ev.project);
      completeMessage = w.ok ? "saved" : "failed";
      state.projectId = ev.project.id;
      state.projectName = ev.project.name;
      record = readDone();
    }
    $("m5-sum-project").textContent = state.projectName || (record && record.projectName) || "Your project";
    $("m5-sum-idea").textContent = ideaLabel() || "Your own idea";

    let text;
    let good = true;
    if (completeMessage === "failed" || !record) {
      text = "You finished Mission 05! This browser wouldn't let me save that, so the mission may not show as complete later.";
      good = false;
    } else if (completeMessage === "existed") {
      text = "✅ You finished Mission 05 again! Your first completion stays recorded.";
    } else if (completeMessage === "saved") {
      text = "✅ Saved! Mission 05 is recorded as complete on this device.";
    } else {
      text = "✅ Mission 05 is recorded as complete on this device.";
    }
    const note = $("m5-complete-note");
    note.textContent = text;
    note.classList.toggle("is-good", good);
    note.classList.toggle("is-warn", !good);
  }

  // ---- building the choice lists ----
  IDEAS.forEach(idea => {
    const label = el("label", "m5-choice");
    const input = el("input");
    input.type = "radio";
    input.name = "m5-idea";
    input.id = "m5-idea-" + idea.id;
    input.value = idea.id;
    label.appendChild(input);
    label.appendChild(el("span", "m5-choice-text", idea.label));
    ideasHost.appendChild(label);
  });

  PURPOSES.forEach((p, i) => {
    if (i === 0) {
      const first = el("option", "", "Choose one…");
      first.value = "";
      purposeSel.appendChild(first);
    }
    const o = el("option", "", p.label);
    o.value = p.id;
    purposeSel.appendChild(o);
  });

  CONTENTS.forEach(c => {
    const label = el("label", "m5-check");
    const input = el("input");
    input.type = "checkbox";
    input.value = c.id;
    input.id = "m5-content-" + c.id;
    label.appendChild(input);
    label.appendChild(el("span", "m5-check-text", c.label));
    contentsHost.appendChild(label);
  });

  // put saved values back into the fields
  function fillFields() {
    const radio = ideasHost.querySelector(`input[value="${state.ideaId}"]`);
    if (radio) radio.checked = true;
    ownIdea.value = state.ideaText;
    ownIdea.disabled = state.ideaId !== "own";
    nameInput.value = state.name;
    purposeSel.value = state.purpose;
    contentsHost.querySelectorAll("input").forEach(i => { i.checked = state.contents.includes(i.value); });
    builtBox.checked = state.built;
    triedBox.checked = state.tried;
  }

  // ---- events ----
  ideasHost.addEventListener("change", (e) => {
    if (!e.target || e.target.name !== "m5-idea") return;
    state.ideaId = e.target.value;
    ownIdea.disabled = state.ideaId !== "own";
    if (state.ideaId === "own") ownIdea.focus();
    showHint("");
    refreshGate();
    saveState();
  });

  ownIdea.addEventListener("input", () => {
    state.ideaText = cleanText(ownIdea.value, MAX_IDEA_CHARS);
    refreshGate();
    saveState();
  });

  nameInput.addEventListener("input", () => {
    state.name = cleanText(nameInput.value, MAX_NAME_CHARS);
    nameInput.removeAttribute("aria-invalid");
    refreshGate();
    saveState();
  });

  purposeSel.addEventListener("change", () => {
    state.purpose = purposeSel.value;
    refreshGate();
    saveState();
  });

  contentsHost.addEventListener("change", () => {
    state.contents = Array.from(contentsHost.querySelectorAll("input:checked")).map(i => i.value);
    saveState();
  });

  builtBox.addEventListener("change", () => { state.built = builtBox.checked; showHint(""); refreshGate(); saveState(); });
  triedBox.addEventListener("change", () => { state.tried = triedBox.checked; showHint(""); refreshGate(); saveState(); });

  nextBtn.addEventListener("click", () => {
    const step = state.step;
    if (step === 4) { finish(); return; }
    const need = gateText(step);
    if (need) {
      showHint(need);
      if (step === 1 && !nameOk(state.name)) { nameInput.setAttribute("aria-invalid", "true"); nameInput.focus(); }
      return;
    }
    go(step + 1);
  });

  prevBtn.addEventListener("click", () => { if (state.step > 0) go(state.step - 1); });

  pills.forEach((b, i) => b.addEventListener("click", () => { if (i <= state.maxStep) go(i); }));

  if (checkBtn) checkBtn.addEventListener("click", () => { refreshSave(true); showHint(""); });

  // Coming back from the Playground (or another tab): look again, so the learner sees their project at once.
  const recheck = () => { if (state.step === 4) refreshSave(false); };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") recheck(); });
  window.addEventListener("focus", recheck);
  window.addEventListener("storage", (e) => { if (e.key === null || (window.CurioProjects && e.key === window.CurioProjects.KEY)) recheck(); });

  // Leaving through the map ends this attempt (a new visit starts a fresh one). The completion record stays.
  const leave = $("m5-leave");
  if (leave) leave.addEventListener("click", () => { try { sessionStorage.removeItem(STATE_KEY); } catch (e) { /* nothing to remove */ } });

  // ---- start ----
  const before = readDone();
  if (before && doneBanner) {
    doneBanner.textContent = `🎉 You already completed this mission with “${before.projectName}”. You can make another project any time. Your first completion stays recorded.`;
    doneBanner.hidden = false;
  }
  fillFields();
  renderStep(false);
})();
