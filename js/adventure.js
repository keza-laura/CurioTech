// ==========================================================================
// CurioTech: The Digital Adventure - Adventure Map Engine (Stage 4.1)
// ==========================================================================

console.log("CurioTech Digital Adventure Engine initialized.");

// --------------------------------------------------------------------------
// 1. Adventure Destinations Data
// --------------------------------------------------------------------------
const ADVENTURE_DESTINATIONS = [
  {
    id: "html-island",
    order: "01",
    name: "HTML Island",
    icon: "🏝️",
    badge: "Active Quest",
    isUnlocked: true,
    themeClass: "dest-html",
    brief: "A sunlit island where the web was born! Discover how the Internet works and build the structural skeleton of web pages.",
    description: "Welcome to HTML Island! Surrounded by cyan digital waters, this tropical tech sanctuary holds the ancient building blocks of the web. Here, you will learn how browsers request pages and how HTML elements, tags, headings, and paragraphs construct everything we see online.",
    missions: [
      "Mission 01: Enter the Web (Browsers & Web Architecture)",
      "Mission 02: Build the Structure (HTML Tags, Elements & Boilerplate) — coming soon"
    ],
    stageNote: "⭐ This destination is open! Start Mission 01 below. Mission 02 is coming soon."
  },
  {
    id: "css-city",
    order: "02",
    name: "CSS City",
    icon: "🏙️",
    badge: "🔒 Locked",
    isUnlocked: false,
    themeClass: "dest-css",
    brief: "A neon metropolis of visual styling! Master colors, fonts, margins, padding, and responsive layouts.",
    description: "Towering neon skyscrapers glow with purple and lavender energy! In CSS City, architects transform plain HTML bones into breathtaking, styled interfaces using modern CSS rules, colors, spacing, and responsive design.",
    missions: [
      "Mission 03: Make It Beautiful (CSS Selectors, Colors, Padding & Layouts) — coming soon"
    ],
    stageNote: "🔒 Locked for now. CSS City opens after HTML Island, and it's coming soon!"
  },
  {
    id: "js-jungle",
    order: "03",
    name: "JavaScript Jungle",
    icon: "🌴",
    badge: "🔒 Locked",
    isUnlocked: false,
    themeClass: "dest-js",
    brief: "An electrifying biome humming with dynamic energy! Bring pages to life with logic, variables, and events.",
    description: "Electric vines and glowing lightning bugs power this biome! In the JavaScript Jungle, you will discover variables, functions, and event listeners that give web pages a living brain to react to clicks, keystrokes, and touch.",
    missions: [
      "Mission 04: Bring It to Life (JavaScript Variables, Functions & Click Events) — coming soon"
    ],
    stageNote: "🔒 Locked for now. JavaScript Jungle opens after CSS City, and it's coming soon!"
  },
  {
    id: "creator-lab",
    order: "04",
    name: "Creator's Lab",
    icon: "🧪",
    badge: "🔒 Locked",
    isUnlocked: false,
    themeClass: "dest-creator",
    brief: "The ultimate creative workshop! Combine your skills to build your own digital project.",
    description: "Your free workshop! In the Creator's Lab you use the Creator's Playground to write, test and save your own web projects, with no mission needed.",
    missions: [
      "Creator's Playground: experiment freely with HTML, CSS and JavaScript",
      "My Projects: save up to 10 projects and open them again"
    ],
    // Locked until Mission 01 is completed (see initAdventureMap). Mission 05 is separate: it is a guided
    // project on the Mission Log and is open to everyone.
    stageNote: "🔒 Locked until you finish Mission 01. The Creator's Playground is open for free play right now, and Mission 05 (a guided project) is open on the Mission Log.",
    unlockedBadge: "✦ Unlocked",
    unlockedNote: "✦ Unlocked! Experiment freely in the Creator's Playground. Want a guided project? Try Mission 05: The Creator Mission, on the Mission Log.",
    actionHref: "playground.html",
    actionLabel: "Open the Creator's Playground →",
    playgroundLink: true,   // Phase 4.5.6: while locked, a secondary "Try the Playground now" link is offered
    missionLink: true       // Phase 5.5: a secondary "Start Mission 05" link
  }
];

