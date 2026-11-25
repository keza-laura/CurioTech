// ==========================================================================
// CurioTech: shared mission engine (used by every mission page)
//
// A mission page is a row of steps (panels), a stepper, Back / Continue buttons, Pixel, an optional quest
// list, and a completion record. This file owns everything that is the same for every mission; each
// mission's own file only describes its content and its live activities.
//
//   CurioMission.start({
//     prefix, name, stateKey, doneKey,          // element ids default to "<prefix>-..." (e.g. "m2-next")
//     steps:  [{ next: "Continue →" | fn(ctx) }],   // one entry per step; label of the Continue button
//     pixel:  [{ expr, html }],                 // what Pixel says on each step (fixed text written in code)
//     quests: [...],                            // optional quest list shown in "<prefix>-quests" (step 3)
//     freshData(), cleanData(raw),              // the mission's own saved state (always validated on read)
//     gate(step, ctx) -> string,                // "" when the learner may continue, else what is missing
//     met(ctx) -> boolean,                      // are the mission's own requirements met?
//     init(ctx), render(step, ctx),             // bind the live activities once / paint a step
//
//     // optional
//     panelSelector,        // e.g. ".stage-panel" when panels are not named "<prefix>-step-N"
//     dom: { next, prev, hint, pixelSpeech, pixelAvatar, pixelTag, note, leave, banner, nextMission },   // ids
//     liveHint,             // false: the mission writes its own hint text (default true)
//     plainNote,            // true: leave the completion note's own styling alone
//     messages,             // { saved, already, failed, notmet } overrides for the completion note
//     bannerText(record),   // text for the "already completed" banner
//     beforeNext(step, ctx) -> false to veto moving on (the mission explains why itself)
//     beforeSave(ctx), afterRender(step, ctx), pixelLive(step) -> "polite" | "off",
//     canCelebrate(ctx) -> false to send the learner back one step instead of celebrating,
//     recordExtra(ctx) -> extra fields for the completion record,
//     finalNext(ctx) -> { label, href }: the Continue button on the last step leads on to this page
//   })
//
// Completion (localStorage doneKey -> { v: 1, done: true, completedAt, ...extra }) is written ONLY when the
// learner is on the last step AND met(ctx) is true AND every quest is solved. An existing record is never
// overwritten. In-progress state (stateKey) lets the learner close the tab and come back; it is cleared
// when they leave from the last step. Nothing here reads or writes another mission's keys.
// ==========================================================================

