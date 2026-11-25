// ==========================================================================
// CurioTech - Shared script
// The sign-in on login.html is a front-end simulation (no accounts exist): it checks the
// fields, then sends the learner to the dashboard. Nothing is stored or transmitted.
// "Start as Guest" is a plain link to the dashboard. Progress is kept in the browser.
// ==========================================================================
console.log("CurioTech is ready to build!");

const loginForm = document.getElementById("login-form");
const loginFeedback = document.getElementById("login-feedback");

function displayFeedback(message, type) {
  if (!loginFeedback) return;
  loginFeedback.textContent = message;
  loginFeedback.className = "login-feedback visible " + type;
}

if (loginForm && loginFeedback) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!email || !password) {
      displayFeedback("Please fill in both your email address and password.", "error");
      return;
    }

    // Structure check only (username@domain.extension); there is no server to verify it
    const emailFormatPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormatPattern.test(email)) {
      displayFeedback("Please enter a valid email format (e.g., learner@example.com).", "error");
      return;
    }

    displayFeedback("Sign-in successful! Redirecting to your dashboard...", "success");
    if (passwordInput) passwordInput.value = "";   // never kept
    setTimeout(function () { window.location.href = "dashboard.html"; }, 350);
  });
}
