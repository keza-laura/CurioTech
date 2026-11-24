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
 (landing)      (guest start)   (home base)         │
                                  │                 ├── mission.html      Mission 01: Enter the Web
                                  │                 │      └─ finish it ──> the Creator's Lab unlocks
                                  │                 ├── mission-02.html   Mission 02: Build the Structure (after Mission 01)
                                  │                 ├── mission-03.html   Mission 03: Make It Beautiful (CSS City, after Mission 01)
                                  │                 ├── mission-04.html   Mission 04: Bring It to Life (JavaScript Jungle, after Mission 03)
                                  │                 ├── mission-05.html   Mission 05: The Creator Mission
                                  │                 └── playground.html   Creator's Playground (from the Lab)
                                  └── playground.html                     Creator's Playground (free play)
```

1. **Landing page** (`index.html`): introduces CurioTech and the learning journey.
2. **Guest start** (`login.html`): there are no accounts, so one button, **Start as Guest**, goes straight to the dashboard. The page explains that progress is saved in this browser only.
3. **Dashboard** (`dashboard.html`): the home base. From here learners enter the Adventure, open the Playground, or jump to Mission 05.
4. **Adventure Map** (`adventure.html`): four destinations (HTML Island, CSS City, JavaScript Jungle and the Creator's Lab), Pixel's tips, and a Mission Log listing five missions.
   * **HTML Island** and **Mission 01** are open.
   * **Mission 02: Build the Structure** is on HTML Island and opens once Mission 01 is completed.
   * **CSS City** opens once Mission 02 is completed, and holds **Mission 03: Make It Beautiful**.
   * **JavaScript Jungle** opens once Mission 03 is completed, and holds **Mission 04: Bring It to Life**.
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
* **Celebrate**: the learner can send the blueprint to the Creator's Playground as ready-made HTML. Once the mission is earned, the closing button leads straight on to Mission 02.

Mission 01 is recorded as complete only when the learner reaches the celebration stage **and** has inspected 3 different elements, solved all 3 quests and saved the blueprint. Opening the mission, or a stage, never counts.

### Mission 02: Build the Structure (`mission-02.html`, `js/mission-02.js`)

A five-step mission on HTML Island: **Discover**, **Experiment**, **Challenge**, **Create**, **Celebrate**.

* **Discover**: an element is an opening tag, content and a closing tag, and a page has a head and a body.
* **Experiment**: four pieces of text each wait for a tag (`h1`, `p`, `ul`, `a` and so on). The page and the HTML update as tags are chosen. At least 3 pieces need a tag.
* **Challenge**: three structure quests (the biggest heading, the closing tag, head or body).
* **Create**: fill in a page title, heading, paragraph and list items and watch a full HTML skeleton appear. Save the page.
* **Celebrate**: recorded as complete only when 3 pieces were tagged, all 3 quests were solved and the page was saved. The learner's words are only ever shown as plain text, so typing tags into the boxes cannot change the page.

### Mission 03: Make It Beautiful (`mission-03.html`, `js/mission-03.js`)

A five-step mission in CSS City: **Discover**, **Experiment**, **Challenge**, **Create**, **Celebrate**.

* **Discover**: the three parts of a CSS rule (selector, property, value).
* **Experiment**: style a city tower with a colour, roundness, height and neon glow, and watch the real CSS appear below it. At least 3 different settings are needed.
* **Challenge**: three style quests (pick the property, spot the correct rule, finish the rule). Wrong answers give a hint and can be retried.
* **Create**: design a neon sign (words, colour, font, size, glow) and save the design.
* **Celebrate**: shows the saved sign. Mission 03 is recorded as complete only when the learner reaches this step **and** changed 3 different tower settings, solved all 3 quests and saved the sign. Opening the mission never counts. An existing record is never overwritten.
* In-progress state is kept in `localStorage` so the learner can close the tab and carry on. The sign words are only ever shown as plain text.

### Mission 04: Bring It to Life (`mission-04.html`, `js/mission-04.js`)

A five-step mission in JavaScript Jungle: **Discover**, **Experiment**, **Challenge**, **Create**, **Celebrate**.

* **Discover**: a variable, an event and an action, in a four-line program.
* **Experiment**: the Zap lab. A counter button runs the same idea the code panel shows (`score = score + step`). Press it 5 times and change the step size once.
* **Challenge**: three code quests (what `let` does, the `click` event, predicting `n = n + 3`).
* **Create**: set up a click game (button words, points per click, goal, winning message), play it until it is won, then save it. The code panel shows the real code for the choices made.
* **Celebrate**: recorded as complete only when the lab was used, all 3 quests were solved, and a game was won and saved.
* **Safety:** nothing the learner types is ever run as code. The lab and the game are small fixed functions in the mission file that only use numbers from fixed lists, and the learner's words are shown as plain text.

### Mission 05: The Creator Mission (`mission-05.html`, `js/mission-05.js`)

A six-step guided project: **Choose your idea**, **Make a tiny plan**, **Build it in the Creator's Playground**, **Run it, look at it, improve it**, **Save your project**, **You're a Creator!**

* The learner picks an idea and plans a project name, a purpose and what to include.
* The build and try steps happen in the Creator's Playground, which shows a "Back to Mission 05" bar while the mission is in progress.
* Mission 05 is recorded as complete only when the learner presses the check on the Save step and finds a project that was **saved after starting the mission** and is **not just the unchanged starter page**. Projects saved before the mission began do not count.
* Saving, opening, renaming or deleting projects never completes the mission by itself.

### Creator's Playground (`playground.html`, `js/playground.js`)

* Three editors (HTML, CSS, JavaScript) with a live preview. HTML and CSS update as you type; **JavaScript only runs when you press Run Code**, and has a Stop button and a console-style Output box.
* Four guided levels with Pixel: **Remix**, **Style**, **Bring it to life** and **Free Canvas**. Learners can skip to the Free Canvas.
* **Hints:** the mission card has a **Need a hint?** button. It gives up to three hints for the next goal (gentle, then specific, then an example) and starts over when the next goal changes.
* **Friendly help with mistakes:** JavaScript errors get a plain-language explanation from Pixel (the original message is always shown too). A gentle tip under the HTML editor points at the first tag that looks unclosed. Tips never block the preview, saving or goals.
* Reset-to-starter buttons for each editor.
* **Download my page**: saves the HTML, CSS and JavaScript together as one `.html` file.
* Limits: 20,000 characters per editor; at most 200 lines of program output.
* Safety: the preview and the run mode use a sandboxed frame (`sandbox="allow-scripts"`) with a Content Security Policy, so a learner's code is kept apart from CurioTech's own page and storage, and is restricted in what it can load or send.
* Hand-off: if the learner arrives from Mission 01 with a blueprint, the Playground offers to use it or keep the work already there.

### Dashboard: progress, next step and portfolio (`dashboard.html`, `js/dashboard.js`)

* Reads the mission completion records and saved projects (read-only) to show XP, level, missions completed, badges and progress bars.
* A **next-step button** at the top of the page (repeated under Continue Learning) always points at the next sensible thing: Mission 01, then Mission 05, then the Playground.
* The **Portfolio** shows each saved project as a card with a small picture, its name, the date and an **Open in Playground** button (`playground.html?project=<id>`). The picture is a sandboxed frame with no scripts and a Content Security Policy, so a learner's page cannot run code or load anything from the internet there.

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
├── login.html          # Guest start page (no accounts)
├── dashboard.html      # Learner dashboard (home base)
├── adventure.html      # Adventure Map: destinations, Pixel, Mission Log
├── mission.html        # Mission 01: Enter the Web
├── mission-02.html     # Mission 02: Build the Structure
├── mission-03.html     # Mission 03: Make It Beautiful
├── mission-04.html     # Mission 04: Bring It to Life
├── mission-05.html     # Mission 05: The Creator Mission
├── playground.html     # Creator's Playground and My Projects
├── README.md
├── css/
│   └── styles.css      # Shared stylesheet for every page
├── js/
│   ├── main.js         # Shared script (no behaviour of its own yet)
│   ├── dashboard.js    # Dashboard: live XP, level, badges, progress and portfolio from saved data
│   ├── adventure.js    # Adventure Map: destination briefings, Lab unlock, Mission 05 status
│   ├── pixel.js        # Pixel the robot companion on the Adventure Map
│   ├── mission.js      # Mission 01 activities (inspector, quests, blueprint studio)
│   ├── mission-kit.js  # Shared mission engine (steps, stepper, Pixel, saving, completion) used by all five missions
│   ├── mission-02.js   # Mission 02 content and activities
│   ├── mission-03.js   # Mission 03 content and activities
│   ├── mission-04.js   # Mission 04 content and activities
│   ├── mission-05.js   # Mission 05 plan form and saved-project checks
│   ├── playground.js   # Playground editors, preview, Run, levels, download, My Projects UI
│   └── projects.js     # Saved-projects storage module (used by the Playground and Mission 05)
└── assets/
    └── images/
        └── logo.png    # CurioTech logo
```

