// ==========================================================================
// CurioTech: The Digital Adventure - Mission Learning Interface (Stage 4.3)
// Mission 01: Enter the Web (HTML Island)
// ==========================================================================

console.log("CurioTech Mission 01 Learning Engine initialized.");

// --------------------------------------------------------------------------
// 1. Mission Stage Configuration & Dialogue
// --------------------------------------------------------------------------
const MISSION_STAGES = [
  {
    id: "discover",
    num: "01",
    name: "Discover",
    pixelExpr: "thinking",
    pixelText: "<strong>BEEP-BOOP! Ever wonder how a website comes to life? 🤖</strong><br>When you visit your favorite game or video site, you see titles, pictures, and buttons. But what are they made of? Let's begin by discovering what's behind the screen!"
  },
  {
    id: "explore",
    num: "02",
    name: "Explore",
    pixelExpr: "thinking",
    pixelText: "<strong>A webpage is like a digital document! 📄</strong><br>Just like a book has chapters and photos, a webpage is built from 5 visible building blocks: Headings, Paragraphs, Images, Buttons, and Navigation. Let's inspect each one!"
  },
  {
    id: "experiment",
    num: "03",
    name: "Experiment",
    pixelExpr: "encouraging",
    pixelText: "<strong>Time for some hands-on scanning! 🔍</strong><br>Click on the different parts of the illustrated webpage below. Discover what each element does to unlock your challenge."
  },
  {
    id: "challenge",
    num: "04",
    name: "Challenge",
    pixelExpr: "encouraging",
    pixelText: "<strong>Three Quick Quests! 🎯</strong><br>Show me what you've learned: match an element, hunt down a bug, then build a page. Don't worry—you can try as many times as you like, and I'll give you hints if you get stuck!"
  },
  {
    id: "create",
    num: "05",
    name: "Create",
    pixelExpr: "excited",
    pixelText: "<strong>Welcome to the Webpage Blueprint Studio! 🎨</strong><br>Now you are the digital architect! Choose your title, story, graphic, and button to design your very own webpage blueprint."
  },
  {
    id: "celebrate",
    num: "06",
    name: "Celebrate",
    pixelExpr: "excited",
    pixelText: "<strong>BEEP-BEEP-HOORAY! You completed Mission 01! 🎉</strong><br>You now understand what a webpage is and the 5 foundational blocks that build the entire World Wide Web. High five!"
  }
];

// Experiment element data
const EXPERIMENT_ELEMENTS = {
  nav: {
    name: "Navigation Bar",
    tag: "<nav>",
    desc: "Provides a menu of links so visitors can travel between different pages on your website.",
    example: "Home, About, Missions, Contact"
  },
  heading: {
    name: "Main Heading",
    tag: "<h1>",
    desc: "The big, bold title that immediately tells readers what the page is about.",
    example: "Welcome to HTML Island!"
  },
  paragraph: {
    name: "Paragraph",
    tag: "<p>",
    desc: "A block of readable body text used for stories, explanations, and descriptions.",
    example: "The web is a global network of connected computers."
  },
  image: {
    name: "Image",
    tag: "<img>",
    desc: "Displays photos, illustrations, icons, or logos that make a webpage visual and engaging.",
    example: "robot-avatar.png (Pixel's portrait)"
  },
  button: {
    name: "Action Button",
    tag: "<button>",
    desc: "A clickable control that triggers actions like submitting forms, playing media, or opening doors.",
    example: "Start Exploration →"
  }
};

// --------------------------------------------------------------------------
// 2. Mission State Management
// --------------------------------------------------------------------------
// The shared mission engine (js/mission-kit.js) owns the current step, the stepper, Pixel's stage text, saving the
// in-progress state and the completion record. It is set when the engine starts, at the end of initMission().
let ctx = null;
const stage = () => (ctx ? ctx.step : 0);
let inspectedElements = new Set();
let isBlueprintCreated = false;

// In-progress activity state. Mirrored to localStorage so a refresh, a closed tab or a
// new visit resumes the mission where the learner left off. It is cleared when the learner
// leaves from the celebration stage. The completion record has its own key.
const ACTIVITIES_STORAGE_KEY = "curiotech_mission_01_progress";
const CHALLENGE_COUNT = 3;
const BUILDER_BLOCKS = {
  nav: { icon: "🧭", tag: "<nav>", label: "Navigation menu" },
  heading: { icon: "🏷️", tag: "<h1>", label: "Main heading" },
  image: { icon: "🖼️", tag: "<img>", label: "Picture" },
  paragraph: { icon: "📄", tag: "<p>", label: "Story paragraph" }
};
const BUILDER_START_ORDER = ["paragraph", "nav", "image", "heading"];
const BUILDER_SOLUTION_ORDER = ["nav", "heading", "image", "paragraph"];

const TINKER_NOTES = {
  h1: "<code>&lt;h1&gt;</code> makes a big, bold title. Browsers use it for the most important heading!",
  p: "<code>&lt;p&gt;</code> is for regular sentences, so it looks smaller and calmer than a heading.",
  imgOn: "<code>&lt;img&gt;</code> adds a picture. Fun fact: it doesn't need a closing tag!",
  imgOff: "Picture removed. The <code>&lt;img&gt;</code> line disappeared from the code too.",
  text: "Look at the code: your words sit between the opening and closing tags!"
};

let activityState = {
  tinker: { tag: "h1", text: "Hello, Web!", showImg: false, changes: 0 },
  // One entry per challenge: 0 = Element Matcher, 1 = Tag Detective, 2 = Build the Page
  challenges: Array.from({ length: CHALLENGE_COUNT }, () => ({ attempts: 0, misses: 0, solved: false, revealed: false })),
  builderOrder: BUILDER_START_ORDER.slice()
};

