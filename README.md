# CurioTech

CurioTech is an accessible, beginner-friendly digital-skills learning platform designed for young people (roughly ages 7 to 18). Learners explore web development through short hands-on missions with **Pixel**, a friendly robot companion, and then build and keep their own small webpages in the **Creator's Playground**.

---

## 1. Project Overview

Many young people, especially girls and women, meet artificial barriers, intimidating jargon, or overly theoretical material when they first explore technology and software development.

CurioTech changes that by making learning practical, engaging, and approachable from day one. Instead of passive memorisation, it uses an active learning pathway:

> **Discover → Challenge → Experiment → Build → Create**

Learners build confidence through bite-sized missions, interactive challenges, and creative hands-on projects.

CurioTech is a **front-end only prototype**. There is no server, no database and no real account system. Everything runs in the browser and is saved in the browser's own storage on the learner's device (see [Browser Storage](#7-browser-storage)).

---

## 2. The Learner Journey

```text
 index.html ──> login.html ──> dashboard.html ──> adventure.html (the Adventure Map)
 (landing)      (demo login)    (home base)         │
                                  │                 ├── mission.html      Mission 01: Enter the Web
                                  │                 │      └─ finish it ──> the Creator's Lab unlocks
                                  │                 ├── mission-05.html   Mission 05: The Creator Mission
                                  │                 └── playground.html   Creator's Playground (from the Lab)
                                  └── playground.html                     Creator's Playground (free play)
```

1. **Landing page** (`index.html`): introduces CurioTech and the learning journey.
2. **Demo sign-in** (`login.html`): enter any email in a valid format (for example `learner@example.com`) and any non-empty password. Nothing is stored or sent anywhere.
3. **Dashboard** (`dashboard.html`): the home base. From here learners enter the Adventure, open the Playground, or jump to Mission 05.
4. **Adventure Map** (`adventure.html`): four destinations (HTML Island, CSS City, JavaScript Jungle and the Creator's Lab), Pixel's tips, and a Mission Log listing five missions.
   * **HTML Island** and **Mission 01** are open.
   * **CSS City**, **JavaScript Jungle** and Missions 02 to 04 appear as locked (coming soon).
   * The **Creator's Lab** is locked until Mission 01 is completed. Once it is unlocked, its briefing opens the Creator's Playground.
   * **Mission 05** is open to everyone and does not require Mission 01 first.
5. **Missions**: Mission 01 teaches how webpages work; Mission 05 is a guided independent project.
6. **Creator's Playground** (`playground.html`): free experimenting with HTML, CSS and JavaScript, plus saved projects.

The Playground is also reachable at any time from the dashboard and from the navigation bar. It does not need Mission 01 to be finished.

---

## 3. What Is Built

### Mission 01: Enter the Web (`mission.html`, `js/mission.js`)

A six-stage guided mission: **Discover**, **Explore**, **Experiment**, **Challenge**, **Create**, **Celebrate**.

* **Explore**: the five building blocks of a webpage.
* **Experiment**: a Webpage Inspector (click page blocks to learn what they are) and a Tag Tinkerer.
* **Challenge**: three quick quests (Element Matcher, Tag Detective, Build the Page).
* **Create**: the Webpage Blueprint Studio, where the learner chooses a title, tagline, graphic and button and saves a blueprint.
* **Celebrate**: the learner can send the blueprint to the Creator's Playground as ready-made HTML.

Mission 01 is recorded as complete only when the learner reaches the celebration stage **and** has inspected 3 different elements, solved all 3 quests and saved the blueprint. Opening the mission, or a stage, never counts.

### Mission 05: The Creator Mission (`mission-05.html`, `js/mission-05.js`)

A six-step guided project: **Choose your idea**, **Make a tiny plan**, **Build it in the Creator's Playground**, **Run it, look at it, improve it**, **Save your project**, **You're a Creator!**

* The learner picks an idea and plans a project name, a purpose and what to include.
* The build and try steps happen in the Creator's Playground, which shows a "Back to Mission 05" bar while the mission is in progress.
* Mission 05 is recorded as complete only when the learner presses the check on the Save step and finds a project that was **saved after starting the mission** and is **not just the unchanged starter page**. Projects saved before the mission began do not count.
* Saving, opening, renaming or deleting projects never completes the mission by itself.

### Creator's Playground (`playground.html`, `js/playground.js`)

* Three editors (HTML, CSS, JavaScript) with a live preview. HTML and CSS update as you type; **JavaScript only runs when you press Run Code**, and has a Stop button and a console-style Output box.
* Four guided levels with Pixel: **Remix**, **Style**, **Bring it to life** and **Free Canvas**. Learners can skip to the Free Canvas.
* Reset-to-starter buttons for each editor.
* **Download my page**: saves the HTML, CSS and JavaScript together as one `.html` file.
* Limits: 20,000 characters per editor; at most 200 lines of program output.
* Safety: the preview and the run mode use a sandboxed frame (`sandbox="allow-scripts"`) with a Content Security Policy, so a learner's code is kept apart from CurioTech's own page and storage, and is restricted in what it can load or send.
* Hand-off: if the learner arrives from Mission 01 with a blueprint, the Playground offers to use it or keep the work already there.

### My Projects (inside the Playground)

* Save the current HTML, CSS and JavaScript together as a named project. **Up to 10 projects.**
* Names are 1 to 40 characters and must be different from each other (the comparison ignores capital letters).
* **Save Project** / **Save as New Project** makes a new project. **Update Project** replaces the open project (it asks first).
* The list shows each project (newest first) with **Open**, **Rename**, **Download** and **Delete**.
* Opening a project asks first if there is unsaved work. Deleting asks first. The panel tells the learner when the open project has unsaved changes.
* If the browser blocks storage, the Playground keeps working and says saving is unavailable, and suggests downloading instead.

---

## 4. Technologies

Plain, standard web technologies with no frameworks, build tools or server code:

* **HTML5**: semantic pages, labels, landmarks and accessible controls.
* **CSS3** (`css/styles.css`): one shared stylesheet with CSS custom properties for the CurioTech brand colours, Flexbox, Grid, button states, focus outlines and responsive media queries.
* **Vanilla JavaScript**: one script per page area (see the file list below). The browser's `localStorage` and `sessionStorage` are used for saving.

---

## 5. Project Folder Structure

```text
CurioTech-1/
├── index.html          # Public landing page
├── login.html          # Demo sign-in page with front-end validation
├── dashboard.html      # Learner dashboard (home base)
├── adventure.html      # Adventure Map: destinations, Pixel, Mission Log
├── mission.html        # Mission 01: Enter the Web
├── mission-05.html     # Mission 05: The Creator Mission
├── playground.html     # Creator's Playground and My Projects
├── course.html         # Older course overview page (no longer linked from the dashboard)
├── lesson.html         # Older lesson and quiz page (no longer linked from the dashboard)
├── README.md
├── css/
│   └── styles.css      # Shared stylesheet for every page
├── js/
│   ├── main.js         # Shared: login validation and redirect
│   ├── dashboard.js    # Dashboard interactions
│   ├── adventure.js    # Adventure Map: destination briefings, Lab unlock, Mission 05 status
│   ├── pixel.js        # Pixel the robot companion on the Adventure Map
│   ├── mission.js      # Mission 01 logic and completion record
│   ├── mission-05.js   # Mission 05 logic and completion record
│   ├── playground.js   # Playground editors, preview, Run, levels, download, My Projects UI
│   ├── projects.js     # Saved-projects storage module (used by the Playground and Mission 05)
│   └── course.js       # Older course and quiz engine (used only by course.html and lesson.html)
└── assets/
    └── images/
        └── logo.png    # CurioTech logo
```

### Important files

* **`js/projects.js`**: the only code that reads and writes saved projects. It validates every project, caps the list at 10, and sets aside damaged data instead of deleting it. Mission 05 only reads it.
* **`js/adventure.js`**: reads the two mission completion records (read-only) to unlock the Creator's Lab and to show Mission 05 as completed.
* **`js/mission.js`** and **`js/mission-05.js`**: each is the only writer of its own completion record, and neither ever overwrites an existing record.
* **`css/styles.css`**: sections are grouped by page. Classes starting `pg-` belong to the Playground and `m5-` to Mission 05.

---

## 6. How to Run the Project

No build step is needed, and there is nothing to install.

**Simplest way:** open **`index.html`** by double-clicking it (or dragging it into a browser), click **Get Started**, sign in with any email in a valid format and any password, and explore from the dashboard.

**Optional:** you can also serve the folder with any static web server and open its address in a browser. Pick whichever server you already have; the project does not need or include one. Browsers can treat saved data for a `file://` page and for a `http://localhost` page as separate, so use the same way of opening it each time if you want your saved projects to be there next time.

Use a current version of a desktop or mobile browser with JavaScript turned on. In a private or restricted window the browser may block saving; CurioTech tells you when that happens.

---

## 7. Browser Storage

All learner data stays in the learner's own browser. Nothing is sent anywhere.

**Kept on the device** (`localStorage`: survives refreshing, closing the tab and starting a new session):

| Key | What it holds |
| --- | --- |
| `curiotech_projects` | The saved Playground projects (name, HTML, CSS, JavaScript, dates). Up to 10. |
| `curiotech_projects_corrupt_backup` | A copy of project data that could not be read, set aside instead of deleted. |
| `curiotech_mission_01_completed` | Mission 01 completion record: `{ v: 1, done: true, completedAt }`. |
| `curiotech_mission_05_completed` | Mission 05 completion record: `{ v: 1, done: true, completedAt, projectId, projectName }`. |
| `curiotech_playground_progress` | The Playground's guided-level progress. |

A completion record only counts when it reads `v: 1` and `done: true`. A missing, damaged or wrong record never shows a mission as complete and never unlocks the Creator's Lab.

**Kept for the current tab only** (`sessionStorage`: cleared when the tab or session ends):

* The Playground's working drafts (`curiotech_playground_html_draft`, `..._css_draft`, `..._js_draft`) and their run, baseline and open-project markers.
* Mission 01's in-progress state and Mission 05's in-progress steps (`curiotech_mission_05_progress`).
* The one-time Mission 01 blueprint hand-off to the Playground (`curiotech_blueprint_handoff`).
* Progress for the older lesson pages (`curiotech_session_completed_lessons`).

Clearing the browser's site data erases saved projects and completion records. There is no backup or sync.

---

## 8. How to Check It Works (Manual Checklist)

There are no automated tests in this project. Check it by hand:

1. **Journey:** open `index.html`, sign in, then from the dashboard press **Enter Adventure**.
2. **Lab locked:** on a fresh browser the Creator's Lab shows as locked, Mission 05 shows "Ready to Explore", and the Lab's briefing offers the Playground and Mission 05 links.
3. **Mission 01:** work through all six stages (the Continue button waits until you have inspected 3 elements). On the celebration screen you should see "Saved!". Back on the map, Mission 01 shows **Completed** and the Creator's Lab shows **Unlocked**.
4. **Playground:** open it from the Lab. Edit the code, press **Run Code**, save a project, then **Open**, **Rename**, **Download** and **Delete** it. Refresh the page and confirm your project is still listed.
5. **Mission 05:** complete the six steps, saving a new project that you changed. Back on the map, Mission 05 shows **Completed**; refresh to confirm it stays.
6. **Keyboard:** use Tab and Shift+Tab through the dashboard, the map and the Lab briefing (which keeps focus inside it until you press Esc or Close).
7. **Responsive:** at 1366px, 768px and 375px wide there should be no sideways scrolling and no overlapping controls.
8. **Console:** open the browser's developer tools and confirm there are no JavaScript errors on any page.

To check the JavaScript syntax from a terminal (requires Node.js): `node --check js/<file>.js`.

---

## 9. Current Limitations and Unfinished Areas

* **Prototype login:** there are no real accounts. Anyone can sign in with any valid-looking email.
* **One device only:** progress and projects live in one browser on one device. There is no cloud saving, sharing, or backend.
* **Missions 02 to 04, CSS City and JavaScript Jungle** are shown as coming soon. Only Mission 01 and Mission 05 are playable.
* **Dashboard placeholders:** Total XP, Level, Lessons Completed, Achievements, the progress bars, the "Projects Created" figure, the badges (First Steps, Curious Mind, Young Creator) and the Portfolio are placeholders. They do **not** update from missions or saved projects yet.
* **Older pages:** `course.html` and `lesson.html` (an earlier "Introduction to Web Development" course and quiz) are still in the project but are no longer linked from the dashboard.
* **Per-tab progress:** Mission 01 and Mission 05 keep in-progress steps for the current tab only. Opening the mission in a new tab starts it from the beginning (completion records are kept permanently).
* **Playground limits:** 20,000 characters per editor, 10 saved projects, and a JavaScript output cap of 200 lines.
* **Accessibility gaps:** the shared top navigation links and a few older Pixel controls on the Adventure Map are smaller than the 44px touch-target size used elsewhere.
* **Button style:** many buttons use a `button-outline` class that has no style of its own, so they look the same as the main purple buttons.

---

## 10. Development Phases

### Completed

* **Phase 1: Landing page**: semantic, responsive landing page with the brand colours.
* **Phase 2: Simulated login**: front-end email and password validation, with nothing stored or sent.
* **Phase 3: Learner dashboard**: dashboard layout, course cards and a distinct Logout button.
* **Phase 4: The Digital Adventure**: the Adventure Map, Pixel the robot companion and Mission 01, with its completion record. (An earlier course and lesson prototype from this period remains in the project.)
* **Phase 5: Creator's Project Builder**: the Creator's Playground (editors, live preview, Run, four guided levels, download), saved projects (My Projects), Mission 05, and the Adventure Map and dashboard connections, including the Creator's Lab unlock.

### Planned (not built yet)

* **Phase 6**: a working "Projects Created" figure, the Young Creator badge and other achievements, and a portfolio of finished projects.
* More missions for CSS City and JavaScript Jungle.
