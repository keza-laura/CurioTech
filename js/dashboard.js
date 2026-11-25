// ==========================================================================
// CurioTech - Dashboard (live progress)
// Reads the real mission completion records and saved Playground projects,
// then fills in XP, level, missions, badges, progress bars and the portfolio.
// This file only READS storage; the missions and the Playground are the writers.
// ==========================================================================
(function () {
  "use strict";

  var MISSION_01_KEY = "curiotech_mission_01_completed";
  var MISSION_02_KEY = "curiotech_mission_02_completed";
  var MISSION_04_KEY = "curiotech_mission_04_completed";
  var MISSION_03_KEY = "curiotech_mission_03_completed";
  var MISSION_05_KEY = "curiotech_mission_05_completed";
  var TOTAL_MISSIONS = 5;          // missions on the Adventure Map (all five are playable)

  var XP_MISSION_01 = 100;
  var XP_MISSION_02 = 110;
  var XP_MISSION_03 = 125;
  var XP_MISSION_04 = 140;
  var XP_MISSION_05 = 150;
  var XP_PER_PROJECT = 20;

  // Level thresholds in XP, lowest first
  var LEVELS = [
    { name: "Beginner", min: 0 },
    { name: "Explorer", min: 100 },
    { name: "Creator", min: 250 },
    { name: "Builder", min: 400 },
    { name: "Master", min: 600 }
  ];

  function byId(id) { return document.getElementById(id); }
  function setText(id, text) { var el = byId(id); if (el) el.textContent = text; }

  /** True only for a well-formed completion record. Anything else counts as not done. */
  function isDone(key) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return false;
      var rec = JSON.parse(raw);
      return !!rec && rec.v === 1 && rec.done === true;
    } catch (e) {
      return false;
    }
  }

  function readProjects() {
    try {
      if (window.CurioProjects && window.CurioProjects.isAvailable()) return window.CurioProjects.list();
    } catch (e) { /* fall through */ }
    return [];
  }

  function setBar(fillId, trackId, percent) {
    var fill = byId(fillId);
    var track = byId(trackId);
    if (fill) fill.style.width = percent + "%";
    if (track) track.setAttribute("aria-valuenow", String(percent));
  }

  function setBadge(name, unlocked) {
    var card = document.querySelector('[data-badge="' + name + '"]');
    if (!card) return;
    card.classList.toggle("is-unlocked", unlocked);
    var icon = card.querySelector(".achievement-icon");
    var status = card.querySelector(".achievement-status");
    if (icon) icon.textContent = unlocked ? "✓" : "—";
    if (status) status.textContent = unlocked ? "Unlocked" : "Locked";
  }

  // A small picture of a project. Scripts never run here (sandbox with no permissions), and the
  // Content Security Policy stops the learner's page from loading anything from the internet.
  function previewDocument(p) {
    return "<!DOCTYPE html><html><head><meta charset=\"utf-8\">" +
      "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:\">" +
      "<style>body{margin:8px;font-family:sans-serif}</style></head><body>" +
      p.html + "<style>" + p.css + "</style></body></html>";
  }

  function renderPortfolio(projects) {
    var text = byId("dash-portfolio-text");
    var list = byId("dash-portfolio-list");
    var action = byId("dash-portfolio-action");
    if (!list || !text) return;
    list.textContent = "";
    if (projects.length === 0) {
      list.hidden = true;
      return;
    }
    text.textContent = projects.length === 1
      ? "Your first project is saved. Open it to keep building, or start another."
      : "You have " + projects.length + " saved projects. Open one to keep building.";
    if (action) action.textContent = "New project in the Playground →";

    projects.forEach(function (p) {
      var item = document.createElement("li");
      item.className = "portfolio-item";

      var frame = document.createElement("div");
      frame.className = "portfolio-thumb";
      var preview = document.createElement("iframe");
      preview.setAttribute("sandbox", "");               // no scripts, no forms, no same-origin access
      preview.setAttribute("tabindex", "-1");
      preview.setAttribute("aria-hidden", "true");
      preview.setAttribute("loading", "lazy");
      preview.setAttribute("title", "Preview of " + p.name);
      preview.srcdoc = previewDocument(p);
      frame.appendChild(preview);

      var name = document.createElement("span");
      name.className = "portfolio-item-name";
      name.textContent = p.name;                         // textContent: learner text is never run as HTML
      var date = document.createElement("span");
      date.className = "portfolio-item-date";
      var when = new Date(p.updatedAt);
      date.textContent = isNaN(when.getTime()) ? "" : "Updated " + when.toLocaleDateString();

      var open = document.createElement("a");
      open.className = "button button-small button-outline portfolio-item-open";
      open.href = "playground.html?project=" + encodeURIComponent(p.id);
      open.textContent = "Open in Playground";
      open.setAttribute("aria-label", "Open " + p.name + " in the Playground");

      item.append(frame, name, date, open);
      list.appendChild(item);
    });
    list.hidden = false;
  }

  function render() {
    var m1 = isDone(MISSION_01_KEY);
    var m2 = isDone(MISSION_02_KEY);
    var m3 = isDone(MISSION_03_KEY);
    var m4 = isDone(MISSION_04_KEY);
    var m5 = isDone(MISSION_05_KEY);
    var projects = readProjects();
    var projectCount = projects.length;
    var missionsDone = (m1 ? 1 : 0) + (m2 ? 1 : 0) + (m3 ? 1 : 0) + (m4 ? 1 : 0) + (m5 ? 1 : 0);

    // XP and level
    var xp = (m1 ? XP_MISSION_01 : 0) + (m2 ? XP_MISSION_02 : 0) + (m3 ? XP_MISSION_03 : 0) + (m4 ? XP_MISSION_04 : 0) + (m5 ? XP_MISSION_05 : 0) + projectCount * XP_PER_PROJECT;
    var level = LEVELS[0];
    var next = null;
    LEVELS.forEach(function (l, i) {
      if (xp >= l.min) { level = l; next = LEVELS[i + 1] || null; }
    });
    setText("dash-xp", xp + " XP");
    setText("dash-level", level.name);
    setText("dash-level-note", next ? (next.min - xp) + " XP to " + next.name : "Top level reached");

    // Missions and overall progress
    var percent = Math.round((missionsDone / TOTAL_MISSIONS) * 100);
    setText("dash-missions", String(missionsDone));
    setText("dash-missions-note", missionsDone === 0 ? "Ready to begin" : "of " + TOTAL_MISSIONS + " missions");
    setText("dash-adventure-pct", percent + "%");
    setBar("dash-adventure-fill", "dash-adventure-track", percent);
    setText("dash-overall-pct", percent + "%");
    setBar("dash-overall-fill", "dash-overall-track", percent);
    setText("dash-stat-pct", percent + "%");
    setText("dash-stat-missions", String(missionsDone));
    setText("dash-stat-projects", String(projectCount));

    // Badges
    var firstSteps = m1;
    var curiousMind = m5;
    var youngCreator = projectCount > 0;
    setBadge("first-steps", firstSteps);
    var cityStylist = m3;
    setBadge("curious-mind", curiousMind);
    setBadge("city-stylist", cityStylist);
    setBadge("structure-builder", m2);
    setBadge("code-wizard", m4);
    setBadge("young-creator", youngCreator);
    setText("dash-badges", String((firstSteps ? 1 : 0) + (m2 ? 1 : 0) + (cityStylist ? 1 : 0) + (m4 ? 1 : 0) + (curiousMind ? 1 : 0) + (youngCreator ? 1 : 0)));

    // One clear next step, shown at the top of the page and again under "Continue Learning"
    var step;
    if (!m1) {
      step = { text: "Ready to start? Begin Mission 01 on the Adventure Map.", note: "Your next step: Mission 01, Enter the Web.",
               label: "Start Mission 01 →", href: "adventure.html" };
    } else if (!m2) {
      step = { text: "Great start! Next up: Mission 02, learn how a page is built from elements and tags.", note: "Your next step: Mission 02, Build the Structure.",
               label: "Go to Mission 02 →", href: "mission-02.html" };
    } else if (!m3) {
      step = { text: "Nice building! Next up: Mission 03, style a tower and a neon sign in CSS City.", note: "Your next step: Mission 03, Make It Beautiful.",
               label: "Go to Mission 03 →", href: "mission-03.html" };
    } else if (!m4) {
      step = { text: "Looking stylish! Next up: Mission 04, make a page react with JavaScript.", note: "Your next step: Mission 04, Bring It to Life.",
               label: "Go to Mission 04 →", href: "mission-04.html" };
    } else if (!m5) {
      step = { text: "Almost there! Next up: Mission 05, build and save your own project.", note: "Your next step: Mission 05, the Creator Mission.",
               label: "Go to Mission 05 →", href: "adventure.html#mission-05" };
    } else {
      step = { text: "You finished every mission! Keep creating in the Playground.", note: "Your next step: keep creating. New missions can be added any time.",
               label: "Open Playground →", href: "playground.html" };
    }
    setText("dash-next-text", step.text);
    setText("dash-hero-next-note", step.note);
    [byId("dash-next-link"), byId("dash-hero-next")].forEach(function (a) {
      if (!a) return;
      a.textContent = step.label;
      a.setAttribute("href", step.href);
    });
    var startBtn = byId("btn-start-course");
    if (startBtn && missionsDone > 0) startBtn.textContent = "Continue Adventure →";

    renderPortfolio(projects);
  }

  // Lets a learner erase everything CurioTech has saved in this browser (after asking first)
  function wireClearData() {
    var btn = byId("dash-clear-data");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!window.confirm("Erase all your progress and saved projects from this browser? This cannot be undone.")) return;
      [window.localStorage, window.sessionStorage].forEach(function (store) {
        try {
          Object.keys(store).forEach(function (k) { if (k.indexOf("curiotech_") === 0) store.removeItem(k); });
        } catch (e) { /* storage unavailable: nothing to clear */ }
      });
      setText("dash-clear-status", "Done. Your data was erased from this browser.");
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", function () { render(); wireClearData(); });
  // Coming back with the Back button can show a cached page: refresh the numbers
  window.addEventListener("pageshow", function (event) { if (event.persisted) render(); });
})();
