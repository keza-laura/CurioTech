// ==========================================================================
// CurioTech - Main JavaScript (Phase 1, 2, & 3 Refinements)
// ==========================================================================

// Phase 1 Connection Verification
console.log("CurioTech is ready to build!");

// --------------------------------------------------------------------------
// Phase 2 & 3: Simulated Login Form Handling with Front-End Validation
// --------------------------------------------------------------------------
// We first check if the login form exists on the current page before adding
// event listeners. This prevents any errors when running on other pages!
const loginForm = document.getElementById("login-form");
const loginFeedback = document.getElementById("login-feedback");

if (loginForm && loginFeedback) {
  loginForm.addEventListener("submit", function (event) {
    // 1. Prevent default form submission so the browser does not reload
    event.preventDefault();

    // 2. Read and trim user input from the form fields
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    // 3. Reject empty email or password fields
    if (!email || !password) {
      displayFeedback("Please fill in both your email address and password.", "error");
      return;
    }

    // 4. Validate email format (pattern: username@domain.extension)
    // Note: This validates structure only; it does not check inbox existence (no backend).
    const emailFormatPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormatPattern.test(email) || (emailInput && !emailInput.checkValidity())) {
      displayFeedback("Please enter a valid email format (e.g., learner@example.com).", "error");
      return;
    }

    // 5. Front-end validation passed: show friendly success feedback
    displayFeedback("Sign-in successful! Redirecting to your dashboard...", "success");

    // Clear password for security (never saved or transmitted)
    if (passwordInput) {
      passwordInput.value = "";
    }

    // 6. Redirect the learner to the dashboard after a short moment so feedback is visible
    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 350);
  });
}

/**
 * Helper function to show friendly feedback messages on the screen
 * @param {string} message - The text message to display
 * @param {"success" | "error"} type - The message type ('success' or 'error')
 */
function displayFeedback(message, type) {
  if (!loginFeedback) return;

  loginFeedback.textContent = message;
  loginFeedback.className = "login-feedback visible " + type;
}
