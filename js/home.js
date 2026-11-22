// ==========================================================================
// CurioTech - Homepage menu (index.html only)
// Opens and closes the hamburger dropdown used at tablet and mobile widths.
// ==========================================================================
(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var toggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  if (!header || !toggle || !nav) return;

  // Same breakpoint as the CSS in css/home.css
  var mobileQuery = window.matchMedia("(max-width: 768px)");

  function isOpen() {
    return header.classList.contains("is-open");
  }

  function setOpen(open, returnFocus) {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open && returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", function () {
    setOpen(!isOpen(), false);
  });

  // Choosing a link closes the menu so the section it points to is visible
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false, false);
  });

  // Escape closes the menu and puts focus back on the button
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) setOpen(false, true);
  });

  // Clicking outside the header closes it
  document.addEventListener("click", function (event) {
    if (isOpen() && !header.contains(event.target)) setOpen(false, false);
  });

  // Tabbing out of the open menu closes it
  header.addEventListener("focusout", function (event) {
    if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) {
      setOpen(false, false);
    }
  });

  // Growing back to a desktop width resets the menu state
  function onBreakpointChange() {
    if (!mobileQuery.matches) setOpen(false, false);
  }
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", onBreakpointChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(onBreakpointChange);
  }
})();
