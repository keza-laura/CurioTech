// ==========================================================================
// CurioTech: Creator's Playground - Phase 4.5.5
// HTML, CSS and JavaScript editing, styling chips, a sandboxed preview and a guided
// learning journey (Remix, Style, Bring it to life, Free Canvas).
//
// Safety model (learner code never touches the CurioTech page):
//   1. The preview is an <iframe sandbox="allow-scripts"> WITHOUT allow-same-origin,
//      so it has an opaque origin and cannot read this page, its storage or cookies.
//   2. The preview document starts with a restrictive Content Security Policy:
//      no network requests, frames, forms, fonts, media or external images, and no
//      scripts at all in live mode (see 6 for the hash-only exception in run mode).
//   3. Learner HTML is parsed in an inert DOMParser document (nothing runs, nothing
//      loads) and cleaned before it goes into srcdoc: scripts, frames, <meta>, <base>,
//      <link>, event-handler attributes and non-fragment links are removed.
//   4. Learner CSS is placed inside ONE <style> element and any "</style" is escaped,
//      so CSS can never break out of the style element and inject HTML.
//   5. The page itself (playground.html) carries a parent CSP of frame-src 'none':
//      the preview frame can load its own srcdoc but can never be navigated to a URL.
//   6. JavaScript runs ONLY when the learner presses Run Code. A run uses a brand-new
//      iframe element and a script-src that lists the SHA-256 hashes of exactly two
//      inline scripts (a small trusted wrapper and the learner's code). There is no
//      nonce, so learner code cannot create or load any other script.
//   7. Messages from the frame are untrusted: they are accepted only from the current
//      run's window, with origin "null", the secret run id and a known shape, and are
//      only ever shown as plain text (with line and length caps enforced here).
//   Known limits: see the "Known limitations" note above buildPreview(). In short: the
//   playground is NOT completely network-isolated, a runaway loop may freeze browsers
//   that do not isolate the frame, and only Chromium behaviour has been tested.
// ==========================================================================