(function () {
  "use strict";

  const clampInt = (n, lo, hi, d) => (Number.isInteger(n) ? Math.min(hi, Math.max(lo, n)) : d);
  const cleanText = (s, max) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "");

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  const KEYS = {
    pixelSpeech: "pixel-speech", pixelAvatar: "pixel-avatar", pixelTag: "pixel-tag", hint: "hint",
    prev: "prev", next: "next", note: "complete-note", leave: "leave", banner: "done-banner",
    nextMission: "next-mission", quests: "quests", questCount: "quest-count"
  };

  function start(cfg) {
    const p = cfg.prefix;
    const last = cfg.steps.length - 1;
    const quests = cfg.quests || [];
    const $ = key => document.getElementById((cfg.dom && cfg.dom[key]) || (p + "-" + KEYS[key]));
    const liveHint = cfg.liveHint !== false;

    // ---- state ----
    function freshState() {
      return { v: 1, step: 0, maxStep: 0, quests: quests.map(() => false), data: cfg.freshData() };
    }

    function readState() {
      let d;
      try { d = JSON.parse(localStorage.getItem(cfg.stateKey)); } catch (e) { return null; }
      // A saved state from before a mission moved onto this engine has no "data": start fresh instead of guessing
      if (!d || typeof d !== "object" || d.v !== 1 || !d.data || typeof d.data !== "object") return null;
      const s = freshState();
      s.step = clampInt(d.step, 0, last, 0);
      s.maxStep = clampInt(d.maxStep, s.step, last, s.step);
      s.quests = quests.map((q, i) => Array.isArray(d.quests) && d.quests[i] === true);
      s.data = cfg.cleanData(d.data);
      return s;
    }

    const state = readState() || freshState();

    function save() {
      if (cfg.beforeSave) cfg.beforeSave(ctx);
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
        const extra = cfg.recordExtra ? cfg.recordExtra(ctx) : {};
        localStorage.setItem(cfg.doneKey, JSON.stringify(Object.assign({ v: 1, done: true, completedAt: new Date().toISOString() }, extra)));
      } catch (e) {
        return "failed";
      }
      return readDone() ? "saved" : "failed";
    }

    // ---- Pixel and hints ----
    function setPixel(expr, html) {
      const speech = $("pixelSpeech");
      const avatar = $("pixelAvatar");
      const tag = $("pixelTag");
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
    let hintFlip = false;
    function showHint(text) {
      if (!hintEl) return;
      if (!text) { hintEl.textContent = ""; hintEl.hidden = true; return; }
      hintFlip = !hintFlip;
      hintEl.textContent = text + (hintFlip ? " " : "");   // an invisible change lets a repeated message be announced again
      hintEl.hidden = false;
    }

    // ---- gates and steps ----
    const panels = cfg.panelSelector
      ? Array.from(document.querySelectorAll(cfg.panelSelector))
      : Array.from({ length: last + 1 }, (_, i) => document.getElementById(`${p}-step-${i}`));
    let pills = Array.from(document.querySelectorAll(".mission-stepper .step-pill"));
    if (!pills.length) pills = Array.from(document.querySelectorAll(".step-pill"));
    const prevBtn = $("prev");
    const nextBtn = $("next");
    const questStep = 2;

    function gateText(step) {
      if (quests.length && step === questStep && !allQuestsSolved()) {
        return `Solve all ${quests.length} quests to continue (${state.quests.filter(Boolean).length} of ${quests.length} done).`;
      }
      return (cfg.gate && cfg.gate(step, ctx)) || "";
    }

    /** Updates the Continue button, and (unless the mission manages its own hint) any message that is showing. */
    function refreshGate() {
      const why = state.step < last ? gateText(state.step) : "";
      if (why) nextBtn.setAttribute("aria-disabled", "true"); else nextBtn.removeAttribute("aria-disabled");
      nextBtn.classList.toggle("is-locked", !!why);
      if (liveHint && hintEl && !hintEl.hidden) showHint(why);
    }

    function renderCelebrateNote() {
      const note = $("note");
      const result = recordComplete();
      if (note) {
        const msgs = Object.assign({
          saved: `${cfg.name} complete! It is saved on this device.`,
          already: "You completed this mission before, and that record stays safe.",
          failed: "Your browser would not let me save your progress, so the mission may not show as complete. You still did it!",
          notmet: "Almost! Go back and finish every step so the mission can count as complete."
        }, cfg.messages || {});
        const good = result === "saved" || result === "already";
        note.textContent = msgs[result];
        if (!cfg.plainNote) note.className = "m5-status " + (good ? "is-good" : "is-warn");
      }
      // The way on to the next mission appears once this one is on record
      const nextLink = $("nextMission");
      if (nextLink) nextLink.hidden = !(result === "saved" || result === "already");
    }

    function renderStep(moveFocus) {
      // A mission may refuse to celebrate until it is really earned (it sends the learner back instead)
      if (state.step === last && cfg.canCelebrate && !cfg.canCelebrate(ctx)) {
        state.step = last - 1;
        state.maxStep = Math.min(state.maxStep, last - 1);
      }
      const step = state.step;
      panels.forEach((pn, i) => pn.classList.toggle("active", i === step));
      pills.forEach((b, i) => {
        b.classList.toggle("active", i === step);
        b.classList.toggle("completed", i < step && i <= state.maxStep);
        b.disabled = i > state.maxStep;
        if (i === step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      const pix = cfg.pixel[step];
      setPixel(pix.expr, pix.html);
      const speech = $("pixelSpeech");
      if (speech && cfg.pixelLive) speech.setAttribute("aria-live", cfg.pixelLive(step));
      prevBtn.disabled = step === 0;
      showHint("");
      cfg.render(step, ctx);
      if (step === last) renderCelebrateNote();

      // Continue button: hidden on the last step unless the mission leads on to another page from there
      const label = cfg.steps[step].next;
      if (step === last) {
        const f = cfg.finalNext ? cfg.finalNext(ctx) : null;
        nextBtn.hidden = !f;
        if (f) nextBtn.textContent = f.label;
      } else {
        nextBtn.hidden = false;
        nextBtn.textContent = typeof label === "function" ? label(ctx) : label;
      }
      if (cfg.afterRender) cfg.afterRender(step, ctx);
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
      state.step = Math.max(0, Math.min(last, step));
      if (state.step > state.maxStep) state.maxStep = state.step;
      renderStep(moveFocus !== false);
    }

    // ---- quests ----
    const questsBox = $("quests");
    const questCount = $("questCount");
    const questEls = [];

    function renderQuestCount() {
      if (!questCount) return;
      const n = state.quests.filter(Boolean).length;
      questCount.textContent = n === quests.length ? `All ${quests.length} quests solved!` : `${n} of ${quests.length} quests solved.`;
      questCount.classList.toggle("is-good", n === quests.length);
    }

    function paintQuest(qi) {
      const q = quests[qi];
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
      const q = quests[qi];
      const { buttons, fb } = questEls[qi];
      if (state.quests[qi]) return;
      if (oi === q.answer) {
        state.quests[qi] = true;
        paintQuest(qi);
        setPixel("excited", `<strong>Quest solved!</strong><br>${q.right}`);
      } else {
        buttons[oi].classList.add("wrong");
        buttons[oi].disabled = true;
        fb.className = "challenge-feedback-box show wrong";
        fb.innerHTML = q.wrong;
        setPixel("encouraging", `<strong>Good try!</strong><br>${q.wrong}`);
      }
      renderQuestCount();
      save();
      refreshGate();
    }

    function buildQuests() {
      if (!questsBox) return;
      questsBox.textContent = "";
      quests.forEach((q, qi) => {
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
      get step() { return state.step; },
      get maxStep() { return state.maxStep; },
      save,
      refreshGate,
      setPixel,
      showHint,
      go,
      done: () => !!readDone(),
      /** Call after the learner changes something in a live activity */
      changed(pixelExpr, pixelHtml) {
        if (pixelHtml) setPixel(pixelExpr || "happy", pixelHtml);
        save();
        refreshGate();
      },
      clampInt,
      cleanText,
      el
    };

    nextBtn.addEventListener("click", () => {
      if (state.step === last) {
        const f = cfg.finalNext ? cfg.finalNext(ctx) : null;
        if (!f) return;
        try { localStorage.removeItem(cfg.stateKey); } catch (e) { /* nothing to remove */ }
        window.location.href = f.href;
        return;
      }
      if (cfg.beforeNext && cfg.beforeNext(state.step, ctx) === false) return;
      const why = gateText(state.step);
      if (why) { showHint(why); return; }
      go(state.step + 1);
    });
    prevBtn.addEventListener("click", () => { if (state.step > 0) go(state.step - 1); });
    pills.forEach((b, i) => b.addEventListener("click", () => { if (i <= state.maxStep) go(i); }));

    const leave = $("leave");
    if (leave) leave.addEventListener("click", () => { try { localStorage.removeItem(cfg.stateKey); } catch (e) { /* nothing to remove */ } });

    // ---- start ----
    const banner = $("banner");
    const before = readDone();
    if (before && banner) {
      banner.textContent = cfg.bannerText ? cfg.bannerText(before)
        : "You already completed this mission. You can replay it any time. Your first completion stays recorded.";
      banner.hidden = false;
    }
    buildQuests();
    quests.forEach((q, i) => paintQuest(i));
    renderQuestCount();
    cfg.init(ctx);
    renderStep(false);
    return ctx;
  }

  window.CurioMission = Object.freeze({ start });
})();
