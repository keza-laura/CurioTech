# CurioTech

CurioTech is an accessible, beginner-friendly digital-skills learning platform designed for young people.

---

## 1. Project Overview

Many young people—especially girls and women—encounter artificial barriers, intimidating jargon, or overly theoretical material when first exploring technology and software development. 

CurioTech changes that dynamic by making learning practical, engaging, and approachable from day one. Instead of passive memorization, CurioTech uses an active learning pathway:

> **Discover → Challenge → Experiment → Build → Create**

Learners build real-world confidence through bite-sized lessons, interactive challenges, and creative hands-on projects.

---

## 2. Technologies

This project uses standard, pure web technologies without external frameworks, build tools, or server dependencies:

* **HTML5 (`index.html`, `login.html`, `dashboard.html`, `course.html`, `lesson.html`)**: Semantic markup providing clean structure, labels, form controls, navigation landmarks, and accessible page sections.
* **CSS3 (`css/styles.css`)**: Shared stylesheet using CSS custom properties (`:root`) for CurioTech brand colors (Midnight black, Neon purple, Light lavender, White, and Dark plum), Flexbox, CSS Grid, cards, button states, focus highlights, code blocks, and responsive media queries.
* **JavaScript (`js/main.js`, `js/dashboard.js`, `js/course.js`)**: Plain vanilla JavaScript handling connection confirmation, form validation, login redirection, session progress reflection, dynamic lesson rendering, and interactive quiz evaluation.

---

## 3. Project Folder Structure

```text
curiotech/
├── index.html          # Public landing page with hero, journey, and benefits
├── login.html          # Simulated demo sign-in page with front-end validation
├── dashboard.html      # Learner dashboard home base with course links
├── course.html         # Course overview, objectives, and curriculum (Phase 4)
├── lesson.html         # Interactive lesson viewer and knowledge check quiz (Phase 4)
├── README.md           # Project documentation, guides, and testing instructions
├── css/
│   └── styles.css      # Shared design system across all five pages
├── js/
│   ├── main.js         # Base platform script (connection + login validation & redirection)
│   ├── dashboard.js    # Dashboard interactions & session progress display
│   └── course.js       # Course curriculum data, lesson reader, and interactive quiz engine (Phase 4)
└── assets/
    └── images/
        └── logo.png    # Official glowing circuit logo
```

### Purpose of Each File

* **`index.html`**: The main public landing page. Features a sticky header with brand logo, hero section with call-to-actions, an introduction, the 5-step learning journey, platform benefits, and a closing invitation to start learning.
* **`login.html`**: The simulated login page. Displays an email and password form that accepts demo credentials, validates inputs, and redirects to the learner dashboard upon successful validation.
* **`dashboard.html`**: The learner dashboard. Serves as the central hub displaying learning activity overviews, course pathways, locked achievement badges, learning progress indicators, and portfolio space.
* **`course.html`**: Course overview page for *Introduction to Web Development*. Displays estimated course duration, learning objectives, what learners gain, curriculum syllabus, and active session completion progress.
* **`lesson.html`**: Interactive lesson viewer and quiz player. Dynamically displays the 4 beginner-friendly lessons with formatted code examples, recaps, and step-by-step knowledge check quizzes.
* **`css/styles.css`**: Centralized stylesheet shared across all pages. Ensures visual consistency, responsive stacking on mobile screens, accessible focus rings, and dark code highlighting.
* **`js/main.js`**: Platform-wide script. Handles browser verification and login form validation safely.
* **`js/dashboard.js`**: Dashboard script. Reflects session course completion on the dashboard.
* **`js/course.js`**: Course and quiz engine. Powers the 4 lessons, syntax examples, quiz question state machine, immediate feedback, and session storage tracking.
* **`assets/images/logo.png`**: The official CurioTech brand mark.
* **`README.md`**: Comprehensive guide explaining project progress, architecture, and instructions for running and testing.

---

## 4. Completed Phases

### Phase 1: Project Foundation & Responsive Landing Page
* Semantic HTML5 landing page layout with navigation, hero section, introduction, 5-step learning journey, and benefits.
* Centralized CSS custom properties for CurioTech brand colors.
* Mobile-responsive behavior using CSS Grid, Flexbox, and media queries.

### Phase 2: Simulated Login & Front-End Validation
* Centered card design matching the dark plum theme.
* Front-end format validation checking email structure (`username@domain.extension`) and non-empty passwords.
* Friendly feedback messages and automatic clearing of password inputs without storing or transmitting credentials.

### Phase 3: Learner Dashboard & Distinct Navigation
* Central learner dashboard with 4 metric cards (Total XP, Level, Lessons Completed, Achievements).
* Course cards showcasing *Introduction to Web Development* (Available) and *Introduction to Programming* (Coming Soon).
* Distinct, styled **Logout** button with purple border and translucent fill.

