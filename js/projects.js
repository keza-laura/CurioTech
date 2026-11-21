// ==========================================================================
// CurioTech: Creator's Project Builder - Project storage (Phase 5, Stage 5.1)
// ==========================================================================
// Saved projects are explicit, named snapshots of a learner's HTML, CSS and JavaScript.
// They are separate from the Playground's per-tab drafts and from its progress record.
//
// Storage (localStorage, so projects survive closing the browser):
//   key   "curiotech_projects"
//   data  { v: 1, projects: [ { id, name, html, css, js, createdAt, updatedAt } ] }
//
// Rules:
//   - At most 10 projects. Names are 1-40 characters. Each file is at most 20,000 characters
//     (the same limit as the Playground editors).
//   - Code is stored as plain text and only ever shown in editors or sent through the Playground's
//     existing sanitiser and sandbox. It is never run or inserted into a page from here.
//   - Nothing is changed silently: too-big or invalid input is REFUSED (never trimmed), and every
//     call returns { ok: true, ... } or { ok: false, reason, message }.
//   - Every change re-reads storage first, so a second tab's saves are not overwritten.
//   - Unusable stored data is ignored. Before it is replaced, a copy is kept once under
//     "curiotech_projects_corrupt_backup".
//   - Storage that is blocked or full never throws: the call returns { ok: false, reason: "storage" }.
//
// This file only defines window.CurioProjects. It does nothing until another script calls it.
// ==========================================================================