(function () {
  "use strict";

  // ------------------------------------------------------------------------
  // 1. Code / Preview toggle (small screens) - from Phase 4.5.1
  // ------------------------------------------------------------------------
  const workshop = document.getElementById("pg-workshop");
  const viewButtons = document.querySelectorAll(".pg-view-btn");

  function setView(view) {
    if (!workshop) return;
    workshop.setAttribute("data-view", view);
    viewButtons.forEach(btn => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-view") === view ? "true" : "false");
    });
  }

  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => setView(btn.getAttribute("data-view")));
  });

  // ------------------------------------------------------------------------
  // 2. Elements and constants
  // ------------------------------------------------------------------------
  let frame = null; // the sandboxed <iframe> is created by makeFrame() (never present in the static HTML)
  const emptyState = document.getElementById("pg-preview-empty");
  const screenEl = document.getElementById("pg-browser-screen");
  const pixelAvatar = document.getElementById("pg-pixel-avatar");
  const pixelTag = document.getElementById("pg-pixel-tag");
  const pixelSpeech = document.getElementById("pg-pixel-speech");

  const runBtn = document.getElementById("pg-run-btn");
  const stopBtn = document.getElementById("pg-stop-btn");
  const runStatus = document.getElementById("pg-run-status");
  const outputLog = document.getElementById("pg-output-log");
  const outputClear = document.getElementById("pg-output-clear");

  if (!emptyState || !screenEl || !runBtn || !stopBtn || !outputLog || !document.getElementById("pg-html-editor")) return;

  const MAX_CHARS = 20000;
  const DEBOUNCE_MS = 300;
  const RESET_CONFIRM_MS = 5000;
  const WATCHDOG_MS = 3000;      // a run that has not finished loading after this long is stopped
  const MIN_RUN_GAP_MS = 300;    // ignore Run Code clicks that arrive faster than this
  const MAX_OUTPUT_LINES = 200;  // enforced here in the parent page
  const MAX_LINE_CHARS = 2000;   // enforced here in the parent page
  const STORAGE_KEYS = {
    html: "curiotech_playground_html_draft",
    css: "curiotech_playground_css_draft",
    js: "curiotech_playground_js_draft",
    runMarker: "curiotech_playground_run_marker"
  };

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

  // ------------------------------------------------------------------------
  // 3. Pixel (short, beginner-friendly reactions to key moments only)
  // ------------------------------------------------------------------------
  function setPixel(expr, html) {
    if (html && pixelSpeech) pixelSpeech.innerHTML = html;
    if (pixelAvatar) {
      pixelAvatar.setAttribute("data-expression", expr);
      pixelAvatar.setAttribute("aria-label", `Pixel Mascot (${expr})`);
    }
    if (pixelTag) {
      pixelTag.textContent = expr.charAt(0).toUpperCase() + expr.slice(1);
      pixelTag.className = `pixel-expression-pill expr-pill-${expr}`;
    }
  }

  const PIXEL_HTML_INTRO = {
    expr: "thinking",
    html: "<strong>HTML builds the skeleton of a webpage. 🦴</strong><br>Tags like <code>&lt;h1&gt;</code> (a big title) and <code>&lt;p&gt;</code> (a paragraph) tell the browser what each part is. Change the words in the code box, then look at the preview. It updates all by itself!"
  };
  const PIXEL_JS_INTRO = {
    expr: "excited",
    html: "<strong>JavaScript makes your page DO things! ⚡</strong><br>Press <strong>Run Code</strong> to try it. <code>console.log()</code> prints messages into the Output box. If something goes wrong, I'll help you read the error!"
  };
  const PIXEL_CSS_INTRO = {
    expr: "excited",
    html: "<strong>HTML builds your page. CSS makes it beautiful! 🎨</strong><br>Write CSS rules yourself, or tap a <strong>styling chip</strong> to try one. Chips write the CSS for you, so you can see how it works!"
  };

  // ------------------------------------------------------------------------
  // 4. Safe preview builder (live mode: no JavaScript; run mode: hash-only scripts)
  //
  // Known limitations (Chromium behaviour was tested; Firefox and Safari were NOT):
  //  - The CSP stops fetch, XHR, WebSocket, beacons, images, fonts, media, stylesheets,
  //    frames, objects and scripts from loading anything. It does NOT control
  //    <link rel="prerender">, <link rel="preconnect"> or <link rel="dns-prefetch">,
  //    so learner JavaScript can still cause a prerender request or a DNS/connection
  //    lookup. The playground is NOT completely network-isolated.
  //  - A runaway loop can freeze a browser that keeps the preview frame in the same
  //    process as this page. The 3-second watchdog needs this page to stay responsive.
  //  - Inline onclick="..." attributes are removed; learners use addEventListener.
  //  - Output printed just before a hang can be lost (a busy frame may not deliver its
  //    messages before the watchdog removes it).
  //  - Learner code can still forge messages if it ever learns the run id. The id is never
  //    exposed in the page (the wrapper removes itself and keeps it in a closure), and
  //    messages are display-only, so the worst case is misleading output text.
  //  - A blocked navigation (frame-src 'none') ends the frame's load signal, so such a
  //    run is stopped by the watchdog and reported as "didn't finish".
  //  - Not tested: WebRTC, memory-heavy code, catastrophic regex backtracking, preconnect /
  //    dns-prefetch behaviour, and any browser other than Chromium (Firefox and Safari).
  // ------------------------------------------------------------------------
  function previewCsp(scriptSrc) {
    return [
      "default-src 'none'",
      `script-src ${scriptSrc}`,
      "style-src 'unsafe-inline'",
      "img-src data:",
      "font-src 'none'",
      "media-src 'none'",
      "object-src 'none'",
      "frame-src 'none'",
      "connect-src 'none'",
      "form-action 'none'",
      "base-uri 'none'"
    ].join("; ");
  }

  // A friendly default look so plain HTML looks nice; learner styles come after and win.
  const PREVIEW_BASE_CSS =
    "body{margin:0;padding:1rem;background:#fff;color:#1f2937;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.5;}" +
    "h1,h2,h3{line-height:1.2;}img{max-width:100%;height:auto;}";

  const REMOVED_TAGS = ["script", "iframe", "frame", "frameset", "object", "embed", "applet",
    "base", "link", "meta", "noscript", "template", "portal"];
  const LINK_TAGS = ["a", "area"];
  const REMOVED_ATTRS = ["srcdoc", "ping", "action", "formaction", "target", "http-equiv"];

  /** Stops learner CSS from ever closing the <style> element it lives in. */
  function escapeStyleText(css) {
    return String(css).slice(0, MAX_CHARS).replace(/<\/style/gi, "<\\/style");
  }

  // --- SHA-256 (pure JavaScript, UTF-8) so CSP hashes do not depend on crypto.subtle ---
  const SHA_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function sha256Bytes(bytes) {
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const len = bytes.length;
    const padded = ((len + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(padded);
    m.set(bytes);
    m[len] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(padded - 8, Math.floor((len * 8) / 0x100000000));
    dv.setUint32(padded - 4, (len * 8) >>> 0);
    const w = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < padded; i += 64) {
      for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4);
      for (let j = 16; j < 64; j++) {
        const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
      }
      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let j = 0; j < 64; j++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + SHA_K[j] + w[j]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    const out = new Uint8Array(32);
    const odv = new DataView(out.buffer);
    H.forEach((v, i) => odv.setUint32(i * 4, v));
    return out;
  }

  function sha256Base64(text) {
    const bytes = sha256Bytes(new TextEncoder().encode(text));
    let bin = "";
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  /**
   * Prepares learner JavaScript for an inline <script>: newlines are normalised exactly as the
   * HTML parser does (so the hash matches), NUL is removed, and sequences that could end or
   * confuse the script element are escaped (they stay valid inside strings, regexes and templates).
   */
  function prepareScriptText(js) {
    return String(js).slice(0, MAX_CHARS)
      .replace(/\r\n?/g, "\n")
      .replace(/\u0000/g, "")
      .replace(/<\/script/gi, "<\\/script")
      .replace(/<!--/g, "<\\!--")
      .replace(/<script/gi, "<\\script");
  }

  function newRunId() {
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * The trusted wrapper: one line, ASCII only. Its own caps (250 messages, 4,000 characters) are only a
   * flood guard; the real 200-line / 2,000-character limits are enforced by the parent page. It runs FIRST, then deletes its own <script>
   * element, so learner code can never read or copy it (the hash would otherwise let it be
   * re-run). The run id stays inside its closure (it is never used as a property name); every
   * message carries it, and the parent rejects anything without it. A fixed, non-configurable
   * guard property makes a second execution of the same text a no-op.
   */
  function buildWrapper(runId, lineOffset) {
    return [
      "(function(){",
      "var R=" + JSON.stringify(runId) + ",O=" + (lineOffset | 0) + ",MAXL=" + (MAX_OUTPUT_LINES + 50) + ",MAXC=" + (MAX_LINE_CHARS * 2) + ",n=0,me=document.currentScript,key='__ct_guard';",
      "if(Object.prototype.hasOwnProperty.call(window,key)){return;}",
      "try{Object.defineProperty(window,key,{value:1});}catch(e){return;}",
      "var pm=window.parent.postMessage.bind(window.parent);",
      "function cut(x){x=String(x);return x.length>MAXC?x.slice(0,MAXC)+'... (shortened)':x;}",
      "function send(o,counted){if(counted){if(n>=MAXL){return;}n++;}o.r=R;try{pm(o,'*');}catch(e){}}",
      "function show(v){try{if(typeof v==='string'){return v;}if(v instanceof Error){return v.name+': '+v.message;}if(v===undefined){return 'undefined';}if(typeof v==='function'){return String(v).slice(0,200);}if(typeof v==='object'&&v!==null){var s=JSON.stringify(v);return s===undefined?String(v):s;}return String(v);}catch(e){return '[object]';}}",
      "function join(a){var o=[];for(var i=0;i<a.length;i++){o.push(show(a[i]));}return o.join(' ');}",
      "['log','info','warn','error','debug'].forEach(function(m){var lv=m==='debug'?'log':m;console[m]=function(){send({k:'out',c:lv,s:cut(join(arguments))},true);};});",
      "window.alert=function(t){send({k:'out',c:'info',s:cut('alert: '+show(t))},true);};",
      "window.confirm=function(t){send({k:'out',c:'info',s:cut('confirm: '+show(t)+' (answered no)')},true);return false;};",
      "window.prompt=function(t){send({k:'out',c:'info',s:cut('prompt: '+show(t)+' (no answer)')},true);return null;};",
      "window.addEventListener('error',function(e){send({k:'err',m:cut(e.message||'Error'),l:e.lineno>O?e.lineno-O:0},true);});",
      "window.addEventListener('unhandledrejection',function(e){send({k:'err',m:cut('Unhandled promise rejection: '+show(e.reason)),l:0},true);});",
      "document.addEventListener('securitypolicyviolation',function(e){send({k:'csp',d:cut(e.effectiveDirective),u:cut(e.blockedURI)},true);});",
      "window.addEventListener('load',function(){send({k:'done'},false);});",
      "send({k:'ready'},false);",
      "if(me&&me.parentNode){me.parentNode.removeChild(me);}",
      "})();"
    ].join("");
  }

  /**
   * Cleans learner HTML inside an inert document and combines it with the learner's CSS.
   * run (optional): { id, js } builds a RUN document whose only scripts are the hashed wrapper
   * and the hashed learner code. Without run, scripts are completely blocked (live preview).
   * Returns { empty: true } when there is nothing visible to show (live mode only).
   */
  function buildPreview(rawHtml, rawCss, run) {
    const source = String(rawHtml).slice(0, MAX_CHARS);
    if (source.trim() === "" && !run) return { empty: true };

    const cleaned = cleanLearnerHtml(source);
    const { bodyHtml, hasContent, headStyles, bodyAttrs } = cleaned;
    if (!hasContent && !run) return { empty: true };

    // The CSS tab comes last so it can override the page's own <style> elements.
    const cssText = String(rawCss || "");
    const cssStyle = cssText.trim() === "" ? "" : `<style>${escapeStyleText(cssText)}</style>`;

    // The CSP meta is the very first thing in the document, before any learner content.
    const topFor = csp =>
      "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
      `<meta http-equiv="Content-Security-Policy" content="${csp}">` +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
      `<style>${PREVIEW_BASE_CSS}</style>${headStyles}${cssStyle}</head>` +
      `<body${bodyAttrs}>${bodyHtml}`;

    let scriptSrc = "'none'";
    let scriptTags = "";
    if (run) {
      const learner = prepareScriptText(run.js);
      const hasLearner = learner.trim() !== "";
      // The wrapper is a single line, so learner line 1 sits on document line (newlines before it) + 1.
      const lineOffset = (topFor(previewCsp("'none'")).match(/\n/g) || []).length;
      const wrapper = buildWrapper(run.id, lineOffset);
      const scripts = hasLearner ? [wrapper, learner] : [wrapper];
      scriptSrc = scripts.map(s => `'sha256-${sha256Base64(s)}'`).join(" ");
      scriptTags = scripts.map(s => `<script>${s}</script>`).join("");
    }

    return { empty: false, html: topFor(previewCsp(scriptSrc)) + scriptTags + "</body></html>" };
  }

  /**
   * The ONE place learner HTML is cleaned (used by the live preview, Run mode and the download, so they
   * always agree). Cleans inside an inert document: scripts, frames, objects, base/link/meta and
   * similar tags are removed, on* handlers and risky attributes are dropped, and links never leave the page.
   * Returns the cleaned body markup plus the learner's own <style> elements and body class/style.
   */
  function cleanLearnerHtml(source) {
    // DOMParser output is inert: scripts do not run and resources are not fetched.
    const doc = new DOMParser().parseFromString(source, "text/html");

    doc.querySelectorAll(REMOVED_TAGS.join(",")).forEach(el => el.remove());

    doc.querySelectorAll("*").forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        if (name.startsWith("on") || REMOVED_ATTRS.includes(name)) {
          el.removeAttribute(attr.name);
        }
      });
      // Links stay clickable-looking but never leave the preview.
      if (LINK_TAGS.includes(el.localName)) {
        ["href", "xlink:href"].forEach(h => {
          if (el.hasAttribute(h)) {
            const value = (el.getAttribute(h) || "").trim();
            if (!value.startsWith("#")) el.setAttribute(h, "#");
          }
        });
      }
    });

    const bodyHtml = doc.body ? doc.body.innerHTML : "";
    const hasContent = doc.body && (doc.body.children.length > 0 || doc.body.textContent.trim() !== "");

    // <style> elements the learner wrote inside their HTML, plus body class/style.
    const headStyles = Array.from(doc.head ? doc.head.querySelectorAll("style") : [])
      .map(el => el.outerHTML).join("");
    let bodyAttrs = "";
    ["class", "style"].forEach(a => {
      if (doc.body && doc.body.hasAttribute(a)) {
        bodyAttrs += ` ${a}="${doc.body.getAttribute(a).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`;
      }
    });

    return { bodyHtml, hasContent, headStyles, bodyAttrs };
  }

  // ------------------------------------------------------------------------
  // 5. Draft storage (always guarded)
  //    Drafts live in localStorage so a learner who leaves and comes back finds their work.
  //    Two one-shot markers stay in sessionStorage on purpose: the Mission 01 hand-off (must
  //    import only once) and the run marker (a crashed run must not follow the learner into a new visit).
  // ------------------------------------------------------------------------
  let saveFailureNoted = false;
  const SESSION_ONLY_KEYS = ["curiotech_blueprint_handoff", STORAGE_KEYS.runMarker];

  function storeFor(key) {
    return SESSION_ONLY_KEYS.indexOf(key) !== -1 ? sessionStorage : localStorage;
  }

  function readDraft(key) {
    try {
      const raw = storeFor(key).getItem(key);
      if (raw === null) return null;
      const data = JSON.parse(raw);
      return data && typeof data === "object" ? data : null;
    } catch (e) {
      return null; // unavailable or corrupted storage: use the starter code
    }
  }

  function removeKey(key) {
    try { storeFor(key).removeItem(key); } catch (e) { /* storage unavailable */ }
  }

  function writeDraft(key, payload) {
    try {
      storeFor(key).setItem(key, JSON.stringify(payload));
    } catch (e) {
      if (!saveFailureNoted) {
        saveFailureNoted = true;
        activeEditor().showNote("Heads up: this browser won't let me save your work, so a refresh will bring back the starter code.");
      }
    }
  }

  // ------------------------------------------------------------------------
  // 6. Shared editor behaviour (used for the HTML, CSS and JavaScript files)
  // ------------------------------------------------------------------------
  function createEditor(cfg) {
    const ta = document.getElementById(cfg.textareaId);
    const countEl = document.getElementById(cfg.countId);
    const resetBtn = document.getElementById(cfg.resetId);
    const noteEl = document.getElementById(cfg.noteId);
    const ed = { key: cfg.key, ta, starter: cfg.starter, edited: false, dirty: false };

    let armed = false;
    let resetTimer = null;
    let tabEscape = false;
    let limitWarned = false;
    let noteTimer = null;

    ed.showNote = function (text, ms) {
      if (!noteEl) return;
      noteEl.textContent = text;
      clearTimeout(noteTimer);
      if (ms) noteTimer = setTimeout(() => { noteEl.textContent = ""; }, ms);
    };

    ed.updateCount = function () {
      if (!countEl) return;
      const n = ta.value.length;
      countEl.textContent = `${n.toLocaleString("en-US")} / ${MAX_CHARS.toLocaleString("en-US")}`;
      countEl.classList.toggle("is-near-limit", n >= MAX_CHARS * 0.9);
    };

    function disarm() {
      if (!armed) return;
      armed = false;
      clearTimeout(resetTimer);
      resetBtn.textContent = cfg.resetLabel;
      if (noteEl && noteEl.textContent.indexOf("replace") !== -1) noteEl.textContent = "";
    }

    ta.addEventListener("input", () => {
      // maxlength already limits typing and pasting; this also covers programmatic edits
      if (ta.value.length > MAX_CHARS) ta.value = ta.value.slice(0, MAX_CHARS);
      ed.updateCount();
      disarm();
      ed.dirty = true;
      if (!ed.edited) {
        ed.edited = true;
        if (cfg.onFirstEdit) cfg.onFirstEdit();
      }
      if (ta.value.length >= MAX_CHARS) {
        if (!limitWarned) {
          limitWarned = true;
          ed.showNote("You've reached the size limit for this file. Delete something to add more.", 6000);
        }
      } else {
        limitWarned = false;
      }
      cfg.onChange(false);
    });

    // Tab indents instead of moving focus. Esc then Tab leaves the editor (never a keyboard trap).
    function insertSpaces() {
      const text = "  ";
      if (ta.value.length + text.length > MAX_CHARS) return;
      // execCommand keeps the browser's own undo history; fall back to setRangeText if unavailable.
      let done = false;
      try { done = document.execCommand("insertText", false, text); } catch (e) { done = false; }
      if (!done) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    function indentSelectedLines() {
      const value = ta.value;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end);
      const indented = block.replace(/^/gm, "  ");
      if (value.length - block.length + indented.length > MAX_CHARS) return;
      ta.setSelectionRange(lineStart, end);
      let done = false;
      try { done = document.execCommand("insertText", false, indented); } catch (e) { done = false; }
      if (done) {
        ta.setSelectionRange(lineStart, lineStart + indented.length);
      } else {
        ta.setRangeText(indented, lineStart, end, "select");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    ta.addEventListener("keydown", (e) => {
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      if (e.key === "Escape") {
        tabEscape = true;
        ed.showNote("Tab will now move you out of the editor.", 3000);
        return;
      }
      if (e.key !== "Tab") {
        tabEscape = false;
        return;
      }
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || tabEscape) {
        tabEscape = false;
        return;
      }
      e.preventDefault();
      if (ta.selectionStart === ta.selectionEnd) {
        insertSpaces();
      } else {
        indentSelectedLines();
      }
    });
    ta.addEventListener("blur", () => { tabEscape = false; });

    // Reset to starter: asks for a second press when it would replace changed code
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (ta.value === ed.starter) {
          ed.showNote(`You already have the starter ${cfg.name}.`, 3000);
          return;
        }
        if (!armed) {
          armed = true;
          resetBtn.textContent = `Press again to replace my ${cfg.name}`;
          ed.showNote(`This will replace your ${cfg.name} with the starter ${cfg.name}. Press the button again to confirm.`);
          clearTimeout(resetTimer);
          resetTimer = setTimeout(disarm, RESET_CONFIRM_MS);
          return;
        }
        disarm();
        ta.value = ed.starter;
        ed.edited = false;
        ed.dirty = true;
        limitWarned = false;
        ed.updateCount();
        if (cfg.onReset) cfg.onReset();
        cfg.onChange(true);
        ed.showNote(`Starter ${cfg.name} restored.`, 3000);
      });
      resetBtn.addEventListener("blur", disarm);
    }

    return ed;
  }

  // ------------------------------------------------------------------------
  // 7. Rendering, saving and the three editors
  // ------------------------------------------------------------------------
  let debounceTimer = null;
  let pendingRender = false;
  let wasEmpty = false;
  let htmlEd = null;
  let cssEd = null;
  let jsEd = null;
  let activeKey = "html";

  function activeEditor() {
    return ({ html: htmlEd, css: cssEd, js: jsEd })[activeKey] || htmlEd;
  }

  /** Creates a brand-new sandboxed frame. srcdoc is set BEFORE it is inserted into the page. */
  function makeFrame(srcdoc) {
    const f = document.createElement("iframe");
    f.id = "pg-preview-frame";
    f.className = "pg-frame";
    f.title = "Live preview of your page";
    f.setAttribute("sandbox", "allow-scripts");   // never allow-same-origin
    f.setAttribute("referrerpolicy", "no-referrer");
    f.setAttribute("allow", "");
    f.srcdoc = srcdoc;
    return f;
  }

  function mountFrame(f) {
    if (frame && frame.parentNode) {
      frame.parentNode.replaceChild(f, frame);   // the old frame (and all its timers) is destroyed
    } else {
      screenEl.appendChild(f);
    }
    frame = f;
    emptyState.hidden = true;
    screenEl.classList.add("has-frame");
  }

  function unmountFrame() {
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    frame = null;
    screenEl.classList.remove("has-frame");
  }

  /** Live preview: HTML + CSS only, no JavaScript at all. Replaces any running frame. */
  function renderPreview() {
    if (run) {
      endRun();
      setStatus("Preview updated without JavaScript. Press Run Code to run it again.");
    }
    const result = buildPreview(htmlEd.ta.value, cssEd.ta.value, null);
    if (result.empty) {
      unmountFrame();
      emptyState.hidden = false;
      if (!wasEmpty) {
        setPixel("encouraging", "<strong>An empty page! 📭</strong><br>That's okay. Type <code>&lt;h1&gt;Hello!&lt;/h1&gt;</code> in the HTML tab to make a title, or press Reset HTML for the starter code.");
      }
      wasEmpty = true;
    } else {
      mountFrame(makeFrame(result.html));
      wasEmpty = false;
    }
  }

  // Only files the learner actually changed are written, so a saved draft is never replaced by starter code.
  function saveDirty() {
    if (htmlEd.dirty) {
      writeDraft(STORAGE_KEYS.html, { v: 1, html: htmlEd.ta.value });
      htmlEd.dirty = false;
    }
    if (cssEd.dirty) {
      writeDraft(STORAGE_KEYS.css, { v: 1, css: cssEd.ta.value, chips: chipState });
      cssEd.dirty = false;
    }
    if (jsEd.dirty) {
      writeDraft(STORAGE_KEYS.js, { v: 1, js: jsEd.ta.value });
      jsEd.dirty = false;
    }
  }

  // "Save progress" button: drafts already save as you type; this writes them right now
  // and tells the learner so. Starter code is never written over a saved draft.
  (function wireSaveProgress() {
    const btn = document.getElementById("pg-save-progress-btn");
    const status = document.getElementById("pg-save-progress-status");
    if (!btn || !status) return;
    btn.addEventListener("click", () => {
      saveDirty();
      if (htmlEd.edited) writeDraft(STORAGE_KEYS.html, { v: 1, html: htmlEd.ta.value });
      if (cssEd.edited) writeDraft(STORAGE_KEYS.css, { v: 1, css: cssEd.ta.value, chips: chipState });
      if (jsEd.edited) writeDraft(STORAGE_KEYS.js, { v: 1, js: jsEd.ta.value });
      let ok = false;
      try { ok = localStorage.getItem(STORAGE_KEYS.html) !== null || localStorage.getItem(STORAGE_KEYS.css) !== null || localStorage.getItem(STORAGE_KEYS.js) !== null; } catch (e) { ok = false; }
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      status.textContent = ok
        ? `Progress saved at ${time}. Close the tab and come back any time: your code will be here.`
        : "Nothing to save yet. Change some code first, or this browser is blocking saving (try Download my page).";
    });
  })();

  // render=false is used for JavaScript edits: typing JavaScript never touches the preview.
  function scheduleUpdate(immediate, render) {
    if (render !== false) pendingRender = true;
    clearTimeout(debounceTimer);
    const go = () => {
      debounceTimer = null;
      const htmlChanged = htmlEd.dirty;   // true only when the learner changed that file
      const cssChanged = cssEd.dirty;
      if (pendingRender) { pendingRender = false; renderPreview(); }
      saveDirty();
      checkEditGoals(htmlChanged, cssChanged);
    };
    if (immediate) { go(); return; }
    debounceTimer = setTimeout(go, DEBOUNCE_MS);
  }

  htmlEd = createEditor({
    key: "html", name: "HTML", textareaId: "pg-html-editor", countId: "pg-html-count",
    resetId: "pg-html-reset", noteId: "pg-html-note", resetLabel: "↺ Reset HTML to Starter",
    starter: STARTER_HTML,
    onChange: (immediate) => scheduleUpdate(immediate, true),
    onFirstEdit: () => setPixel("excited", "<strong>You just changed a real webpage! 🎉</strong><br>Try deleting a line, or add your own <code>&lt;p&gt;</code> with a sentence inside."),
    onReset: () => {
      resetHtmlBaseline();   // goals are measured against the starter again
      setPixel("happy", "<strong>Fresh start! ✨</strong><br>The starter HTML is back. Change a few words and see what happens!");
    }
  });

  cssEd = createEditor({
    key: "css", name: "CSS", textareaId: "pg-css-editor", countId: "pg-css-count",
    resetId: "pg-css-reset", noteId: "pg-css-note", resetLabel: "↺ Reset CSS to Starter",
    starter: STARTER_CSS,
    onChange: (immediate) => { syncChipsWithText(); scheduleUpdate(immediate, true); },
    onFirstEdit: () => setPixel("excited", "<strong>Your CSS is working! 🎨</strong><br>Try changing a colour code or a number and watch the preview."),
    onReset: () => {
      chipState = {};
      syncChipUI();
      resetCssBaseline();   // goals are measured against the starter CSS again
      setPixel("happy", "<strong>Fresh start! ✨</strong><br>The starter CSS is back. Your HTML wasn't touched.");
    }
  });

  jsEd = createEditor({
    key: "js", name: "JavaScript", textareaId: "pg-js-editor", countId: "pg-js-count",
    resetId: "pg-js-reset", noteId: "pg-js-note", resetLabel: "↺ Reset JavaScript to Starter",
    starter: STARTER_JS,
    onChange: (immediate) => scheduleUpdate(immediate, false),
    onFirstEdit: () => setPixel("excited", "<strong>Nice, you're writing JavaScript! ⚡</strong><br>Press <strong>Run Code</strong> to see it work. It never runs while you type."),
    onReset: () => setPixel("happy", "<strong>Fresh start! ✨</strong><br>The starter JavaScript is back. Your HTML and CSS weren't touched.")
  });

  // ------------------------------------------------------------------------
  // 7b. Running JavaScript: Run, Stop, watchdog, output and message checks
  // ------------------------------------------------------------------------
  let run = null;            // the ONE current run, or null (no JavaScript is alive)
  let runCounter = 0;
  let lastRunClick = 0;
  let outputLines = 0;
  let outputLimitNoted = false;
  let firstSuccessShown = false;

  function setStatus(text) {
    runStatus.textContent = text;
  }

  function setRunUI() {
    runBtn.setAttribute("aria-disabled", run && run.state === "running" ? "true" : "false");
    stopBtn.setAttribute("aria-disabled", run ? "false" : "true");
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- output area (every line is plain text, never HTML) ----
  function clearOutput() {
    outputLog.textContent = "";
    outputLines = 0;
    outputLimitNoted = false;
    const empty = document.createElement("p");
    empty.className = "pg-output-empty";
    empty.textContent = "Your console.log() messages and any errors will show up here after you press Run Code.";
    outputLog.appendChild(empty);
  }

  function addLine(kind, text, counted) {
    const hint = outputLog.querySelector(".pg-output-empty");
    if (hint) hint.remove();
    const row = document.createElement("div");
    row.className = `pg-out-line is-${kind}`;
    if (kind === "error" || kind === "warn") {
      const label = document.createElement("span");
      label.className = "p44-sr-only";
      label.textContent = kind === "error" ? "Error: " : "Warning: ";
      row.appendChild(label);
    }
    row.appendChild(document.createTextNode(text));
    outputLog.appendChild(row);
    outputLog.scrollTop = outputLog.scrollHeight;
    if (counted) outputLines++;
  }

  /** Program output: at most MAX_OUTPUT_LINES lines, each at most MAX_LINE_CHARS characters. */
  function addProgramLine(kind, rawText) {
    if (outputLines >= MAX_OUTPUT_LINES) {
      if (!outputLimitNoted) {
        outputLimitNoted = true;
        addLine("system", `Output limit reached (${MAX_OUTPUT_LINES} lines). Further messages are hidden. Press Stop or Run Code again to start fresh.`, false);
      }
      return;
    }
    let text = String(rawText);
    if (text.length > MAX_LINE_CHARS) {
      text = text.slice(0, MAX_LINE_CHARS) + `... (shortened to ${MAX_LINE_CHARS.toLocaleString("en-US")} characters)`;
    }
    addLine(kind, text, true);
  }

  // ---- run lifecycle ----
  function markRunning(id) { writeDraft(STORAGE_KEYS.runMarker, { v: 1, id }); }
  function clearMarker() { removeKey(STORAGE_KEYS.runMarker); }

  /** Ends the current run: no more messages are accepted, the watchdog is cancelled. */
  function endRun() {
    if (!run) return;
    clearTimeout(run.timer);
    clearTimeout(run.settleTimer);
    run = null;
    clearMarker();
    setRunUI();
  }

  function startRun() {
    const now = Date.now();
    if (now - lastRunClick < MIN_RUN_GAP_MS) return;   // repeated clicks
    lastRunClick = now;
    if (run && run.state === "running") {
      setStatus("Your code is still starting up. Please wait a moment, or press Stop.");
      return;
    }
    const js = jsEd.ta.value;
    if (js.trim() === "") {
      setStatus("The JavaScript box is empty. Write some code in the JS tab first.");
      return;
    }

    // Save everything BEFORE running, so a frozen tab never loses work.
    clearTimeout(debounceTimer);
    debounceTimer = null;
    pendingRender = false;
    jsEd.dirty = true;
    saveDirty();

    // Fresh context: the old frame (and its timers) is destroyed when the new one is mounted.
    if (run) { clearTimeout(run.timer); clearTimeout(run.settleTimer); run = null; }
    const id = newRunId();
    runCounter++;
    clearOutput();
    addLine("system", `▶ Run ${runCounter} started`, false);
    markRunning(id);

    const result = buildPreview(htmlEd.ta.value, cssEd.ta.value, { id, js });
    const f = makeFrame(result.html);
    mountFrame(f);
    run = {
      id, frame: f, win: f.contentWindow, state: "running", startedAt: performance.now(),
      readyCount: 0, hadError: false, problem: false, customLog: false, confirmed: false,
      timer: setTimeout(() => onWatchdog(id), WATCHDOG_MS)
    };
    wasEmpty = false;
    setRunUI();
    setStatus("Running your code...");

    // On phones the output lives in the Preview view, so show it (focus does not move).
    if (workshop && getComputedStyle(workshop).gridTemplateColumns.split(" ").length === 1 && workshop.getAttribute("data-view") === "code") {
      setView("preview");
    }
  }

  /** Replaces the running frame with a clean, JavaScript-free preview. */
  function recoverPreview() {
    pendingRender = false;
    const result = buildPreview(htmlEd.ta.value, cssEd.ta.value, null);
    if (result.empty) {
      unmountFrame();
      emptyState.hidden = false;
      wasEmpty = true;
    } else {
      mountFrame(makeFrame(result.html));
      wasEmpty = false;
    }
  }

  function onWatchdog(id) {
    if (!run || run.id !== id || run.state !== "running") return;
    endRun();
    recoverPreview();
    addLine("error", `Your code didn't finish within ${WATCHDOG_MS / 1000} seconds, so I stopped it.`, false);
    setStatus("⏱️ Stopped: your code didn't finish in 3 seconds. The preview is showing your page without JavaScript.");
    setPixel("encouraging", "<strong>Whoa, that took too long! ⏱️</strong><br>This usually means a loop that never ends, like <code>while (true)</code>, or a loop whose counter never changes. It can also happen if code tries to open another web page, which isn't allowed here. Check your code, then press Run Code again. Your code is safe.");
  }

  function stopRun() {
    if (!run) return;
    endRun();
    recoverPreview();
    addLine("system", "■ Stopped", false);
    setStatus("Stopped. The preview is showing your page without JavaScript.");
  }

  // ---- friendly error help (the original message is always shown too) ----
  function explainError(message) {
    const m = String(message);
    if (/is not defined/.test(m)) {
      return "JavaScript doesn't know that name. Check the spelling (capital letters matter!) and make sure you created it with <code>let</code> or <code>const</code> before using it.";
    }
    if (/Cannot (read|set) propert(y|ies) of (null|undefined)|null \((reading|setting)|undefined \((reading|setting)/.test(m)) {
      return "Your code tried to use something that doesn't exist. This often means <code>document.querySelector</code> didn't find your element. Check that the name matches your HTML.";
    }
    if (/Assignment to constant variable/.test(m)) {
      return "A <code>const</code> can't be changed after it's made. Use <code>let</code> if the value needs to change.";
    }
    if (/is not a function/.test(m)) {
      return "You tried to run something that isn't a function. Check the spelling and the parentheses.";
    }
    if (/Maximum call stack/.test(m)) {
      return "A function kept calling itself and never stopped. Make sure it has a way to finish.";
    }
    if (/Identifier '.*' has already been declared/.test(m)) {
      return "You used the same name twice with <code>let</code> or <code>const</code>. Pick a different name, or remove one.";
    }
    if (/Unexpected end of input/.test(m)) {
      return "Your code stopped in the middle. Something was opened but never closed: check every <code>(</code>, <code>{</code>, <code>[</code> and quote has a partner.";
    }
    if (/before initialization/.test(m)) {
      return "You used a <code>let</code> or <code>const</code> before the line that creates it. Move the creating line higher up.";
    }
    if (/is not iterable/.test(m)) {
      return "You tried to loop over something that isn't a list. Check that it's an array like <code>[1, 2, 3]</code>.";
    }
    if (/Illegal return/.test(m)) {
      return "<code>return</code> only works inside a function. Move it inside one, or take it out.";
    }
    if (/Invalid left-hand side|Unexpected token '='/.test(m)) {
      return "You used <code>=</code> where JavaScript expected a value. To compare two things use <code>===</code>; to store a value use <code>let name = value</code>.";
    }
    // The general "couldn't read your code" help comes after the specific cases above
    if (/SyntaxError|Unexpected (token|identifier|end|string|number)|Invalid or unexpected token|missing \)/.test(m)) {
      return "JavaScript couldn't read your code. Look near that line for a missing quote, bracket <code>) } ]</code> or comma.";
    }
    return "JavaScript stopped here. The message shows what went wrong, and the line number is a good place to start looking.";
  }

  // ---- messages from the preview frame (untrusted: validated, then shown as plain text) ----
  const OUT_LEVELS = { log: "log", info: "info", warn: "warn", error: "error" };

  window.addEventListener("message", (e) => {
    if (!run || e.source !== run.win || e.origin !== "null") return;       // must be THIS run's frame
    const d = e.data;
    if (!d || typeof d !== "object" || d.r !== run.id || typeof d.k !== "string") return;   // secret run id + known shape

    if (d.k === "ready") {
      run.readyCount++;
      if (run.readyCount > 1) {   // the frame reloaded itself: not a normal run
        endRun();
        recoverPreview();
        addLine("error", "Your code reloaded the preview, so I stopped it.", false);
        setStatus("Stopped: your code reloaded the preview. It is showing your page without JavaScript.");
      }
    } else if (d.k === "done") {
      if (run.state !== "running") return;
      run.state = "finished";
      clearTimeout(run.timer);
      clearMarker();
      setRunUI();
      run.loadMs = Math.round(performance.now() - run.startedAt);
      watchRunForGoals();
      if (run.hadError) {
        setStatus("⚠️ Your code stopped with an error. Check the Output box for what happened.");
      } else {
        // Not "ran without errors" yet: a timer may still throw. The observation window decides.
        setStatus(`⏳ Your code started. Watching for errors for ${RUN_SETTLE_MS / 1000} seconds...`);
      }
    } else if (d.k === "out") {
      if (typeof d.s !== "string" || !OUT_LEVELS[d.c]) return;
      addProgramLine(OUT_LEVELS[d.c], d.s);
      if (OUT_LEVELS[d.c] === "log") noteLogForGoals(d.s);
    } else if (d.k === "err") {
      if (typeof d.m !== "string") return;
      const line = Number.isInteger(d.l) && d.l > 0 ? ` (line ${d.l})` : "";
      run.problem = true;   // an execution error means this run can never earn a run goal
      addProgramLine("error", d.m + line);
      if (run.state === "finished") {
        setStatus("⚠️ Your code hit an error after it finished starting. Check the Output box for what happened.");
      }
      if (!run.hadError) {
        run.hadError = true;
        setPixel("encouraging", `<strong>JavaScript hit a snag! 🔧</strong><br>${explainError(d.m)}<br><span class="pg-pixel-original">The original message: <code>${escapeHtml(String(d.m).slice(0, 300))}</code>${escapeHtml(line)}</span>`);
      }
    } else if (d.k === "csp") {
      if (typeof d.d !== "string" || typeof d.u !== "string") return;
      run.problem = true;   // code that tried something the playground blocks is not a clean run
      if (run.state === "finished" && !run.confirmed) {
        setStatus("⚠️ Your code tried something the playground blocks. Check the Output box for what happened.");
      }
      const why = /^script/.test(d.d)
        ? "The playground only runs your own JavaScript, so extra scripts are blocked."
        : "Pages here can't load things from, or send things to, the internet.";
      addProgramLine("warn", `Blocked by the playground (${d.d}): ${d.u}. ${why}`);
    }
  });

  runBtn.addEventListener("click", () => {
    if (runBtn.getAttribute("aria-disabled") === "true") {
      setStatus("Your code is still starting up. Please wait a moment, or press Stop.");
      return;
    }
    startRun();
  });
  stopBtn.addEventListener("click", () => {
    if (stopBtn.getAttribute("aria-disabled") === "true") return;
    stopRun();
  });
  outputClear.addEventListener("click", () => { clearOutput(); });

  // ------------------------------------------------------------------------
  // 8. HTML / CSS / JS tabs
  // ------------------------------------------------------------------------
  const TABS = {
    html: { tab: document.getElementById("pg-tab-html"), pane: document.getElementById("pg-html-pane") },
    css: { tab: document.getElementById("pg-tab-css"), pane: document.getElementById("pg-css-pane") },
    js: { tab: document.getElementById("pg-tab-js"), pane: document.getElementById("pg-js-pane") }
  };
  const TAB_ORDER = ["html", "css", "js"];
  let cssIntroShown = false;
  let jsIntroShown = false;

  function selectTab(key, moveFocus) {
    activeKey = key;
    TAB_ORDER.forEach(k => {
      const on = k === key;
      TABS[k].tab.setAttribute("aria-selected", on ? "true" : "false");
      TABS[k].tab.setAttribute("tabindex", on ? "0" : "-1");
      TABS[k].tab.classList.toggle("is-current", on);
      TABS[k].pane.hidden = !on;
    });
    if (key === "css" && !cssIntroShown) {
      cssIntroShown = true;
      setPixel(PIXEL_CSS_INTRO.expr, PIXEL_CSS_INTRO.html);
    }
    if (key === "js" && !jsIntroShown) {
      jsIntroShown = true;
      setPixel(PIXEL_JS_INTRO.expr, PIXEL_JS_INTRO.html);
    }
    if (moveFocus) TABS[key].tab.focus();
  }

  TAB_ORDER.forEach(k => {
    TABS[k].tab.addEventListener("click", () => selectTab(k, false));
    TABS[k].tab.addEventListener("keydown", (e) => {
      const i = TAB_ORDER.indexOf(k);
      let next = null;
      if (e.key === "ArrowRight") next = TAB_ORDER[(i + 1) % TAB_ORDER.length];
      else if (e.key === "ArrowLeft") next = TAB_ORDER[(i - 1 + TAB_ORDER.length) % TAB_ORDER.length];
      else if (e.key === "Home") next = TAB_ORDER[0];
      else if (e.key === "End") next = TAB_ORDER[TAB_ORDER.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next, true);
      }
    });
  });

  // ------------------------------------------------------------------------
  // 9. Styling chips
  //    Each "slot" holds at most ONE chip. The chips own a marked block at the END of the
  //    CSS (so they win over earlier rules). The block is rebuilt from the chip choices, so
  //    clicking never appends duplicate rules. Tapping the active chip removes it.
  // ------------------------------------------------------------------------
  const CHIP_START = "/* chips:start";
  const CHIP_START_LINE = "/* chips:start - the styling chips write the rules below. Tap a chip again to remove its rule. */";
  const CHIP_END = "/* chips:end */";

  const CHIP_CATEGORIES = [
    { id: "backgrounds", title: "Background colours", slots: ["bg"] },
    { id: "text", title: "Text colours", slots: ["color"] },
    { id: "fonts", title: "Font styles", slots: ["font", "size"] },
    { id: "borders", title: "Borders and rounded corners", slots: ["border", "corners"] },
    { id: "spacing", title: "Spacing", slots: ["pagepad", "lineheight"] }
  ];

  const MIDNIGHT_TEXT = "#F8FAFC";

  const CHIP_SLOTS = {
    bg: {
      title: "Page background", selector: "body",
      help: "Changes the colour behind your whole page (the background-color of the body).",
      chips: [
        { id: "sky", label: "Sky", swatch: "#DBEAFE", decls: { "background-color": "#DBEAFE" } },
        { id: "mint", label: "Mint", swatch: "#D1FAE5", decls: { "background-color": "#D1FAE5" } },
        { id: "sunshine", label: "Sunshine", swatch: "#FEF3C7", decls: { "background-color": "#FEF3C7" } },
        { id: "lavender", label: "Lavender", swatch: "#EDE9FE", decls: { "background-color": "#EDE9FE" } },
        { id: "bubblegum", label: "Bubblegum", swatch: "#FCE7F3", decls: { "background-color": "#FCE7F3" } },
        { id: "midnight", label: "Midnight", swatch: "#1E1B2E", decls: { "background-color": "#1E1B2E" }, defaultText: MIDNIGHT_TEXT, note: " Midnight also makes the text light so you can still read it." }
      ]
    },
    color: {
      title: "Text colour", selector: "body",
      help: "Changes the colour of the writing on your page. Anything with its own colour rule, like the starter h1, keeps it until you change that rule.",
      chips: [
        { id: "purple", label: "Purple", swatch: "#6D28D9", decls: { "color": "#6D28D9" } },
        { id: "ocean", label: "Ocean", swatch: "#0369A1", decls: { "color": "#0369A1" } },
        { id: "forest", label: "Forest", swatch: "#047857", decls: { "color": "#047857" } },
        { id: "rose", label: "Rose", swatch: "#BE185D", decls: { "color": "#BE185D" } },
        { id: "charcoal", label: "Charcoal", swatch: "#111827", decls: { "color": "#111827" } }
      ]
    },
    font: {
      title: "Font", selector: "body",
      help: "Changes the style of the letters (the font-family).",
      chips: [
        { id: "friendly", label: "Friendly", fontFamily: "'Trebuchet MS', system-ui, sans-serif", decls: { "font-family": "'Trebuchet MS', system-ui, sans-serif" } },
        { id: "typewriter", label: "Typewriter", fontFamily: "'Courier New', monospace", decls: { "font-family": "'Courier New', monospace" } },
        { id: "storybook", label: "Storybook", fontFamily: "Georgia, serif", decls: { "font-family": "Georgia, serif" } }
      ]
    },
    size: {
      title: "Text size", selector: "html",
      help: "Makes everything on the page a little smaller or bigger (the font-size of the whole page).",
      chips: [
        { id: "small", label: "Small", decls: { "font-size": "90%" } },
        { id: "big", label: "Big", decls: { "font-size": "112%" } },
        { id: "huge", label: "Huge", decls: { "font-size": "125%" } }
      ]
    },
    border: {
      title: "Border", selector: "p, li, button",
      help: "Draws a frame around paragraphs, list items and buttons, with a little space inside (border and padding).",
      chips: [
        { id: "thin", label: "Thin purple", swatch: "#A855F7", decls: { "border": "2px solid #A855F7", "padding": "0.4rem 0.8rem" } },
        { id: "thick", label: "Thick blue", swatch: "#0EA5E9", decls: { "border": "4px solid #0EA5E9", "padding": "0.4rem 0.8rem" } },
        { id: "dashed", label: "Dashed pink", swatch: "#EC4899", decls: { "border": "3px dashed #EC4899", "padding": "0.4rem 0.8rem" } },
        { id: "dotted", label: "Dotted green", swatch: "#10B981", decls: { "border": "3px dotted #10B981", "padding": "0.4rem 0.8rem" } }
      ]
    },
    corners: {
      title: "Rounded corners", selector: "p, li, button",
      help: "Rounds the corners of paragraphs, list items and buttons (border-radius). They show best next to a border.",
      chips: [
        { id: "soft", label: "Soft", decls: { "border-radius": "8px" } },
        { id: "round", label: "Round", decls: { "border-radius": "16px" } },
        { id: "pill", label: "Pill", decls: { "border-radius": "999px" } }
      ]
    },
    pagepad: {
      title: "Space around the page", selector: "body",
      help: "Changes the empty space between the page edge and your content (padding on the body).",
      chips: [
        { id: "tight", label: "Tight", decls: { "padding": "0.5rem" } },
        { id: "roomy", label: "Roomy", decls: { "padding": "2rem" } },
        { id: "spacious", label: "Spacious", decls: { "padding": "3rem" } }
      ]
    },
    lineheight: {
      title: "Space between lines", selector: "body",
      help: "Changes how far apart lines of text are (line-height).",
      chips: [
        { id: "snug", label: "Snug", decls: { "line-height": "1.3" } },
        { id: "airy", label: "Airy", decls: { "line-height": "1.9" } },
        { id: "extra", label: "Extra airy", decls: { "line-height": "2.3" } }
      ]
    }
  };

  let chipState = {};

  function findChip(slotId, chipId) {
    const slot = CHIP_SLOTS[slotId];
    return slot ? slot.chips.find(c => c.id === chipId) : undefined;
  }

  /** Builds the managed CSS block from the chip choices ("" when no chips are on). */
  function buildChipBlock(state) {
    const rules = new Map(); // selector -> declaration lines (insertion order is stable)
    const add = (selector, prop, value) => {
      if (!rules.has(selector)) rules.set(selector, []);
      rules.get(selector).push(`  ${prop}: ${value};`);
    };
    Object.keys(CHIP_SLOTS).forEach(slotId => {
      const chip = findChip(slotId, state[slotId]);
      if (!chip) return;
      Object.keys(chip.decls).forEach(prop => add(CHIP_SLOTS[slotId].selector, prop, chip.decls[prop]));
      // A dark background brings its own readable text unless a text colour chip is chosen.
      if (chip.defaultText && !findChip("color", state.color)) add(CHIP_SLOTS[slotId].selector, "color", chip.defaultText);
    });
    if (rules.size === 0) return "";
    const lines = [CHIP_START_LINE];
    rules.forEach((decls, selector) => {
      lines.push(`${selector} {`);
      decls.forEach(d => lines.push(d));
      lines.push("}");
    });
    lines.push(CHIP_END);
    return lines.join("\n");
  }

  function chipBlockRange(css) {
    const start = css.indexOf(CHIP_START);
    const end = css.indexOf(CHIP_END);
    if (start === -1 || end === -1 || end < start) return null;
    return { start, end: end + CHIP_END.length };
  }

  /** Returns the CSS with the chip block replaced, inserted at the end, or removed. */
  function withChipBlock(css, block) {
    const range = chipBlockRange(css);
    if (range) {
      if (block) return css.slice(0, range.start) + block + css.slice(range.end);
      const before = css.slice(0, range.start).replace(/\s+$/, "");
      const after = css.slice(range.end).replace(/^\s+/, "");
      return before + (before && after ? "\n\n" : "") + after + ((before || after) ? "\n" : "");
    }
    if (!block) return css;
    const trimmed = css.replace(/\s+$/, "");
    return trimmed + (trimmed ? "\n\n" : "") + block + "\n";
  }

  function describeDecls(chip) {
    return Object.keys(chip.decls).map(p => `${p}: ${chip.decls[p]};`).join(" ");
  }

  const chipButtons = []; // { slotId, chipId, el }
  let chipPixelShown = false;

  function syncChipUI() {
    chipButtons.forEach(b => {
      const on = chipState[b.slotId] === b.chipId;
      b.el.setAttribute("aria-pressed", on ? "true" : "false");
      b.el.classList.toggle("is-on", on);
    });
  }

  /** If the learner deleted the chip block by hand, the chips switch themselves off. */
  function syncChipsWithText() {
    if (Object.keys(chipState).length > 0 && !chipBlockRange(cssEd.ta.value)) {
      chipState = {};
      syncChipUI();
    }
  }

  function scrollChipBlockIntoView() {
    const ta = cssEd.ta;
    const range = chipBlockRange(ta.value);
    if (!range) return;
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 24;
    const top = ta.value.slice(0, range.start).split("\n").length * lineHeight;
    if (top < ta.scrollTop || top > ta.scrollTop + ta.clientHeight - 4 * lineHeight) {
      ta.scrollTop = Math.max(0, top - lineHeight);
    }
  }

  function toggleChip(slotId, chip) {
    const next = Object.assign({}, chipState);
    const removing = next[slotId] === chip.id;
    if (removing) delete next[slotId]; else next[slotId] = chip.id;

    const newCss = withChipBlock(cssEd.ta.value, buildChipBlock(next));
    if (newCss.length > MAX_CHARS) {
      cssEd.showNote("Your CSS is too long to add another chip. Delete some CSS first.", 5000);
      return;
    }
    chipState = next;
    cssEd.edited = true; // chips have their own Pixel message
    cssEd.ta.value = newCss;
    cssEd.ta.dispatchEvent(new Event("input", { bubbles: true })); // counts, preview and saving
    syncChipUI();
    scrollChipBlockIntoView();

    const slot = CHIP_SLOTS[slotId];
    if (removing) {
      cssEd.showNote(`Removed the ${slot.title.toLowerCase()} chip from your CSS.`, 6000);
    } else {
      cssEd.showNote(`${slot.title}: ${chip.label}. I added ${describeDecls(chip)} to your CSS.${chip.note || ""}`, 8000);
    }
    if (!chipPixelShown) {
      chipPixelShown = true;
      setPixel("excited", "<strong>You styled your page! 🎨</strong><br>That chip wrote real CSS. Look at the lines between <code>chips:start</code> and <code>chips:end</code> in your CSS box.");
    }
    if (!removing) awardGoals(["style-chip"]);   // a real action: switching a chip on
  }

  function buildChipUI() {
    const host = document.getElementById("pg-chip-groups");
    if (!host) return;
    CHIP_CATEGORIES.forEach((cat, ci) => {
      const details = document.createElement("details");
      details.className = "pg-chip-cat";
      if (ci === 0) details.open = true;
      const summary = document.createElement("summary");
      summary.textContent = cat.title;
      details.appendChild(summary);

      cat.slots.forEach(slotId => {
        const slot = CHIP_SLOTS[slotId];
        const group = document.createElement("div");
        group.className = "pg-chip-slot";
        group.setAttribute("role", "group");
        const titleId = `pg-chip-title-${slotId}`;
        const helpId = `pg-chip-help-${slotId}`;
        group.setAttribute("aria-labelledby", titleId);
        group.setAttribute("aria-describedby", helpId);

        const title = document.createElement("p");
        title.id = titleId;
        title.className = "pg-chip-slot-title";
        title.textContent = slot.title;
        const help = document.createElement("p");
        help.id = helpId;
        help.className = "pg-chip-help";
        help.textContent = slot.help;
        const row = document.createElement("div");
        row.className = "pg-chip-row";

        slot.chips.forEach(chip => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "pg-chip";
          btn.setAttribute("aria-pressed", "false");
          if (chip.swatch) {
            const dot = document.createElement("span");
            dot.className = "pg-chip-swatch";
            dot.setAttribute("aria-hidden", "true");
            dot.style.backgroundColor = chip.swatch;
            btn.appendChild(dot);
          }
          const label = document.createElement("span");
          label.textContent = chip.label;
          if (chip.fontFamily) label.style.fontFamily = chip.fontFamily;
          btn.appendChild(label);
          btn.addEventListener("click", () => toggleChip(slotId, chip));
          row.appendChild(btn);
          chipButtons.push({ slotId, chipId: chip.id, el: btn });
        });

        group.append(title, help, row);
        details.appendChild(group);
      });
      host.appendChild(details);
    });
  }

  // ------------------------------------------------------------------------
  // 9b. Guided progression: Remix, Style, Bring it to life, Free Canvas
  //     - Goals are earned from real actions and are never taken away (resets do not matter).
  //     - Every tab stays available at all times; the levels only guide.
  //     - Progress lives in localStorage under its own key, separate from the drafts.
  //     - Nothing is checked when the page loads or a tab is opened.
  // ------------------------------------------------------------------------
  const PROGRESS_KEY = "curiotech_playground_progress";
  const FREE_CANVAS = 4;
  const RUN_SETTLE_MS = 2000;   // a run must stay error-free this long after it finished loading
  const STARTER_LOG_LINES = ["Hello from my JavaScript! 🎉", "The button was clicked"];

  const LEVELS = [
    {
      id: 1, name: "Remix", icon: "✏️", badge: "LEVEL 1 OF 4 • REMIX",
      desc: "Make a few small changes to the page in the HTML tab. Any order is fine, and you can't break anything.",
      intro: "Change the page a little. Use the HTML tab. Any order is fine!",
      goals: [
        { id: "remix-title", text: "Change the big title", where: "HTML tab: the <h1> line" },
        { id: "remix-paragraph", text: "Change the paragraph words", where: "HTML tab: the <p> line" },
        { id: "remix-add", text: "Add something new", where: "HTML tab: like another <p> or a list item" }
      ],
      pixelIntro: "<strong>Level 1: Remix ✏️</strong><br>Make a few small changes in the HTML tab: change the title, change the paragraph, and add something new.",
      pixelDone: "<strong>Level 1 complete! 🎉</strong><br>You remixed a real webpage. Press <strong>Continue</strong> in the mission card to meet Level 2: Style."
    },
    {
      id: 2, name: "Style", icon: "🎨", badge: "LEVEL 2 OF 4 • STYLE",
      desc: "Make your page beautiful with CSS. Tap a styling chip, or write your own rules in the CSS tab.",
      intro: "Make it beautiful! Try a styling chip, or write your own CSS.",
      goals: [
        { id: "style-chip", text: "Tap a styling chip", where: "CSS tab: the Styling chips box" },
        { id: "style-own", text: "Write your own CSS", where: "CSS tab: change a colour or add a rule" }
      ],
      pixelIntro: "<strong>Level 2: Style 🎨</strong><br>HTML builds your page, CSS makes it beautiful! Tap a styling chip, then try writing a rule of your own in the CSS tab.",
      pixelDone: "<strong>Level 2 complete! 🎉</strong><br>Your page has style! Press <strong>Continue</strong> to meet Level 3: Bring it to life."
    },
    {
      id: 3, name: "Bring it to life", icon: "⚡", badge: "LEVEL 3 OF 4 • BRING IT TO LIFE",
      desc: "Make your page do things with JavaScript. Write code in the JS tab, then press Run Code.",
      intro: "Make your page DO things! Use the JS tab, then press Run Code.",
      goals: [
        { id: "live-run", text: "Run your code with no errors", where: "JS tab, then press Run Code" },
        { id: "live-message", text: "Print your own message", where: "JS tab: use console.log(\"...\") and run it" }
      ],
      pixelIntro: "<strong>Level 3: Bring it to life ⚡</strong><br>Press <strong>Run Code</strong> in the JS tab, then change the message in <code>console.log()</code> and run it again.",
      pixelDone: "<strong>Level 3 complete! 🎉</strong><br>Your JavaScript works! Press <strong>Continue</strong> to open Free Canvas."
    },
    {
      id: 4, name: "Free Canvas", icon: "🌟", badge: "LEVEL 4 OF 4 • FREE CANVAS",
      desc: "No goals and no rules. Build anything you like with HTML, CSS and JavaScript.",
      intro: "No goals, no rules. Create anything you like! Need ideas?",
      goals: [],
      ideas: [
        "Build a profile card with your name and a favourite thing",
        "Make the button change a colour or a word when you click it",
        "Count how many times the button was clicked"
      ],
      pixelIntro: "<strong>Welcome to Free Canvas! 🌟</strong><br>No goals and no rules from here. Build whatever you like, and ask for the guided levels again any time.",
      pixelDone: ""
    }
  ];

  // Hints for each goal: gentle first, then more specific, then an example. Plain text (shown with textContent).
  const HINTS = {
    "remix-title": [
      "Look in the HTML tab for the line that starts with <h1>.",
      "The words between <h1> and </h1> are your title. Select them and type something new. Keep the tags.",
      "For example: <h1>My Robot Page</h1>"
    ],
    "remix-paragraph": [
      "Find the line that starts with <p> near the top of the HTML tab.",
      "Change the sentence between <p> and </p>. Keep the tags where they are.",
      "For example: <p>I love building robots!</p>"
    ],
    "remix-add": [
      "You can add a new line of HTML anywhere inside the page.",
      "Add another <p>...</p> under the first one, or a new <li>...</li> inside the list.",
      "For example, add this line inside the list: <li>🎸 Music</li>"
    ],
    "style-chip": [
      "Open the CSS tab and look for the Styling chips box under the editor.",
      "Tap any chip, like a colour or a font, and watch your page change in the preview.",
      "Tap the same chip again to take it away. Try one more to see the difference."
    ],
    "style-own": [
      "In the CSS tab, find a rule like h1 { ... }. A rule is a name followed by settings in { }.",
      "Change a value inside a rule. For example, change the colour after color:",
      "Or add a new rule at the bottom: p { color: purple; font-size: 1.2rem; }"
    ],
    "live-run": [
      "Open the JS tab, then press the Run Code button.",
      "JavaScript only runs when you press Run Code. Wait for the message under the button.",
      "If you see an error, read Pixel's help in the speech bubble, fix that line, then press Run Code again."
    ],
    "live-message": [
      "Find a line with console.log(...) in the JS tab.",
      "Change the words inside the quotes to your own message.",
      "For example: console.log(\"Hello, I am learning to code!\"); then press Run Code and look in the Output box."
    ]
  };

  const GOAL_IDS = [];
  LEVELS.forEach(lv => lv.goals.forEach(g => GOAL_IDS.push(g.id)));
  const GOAL_BY_ID = {};
  LEVELS.forEach(lv => lv.goals.forEach(g => { GOAL_BY_ID[g.id] = { goal: g, level: lv }; }));

  let progress = { level: 1, goals: {}, celebrated: {}, skipped: false };
  let progressSaveFailed = false;

  const levelOf = n => LEVELS[n - 1];
  const goalsDoneIn = lv => lv.goals.filter(g => progress.goals[g.id] === true).length;
  const levelComplete = lv => lv.goals.length > 0 && goalsDoneIn(lv) === lv.goals.length;
  const nextGoalIn = lv => lv.goals.find(g => progress.goals[g.id] !== true);
  const squash = s => String(s).replace(/\s+/g, " ").trim();
  const lcFirst = s => String(s).charAt(0).toLowerCase() + String(s).slice(1);

  // ---- storage (localStorage, always guarded; corrupt or unavailable storage falls back to Level 1) ----
  function loadProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw === null) return null;
      const d = JSON.parse(raw);
      if (!d || typeof d !== "object") return null;
      const p = { level: 1, goals: {}, celebrated: {}, skipped: false };
      if (Number.isInteger(d.level) && d.level >= 1 && d.level <= FREE_CANVAS) p.level = d.level;
      if (d.goals && typeof d.goals === "object") {
        GOAL_IDS.forEach(id => { if (d.goals[id] === true) p.goals[id] = true; });
      }
      if (d.celebrated && typeof d.celebrated === "object") {
        [1, 2, 3].forEach(n => { if (d.celebrated[n] === true) p.celebrated[n] = true; });
      }
      p.skipped = d.skipped === true;
      return p;
    } catch (e) {
      if (e && e.name !== "SyntaxError") progressSaveFailed = true;   // storage itself is unavailable
      return null;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({
        v: 1, level: progress.level, goals: progress.goals, celebrated: progress.celebrated, skipped: progress.skipped
      }));
      progressSaveFailed = false;
    } catch (e) {
      progressSaveFailed = true;
    }
  }

  // ---- goal detectors (small, forgiving, no side effects) ----
  const IGNORED_TAGS = ["script", "style", "meta", "link", "title", "noscript", "template", "base"];

  function analyseHtml(html) {
    const doc = new DOMParser().parseFromString(String(html).slice(0, MAX_CHARS), "text/html");   // inert
    const h1 = doc.body ? doc.body.querySelector("h1") : null;
    const p = doc.body ? doc.body.querySelector("p") : null;
    const tags = {};
    if (doc.body) {
      doc.body.querySelectorAll("*").forEach(el => {
        const n = el.localName;
        if (IGNORED_TAGS.indexOf(n) === -1) tags[n] = (tags[n] || 0) + 1;
      });
    }
    return { h1: h1 ? squash(h1.textContent) : "", p: p ? squash(p.textContent) : "", tags };
  }
  const STARTER_FACTS = analyseHtml(STARTER_HTML);
  // What a goal is measured against: the starter, or (after a Mission 01 blueprint import) the imported page,
  // so an import by itself never earns a Remix goal. See section 9c.
  let htmlBaseline = STARTER_FACTS;

  /** Which HTML goals does this code meet? (the title/paragraph must differ from the baseline and not be empty) */
  function htmlGoalsMet(html) {
    const f = analyseHtml(html);
    const added = Object.keys(f.tags).some(n => f.tags[n] > (htmlBaseline.tags[n] || 0));
    return {
      "remix-title": f.h1 !== "" && f.h1 !== htmlBaseline.h1,
      "remix-paragraph": f.p !== "" && f.p !== htmlBaseline.p,
      "remix-add": added
    };
  }

  /** The set of "selector|property:value" declarations the learner wrote OUTSIDE the chips' block. */
  function ownCssDeclarations(css) {
    let text = String(css);
    const r = chipBlockRange(text);
    if (r) text = text.slice(0, r.start) + text.slice(r.end);
    text = text.replace(/\/\*[\s\S]*?\*\//g, "");
    const set = new Set();
    const re = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const sel = squash(m[1]).toLowerCase();
      m[2].split(";").forEach(decl => {
        const i = decl.indexOf(":");
        if (i > 0) {
          const prop = decl.slice(0, i).trim().toLowerCase();
          const val = squash(decl.slice(i + 1)).toLowerCase();
          if (prop && val) set.add(sel + "|" + prop + ":" + val);
        }
      });
    }
    return set;
  }
  const STARTER_CSS_DECLS = ownCssDeclarations(STARTER_CSS);
  // What the "write your own CSS" goal is measured against: the starter, or (after a saved project is opened)
  // that project's own rules, so opening a project by itself never earns the goal. See section 9e.
  let cssBaselineDecls = STARTER_CSS_DECLS;

  function ownCssMet(css) {
    for (const d of ownCssDeclarations(css)) {
      if (!cssBaselineDecls.has(d)) return true;
    }
    return false;
  }

  const STARTER_LOG_SET = new Set(STARTER_LOG_LINES.map(squash));
  const isCustomLog = text => squash(text) !== "" && !STARTER_LOG_SET.has(squash(text));

  // ---- the mission card, level indicator and level header ----
  const missionEl = document.getElementById("pg-mission");
  const missionDetails = document.getElementById("pg-mission-details");
  const missionTitle = document.getElementById("pg-mission-title");
  const missionCount = document.getElementById("pg-mission-count");
  const missionNext = document.getElementById("pg-mission-next");
  const missionIntro = document.getElementById("pg-mission-intro");
  const missionGoals = document.getElementById("pg-mission-goals");
  const missionWarn = document.getElementById("pg-mission-warn");
  const hintBtn = document.getElementById("pg-mission-hint-btn");
  const hintBox = document.getElementById("pg-mission-hint");
  const missionContinue = document.getElementById("pg-mission-continue");
  const missionSkip = document.getElementById("pg-mission-skip");
  const missionBack = document.getElementById("pg-mission-back");
  const levelBadge = document.getElementById("pg-level-badge");
  const levelTitle = document.getElementById("pg-level-title");
  const levelDesc = document.getElementById("pg-level-desc");
  const levelSteps = document.querySelectorAll(".pg-step[data-level]");

  // ---- hints: one at a time for the next goal; starts over whenever the next goal changes ----
  let hintState = { goalId: "", shown: 0 };

  function syncHints(goal) {
    if (!hintBtn || !hintBox) return;
    const hints = goal ? HINTS[goal.id] : null;
    if (!hints) {                       // Free Canvas, a finished level, or no hints for this goal
      hintBtn.hidden = true;
      hintBox.hidden = true;
      hintBox.textContent = "";
      hintState = { goalId: "", shown: 0 };
      return;
    }
    if (hintState.goalId !== goal.id) {
      hintState = { goalId: goal.id, shown: 0 };
      hintBox.hidden = true;
      hintBox.textContent = "";
    }
    hintBtn.hidden = false;
    hintBtn.textContent = hintState.shown === 0 ? "💡 Need a hint?"
      : hintState.shown < hints.length ? "💡 Another hint" : "💡 Start the hints again";
  }

  function showNextHint() {
    const found = GOAL_BY_ID[hintState.goalId];
    const hints = found ? HINTS[found.goal.id] : null;
    if (!hints) return;
    hintState.shown = hintState.shown >= hints.length ? 1 : hintState.shown + 1;
    const text = hints[hintState.shown - 1];
    hintBox.textContent = `💡 Hint ${hintState.shown} of ${hints.length}: ${text}`;
    hintBox.hidden = false;
    setPixel("thinking", `<strong>Here's a hint 💡</strong><br>${escapeHtml(text)}`);
    syncHints(found.goal);
  }

  if (hintBtn) hintBtn.addEventListener("click", showNextHint);

  function renderProgress(opts) {
    if (!missionEl) return;
    const o = opts || {};
    const lv = levelOf(progress.level);
    const free = lv.id === FREE_CANVAS;
    const complete = !free && levelComplete(lv);

    // level header
    if (levelBadge) levelBadge.textContent = lv.badge;
    if (levelTitle) levelTitle.textContent = free ? "Free Canvas" : `Level ${lv.id}: ${lv.name}`;
    if (levelDesc) levelDesc.textContent = lv.desc;

    // level indicator (nothing is locked: these are only labels)
    levelSteps.forEach(li => {
      const n = Number(li.getAttribute("data-level"));
      const l = levelOf(n);
      let state = "upcoming";
      let label = "(next)";
      if (n === progress.level) { state = "current"; label = "(current)"; }
      else if (n < FREE_CANVAS && levelComplete(l)) { state = "done"; label = "(done)"; }
      else if (progress.skipped && n < progress.level) { state = "skipped"; label = "(skipped)"; }
      else if (n < progress.level) { state = "done"; label = "(done)"; }
      li.className = "pg-step is-" + state;
      if (state === "current") li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      const st = li.querySelector(".pg-step-state");
      if (st) st.textContent = label;
    });

    // mission card
    missionEl.classList.toggle("is-complete", complete);
    missionTitle.textContent = free ? `${lv.icon} Free Canvas` : `${lv.icon} Level ${lv.id}: ${lv.name}`;
    if (free) {
      missionCount.textContent = "No goals";
      missionNext.textContent = "✨ Create anything you like!";
    } else if (complete) {
      missionCount.textContent = "All done! ✅";
      missionNext.textContent = lv.id === 3 ? "🎉 Level complete! Open Free Canvas below." : "🎉 Level complete! Continue to the next level below.";
    } else {
      missionCount.textContent = `${goalsDoneIn(lv)} of ${lv.goals.length} done`;
      missionNext.textContent = "👉 Next: " + nextGoalIn(lv).text;
    }
    missionIntro.textContent = lv.intro;

    missionGoals.textContent = "";
    if (free) {
      lv.ideas.forEach(idea => {
        const li = document.createElement("li");
        li.className = "is-idea";
        const mark = document.createElement("span");
        mark.className = "pg-goal-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "✨";
        const text = document.createElement("span");
        text.className = "pg-goal-text";
        text.textContent = idea;
        li.append(mark, text);
        missionGoals.appendChild(li);
      });
    } else {
      lv.goals.forEach(g => {
        const done = progress.goals[g.id] === true;
        const li = document.createElement("li");
        if (done) li.className = "is-done";
        const mark = document.createElement("span");
        mark.className = "pg-goal-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "✓";
        const state = document.createElement("span");
        state.className = "p44-sr-only";
        state.textContent = done ? "Done: " : "Not done yet: ";
        const text = document.createElement("span");
        text.className = "pg-goal-text";
        text.appendChild(state);
        text.appendChild(document.createTextNode(g.text));
        const where = document.createElement("span");
        where.className = "pg-goal-where";
        where.textContent = g.where;
        text.appendChild(where);
        li.append(mark, text);
        missionGoals.appendChild(li);
      });
    }

    // actions: Continue only when this level is complete; Skip until Free Canvas; Back from Free Canvas
    missionContinue.hidden = !complete;
    if (complete) {
      const nx = levelOf(lv.id + 1);
      missionContinue.textContent = nx.id === FREE_CANVAS ? "Continue to Free Canvas →" : `Continue to Level ${nx.id}: ${nx.name} →`;
    }
    missionSkip.hidden = free;
    missionBack.hidden = !free;
    syncHints(free || complete ? null : nextGoalIn(lv));

    missionWarn.hidden = !progressSaveFailed;
    if (progressSaveFailed) {
      missionWarn.textContent = "Heads up: this browser won't let me save your progress, so it will reset when you close this page.";
    }

    if (o.open) missionDetails.open = true;
    if (o.celebrate) {
      missionEl.classList.remove("is-celebrating");
      void missionEl.offsetWidth;   // restart the short celebration (it is skipped for reduced motion)
      missionEl.classList.add("is-celebrating");
    }
  }

  /** Earns goals (never un-earns). Tells the learner through Pixel, once for everything earned together. */
  function awardGoals(ids) {
    const fresh = ids.filter(id => GOAL_BY_ID[id] && progress.goals[id] !== true);
    if (fresh.length === 0) return;
    fresh.forEach(id => { progress.goals[id] = true; });

    const cur = levelOf(progress.level);
    const justCompleted = cur.id < FREE_CANVAS && levelComplete(cur) && progress.celebrated[cur.id] !== true;
    if (justCompleted) progress.celebrated[cur.id] = true;
    saveProgress();
    renderProgress({ open: justCompleted, celebrate: justCompleted });

    if (justCompleted) {
      setPixel("excited", cur.pixelDone);
    } else {
      const names = fresh.map(id => lcFirst(GOAL_BY_ID[id].goal.text));
      const inCurrent = fresh.some(id => GOAL_BY_ID[id].level.id === cur.id);
      let msg = "<strong>Goal complete! ✅</strong><br>" + escapeHtml(names.join(" and ")) + ".";
      if (inCurrent && cur.goals.length) {
        msg += ` ${goalsDoneIn(cur)} of ${cur.goals.length} done in Level ${cur.id}.`;
        const nx = nextGoalIn(cur);
        if (nx) msg += " Next: " + escapeHtml(lcFirst(nx.text)) + ".";
      } else if (!inCurrent) {
        msg += " That counts for a later level, so you're already ahead!";
      }
      setPixel("excited", msg);
    }
  }

  /** After the debounced edit step: HTML goals (when HTML changed) and the own-CSS goal (when CSS changed). */
  function checkEditGoals(htmlChanged, cssChanged) {
    const ids = [];
    if (htmlChanged && ["remix-title", "remix-paragraph", "remix-add"].some(id => progress.goals[id] !== true)) {
      const met = htmlGoalsMet(htmlEd.ta.value);
      Object.keys(met).forEach(id => { if (met[id]) ids.push(id); });
    }
    if (cssChanged && progress.goals["style-own"] !== true && ownCssMet(cssEd.ta.value)) ids.push("style-own");
    awardGoals(ids);
  }

  /**
   * A run earns the run goals only after the whole observation window (RUN_SETTLE_MS, counted from the
   * moment the page finished loading) passes with no error, blocked action, timeout, Stop or new run.
   * The timer belongs to this run: ending or replacing the run cancels it, and the callback re-checks the id.
   */
  function watchRunForGoals() {
    const id = run.id;
    run.settleTimer = setTimeout(() => {
      if (!run || run.id !== id || run.problem || run.state !== "finished") return;   // no award
      run.confirmed = true;
      showRunConfirmed();
      const ids = ["live-run"];
      if (run.customLog) ids.push("live-message");
      awardGoals(ids);
    }, RUN_SETTLE_MS);
  }

  /** Only now is it fair to say the run was clean. */
  function showRunConfirmed() {
    setStatus(`✅ No errors in the first ${RUN_SETTLE_MS / 1000} seconds (it started in ${run.loadMs} ms). Press Stop, or edit your HTML or CSS, to go back to the plain preview.`);
    if (outputLines === 0) addLine("info", "Your code ran. It didn't print anything. Try console.log(\"hi\") to print a message here.", false);
    if (!firstSuccessShown) {
      firstSuccessShown = true;
      setPixel("excited", "<strong>It ran! 🎉</strong><br>Try clicking things in the preview, and use <code>console.log()</code> to peek inside your code.");
    }
  }

  /** A custom console.log line (not one of the starter's own lines). Counts once the run is confirmed clean. */
  function noteLogForGoals(text) {
    if (!run || !isCustomLog(text)) return;
    run.customLog = true;
    if (run.confirmed && !run.problem) awardGoals(["live-message"]);
  }

  // ---- level flow: Continue, Skip, Back (all are explicit learner actions; no code is touched) ----
  function afterLevelChange(introHtml) {
    renderProgress({ open: true });
    setPixel("excited", introHtml);
    // focus the card's summary: a screen reader reads the level, the progress and the next goal together
    const summary = missionDetails.querySelector("summary");
    if (summary) summary.focus({ preventScroll: true });
  }

  missionContinue.addEventListener("click", () => {
    const cur = levelOf(progress.level);
    if (cur.id >= FREE_CANVAS || !levelComplete(cur)) return;
    progress.level = cur.id + 1;
    progress.skipped = false;
    saveProgress();
    const nx = levelOf(progress.level);
    let intro = nx.pixelIntro;
    if (nx.id < FREE_CANVAS && levelComplete(nx)) intro += "<br>You've already done these goals, so you can continue right away!";
    afterLevelChange(intro);
  });

  missionSkip.addEventListener("click", () => {
    progress.level = FREE_CANVAS;
    progress.skipped = true;
    saveProgress();
    afterLevelChange("<strong>Straight to Free Canvas! 🌟</strong><br>Your code is exactly as you left it. Build anything you like, and use <strong>Back to guided levels</strong> if you want the goals again.");
  });

  missionBack.addEventListener("click", () => {
    const firstOpen = LEVELS.slice(0, 3).find(l => !levelComplete(l));
    progress.level = firstOpen ? firstOpen.id : 1;
    progress.skipped = false;
    saveProgress();
    afterLevelChange(levelOf(progress.level).pixelIntro);
  });

  function initProgress() {
    const loaded = loadProgress();
    if (loaded) progress = loaded;
    // On phones the card starts collapsed (its summary already shows the level, progress and next goal).
    const roomy = window.matchMedia ? window.matchMedia("(min-width: 601px)").matches : true;
    renderProgress({ open: roomy });
    missionDetails.open = roomy;
  }

  // ------------------------------------------------------------------------
  // 9c. Mission 01 blueprint hand-off (Phase 4.5.6)
  //     Mission 01 leaves ONE record in sessionStorage and opens playground.html?from=mission-01:
  //       key  "curiotech_blueprint_handoff"
  //       data { v: 1, title, tagline, graphic, button }   (all plain strings)
  //     - Nothing is imported unless the URL says ?from=mission-01 AND a valid record exists.
  //     - The learner's own HTML is never replaced without asking.
  //     - An import is not a learner action: it never earns a goal. Goals are measured against the
  //       imported page (htmlBaseline), which is remembered for this tab so a refresh keeps working.
  //     - Only the HTML file is touched. The sandbox, CSP and HTML cleaning are not involved at all.
  // ------------------------------------------------------------------------
  const HANDOFF_KEY = "curiotech_blueprint_handoff";
  const BASELINE_KEY = "curiotech_playground_html_baseline";
  const handoffEl = document.getElementById("pg-handoff");
  const handoffTitle = document.getElementById("pg-handoff-title");
  const handoffUse = document.getElementById("pg-handoff-use");
  const handoffKeep = document.getElementById("pg-handoff-keep");
  let pendingBlueprintHtml = null;

  /** The record, checked and trimmed. Returns null when it is missing or not usable. */
  function readBlueprint() {
    const d = readDraft(HANDOFF_KEY);
    if (!d || d.v !== 1) return null;
    const clean = (v, max) => (typeof v === "string"
      ? v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
      : "");
    const bp = { title: clean(d.title, 30), tagline: clean(d.tagline, 200), graphic: clean(d.graphic, 60), button: clean(d.button, 40) };
    return bp.title && bp.tagline && bp.graphic && bp.button ? bp : null;
  }

  /** The blueprint as real HTML. Every learner-chosen word is escaped. The first <p> is the story line. */
  function blueprintToHtml(bp) {
    return [
      "<!-- This is the page you planned in Mission 01, now written as real HTML! -->",
      "<nav>Home • Missions • Portfolio</nav>",
      "",
      "<h1>" + escapeHtml(bp.title) + "</h1>",
      "",
      "<!-- In Mission 01 this was an <img>. Pictures from the internet can't load in this workshop, so I used an emoji! -->",
      "<div>" + escapeHtml(bp.graphic) + "</div>",
      "",
      "<p>" + escapeHtml(bp.tagline) + "</p>",
      "",
      "<button>" + escapeHtml(bp.button) + "</button>",
      ""
    ].join("\n");
  }

  // ---- goal baseline (sessionStorage, always guarded) ----
  function setHtmlBaseline(facts) {
    htmlBaseline = facts;
    writeDraft(BASELINE_KEY, { v: 1, h1: facts.h1, p: facts.p, tags: facts.tags });
  }

  function resetHtmlBaseline() {
    htmlBaseline = STARTER_FACTS;
    removeKey(BASELINE_KEY);
  }

  function loadHtmlBaseline() {
    const d = readDraft(BASELINE_KEY);
    if (!d || d.v !== 1 || typeof d.h1 !== "string" || typeof d.p !== "string" || !d.tags || typeof d.tags !== "object") return;
    const tags = {};
    Object.keys(d.tags).forEach(n => {
      const c = d.tags[n];
      if (Number.isInteger(c) && c >= 0 && c <= 1000) tags[n] = c;
    });
    htmlBaseline = { h1: d.h1.slice(0, 500), p: d.p.slice(0, 2000), tags };
  }

  // ---- the hand-off itself ----
  function finishHandoff() {
    removeKey(HANDOFF_KEY);   // so a refresh never imports again
    try { window.history.replaceState(null, "", window.location.pathname + window.location.hash); } catch (e) { /* not essential */ }
  }

  function hideHandoffBanner() {
    pendingBlueprintHtml = null;
    if (handoffEl) handoffEl.hidden = true;
  }

  /** Puts the blueprint into the HTML editor. Not a learner edit: no goal check runs. */
  function applyBlueprint(html) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
    htmlEd.ta.value = html.slice(0, MAX_CHARS);
    htmlEd.edited = false;   // the first real edit still gets its friendly message
    htmlEd.dirty = true;
    htmlEd.updateCount();
    setHtmlBaseline(analyseHtml(htmlEd.ta.value));   // BEFORE anything can check goals
    selectTab("html", false);
    pendingRender = false;
    renderPreview();
    saveDirty();
    hideHandoffBanner();
    finishHandoff();
    htmlEd.showNote("Your Mission 01 blueprint was loaded.", 6000);
    setPixel("excited", "<strong>Your Mission 01 blueprint is here! 🎨</strong><br>This is the page you planned, now written as real HTML. Change the title, change the story words, or add something new to remix it!");
  }

  function keepOwnWork() {
    hideHandoffBanner();
    finishHandoff();
    htmlEd.showNote("Kept your own HTML. Nothing was replaced.", 6000);
    setPixel("happy", "<strong>No problem! 🛡️</strong><br>Your own HTML is exactly as you left it. You can still build your blueprint page in Mission 01 again any time.");
  }

  function initHandoff() {
    let from = null;
    try { from = new URLSearchParams(window.location.search).get("from"); } catch (e) { from = null; }
    if (from !== "mission-01") return;   // no request, no import

    const bp = readBlueprint();
    if (!bp) {
      finishHandoff();
      setPixel("encouraging", "<strong>I couldn't find your blueprint. 🔍</strong><br>It may have been saved in a different tab. You can finish Mission 01 first, or just start playing here. Everything in the workshop still works!");
      return;
    }

    const html = blueprintToHtml(bp);
    const current = htmlEd.ta.value;
    if (current === html) {   // already exactly this page
      finishHandoff();
      setPixel("happy", "<strong>Your blueprint is already here! 🎨</strong><br>Change the title, change the story words, or add something new.");
      return;
    }

    const hasOwnHtml = current.trim() !== "" && current !== STARTER_HTML;
    if (!hasOwnHtml) {
      applyBlueprint(html);
      return;
    }

    // The learner already has their own HTML: ask first, change nothing yet.
    if (!handoffEl || !handoffUse || !handoffKeep) { finishHandoff(); return; }   // no banner available: keep their work
    pendingBlueprintHtml = html;
    handoffEl.hidden = false;
    setPixel("thinking", "<strong>Your Mission 01 blueprint is waiting! 🎨</strong><br>You already have your own HTML here, so I won't replace it unless you say so. Choose in the box above the editor.");
    if (handoffTitle) handoffTitle.focus();
  }

  if (handoffUse) {
    handoffUse.addEventListener("click", () => {
      if (pendingBlueprintHtml === null) return;
      applyBlueprint(pendingBlueprintHtml);
      htmlEd.ta.focus();
    });
  }
  if (handoffKeep) {
    handoffKeep.addEventListener("click", () => {
      if (pendingBlueprintHtml === null) return;
      keepOwnWork();
      htmlEd.ta.focus();
    });
  }

  // ------------------------------------------------------------------------
  // 9d. Download my page (Phase 4.5.6)
  //     One self-contained file built entirely in this page (Blob + temporary link, no network).
  //     - The HTML goes through cleanLearnerHtml(), the same cleaner the preview uses, so the file shows
  //       the same cleaned page the learner sees.
  //     - The CSS goes in one <style>, the JavaScript in one <script> (prepareScriptText() escapes
  //       </script, <!-- and <script exactly as Run mode does). The sandbox wrapper, the CSP and the
  //       output capture are NOT part of the file: it is a normal web page.
  //     - The text is read from the three editors at click time, so unsaved edits are included.
  //     Nothing here touches the preview, the sandbox, Run/Stop, the hand-off or the goal baseline.
  // ------------------------------------------------------------------------
  const DOWNLOAD_FILENAME = "my-curiotech-page.html";
  const downloadBtn = document.getElementById("pg-download-btn");
  const downloadStatus = document.getElementById("pg-download-status");

  /** The finished document as text, or null when there is nothing at all to save. pageTitle is optional (escaped). */
  function buildDownloadHtml(rawHtml, rawCss, rawJs, pageTitle) {
    const cleaned = cleanLearnerHtml(String(rawHtml).slice(0, MAX_CHARS));
    const cssText = String(rawCss || "");
    const jsText = prepareScriptText(rawJs || "");
    if (!cleaned.hasContent && cssText.trim() === "" && jsText.trim() === "") return null;

    const parts = [
      "<!doctype html>",
      "<html lang=\"en\">",
      "<head>",
      "<meta charset=\"utf-8\">",
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
      "<title>" + (pageTitle ? escapeHtml(pageTitle) : "My CurioTech Page") + "</title>",
      `<style>${PREVIEW_BASE_CSS}</style>`
    ];
    if (cleaned.headStyles) parts.push(cleaned.headStyles);
    if (cssText.trim() !== "") parts.push(`<style>\n${escapeStyleText(cssText)}\n</style>`);   // last, so it wins
    parts.push("</head>", `<body${cleaned.bodyAttrs}>${cleaned.bodyHtml}`);   // exactly the preview's <body>, byte for byte
    if (jsText.trim() !== "") parts.push(`<script>\n${jsText}\n</script>`);
    parts.push("</body>", "</html>", "");
    return parts.join("\n");
  }

  function setDownloadStatus(text) {
    if (downloadStatus) downloadStatus.textContent = text;
  }

  /** Hands a finished document to the browser as a file download (Blob + temporary link, no network). True if it worked. */
  function deliverHtmlFile(doc, filename) {
    let url = null;
    try {
      url = URL.createObjectURL(new Blob([doc], { type: "text/html;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      const done = url;
      setTimeout(() => URL.revokeObjectURL(done), 10000);
      return true;
    } catch (e) {
      if (url) { try { URL.revokeObjectURL(url); } catch (e2) { /* nothing to free */ } }
      return false;
    }
  }

  function downloadMyPage() {
    const doc = buildDownloadHtml(htmlEd.ta.value, cssEd.ta.value, jsEd.ta.value);   // latest text, saved or not
    if (doc === null) {
      setDownloadStatus("There's nothing to download yet. Write some HTML, CSS or JavaScript first!");
      return;
    }
    if (deliverHtmlFile(doc, DOWNLOAD_FILENAME)) {
      setDownloadStatus(`✅ Your page was sent to your downloads as ${DOWNLOAD_FILENAME}. Open that file to see it on its own!`);
    } else {
      setDownloadStatus("Sorry, this browser wouldn't let me make the download. Your code is still safe in the workshop.");
    }
  }

  if (downloadBtn) downloadBtn.addEventListener("click", downloadMyPage);

  // ------------------------------------------------------------------------
  // 9e. Saved projects: save, open, update, rename, download and delete (Phase 5, Stages 5.2 and 5.3)
  //     A saved project is an explicit, named snapshot kept by js/projects.js (window.CurioProjects).
  //     - It is SEPARATE from the per-tab drafts: nothing is saved as a project unless the learner presses
  //       a save button, and drafts keep working exactly as before.
  //     - Opening a project replaces the three editors, but only after asking when there is work that
  //       is not saved anywhere. Opening is not a learner edit: no goal check runs, and the goal
  //       baselines (HTML and CSS) are set to the opened project, as the blueprint hand-off does.
  //     - "Update Project" overwrites the open project after a confirmation. "Save Project" always makes
  //       a NEW project, and a name that is already used is refused, so duplicates are never made by accident.
  //     Only the HTML, CSS and JavaScript text is saved. Nothing here touches the preview, the sandbox,
  //     Run/Stop, the download, the Mission 01 hand-off or the guided levels.
  // ------------------------------------------------------------------------
  const CSS_BASELINE_KEY = "curiotech_playground_css_baseline";
  const OPEN_PROJECT_KEY = "curiotech_playground_open_project";

  // ---- CSS goal baseline (sessionStorage, always guarded) ----
  function setCssBaseline(decls) {
    cssBaselineDecls = decls;
    writeDraft(CSS_BASELINE_KEY, { v: 1, decls: Array.from(decls).slice(0, 2000) });
  }

  function resetCssBaseline() {
    cssBaselineDecls = STARTER_CSS_DECLS;
    removeKey(CSS_BASELINE_KEY);
  }

  function loadCssBaseline() {
    const d = readDraft(CSS_BASELINE_KEY);
    if (!d || d.v !== 1 || !Array.isArray(d.decls)) return;
    cssBaselineDecls = new Set(d.decls.filter(x => typeof x === "string").slice(0, 2000).map(x => x.slice(0, 500)));
  }

  // ---- chips: a project stores only CSS text, so work out which chips that text matches ----
  /** The chip choices whose generated block is EXACTLY the block in this CSS, or {} (chips off) if none match. */
  function deriveChipState(css) {
    const range = chipBlockRange(css);
    if (!range) return {};
    const block = css.slice(range.start, range.end);
    const slotIds = Object.keys(CHIP_SLOTS);
    const candidates = slotIds.map(slotId => {
      const slot = CHIP_SLOTS[slotId];
      if (block.indexOf(slot.selector + " {") === -1) return [];
      return slot.chips
        .filter(chip => Object.keys(chip.decls).every(p => block.indexOf("  " + p + ": " + chip.decls[p] + ";") !== -1))
        .map(chip => chip.id);
    });
    let found = null;
    let leaves = 0;
    (function walk(i, state) {
      if (found || leaves > 500) return;
      if (i === slotIds.length) {
        leaves++;
        if (buildChipBlock(state) === block) found = Object.assign({}, state);
        return;
      }
      walk(i + 1, state);   // this slot off (fewest chips first)
      candidates[i].forEach(id => {
        state[slotIds[i]] = id;
        walk(i + 1, state);
        delete state[slotIds[i]];
      });
    })(0, {});
    return found || {};
  }

  // ---- the controls ----
  const projPanel = document.getElementById("pg-projects");
  const projHint = document.getElementById("pg-projects-hint");
  const projCurrent = document.getElementById("pg-project-current");
  const projName = document.getElementById("pg-project-name");
  const projSave = document.getElementById("pg-project-save");
  const projUpdate = document.getElementById("pg-project-update");
  const projListTitle = document.getElementById("pg-project-list-title");
  const projList = document.getElementById("pg-project-list");
  const projCount = document.getElementById("pg-project-count");
  const projConfirm = document.getElementById("pg-project-confirm");
  const projConfirmText = document.getElementById("pg-project-confirm-text");
  const projConfirmYes = document.getElementById("pg-project-confirm-yes");
  const projConfirmNo = document.getElementById("pg-project-confirm-no");
  const projStatus = document.getElementById("pg-project-status");

  let projectsEnabled = false;
  let openProject = null;      // { id, name } of the project the editors came from (or were last saved to)
  let openStamp = "";          // that project's updatedAt when it was opened, to notice changes made in another tab
  let openSnap = null;         // its saved text { html, css, js }, used only for the quick "unsaved changes" label
  let pendingConfirm = null;   // { yes, back, cancelText } while a question is showing
  let listSignature = null;    // what the project list currently shows
  let renamingId = null;       // the project whose name is being edited in the list (only one at a time)

  const sameText = (a, b) => a.html === b.html && a.css === b.css && a.js === b.js;
  const editorsNow = () => ({ html: htmlEd.ta.value, css: cssEd.ta.value, js: jsEd.ta.value });

  function projSay(text, isError) {
    if (!projStatus) return;
    projStatus.textContent = text;
    projStatus.classList.toggle("is-error", !!isError);
  }

  function projRemember(p) {
    openProject = { id: p.id, name: p.name };
    openStamp = p.updatedAt;
    openSnap = { html: p.html, css: p.css, js: p.js };
    writeDraft(OPEN_PROJECT_KEY, { v: 1, id: p.id });
  }

  function projForget() {
    openProject = null;
    openStamp = "";
    openSnap = null;
    removeKey(OPEN_PROJECT_KEY);
  }

  /** True when the editors hold work that is not saved in any project (a fresh read, used before anything is replaced). */
  function hasUnsavedWork() {
    const now = editorsNow();
    if (openProject) {
      const saved = window.CurioProjects.get(openProject.id);
      if (saved) return !sameText(now, saved);
      projForget();   // it was deleted in another tab: treat the work as unsaved
    }
    if (now.html === STARTER_HTML && now.css === STARTER_CSS && now.js === STARTER_JS) return false;
    return !window.CurioProjects.list().some(p => sameText(now, p));
  }

  function nameTaken(name, exceptId) {
    const lower = name.toLowerCase();
    return window.CurioProjects.list().some(p => p.id !== exceptId && p.name.toLowerCase() === lower);
  }

  // ---- the project list (Stage 5.3) ----
  function makeEl(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function dateText(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; }
  }

  /** The button for one action of one project (found again after the list is redrawn). */
  function rowButton(id, action) {
    return projList.querySelector(`button[data-id="${id}"][data-action="${action}"]`);
  }

  function actionButton(p, action, label, outline) {
    const b = makeEl("button", "button button-small pg-project-btn" + (outline === false ? "" : " button-outline"), label);
    b.type = "button";
    b.setAttribute("data-action", action);
    b.setAttribute("data-id", p.id);
    return b;
  }

  /** Draws the rows with textContent only (a project name can never become markup). */
  function renderProjectList(list) {
    projList.textContent = "";
    if (list.length === 0) {
      projList.appendChild(makeEl("li", "pg-proj-empty", "No saved projects yet. Type a name above and press Save Project to keep your first one."));
      return;
    }
    list.forEach(p => {
      const isOpen = !!openProject && openProject.id === p.id;
      const row = makeEl("li", "pg-proj-row" + (isOpen ? " is-open" : ""));
      row.setAttribute("data-id", p.id);

      if (renamingId === p.id) {
        const box = makeEl("div", "pg-proj-rename");
        const input = makeEl("input", "pg-project-input pg-proj-rename-input");
        input.type = "text";
        input.id = "pg-rename-input";
        input.maxLength = window.CurioProjects.MAX_NAME_CHARS;
        input.value = p.name;
        input.autocomplete = "off";
        input.setAttribute("aria-label", `New name for ${p.name}`);
        input.setAttribute("data-id", p.id);
        box.appendChild(input);
        const save = actionButton(p, "rename-save", "✔ Save name", false);
        save.setAttribute("aria-label", `Save the new name for ${p.name}`);
        const cancel = actionButton(p, "rename-cancel", "Cancel");
        cancel.setAttribute("aria-label", `Cancel renaming ${p.name}`);
        row.appendChild(box);
        const acts = makeEl("div", "pg-proj-actions");
        acts.setAttribute("role", "group");
        acts.setAttribute("aria-label", `Rename ${p.name}`);
        acts.appendChild(save);
        acts.appendChild(cancel);
        row.appendChild(acts);
        projList.appendChild(row);
        return;
      }

      const info = makeEl("div", "pg-proj-info");
      const nameLine = makeEl("div", "pg-proj-nameline");
      nameLine.appendChild(makeEl("span", "pg-proj-name", p.name));
      if (isOpen) nameLine.appendChild(makeEl("span", "pg-proj-badge", "Open now"));
      info.appendChild(nameLine);
      const when = makeEl("div", "pg-proj-date");
      const t = makeEl("time", "", `Updated ${dateText(p.updatedAt)}`.trim());
      t.setAttribute("datetime", p.updatedAt);
      when.appendChild(t);
      info.appendChild(when);
      row.appendChild(info);

      const acts = makeEl("div", "pg-proj-actions");
      acts.setAttribute("role", "group");
      acts.setAttribute("aria-label", `Actions for ${p.name}`);
      const open = actionButton(p, "open", "📂 Open");
      open.setAttribute("aria-label", `Open project ${p.name}`);
      const rename = actionButton(p, "rename", "✏️ Rename");
      rename.setAttribute("aria-label", `Rename project ${p.name}`);
      const dl = actionButton(p, "download", "⬇ Download");
      dl.setAttribute("aria-label", `Download project ${p.name}`);
      const del = actionButton(p, "delete", "🗑️ Delete");
      del.setAttribute("aria-label", `Delete project ${p.name}`);
      [open, rename, dl, del].forEach(b => acts.appendChild(b));
      row.appendChild(acts);
      projList.appendChild(row);
    });
  }

  // ---- drawing ----
  function drawProjects() {
    if (!projectsEnabled) return;
    const api = window.CurioProjects;
    const list = api.list();

    // Redraw the rows only when something that shows in them changed (so typing in a rename box is never disturbed).
    const signature = list.map(p => p.id + "|" + p.name + "|" + p.updatedAt).join("~") +
      "#" + (openProject ? openProject.id : "") + "#" + (renamingId || "");
    if (signature !== listSignature) {
      listSignature = signature;
      renderProjectList(list);
    }
    projCount.textContent = `${list.length} of ${api.MAX_PROJECTS} projects saved.` +
      (list.length >= api.MAX_PROJECTS ? " That's the limit, so delete one to save another." : "");

    const dirty = openProject && openSnap && !sameText(editorsNow(), openSnap);
    if (openProject) {
      projCurrent.textContent = `Open project: “${openProject.name}”` + (dirty ? " — you have changes that aren't saved yet." : " — all changes saved.");
      projSave.textContent = "💾 Save as New Project";
      projUpdate.hidden = false;
      projUpdate.textContent = "↻ Update Project";
      if (projHint) projHint.textContent = `Open: ${openProject.name}` + (dirty ? " (unsaved changes)" : "");
    } else {
      projCurrent.textContent = "This work isn't saved as a project yet.";
      projSave.textContent = "💾 Save Project";
      projUpdate.hidden = true;
      if (projHint) projHint.textContent = "Save your work, then open it again any time";
    }
  }

  /** Shows the question box. backTo is a button (or a function that finds one) to focus when it is cancelled. */
  function askFirst(text, yesLabel, onYes, backTo, options) {
    const o = options || {};
    pendingConfirm = { yes: onYes, back: backTo, cancelText: o.cancelText || "" };
    projConfirmText.textContent = text;
    projConfirmYes.textContent = yesLabel;
    projConfirmNo.textContent = o.noLabel || "Keep my work";
    projConfirm.classList.toggle("is-danger", !!o.danger);
    projConfirm.hidden = false;
    projConfirmText.focus();
  }

  function closeQuestion(focusBack) {
    const back = pendingConfirm && pendingConfirm.back;
    pendingConfirm = null;
    projConfirm.hidden = true;
    projConfirm.classList.remove("is-danger");
    if (focusBack && back) {
      const target = typeof back === "function" ? back() : back;
      if (target) target.focus();
    }
  }

  function nameProblem(message) {
    projSay(message, true);
    projName.setAttribute("aria-invalid", "true");
    projName.focus();
  }

  // ---- open ----
  /** Puts a saved project into the three editors. This is NOT a learner edit: no goal check runs. */
  function loadProjectIntoEditors(p) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
    htmlEd.ta.value = p.html;
    cssEd.ta.value = p.css;
    jsEd.ta.value = p.js;
    [htmlEd, cssEd, jsEd].forEach(ed => {
      ed.edited = false;   // the first real edit still gets its friendly message
      ed.dirty = true;     // so the per-tab drafts follow the editors, exactly as always
      ed.updateCount();
      ed.ta.scrollTop = 0;
    });
    chipState = deriveChipState(p.css);
    syncChipUI();
    setHtmlBaseline(analyseHtml(p.html));       // BEFORE anything can check goals
    setCssBaseline(ownCssDeclarations(p.css));
    pendingRender = false;
    renderPreview();
    saveDirty();
  }

  function doOpen(p) {
    loadProjectIntoEditors(p);
    projRemember(p);
    projName.value = p.name;
    projName.removeAttribute("aria-invalid");
    drawProjects();
    projSay(`📂 Opened “${p.name}”. Your changes only go into the project when you press Update Project.`, false);
    setPixel("happy", `<strong>Project opened! 📂</strong><br>“${escapeHtml(p.name)}” is back in your editors. Change anything you like, then press <strong>Update Project</strong> to keep it.`);
    selectTab("html", false);
  }

  /** Opens the project with this id (the one place that does it: the list's Open button calls this). */
  function openProjectById(id) {
    if (!projectsEnabled) { projSay(window.CurioProjects ? window.CurioProjects.messages.storage : "Saving projects isn't available here.", true); return; }
    const p = window.CurioProjects.get(id);
    if (!p) { drawProjects(); projSay(window.CurioProjects.messages.notfound, true); return; }
    if (openProject && openProject.id === id && !hasUnsavedWork()) { projSay(`“${p.name}” is already open.`, false); return; }
    if (hasUnsavedWork()) {
      askFirst(
        `Opening “${p.name}” will replace what's in your three code boxes, and your current work isn't saved as a project. Replace it?`,
        "Replace my work",
        () => { closeQuestion(false); doOpen(window.CurioProjects.get(id) || p); htmlEd.ta.focus(); },
        () => rowButton(id, "open")
      );
      return;
    }
    doOpen(p);
    htmlEd.ta.focus();
  }

  // ---- rename (in the list) ----
  function startRename(id) {
    if (!window.CurioProjects.get(id)) { drawProjects(); projSay(window.CurioProjects.messages.notfound, true); return; }
    closeQuestion(false);
    renamingId = id;
    drawProjects();
    const input = document.getElementById("pg-rename-input");
    if (input) { input.focus(); input.select(); }
    projSay("Type the new name, then press Save name. Press Escape to cancel.", false);
  }

  function endRename(focusButton) {
    const id = renamingId;
    renamingId = null;
    drawProjects();
    if (focusButton && id) { const b = rowButton(id, "rename"); if (b) b.focus(); }
  }

  function commitRename(id) {
    const api = window.CurioProjects;
    const input = document.getElementById("pg-rename-input");
    if (!input) return;
    const name = api.cleanName(input.value);
    const saved = api.get(id);
    if (!saved) { renamingId = null; drawProjects(); projSay(api.messages.notfound, true); return; }
    const problem = (msg) => { input.setAttribute("aria-invalid", "true"); projSay(msg, true); input.focus(); };
    if (name === "") { problem(api.messages.name); return; }
    if (nameTaken(name, id)) { problem(`You already have a project called “${name}”. Choose a different name.`); return; }
    if (name === saved.name) { endRename(true); projSay("The name stayed the same, so nothing was changed.", false); return; }

    const r = api.rename(id, name);
    if (!r.ok) {
      if (r.reason === "notfound") { renamingId = null; drawProjects(); projSay(r.message, true); return; }
      problem(r.message);   // the box stays open and the project is untouched
      return;
    }
    if (openProject && openProject.id === id) {
      if (api.cleanName(projName.value).toLowerCase() === openProject.name.toLowerCase()) projName.value = r.project.name;
      openProject.name = r.project.name;
      openStamp = r.project.updatedAt;   // our own rename must not look like a change made in another tab
    }
    endRename(true);
    projSay(`✅ Renamed to “${r.project.name}”.`, false);
  }

  // ---- download one saved project ----
  /** A safe file name from a project name: letters, numbers and hyphens, ending in .html. */
  function projectFilename(name) {
    let s = String(name).normalize ? String(name).normalize("NFKD") : String(name);
    s = s.replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
    if (s === "" || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(s)) s = (s ? s + "-" : "") + "my-curiotech-page";
    return s + ".html";
  }

  function downloadProject(id) {
    const p = window.CurioProjects.get(id);
    if (!p) { drawProjects(); projSay(window.CurioProjects.messages.notfound, true); return; }
    // The SAVED text goes through the same cleaner and escaping as the normal download; it is never run here.
    const doc = buildDownloadHtml(p.html, p.css, p.js, p.name);
    if (doc === null) { projSay(`“${p.name}” is empty, so there is nothing to download.`, true); return; }
    const filename = projectFilename(p.name);
    if (deliverHtmlFile(doc, filename)) {
      projSay(`✅ “${p.name}” was sent to your downloads as ${filename}.`, false);
    } else {
      projSay("Sorry, this browser wouldn't let me make the download. Your project is still saved here.", true);
    }
  }

  // ---- delete (always asks first, and only ever by id) ----
  function askDelete(id) {
    const p = window.CurioProjects.get(id);
    if (!p) { drawProjects(); projSay(window.CurioProjects.messages.notfound, true); return; }
    askFirst(
      `Delete “${p.name}”? It will be removed from your saved projects and this can't be undone. Your three code boxes will not change.`,
      "Delete project",
      () => confirmDelete(id),
      () => rowButton(id, "delete"),
      { noLabel: "Cancel", cancelText: `Okay, “${p.name}” was not deleted.`, danger: true }
    );
  }

  function confirmDelete(id) {
    const api = window.CurioProjects;
    closeQuestion(false);
    const saved = api.get(id);
    if (!saved) { drawProjects(); projSay("That project was already gone, so nothing was deleted.", true); return; }
    const r = api.remove(id);   // by id: no other project can be removed
    if (!r.ok) { drawProjects(); projSay(r.message, true); return; }
    const wasOpen = !!openProject && openProject.id === id;
    if (wasOpen) projForget();   // only the link is cleared: the code boxes are left exactly as they are
    if (renamingId === id) renamingId = null;
    drawProjects();
    projSay(`🗑️ Deleted “${saved.name}”.` + (wasOpen ? " It was the open project, so your code boxes are no longer linked to a saved project. Your work in them was not changed." : ""), false);
    projListTitle.focus();
  }

  // ---- save as a new project ----
  function saveNew() {
    if (!projectsEnabled) { projSay(window.CurioProjects ? window.CurioProjects.messages.storage : "Saving projects isn't available here.", true); return; }
    closeQuestion(false);
    const api = window.CurioProjects;
    const name = api.cleanName(projName.value);
    if (name === "") { nameProblem(api.messages.name); return; }
    if (nameTaken(name, null)) {
      nameProblem(openProject && openProject.name.toLowerCase() === name.toLowerCase()
        ? `“${name}” is the project you have open. Press Update Project to save your changes, or type a new name to make a second project.`
        : `You already have a project called “${name}”. Choose a different name, or open it and press Update Project.`);
      return;
    }
    const now = editorsNow();
    const r = api.create({ name, html: now.html, css: now.css, js: now.js });
    if (!r.ok) {
      if (r.reason === "name") nameProblem(r.message); else projSay(r.message, true);
      return;
    }
    projRemember(r.project);
    projName.value = r.project.name;
    projName.removeAttribute("aria-invalid");
    drawProjects();
    projSay(`✅ Saved “${r.project.name}”. You can open it again from the list any time.`, false);
    setPixel("excited", `<strong>Project saved! 💾</strong><br>“${escapeHtml(r.project.name)}” is safe, even if you close the browser. You can keep building and press <strong>Update Project</strong> when you want to save changes.`);
  }

  // ---- update the open project ----
  function updateOpen() {
    if (!projectsEnabled) { projSay(window.CurioProjects ? window.CurioProjects.messages.storage : "Saving projects isn't available here.", true); return; }
    closeQuestion(false);
    const api = window.CurioProjects;
    if (!openProject) { projSay("Open a project first, or use Save Project to make a new one.", true); return; }
    const saved = api.get(openProject.id);
    if (!saved) {
      projForget();
      drawProjects();
      projSay("That project was deleted in another tab, so there is nothing to update. Your work is still here. Press Save Project to keep it as a new project.", true);
      return;
    }
    const name = api.cleanName(projName.value);
    if (name === "") { nameProblem(api.messages.name); return; }
    if (name !== saved.name && nameTaken(name, saved.id)) {
      nameProblem(`You already have a project called “${name}”. Choose a different name.`);
      return;
    }
    const now = editorsNow();
    if (sameText(now, saved) && name === saved.name) { projSay(`Nothing has changed since you saved “${saved.name}”.`, false); return; }

    const changedElsewhere = saved.updatedAt !== openStamp;
    askFirst(
      `Update “${saved.name}”? This replaces the saved version with what's in your code boxes now.` +
        (changedElsewhere ? " It was also saved somewhere else (another tab) since you opened it, and that version will be replaced too." : ""),
      "Update the project",
      () => {
        closeQuestion(false);
        const latest = editorsNow();   // what is in the boxes NOW, in case it changed while the question was showing
        const r = api.update(saved.id, { name, html: latest.html, css: latest.css, js: latest.js });
        if (!r.ok) {
          if (r.reason === "notfound") { projForget(); drawProjects(); }
          projSay(r.message, true);
          return;
        }
        projRemember(r.project);
        projName.value = r.project.name;
        drawProjects();
        projSay(`✅ Updated “${r.project.name}”.`, false);
        projUpdate.focus();
      },
      projUpdate
    );
  }

  function initProjects() {
    if (!projPanel || !projName || !projSave || !projUpdate || !projList || !projListTitle || !projConfirm || !projStatus) return;
    const api = window.CurioProjects;
    projectsEnabled = !!api && api.isAvailable();

    // Phones: start collapsed (the summary already shows the open project), like the mission card.
    const roomy = window.matchMedia ? window.matchMedia("(min-width: 601px)").matches : true;
    projPanel.open = roomy;

    if (!projectsEnabled) {
      projCurrent.textContent = "Saving projects isn't available in this browser right now.";
      projList.hidden = true;
      projListTitle.hidden = true;
      projCount.textContent = "";
      projSave.setAttribute("aria-disabled", "true");
      projSay("You can still download your page with the Download button, so your work is never lost.", false);
      projSave.addEventListener("click", saveNew);
      return;
    }

    // If a project was open before a refresh, find it again (its saved text, not the editors, is the reference).
    const d = readDraft(OPEN_PROJECT_KEY);
    if (d && typeof d.id === "string") {
      const p = api.get(d.id);
      if (p) { projRemember(p); projName.value = p.name; } else removeKey(OPEN_PROJECT_KEY);
    }
    drawProjects();

    projSave.addEventListener("click", saveNew);
    projUpdate.addEventListener("click", updateOpen);
    projConfirmYes.addEventListener("click", () => { const p = pendingConfirm; if (p) p.yes(); });
    projConfirmNo.addEventListener("click", () => {
      const msg = (pendingConfirm && pendingConfirm.cancelText) || "Okay, nothing was changed. Your work is exactly as you left it.";
      closeQuestion(true);
      projSay(msg, false);
    });

    // The list: one listener for every row. Each button carries the id of ITS project.
    projList.addEventListener("click", (e) => {
      const b = e.target.closest ? e.target.closest("button[data-action]") : null;
      if (!b || !projList.contains(b)) return;
      const id = b.getAttribute("data-id");
      switch (b.getAttribute("data-action")) {
        case "open": openProjectById(id); break;
        case "rename": startRename(id); break;
        case "rename-save": commitRename(id); break;
        case "rename-cancel": endRename(true); projSay("Okay, the name was not changed.", false); break;
        case "download": downloadProject(id); break;
        case "delete": askDelete(id); break;
        default: break;
      }
    });
    projList.addEventListener("keydown", (e) => {
      const input = e.target.closest ? e.target.closest("#pg-rename-input") : null;
      if (!input) return;
      if (e.key === "Enter") {
        e.preventDefault();
        commitRename(input.getAttribute("data-id"));
      } else if (e.key === "Escape") {
        e.preventDefault();
        endRename(true);
        projSay("Okay, the name was not changed.", false);
      }
    });
    projList.addEventListener("input", (e) => {
      if (e.target && e.target.id === "pg-rename-input") e.target.removeAttribute("aria-invalid");
    });
    projConfirm.addEventListener("keydown", (e) => { if (e.key === "Escape" && pendingConfirm) projConfirmNo.click(); });
    projName.addEventListener("input", () => { projName.removeAttribute("aria-invalid"); });
    projName.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (openProject) updateOpen(); else saveNew();
    });

    // keep the list and the "unsaved changes" label fresh
    let labelTimer = null;
    [htmlEd, cssEd, jsEd].forEach(ed => ed.ta.addEventListener("input", () => {
      clearTimeout(labelTimer);
      labelTimer = setTimeout(drawProjects, 300);
    }));
    projPanel.addEventListener("toggle", () => {
      if (!projPanel.open) return;
      if (openProject && !api.get(openProject.id)) projForget();
      drawProjects();
    });
    window.addEventListener("storage", (e) => {
      if (e.key !== api.KEY && e.key !== null) return;
      if (openProject && !api.get(openProject.id)) projForget();
      drawProjects();
    });
  }

  // ------------------------------------------------------------------------
  // 9f. Back to Mission 05 (Phase 5, Stage 5.4)
  //     js/mission-05.js keeps a small record of the attempt in localStorage. While an attempt is in
  //     progress (and not finished) this bar gives the learner a clear way back. It only READS that record and
  //     touches nothing else: no code, drafts, projects, goals or progress.
  // ------------------------------------------------------------------------
  function readMissionProgress() {
    try {
      const data = JSON.parse(localStorage.getItem("curiotech_mission_05_progress"));
      return data && typeof data === "object" ? data : null;
    } catch (e) {
      return null;
    }
  }

  function initMissionReturn() {
    const bar = document.getElementById("pg-m5-return");
    const stepEl = document.getElementById("pg-m5-return-step");
    if (!bar) return;
    // The mission engine keeps { v, step, maxStep, quests, data: { completed, returnLabel, ... } }
    const d = readMissionProgress();
    const info = d && d.data && typeof d.data === "object" ? d.data : null;
    if (!d || d.v !== 1 || !info || info.completed === true || !Number.isInteger(d.step)) return;
    if (stepEl) stepEl.textContent = typeof info.returnLabel === "string" ? info.returnLabel.slice(0, 60) : "";
    bar.hidden = false;
  }

  // ------------------------------------------------------------------------
  // 10. Start up: restore saved drafts (never overwrite them with starter code)
  // ------------------------------------------------------------------------
  buildChipUI();

  const savedHtml = readDraft(STORAGE_KEYS.html);
  const savedCss = readDraft(STORAGE_KEYS.css);
  const savedJs = readDraft(STORAGE_KEYS.js);
  const htmlRestored = savedHtml && typeof savedHtml.html === "string" ? savedHtml.html.slice(0, MAX_CHARS) : null;
  const cssRestored = savedCss && typeof savedCss.css === "string" ? savedCss.css.slice(0, MAX_CHARS) : null;
  const jsRestored = savedJs && typeof savedJs.js === "string" ? savedJs.js.slice(0, MAX_CHARS) : null;

  htmlEd.ta.value = htmlRestored !== null ? htmlRestored : STARTER_HTML;
  cssEd.ta.value = cssRestored !== null ? cssRestored : STARTER_CSS;
  jsEd.ta.value = jsRestored !== null ? jsRestored : STARTER_JS;

  if (cssRestored !== null && savedCss.chips && typeof savedCss.chips === "object") {
    Object.keys(savedCss.chips).forEach(slotId => {
      if (findChip(slotId, savedCss.chips[slotId])) chipState[slotId] = savedCss.chips[slotId];
    });
    if (!chipBlockRange(cssEd.ta.value)) chipState = {};
  }
  syncChipUI();

  const restoredSomething =
    (htmlRestored !== null && htmlRestored !== STARTER_HTML) ||
    (cssRestored !== null && cssRestored !== STARTER_CSS) ||
    (jsRestored !== null && jsRestored !== STARTER_JS);
  if (htmlRestored !== null && htmlRestored !== STARTER_HTML) htmlEd.edited = true;
  if (cssRestored !== null && cssRestored !== STARTER_CSS) cssEd.edited = true;
  if (jsRestored !== null && jsRestored !== STARTER_JS) jsEd.edited = true;

  if (restoredSomething) {
    setPixel("happy", "<strong>Welcome back! 👋</strong><br>I kept your code safe. Keep building!");
  } else {
    setPixel(PIXEL_HTML_INTRO.expr, PIXEL_HTML_INTRO.html);
  }

  htmlEd.updateCount();
  cssEd.updateCount();
  jsEd.updateCount();
  loadHtmlBaseline();   // remembered only after a Mission 01 blueprint import in this tab
  loadCssBaseline();    // remembered only after a saved project was opened in this tab
  initProgress();   // goals are NOT checked here: only real actions after load can earn them
  clearOutput();
  setRunUI();
  renderPreview(); // draw immediately (no JavaScript); nothing is saved until the learner edits
  initHandoff();   // Phase 4.5.6: only does anything for ?from=mission-01 (see section 9c)
  initProjects();  // Phase 5, Stage 5.2: save / open / update projects (see section 9e)

  // The dashboard's portfolio links here with ?project=<id>. It opens through the same path as the list's
  // Open button (so unsaved work is asked about first), then tidies the address so a refresh doesn't reopen it.
  (function openLinkedProject() {
    let id = null;
    try { id = new URLSearchParams(window.location.search).get("project"); } catch (e) { id = null; }
    if (!id) return;
    if (window.CurioProjects && window.CurioProjects.isAvailable()) openProjectById(String(id).slice(0, 64));
    try { window.history.replaceState(null, "", window.location.pathname); } catch (e) { /* the address stays: harmless */ }
  })();
  initMissionReturn();   // Phase 5, Stage 5.4: "Back to Mission 05" bar while that mission is in progress

  // ------------------------------------------------------------------------
  // 9g. Friendly HTML tip: points at the first tag that looks unclosed. It only READS the HTML and
  //     never blocks anything: the preview, saving and goals work exactly the same.
  // ------------------------------------------------------------------------
  const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const OPTIONAL_END = new Set(["html", "head", "body", "p", "li", "dt", "dd", "tr", "td", "th", "thead", "tbody", "tfoot", "option", "colgroup"]);

  /** Returns a short plain-text tip about the first HTML mistake found, or "" when all looks fine. */
  function htmlTip(source) {
    // Hide comments and the insides of <script> / <style> (same length, so line numbers stay right)
    const blank = s => s.replace(/[^\n]/g, " ");
    const html = String(source)
      .replace(/<!--[\s\S]*?-->/g, blank)
      .replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2\s*>)/gi, (all, open, name, body, close) => open + blank(body) + close);
    const lineAt = index => html.slice(0, index).split("\n").length;

    const stack = [];
    const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)[^>]*?(\/?)>/g;
    let m;
    let lastEnd = 0;
    while ((m = tagRe.exec(html)) !== null) {
      lastEnd = tagRe.lastIndex;
      const closing = m[1] === "/";
      const name = m[2].toLowerCase();
      if (VOID_TAGS.has(name) || m[3] === "/") continue;
      if (!closing) { if (!OPTIONAL_END.has(name)) stack.push({ name, line: lineAt(m.index) }); continue; }
      if (OPTIONAL_END.has(name)) continue;
      const at = stack.map(t => t.name).lastIndexOf(name);
      if (at === -1) return `Line ${lineAt(m.index)}: there is a </${name}> but no <${name}> before it. Remove it, or add the opening <${name}>.`;
      if (at !== stack.length - 1) {
        const open = stack[stack.length - 1];
        return `Line ${open.line}: <${open.name}> doesn't have a closing </${open.name}>. Add it before the </${name}> on line ${lineAt(m.index)}.`;
      }
      stack.pop();
    }
    if (stack.length > 0) {
      const open = stack[stack.length - 1];
      return `Line ${open.line}: <${open.name}> doesn't have a closing </${open.name}>. Add </${open.name}> where it should end.`;
    }
    const tail = html.slice(lastEnd);
    const broken = /<[a-zA-Z/][^<]*$/.exec(tail);
    if (broken) return `Line ${lineAt(lastEnd + broken.index)}: a tag starts with < but never ends with >.`;
    return "";
  }

  const htmlCheckEl = document.getElementById("pg-html-check");
  let htmlCheckTimer = null;
  function showHtmlTip() {
    if (!htmlCheckEl || !htmlEd) return;
    const tip = htmlTip(htmlEd.ta.value);
    htmlCheckEl.textContent = tip ? "💡 Tip: " + tip : "";
  }
  if (htmlCheckEl && htmlEd) {
    // Wait until the learner pauses typing, so a half-written tag doesn't flash a tip
    htmlEd.ta.addEventListener("input", () => {
      clearTimeout(htmlCheckTimer);
      htmlCheckTimer = setTimeout(showHtmlTip, 900);
    });
    showHtmlTip();
  }

  // JavaScript NEVER runs on page load. If the last run never finished (for example an endless loop
  // froze the tab), say so once and make sure nothing starts by itself.
  if (readDraft(STORAGE_KEYS.runMarker)) {
    clearMarker();
    setStatus("Heads up: the last time you pressed Run Code it didn't finish. Your code was not run again. Check your loops, then press Run Code when you're ready.");
    jsEd.showNote("Your last run didn't finish, so nothing ran automatically.", 8000);
  }

  // Save a final time if the page is hidden or closed mid-debounce.
  function flushIfPending() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      saveDirty();
    }
  }
  window.addEventListener("pagehide", flushIfPending);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushIfPending();
  });
})();
