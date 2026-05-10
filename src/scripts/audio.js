const AUDIO_KEY = "catalunya-meteo-audio-enabled";

const button = document.querySelector("#audio-toggle");
const icon = document.querySelector("#audio-toggle-icon");

const storedValue = localStorage.getItem(AUDIO_KEY);
const initialEnabled = storedValue === "true";

applyAudioState(initialEnabled);

button?.addEventListener("click", () => {
  const nextEnabled = button.getAttribute("aria-pressed") !== "true";

  localStorage.setItem(AUDIO_KEY, String(nextEnabled));
  applyAudioState(nextEnabled);

  if (!nextEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  window.dispatchEvent(
    new CustomEvent("app:audio-toggle", {
      detail: { enabled: nextEnabled }
    })
  );
});

function applyAudioState(enabled) {
  button?.classList.toggle("is-active", enabled);
  button?.setAttribute("aria-pressed", String(enabled));

  if (icon) {
    icon.className = enabled ? "ti ti-volume" : "ti ti-volume-off";
  }
}