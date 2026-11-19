// ==========================================================================
// CurioTech - Course, Lesson, and Quiz Engine (Phase 4)
// ==========================================================================

console.log("CurioTech Course Engine loaded.");

// --------------------------------------------------------------------------
// 1. Course Curriculum Data (Introduction to Web Development)
// --------------------------------------------------------------------------
const COURSE_DATA = {
  title: "Introduction to Web Development",
  description: "Learn the core foundations of the web. Explore how HTML structures pages, how CSS styles them with color and layout, and how JavaScript creates dynamic interactivity.",
  level: "Beginner",
  estimatedTime: "~45–60 minutes (self-paced estimate)",
  lessons: [
    {
      id: 1,
      title: "Introduction to Web Development",
      summary: "Explore what web development means, what websites are made of, and the distinct roles of HTML, CSS, and JavaScript.",
      duration: "~10 mins",
      sections: [
        {
          heading: "What is Web Development?",
          content: [
            "Web development is the craft of building websites and web applications that people view and interact with using web browsers such as Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.",
            "Whenever you visit a web address (a URL), your browser requests files from a computer called a web server. The server sends back code files, and your browser interprets that code into the visual, interactive page you see on your screen."
          ]
        },
        {
          heading: "What Websites Are Made Of",
          content: [
            "Almost every modern website is built using three foundational languages that work together like the parts of a house or a car:",
            "1. **HTML (Structure & Skeleton):** Defines what elements exist on the page—such as titles, paragraphs, images, links, and buttons.",
            "2. **CSS (Style & Appearance):** Defines how elements look—including colors, backgrounds, fonts, sizes, spacing, and responsive layout.",
            "3. **JavaScript (Interactivity & Behavior):** Defines how the page responds to user actions—such as clicking a button, opening a menu, showing a popup, or checking form inputs."
          ]
        },
        {
          heading: "How HTML, CSS, and JavaScript Work Together",
          content: [
            "Here is a simple example showing how all three languages cooperate to create a button that greets the user:"
          ],
          code: {
            language: "HTML + CSS + JavaScript Example",
            code: `<!-- 1. HTML: Creates the button element -->
<button id="welcome-btn">Say Hello</button>
<p id="message"></p>

<!-- 2. CSS: Styles the button -->
<style>
  #welcome-btn {
    background-color: #A855F7; /* Neon purple */
    color: #FFFFFF;           /* White text */
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
</style>

<!-- 3. JavaScript: Adds click behavior -->
<script>
  const btn = document.getElementById("welcome-btn");
  btn.addEventListener("click", function() {
    document.getElementById("message").textContent = "Welcome to CurioTech!";
  });
</script>`,
            explanation: "The HTML provides the button and paragraph tags. The CSS makes the button purple with rounded corners. The JavaScript listens for a click event and writes a welcoming message to the paragraph when clicked."
          }
        }
      ],
      recap: [
        "Web development creates websites viewed inside web browsers.",
        "HTML builds the content and structure.",
        "CSS styles the appearance, layout, and colors.",
        "JavaScript provides interactivity and dynamic behavior."
      ],
      quiz: [
        {
          question: "Which web technology is responsible for providing the structure and content of a webpage?",
          options: ["CSS", "HTML", "Python", "SQL"],
          correctIndex: 1,
          explanation: "HTML (HyperText Markup Language) provides the structure, headings, paragraphs, and content of all web pages."
        },
        {
          question: "What is the primary purpose of CSS in web development?",
          options: [
            "To connect the website to a database",
            "To define visual presentation such as colors, fonts, and spacing",
            "To store passwords securely",
            "To create hardware components"
          ],
          correctIndex: 1,
          explanation: "CSS (Cascading Style Sheets) controls how HTML elements are styled and arranged visually on the screen."
        },
        {
          question: "If you want a webpage to respond dynamically when a user clicks a button, which language do you use?",
          options: ["HTML only", "Markdown", "JavaScript", "XML"],
          correctIndex: 2,
          explanation: "JavaScript is the programming language that adds interactivity and dynamic behaviors to web pages."
        }
      ]
    },
    {
      id: 2,
      title: "Understanding HTML",
      summary: "Learn what HTML elements and tags are, how documents are structured, and how to write basic page markup.",
      duration: "~12 mins",
      sections: [
        {
          heading: "What is HTML?",
          content: [
            "HTML stands for **HyperText Markup Language**. A markup language uses special tags to tell the browser what kind of content each piece of text is—such as a major heading, a paragraph, a bulleted list, or an image.",
            "Without HTML, the browser would only see a wall of plain text with no structure or formatting."
          ]
        },
        {
          heading: "HTML Elements and Tags",
          content: [
            "HTML elements are usually composed of an **opening tag**, the **content**, and a **closing tag**.",
            "For example, a paragraph looks like this: `<p>Learning to code is exciting!</p>`. The `<p>` is the opening tag, the text is the content, and `</p>` is the closing tag (notice the forward slash `/`).",
            "Common HTML elements include:",
            "• `<h1>` to `<h6>`: Headings, where `<h1>` is the largest and most important.",
            "• `<p>`: Paragraphs of text.",
            "• `<a>`: Hyperlinks that connect to other pages using the `href` attribute.",
            "• `<ul>` and `<li>`: Bulleted lists and list items.",
            "• `<button>`: Clickable buttons for actions."
          ]
        },
        {
          heading: "The Basic Structure of an HTML Page",
          content: [
            "Every complete HTML webpage uses a standard boilerplate layout that wraps all its content:"
          ],
          code: {
            language: "HTML Document Skeleton",
            code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First CurioTech Page</title>
</head>
<body>
  <h1>Welcome to CurioTech</h1>
  <p>I am learning digital skills by doing!</p>
  <a href="https://curiotech.example">Visit our learning journey</a>
</body>
</html>`,
            explanation: "<!DOCTYPE html> tells the browser this is a modern HTML5 document. The <head> stores page info (like the title), and the <body> holds everything visible to the learner on the screen."
          }
        }
      ],
      recap: [
        "HTML uses tags with angle brackets like `<p>` and `</p>` to mark up text.",
        "Headings range from `<h1>` (most important) down to `<h6>`.",
        "The `<head>` holds metadata, while the `<body>` holds visible page elements."
      ],
      quiz: [
        {
          question: "Which HTML tag creates the largest, top-level heading on a webpage?",
          options: ["<heading>", "<head>", "<h1>", "<big>"],
          correctIndex: 2,
          explanation: "<h1> defines the primary and most important heading on an HTML webpage."
        },
        {
          question: "What is the role of the <body> element in an HTML document?",
          options: [
            "It stores the browser title bar text only",
            "It contains all visible content shown on the webpage",
            "It is used to install software onto the computer",
            "It contains server configuration code"
          ],
          correctIndex: 1,
          explanation: "The <body> contains all visible elements of an HTML page, including headings, paragraphs, images, and links."
        },
        {
          question: "Which is the correct way to close an HTML paragraph element?",
          options: ["<p\\>", "</p>", "<close p>", "{/p}"],
          correctIndex: 1,
          explanation: "Closing tags in HTML use a forward slash before the element name, such as </p>."
        }
      ]
    },
    {
      id: 3,
      title: "Understanding CSS",
      summary: "Learn how CSS rules style HTML elements with colors, backgrounds, typography, padding, margins, and borders.",
      duration: "~12 mins",
      sections: [
        {
          heading: "What is CSS?",
          content: [
            "CSS stands for **Cascading Style Sheets**. While HTML provides the structural skeleton, CSS is the design layer that gives a website its personality, visual elegance, and color.",
            "CSS allows you to control colors, fonts, spacing, alignment, and how elements adapt across phones, tablets, and computers."
          ]
        },
        {
          heading: "How CSS Rules Work",
          content: [
            "A CSS rule consists of a **selector** and a **declaration block** surrounded by curly braces `{}`.",
            "• **Selector:** Points to the HTML element you want to style (e.g., `h1`, `p`, or `.card`).",
            "• **Property:** The visual feature you want to change (e.g., `color`, `font-size`, `margin`).",
            "• **Value:** The new setting you want to apply (e.g., `#A855F7`, `2rem`, `10px`)."
          ]
        },
        {
          heading: "Spacing: Margin vs. Padding",
          content: [
            "Understanding spacing is one of the most useful skills in web design:",
            "• **Padding:** Space **inside** the element's border, giving the content breathing room.",
            "• **Margin:** Space **outside** the element's border, pushing neighboring elements away.",
            "• **Border-radius:** Curves the sharp square corners of cards and buttons into rounded shapes."
          ],
          code: {
            language: "CSS Styling Example",
            code: `/* Select all elements with the class 'highlight-card' */
.highlight-card {
  background-color: #25202F; /* Dark plum */
  color: #FFFFFF;           /* White text */
  padding: 24px;            /* Breathing room inside */
  margin: 16px 0;           /* Push other elements away */
  border: 1px solid #A855F7;/* Neon purple border */
  border-radius: 12px;      /* Rounded corners */
}`,
            explanation: "This CSS rule selects any HTML element with class='highlight-card' and gives it CurioTech's dark plum background, neon purple border, rounded corners, and comfortable inside spacing."
          }
        }
      ],
      recap: [
        "CSS rules use a selector, property, and value to format elements.",
        "Padding adds room inside an element; margin creates space outside.",
        "`border-radius` rounds element corners, creating a modern aesthetic."
      ],
      quiz: [
        {
          question: "In the CSS rule 'p { color: #FFFFFF; }', what is 'color'?",
          options: ["The selector", "The property", "The value", "The HTML tag"],
          correctIndex: 1,
          explanation: "In CSS, 'color' is the property being modified, 'p' is the selector, and '#FFFFFF' is the value."
        },
        {
          question: "What is the key difference between padding and margin?",
          options: [
            "Padding is inside the border, while margin is outside the border",
            "Margin changes the text color, while padding changes the font",
            "Padding only works on mobile devices",
            "There is no difference between them"
          ],
          correctIndex: 0,
          explanation: "Padding adds spacing inside an element's border, while margin creates space outside the border."
        },
        {
          question: "Which CSS property is used to give a card or button rounded corners?",
          options: ["corner-round", "box-circle", "border-radius", "curve-edge"],
          correctIndex: 2,
          explanation: "border-radius controls the curvature of an element's corners in CSS."
        }
      ]
    },
    {
      id: 4,
      title: "Introduction to JavaScript",
      summary: "Discover how JavaScript brings webpages to life with variables, functions, and event listeners that respond to user actions.",
      duration: "~14 mins",
      sections: [
        {
          heading: "What is JavaScript?",
          content: [
            "JavaScript is the programming language that runs directly inside web browsers. While HTML creates the structure and CSS creates the style, JavaScript gives the page a 'brain'.",
            "With JavaScript, you can calculate values, validate forms, open popup windows, show animations, and react immediately whenever a user types, scrolls, or clicks."
          ]
        },
        {
          heading: "Variables and Data",
          content: [
            "Programs remember information using **variables**. You can think of a variable as a labeled storage box that holds a piece of data:",
            "• `const`: Used for values that stay constant (they cannot be reassigned).",
            "• `let`: Used for values that might change over time (like a quiz score or counter).",
            "Data can be text (strings in quotes like `\"CurioTech\"`), numbers (like `42`), or booleans (`true` or `false`)."
          ]
        },
        {
          heading: "Functions and Event Listeners",
          content: [
            "A **function** is a reusable set of instructions that performs a specific task when called.",
            "An **event listener** tells the browser to wait for a specific user action (like a `'click'`) and then run a function in response."
          ],
          code: {
            language: "JavaScript Interactive Example",
            code: `// 1. Declare variables pointing to HTML elements
const clickButton = document.getElementById("action-btn");
const counterText = document.getElementById("click-count");

// 2. Keep track of how many times the button was clicked
let count = 0;

// 3. Listen for clicks and update the screen
clickButton.addEventListener("click", function() {
  count = count + 1;
  counterText.textContent = "You clicked " + count + " times!";
});`,
            explanation: "We store the elements in variables, track the count with 'let', and use addEventListener('click') to increment the count and update the screen every time the user clicks."
          }
        }
      ],
      recap: [
        "JavaScript provides behavior, logic, and interactivity to webpages.",
        "Variables (`const` and `let`) store data the browser can read and change.",
        "Event listeners wait for user interactions like clicks and execute code in response."
      ],
      quiz: [
        {
          question: "Which modern keyword declares a variable whose reference cannot be reassigned?",
          options: ["var_fixed", "const", "locked", "static_val"],
          correctIndex: 1,
          explanation: "In modern JavaScript, 'const' declares a constant variable that cannot be reassigned."
        },
        {
          question: "What method is used to listen for when a user clicks on an HTML button?",
          options: [
            "button.watchTouch()",
            "button.addEventListener('click', callback)",
            "button.onUserAction()",
            "button.trigger('tap')"
          ],
          correctIndex: 1,
          explanation: "addEventListener('click', function) is the standard method for listening to click events in vanilla JavaScript."
        },
        {
          question: "Which browser tool allows developers to view console messages and inspect JavaScript errors?",
          options: [
            "Developer Tools Console (F12)",
            "Browser History tab",
            "Bookmark Bar",
            "Downloads Window"
          ],
          correctIndex: 0,
          explanation: "The Developer Tools Console (opened with F12) displays console.log outputs, warnings, and errors."
        }
      ]
    }
  ]
};

