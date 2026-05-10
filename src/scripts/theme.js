const THEME_KEY = "catalunya-meteo-theme";

const root = document.documentElement;
const button = document.querySelector("#theme-toggle");
const icon = document.querySelector("#theme-toggle-icon");

const storedTheme = localStorage.getItem(THEME_KEY);
const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches
  ? "light"
  : "dark";

const initialTheme = storedTheme || preferredTheme;

applyTheme(initialTheme);

button?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

function applyTheme(theme) {
  root.dataset.theme = theme;

  if (icon) {
    icon.className = theme === "light"? "ti ti-moon" : "ti ti-sun-high";
  }
}