(function () {
  "use strict";

  if (window.CurioProjects) return;

  const STORAGE_KEY = "curiotech_projects";
  const BACKUP_KEY = "curiotech_projects_corrupt_backup";
  const MAX_PROJECTS = 10;
  const MAX_NAME_CHARS = 40;
  const MAX_FILE_CHARS = 20000;
  const FILES = ["html", "css", "js"];

  const MESSAGES = {
    name: "Please give your project a name (1 to 40 characters).",
    limit: "You can save up to 10 projects. Delete one to make room.",
    "too-big": "That project is too big to save. Each file can hold up to 20,000 characters.",
    invalid: "I couldn't save that. Part of the project wasn't the right kind of text.",
    notfound: "I couldn't find that project. It may have been deleted.",
    storage: "This browser wouldn't let me save. Your work is still in the workshop. Try downloading it instead!"
  };

  function fail(reason) {
    return { ok: false, reason, message: MESSAGES[reason] || MESSAGES.invalid };
  }

  // ---- names ----
  /** Tidy a name: control characters become spaces, runs of spaces become one, ends are trimmed. */
  function cleanName(value) {
    if (typeof value !== "string") return "";
    return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  }

  function nameLength(name) {
    return Array.from(name).length;   // emoji count as one character
  }

  // ---- reading ----
  function validId(id) {
    return typeof id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(id);
  }

  function validTime(t) {
    return typeof t === "string" && !isNaN(Date.parse(t)) ? t : new Date(0).toISOString();
  }

  /** One stored entry, or null when it cannot be trusted. Text is kept exactly as stored. */
  function readEntry(p) {
    if (!p || typeof p !== "object" || !validId(p.id)) return null;
    if (FILES.some(f => typeof p[f] !== "string")) return null;
    let name = cleanName(p.name);
    if (name === "") name = "Untitled project";
    if (nameLength(name) > MAX_NAME_CHARS) name = Array.from(name).slice(0, MAX_NAME_CHARS).join("");
    return {
      id: p.id, name, html: p.html, css: p.css, js: p.js,
      createdAt: validTime(p.createdAt), updatedAt: validTime(p.updatedAt)
    };
  }

  /** Everything in storage: { available, projects, corrupt, dropped, raw }. Never throws. */
  function readStore() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return { available: false, projects: [], corrupt: false, dropped: 0, raw: null };
    }
    if (raw === null) return { available: true, projects: [], corrupt: false, dropped: 0, raw: null };

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return { available: true, projects: [], corrupt: true, dropped: 0, raw };
    }
    if (!data || typeof data !== "object" || data.v !== 1 || !Array.isArray(data.projects)) {
      return { available: true, projects: [], corrupt: true, dropped: 0, raw };
    }

    const seen = new Set();
    const projects = [];
    data.projects.forEach(p => {
      const e = readEntry(p);
      if (e && !seen.has(e.id)) {
        seen.add(e.id);
        projects.push(e);
      }
    });
    return { available: true, projects, corrupt: false, dropped: data.projects.length - projects.length, raw };
  }

  /** What callers receive: a copy, with each file limited to the editor size. */
  function view(p) {
    return {
      id: p.id, name: p.name,
      html: p.html.slice(0, MAX_FILE_CHARS), css: p.css.slice(0, MAX_FILE_CHARS), js: p.js.slice(0, MAX_FILE_CHARS),
      createdAt: p.createdAt, updatedAt: p.updatedAt
    };
  }

  function newestFirst(a, b) {
    return (Date.parse(b.updatedAt) - Date.parse(a.updatedAt)) ||
      (Date.parse(b.createdAt) - Date.parse(a.createdAt)) ||
      a.name.localeCompare(b.name);
  }

  // ---- writing ----
  /** Saves the list. Unusable data that is about to be replaced is first copied to a backup key (once). */
  function writeStore(projects, before) {
    try {
      if ((before.corrupt || before.dropped > 0) && before.raw !== null && localStorage.getItem(BACKUP_KEY) === null) {
        localStorage.setItem(BACKUP_KEY, before.raw);
      }
    } catch (e) { /* the backup is a bonus: carry on */ }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, projects }));
      return true;
    } catch (e) {
      return false;   // blocked or full
    }
  }

  function makeId(existing) {
    const taken = new Set(existing.map(p => p.id));
    for (let tries = 0; tries < 20; tries++) {
      const bytes = new Uint8Array(6);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(bytes);
      } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      const id = "p_" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
      if (!taken.has(id)) return id;
    }
    return "p_" + Date.now().toString(16);
  }

  // ---- checking input ----
  /** Checks the fields that are present in `input` (for create, name is required and files default to ""). */
  function check(input, isCreate) {
    if (!input || typeof input !== "object") return fail("invalid");
    const out = {};

    if (isCreate || "name" in input) {
      const name = cleanName(input.name);
      if (name === "" || nameLength(name) > MAX_NAME_CHARS) return fail("name");
      out.name = name;
    }
    for (const f of FILES) {
      if (!(f in input) || input[f] === undefined) {
        if (isCreate) out[f] = "";
        continue;
      }
      if (typeof input[f] !== "string") return fail("invalid");
      if (input[f].length > MAX_FILE_CHARS) return fail("too-big");
      out[f] = input[f];
    }
    return { ok: true, values: out };
  }

  // ---- public functions ----
  function list() {
    return readStore().projects.map(view).sort(newestFirst);
  }

  function get(id) {
    const p = readStore().projects.find(x => x.id === id);
    return p ? view(p) : null;
  }

  function count() {
    return readStore().projects.length;
  }

  function isFull() {
    return count() >= MAX_PROJECTS;
  }

  /** True when this browser lets us read saved projects at all. */
  function isAvailable() {
    return readStore().available;
  }

  function create(input) {
    const c = check(input, true);
    if (!c.ok) return c;
    const before = readStore();
    if (!before.available) return fail("storage");
    if (before.projects.length >= MAX_PROJECTS) return fail("limit");
    const now = new Date().toISOString();
    const project = Object.assign({ id: makeId(before.projects), createdAt: now, updatedAt: now }, c.values);
    if (!writeStore(before.projects.concat(project), before)) return fail("storage");
    return { ok: true, project: view(project) };
  }

  /** Changes only the fields given (name, html, css, js). The id and createdAt never change. */
  function update(id, changes) {
    const c = check(changes, false);
    if (!c.ok) return c;
    const before = readStore();
    if (!before.available) return fail("storage");
    const index = before.projects.findIndex(p => p.id === id);
    if (index === -1) return fail("notfound");
    const next = Object.assign({}, before.projects[index], c.values, { updatedAt: new Date().toISOString() });
    const projects = before.projects.slice();
    projects[index] = next;
    if (!writeStore(projects, before)) return fail("storage");
    return { ok: true, project: view(next) };
  }

  function rename(id, name) {
    return update(id, { name });
  }

  function remove(id) {
    const before = readStore();
    if (!before.available) return fail("storage");
    if (!before.projects.some(p => p.id === id)) return fail("notfound");
    if (!writeStore(before.projects.filter(p => p.id !== id), before)) return fail("storage");
    return { ok: true };
  }

  window.CurioProjects = Object.freeze({
    KEY: STORAGE_KEY,
    BACKUP_KEY,
    MAX_PROJECTS,
    MAX_NAME_CHARS,
    MAX_FILE_CHARS,
    messages: Object.freeze(Object.assign({}, MESSAGES)),
    cleanName,
    isAvailable,
    list,
    get,
    count,
    isFull,
    create,
    update,
    rename,
    remove
  });
})();
