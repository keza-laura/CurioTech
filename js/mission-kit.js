// ==========================================================================
// CurioTech: shared mission engine (used by mission-02.html and mission-04.html)
//
// A mission page has five steps (panels "<prefix>-step-0" .. "-4"), a stepper, Back / Continue buttons,
// Pixel, an optional quest list, and a completion record. This file owns everything that is the same for
// every mission; each mission's own file only describes its content and its two or three live activities.
//
//   CurioMission.start({
//     prefix, name, stateKey, doneKey,         // ids start with "<prefix>-", e.g. "m2-next"
//     steps:  [{ next: "Continue →" } x5],      // label of the Continue button on each step
//     pixel:  [{ expr, html } x5],              // what Pixel says on each step (fixed text written in code)
//     quests: [{ title, question, options, answer, code?, right, wrong }],   // shown in "<prefix>-quests"
//     freshData(), cleanData(raw),              // the mission's own saved state (always validated on read)
//     gate(step, ctx) -> string,                // "" when the learner may continue, else what is missing
//     met(ctx) -> boolean,                      // are the mission's own requirements met? (quests are checked here)
//     init(ctx),                                // bind the live activities once
//     render(step, ctx)                         // paint a step (called every time a step is shown)
//   })
//
// Completion (localStorage doneKey -> { v: 1, done: true, completedAt }) is written ONLY when the learner is
// on the celebration step AND met(ctx) is true AND every quest is solved. An existing record is never
// overwritten. In-progress state (stateKey) lets the learner close the tab and come back; it is cleared when
// they leave from the celebration step. Nothing here reads or writes another mission's keys.
// ==========================================================================

