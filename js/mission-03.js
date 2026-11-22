// ==========================================================================
// CurioTech: Mission 03 - Make It Beautiful (CSS City)
// Five steps: Discover, Experiment, Challenge, Create, Celebrate.
//
// Completion (localStorage "curiotech_mission_03_completed" -> { v: 1, done: true, completedAt }):
//   recorded ONLY when the learner reaches the celebration step AND
//     1. changed at least 3 different settings on the tower (Experiment),
//     2. solved all 3 style quests (Challenge), and
//     3. saved their neon sign design (Create).
//   Opening the mission or a step never completes it. An existing record is never overwritten, and this
//   file never reads or writes any other mission's record.
//
// In-progress state (localStorage "curiotech_mission_03_progress") lets the learner close the tab and come
// back. It is cleared when they leave from the celebration step. Learner text (the sign words) is only ever
// shown with textContent, and every colour, font and size comes from a fixed list or a number range.
// ==========================================================================

(function () {
  "use strict";

  const STATE_KEY = "curiotech_mission_03_progress";
  const DONE_KEY = "curiotech_mission_03_completed";
  const LAST_STEP = 4;
  const PROPS_NEEDED = 3;
  const MAX_SIGN_CHARS = 20;

  const WALLS = [
    { label: "Purple", value: "#a855f7" },
    { label: "Cyan", value: "#38bdf8" },
    { label: "Pink", value: "#f472b6" },
    { label: "Green", value: "#10b981" }
  ];
  const SIGN_COLOURS = [
    { label: "Pink", value: "#f472b6" },
    { label: "Cyan", value: "#38bdf8" },
    { label: "Yellow", value: "#facc15" },
    { label: "Lime", value: "#a3e635" }
  ];
  const HEIGHTS = ["", "120px", "180px", "240px"];
  const FONTS = ["sans-serif", "serif", "monospace", "cursive"];
  const TOWER_PROPS = ["background-color", "border-radius", "height", "box-shadow"];

  const STEPS = [
    { next: "Continue to Experiment →" },
    { next: "Continue to Challenge →" },
    { next: "Continue to Create →" },
    { next: "Finish the mission →" },
    { next: "" }
  ];

  const PIXEL = [
    { expr: "excited", html: "<strong>Welcome to CSS City! 🏙️</strong><br>HTML is the skeleton of a page. CSS is the paint, the neon lights and the style. Let's learn how a CSS rule is built." },
    { expr: "thinking", html: "<strong>Time to experiment! 🧪</strong><br>Change the tower and watch the CSS appear below it. Try at least 3 different settings." },
    { expr: "encouraging", html: "<strong>Three style quests ⚔️</strong><br>A wrong answer is just a clue. Read the hint and try again!" },
    { expr: "happy", html: "<strong>Design time! 🎨</strong><br>Make a neon sign for CSS City. Type your words, style them, then press Save my design." },
    { expr: "excited", html: "<strong>You did it! 🎉</strong><br>You are a CSS City architect now. Try your new skills in the Creator's Playground." }
  ];

  const QUESTS = [
    {
      title: "Quest 1: Which property?",
      question: "You want to change the colour of some text. Which CSS property do you use?",
      options: ["color", "font-size", "margin", "border"],
      answer: 0,
      right: "Yes! <code>color</code> changes the colour of text, like <code>color: hotpink;</code>.",
      wrong: "Not quite. Think about what each name means: <code>font-size</code> is about size, <code>margin</code> is space, <code>border</code> is an outline. Which one is about colour?"
    },
    {
      title: "Quest 2: Spot the correct rule",
      question: "Which CSS rule is written correctly?",
      options: ["p { color = red }", "p { color: red; }", "p ( color: red; )", "p { color red; }"],
      answer: 1,
      code: true,
      right: "Correct! Curly brackets <code>{ }</code>, a colon between property and value, and a semicolon at the end.",
      wrong: "Look closely: a rule needs curly brackets <code>{ }</code>, a colon <code>:</code> between the property and the value, and a semicolon <code>;</code> at the end."
    },
    {
      title: "Quest 3: Finish the rule",
      question: "Make every heading bigger. What goes in the gap?   h1 { ____: 48px; }",
      options: ["font-size", "color", "border-radius", "background-color"],
      answer: 0,
      right: "Right! <code>font-size: 48px;</code> makes the text bigger.",
      wrong: "Hmm. <code>48px</code> is a size, so the property must be about size. Which one controls the size of text?"
    }
  ];

  const $ = id => document.getElementById(id);

  // ---- state ----
  function freshState() {
    return {
      v: 1, step: 0, maxStep: 0,
      props: [],
      tower: { color: "", radius: 0, height: "", glow: false },
      quests: [false, false, false],
      sign: { text: "My City", color: SIGN_COLOURS[0].value, font: "sans-serif", size: 36, glow: true },
      signSaved: false,
      savedSign: null
    };
  }

  const clampInt = (n, lo, hi, d) => (Number.isInteger(n) ? Math.min(hi, Math.max(lo, n)) : d);
  const cleanText = (s, max) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "");

  function cleanSign(d, fallback) {
    const s = Object.assign({}, fallback);
    if (!d || typeof d !== "object") return s;
    const text = cleanText(d.text, MAX_SIGN_CHARS);
    if (text) s.text = text;
    if (SIGN_COLOURS.some(c => c.value === d.color)) s.color = d.color;
    if (FONTS.includes(d.font)) s.font = d.font;
    s.size = clampInt(d.size, 20, 56, s.size);
    if (typeof d.glow === "boolean") s.glow = d.glow;
    return s;
  }

  function readState() {
    let d;
    try { d = JSON.parse(localStorage.getItem(STATE_KEY)); } catch (e) { return null; }
    if (!d || typeof d !== "object" || d.v !== 1) return null;
    const s = freshState();
    s.step = clampInt(d.step, 0, LAST_STEP, 0);
    s.maxStep = clampInt(d.maxStep, s.step, LAST_STEP, s.step);
    s.props = Array.isArray(d.props) ? d.props.filter((p, i, a) => TOWER_PROPS.includes(p) && a.indexOf(p) === i) : [];
    const t = d.tower && typeof d.tower === "object" ? d.tower : {};
    s.tower = {
      color: WALLS.some(w => w.value === t.color) ? t.color : "",
      radius: clampInt(t.radius, 0, 40, 0),
      height: HEIGHTS.includes(t.height) ? t.height : "",
      glow: t.glow === true
    };
    s.quests = QUESTS.map((q, i) => Array.isArray(d.quests) && d.quests[i] === true);
    s.sign = cleanSign(d.sign, s.sign);
    s.signSaved = d.signSaved === true && !!d.savedSign;
    s.savedSign = s.signSaved ? cleanSign(d.savedSign, s.sign) : null;
    if (!s.signSaved) s.signSaved = false;
    return s;
  }

  let state = readState() || freshState();

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: the page still works */ }
  }

  // ---- completion record (never overwritten) ----
  function readDone() {
    try {
      const d = JSON.parse(localStorage.getItem(DONE_KEY));
      if (d && d.v === 1 && d.done === true) return d;
    } catch (e) { /* missing, corrupt or unavailable: not complete */ }
    return null;
  }

  function requirementsMet() {
    return state.props.length >= PROPS_NEEDED && state.quests.every(Boolean) && state.signSaved && !!state.savedSign;
  }

  /** "saved" | "already" | "failed" | "notmet" */
  function recordComplete() {
    if (!requirementsMet()) return "notmet";
    if (readDone()) return "already";
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify({ v: 1, done: true, completedAt: new Date().toISOString() }));
    } catch (e) {
      return "failed";
    }
    return readDone() ? "saved" : "failed";
  }

  // ---- small helpers ----
  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function setPixel(expr, html) {
    const speech = $("m3-pixel-speech");
    const avatar = $("m3-pixel-avatar");
    const tag = $("m3-pixel-tag");
    if (speech && html) speech.innerHTML = html;     // fixed strings written in this file
    if (avatar) {
      avatar.setAttribute("data-expression", expr);
      avatar.setAttribute("aria-label", `Pixel Mascot (${expr})`);
    }
    if (tag) {
      tag.textContent = expr.charAt(0).toUpperCase() + expr.slice(1);
      tag.className = `pixel-expression-pill expr-pill-${expr}`;
    }
  }

  const panels = Array.from({ length: LAST_STEP + 1 }, (_, i) => $("m3-step-" + i));
  const pills = Array.from(document.querySelectorAll(".mission-stepper .step-pill"));
  const prevBtn = $("m3-prev");
  const nextBtn = $("m3-next");
  const hintEl = $("m3-hint");

  function showHint(text) {
    if (!hintEl) return;
    hintEl.textContent = text;
    hintEl.hidden = text === "";
  }

  // ---- swatches ----
  function buildSwatches(containerId, list, getValue, onPick) {
    const box = $(containerId);
    box.textContent = "";
    list.forEach(c => {
      const b = el("button", "m3-swatch");
      b.type = "button";
      b.style.backgroundColor = c.value;
      b.setAttribute("aria-label", c.label);
      b.setAttribute("title", c.label);
      b.dataset.value = c.value;
      b.addEventListener("click", () => onPick(c.value));
      box.appendChild(b);
    });
    return function refresh() {
      Array.from(box.children).forEach(b => b.setAttribute("aria-pressed", b.dataset.value === getValue() ? "true" : "false"));
    };
  }

  // ---- step 2: the tower ----
  const tower = $("m3-tower");
  const towerCode = $("m3-tower-code");
  const towerCount = $("m3-tower-count");
  const radiusInput = $("m3-radius");
  const radiusOut = $("m3-radius-out");
  const heightSelect = $("m3-height");
  const glowInput = $("m3-glow");

  function addProp(name) {
    if (!state.props.includes(name)) state.props.push(name);
  }

  function renderTower() {
    const t = state.tower;
    const glowColour = t.color || "#38bdf8";
    tower.style.backgroundColor = t.color || "";
    tower.style.borderRadius = t.radius ? t.radius + "px" : "";
    tower.style.height = t.height || "";
    tower.style.boxShadow = t.glow ? `0 0 24px ${glowColour}` : "";
    radiusOut.textContent = t.radius + "px";
    radiusInput.value = String(t.radius);
    heightSelect.value = t.height;
    glowInput.checked = t.glow;

    const lines = [];
    if (t.color) lines.push(`  background-color: ${t.color};`);
    if (t.radius) lines.push(`  border-radius: ${t.radius}px;`);
    if (t.height) lines.push(`  height: ${t.height};`);
    if (t.glow) lines.push(`  box-shadow: 0 0 24px ${glowColour};`);
    towerCode.textContent = [".tower {", ...lines, "}"].join("\n");

    const n = state.props.length;
    towerCount.textContent = n >= PROPS_NEEDED
      ? `✅ You changed ${n} different settings. Nice work!`
      : `You have changed ${n} of ${PROPS_NEEDED} different settings.`;
    towerCount.classList.toggle("is-good", n >= PROPS_NEEDED);
  }

  const refreshWallSwatches = buildSwatches("m3-wall-swatches", WALLS, () => state.tower.color, value => {
    state.tower.color = value;
    addProp("background-color");
    onTowerChange("Nice colour! That's <code>background-color</code>: the paint on the wall.");
  });

  radiusInput.addEventListener("input", () => {
    state.tower.radius = clampInt(Number(radiusInput.value), 0, 40, 0);
    if (state.tower.radius > 0) addProp("border-radius");
    onTowerChange(state.tower.radius > 0 ? "Rounder! <code>border-radius</code> softens the corners." : "");
  });
  heightSelect.addEventListener("change", () => {
    state.tower.height = HEIGHTS.includes(heightSelect.value) ? heightSelect.value : "";
    if (state.tower.height) addProp("height");
    onTowerChange(state.tower.height ? "<code>height</code> decides how tall the tower stands." : "");
  });
  glowInput.addEventListener("change", () => {
    state.tower.glow = glowInput.checked;
    if (state.tower.glow) addProp("box-shadow");
    onTowerChange(state.tower.glow ? "Glow on! <code>box-shadow</code> draws a soft shadow, and a bright colour makes it look like neon." : "");
  });

  function onTowerChange(pixelHtml) {
    renderTower();
    refreshWallSwatches();
    if (pixelHtml) setPixel("happy", `<strong>Look at that! ✨</strong><br>${pixelHtml}`);
    saveState();
    refreshGate();
    if (state.step === 1) showHint("");
  }

  // ---- step 3: the quests ----
  const questsBox = $("m3-quests");
  const questCount = $("m3-quest-count");
  const questEls = [];

  function renderQuestCount() {
    const n = state.quests.filter(Boolean).length;
    questCount.textContent = n === QUESTS.length ? "✅ All 3 quests solved!" : `${n} of ${QUESTS.length} quests solved.`;
    questCount.classList.toggle("is-good", n === QUESTS.length);
  }

  function buildQuests() {
    questsBox.textContent = "";
    QUESTS.forEach((q, qi) => {
      const box = el("div", "challenge-box");
      box.appendChild(el("p", "m3-quest-title", q.title));
      box.appendChild(el("p", "challenge-question", q.question));
      const grid = el("div", "challenge-options-grid");
      const fb = el("div", "challenge-feedback-box");
      fb.setAttribute("role", "status");
      const buttons = q.options.map((text, oi) => {
        const b = el("button", "challenge-option-btn");
        b.type = "button";
        const label = el(q.code ? "code" : "span", "", text);
        b.appendChild(label);
        b.addEventListener("click", () => answer(qi, oi));
        grid.appendChild(b);
        return b;
      });
      box.append(grid, fb);
      questsBox.appendChild(box);
      questEls.push({ buttons, fb });
    });
  }

  function paintQuest(qi) {
    const q = QUESTS[qi];
    const { buttons, fb } = questEls[qi];
    if (state.quests[qi]) {
      buttons.forEach((b, oi) => {
        b.disabled = true;
        b.classList.toggle("correct", oi === q.answer);
      });
      fb.className = "challenge-feedback-box show correct";
      fb.innerHTML = q.right;                  // fixed text written in this file
    }
  }

  function answer(qi, oi) {
    const q = QUESTS[qi];
    const { buttons, fb } = questEls[qi];
    if (state.quests[qi]) return;
    if (oi === q.answer) {
      state.quests[qi] = true;
      paintQuest(qi);
      setPixel("excited", `<strong>Quest solved! 🎯</strong><br>${q.right}`);
    } else {
      buttons[oi].classList.add("wrong");
      buttons[oi].disabled = true;
      fb.className = "challenge-feedback-box show wrong";
      fb.innerHTML = q.wrong;
      setPixel("encouraging", `<strong>Good try! 💪</strong><br>${q.wrong}`);
    }
    renderQuestCount();
    saveState();
    refreshGate();
    if (state.step === 2) showHint("");
  }

  // ---- step 4: the sign ----
  const sign = $("m3-sign");
  const signCode = $("m3-sign-code");
  const signText = $("m3-sign-text");
  const signFont = $("m3-sign-font");
  const signSize = $("m3-sign-size");
  const signSizeOut = $("m3-sign-size-out");
  const signGlow = $("m3-sign-glow");
  const signSave = $("m3-sign-save");
  const signStatus = $("m3-sign-status");

  function styleSign(target, s) {
    target.style.color = s.color;
    target.style.fontFamily = s.font;
    target.style.fontSize = s.size + "px";
    target.style.textShadow = s.glow ? `0 0 12px ${s.color}` : "none";
  }

  function sameSign(a, b) {
    return !!a && !!b && a.text === b.text && a.color === b.color && a.font === b.font && a.size === b.size && a.glow === b.glow;
  }

  function renderSign() {
    const s = state.sign;
    sign.textContent = s.text || " ";
    styleSign(sign, s);
    signSizeOut.textContent = s.size + "px";
    signSize.value = String(s.size);
    signFont.value = s.font;
    signGlow.checked = s.glow;
    if (signText.value !== s.text) signText.value = s.text;
    const lines = [".sign {", `  color: ${s.color};`, `  font-family: ${s.font};`, `  font-size: ${s.size}px;`];
    if (s.glow) lines.push(`  text-shadow: 0 0 12px ${s.color};`);
    lines.push("}");
    signCode.textContent = lines.join("\n");

    if (state.signSaved && sameSign(state.savedSign, s)) {
      signStatus.textContent = "✅ Saved! Your design is ready.";
      signStatus.className = "m5-status is-good";
    } else if (state.signSaved) {
      signStatus.textContent = "You changed your sign. Press Save my design to keep the new look.";
      signStatus.className = "m5-status is-warn";
    } else {
      signStatus.textContent = "";
      signStatus.className = "m5-status";
    }
  }

  const refreshSignSwatches = buildSwatches("m3-sign-swatches", SIGN_COLOURS, () => state.sign.color, value => {
    state.sign.color = value;
    onSignChange();
  });

  signText.addEventListener("input", () => {
    state.sign.text = cleanText(signText.value, MAX_SIGN_CHARS) || "";
    onSignChange(true);
  });
  signFont.addEventListener("change", () => {
    state.sign.font = FONTS.includes(signFont.value) ? signFont.value : "sans-serif";
    onSignChange();
  });
  signSize.addEventListener("input", () => {
    state.sign.size = clampInt(Number(signSize.value), 20, 56, 36);
    onSignChange();
  });
  signGlow.addEventListener("change", () => {
    state.sign.glow = signGlow.checked;
    onSignChange();
  });

  function onSignChange(fromText) {
    // Typing must never rewrite the box under the learner's cursor
    if (fromText) {
      const keep = signText.value;
      renderSign();
      signText.value = keep;
    } else {
      renderSign();
    }
    refreshSignSwatches();
    saveState();
    refreshGate();
    if (state.step === 3) showHint("");
  }

  signSave.addEventListener("click", () => {
    const text = cleanText(state.sign.text, MAX_SIGN_CHARS);
    if (!text) {
      signStatus.textContent = "Type some words for your sign first.";
      signStatus.className = "m5-status is-warn";
      signText.focus();
      return;
    }
    state.sign.text = text;
    state.savedSign = Object.assign({}, state.sign);
    state.signSaved = true;
    renderSign();
    saveState();
    refreshGate();
    setPixel("excited", "<strong>Your sign is saved! 🌟</strong><br>It looks great. Press <strong>Finish the mission</strong> when you're ready.");
    showHint("");
  });

  // ---- step 5: celebrate ----
  function renderCelebrate() {
    const done = $("m3-final-sign");
    const s = state.savedSign || state.sign;
    done.textContent = s.text;
    styleSign(done, s);
    $("m3-sum-props").textContent = state.props.length ? state.props.join(", ") : "none";
    $("m3-sum-quests").textContent = `${state.quests.filter(Boolean).length} of ${QUESTS.length} solved`;

    const note = $("m3-complete-note");
    const result = recordComplete();
    if (result === "saved") {
      note.textContent = "✅ Mission 03 complete! It is saved on this device, and CSS City is marked as finished.";
      note.className = "m5-status is-good";
    } else if (result === "already") {
      note.textContent = "✅ You completed this mission before, and that record stays safe.";
      note.className = "m5-status is-good";
    } else if (result === "failed") {
      note.textContent = "Your browser would not let me save your progress, so the mission may not show as complete. You still did it!";
      note.className = "m5-status is-warn";
    } else {
      note.textContent = "Almost! Go back and finish every step so the mission can count as complete.";
      note.className = "m5-status is-warn";
    }
  }

  // ---- gates and navigation ----
  function gateText(step) {
    if (step === 1 && state.props.length < PROPS_NEEDED) {
      const left = PROPS_NEEDED - state.props.length;
      return `Change ${left} more different setting${left === 1 ? "" : "s"} on the tower to continue.`;
    }
    if (step === 2 && !state.quests.every(Boolean)) {
      return `Solve all 3 quests to continue (${state.quests.filter(Boolean).length} of 3 done).`;
    }
    if (step === 3 && !state.signSaved) return "Press Save my design to continue.";
    return "";
  }

  function refreshGate() {
    const locked = state.step < LAST_STEP && gateText(state.step) !== "";
    if (locked) nextBtn.setAttribute("aria-disabled", "true"); else nextBtn.removeAttribute("aria-disabled");
    nextBtn.classList.toggle("is-locked", locked);
  }

  function renderStep(moveFocus) {
    const step = state.step;
    panels.forEach((p, i) => p.classList.toggle("active", i === step));
    pills.forEach((b, i) => {
      b.classList.toggle("active", i === step);
      b.classList.toggle("completed", i < step && i <= state.maxStep);
      b.disabled = i > state.maxStep;
      if (i === step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    setPixel(PIXEL[step].expr, PIXEL[step].html);
    prevBtn.disabled = step === 0;
    nextBtn.hidden = step === LAST_STEP;
    nextBtn.textContent = STEPS[step].next;
    showHint("");
    if (step === 4) renderCelebrate();
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

  function go(step, moveFocus) {
    state.step = Math.max(0, Math.min(LAST_STEP, step));
    if (state.step > state.maxStep) state.maxStep = state.step;
    renderStep(moveFocus !== false);
  }

  nextBtn.addEventListener("click", () => {
    const why = gateText(state.step);
    if (why) { showHint(why); return; }
    go(state.step + 1);
  });
  prevBtn.addEventListener("click", () => go(state.step - 1));
  pills.forEach((b, i) => b.addEventListener("click", () => { if (!b.disabled) go(i); }));

  // Leaving from the celebration step ends this attempt. The completion record stays.
  const leave = $("m3-leave");
  if (leave) leave.addEventListener("click", () => { try { localStorage.removeItem(STATE_KEY); } catch (e) { /* nothing to remove */ } });

  // ---- start ----
  const before = readDone();
  const banner = $("m3-done-banner");
  if (before && banner) {
    banner.textContent = "🎉 You already completed this mission. You can replay it any time. Your first completion stays recorded.";
    banner.hidden = false;
  }

  buildQuests();
  QUESTS.forEach((q, i) => paintQuest(i));
  renderQuestCount();
  renderTower();
  refreshWallSwatches();
  renderSign();
  refreshSignSwatches();
  renderStep(false);
})();
