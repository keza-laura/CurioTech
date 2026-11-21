// ==========================================================================
// CurioTech: The Digital Adventure - Pixel Companion Mascot (Stage 4.2)
// ==========================================================================
// Pixel is CurioTech's 2D illustrated robot companion.
// Pixel provides welcoming, encouraging, and instructional guidance
// across the adventure map.

console.log("CurioTech Pixel Companion Engine initialized.");

// --------------------------------------------------------------------------
// 1. Predefined Dialogue Catalogue
// --------------------------------------------------------------------------
const PIXEL_MESSAGES = [
  {
    id: "welcome",
    category: "👋 WELCOME TO THE ADVENTURE",
    expression: "happy",
    expressionLabel: "Happy",
    topicTitle: "👋 Welcome",
    text: "<strong>BEEP-BOOP! Welcome to CurioTech: The Digital Adventure! 🤖</strong><br><br>I'm <strong>Pixel</strong>, your personal coding companion. Whether this is your very first time writing a line of code or you've dreamed of building cool websites before, I'm right here beside you to guide, encourage, and celebrate your discoveries every step of the way!"
  },
  {
    id: "destinations",
    category: "🗺️ DESTINATIONS TOUR",
    expression: "thinking",
    expressionLabel: "Thinking",
    topicTitle: "🗺️ Destinations",
    text: "<strong>Let me give you a quick tour of our digital world! 🧭</strong><br><br>Our adventure connects <strong>4 sequential biomes</strong>:<br>• <strong>HTML Island:</strong> Construct the foundational skeleton and bones of web pages.<br>• <strong>CSS City:</strong> Paint your pages with vibrant colors, fonts, and responsive layouts.<br>• <strong>JavaScript Jungle:</strong> Add brains, logic, and click reactions to your creations.<br>• <strong>Creator's Lab:</strong> The ultimate studio to build your own custom project! (HTML Island is open now. The Creator's Lab opens after Mission 01, and the Creator's Playground is open for free play any time.)"
  },
  {
    id: "mission-guide",
    category: "💡 WHAT TO EXPECT FROM A MISSION",
    expression: "thinking",
    expressionLabel: "Thinking",
    topicTitle: "💡 Missions Guide",
    text: "<strong>Every mission is an active, hands-on quest! 🎯</strong><br><br>You won't just sit and read long walls of text. We learn by doing: <em>Discover → Explore → Experiment → Challenge → Create → Celebrate</em>! You'll solve interactive puzzles, experiment with live code, and complete short knowledge checks. There are no timers, so learn comfortably at your own pace."
  },
  {
    id: "encouragement",
    category: "✨ PIXEL'S CODING WISDOM",
    expression: "encouraging",
    expressionLabel: "Encouraging",
    topicTitle: "✨ Encouragement",
    text: "<strong>Remember: Mistakes are how real engineers learn! 💡</strong><br><br>If something doesn't work on the first try, never feel discouraged. Even senior software engineers run into bugs every single day! You cannot break anything here. Treat every mistake like a friendly clue on a treasure hunt, and don't hesitate to experiment boldly."
  },
  {
    id: "navigation-hint",
    category: "🔑 HELPFUL NAVIGATION HINT",
    expression: "encouraging",
    expressionLabel: "Encouraging",
    topicTitle: "🔑 Navigation Hint",
    text: "<strong>Curious about what lies ahead on the map? 🏝️</strong><br><br>Try <strong>clicking on any destination card</strong> on the interactive map below (or highlight it using your Tab key and press Enter). A mission briefing drawer will slide open showing all quests and learning objectives. Destination 01 (HTML Island) is unlocked and waiting for you!"
  },
  {
    id: "celebration",
    category: "🚀 READY FOR LIFTOFF!",
    expression: "excited",
    expressionLabel: "Excited",
    topicTitle: "🚀 Let's Build!",
    text: "<strong>BEEP-BEEP! You're officially all set! 🎉</strong><br><br>Stepping into technology is an exciting superpower, and you've already taken the first step today. Whenever you're ready, click on <strong>HTML Island</strong> to start your first mission. Want to experiment first? The <strong>Creator's Playground</strong> is open any time from the menu. If you ever need me, just tap the <em>Talk to Pixel</em> button. Let's make something amazing together!"
  }
];

// --------------------------------------------------------------------------
// 2. Pixel Companion State & Controller
// --------------------------------------------------------------------------
let currentMessageIndex = 0;
let isDialogueDismissed = false;