// --------------------------------------------------------------------------
// 2. Session Progress Management (Temporary Current Session Storage)
// --------------------------------------------------------------------------
const STORAGE_KEY = "curiotech_session_completed_lessons";

/**
 * Returns an array of completed lesson IDs for the current browser session
 * @returns {number[]}
 */
function getCompletedLessonIds() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Marks a lesson ID as completed in sessionStorage
 * @param {number} lessonId
 */
function markLessonAsCompleted(lessonId) {
  try {
    const ids = getCompletedLessonIds();
    if (!ids.includes(lessonId)) {
      ids.push(lessonId);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.warn("Unable to save session completion:", err);
  }
}

// --------------------------------------------------------------------------
// 3. Course Overview Page Renderer (course.html)
// --------------------------------------------------------------------------
function initCourseOverviewPage() {
  const curriculumList = document.getElementById("curriculum-lessons-list");
  const overallProgressText = document.getElementById("course-progress-percent");
  const overallProgressBar = document.getElementById("course-progress-bar");
  const heroActionBtn = document.getElementById("hero-start-course-btn");

  if (!curriculumList) return;

  const completedIds = getCompletedLessonIds();
  const totalLessons = COURSE_DATA.lessons.length;
  const percent = Math.round((completedIds.length / totalLessons) * 100);

  // Update progress bar
  if (overallProgressText) overallProgressText.textContent = percent + "%";
  if (overallProgressBar) overallProgressBar.style.width = percent + "%";

  // Update hero button
  if (heroActionBtn) {
    if (completedIds.length === 0) {
      heroActionBtn.textContent = "Start Course";
      heroActionBtn.href = "lesson.html?lesson=1";
    } else if (completedIds.length === totalLessons) {
      heroActionBtn.textContent = "Review Course";
      heroActionBtn.href = "lesson.html?lesson=1";
    } else {
      // Find the first uncompleted lesson
      const nextLesson = COURSE_DATA.lessons.find(l => !completedIds.includes(l.id)) || COURSE_DATA.lessons[0];
      heroActionBtn.textContent = "Continue: Lesson " + nextLesson.id;
      heroActionBtn.href = "lesson.html?lesson=" + nextLesson.id;
    }
  }

  // Render all 4 lesson cards
  curriculumList.innerHTML = COURSE_DATA.lessons.map(lesson => {
    const isCompleted = completedIds.includes(lesson.id);
    return `
      <article class="lesson-item-card ${isCompleted ? 'completed' : ''}">
        <div class="lesson-item-info">
          <div class="lesson-item-header">
            <span class="lesson-pill">Lesson ${lesson.id}</span>
            <span class="lesson-duration">⏱ ${lesson.duration}</span>
          </div>
          <h3 class="lesson-item-title">${lesson.title}</h3>
          <p class="lesson-item-desc">${lesson.summary}</p>
        </div>
        <div class="lesson-item-action">
          ${isCompleted 
            ? '<span class="badge-completed">✔ Completed</span>' 
            : ''}
          <a href="lesson.html?lesson=${lesson.id}" class="button button-small ${isCompleted ? 'button-secondary' : ''}">
            ${isCompleted ? 'Review Lesson' : 'Start Lesson →'}
          </a>
        </div>
      </article>
    `;
  }).join("");
}

// --------------------------------------------------------------------------
// 4. Interactive Lesson & Quiz Page Renderer (lesson.html)
// --------------------------------------------------------------------------
function initLessonPage() {
  const lessonContainer = document.getElementById("lesson-content-area");
  if (!lessonContainer) return;

  // 1. Determine active lesson from URL (?lesson=X or #X or default to 1)
  let lessonId = 1;
  const urlParams = new URLSearchParams(window.location.search);
  const paramVal = parseInt(urlParams.get("lesson"), 10);
  
  if (!isNaN(paramVal) && paramVal >= 1 && paramVal <= COURSE_DATA.lessons.length) {
    lessonId = paramVal;
  } else if (window.location.hash) {
    const hashVal = parseInt(window.location.hash.replace("#", "").replace("lesson-", ""), 10);
    if (!isNaN(hashVal) && hashVal >= 1 && hashVal <= COURSE_DATA.lessons.length) {
      lessonId = hashVal;
    }
  }

  const lesson = COURSE_DATA.lessons.find(l => l.id === lessonId) || COURSE_DATA.lessons[0];
  const totalLessons = COURSE_DATA.lessons.length;
  const prevLessonId = lesson.id > 1 ? lesson.id - 1 : null;
  const nextLessonId = lesson.id < totalLessons ? lesson.id + 1 : null;

  // 2. Render Lesson Header and Content
  let sectionsHtml = "";
  lesson.sections.forEach(sec => {
    sectionsHtml += `<h2>${sec.heading}</h2>`;
    sec.content.forEach(pText => {
      // Format bold markdown (**text**)
      const formatted = pText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      sectionsHtml += `<p>${formatted}</p>`;
    });

    if (sec.code) {
      sectionsHtml += `
        <div class="code-example-box">
          <div class="code-header-bar">
            <span>💻 ${sec.code.language}</span>
          </div>
          <pre><code>${escapeHtml(sec.code.code)}</code></pre>
        </div>
        <div class="code-explanation-box">
          <strong>💡 What this code does:</strong> ${sec.code.explanation}
        </div>
      `;
    }
  });

  const recapHtml = `
    <div class="recap-box">
      <h3 class="recap-title">📌 Lesson Recap</h3>
      <ul style="margin: 0; padding-left: 1.25rem;">
        ${lesson.recap.map(r => `<li style="margin-bottom: 0.4rem;">${r}</li>`).join("")}
      </ul>
    </div>
  `;

  lessonContainer.innerHTML = `
    <!-- Top Meta Breadcrumb -->
    <div class="lesson-top-bar">
      <a href="course.html" class="breadcrumb-link">← Back to Course Overview</a>
      <span class="lesson-pill">Lesson ${lesson.id} of ${totalLessons}</span>
    </div>

    <!-- Header Card -->
    <header class="lesson-header-card">
      <span class="lesson-pill" style="margin-bottom: 0.5rem; display: inline-block;">⏱ Estimated time: ${lesson.duration}</span>
      <h1 class="lesson-main-title">${lesson.title}</h1>
      <p class="lesson-main-summary">${lesson.summary}</p>
    </header>

    <!-- Reading Body -->
    <section class="lesson-body-section">
      ${sectionsHtml}
      ${recapHtml}
    </section>

    <!-- Interactive Quiz Card -->
    <section id="quiz-anchor" class="quiz-section" aria-labelledby="quiz-heading">
      <div class="quiz-top-bar">
        <span class="quiz-badge">Knowledge Check</span>
        <span id="quiz-question-counter" class="quiz-counter">Question 1 of ${lesson.quiz.length}</span>
      </div>

      <div id="quiz-interactive-box">
        <!-- Rendered dynamically by setupQuizEngine -->
      </div>
    </section>

    <!-- Bottom Navigation Bar -->
    <nav class="lesson-nav-bar" aria-label="Lesson navigation">
      <div>
        ${prevLessonId 
          ? `<a href="lesson.html?lesson=${prevLessonId}" class="button button-secondary">← Previous Lesson</a>` 
          : `<button class="button button-secondary" disabled style="opacity: 0.5; cursor: not-allowed;">← Previous Lesson</button>`}
      </div>
      <div>
        <a href="course.html" class="button button-secondary">Course Overview</a>
      </div>
      <div>
        ${nextLessonId 
          ? `<a href="lesson.html?lesson=${nextLessonId}" id="bottom-next-lesson-btn" class="button">Next Lesson →</a>` 
          : `<a href="course.html" id="bottom-next-lesson-btn" class="button">Finish Course →</a>`}
      </div>
    </nav>
  `;

  // 3. Initialize Interactive Quiz Engine for this lesson
  setupQuizEngine(lesson);
}

// --------------------------------------------------------------------------
// 5. Interactive Quiz State Machine
// --------------------------------------------------------------------------
function setupQuizEngine(lesson) {
  const quizBox = document.getElementById("quiz-interactive-box");
  const counterSpan = document.getElementById("quiz-question-counter");
  if (!quizBox) return;

  let currentQuestionIndex = 0;
  let correctAnswersCount = 0;
  let isAnswerSubmitted = false;
  const questions = lesson.quiz;

  function renderActiveQuestion() {
    isAnswerSubmitted = false;
    const q = questions[currentQuestionIndex];
    if (counterSpan) {
      counterSpan.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    }

    quizBox.innerHTML = `
      <h2 id="quiz-heading" class="quiz-question-text">${q.question}</h2>

      <form id="quiz-form" class="quiz-options-list">
        ${q.options.map((opt, i) => `
          <label class="quiz-option-label" id="opt-label-${i}">
            <input type="radio" name="quiz-choice" value="${i}">
            <span>${opt}</span>
          </label>
        `).join("")}
      </form>

      <div id="quiz-feedback-area" class="quiz-feedback" role="alert" aria-live="polite"></div>

      <div class="quiz-actions" style="margin-top: 1.5rem;">
        <button type="button" id="btn-submit-answer" class="button">Submit Answer</button>
      </div>
    `;

    // Radio selection highlight
    const optionLabels = quizBox.querySelectorAll(".quiz-option-label");
    const radios = quizBox.querySelectorAll('input[name="quiz-choice"]');

    radios.forEach(radio => {
      radio.addEventListener("change", function () {
        optionLabels.forEach(lbl => lbl.classList.remove("selected"));
        const parentLabel = this.closest(".quiz-option-label");
        if (parentLabel) parentLabel.classList.add("selected");
      });
    });

    // Handle Submit Answer / Advance Question
    const submitBtn = document.getElementById("btn-submit-answer");
    submitBtn.addEventListener("click", function () {
      const feedbackArea = document.getElementById("quiz-feedback-area");

      if (!isAnswerSubmitted) {
        // Step 1: Evaluate submitted answer
        const selectedRadio = quizBox.querySelector('input[name="quiz-choice"]:checked');

        if (!selectedRadio) {
          feedbackArea.className = "quiz-feedback visible incorrect";
          feedbackArea.innerHTML = `
            <div class="feedback-headline">⚠️ Please select an answer</div>
            <p class="feedback-explanation">Choose one of the options above before submitting.</p>
          `;
          return;
        }

        isAnswerSubmitted = true;
        const selectedAnswer = parseInt(selectedRadio.value, 10);
        const isCorrect = (selectedAnswer === q.correctIndex);

        // Lock radio inputs so answer cannot be altered
        radios.forEach(r => r.disabled = true);

        if (isCorrect) {
          correctAnswersCount++;
          feedbackArea.className = "quiz-feedback visible correct";
          feedbackArea.innerHTML = `
            <div class="feedback-headline">🎉 Great job! You got it right.</div>
            <p class="feedback-explanation">${q.explanation}</p>
          `;
        } else {
          feedbackArea.className = "quiz-feedback visible incorrect";
          feedbackArea.innerHTML = `
            <div class="feedback-headline">💡 Not quite! Let's understand why.</div>
            <p class="feedback-explanation">${q.explanation}</p>
          `;
        }

        // Change button text to advance
        if (currentQuestionIndex < questions.length - 1) {
          submitBtn.textContent = "Next Question →";
        } else {
          submitBtn.textContent = "See Quiz Results →";
        }
      } else {
        // Step 2: Advance to next question or show summary
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
          renderActiveQuestion();
        } else {
          renderQuizSummary();
        }
      }
    });
  }

  function renderQuizSummary() {
    if (counterSpan) {
      counterSpan.textContent = "Completed ✔";
    }

    // Mark lesson complete in session storage!
    markLessonAsCompleted(lesson.id);

    const totalQuestions = questions.length;
    const isNextAvailable = lesson.id < COURSE_DATA.lessons.length;

    quizBox.innerHTML = `
      <div class="quiz-summary-box">
        <span class="lesson-pill" style="margin-bottom: 0.75rem; display: inline-block;">Quiz Completed</span>
        <div class="summary-score-large">${correctAnswersCount} / ${totalQuestions}</div>
        <p class="summary-message">
          ${correctAnswersCount === totalQuestions 
            ? "Fantastic work! You answered all questions correctly and completed this lesson." 
            : "Great effort! You completed the knowledge check and finished this lesson."}
        </p>

        <div class="summary-actions">
          ${isNextAvailable 
            ? `<a href="lesson.html?lesson=${lesson.id + 1}" class="button">Proceed to Lesson ${lesson.id + 1} →</a>` 
            : `<a href="course.html" class="button">Return to Course Overview →</a>`}
          <button type="button" id="btn-retry-quiz" class="button button-secondary">Retry Quiz</button>
          <a href="course.html" class="button button-secondary">Course Overview</a>
        </div>
      </div>
    `;

    // Retry Quiz Handler
    const retryBtn = document.getElementById("btn-retry-quiz");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        currentQuestionIndex = 0;
        correctAnswersCount = 0;
        renderActiveQuestion();
      });
    }
  }

  // Start with Question 1
  renderActiveQuestion();
}

/**
 * Escapes HTML characters for safe code block presentation
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --------------------------------------------------------------------------
// 6. Safe Auto-Initialize (Handles both DOMContentLoaded & Interactive states)
// --------------------------------------------------------------------------
function initApp() {
  if (document.getElementById("curriculum-lessons-list")) {
    initCourseOverviewPage();
  }
  if (document.getElementById("lesson-content-area")) {
    initLessonPage();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
