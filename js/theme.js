(function () {
  const STORAGE_KEY = "tp-theme";
  const html = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function storeTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function applyTheme(theme) {
    html.setAttribute("data-bs-theme", theme);
    // icon: moon for dark, sun for light
    if (icon) {
      icon.classList.remove("bi-moon-stars", "bi-sun");
      icon.classList.add(theme === "dark" ? "bi-moon-stars" : "bi-sun");
    }
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("title", theme === "dark" ? "Light mode" : "Dark mode");
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
    } else {
      applyTheme(systemPrefersDark() ? "dark" : "light");
    }
  }

  function toggleTheme() {
    const current = html.getAttribute("data-bs-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    storeTheme(next);
  }

  initTheme();

  if (btn) {
    btn.addEventListener("click", toggleTheme);
  }
})();
