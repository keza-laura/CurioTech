// ==========================================================================
// CurioTech: Mission 05 - The Creator Mission (Phase 5, Stage 5.4)
// ==========================================================================
// A guided, independent project: Idea -> Plan -> Build -> Experiment -> Save -> Celebrate.
// The building happens in the Creator's Playground, and saving uses the existing My Projects feature
// (window.CurioProjects from js/projects.js). This page never saves projects itself.
// The shared engine (js/mission-kit.js) runs the steps, pills, Pixel, saving and the completion record;
// this file holds the plan form, the checks on the saved project and the Playground hand-off.
//
// COMPLETION (localStorage "curiotech_mission_05_completed"):
//   { v: 1, done: true, completedAt, projectId, projectName }
//   Written ONLY on the celebration step AND, at that moment, a project exists that
//     1. was saved while this attempt of the mission was running (its createdAt is not before the moment
//        the attempt began, so an old project cannot count and no project is overwritten), and
//     2. has some HTML, and is not just the untouched Playground starter code.
//   The celebration step is only reached through "Finish the mission" on the Save step, which looks for that
//   project first. Opening the Playground, ticking a box or going back never completes the mission.
//   An existing record is never overwritten, and this file never reads or writes another mission's record.
//
// In-progress state (localStorage "curiotech_mission_05_progress") remembers the step, the idea, the plan
// and the attempt's start time, so the learner can go to the Playground and come back, or close the tab and
// carry on later. Leaving through the map ends the attempt. The Playground's "Back to Mission 05" bar
// reads this record (step, completed and returnLabel) and never writes it.
// ==========================================================================

