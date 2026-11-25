// ==========================================================================
// CurioTech: Mission 04 - Bring It to Life (JavaScript Jungle)
// Steps: Discover, Experiment, Challenge, Create, Celebrate. The shared engine (js/mission-kit.js) runs the
// steps, quests, saving and the completion record. This file holds the content and the two live activities.
//
// Completion (localStorage "curiotech_mission_04_completed") needs: the click counter pressed 5 times with
// the step size changed once (Experiment), all 3 quests solved (Challenge), and a click game that was played
// until it was won and then saved (Create).
//
// IMPORTANT: no learner text is ever run as code. The "games" here are small fixed functions in this file
// that only use numbers from fixed lists; the learner's words are shown with textContent only.
// ==========================================================================

(function () {
  "use strict";

  const CLICKS_NEEDED = 5;
  const STEP_SIZES = [1, 2, 5];
  const POINTS = [2, 5, 10];
  const GOALS = [20, 50, 100];
  const MAX_LABEL = 20;
  const MAX_WIN = 30;

  const QUESTS = [
    {
      title: "Quest 1: Variables",
      question: "What does this line do?   let lives = 3;",
      options: [
        "Makes a variable called lives that remembers 3",
        "Prints the number 3 on the page",
        "Deletes something called lives",
        "Draws three little hearts"
      ],
      answer: 0,
      right: "Yes! <code>let</code> makes a variable, a named box that remembers a value.",
      wrong: "<code>let</code> is how JavaScript makes a new <strong>variable</strong>. What is a variable for? Think of a labelled box."
    },
    {
      title: "Quest 2: Events",
      question: "Which event runs your code when someone presses a button?",
      options: ["click", "paint", "sleep", "colour"],
      answer: 0,
      code: true,
      right: "Correct! <code>addEventListener(\"click\", ...)</code> waits for a click, then runs your code.",
      wrong: "Think about what a person does to a button: they press it. That action has a short name in JavaScript."
    },
    {
      title: "Quest 3: Predict the answer",
      question: "What is n at the end?   let n = 2;   n = n + 3;",
      options: ["5", "23", "3", "2"],
      answer: 0,
      code: true,
      right: "Right! <code>n = n + 3</code> means: take n (2), add 3, and store the answer (5) back in n.",
      wrong: "Read the second line as a sum: take what n holds now, add 3, then store the result back into n."
    }
  ];

  const MISSION = {
    prefix: "m4",
    name: "Mission 04",
    stateKey: "curiotech_mission_04_progress",
    doneKey: "curiotech_mission_04_completed",
    steps: [
      { next: "Continue to Experiment →" },
      { next: "Continue to Challenge →" },
      { next: "Continue to Create →" },
      { next: "Finish the mission →" },
      { next: "" }
    ],
    pixel: [
      { expr: "excited", html: "<strong>Welcome to JavaScript Jungle!</strong><br>HTML is the structure and CSS is the style. <strong>JavaScript</strong> makes a page react when someone clicks, taps or types." },
      { expr: "thinking", html: "<strong>Zap lab!</strong><br>Press the button 5 times, and change the step size at least once. Watch the code on the right of the score." },
      { expr: "encouraging", html: "<strong>Three code quests</strong><br>A wrong answer is just a clue. Read the hint and try again!" },
      { expr: "happy", html: "<strong>Build a click game!</strong><br>Set it up, then play it until you win. Press Save my game when you love it." },
      { expr: "excited", html: "<strong>You did it!</strong><br>You made a page that reacts. Try more JavaScript in the Creator's Playground!" }
    ],
    quests: QUESTS,

    freshData() {
      return {
        step: 1, clicks: 0, changedStep: false, score: 0,
        game: { label: "Zap!", points: 5, goal: 20, win: "You win!" },
        won: false,
        saved: null
      };
    },

    cleanData(d) {
      const base = this.freshData();
      if (!d || typeof d !== "object") return base;
      base.step = STEP_SIZES.includes(d.step) ? d.step : 1;
      base.clicks = CurioMission_clamp(d.clicks, 0, 9999);
      base.changedStep = d.changedStep === true;
      base.score = CurioMission_clamp(d.score, 0, 99999);
      base.game = cleanGame(d.game, base.game);
      base.won = d.won === true;
      base.saved = d.saved && typeof d.saved === "object" ? cleanGame(d.saved, base.game) : null;
      return base;
    },

    gate(step, ctx) {
      const d = ctx.data;
      if (step === 1) {
        if (d.clicks < CLICKS_NEEDED) return `Press the Zap button ${CLICKS_NEEDED - d.clicks} more time${CLICKS_NEEDED - d.clicks === 1 ? "" : "s"} to continue.`;
        if (!d.changedStep) return "Change the step size once, then press Zap again, to continue.";
      }
      if (step === 3 && !d.saved) return d.won ? "Press Save my game to continue." : "Play your game until you win, then press Save my game.";
      return "";
    },

    met(ctx) {
      const d = ctx.data;
      return d.clicks >= CLICKS_NEEDED && d.changedStep && !!d.saved;
    },

    init(ctx) { initLab(ctx); initGame(ctx); },

    render(step, ctx) {
      if (step === 1) paintLab(ctx);
      if (step === 3) paintGame(ctx);
      if (step === 4) paintCelebrate(ctx);
    }
  };

  function CurioMission_clamp(n, lo, hi) {
    return Number.isInteger(n) ? Math.min(hi, Math.max(lo, n)) : lo;
  }

  function cleanGame(g, fallback) {
    const o = Object.assign({}, fallback);
    if (!g || typeof g !== "object") return o;
    const label = typeof g.label === "string" ? g.label.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL) : "";
    const win = typeof g.win === "string" ? g.win.replace(/\s+/g, " ").trim().slice(0, MAX_WIN) : "";
    if (label) o.label = label;
    if (win) o.win = win;
    if (POINTS.includes(g.points)) o.points = g.points;
    if (GOALS.includes(g.goal)) o.goal = g.goal;
    return o;
  }

  const $ = id => document.getElementById(id);

  // ------------------------------------------------------------------------
  // Experiment: the zap counter
  // ------------------------------------------------------------------------
  function labCode(d) {
    return [
      "let score = 0;",
      "",
      'zapButton.addEventListener("click", function () {',
      `  score = score + ${d.step};`,
      "  showScore.textContent = score;",
      "});"
    ].join("\n");
  }

  function paintLab(ctx) {
    const d = ctx.data;
    $("m4-lab-score").textContent = String(d.score);
    $("m4-lab-step").value = String(d.step);
    $("m4-lab-code").textContent = labCode(d);
    const left = Math.max(0, CLICKS_NEEDED - d.clicks);
    const out = $("m4-lab-count");
    const ok = left === 0 && d.changedStep;
    out.textContent = ok
      ? `${d.clicks} zaps and a new step size. Nice work!`
      : `${Math.min(d.clicks, CLICKS_NEEDED)} of ${CLICKS_NEEDED} zaps${d.changedStep ? "" : ", and the step size is still unchanged"}.`;
    out.classList.toggle("is-good", ok);
  }

  function initLab(ctx) {
    $("m4-lab-zap").addEventListener("click", () => {
      const d = ctx.data;
      d.score += d.step;               // the same idea the code panel shows
      d.clicks += 1;
      paintLab(ctx);
      ctx.changed(d.clicks === CLICKS_NEEDED ? "excited" : "happy",
        `<strong>Zap!</strong><br>The click event ran your code: <code>score = score + ${d.step}</code>. The score is now ${d.score}.`);
    });
    $("m4-lab-step").addEventListener("change", () => {
      const v = Number($("m4-lab-step").value);
      const before = ctx.data.step;
      ctx.data.step = STEP_SIZES.includes(v) ? v : 1;
      if (ctx.data.step !== before) ctx.data.changedStep = true;
      paintLab(ctx);
      ctx.changed("thinking", `<strong>You edited the code!</strong><br>Now each zap adds ${ctx.data.step}. Press Zap to see it.`);
    });
    $("m4-lab-reset").addEventListener("click", () => {
      ctx.data.score = 0;
      paintLab(ctx);
      ctx.changed("thinking", "<strong>Score reset.</strong><br>A variable can be set back to 0 any time.");
    });
  }

  // ------------------------------------------------------------------------
  // Create: your own click game
  // ------------------------------------------------------------------------
  let gameScore = 0;       // this play only; never saved

  function gameCode(g) {
    return [
      "let score = 0;",
      `const goal = ${g.goal};`,
      "",
      `// the button says ${JSON.stringify(g.label)}`,
      'gameButton.addEventListener("click", function () {',
      `  score = score + ${g.points};`,
      "  if (score >= goal) {",
      `    message.textContent = ${JSON.stringify(g.win)};`,
      "  }",
      "});"
    ].join("\n");
  }

  function paintGame(ctx) {
    const g = ctx.data.game;
    const btn = $("m4-game-btn");
    btn.textContent = g.label;
    $("m4-game-score").textContent = `${gameScore} / ${g.goal}`;
    const pct = Math.min(100, Math.round((gameScore / g.goal) * 100));
    $("m4-game-fill").style.width = pct + "%";
    $("m4-game-bar").setAttribute("aria-valuenow", String(pct));
    const msg = $("m4-game-msg");
    msg.textContent = gameScore >= g.goal ? g.win : "";
    $("m4-game-code").textContent = gameCode(g);
    ["m4-in-label", "m4-in-win"].forEach((id, i) => { const f = $(id); const v = i === 0 ? g.label : g.win; if (f.value.trim() !== v) f.value = v; });
    $("m4-in-points").value = String(g.points);
    $("m4-in-goal").value = String(g.goal);

    const st = $("m4-game-status");
    const same = ctx.data.saved && JSON.stringify(ctx.data.saved) === JSON.stringify(g);
    if (same) { st.textContent = "Saved! Your game is ready."; st.className = "m5-status is-good"; }
    else if (ctx.data.saved) { st.textContent = "You changed your game. Win it again, then press Save my game to keep the new version."; st.className = "m5-status is-warn"; }
    else { st.textContent = ""; st.className = "m5-status"; }
  }

  function gameChanged(ctx) {
    gameScore = 0;
    ctx.data.won = false;
    paintGame(ctx);
    ctx.changed();
  }

  function initGame(ctx) {
    $("m4-game-btn").addEventListener("click", () => {
      const g = ctx.data.game;
      gameScore += g.points;           // the same idea the code panel shows
      if (gameScore >= g.goal && !ctx.data.won) {
        ctx.data.won = true;
        paintGame(ctx);
        ctx.changed("excited", `<strong>${"You won!"}</strong><br>The score reached the goal, so your <code>if</code> ran. Press <strong>Save my game</strong>.`);
        return;
      }
      paintGame(ctx);
      ctx.changed();
    });
    $("m4-in-label").addEventListener("input", () => {
      const v = $("m4-in-label").value.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL);
      if (v) ctx.data.game.label = v;
      const keep = $("m4-in-label").value; gameChanged(ctx); $("m4-in-label").value = keep;
    });
    $("m4-in-win").addEventListener("input", () => {
      const v = $("m4-in-win").value.replace(/\s+/g, " ").trim().slice(0, MAX_WIN);
      if (v) ctx.data.game.win = v;
      const keep = $("m4-in-win").value; gameChanged(ctx); $("m4-in-win").value = keep;
    });
    $("m4-in-points").addEventListener("change", () => {
      const v = Number($("m4-in-points").value);
      ctx.data.game.points = POINTS.includes(v) ? v : 5;
      gameChanged(ctx);
    });
    $("m4-in-goal").addEventListener("change", () => {
      const v = Number($("m4-in-goal").value);
      ctx.data.game.goal = GOALS.includes(v) ? v : 20;
      gameChanged(ctx);
    });
    $("m4-game-reset").addEventListener("click", () => { gameScore = 0; paintGame(ctx); });
    $("m4-game-save").addEventListener("click", () => {
      const st = $("m4-game-status");
      if (!ctx.data.won) {
        st.textContent = "Win your game first: keep pressing the button until the goal is reached.";
        st.className = "m5-status is-warn";
        return;
      }
      ctx.data.saved = Object.assign({}, ctx.data.game);
      paintGame(ctx);
      ctx.changed("excited", "<strong>Your game is saved!</strong><br>You wrote a variable, an event and an <code>if</code>. Press <strong>Finish the mission</strong> when you're ready.");
      ctx.showHint("");
    });
  }

  // ------------------------------------------------------------------------
  // Celebrate
  // ------------------------------------------------------------------------
  function paintCelebrate(ctx) {
    const g = ctx.data.saved || ctx.data.game;
    $("m4-final-title").textContent = g.label;
    $("m4-final-code").textContent = gameCode(g);
    $("m4-sum-clicks").textContent = `${ctx.data.clicks} zaps in the lab`;
    $("m4-sum-quests").textContent = `${ctx.state.quests.filter(Boolean).length} of ${QUESTS.length} solved`;
  }

  // Started last, so every const and let above exists before the first step is painted
  CurioMission.start(MISSION);
})();
