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
    pixelText: "<strong>Quick Knowledge Check! 🎯</strong><br>Show me what you've learned. Read the question below and select the element that fits best. Don't worry—you can try as many times as you like!"
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
let currentStageIndex = 0;
let maxCompletedStage = 0; // Tracks highest stage unlocked
let inspectedElements = new Set();
let isChallengePassed = false;
let isBlueprintCreated = false;

// Blueprint studio active selections
let blueprintState = {
  title: "The Robot Sanctuary",
  tagline: "A safe haven where friendly companion robots learn digital skills.",
  graphic: "🤖 Robot Companion",
  button: "Enter the Sanctuary →"
};

// --------------------------------------------------------------------------
// 3. UI Controller Functions
// --------------------------------------------------------------------------
function initMission() {
  const stepperPills = document.querySelectorAll(".step-pill");
  const stagePanels = document.querySelectorAll(".stage-panel");
  const btnPrev = document.getElementById("btn-stage-prev");
  const btnNext = document.getElementById("btn-stage-next");
  const pixelSpeechEl = document.getElementById("mission-pixel-speech");
  const pixelAvatar = document.getElementById("mission-pixel-avatar");
  const pixelTag = document.getElementById("mission-pixel-tag");

  /**
   * Renders the current stage view, updates Pixel, and configures buttons
   */
  function renderStage() {
    const stage = MISSION_STAGES[currentStageIndex];
    if (!stage) return;

    // 1. Show active panel, hide others
    stagePanels.forEach((panel, idx) => {
      if (idx === currentStageIndex) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });

    // 2. Update Stepper Pills
    stepperPills.forEach((pill, idx) => {
      pill.classList.remove("active");
      if (idx === currentStageIndex) {
        pill.classList.add("active");
        pill.classList.remove("completed");
        pill.setAttribute("aria-current", "step");
      } else {
        pill.removeAttribute("aria-current");
        if (idx < maxCompletedStage) {
          pill.classList.add("completed");
        } else {
          pill.classList.remove("completed");
        }
      }
      if (idx <= maxCompletedStage) {
        pill.disabled = false;
      } else {
        pill.disabled = true;
      }
    });

    // 3. Update Pixel mascot dialogue and expression
    if (pixelSpeechEl) {
      pixelSpeechEl.innerHTML = stage.pixelText;
    }
    if (pixelAvatar) {
      pixelAvatar.setAttribute("data-expression", stage.pixelExpr);
      pixelAvatar.setAttribute("aria-label", `Pixel Mascot (${stage.pixelExpr})`);
    }
    if (pixelTag) {
      pixelTag.textContent = stage.pixelExpr.charAt(0).toUpperCase() + stage.pixelExpr.slice(1);
      pixelTag.className = `pixel-expression-pill expr-pill-${stage.pixelExpr}`;
    }

    // 4. Update Navigation Buttons
    if (btnPrev) {
      btnPrev.disabled = currentStageIndex === 0;
    }

    if (btnNext) {
      if (currentStageIndex === 5) {
        btnNext.textContent = "Finish Mission & Exit ➔";
        btnNext.onclick = () => { window.location.href = "adventure.html"; };
        btnNext.disabled = false;
      } else {
        btnNext.textContent = `Continue to ${MISSION_STAGES[currentStageIndex + 1].name} →`;
        btnNext.onclick = goNextStage;

        // Stage-specific gating rules
        if (currentStageIndex === 2) {
          btnNext.disabled = inspectedElements.size < 3;
        } else if (currentStageIndex === 3) {
          btnNext.disabled = !isChallengePassed;
        } else if (currentStageIndex === 4) {
          btnNext.disabled = !isBlueprintCreated;
        } else {
          btnNext.disabled = false;
        }
      }
    }

    // Save temporary session progress
    try {
      sessionStorage.setItem("curiotech_mission_01_stage", currentStageIndex.toString());
    } catch (e) {}

    // Scroll smoothly to top of card on stage change
    document.querySelector(".mission-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goNextStage() {
    if (currentStageIndex < MISSION_STAGES.length - 1) {
      currentStageIndex++;
      if (currentStageIndex > maxCompletedStage) {
        maxCompletedStage = currentStageIndex;
      }
      renderStage();
    }
  }

  function goPrevStage() {
    if (currentStageIndex > 0) {
      currentStageIndex--;
      renderStage();
    }
  }

  // Stepper pill clicks
  stepperPills.forEach((pill, idx) => {
    pill.addEventListener("click", () => {
      if (idx <= maxCompletedStage) {
        currentStageIndex = idx;
        renderStage();
      }
    });
  });

  if (btnPrev) btnPrev.addEventListener("click", goPrevStage);

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
    if (inspectedElements.size >= 3 && currentStageIndex === 2) {
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.classList.add("pulse-glow");
      }
      if (pixelSpeechEl) {
        pixelSpeechEl.innerHTML = `<strong>Great curiosity! 🌟</strong> You've inspected <strong>${inspectedElements.size}</strong> elements! You're ready to test your knowledge in the Challenge, or inspect the rest!`;
      }
    }
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
      if (currentStageIndex === 2 && btnNext) {
        btnNext.disabled = true;
        btnNext.classList.remove("pulse-glow");
      }
      if (pixelSpeechEl && MISSION_STAGES[2]) {
        pixelSpeechEl.innerHTML = MISSION_STAGES[2].pixelText;
      }
      if (pixelAvatar && MISSION_STAGES[2]) {
        pixelAvatar.setAttribute("data-expression", MISSION_STAGES[2].pixelExpr);
        pixelAvatar.setAttribute("aria-label", `Pixel Mascot (${MISSION_STAGES[2].pixelExpr})`);
      }
      if (pixelTag && MISSION_STAGES[2]) {
        pixelTag.textContent = MISSION_STAGES[2].pixelExpr.charAt(0).toUpperCase() + MISSION_STAGES[2].pixelExpr.slice(1);
        pixelTag.className = `pixel-expression-pill expr-pill-${MISSION_STAGES[2].pixelExpr}`;
      }
    });
  }

  // ------------------------------------------------------------------------
  // 5. Stage 4: Challenge Question Controller
  // ------------------------------------------------------------------------
  const challengeOptionBtns = document.querySelectorAll(".challenge-option-btn");
  const challengeFeedback = document.getElementById("challenge-feedback");

  challengeOptionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.getAttribute("data-correct") === "true";

      // Reset all buttons visual state and aria-checked
      challengeOptionBtns.forEach(b => {
        b.classList.remove("correct", "wrong");
        b.setAttribute("aria-checked", "false");
      });

      // Update selected button aria-checked
      btn.setAttribute("aria-checked", "true");

      // Only the currently selected answer determines whether the learner can proceed
      isChallengePassed = isCorrect;

      if (isCorrect) {
        btn.classList.add("correct");
        if (challengeFeedback) {
          challengeFeedback.className = "challenge-feedback-box correct show";
          challengeFeedback.innerHTML = "<strong>🎉 Exactly right!</strong> The <code>&lt;h1&gt;</code> element is specifically used for the most important heading on a page. It gives search engines, screen readers, and readers a clear title.";
        }
        if (pixelSpeechEl) {
          pixelSpeechEl.innerHTML = "<strong>Spot on! 🎯</strong> You nailed it! Headings establish visual hierarchy on the web. Let's head over to the Blueprint Studio to create your first webpage design!";
        }
        if (pixelAvatar) pixelAvatar.setAttribute("data-expression", "excited");
        if (pixelTag) {
          pixelTag.textContent = "Excited";
          pixelTag.className = "pixel-expression-pill expr-pill-excited";
        }
        if (btnNext) {
          btnNext.disabled = false;
        }
      } else {
        btn.classList.add("wrong");
        if (challengeFeedback) {
          challengeFeedback.className = "challenge-feedback-box wrong show";
          challengeFeedback.innerHTML = "<strong>Not quite, but good try! 🤔</strong> Remember: a paragraph <code>&lt;p&gt;</code> is for body text, an image <code>&lt;img&gt;</code> is for graphics, and <code>&lt;nav&gt;</code> is for menus. Which element represents a title or heading?";
        }
        if (pixelSpeechEl) {
          pixelSpeechEl.innerHTML = "<strong>No worries at all! 💡</strong> Mistakes are just friendly clues. Take another look at the options and try again!";
        }
        if (pixelAvatar) pixelAvatar.setAttribute("data-expression", "encouraging");
        if (pixelTag) {
          pixelTag.textContent = "Encouraging";
          pixelTag.className = "pixel-expression-pill expr-pill-encouraging";
        }
        if (btnNext) {
          btnNext.disabled = true;
          btnNext.classList.remove("pulse-glow");
        }
      }
    });
  });

  // ------------------------------------------------------------------------
  // 6. Stage 5: Create Blueprint Studio Controller
  // ------------------------------------------------------------------------
  const studioPills = document.querySelectorAll(".studio-pill");
  const previewTitle = document.getElementById("preview-heading");
  const previewTagline = document.getElementById("preview-tagline");
  const previewGraphic = document.getElementById("preview-graphic");
  const previewBtn = document.getElementById("preview-button");
  const btnSaveBlueprint = document.getElementById("btn-save-blueprint");

  function updateStudioPreview() {
    if (previewTitle) previewTitle.textContent = blueprintState.title;
    if (previewTagline) previewTagline.textContent = blueprintState.tagline;
    if (previewGraphic) previewGraphic.textContent = blueprintState.graphic;
    if (previewBtn) previewBtn.textContent = blueprintState.button;
  }

  studioPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const type = pill.getAttribute("data-type");
      const val = pill.getAttribute("data-value");

      // Deactivate siblings of same type
      document.querySelectorAll(`.studio-pill[data-type="${type}"]`).forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      if (type === "title") blueprintState.title = val;
      if (type === "tagline") blueprintState.tagline = val;
      if (type === "graphic") blueprintState.graphic = val;
      if (type === "button") blueprintState.button = val;

      updateStudioPreview();
    });
  });

  if (btnSaveBlueprint) {
    btnSaveBlueprint.addEventListener("click", () => {
      isBlueprintCreated = true;
      btnSaveBlueprint.textContent = "✓ Blueprint Saved!";
      btnSaveBlueprint.className = "button button-small button-outline";
      if (btnNext) {
        btnNext.disabled = false;
      }
      if (pixelSpeechEl) {
        pixelSpeechEl.innerHTML = "<strong>BEEP-BOOP! Fantastic design! 🎨</strong> Your webpage blueprint is planned and ready. Let's move to the celebration stage!";
      }
      if (pixelAvatar) pixelAvatar.setAttribute("data-expression", "excited");
      if (pixelTag) {
        pixelTag.textContent = "Excited";
        pixelTag.className = "pixel-expression-pill expr-pill-excited";
      }
    });
  }

  // Initial stage render
  renderStage();
}

// --------------------------------------------------------------------------
// 7. Safe Execution on Load
// --------------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMission);
} else {
  initMission();
}