// --------------------------------------------------------------------------
// 1b. Mission 01 completion (written by js/mission.js when the learner reaches the celebration
//     stage with every requirement met; this page only READS it and never changes it)
//       localStorage "curiotech_mission_01_completed"  ->  { v: 1, done: true, completedAt: ISO text }
// --------------------------------------------------------------------------
const MISSION_01_DONE_KEY = "curiotech_mission_01_completed";
// Mission 05 (written by js/mission-05.js) is read the same way:
//       localStorage "curiotech_mission_05_completed"  ->  { v: 1, done: true, completedAt, projectId, projectName }
const MISSION_05_DONE_KEY = "curiotech_mission_05_completed";

/** True only for a valid completion record: { v: 1, done: true }. Reads only, never writes. */
function isRecordComplete(key) {
  try {
    const d = JSON.parse(localStorage.getItem(key));
    return !!d && d.v === 1 && d.done === true;
  } catch (e) {
    return false;   // missing, corrupt or unavailable storage: not complete
  }
}

function isMission01Complete() { return isRecordComplete(MISSION_01_DONE_KEY); }
function isMission05Complete() { return isRecordComplete(MISSION_05_DONE_KEY); }

// --------------------------------------------------------------------------
// 2. Adventure Map Initialization & Modal Controller
// --------------------------------------------------------------------------
function initAdventureMap() {
  const mission01Done = isMission01Complete();
  const mission05Done = isMission05Complete();

  // Creator's Lab opens once Mission 01 is completed (a valid record). Nothing is written here.
  const lab = ADVENTURE_DESTINATIONS.find(d => d.id === "creator-lab");
  if (lab && mission01Done) {
    lab.isUnlocked = true;
    lab.badge = lab.unlockedBadge;
    lab.stageNote = lab.unlockedNote;
  }

  const modalOverlay = document.getElementById("destination-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  let modalOpener = null;   // the card that opened the dialog, so focus can return to it
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalBadge = document.getElementById("modal-badge");
  const modalDesc = document.getElementById("modal-desc");
  const modalMissions = document.getElementById("modal-missions");
  const modalNote = document.getElementById("modal-stage-note");
  const modalActionBtn = document.getElementById("modal-action-btn");
  const modalPlaygroundLink = document.getElementById("modal-playground-link");
  const modalMissionLink = document.getElementById("modal-mission-link");

  /**
   * Opens the destination details modal
   * @param {Object} dest - Destination object
   */
  function openDestinationModal(dest) {
    if (!modalOverlay) return;

    modalIcon.textContent = dest.icon;
    modalTitle.textContent = dest.name;
    modalBadge.textContent = dest.badge;
    modalBadge.className = `dest-status-pill ${dest.isUnlocked ? 'dest-status-active' : 'dest-status-locked'}`;
    modalDesc.textContent = dest.description;

    // Render missions list (a finished Mission 01 gets a check mark)
    const doneHere = dest.id === "html-island" && mission01Done;
    modalMissions.innerHTML = dest.missions
      .map((m, i) => `<li><span>${doneHere && i === 0 ? "✔" : "✦"}</span> <strong>${m}</strong></li>`).join("");
    modalNote.textContent = doneHere
      ? "✔ You finished Mission 01! Next, build your own page in the Creator's Playground. Mission 02 is coming soon."
      : dest.stageNote;

    // Set action button state
    if (dest.isUnlocked) {
      modalActionBtn.textContent = dest.actionLabel || (doneHere ? "Replay Mission 01: Enter the Web →" : "Start Mission 01: Enter the Web →");
      modalActionBtn.className = "button";
      modalActionBtn.disabled = false;
      const href = dest.actionHref || "mission.html";
      modalActionBtn.onclick = function () {
        window.location.href = href;
      };
    } else {
      modalActionBtn.textContent = "🔒 Destination Locked";
      modalActionBtn.className = "button button-disabled";
      modalActionBtn.disabled = true;
      modalActionBtn.onclick = null;
    }

    // While the Creator's Lab is locked it offers the free-play link instead of its primary action; once it is
    // unlocked its primary action opens the Playground itself. After Mission 01 is finished, HTML Island offers
    // the Playground too as the clear next step.
    if (modalPlaygroundLink) modalPlaygroundLink.hidden = !((dest.playgroundLink && !dest.isUnlocked) || doneHere);
    if (modalMissionLink) {
      modalMissionLink.hidden = !dest.missionLink;
      modalMissionLink.textContent = mission05Done ? "Replay Mission 05" : "Start Mission 05";
    }

    modalOverlay.scrollTop = 0;   // a tall briefing always starts at its top
    document.body.classList.add("dest-modal-open");   // the page behind does not scroll
    modalOverlay.classList.add("active");
    modalOverlay.setAttribute("aria-hidden", "false");

    // Keyboard users: remember where they came from and move focus into the dialog
    modalOpener = document.activeElement;
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  /**
   * Closes the destination details modal
   */
  function closeDestinationModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dest-modal-open");
    // Give focus back to the card that opened the dialog
    if (modalOpener && typeof modalOpener.focus === "function" && document.contains(modalOpener)) modalOpener.focus();
    modalOpener = null;
  }

  // Attach click & keyboard listeners to destination cards
  const destCards = document.querySelectorAll(".dest-card");
  destCards.forEach(card => {
    const destId = card.getAttribute("data-dest-id");
    const dest = ADVENTURE_DESTINATIONS.find(d => d.id === destId);
    if (!dest) return;

    card.addEventListener("click", () => openDestinationModal(dest));

    // Keyboard accessibility: Enter or Space
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDestinationModal(dest);
      }
    });
  });

  // Close modal button
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeDestinationModal);
  }

  // Close modal on backdrop click
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeDestinationModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay && modalOverlay.classList.contains("active")) {
      closeDestinationModal();
    }
    // Keep Tab / Shift+Tab inside the open dialog
    if (e.key === "Tab" && modalOverlay && modalOverlay.classList.contains("active")) {
      const items = Array.from(modalOverlay.querySelectorAll("a[href], button")).filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!modalOverlay.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ------------------------------------------------------------------------
  // Creator's Lab card: unlocked once Mission 01 is completed
  // ------------------------------------------------------------------------
  if (lab && lab.isUnlocked) {
    const labCard = document.querySelector('.dest-card[data-dest-id="creator-lab"]');
    if (labCard) {
      labCard.classList.remove("locked");
      labCard.setAttribute("aria-label", "Destination 04: Creator's Lab. Status: Unlocked. Click to inspect briefing.");
      const labPill = labCard.querySelector(".dest-status-pill");
      if (labPill) {
        labPill.textContent = lab.unlockedBadge;
        labPill.className = "dest-status-pill dest-status-active";
      }
    }
  }

  // ------------------------------------------------------------------------
  // Mission 05 in the Mission Log: open for everyone; shows "Completed" for a valid completion record
  // ------------------------------------------------------------------------
  if (mission05Done) {
    const m5Status = document.getElementById("mission-05-status");
    if (m5Status) {
      m5Status.textContent = "✔ Completed";
      m5Status.className = "dest-status-pill dest-status-done";
    }
    const m5Link = document.getElementById("mission-05-link");
    if (m5Link) {
      m5Link.innerHTML = "Replay Mission 05 &rarr;";
      m5Link.classList.add("button-outline");
    }
  }

  // ------------------------------------------------------------------------
  // Show a finished Mission 01 on the map card and in the Adventure Mission Log
  // ------------------------------------------------------------------------
  if (mission01Done) {
    const islandDone = document.getElementById("html-island-done");
    if (islandDone) {
      islandDone.hidden = false;
      const activePill = islandDone.previousElementSibling;   // "✦ Active Quest": replaced by the completed pill
      if (activePill && activePill.classList.contains("dest-status-active")) activePill.hidden = true;
    }
    const islandCard = document.querySelector('.dest-card[data-dest-id="html-island"]');
    if (islandCard) {
      islandCard.setAttribute("aria-label", "Destination 01: HTML Island. Status: Mission 01 complete. Click to inspect briefing.");
    }

    const logStatus = document.getElementById("mission-01-status");
    if (logStatus) {
      logStatus.textContent = "✔ Completed";
      logStatus.className = "dest-status-pill dest-status-done";
    }
    const logLink = document.getElementById("mission-01-link");
    if (logLink) {
      logLink.innerHTML = "Replay Mission 01 &rarr;";
      logLink.classList.add("button-outline");
    }
    const logNext = document.getElementById("mission-01-next");
    if (logNext) logNext.hidden = false;

    const freeBuildDesc = document.getElementById("free-build-desc");
    if (freeBuildDesc) freeBuildDesc.textContent = "Great work on Mission 01! Now build your own page here, and download it whenever you like.";
  }
}

// --------------------------------------------------------------------------
// 3. Safe Execution on DOM Load
// --------------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdventureMap);
} else {
  initAdventureMap();
}