### Important files

* **`js/projects.js`**: the only code that reads and writes saved projects. It validates every project, caps the list at 10, and sets aside damaged data instead of deleting it. Mission 05 only reads it.
* **`js/adventure.js`**: reads the two mission completion records (read-only) to unlock the Creator's Lab and to show Mission 05 as completed.
* **`js/mission-kit.js`**: the shared engine for every mission. It runs the steps, the stepper, Continue / Back, Pixel's text, saving the in-progress state and the completion record, and it writes the record only on the last step when the mission's own requirements (and any quests) are met. Each mission file describes only its own content, gates and activities, with a few optional hooks (for example Mission 05 checks the saved project and Mission 01 leads on to Mission 02 from its last button).
* Each mission's completion record is written only through the kit, under that mission's own key, and an existing record is never overwritten.
* **`css/styles.css`**: sections are grouped by page. Classes starting `pg-` belong to the Playground and `m5-` to Mission 05.

---

## 6. How to Run the Project

No build step is needed, and there is nothing to install.

**Simplest way:** open **`index.html`** by double-clicking it (or dragging it into a browser), click **Get Started**, press **Start as Guest**, and explore from the dashboard.

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
| `curiotech_mission_02_completed` | Mission 02 completion record: `{ v: 1, done: true, completedAt }`. |
| `curiotech_mission_02_progress` | Mission 02 in-progress state. Cleared when the learner leaves from the celebration step. |
| `curiotech_mission_04_completed` | Mission 04 completion record: `{ v: 1, done: true, completedAt }`. |
| `curiotech_mission_04_progress` | Mission 04 in-progress state. Cleared when the learner leaves from the celebration step. |
| `curiotech_mission_03_completed` | Mission 03 completion record: `{ v: 1, done: true, completedAt }`. |
| `curiotech_mission_03_progress` | Mission 03 in-progress state (step, tower settings, quests, sign). Cleared when the learner leaves from the celebration step. |
| `curiotech_mission_05_completed` | Mission 05 completion record: `{ v: 1, done: true, completedAt, projectId, projectName }`. |
| `curiotech_playground_progress` | The Playground's guided-level progress. |
| `curiotech_mission_01_progress` | Mission 01 in-progress state (stage, inspected elements, quest results, blueprint). Cleared when the learner leaves from the celebration stage. |
| `curiotech_mission_05_progress` | Mission 05 in-progress state (step, and `data`: idea, plan, start time, return label). The Playground's "Back to Mission 05" bar reads it. Cleared when the learner leaves through the map. |