### Phase 4: Courses, Lessons, and Quizzes (Current)
* **Functional Course Pathway**: Clicking "Start Learning" on the dashboard opens the dedicated course overview page ([`course.html`](file:///C:/Users/USER/OneDrive/Documents/CurioTech/course.html)).
* **Course Overview Page (`course.html`)**:
  * Title: *Introduction to Web Development*.
  * Beginner difficulty label and estimated duration (~45–60 mins self-paced estimate).
  * "What You Will Gain" and "Learning Objectives" with checkmark lists.
  * Curriculum list displaying all 4 lessons in order with duration estimates, completion badges, and direct links.
  * Session progress bar reflecting lessons completed during the current visit.
* **Four Beginner-Friendly Lessons (`lesson.html`)**:
  * **Lesson 1: Introduction to Web Development**: What web development means, how browsers request pages, and the 3 core pillars (HTML structure, CSS style, JavaScript behavior).
  * **Lesson 2: Understanding HTML**: Markup concepts, elements, opening and closing tags, document anatomy, and practical examples.
  * **Lesson 3: Understanding CSS**: Selectors, declarations, colors, fonts, margins, padding, and rounded borders.
  * **Lesson 4: Introduction to JavaScript**: How code brings pages to life, variables (`const` and `let`), functions, and click event listeners.
* **Step-by-Step Interactive Quizzes**:
  * Displays 3 multiple-choice questions one at a time after each lesson.
  * Selectable option cards with radio buttons and hover/selection highlights.
  * **Submit Answer** button evaluates the response immediately without revealing answers beforehand.
  * Clear, encouraging feedback (*"Great job! You got it right."* or *"Not quite! Let's understand why."*) with helpful explanations.
  * **Next Question →** advances through the quiz.
  * Final **Quiz Summary** calculates score (e.g. `3 / 3`), displays an encouraging message, marks the lesson complete for the current session, and offers "Proceed to Next Lesson" and "Retry Quiz" actions.
* **Smooth Lesson Navigation**:
  * Previous Lesson and Next Lesson buttons.
  * Direct "Back to Course Overview" links.
  * Session completion tracking using `sessionStorage` (no permanent database required).

---

## 5. How the Pages Connect

```text
  [ index.html ] ── (Get Started) ──> [ login.html ] ── (Valid Sign In) ──> [ dashboard.html ]
        ▲                                                                           │
        │                                                                (Start Learning)
        │                                                                           ▼
        │                                                                   [ course.html ]
        │                                                                           │
        │                                                                    (Start Lesson)
        │                                                                           ▼
        └─────────────────────── (Logout / Home links) ───────────────────── [ lesson.html ]
```

All five pages share [`css/styles.css`](file:///C:/Users/USER/OneDrive/Documents/CurioTech/css/styles.css) for 100% visual consistency.

---

## 6. How to Run the Project

No web server, node installation, or build step is required:

1. Open your computer's file explorer.
2. Navigate to the `curiotech` project folder.
3. Double-click **`index.html`** to view the landing page.
4. Click **Get Started** to open **`login.html`**.
5. Enter any demo email (e.g., `learner@example.com`) and any demo password, then click **Sign In** to reach **`dashboard.html`**.
6. On the dashboard, click **Start Learning** on *Introduction to Web Development* to view **`course.html`**.
7. Click **Start Course** or any lesson card to launch **`lesson.html`** and complete the interactive lessons and quizzes.

---

## 7. How to Test the Project

### Test 1: Full User Journey (Landing → Login → Dashboard → Course → Lesson → Quiz)
1. Open `index.html`.
2. Click **Get Started** to navigate to `login.html`.
3. Enter `learner@example.com` and `demo1234`, then click **Sign In**.
4. On `dashboard.html`, click **Start Learning** on *Introduction to Web Development*. Confirm `course.html` opens.
5. On `course.html`, confirm all 4 lessons, objectives, and estimated time are visible.
6. Click **Start Course** (or Lesson 1); confirm `lesson.html?lesson=1` opens.

### Test 2: Lesson Content & Code Blocks
1. In Lesson 1, verify the explanation of HTML, CSS, and JavaScript.
2. Confirm the formatted code block is legible with syntax styling and the explanation callout box.
3. Read the Lesson Recap box.

### Test 3: Interactive Quiz Functionality
1. Scroll to the **Knowledge Check** section on any lesson.
2. Click **Submit Answer** without choosing an option; verify that a warning appears asking you to select an answer.
3. Select an answer and click **Submit Answer**; verify immediate feedback appears with an explanation.
4. Click **Next Question →** to move through all questions.
5. After the final question, verify the **Quiz Summary** displays your score, marks the lesson complete, and gives you a button to proceed to the next lesson or retry.

### Test 4: Session Progress & Lesson Navigation
1. After completing Quiz 1, click **Course Overview**.
2. Confirm Lesson 1 is marked with a green **✔ Completed** badge and the course progress bar reflects session completion (25%).
3. Return to the dashboard and confirm the session progress reflects completed lessons.

### Test 5: Responsive Layout & Mobile Verification
1. Open `course.html` and `lesson.html` in your browser.
2. Press `F12` and toggle mobile device simulation (375px width).
3. Confirm navigation wraps neatly, lesson text remains readable, code blocks scroll horizontally if needed, and quiz cards stack comfortably without horizontal overflow.

### Test 6: Browser Console Check
1. On all pages (`index.html`, `login.html`, `dashboard.html`, `course.html`, `lesson.html`), open the browser Developer Tools Console (`F12`).
2. Verify that there are zero JavaScript errors.

---

## 8. Not Implemented Yet (Planned for Future Phases)

The following capabilities are intentionally reserved for upcoming phases:

* **Phase 5**: Interactive practical coding exercises / challenge editor.
* **Phase 6**: In-browser sandboxed HTML code runner and live preview playground frame.
* **Phase 7**: Permanent learner progress persistence in browser `localStorage`, XP points engine, achievement badge unlocks, and portfolio management.
