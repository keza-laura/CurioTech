// ==========================================================================
// CurioTech: Mission 03 - Make It Beautiful (CSS City)
// Steps: Discover, Experiment, Challenge, Create, Celebrate. The shared engine (js/mission-kit.js) runs the
// steps, quests, saving and the completion record. This file holds the content and the two live activities.
//
// Completion (localStorage "curiotech_mission_03_completed") needs: at least 3 different tower settings
// changed (Experiment), all 3 quests solved (Challenge) and a saved neon sign design (Create).
// Learner text (the sign words) is only ever shown with textContent, and every colour, font and size comes
// from a fixed list or a number range.
// ==========================================================================

(function () {
  "use strict";

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

  const QUESTS = [
    {
      title: "Quest 1: Which property?",
      question: "You want to change the colour of some text. Which CSS property do you use?",
      options: ["color", "font-size", "margin", "border"],
      answer: 0,
      code: true,
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
      code: true,
      right: "Right! <code>font-size: 48px;</code> makes the text bigger.",
      wrong: "Hmm. <code>48px</code> is a size, so the property must be about size. Which one controls the size of text?"
    }
  ];

  const $ = id => document.getElementById(id);

  function cleanSign(d, fallback) {
    const s = Object.assign({}, fallback);
    if (!d || typeof d !== "object") return s;
    const text = typeof d.text === "string" ? d.text.replace(/\s+/g, " ").trim().slice(0, MAX_SIGN_CHARS) : "";
    if (text) s.text = text;
    if (SIGN_COLOURS.some(c => c.value === d.color)) s.color = d.color;
    if (FONTS.includes(d.font)) s.font = d.font;
    if (Number.isInteger(d.size)) s.size = Math.min(56, Math.max(20, d.size));
    if (typeof d.glow === "boolean") s.glow = d.glow;
    return s;
  }

  const MISSION = {
    prefix: "m3",
    name: "Mission 03",
    stateKey: "curiotech_mission_03_progress",
    doneKey: "curiotech_mission_03_completed",
    steps: [
      { next: "Continue to Experiment →" },
      { next: "Continue to Challenge →" },
      { next: "Continue to Create →" },
      { next: "Finish the mission →" },
      { next: "" }
    ],
    pixel: [
      { expr: "excited", html: "<strong>Welcome to CSS City!</strong><br>HTML is the skeleton of a page. CSS is the paint, the neon lights and the style. Let's learn how a CSS rule is built." },
      { expr: "thinking", html: "<strong>Time to experiment!</strong><br>Change the tower and watch the CSS appear below it. Try at least 3 different settings." },
      { expr: "encouraging", html: "<strong>Three style quests</strong><br>A wrong answer is just a clue. Read the hint and try again!" },
      { expr: "happy", html: "<strong>Design time!</strong><br>Make a neon sign for CSS City. Type your words, style them, then press Save my design." },
      { expr: "excited", html: "<strong>You did it!</strong><br>You are a CSS City architect now. Try your new skills in the Creator's Playground." }
    ],
    quests: QUESTS,

    freshData() {
      return {
        props: [],
        tower: { color: "", radius: 0, height: "", glow: false },
        sign: { text: "My City", color: SIGN_COLOURS[0].value, font: "sans-serif", size: 36, glow: true },
        savedSign: null
      };
    },

    cleanData(d) {
      const base = this.freshData();
      if (!d || typeof d !== "object") return base;
      base.props = Array.isArray(d.props) ? d.props.filter((p, i, a) => TOWER_PROPS.includes(p) && a.indexOf(p) === i) : [];
      const t = d.tower && typeof d.tower === "object" ? d.tower : {};
      base.tower = {
        color: WALLS.some(w => w.value === t.color) ? t.color : "",
        radius: Number.isInteger(t.radius) ? Math.min(40, Math.max(0, t.radius)) : 0,
        height: HEIGHTS.includes(t.height) ? t.height : "",
        glow: t.glow === true
      };
      base.sign = cleanSign(d.sign, base.sign);
      base.savedSign = d.savedSign && typeof d.savedSign === "object" ? cleanSign(d.savedSign, base.sign) : null;
      return base;
    },

    gate(step, ctx) {
      const d = ctx.data;
      if (step === 1 && d.props.length < PROPS_NEEDED) {
        const left = PROPS_NEEDED - d.props.length;
        return `Change ${left} more different setting${left === 1 ? "" : "s"} on the tower to continue.`;
      }
      if (step === 3 && !d.savedSign) return "Press Save my design to continue.";
      return "";
    },

    met(ctx) {
      return ctx.data.props.length >= PROPS_NEEDED && !!ctx.data.savedSign;
    },

    init(ctx) { initTower(ctx); initSign(ctx); },

    render(step, ctx) {
      if (step === 1) paintTower(ctx);
      if (step === 3) paintSign(ctx);
      if (step === 4) paintCelebrate(ctx);
    }
  };

  // ------------------------------------------------------------------------
  // Swatches (colour choices as buttons)
  // ------------------------------------------------------------------------
  function buildSwatches(containerId, list, onPick) {
    const box = $(containerId);
    box.textContent = "";
    list.forEach(c => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "m3-swatch";
      b.style.backgroundColor = c.value;
      b.setAttribute("aria-label", c.label);
      b.setAttribute("title", c.label);
      b.dataset.value = c.value;
      b.addEventListener("click", () => onPick(c.value));
      box.appendChild(b);
    });
  }

  function markSwatches(containerId, current) {
    Array.from($(containerId).children).forEach(b => b.setAttribute("aria-pressed", b.dataset.value === current ? "true" : "false"));
  }

  // ------------------------------------------------------------------------
  // Experiment: the tower
  // ------------------------------------------------------------------------
  function addProp(ctx, name) {
    if (!ctx.data.props.includes(name)) ctx.data.props.push(name);
  }

  function paintTower(ctx) {
    const d = ctx.data;
    const t = d.tower;
    const tower = $("m3-tower");
    const glowColour = t.color || "#38bdf8";
    tower.style.backgroundColor = t.color || "";
    tower.style.borderRadius = t.radius ? t.radius + "px" : "";
    tower.style.height = t.height || "";
    tower.style.boxShadow = t.glow ? `0 0 24px ${glowColour}` : "";
    $("m3-radius-out").textContent = t.radius + "px";
    $("m3-radius").value = String(t.radius);
    $("m3-height").value = t.height;
    $("m3-glow").checked = t.glow;
    markSwatches("m3-wall-swatches", t.color);

    const lines = [];
    if (t.color) lines.push(`  background-color: ${t.color};`);
    if (t.radius) lines.push(`  border-radius: ${t.radius}px;`);
    if (t.height) lines.push(`  height: ${t.height};`);
    if (t.glow) lines.push(`  box-shadow: 0 0 24px ${glowColour};`);
    $("m3-tower-code").textContent = [".tower {", ...lines, "}"].join("\n");

    const n = d.props.length;
    const out = $("m3-tower-count");
    out.textContent = n >= PROPS_NEEDED
      ? `You changed ${n} different settings. Nice work!`
      : `You have changed ${n} of ${PROPS_NEEDED} different settings.`;
    out.classList.toggle("is-good", n >= PROPS_NEEDED);
  }

  function initTower(ctx) {
    buildSwatches("m3-wall-swatches", WALLS, value => {
      ctx.data.tower.color = value;
      addProp(ctx, "background-color");
      paintTower(ctx);
      ctx.changed("happy", "<strong>Look at that!</strong><br>Nice colour! That's <code>background-color</code>: the paint on the wall.");
    });
    $("m3-radius").addEventListener("input", () => {
      const r = ctx.clampInt(Number($("m3-radius").value), 0, 40, 0);
      ctx.data.tower.radius = r;
      if (r > 0) addProp(ctx, "border-radius");
      paintTower(ctx);
      ctx.changed("happy", r > 0 ? "<strong>Look at that!</strong><br>Rounder! <code>border-radius</code> softens the corners." : "");
    });
    $("m3-height").addEventListener("change", () => {
      const h = $("m3-height").value;
      ctx.data.tower.height = HEIGHTS.includes(h) ? h : "";
      if (ctx.data.tower.height) addProp(ctx, "height");
      paintTower(ctx);
      ctx.changed("happy", ctx.data.tower.height ? "<strong>Look at that!</strong><br><code>height</code> decides how tall the tower stands." : "");
    });
    $("m3-glow").addEventListener("change", () => {
      ctx.data.tower.glow = $("m3-glow").checked;
      if (ctx.data.tower.glow) addProp(ctx, "box-shadow");
      paintTower(ctx);
      ctx.changed("happy", ctx.data.tower.glow ? "<strong>Look at that!</strong><br>Glow on! <code>box-shadow</code> draws a soft shadow, and a bright colour makes it look like neon." : "");
    });
  }

  // ------------------------------------------------------------------------
  // Create: the neon sign
  // ------------------------------------------------------------------------
  function styleSign(target, s) {
    target.style.color = s.color;
    target.style.fontFamily = s.font;
    target.style.fontSize = s.size + "px";
    target.style.textShadow = s.glow ? `0 0 12px ${s.color}` : "none";
  }

  function sameSign(a, b) {
    return !!a && !!b && a.text === b.text && a.color === b.color && a.font === b.font && a.size === b.size && a.glow === b.glow;
  }

  function paintSign(ctx) {
    const s = ctx.data.sign;
    const sign = $("m3-sign");
    sign.textContent = s.text || " ";
    styleSign(sign, s);
    $("m3-sign-size-out").textContent = s.size + "px";
    $("m3-sign-size").value = String(s.size);
    $("m3-sign-font").value = s.font;
    $("m3-sign-glow").checked = s.glow;
    // Show the stored words when the step is painted, but never rewrite the box while the learner types in it
    if (document.activeElement !== $("m3-sign-text")) $("m3-sign-text").value = s.text;
    markSwatches("m3-sign-swatches", s.color);

    const lines = [".sign {", `  color: ${s.color};`, `  font-family: ${s.font};`, `  font-size: ${s.size}px;`];
    if (s.glow) lines.push(`  text-shadow: 0 0 12px ${s.color};`);
    lines.push("}");
    $("m3-sign-code").textContent = lines.join("\n");

    const st = $("m3-sign-status");
    if (ctx.data.savedSign && sameSign(ctx.data.savedSign, s)) {
      st.textContent = "Saved! Your design is ready.";
      st.className = "m5-status is-good";
    } else if (ctx.data.savedSign) {
      st.textContent = "You changed your sign. Press Save my design to keep the new look.";
      st.className = "m5-status is-warn";
    } else {
      st.textContent = "";
      st.className = "m5-status";
    }
  }

  function initSign(ctx) {
    buildSwatches("m3-sign-swatches", SIGN_COLOURS, value => {
      ctx.data.sign.color = value;
      paintSign(ctx);
      ctx.changed();
    });
    $("m3-sign-text").addEventListener("input", () => {
      // The box keeps exactly what was typed; only the stored copy is tidied
      const keep = $("m3-sign-text").value;
      ctx.data.sign.text = keep.replace(/\s+/g, " ").trim().slice(0, MAX_SIGN_CHARS);
      paintSign(ctx);
      $("m3-sign-text").value = keep;
      ctx.changed();
    });
    $("m3-sign-font").addEventListener("change", () => {
      ctx.data.sign.font = FONTS.includes($("m3-sign-font").value) ? $("m3-sign-font").value : "sans-serif";
      paintSign(ctx);
      ctx.changed();
    });
    $("m3-sign-size").addEventListener("input", () => {
      ctx.data.sign.size = ctx.clampInt(Number($("m3-sign-size").value), 20, 56, 36);
      paintSign(ctx);
      ctx.changed();
    });
    $("m3-sign-glow").addEventListener("change", () => {
      ctx.data.sign.glow = $("m3-sign-glow").checked;
      paintSign(ctx);
      ctx.changed();
    });
    $("m3-sign-save").addEventListener("click", () => {
      const st = $("m3-sign-status");
      if (!ctx.data.sign.text) {
        st.textContent = "Type some words for your sign first.";
        st.className = "m5-status is-warn";
        $("m3-sign-text").focus();
        return;
      }
      ctx.data.savedSign = Object.assign({}, ctx.data.sign);
      paintSign(ctx);
      ctx.changed("excited", "<strong>Your sign is saved!</strong><br>It looks great. Press <strong>Finish the mission</strong> when you're ready.");
      ctx.showHint("");
    });
  }

  // ------------------------------------------------------------------------
  // Celebrate
  // ------------------------------------------------------------------------
  function paintCelebrate(ctx) {
    const s = ctx.data.savedSign || ctx.data.sign;
    const done = $("m3-final-sign");
    done.textContent = s.text;
    styleSign(done, s);
    $("m3-sum-props").textContent = ctx.data.props.length ? ctx.data.props.join(", ") : "none";
    $("m3-sum-quests").textContent = `${ctx.state.quests.filter(Boolean).length} of ${QUESTS.length} solved`;
  }

  // Started last, so every const above exists before the first step is painted
  CurioMission.start(MISSION);
})();