(function () {
  "use strict";

  const LAST_STEP = 4;

  const clampInt = (n, lo, hi, d) => (Number.isInteger(n) ? Math.min(hi, Math.max(lo, n)) : d);
  const cleanText = (s, max) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "");

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function start(cfg) {
    const p = cfg.prefix;
    const $ = id => document.getElementById(p + "-" + id);

    // ---- state ----
    function freshState() {
      return { v: 1, step: 0, maxStep: 0, quests: cfg.quests.map(() => false), data: cfg.freshData() };
    }

    function readState() {
      let d;
      try { d = JSON.parse(localStorage.getItem(cfg.stateKey)); } catch (e) { return null; }
      if (!d || typeof d !== "object" || d.v !== 1) return null;
      const s = freshState();
      s.step = clampInt(d.step, 0, LAST_STEP, 0);
      s.maxStep = clampInt(d.maxStep, s.step, LAST_STEP, s.step);
      s.quests = cfg.quests.map((q, i) => Array.isArray(d.quests) && d.quests[i] === true);
      s.data = cfg.cleanData(d.data);
      return s;
    }

    const state = readState() || freshState();

    function save() {
      try { localStorage.setItem(cfg.stateKey, JSON.stringify(state)); } catch (e) { /* storage unavailable: the page still works */ }
    }

    // ---- completion record (never overwritten) ----
    function readDone() {
      try {
        const d = JSON.parse(localStorage.getItem(cfg.doneKey));
        if (d && d.v === 1 && d.done === true) return d;
      } catch (e) { /* missing, corrupt or unavailable: not complete */ }
      return null;
    }

    function allQuestsSolved() { return state.quests.every(Boolean); }

    /** "saved" | "already" | "failed" | "notmet" */
    function recordComplete() {
      if (!allQuestsSolved() || !cfg.met(ctx)) return "notmet";
      if (readDone()) return "already";
      try {
        localStorage.setItem(cfg.doneKey, JSON.stringify({ v: 1, done: true, completedAt: new Date().toISOString() }));
      } catch (e) {
        return "failed";
      }
      return readDone() ? "saved" : "failed";
    }

    // ---- Pixel and hints ----
    function setPixel(expr, html) {
      const speech = $("pixel-speech");
      const avatar = $("pixel-avatar");
      const tag = $("pixel-tag");
      if (speech && html) speech.innerHTML = html;     // fixed strings written in the mission's own file
      if (avatar) {
        avatar.setAttribute("data-expression", expr);
        avatar.setAttribute("aria-label", `Pixel Mascot (${expr})`);
      }
      if (tag) {
        tag.textContent = expr.charAt(0).toUpperCase() + expr.slice(1);
        tag.className = `pixel-expression-pill expr-pill-${expr}`;
      }
    }

    const hintEl = $("hint");
    function showHint(text) {
      if (!hintEl) return;
      hintEl.textContent = text;
      hintEl.hidden = text === "";
    }

    // ---- gates and steps ----
    const panels = Array.from({ length: LAST_STEP + 1 }, (_, i) => $("step-" + i));
    const pills = Array.from(document.querySelectorAll(".mission-stepper .step-pill"));
    const prevBtn = $("prev");
    const nextBtn = $("next");

    function gateText(step) {
      if (step === 2 && !allQuestsSolved()) {
        return `Solve all ${cfg.quests.length} quests to continue (${state.quests.filter(Boolean).length} of ${cfg.quests.length} done).`;
      }
      return cfg.gate(step, ctx) || "";
    }

    function refreshGate() {
      const locked = state.step < LAST_STEP && gateText(state.step) !== "";
      if (locked) nextBtn.setAttribute("aria-disabled", "true"); else nextBtn.removeAttribute("aria-disabled");
      nextBtn.classList.toggle("is-locked", locked);
    }

    function renderCelebrateNote() {
      const note = $("complete-note");
      if (!note) return;
      const result = recordComplete();
      const texts = {
        saved: [`✅ ${cfg.name} complete! It is saved on this device.`, "is-good"],
        already: ["✅ You completed this mission before, and that record stays safe.", "is-good"],
        failed: ["Your browser would not let me save your progress, so the mission may not show as complete. You still did it!", "is-warn"],
        notmet: ["Almost! Go back and finish every step so the mission can count as complete.", "is-warn"]
      };
      note.textContent = texts[result][0];
      note.className = "m5-status " + texts[result][1];
      // The way on to the next mission appears once this one is on record
      const nextLink = $("next-mission");
      if (nextLink) nextLink.hidden = !(result === "saved" || result === "already");
    }

    function renderStep(moveFocus) {
      const step = state.step;
      panels.forEach((pn, i) => pn.classList.toggle("active", i === step));
      pills.forEach((b, i) => {
        b.classList.toggle("active", i === step);
        b.classList.toggle("completed", i < step && i <= state.maxStep);
        b.disabled = i > state.maxStep;
        if (i === step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      setPixel(cfg.pixel[step].expr, cfg.pixel[step].html);
      prevBtn.disabled = step === 0;
      nextBtn.hidden = step === LAST_STEP;
      nextBtn.textContent = cfg.steps[step].next;
      showHint("");
      cfg.render(step, ctx);
      if (step === LAST_STEP) renderCelebrateNote();
      refreshGate();
      save();

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

    // ---- quests ----
    const questsBox = $("quests");
    const questCount = $("quest-count");
    const questEls = [];

    function renderQuestCount() {
      if (!questCount) return;
      const n = state.quests.filter(Boolean).length;
      questCount.textContent = n === cfg.quests.length ? `✅ All ${cfg.quests.length} quests solved!` : `${n} of ${cfg.quests.length} quests solved.`;
      questCount.classList.toggle("is-good", n === cfg.quests.length);
    }

    function paintQuest(qi) {
      const q = cfg.quests[qi];
      const { buttons, fb } = questEls[qi];
      if (!state.quests[qi]) return;
      buttons.forEach((b, oi) => {
        b.disabled = true;
        b.classList.toggle("correct", oi === q.answer);
      });
      fb.className = "challenge-feedback-box show correct";
      fb.innerHTML = q.right;                 // fixed text written in the mission's own file
    }

    function answer(qi, oi) {
      const q = cfg.quests[qi];
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
      save();
      refreshGate();
      if (state.step === 2) showHint("");
    }

    function buildQuests() {
      if (!questsBox) return;
      questsBox.textContent = "";
      cfg.quests.forEach((q, qi) => {
        const box = el("div", "challenge-box");
        box.appendChild(el("p", "m3-quest-title", q.title));
        box.appendChild(el("p", "challenge-question", q.question));
        const grid = el("div", "challenge-options-grid");
        const fb = el("div", "challenge-feedback-box");
        fb.setAttribute("role", "status");
        const buttons = q.options.map((text, oi) => {
          const b = el("button", "challenge-option-btn");
          b.type = "button";
          b.appendChild(el(q.code ? "code" : "span", "", text));
          b.addEventListener("click", () => answer(qi, oi));
          grid.appendChild(b);
          return b;
        });
        box.append(grid, fb);
        questsBox.appendChild(box);
        questEls.push({ buttons, fb });
      });
    }

    // ---- what mission files get to use ----
    const ctx = {
      state,
      get data() { return state.data; },
      save,
      refreshGate,
      setPixel,
      showHint,
      go,
      /** Call after the learner changes something in a live activity */
      changed(pixelExpr, pixelHtml) {
        if (pixelHtml) setPixel(pixelExpr || "happy", pixelHtml);
        save();
        refreshGate();
        if (state.step === 1 || state.step === 3) showHint("");
      },
      clampInt,
      cleanText,
      el
    };

    nextBtn.addEventListener("click", () => {
      const why = gateText(state.step);
      if (why) { showHint(why); return; }
      go(state.step + 1);
    });
    prevBtn.addEventListener("click", () => go(state.step - 1));
    pills.forEach((b, i) => b.addEventListener("click", () => { if (!b.disabled) go(i); }));

    const leave = $("leave");
    if (leave) leave.addEventListener("click", () => { try { localStorage.removeItem(cfg.stateKey); } catch (e) { /* nothing to remove */ } });

    // ---- start ----
    const banner = $("done-banner");
    if (readDone() && banner) {
      banner.textContent = "🎉 You already completed this mission. You can replay it any time. Your first completion stays recorded.";
      banner.hidden = false;
    }
    buildQuests();
    cfg.quests.forEach((q, i) => paintQuest(i));
    renderQuestCount();
    cfg.init(ctx);
    renderStep(false);
    return ctx;
  }

  window.CurioMission = Object.freeze({ start, LAST_STEP });
})();
