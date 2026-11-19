// ==========================================================================
// CurioTech - Dashboard Interactions (Phase 3 & Phase 4)
// ==========================================================================

console.log("CurioTech Dashboard initialized.");

// --------------------------------------------------------------------------
// 1. Session Learning Progress Reflector
// --------------------------------------------------------------------------
// In Phase 4, completing quizzes marks lessons complete for the current session.
// We reflect this temporary progress on the dashboard when returning from a lesson.
document.addEventListener("DOMContentLoaded", function () {
  try {
    const raw = sessionStorage.getItem("curiotech_session_completed_lessons");
    const completedIds = raw ? JSON.parse(raw) : [];

    if (completedIds.length > 0) {
      // 1. Update Course Card 1 Progress
      const courseProgressPercent = Math.round((completedIds.length / 4) * 100);
      const courseCard = document.querySelector(".course-card");
      if (courseCard) {
        const percentSpan = courseCard.querySelector(".progress-header span:last-child");
        const progressFill = courseCard.querySelector(".progress-bar-fill");
        const actionBtn = document.getElementById("btn-start-course");

        if (percentSpan) percentSpan.textContent = courseProgressPercent + "%";
        if (progressFill) progressFill.style.width = courseProgressPercent + "%";
        if (actionBtn) {
          actionBtn.textContent = completedIds.length === 4 ? "Review Course" : "Continue Course";
        }
      }

      // 2. Update Top Metric Card: Lessons Completed
      const overviewCards = document.querySelectorAll(".overview-card");
      if (overviewCards.length >= 3) {
        const lessonsVal = overviewCards[2].querySelector(".overview-value");
        if (lessonsVal) lessonsVal.textContent = completedIds.length.toString();
      }

      // 3. Update Overall Progress Section
      const progressPanel = document.querySelector(".progress-panel");
      if (progressPanel) {
        const overallFill = progressPanel.querySelector(".progress-bar-fill");
        const overallHeaderSpan = progressPanel.querySelector(".progress-header span:last-child");
        const statItemNumber = progressPanel.querySelector(".stat-item-number");
        const lessonsStat = progressPanel.querySelectorAll(".stat-item-number")[1];

        if (overallFill) overallFill.style.width = courseProgressPercent + "%";
        if (overallHeaderSpan) overallHeaderSpan.textContent = courseProgressPercent + "%";
        if (statItemNumber) statItemNumber.textContent = courseProgressPercent + "%";
        if (lessonsStat) lessonsStat.textContent = completedIds.length.toString();
      }
    }
  } catch (err) {
    console.warn("Unable to read session progress:", err);
  }
});

// --------------------------------------------------------------------------
// 2. Coming Soon Buttons or Badges
// --------------------------------------------------------------------------
// If any interactive "Coming Soon" elements are clicked, provide friendly feedback.
const comingSoonBtns = document.querySelectorAll(".btn-coming-soon");
comingSoonBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    alert("This feature is coming soon in a future phase!");
  });
});
