const settingsButton = document.querySelector("#settings-button");
const settingsPopover = document.querySelector("#settings-popover");

const settingsLangButtons = document.querySelectorAll("[data-settings-lang]");
const settingsThemeToggle = document.querySelector("#settings-theme-toggle");
const settingsAudioToggle = document.querySelector("#settings-audio-toggle");

settingsButton?.addEventListener("click", () => {
  const isOpen = settingsPopover?.classList.toggle("is-open");

  settingsButton.setAttribute("aria-expanded", String(isOpen));
  settingsPopover?.setAttribute("aria-hidden", String(!isOpen));
});

document.addEventListener("click", (event) => {
  if (!settingsPopover || !settingsButton) return;

  const clickedInside =
    settingsPopover.contains(event.target) ||
    settingsButton.contains(event.target);

  if (!clickedInside) {
    closeSettings();
  }
});

settingsLangButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const lang = button.dataset.settingsLang;

    document
      .querySelector(`.language-option[data-lang="${lang}"]`)
      ?.click();

    closeSettings();
  });
});

settingsThemeToggle?.addEventListener("click", () => {
  document.querySelector("#theme-toggle")?.click();
  closeSettings();
});

settingsAudioToggle?.addEventListener("click", () => {
  document.querySelector("#audio-toggle")?.click();
  closeSettings();
});

function closeSettings() {
  settingsPopover?.classList.remove("is-open");
  settingsButton?.setAttribute("aria-expanded", "false");
  settingsPopover?.setAttribute("aria-hidden", "true");
}