// Blueprint studio active selections
let blueprintState = {
  title: "The Robot Sanctuary",
  tagline: "A safe haven where friendly companion robots learn digital skills.",
  graphic: "🤖 Robot Workshop",
  button: "Enter Sanctuary →"
};

// --------------------------------------------------------------------------
// 3. UI Controller Functions
// --------------------------------------------------------------------------
function initMission() {
  const btnNext = document.getElementById("btn-stage-next");
  const pixelSpeechEl = document.getElementById("mission-pixel-speech");
  const pixelAvatar = document.getElementById("mission-pixel-avatar");
  const pixelTag = document.getElementById("mission-pixel-tag");

  /**
   * Updates Pixel's expression, label and (optionally) speech in one call
   */
  function setPixel(expr, html) {
    if (html && pixelSpeechEl) pixelSpeechEl.innerHTML = html;
    if (pixelAvatar) {
      pixelAvatar.setAttribute("data-expression", expr);
      pixelAvatar.setAttribute("aria-label", `Pixel Mascot (${expr})`);
    }
    if (pixelTag) {
      pixelTag.textContent = expr.charAt(0).toUpperCase() + expr.slice(1);
      pixelTag.className = `pixel-expression-pill expr-pill-${expr}`;
    }
  }

  // Stage 3 gate: the learner must inspect 3 different elements. The Continue button stays
  // clickable (aria-disabled instead of disabled) so a click can explain what is still needed.
  const INSPECT_REQUIRED = 3;
  const inspectHintBox = document.getElementById("inspect-hint");
  let inspectHintShown = false;
  let inspectHintFlip = false;

  function inspectionsRemaining() {
    return Math.max(0, INSPECT_REQUIRED - inspectedElements.size);
  }

  function refreshContinueLock() {
    if (!btnNext) return;
    if (stage() === 2 && inspectionsRemaining() > 0) btnNext.classList.remove("pulse-glow");
    if (ctx) ctx.refreshGate();   // the engine sets is-locked and aria-disabled from the stage's gate
  }

  /** Shows, updates or removes the helper message (fromClick: the learner pressed Continue) */
  function updateInspectHint(fromClick) {
    if (!inspectHintBox) return;
    if (fromClick) inspectHintShown = true;
    const left = inspectionsRemaining();
    if (stage() !== 2 || left === 0 || !inspectHintShown) {
      if (stage() !== 2 || left === 0) inspectHintShown = false;
      inspectHintBox.textContent = "";
      inspectHintBox.hidden = true;
      return;
    }
    let text;
    if (left === INSPECT_REQUIRED) {
      text = fromClick
        ? "Almost there! Inspect 3 different elements in the page above to unlock your Challenge."
        : "Inspect 3 different elements to unlock your Challenge.";
    } else if (left === 2) {
      text = "Good start! Inspect 2 more different elements.";
    } else {
      text = "Almost there! Inspect 1 more different element.";
    }
    // An alternating invisible space lets a repeated click be announced again
    inspectHintFlip = !inspectHintFlip;
    inspectHintBox.textContent = text + (inspectHintFlip ? " " : "");
    inspectHintBox.hidden = false;
  }

  function allChallengesSolved() {
    return activityState.challenges.every(c => c.solved);
  }

  /** The engine saves the in-progress state (see beforeSave in the mission description below). */
  function saveProgress() {
    if (ctx) ctx.save();
  }

  function clearProgress() {
    try {
      localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
    } catch (e) {}
  }

  /**
   * Accessibility: move focus to an element that is not normally focusable
   */
  function focusElement(el) {
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------------------
  // 4. Stage 3: Experiment Inspector Controller
  // ------------------------------------------------------------------------
  const inspectableBoxes = document.querySelectorAll(".inspectable-box");
  const inspectorTitle = document.getElementById("inspector-title");
  const inspectorTag = document.getElementById("inspector-tag");
  const inspectorDesc = document.getElementById("inspector-desc");
  const inspectorExample = document.getElementById("inspector-example");
  const inspectorCounter = document.getElementById("inspector-counter");
  const btnResetInspector = document.getElementById("btn-reset-inspector");

  function updateInspectorView(elemKey) {
    const data = EXPERIMENT_ELEMENTS[elemKey];
    if (!data) return;

    inspectedElements.add(elemKey);
    saveProgress();

    inspectableBoxes.forEach(box => {
      if (box.getAttribute("data-elem") === elemKey) {
        box.classList.add("active-selected", "inspected");
      } else {
        box.classList.remove("active-selected");
      }
    });

    if (inspectorTitle) inspectorTitle.textContent = data.name;
    if (inspectorTag) inspectorTag.textContent = data.tag;
    if (inspectorDesc) inspectorDesc.textContent = data.desc;
    if (inspectorExample) inspectorExample.textContent = data.example;
    if (inspectorCounter) {
      inspectorCounter.textContent = `Inspected: ${inspectedElements.size} of 5 Elements`;
    }

    // Enable next button once 3 elements are inspected
    if (inspectedElements.size >= 3 && stage() === 2) {
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.classList.add("pulse-glow");
      }
      if (pixelSpeechEl) {
        pixelSpeechEl.innerHTML = `<strong>Great curiosity! 🌟</strong> You've inspected <strong>${inspectedElements.size}</strong> elements! You're ready to test your knowledge in the Challenge, or inspect the rest!`;
      }
    }
    refreshContinueLock();
    updateInspectHint(false);
  }

  inspectableBoxes.forEach(box => {
    box.addEventListener("click", () => {
      const elemKey = box.getAttribute("data-elem");
      updateInspectorView(elemKey);
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const elemKey = box.getAttribute("data-elem");
        updateInspectorView(elemKey);
      }
    });
  });

  if (btnResetInspector) {
    btnResetInspector.addEventListener("click", () => {
      inspectedElements.clear();
      inspectableBoxes.forEach(box => box.classList.remove("active-selected", "inspected"));
      if (inspectorCounter) inspectorCounter.textContent = "Inspected: 0 of 5 Elements";
      if (inspectorTitle) inspectorTitle.textContent = "Click any block on the left";
      if (inspectorTag) inspectorTag.textContent = "---";
      if (inspectorDesc) inspectorDesc.textContent = "Select a block from the webpage preview to inspect its purpose and HTML tag.";
      if (inspectorExample) inspectorExample.textContent = "---";
      if (stage() === 2 && btnNext) {
        btnNext.classList.remove("pulse-glow");
        refreshContinueLock();
        updateInspectHint(false);
      }
      setPixel(MISSION_STAGES[2].pixelExpr, MISSION_STAGES[2].pixelText);
      saveProgress();
    });
  }

  // ------------------------------------------------------------------------
  // 5. Stage 4: Challenge Question Controller
  // ------------------------------------------------------------------------
  const challengeOptionBtns = document.querySelectorAll(".challenge-option-btn");
  const challengeFeedback = document.getElementById("challenge-feedback");

  // Phase 4.4: three quests share a tracker, per-quest feedback, hints and a gentle reveal.
  const challengeSteps = document.querySelectorAll(".challenge-step");
  const challengeChips = document.querySelectorAll(".challenge-chip");
  const detectiveLines = document.querySelectorAll(".detective-line");
  const detectiveLine2 = document.getElementById("detective-line-2");
  const detectiveFeedback = document.getElementById("detective-feedback");
  const builderList = document.getElementById("builder-list");
  const builderFeedback = document.getElementById("builder-feedback");
  const questAnnouncer = document.getElementById("quest-announcer");
  const btnBuilderCheck = document.getElementById("btn-builder-check");
  const feedbackEls = [challengeFeedback, detectiveFeedback, builderFeedback];
  const revealByStep = [];
  const nextQuestBtns = [];
  document.querySelectorAll(".challenge-reveal-btn").forEach(b => { revealByStep[Number(b.dataset.step)] = b; });
  document.querySelectorAll(".challenge-step-next").forEach(b => { nextQuestBtns[Number(b.dataset.step)] = b; });
  let activeChallengeStep = 0;

  const SOLVED_COPY = [
    {
      fb: "The <code>&lt;h1&gt;</code> element is specifically used for the most important heading on a page. It gives search engines, screen readers, and readers a clear title.",
      pixel: "<strong>Spot on! 🎯</strong> Headings give a page its big title. Ready for the next quest? Tap <em>Next quest</em>!"
    },
    {
      fb: "The paragraph opened with <code>&lt;p&gt;</code> but never closed with <code>&lt;/p&gt;</code>. Most tags work in pairs: an opening tag and a closing tag. Line 2 is fixed now!",
      pixel: "<strong>Bug squashed! 🐛</strong> Great detective work. One quest left: tap <em>Next quest</em>!"
    },
    {
      fb: "A menu on top, the big title next, then the picture and story. That's how many real webpages are laid out!",
      pixel: "<strong>BEEP-BEEP! All three quests complete! 🎉</strong> You're ready to design your own page. Tap Continue to Create!"
    }
  ];
  const NEXT_QUEST_PIXEL = [
    null,
    "<strong>Quest 2: Tag Detective! 🕵️</strong> One line of this code has a sneaky mistake. Tap the line you think is wrong!",
    "<strong>Quest 3: Build the Page! 🧱</strong> Use the up and down buttons to put the blocks in order. Think about a real website!"
  ];
  const DETECTIVE_WRONG = {
    "1": "<strong>Good guess, but not this one! 🤔</strong> This heading opens with <code>&lt;h1&gt;</code> and closes with <code>&lt;/h1&gt;</code>. It's complete! Check the other lines.",
    "3": "<strong>Nice try! 🤔</strong> <code>&lt;img&gt;</code> is a special tag that doesn't need a closing tag, so this line is fine. Check the other lines.",
    "4": "<strong>Close, but not quite! 🤔</strong> This button opens with <code>&lt;button&gt;</code> and closes with <code>&lt;/button&gt;</code>. They match, so it's fine!"
  };

  /**
   * Single screen-reader announcer for all quest feedback. The region is emptied first and
   * refilled a moment later (with an alternating invisible space), so repeating the same
   * wrong answer is announced again.
   */
  let announceTimer = null;
  let announceFlip = false;
  function announce(text) {
    if (!questAnnouncer) return;
    questAnnouncer.textContent = "";
    announceFlip = !announceFlip;
    const msg = text.replace(/\s+/g, " ").trim() + (announceFlip ? " " : "");
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { questAnnouncer.textContent = msg; }, 60);
  }

  function showFeedback(i, kind, html, quiet) {
    const el = feedbackEls[i];
    if (!el) return;
    el.className = `challenge-feedback-box ${kind} show`;
    el.innerHTML = html;
    if (!quiet) {
      const reveal = revealByStep[i];
      const extra = kind === "wrong" && reveal && !reveal.hidden ? " A Show me the answer button is now available." : "";
      announce(el.textContent + extra);
    }
  }

  function clearFeedback(i) {
    const el = feedbackEls[i];
    if (!el) return;
    el.className = "challenge-feedback-box";
    el.innerHTML = "";
  }

  function recordMiss(i) {
    const st = activityState.challenges[i];
    st.attempts++;
    st.misses++;
    if (revealByStep[i]) revealByStep[i].hidden = st.misses < 3;
    saveProgress();
    return st.misses;
  }

  function missPixel(misses) {
    if (misses >= 3) {
      setPixel("encouraging", "<strong>Feeling stuck? That's totally okay! 🤝</strong> Tap <em>Show me the answer</em> if you'd like me to help. There's no shame in it!");
    } else if (misses === 2) {
      setPixel("encouraging", "<strong>Here's a hint! 💡</strong> Read the hint in the box below. You're closer than you think!");
    } else {
      setPixel("encouraging", "<strong>No worries at all! 💡</strong> Mistakes are just friendly clues. Take another look and try again!");
    }
  }

  function updateChallengeChips() {
    challengeChips.forEach((chip, i) => {
      const st = activityState.challenges[i];
      const unlocked = i === 0 || activityState.challenges[i - 1].solved || st.solved;
      chip.disabled = !unlocked;
      chip.classList.toggle("active", i === activeChallengeStep);
      chip.classList.toggle("solved", st.solved);
      if (i === activeChallengeStep) {
        chip.setAttribute("aria-current", "step");
      } else {
        chip.removeAttribute("aria-current");
      }
      const mark = chip.querySelector(".challenge-chip-mark");
      if (mark) mark.textContent = st.solved ? "✓" : String(i + 1);
    });
  }

  /** Moves focus to the question of the quest the learner just opened */
  function focusQuestStart(i) {
    focusElement(challengeSteps[i] && challengeSteps[i].querySelector(".challenge-question"));
  }

  function showChallengeStep(i) {
    activeChallengeStep = i;
    challengeSteps.forEach((step, idx) => { step.hidden = idx !== i; });
    updateChallengeChips();
  }

  /** Paints the "solved" look of a quest (used live and when restoring progress) */
  function paintChallenge(i, quiet) {
    const st = activityState.challenges[i];
    if (st.solved) {
      const lead = st.revealed ? "<strong>💡 Here's the answer!</strong> " : "<strong>🎉 Exactly right!</strong> ";
      showFeedback(i, "correct", lead + SOLVED_COPY[i].fb, quiet);
      if (i === 0) {
        challengeOptionBtns.forEach(b => {
          const ok = b.getAttribute("data-correct") === "true";
          b.classList.remove("wrong");
          b.classList.toggle("correct", ok);
          b.setAttribute("aria-checked", ok ? "true" : "false");
          b.setAttribute("aria-disabled", "true");
        });
      } else if (i === 1) {
        detectiveLines.forEach(l => {
          l.classList.remove("wrong");
          l.classList.toggle("correct", l.getAttribute("data-correct") === "true");
          l.setAttribute("aria-disabled", "true");
        });
        if (detectiveLine2) detectiveLine2.textContent = "<p>Robots are fun to build.</p>";
      } else if (i === 2) {
        renderBuilder();
      }
    }
    if (nextQuestBtns[i]) nextQuestBtns[i].hidden = !(st.solved && i < CHALLENGE_COUNT - 1);
    if (revealByStep[i]) revealByStep[i].hidden = st.solved || st.misses < 3;
  }

  function solveChallenge(i, revealed) {
    const st = activityState.challenges[i];
    if (st.solved) return;
    // If the button the learner is on is about to disappear or be disabled, keep their place
    const hadFocus = document.activeElement;
    const focusWouldBeLost = hadFocus === revealByStep[i] || hadFocus === btnBuilderCheck;
    if (!revealed) st.attempts++;
    st.solved = true;
    st.revealed = !!revealed;
    paintChallenge(i);
    updateChallengeChips();

    if (revealed) {
      setPixel("encouraging", "<strong>Now you know the secret! 🌟</strong> Asking for help is a super-skill, and you'll remember this next time.");
    } else {
      setPixel("excited", SOLVED_COPY[i].pixel);
    }

    if (allChallengesSolved() && stage() === 3 && btnNext) {
      btnNext.disabled = false;
      btnNext.classList.add("pulse-glow");
      if (revealed) {
        setPixel("excited", SOLVED_COPY[2].pixel);
      }
    }
    if (focusWouldBeLost) {
      const nextQuest = nextQuestBtns[i];
      if (nextQuest && !nextQuest.hidden) {
        nextQuest.focus();
      } else if (allChallengesSolved() && btnNext && !btnNext.disabled) {
        btnNext.focus();
      }
    }
    saveProgress();
  }

  // ---- Quest 1: Element Matcher (existing question, now with attempts and hints) ----
  challengeOptionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const st = activityState.challenges[0];
      if (st.solved) return;

      challengeOptionBtns.forEach(b => {
        b.classList.remove("correct", "wrong");
        b.setAttribute("aria-checked", "false");
      });
      btn.setAttribute("aria-checked", "true");

      if (btn.getAttribute("data-correct") === "true") {
        solveChallenge(0, false);
      } else {
        btn.classList.add("wrong");
        const misses = recordMiss(0);
        let html = "<strong>Not quite, but good try! 🤔</strong> Remember: a paragraph <code>&lt;p&gt;</code> is for body text, an image <code>&lt;img&gt;</code> is for graphics, and <code>&lt;nav&gt;</code> is for menus. Which element represents a title or heading?";
        if (misses >= 2) {
          html += "<br><br>💡 <strong>Hint:</strong> The tag we want starts with the letter <code>h</code>, for <em>heading</em>.";
        }
        showFeedback(0, "wrong", html);
        missPixel(misses);
      }
    });
  });

  // ---- Quest 2: Tag Detective ----
  detectiveLines.forEach(line => {
    line.addEventListener("click", () => {
      const st = activityState.challenges[1];
      if (st.solved) return;
      detectiveLines.forEach(l => l.classList.remove("wrong"));

      if (line.getAttribute("data-correct") === "true") {
        solveChallenge(1, false);
      } else {
        line.classList.add("wrong");
        const misses = recordMiss(1);
        let html = DETECTIVE_WRONG[line.getAttribute("data-line")] || "<strong>Not this one! 🤔</strong> Try another line.";
        if (misses >= 2) {
          html += "<br><br>💡 <strong>Hint:</strong> Look for a tag that was <em>opened</em> but never <em>closed</em>.";
        }
        showFeedback(1, "wrong", html);
        missPixel(misses);
      }
    });
  });

  // ---- Quest 3: Build the Page (tap-to-place with up/down buttons) ----
  function renderBuilder(focusKey, focusDir) {
    if (!builderList) return;
    const st = activityState.challenges[2];
    const order = activityState.builderOrder;
    builderList.replaceChildren();

    order.forEach((key, idx) => {
      const block = BUILDER_BLOCKS[key];
      const li = document.createElement("li");
      li.className = "builder-item" + (st.solved ? " placed" : "");
      li.setAttribute("data-block", key);

      const pos = document.createElement("span");
      pos.className = "builder-pos";
      pos.textContent = String(idx + 1);

      const icon = document.createElement("span");
      icon.className = "builder-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = block.icon;

      const info = document.createElement("div");
      info.className = "builder-info";
      const label = document.createElement("strong");
      label.textContent = block.label;
      const tag = document.createElement("code");
      tag.textContent = block.tag;
      info.append(label, tag);

      const controls = document.createElement("div");
      controls.className = "builder-controls";
      [["up", "▲", "up"], ["down", "▼", "down"]].forEach(([dir, glyph, word]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `builder-move builder-${dir}`;
        b.textContent = glyph;
        b.setAttribute("aria-label", `Move ${block.label} ${word}`);
        b.disabled = st.solved || (dir === "up" ? idx === 0 : idx === order.length - 1);
        b.addEventListener("click", () => moveBlock(key, dir));
        controls.appendChild(b);
      });

      li.append(pos, icon, info, controls);
      builderList.appendChild(li);
    });

    if (btnBuilderCheck) {
      btnBuilderCheck.disabled = st.solved;
      btnBuilderCheck.textContent = st.solved ? "✓ Page built!" : "Check my page ✔";
    }

    if (focusKey) {
      const item = builderList.querySelector(`[data-block="${focusKey}"]`);
      if (item) {
        const preferred = item.querySelector(`.builder-${focusDir}`);
        const other = item.querySelector(focusDir === "up" ? ".builder-down" : ".builder-up");
        const target = preferred && !preferred.disabled ? preferred : other;
        if (target && !target.disabled) target.focus();
      }
    }
  }

  function moveBlock(key, dir) {
    const order = activityState.builderOrder;
    const idx = order.indexOf(key);
    const swapWith = dir === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapWith < 0 || swapWith >= order.length) return;
    [order[idx], order[swapWith]] = [order[swapWith], order[idx]];
    clearFeedback(2);
    renderBuilder(key, dir);
    announce(`${BUILDER_BLOCKS[key].label} moved to position ${swapWith + 1} of ${order.length}`);
    saveProgress();
  }

  if (btnBuilderCheck) {
    btnBuilderCheck.addEventListener("click", () => {
      const st = activityState.challenges[2];
      if (st.solved) return;
      const order = activityState.builderOrder;

      if (order[0] === "nav" && order[1] === "heading") {
        solveChallenge(2, false);
      } else {
        const misses = recordMiss(2);
        let html;
        if (order[0] !== "nav") {
          html = "<strong>Almost there! 🤔</strong> Visitors expect the <code>&lt;nav&gt;</code> menu at the very <em>top</em> of a page, so they can travel anywhere quickly.";
        } else {
          html = "<strong>Good start, the menu is on top! 🧭</strong> Now, what should come right after it? The big title, the <code>&lt;h1&gt;</code> heading, tells visitors what the page is about.";
        }
        if (misses >= 2) {
          html += "<br><br>💡 <strong>Hint:</strong> Picture a real website. What do you see first at the very top, and what comes right below it? The picture and story can go in either order.";
        }
        showFeedback(2, "wrong", html);
        missPixel(misses);
      }
    });
  }

  revealByStep.forEach((btn, i) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (i === 2) activityState.builderOrder = BUILDER_SOLUTION_ORDER.slice();
      solveChallenge(i, true);
    });
  });

  nextQuestBtns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const next = Number(btn.getAttribute("data-step")) + 1;
      showChallengeStep(next);
      focusQuestStart(next);
      setPixel("encouraging", NEXT_QUEST_PIXEL[next]);
      document.querySelector(".challenge-tracker")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  challengeChips.forEach((chip, i) => {
    chip.addEventListener("click", () => {
      if (chip.disabled || i === activeChallengeStep) return;
      showChallengeStep(i);
      focusQuestStart(i);
    });
  });

  // ------------------------------------------------------------------------
  // 5b. Stage 3: Tag Tinkerer (optional hands-on HTML editing)
  // ------------------------------------------------------------------------
  const tinkerText = document.getElementById("tinker-text");
  const tinkerTagBtns = document.querySelectorAll("[data-tinker-tag]");
  const tinkerImgBtn = document.getElementById("tinker-img-btn");
  const tinkerCode = document.getElementById("tinker-code");
  const tinkerPreview = document.getElementById("tinker-preview");
  const tinkerNote = document.getElementById("tinker-note");

  function renderTinker() {
    const t = activityState.tinker;
    const shown = t.text.trim() || "…";

    if (tinkerCode) {
      const lines = [`<${t.tag}>${shown}</${t.tag}>`];
      if (t.showImg) lines.push('<img src="robot.png" alt="A friendly robot">');
      tinkerCode.textContent = lines.join("\n");
    }

    if (tinkerPreview) {
      tinkerPreview.replaceChildren();
      const el = document.createElement(t.tag);
      el.textContent = shown;
      tinkerPreview.appendChild(el);
      if (t.showImg) {
        const img = document.createElement("div");
        img.className = "tinker-preview-img";
        img.setAttribute("role", "img");
        img.setAttribute("aria-label", "A friendly robot picture");
        img.textContent = "🤖";
        tinkerPreview.appendChild(img);
      }
    }

    tinkerTagBtns.forEach(b => {
      const on = b.getAttribute("data-tinker-tag") === t.tag;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (tinkerImgBtn) {
      tinkerImgBtn.classList.toggle("active", t.showImg);
      tinkerImgBtn.setAttribute("aria-pressed", t.showImg ? "true" : "false");
      tinkerImgBtn.textContent = t.showImg ? "Remove <img>" : "Add <img>";
    }
    if (tinkerText && tinkerText.value !== t.text) tinkerText.value = t.text;
  }

  function tinkerChanged(noteHtml) {
    const t = activityState.tinker;
    t.changes++;
    if (tinkerNote && noteHtml) tinkerNote.innerHTML = noteHtml;
    if (t.changes === 1) {
      setPixel("excited", "<strong>You just edited real HTML! 🛠️</strong> That's exactly what web developers do. Keep tinkering, or move on when you're ready.");
    }
    renderTinker();
    saveProgress();
  }

  tinkerTagBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.getAttribute("data-tinker-tag");
      activityState.tinker.tag = tag === "p" ? "p" : "h1";
      tinkerChanged(TINKER_NOTES[activityState.tinker.tag]);
    });
  });

  if (tinkerImgBtn) {
    tinkerImgBtn.addEventListener("click", () => {
      activityState.tinker.showImg = !activityState.tinker.showImg;
      tinkerChanged(activityState.tinker.showImg ? TINKER_NOTES.imgOn : TINKER_NOTES.imgOff);
    });
  }

  if (tinkerText) {
    // Live update while typing; counts as one "tinker" when the learner finishes editing
    tinkerText.addEventListener("input", () => {
      activityState.tinker.text = tinkerText.value.slice(0, 30);
      renderTinker();
      saveProgress();
    });
    tinkerText.addEventListener("change", () => tinkerChanged(TINKER_NOTES.text));
  }

  // ------------------------------------------------------------------------
  // 6. Stage 5: Create Blueprint Studio Controller
  // ------------------------------------------------------------------------
  const studioPills = document.querySelectorAll(".studio-pill");
  const previewTitle = document.getElementById("preview-heading");
  const previewTagline = document.getElementById("preview-tagline");
  const previewGraphic = document.getElementById("preview-graphic");
  const previewBtn = document.getElementById("preview-button");
  const btnSaveBlueprint = document.getElementById("btn-save-blueprint");
  const studioTitleInput = document.getElementById("studio-title-input");
  const studioTitleClear = document.getElementById("studio-title-clear");
  const blueprintCode = document.getElementById("blueprint-code");
  let presetTitle = blueprintState.title; // last ready-made title the learner picked

  function updateBlueprintCode() {
    if (!blueprintCode) return;
    // Drop the leading emoji from the graphic to make a sensible alt text
    const alt = blueprintState.graphic.replace(/^\S+\s*/, "") || "Hero image";
    blueprintCode.textContent = [
      "<nav>Home • Missions • Portfolio</nav>",
      `<h1>${blueprintState.title}</h1>`,
      `<img src="hero.png" alt="${alt}">`,
      `<p>${blueprintState.tagline}</p>`,
      `<button>${blueprintState.button}</button>`
    ].join("\n");
  }

  function updateStudioPreview() {
    if (previewTitle) previewTitle.textContent = blueprintState.title;
    if (previewTagline) previewTagline.textContent = blueprintState.tagline;
    if (previewGraphic) previewGraphic.textContent = blueprintState.graphic;
    if (previewBtn) previewBtn.textContent = blueprintState.button;
    updateBlueprintCode();
  }

  function syncStudioPills() {
    studioPills.forEach(p => {
      const type = p.getAttribute("data-type");
      p.classList.toggle("active", blueprintState[type] === p.getAttribute("data-value"));
    });
  }

  studioPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const type = pill.getAttribute("data-type");
      const val = pill.getAttribute("data-value");

      // Deactivate siblings of same type
      document.querySelectorAll(`.studio-pill[data-type="${type}"]`).forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      if (type === "title") {
        blueprintState.title = val;
        presetTitle = val;
        if (studioTitleInput) studioTitleInput.value = "";
        if (studioTitleClear) studioTitleClear.hidden = true;
      }
      if (type === "tagline") blueprintState.tagline = val;
      if (type === "graphic") blueprintState.graphic = val;
      if (type === "button") blueprintState.button = val;

      updateStudioPreview();
      saveProgress();
    });
  });

  // Phase 4.4: type your own page title (plain text only)
  function applyCustomTitle() {
    if (!studioTitleInput) return;
    const typed = studioTitleInput.value.replace(/\s+/g, " ").trim();
    if (typed) {
      blueprintState.title = typed;
      document.querySelectorAll('.studio-pill[data-type="title"]').forEach(p => p.classList.remove("active"));
      if (studioTitleClear) studioTitleClear.hidden = false;
    } else {
      blueprintState.title = presetTitle;
      syncStudioPills();
      if (studioTitleClear) studioTitleClear.hidden = true;
    }
    updateStudioPreview();
    saveProgress();
  }

  if (studioTitleInput) studioTitleInput.addEventListener("input", applyCustomTitle);
  if (studioTitleClear) {
    studioTitleClear.addEventListener("click", () => {
      studioTitleInput.value = "";
      applyCustomTitle();
      studioTitleInput.focus();
    });
  }

  function paintSavedBlueprintButton() {
    if (!btnSaveBlueprint) return;
    btnSaveBlueprint.textContent = "✓ Blueprint Saved!";
    btnSaveBlueprint.className = "button button-small button-outline";
  }

  if (btnSaveBlueprint) {
    btnSaveBlueprint.addEventListener("click", () => {
      isBlueprintCreated = true;
      paintSavedBlueprintButton();
      if (btnNext) {
        btnNext.disabled = false;
      }
      setPixel("excited", "<strong>BEEP-BOOP! Fantastic design! 🎨</strong> Your webpage blueprint is planned and ready. Let's move to the celebration stage!");
      saveProgress();
    });
  }

  // ------------------------------------------------------------------------
  // 7. Stage 6: personalised recap (text only, no scores)
  // ------------------------------------------------------------------------
  const CHALLENGE_NAMES = ["Element Matcher", "Tag Detective", "Build the Page"];

  function renderRecap() {
    const list = document.getElementById("celebrate-recap-list");
    if (!list) return;
    const lines = [];
    lines.push(`🔍 You inspected ${inspectedElements.size} of 5 page elements.`);

    const changes = activityState.tinker.changes;
    lines.push(changes > 0
      ? `🔧 You tinkered with real HTML ${changes} time${changes === 1 ? "" : "s"} in the Tag Tinkerer.`
      : "🔧 The Tag Tinkerer is always there if you want to experiment some more!");

    activityState.challenges.forEach((c, i) => {
      const name = CHALLENGE_NAMES[i];
      if (!c.solved) {
        lines.push(`🧩 ${name}: still waiting for you. Pop back any time!`);
      } else if (c.revealed) {
        lines.push(`🧩 ${name}: Pixel helped you out, and now you know the answer too!`);
      } else if (c.attempts <= 1) {
        lines.push(`🧩 ${name}: solved on your first try. Wow!`);
      } else {
        lines.push(`🧩 ${name}: solved after ${c.attempts} tries. Persistence is a coding superpower!`);
      }
    });

    if (isBlueprintCreated) {
      lines.push(`🎨 You designed a page called "${blueprintState.title}".`);
    }

    list.replaceChildren();
    lines.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
  }

  // Leaving through the celebrate link also starts the next visit fresh
  document.querySelector(".celebrate-layout a.button")?.addEventListener("click", clearProgress);

  // Phase 4.5.6: hand the saved blueprint to the Creator's Playground.
  // The record has its own key, so clearProgress() (which only removes this mission's two keys) never touches it.
  // js/playground.js reads exactly { v, title, tagline, graphic, button } and only when the URL says ?from=mission-01.
  const BLUEPRINT_HANDOFF_KEY = "curiotech_blueprint_handoff";
  const btnOpenPlayground = document.getElementById("btn-open-playground");
  if (btnOpenPlayground) {
    btnOpenPlayground.addEventListener("click", () => {
      if (!isBlueprintCreated) {
        setPixel("encouraging", "<strong>Almost there! 🎨</strong> Save your blueprint in the Create stage first, then I can send it to the Playground.");
        return;
      }
      let saved = true;
      try {
        sessionStorage.setItem(BLUEPRINT_HANDOFF_KEY, JSON.stringify({
          v: 1,
          title: blueprintState.title,
          tagline: blueprintState.tagline,
          graphic: blueprintState.graphic,
          button: blueprintState.button
        }));
      } catch (e) {
        saved = false;   // storage unavailable: still open the Playground, just without the blueprint
      }
      window.location.href = saved ? "playground.html?from=mission-01" : "playground.html";
    });
  }

  // ------------------------------------------------------------------------
  // 8. Restore temporary progress (if any) and paint every activity
  // ------------------------------------------------------------------------
  /** Puts the engine's saved activity data (checked field by field here) back into the activities. */
  function applySavedProgress(saved) {
    if (!saved || typeof saved !== "object") return;

    const int = (v, lo, hi, d) => (Number.isInteger(v) ? Math.min(hi, Math.max(lo, v)) : d);

    if (Array.isArray(saved.inspected)) {
      saved.inspected.forEach(k => { if (EXPERIMENT_ELEMENTS[k]) inspectedElements.add(k); });
    }

    const a = saved.activity;
    if (a && typeof a === "object") {
      const t = a.tinker;
      if (t && typeof t === "object") {
        activityState.tinker = {
          tag: t.tag === "p" ? "p" : "h1",
          text: typeof t.text === "string" ? t.text.slice(0, 30) : "Hello, Web!",
          showImg: t.showImg === true,
          changes: int(t.changes, 0, 9999, 0)
        };
      }
      if (Array.isArray(a.challenges)) {
        a.challenges.slice(0, CHALLENGE_COUNT).forEach((c, i) => {
          if (!c || typeof c !== "object") return;
          activityState.challenges[i] = {
            attempts: int(c.attempts, 0, 9999, 0),
            misses: int(c.misses, 0, 9999, 0),
            solved: c.solved === true,
            revealed: c.revealed === true
          };
        });
      }
      if (Array.isArray(a.builderOrder) && a.builderOrder.length === BUILDER_START_ORDER.length &&
          BUILDER_START_ORDER.every(k => a.builderOrder.includes(k))) {
        activityState.builderOrder = a.builderOrder.slice();
      }
    }

    const b = saved.blueprint;
    if (b && typeof b === "object") {
      ["tagline", "graphic", "button"].forEach(type => {
        const known = Array.from(studioPills).some(p => p.getAttribute("data-type") === type && p.getAttribute("data-value") === b[type]);
        if (known) blueprintState[type] = b[type];
      });
      if (typeof b.title === "string" && b.title.trim()) blueprintState.title = b.title.slice(0, 30);
    }
    isBlueprintCreated = saved.blueprintSaved === true;
  }

  function paintAllActivities() {
    // Stage 3: inspector
    inspectableBoxes.forEach(box => {
      box.classList.toggle("inspected", inspectedElements.has(box.getAttribute("data-elem")));
    });
    if (inspectorCounter) inspectorCounter.textContent = `Inspected: ${inspectedElements.size} of 5 Elements`;

    // Stage 3: tinkerer
    renderTinker();

    // Stage 4: quests (open the first unfinished one)
    activityState.challenges.forEach((c, i) => paintChallenge(i, true));
    const firstOpen = activityState.challenges.findIndex(c => !c.solved);
    showChallengeStep(firstOpen === -1 ? CHALLENGE_COUNT - 1 : firstOpen);
    renderBuilder();

    // Stage 5: studio
    const titleIsPreset = Array.from(studioPills).some(p => p.getAttribute("data-type") === "title" && p.getAttribute("data-value") === blueprintState.title);
    if (titleIsPreset) {
      presetTitle = blueprintState.title;
    } else if (studioTitleInput) {
      studioTitleInput.value = blueprintState.title;
      if (studioTitleClear) studioTitleClear.hidden = false;
    }
    syncStudioPills();
    updateStudioPreview();
    if (isBlueprintCreated) paintSavedBlueprintButton();
  }

  // ------------------------------------------------------------------------
  // 9. Hand over to the shared mission engine (js/mission-kit.js)
  //    It runs the stepper, Continue / Back, Pixel's text for each stage, saving the in-progress state and the
  //    completion record. Mission 01's own activities above stay exactly as they were.
  //
  //    Completion (localStorage "curiotech_mission_01_completed" -> { v: 1, done: true, completedAt }) is saved
  //    ONLY on the celebration stage AND when the mission's own requirements are met: 3 different elements
  //    inspected (Stage 3), all 3 quests solved (Stage 4) and the blueprint saved (Stage 5). Opening the
  //    mission, or a stage, never counts. An existing record is never overwritten.
  //    js/adventure.js reads { v: 1, done: true } to show the finished state.
  // ------------------------------------------------------------------------
  const LAST_STAGE = MISSION_STAGES.length - 1;

  CurioMission.start({
    prefix: "m1",
    name: "Mission 01",
    stateKey: ACTIVITIES_STORAGE_KEY,
    doneKey: "curiotech_mission_01_completed",
    panelSelector: ".stage-panel",
    dom: {
      next: "btn-stage-next", prev: "btn-stage-prev", hint: "inspect-hint", note: "mission-saved-note",
      pixelSpeech: "mission-pixel-speech", pixelAvatar: "mission-pixel-avatar", pixelTag: "mission-pixel-tag"
    },
    liveHint: false,      // the inspector writes its own helper message (updateInspectHint)
    plainNote: true,      // the celebration note keeps its page styling
    steps: MISSION_STAGES.map((st, i) => ({ next: i < LAST_STAGE ? `Continue to ${MISSION_STAGES[i + 1].name} →` : "" })),
    pixel: MISSION_STAGES.map(st => ({ expr: st.pixelExpr, html: st.pixelText })),
    quests: [],           // Mission 01 has its own three-quest activity in Stage 4
    freshData: () => ({}),
    cleanData: d => (d && typeof d === "object" ? d : {}),

    // Stage 3 needs 3 different inspected elements. (Stages 4 and 5 keep the button natively disabled until done.)
    gate(step) {
      return step === 2 && inspectionsRemaining() > 0 ? "Inspect 3 different elements to unlock your Challenge." : "";
    },
    beforeNext(step) {
      if (step === 2 && inspectionsRemaining() > 0) { updateInspectHint(true); return false; }
      return true;
    },
    met() {
      return inspectedElements.size >= INSPECT_REQUIRED && allChallengesSolved() && isBlueprintCreated;
    },
    messages: {
      saved: "✅ Saved! Your Adventure Map now shows Mission 01 as complete.",
      already: "✅ Saved! Your Adventure Map now shows Mission 01 as complete.",
      failed: "You finished Mission 01! This browser wouldn't let me save it, so the Adventure Map may not show it as complete."
    },

    // The activities are the live model; copy them into the engine's data each time it saves
    beforeSave(c) {
      c.data.inspected = Array.from(inspectedElements);
      c.data.activity = activityState;
      c.data.blueprint = blueprintState;
      c.data.blueprintSaved = isBlueprintCreated;
    },
    // Stage 4 has its own single announcer for quest feedback; avoid two competing live regions
    pixelLive: step => (step === 3 ? "off" : "polite"),

    afterRender(step) {
      if (btnNext) {
        // Stages 4 and 5 use the native disabled state; Stage 3 is guarded by the gate above instead
        if (step === 3) btnNext.disabled = !allChallengesSolved();
        else if (step === 4) btnNext.disabled = !isBlueprintCreated;
        else btnNext.disabled = false;
      }
      refreshContinueLock();
      updateInspectHint(false);
    },
    render(step) {
      if (step === LAST_STAGE) renderRecap();   // a personalised recap of what the learner did (text only)
    },

    // On the last stage the Continue button leads on to Mission 02 once Mission 01 is on record
    finalNext(c) {
      return c.done()
        ? { label: "Next: Mission 02, Build the Structure ➔", href: "mission-02.html" }
        : { label: "Finish Mission & Exit ➔", href: "adventure.html" };
    },

    init(c) {
      ctx = c;
      applySavedProgress(c.data);
      paintAllActivities();
    }
  });
}

// --------------------------------------------------------------------------
// 7. Safe Execution on Load
// --------------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMission);
} else {
  initMission();
}
