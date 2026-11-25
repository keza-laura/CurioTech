// ==========================================================================
// CurioTech: Mission 02 - Build the Structure (HTML Island)
// Steps: Discover, Experiment, Challenge, Create, Celebrate. The shared engine (js/mission-kit.js) runs the
// steps, quests, saving and the completion record. This file holds the content and the two live activities.
//
// Completion (localStorage "curiotech_mission_02_completed") needs: 3 text pieces given the right kind of
// tag (Experiment), all 3 quests solved (Challenge) and a saved page skeleton (Create).
// Everything the learner types is shown with textContent only. Tags are chosen from fixed lists.
// ==========================================================================

(function () {
  "use strict";

  const MAX_TITLE = 30;
  const MAX_HEAD = 40;
  const MAX_PARA = 100;
  const MAX_ITEMS_TEXT = 80;
  const TAGGED_NEEDED = 3;

  // The Experiment: four pieces of text, each waiting for a tag. "div" means "no tag chosen yet".
  const PIECES = [
    { label: "Club name", text: "My Robot Club", options: ["div", "h1", "h2", "p"], best: "h1", why: "The club name is the most important heading, so <code>&lt;h1&gt;</code> is the best fit." },
    { label: "Welcome words", text: "We build and test robots every Friday.", options: ["div", "p", "h1", "ul"], best: "p", why: "A sentence of normal text belongs in a paragraph, <code>&lt;p&gt;</code>." },
    { label: "Things we do", text: "Soldering, Coding, Painting", options: ["div", "ul", "p", "h2"], best: "ul", why: "A list of things is a <code>&lt;ul&gt;</code> with one <code>&lt;li&gt;</code> for each item." },
    { label: "Link to the club site", text: "Visit the club website", options: ["div", "a", "h2", "p"], best: "a", why: "A link uses the <code>&lt;a&gt;</code> tag, short for anchor." }
  ];
  const ALL_TAGS = ["div", "h1", "h2", "p", "ul", "a"];

  const QUESTS = [
    {
      title: "Quest 1: The big heading",
      question: "Which tag makes the biggest, most important heading on a page?",
      options: ["<h1>", "<p>", "<h6>", "<body>"],
      answer: 0,
      code: true,
      right: "Yes! <code>&lt;h1&gt;</code> is the main heading. <code>&lt;h6&gt;</code> is the smallest one.",
      wrong: "Think about size and importance: headings go from <code>&lt;h1&gt;</code> (biggest) down to <code>&lt;h6&gt;</code> (smallest). <code>&lt;p&gt;</code> is for normal text."
    },
    {
      title: "Quest 2: Close it up",
      question: "Most elements need a closing tag. What finishes this one?   <p>Hello there!  ____",
      options: ["</p>", "<p>", "<end>", "/p"],
      answer: 0,
      code: true,
      right: "Correct! A closing tag looks like the opening tag with a slash: <code>&lt;/p&gt;</code>.",
      wrong: "A closing tag is the opening tag with a <strong>slash</strong> right after the <code>&lt;</code>. Which choice has that shape?"
    },
    {
      title: "Quest 3: Head or body?",
      question: "Where does the content you can SEE on a page go?",
      options: ["Inside <body>", "Inside <head>", "Before <!DOCTYPE html>", "Inside <title>"],
      answer: 0,
      right: "Right! The <code>&lt;body&gt;</code> holds everything you see. The <code>&lt;head&gt;</code> holds information about the page, like its title.",
      wrong: "The <code>&lt;head&gt;</code> is for information about the page, like its title in the browser tab. The part you see is somewhere else."
    }
  ];

  const MISSION = {
    prefix: "m2",
    name: "Mission 02",
    stateKey: "curiotech_mission_02_progress",
    doneKey: "curiotech_mission_02_completed",
    steps: [
      { next: "Continue to Experiment →" },
      { next: "Continue to Challenge →" },
      { next: "Continue to Create →" },
      { next: "Finish the mission →" },
      { next: "" }
    ],
    pixel: [
      { expr: "excited", html: "<strong>Welcome back to HTML Island!</strong><br>Every webpage is built from <em>elements</em>. Let's learn how to build the structure of a page." },
      { expr: "thinking", html: "<strong>Which tag fits?</strong><br>Each piece of text is waiting for a tag. Pick tags for at least 3 pieces and watch the page change." },
      { expr: "encouraging", html: "<strong>Three structure quests</strong><br>A wrong answer is just a clue. Read the hint and try again!" },
      { expr: "happy", html: "<strong>Build your skeleton!</strong><br>Fill in the boxes and watch a full HTML page appear. Press Save my page when you like it." },
      { expr: "excited", html: "<strong>You did it!</strong><br>You can build the structure of a real webpage. Try it in the Creator's Playground!" }
    ],
    quests: QUESTS,

    freshData() {
      return {
        tags: PIECES.map(() => "div"),
        page: { title: "My Robot Club", head: "Welcome, Robot Fans!", para: "We build robots and share what we learn.", items: "Coding, Building, Testing" },
        saved: null
      };
    },

    cleanData(d) {
      const base = this.freshData();
      if (!d || typeof d !== "object") return base;
      if (Array.isArray(d.tags)) base.tags = PIECES.map((pc, i) => (pc.options.includes(d.tags[i]) ? d.tags[i] : "div"));
      const cleanPage = (pg, fallback) => {
        const o = Object.assign({}, fallback);
        if (!pg || typeof pg !== "object") return o;
        const t = [["title", MAX_TITLE], ["head", MAX_HEAD], ["para", MAX_PARA], ["items", MAX_ITEMS_TEXT]];
        t.forEach(([k, max]) => { if (typeof pg[k] === "string") o[k] = pg[k].replace(/\s+/g, " ").trim().slice(0, max); });
        return o;
      };
      base.page = cleanPage(d.page, base.page);
      base.saved = d.saved && typeof d.saved === "object" ? cleanPage(d.saved, base.page) : null;
      return base;
    },

    gate(step, ctx) {
      const d = ctx.data;
      if (step === 1) {
        const n = d.tags.filter(t => t !== "div").length;
        if (n < TAGGED_NEEDED) {
          const left = TAGGED_NEEDED - n;
          return `Give ${left} more piece${left === 1 ? "" : "s"} of text a tag to continue.`;
        }
      }
      if (step === 3 && !d.saved) return "Press Save my page to continue.";
      return "";
    },

    met(ctx) {
      return ctx.data.tags.filter(t => t !== "div").length >= TAGGED_NEEDED && !!ctx.data.saved;
    },

    init(ctx) { initExperiment(ctx); initCreate(ctx); },

    render(step, ctx) {
      if (step === 1) paintExperiment(ctx);
      if (step === 3) paintCreate(ctx);
      if (step === 4) paintCelebrate(ctx);
    }
  };

  // ------------------------------------------------------------------------
  // Experiment: pick a tag for each piece of text
  // ------------------------------------------------------------------------
  const $ = id => document.getElementById(id);

  function listItems(text) {
    return String(text).split(",").map(s => s.trim()).filter(Boolean).slice(0, 5).map(s => s.slice(0, 30));
  }

  /** Builds the little page for the Experiment from the chosen tags (DOM nodes only, text via textContent). */
  function buildTaggedPreview(ctx, target) {
    target.textContent = "";
    PIECES.forEach((pc, i) => {
      const tag = ctx.data.tags[i];
      let node;
      if (tag === "ul") {
        node = document.createElement("ul");
        listItems(pc.text).forEach(t => { const li = document.createElement("li"); li.textContent = t; node.appendChild(li); });
      } else if (ALL_TAGS.includes(tag) && tag !== "div") {
        node = document.createElement(tag);
        node.textContent = pc.text;
        if (tag === "a") { node.setAttribute("href", "#"); node.addEventListener("click", e => e.preventDefault()); }
      } else {
        node = document.createElement("div");
        node.className = "m2-plain";
        node.textContent = pc.text;
      }
      target.appendChild(node);
    });
  }

  function taggedCode(ctx) {
    const lines = [];
    PIECES.forEach((pc, i) => {
      const tag = ctx.data.tags[i];
      if (tag === "div") lines.push(`${pc.text}      <- no tag yet`);
      else if (tag === "ul") {
        lines.push("<ul>");
        listItems(pc.text).forEach(t => lines.push(`  <li>${t}</li>`));
        lines.push("</ul>");
      } else if (tag === "a") lines.push(`<a href="#">${pc.text}</a>`);
      else lines.push(`<${tag}>${pc.text}</${tag}>`);
    });
    return lines.join("\n");
  }

  function paintExperiment(ctx) {
    PIECES.forEach((pc, i) => { $("m2-tag-" + i).value = ctx.data.tags[i]; });
    buildTaggedPreview(ctx, $("m2-preview"));
    $("m2-code").textContent = taggedCode(ctx);
    const n = ctx.data.tags.filter(t => t !== "div").length;
    const out = $("m2-tag-count");
    out.textContent = n >= TAGGED_NEEDED ? `You tagged ${n} pieces. Nice work!` : `You have tagged ${n} of ${TAGGED_NEEDED} pieces.`;
    out.classList.toggle("is-good", n >= TAGGED_NEEDED);
  }

  function initExperiment(ctx) {
    const box = $("m2-tag-rows");
    PIECES.forEach((pc, i) => {
      const row = ctx.el("div", "m5-field");
      const label = ctx.el("label", "m5-label", `${pc.label}: “${pc.text}”`);
      label.setAttribute("for", "m2-tag-" + i);
      const select = ctx.el("select", "m5-input");
      select.id = "m2-tag-" + i;
      pc.options.forEach(t => {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t === "div" ? "(no tag yet)" : t === "a" ? "<a> link" : `<${t}>`;
        select.appendChild(o);
      });
      select.addEventListener("change", () => {
        const tag = pc.options.includes(select.value) ? select.value : "div";
        ctx.data.tags[i] = tag;
        paintExperiment(ctx);
        if (tag === "div") ctx.changed("thinking", "<strong>Back to plain text.</strong><br>Without a tag the browser doesn't know what this text is.");
        else if (tag === pc.best) ctx.changed("excited", `<strong>That fits!</strong><br>${pc.why}`);
        else ctx.changed("encouraging", `<strong>Interesting choice!</strong><br>It works, but another tag fits better. Hint: ${pc.why}`);
      });
      row.append(label, select);
      box.appendChild(row);
    });
  }

  // ------------------------------------------------------------------------
  // Create: build the page skeleton
  // ------------------------------------------------------------------------
  const FIELDS = [["m2-in-title", "title"], ["m2-in-head", "head"], ["m2-in-para", "para"], ["m2-in-items", "items"]];

  function pageCode(pg) {
    const items = listItems(pg.items);
    const lines = [
      "<!DOCTYPE html>",
      "<html>",
      "  <head>",
      `    <title>${pg.title}</title>`,
      "  </head>",
      "  <body>",
      `    <h1>${pg.head}</h1>`,
      `    <p>${pg.para}</p>`
    ];
    if (items.length) {
      lines.push("    <ul>");
      items.forEach(t => lines.push(`      <li>${t}</li>`));
      lines.push("    </ul>");
    }
    lines.push("  </body>", "</html>");
    return lines.join("\n");
  }

  function buildPagePreview(pg, target) {
    target.textContent = "";
    const tab = document.createElement("div");
    tab.className = "m2-tabtitle";
    tab.textContent = "" + (pg.title || "Untitled");
    const h = document.createElement("h1");
    h.textContent = pg.head;
    const para = document.createElement("p");
    para.textContent = pg.para;
    target.append(tab, h, para);
    const items = listItems(pg.items);
    if (items.length) {
      const ul = document.createElement("ul");
      items.forEach(t => { const li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
      target.appendChild(ul);
    }
  }

  function samePage(a, b) {
    return !!a && !!b && a.title === b.title && a.head === b.head && a.para === b.para && a.items === b.items;
  }

  function paintCreate(ctx) {
    const pg = ctx.data.page;
    FIELDS.forEach(([id, key]) => { const f = $(id); if (f.value !== pg[key]) f.value = pg[key]; });
    buildPagePreview(pg, $("m2-page-preview"));
    $("m2-page-code").textContent = pageCode(pg);
    const st = $("m2-page-status");
    if (ctx.data.saved && samePage(ctx.data.saved, pg)) {
      st.textContent = "Saved! Your page is ready.";
      st.className = "m5-status is-good";
    } else if (ctx.data.saved) {
      st.textContent = "You changed your page. Press Save my page to keep the new version.";
      st.className = "m5-status is-warn";
    } else {
      st.textContent = "";
      st.className = "m5-status";
    }
  }

  function initCreate(ctx) {
    FIELDS.forEach(([id, key]) => {
      $(id).addEventListener("input", () => {
        const max = { title: MAX_TITLE, head: MAX_HEAD, para: MAX_PARA, items: MAX_ITEMS_TEXT }[key];
        // Keep the box exactly as typed; only the saved copy is tidied
        ctx.data.page[key] = $(id).value.replace(/\s+/g, " ").trim().slice(0, max);
        const keep = $(id).value;
        paintCreate(ctx);
        $(id).value = keep;
        ctx.changed();
      });
    });
    $("m2-page-save").addEventListener("click", () => {
      const pg = ctx.data.page;
      if (!pg.title || !pg.head || !pg.para) {
        const st = $("m2-page-status");
        st.textContent = "Fill in the page title, the heading and the paragraph first.";
        st.className = "m5-status is-warn";
        return;
      }
      ctx.data.saved = Object.assign({}, pg);
      paintCreate(ctx);
      ctx.changed("excited", "<strong>Your page is saved!</strong><br>That is a real HTML skeleton. Press <strong>Finish the mission</strong> when you're ready.");
      ctx.showHint("");
    });
  }

  // ------------------------------------------------------------------------
  // Celebrate
  // ------------------------------------------------------------------------
  function paintCelebrate(ctx) {
    const pg = ctx.data.saved || ctx.data.page;
    buildPagePreview(pg, $("m2-final-page"));
    $("m2-sum-tags").textContent = `${ctx.data.tags.filter(t => t !== "div").length} of ${PIECES.length} pieces tagged`;
    $("m2-sum-quests").textContent = `${ctx.state.quests.filter(Boolean).length} of ${QUESTS.length} solved`;
  }

  // Started last, so every const and let above exists before the first step is painted
  CurioMission.start(MISSION);
})();