function initPixelCompanion() {
  const dialogueStation = document.getElementById("pixel-dialogue-station");
  const reopenBanner = document.getElementById("pixel-reopen-banner");
  const reopenBtn = document.getElementById("pixel-reopen-btn");
  const dismissBtn = document.getElementById("pixel-dismiss-btn");
  const prevBtn = document.getElementById("pixel-prev-btn");
  const nextBtn = document.getElementById("pixel-next-btn");
  const messageTextEl = document.getElementById("pixel-message-text");
  const topicBadgeEl = document.getElementById("pixel-topic-badge");
  const counterEl = document.getElementById("pixel-counter");
  const avatarWrapper = document.getElementById("pixel-avatar-wrapper");
  const exprTagEl = document.getElementById("pixel-expression-tag");
  const topicChips = document.querySelectorAll(".pixel-topic-chip");

  if (!dialogueStation || !messageTextEl) return;

  /**
   * Updates the UI to display the message at `currentMessageIndex`
   */
  function renderCurrentMessage() {
    const msg = PIXEL_MESSAGES[currentMessageIndex];
    if (!msg) return;

    // 1. Text & Header
    topicBadgeEl.textContent = msg.category;
    messageTextEl.innerHTML = msg.text;
    counterEl.textContent = `Message ${currentMessageIndex + 1} of ${PIXEL_MESSAGES.length}`;

    // 2. Expression & Avatar State
    if (avatarWrapper) {
      avatarWrapper.setAttribute("data-expression", msg.expression);
      avatarWrapper.setAttribute("aria-label", `Pixel Robot Companion (Expression: ${msg.expressionLabel})`);
    }
    if (exprTagEl) {
      exprTagEl.textContent = msg.expressionLabel;
      exprTagEl.className = `pixel-expression-pill expr-pill-${msg.expression}`;
    }

    // 3. Navigation Buttons State
    if (prevBtn) {
      prevBtn.disabled = currentMessageIndex === 0;
    }
    if (nextBtn) {
      if (currentMessageIndex === PIXEL_MESSAGES.length - 1) {
        nextBtn.textContent = "Start Again ↺";
      } else {
        nextBtn.textContent = "Next Tip →";
      }
    }

    // 4. Update Topic Chips Active State
    topicChips.forEach((chip, idx) => {
      if (idx === currentMessageIndex) {
        chip.classList.add("active");
        chip.setAttribute("aria-current", "true");
      } else {
        chip.classList.remove("active");
        chip.removeAttribute("aria-current");
      }
    });
  }

  /**
   * Advances to next message (or wraps to start if at end)
   */
  function nextMessage() {
    if (currentMessageIndex < PIXEL_MESSAGES.length - 1) {
      currentMessageIndex++;
    } else {
      currentMessageIndex = 0; // wrap around
    }
    renderCurrentMessage();
  }

  /**
   * Goes back to previous message
   */
  function prevMessage() {
    if (currentMessageIndex > 0) {
      currentMessageIndex--;
      renderCurrentMessage();
    }
  }

  /**
   * Dismisses / minimizes the dialogue
   */
  function dismissDialogue() {
    isDialogueDismissed = true;
    dialogueStation.classList.add("dismissed");
    dialogueStation.setAttribute("aria-hidden", "true");
    if (reopenBanner) {
      reopenBanner.style.display = "flex";
      reopenBtn?.focus();
    }
  }

  /**
   * Reopens the dialogue
   */
  function reopenDialogue() {
    isDialogueDismissed = false;
    dialogueStation.classList.remove("dismissed");
    dialogueStation.setAttribute("aria-hidden", "false");
    if (reopenBanner) {
      reopenBanner.style.display = "none";
    }
    nextBtn?.focus();
  }

  // ------------------------------------------------------------------------
  // Event Listeners
  // ------------------------------------------------------------------------
  if (nextBtn) nextBtn.addEventListener("click", nextMessage);
  if (prevBtn) prevBtn.addEventListener("click", prevMessage);
  if (dismissBtn) dismissBtn.addEventListener("click", dismissDialogue);
  if (reopenBtn) reopenBtn.addEventListener("click", reopenDialogue);

  // Topic chips click & keyboard
  topicChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const idx = parseInt(chip.getAttribute("data-topic-index"), 10);
      if (!isNaN(idx) && idx >= 0 && idx < PIXEL_MESSAGES.length) {
        currentMessageIndex = idx;
        renderCurrentMessage();
      }
    });
  });

  // Global Keyboard shortcuts when dialogue is active
  document.addEventListener("keydown", (e) => {
    // If modal is open, ignore
    const modal = document.getElementById("destination-modal");
    if (modal && modal.classList.contains("active")) return;

    if (!isDialogueDismissed) {
      if (e.key === "Escape") {
        dismissDialogue();
      } else if (e.key === "ArrowRight" && document.activeElement && dialogueStation.contains(document.activeElement)) {
        e.preventDefault();
        nextMessage();
      } else if (e.key === "ArrowLeft" && document.activeElement && dialogueStation.contains(document.activeElement)) {
        e.preventDefault();
        prevMessage();
      }
    }
  });

  // Initial render
  renderCurrentMessage();
}

// --------------------------------------------------------------------------
// 3. Safe Execution on DOM Ready
// --------------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPixelCompanion);
} else {
  initPixelCompanion();
}