(function () {
  "use strict";

  const STATE_KEY = "curiotech_mission_05_progress";
  const DONE_KEY = "curiotech_mission_05_completed";
  const MAX_IDEA_CHARS = 60;
  const MAX_NAME_CHARS = 40;


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
  const ideasHost = $("m5-ideas");
  const ownIdea = $("m5-own-idea");
  const nameInput = $("m5-name");
  const purposeSel = $("m5-purpose");
  const contentsHost = $("m5-contents");
  const builtBox = $("m5-built");
  const triedBox = $("m5-tried");
  const checkBtn = $("m5-check");
  const saveStatus = $("m5-save-status");
  if (!ideasHost || !nameInput || !purposeSel || !$("m5-next")) return;

  const cleanText = (v, max) => (typeof v === "string"
    ? v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "");

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ---- the learner's plan, kept in the engine's state (ctx.data) ----
  function freshData() {
    return {
      startedAt: new Date().toISOString(),
      ideaId: "", ideaText: "", name: "", purpose: "", contents: [],
      built: false, tried: false, completed: false, projectId: "", projectName: "",
      returnLabel: ""          // read by the Playground's "Back to Mission 05" bar
    };
  }

  /** Saved data, checked and trimmed. */
  function cleanData(d) {
    const s = freshData();
    if (!d || typeof d !== "object") return s;
    if (!isNaN(Date.parse(d.startedAt))) s.startedAt = new Date(Date.parse(d.startedAt)).toISOString();
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
    s.returnLabel = typeof d.returnLabel === "string" ? d.returnLabel.slice(0, 60) : "";
    return s;
  }

  let ctx = null;                 // set by CurioMission.start below
  const data = () => ctx.data;

  // ---- checking the learner's saved project ----
  function isStarterOnly(p) {
    return p.html === STARTER_HTML && p.css === STARTER_CSS && p.js === STARTER_JS;
  }

  /** What the Save step can see right now. kind: ok | none | old | full | starter | unavailable. */
  function evaluate() {
    const api = window.CurioProjects;
    if (!api || !api.isAvailable()) return { kind: "unavailable" };
    const list = api.list();   // newest first
    const began = Date.parse(data().startedAt) || 0;
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

  // ---- small helpers about the plan ----
  const nameOk = (name) => {
    const n = cleanText(name, 200);
    return n !== "" && Array.from(n).length <= MAX_NAME_CHARS;
  };

  const ideaLabel = () => {
    const idea = IDEAS.find(i => i.id === data().ideaId);
    if (!idea) return "";
    return idea.id === "own" ? data().ideaText : idea.label.replace(/^\S+\s/, "");
  };

  const ideaOk = () => data().ideaId !== "" && (data().ideaId !== "own" || data().ideaText.length >= 2);

  const purposeLabel = () => { const p = PURPOSES.find(x => x.id === data().purpose); return p ? p.label : ""; };

  function suggestedName() {
    const idea = IDEAS.find(i => i.id === data().ideaId);
    if (!idea) return "";
    if (idea.id !== "own") return idea.name;
    return Array.from(data().ideaText.replace(/\b\w/g, c => c.toUpperCase())).slice(0, MAX_NAME_CHARS).join("").trim();
  }

  function planCard(host) {
    host.textContent = "";
    host.appendChild(el("h3", "m5-plan-title", "Your plan"));
    const d = data();
    const rows = [
      ["Idea", ideaLabel() || "—"],
      ["Project name", d.name || "—"],
      ["For", purposeLabel() || "—"],
      ["On my page", d.contents.length ? CONTENTS.filter(c => d.contents.includes(c.id)).map(c => c.label).join(", ") : "—"]
    ];
    rows.forEach(r => {
      const p = el("p", "m5-plan-row");
      p.appendChild(el("span", "m5-plan-label", r[0]));
      p.appendChild(el("span", "m5-plan-value", r[1]));
      host.appendChild(p);
    });
  }

  // ---- the Save step: look for the saved project ----
  let lastEval = null;

  function refreshSave() {
    lastEval = evaluate();
    const d = describe(lastEval);
    if (saveStatus) {
      saveStatus.textContent = d.text;
      saveStatus.classList.toggle("is-good", d.good);
      saveStatus.classList.toggle("is-warn", !d.good);
    }
    if (ctx) ctx.refreshGate();
    return lastEval;
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

  /** Puts saved values back into the fields. */
  function fillFields() {
    const d = data();
    const radio = ideasHost.querySelector(`input[value="${d.ideaId}"]`);
    if (radio) radio.checked = true;
    ownIdea.value = d.ideaText;
    ownIdea.disabled = d.ideaId !== "own";
    nameInput.value = d.name;
    purposeSel.value = d.purpose;
    contentsHost.querySelectorAll("input").forEach(i => { i.checked = d.contents.includes(i.value); });
    builtBox.checked = d.built;
    triedBox.checked = d.tried;
  }

  // ---- the engine's mission description ----
  const MISSION = {
    prefix: "m5",
    name: "Mission 05",
    stateKey: STATE_KEY,
    doneKey: DONE_KEY,
    panelSelector: ".stage-panel",
    steps: STEPS,
    pixel: PIXEL,
    quests: [],
    freshData,
    cleanData,

    // What must be true before Continue works
    gate(step) {
      const d = data();
      switch (step) {
        case 0: return ideaOk() ? "" : "Pick an idea first. If you choose “My own idea”, type it in the box.";
        case 1: return nameOk(d.name) && d.purpose ? "" : "Give your project a name (up to 40 characters) and choose what your page is for.";
        case 2: return d.built ? "" : "Tick the box once you've opened the Playground and started building.";
        case 3: return d.tried ? "" : "Tick the box once you've run your code and looked at your preview.";
        case 4: return lastEval && lastEval.kind === "ok" ? "" : (lastEval ? describe(lastEval).text : "Press “Check my saved project” first.");
        default: return "";
      }
    },

    // The mission counts only with a real project saved after this attempt began (checked again at that moment)
    met() { return evaluate().kind === "ok"; },
    recordExtra() {
      const ev = evaluate();
      return ev.kind === "ok" ? { projectId: ev.project.id, projectName: ev.project.name } : {};
    },
    // Never celebrate on the screen alone: without a real saved project the learner goes back to the Save step
    canCelebrate() { return ctx.done() || evaluate().kind === "ok"; },

    beforeSave() {
      const step = ctx.step;
      data().returnLabel = `Step ${step + 1} of 6: ${STEPS[step].name}`;   // shown by the Playground's "Back to Mission 05" bar
    },

    // Pressing Continue on the Save step looks for the project first
    beforeNext(step) {
      if (step === 1 && !nameOk(data().name)) { nameInput.setAttribute("aria-invalid", "true"); }
      if (step === 4) refreshSave();
      return true;
    },

    messages: {
      saved: "✅ Saved! Mission 05 is recorded as complete on this device.",
      already: "✅ Mission 05 is recorded as complete on this device.",
      failed: "You finished Mission 05! This browser wouldn't let me save that, so the mission may not show as complete later."
    },

    bannerText(record) {
      return `🎉 You already completed this mission with “${record.projectName}”. You can make another project any time. Your first completion stays recorded.`;
    },

    init(c) {
      ctx = c;
      fillFields();

      // ---- events ----
      ideasHost.addEventListener("change", (e) => {
        if (!e.target || e.target.name !== "m5-idea") return;
        data().ideaId = e.target.value;
        ownIdea.disabled = data().ideaId !== "own";
        if (data().ideaId === "own") ownIdea.focus();
        ctx.changed();
      });

      ownIdea.addEventListener("input", () => {
        data().ideaText = cleanText(ownIdea.value, MAX_IDEA_CHARS);
        ctx.changed();
      });

      nameInput.addEventListener("input", () => {
        data().name = cleanText(nameInput.value, MAX_NAME_CHARS);
        nameInput.removeAttribute("aria-invalid");
        ctx.changed();
      });

      purposeSel.addEventListener("change", () => {
        data().purpose = purposeSel.value;
        ctx.changed();
      });

      contentsHost.addEventListener("change", () => {
        data().contents = Array.from(contentsHost.querySelectorAll("input:checked")).map(i => i.value);
        ctx.changed();
      });

      builtBox.addEventListener("change", () => { data().built = builtBox.checked; ctx.changed(); });
      triedBox.addEventListener("change", () => { data().tried = triedBox.checked; ctx.changed(); });

      if (checkBtn) checkBtn.addEventListener("click", () => { refreshSave(); ctx.showHint(""); });

      // Coming back from the Playground (or another tab): look again, so the learner sees their project at once.
      const recheck = () => { if (ctx.step === 4) refreshSave(); };
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") recheck(); });
      window.addEventListener("focus", recheck);
      window.addEventListener("storage", (e) => { if (e.key === null || (window.CurioProjects && e.key === window.CurioProjects.KEY)) recheck(); });
    },

    render(step) {
      const d = data();
      if (step === 1 && !nameInput.value) {
        const s = suggestedName();
        if (s) { nameInput.value = s; d.name = cleanText(s, MAX_NAME_CHARS); }
      }
      if (step === 2) planCard($("m5-plan-card-build"));
      if (step === 4) { planCard($("m5-plan-card-save")); refreshSave(); }
      if (step === 5) {
        const ev = evaluate();
        if (ev.kind === "ok") { d.completed = true; d.projectId = ev.project.id; d.projectName = ev.project.name; }
        const record = readRecord();
        $("m5-sum-project").textContent = d.projectName || (record && record.projectName) || "Your project";
        $("m5-sum-idea").textContent = ideaLabel() || "Your own idea";
      }
    }
  };

  function readRecord() {
    try {
      const r = JSON.parse(localStorage.getItem(DONE_KEY));
      return r && r.v === 1 && r.done === true ? r : null;
    } catch (e) { return null; }
  }

  // Started last, so every const above exists before the first step is painted
  CurioMission.start(MISSION);
})();