A completion record only counts when it reads `v: 1` and `done: true`. A missing, damaged or wrong record never shows a mission as complete and never unlocks the Creator's Lab.

The Playground's working drafts (`curiotech_playground_html_draft`, `..._css_draft`, `..._js_draft`) and their baseline and open-project markers are also in `localStorage`, so they survive closing the tab.

**Kept for the current tab only** (`sessionStorage`: cleared when the tab or session ends):

* The Playground's run marker (`curiotech_playground_run_marker`).
* The one-time Mission 01 blueprint hand-off to the Playground (`curiotech_blueprint_handoff`).

Clearing the browser's site data erases saved projects and completion records. There is no backup or sync.

---

## 8. How to Check It Works (Manual Checklist)

There are no automated tests in this project. Check it by hand:

1. **Journey:** open `index.html`, press **Start as Guest**, then from the dashboard press **Enter Adventure**.
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

* **No accounts:** CurioTech starts guests straight on the dashboard. There is no sign-in, so progress cannot follow a learner to another browser or device. The top-right button on each page is **Home** and returns to the landing page.
* **One device only:** progress and projects live in one browser on one device. There is no cloud saving, sharing, or backend.
* **All five missions are playable, and each one leads to the next.** The order is 01, 02, 03, 04, then 05. Each of Missions 02, 03 and 04 opens after the one before it, and Mission 05 is open to everyone but comes last. On the map, an **Up next** banner always points at the next mission. Every celebration screen has a **Next mission** button that appears once that mission is on record (Mission 05's leads to the dashboard). The mission pages do not block direct links: the map only controls what is offered.
* **Playground drafts survive leaving:** the working drafts are kept in `localStorage`, so closing the tab and coming back restores your code. A **Save progress** button saves right now and shows the time. Saved projects are still the permanent, named copies. Only the Mission 01 hand-off and the run marker stay per-tab.
* **Playground limits:** 20,000 characters per editor, 10 saved projects, and a JavaScript output cap of 200 lines.

---

## 10. Development Phases

### Completed

* **Phase 1: Landing page**: semantic, responsive landing page with the brand colours.
* **Phase 2: Login page**: a front-end sign-in form (replaced by the guest start in the prototype hardening pass).
* **Phase 3: Learner dashboard**: dashboard layout, course cards and a distinct Home button.
* **Phase 4: The Digital Adventure**: the Adventure Map, Pixel the robot companion and Mission 01, with its completion record.
* **Phase 5: Creator's Project Builder**: the Creator's Playground (editors, live preview, Run, four guided levels, download), saved projects (My Projects), Mission 05, and the Adventure Map and dashboard connections, including the Creator's Lab unlock.

### Planned (not built yet)

* **Phase 6**: more achievements, sharing and certificates (the "Projects Created" figure, the Young Creator badge and a portfolio of saved projects already work).
* More missions for CSS City and JavaScript Jungle.
