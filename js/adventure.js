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
      "Mission 02: Build the Structure (HTML Tags, Elements & Boilerplate)"
    ],
    stageNote: "⭐ Destination Unlocked! Ready for exploration. Click below to launch Mission 01 with Pixel."
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
      "Mission 03: Make It Beautiful (CSS Selectors, Colors, Padding & Layouts)"
    ],
    stageNote: "🔒 Locked Destination. Complete HTML Island to unlock passage to CSS City in Stage 4.3 & 4.4."
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
      "Mission 04: Bring It to Life (JavaScript Variables, Functions & Click Events)"
    ],
    stageNote: "🔒 Locked Destination. Complete CSS City to hack your way through JavaScript Jungle in Stage 4.4."
  },
  {
    id: "creator-lab",
    order: "04",
    name: "Creator's Lab",
    icon: "🧪",
    badge: "🔒 Locked",
    isUnlocked: false,
    themeClass: "dest-creator",
    brief: "The ultimate creative workshop! Combine your skills to build and publish your own digital project.",
    description: "The high-tech summit of the digital adventure! Inside the Creator's Lab, you will step into the Creator's Playground to write, test, and celebrate your very own custom web project.",
    missions: [
      "Mission 05: The Creator Mission (Guided Independent Project Studio)"
    ],
    stageNote: "🔒 Locked Destination. Master HTML Island, CSS City, and JavaScript Jungle to unlock the Creator's Lab in Stage 4.5 & 4.6."
  }
];

// --------------------------------------------------------------------------
// 2. Adventure Map Initialization & Modal Controller
// --------------------------------------------------------------------------
function initAdventureMap() {
  const modalOverlay = document.getElementById("destination-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalBadge = document.getElementById("modal-badge");
  const modalDesc = document.getElementById("modal-desc");
  const modalMissions = document.getElementById("modal-missions");
  const modalNote = document.getElementById("modal-stage-note");
  const modalActionBtn = document.getElementById("modal-action-btn");

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

    // Render missions list
    modalMissions.innerHTML = dest.missions.map(m => `<li><span>✦</span> <strong>${m}</strong></li>`).join("");
    modalNote.textContent = dest.stageNote;

    // Set action button state
    if (dest.isUnlocked) {
      modalActionBtn.textContent = "Launch Mission 01: Enter the Web →";
      modalActionBtn.className = "button";
      modalActionBtn.disabled = false;
      modalActionBtn.onclick = function () {
        window.location.href = "mission.html";
      };
    } else {
      modalActionBtn.textContent = "🔒 Destination Locked";
      modalActionBtn.className = "button button-disabled";
      modalActionBtn.disabled = true;
      modalActionBtn.onclick = null;
    }

    modalOverlay.classList.add("active");
    modalOverlay.setAttribute("aria-hidden", "false");
  }

  /**
   * Closes the destination details modal
   */
  function closeDestinationModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
    modalOverlay.setAttribute("aria-hidden", "true");
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
  });
}

// --------------------------------------------------------------------------
// 3. Safe Execution on DOM Load
// --------------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdventureMap);
} else {
  initAdventureMap();
}
