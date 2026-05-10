const LANGUAGE_KEY = "catalunya-meteo-language";
const DEFAULT_LANGUAGE = "es";

const buttons = document.querySelectorAll(".language-option");

const translations = {
  es: {
    appBrand: "Catalunya Meteo",
    interactiveWeatherMap: "Interactive Weather Map",
    liveData: "Live data",

    interactiveMap: "Mapa interactivo",
    regions: "Comarcas de Cataluña",

    humidity: "Humedad",
    wind: "Viento",
    apparent: "Sensación",
    rain: "Probabilidad de lluvia",
    pressure: "Presión",

    forecast7days: "Previsión 7 días",

    settingsTitle: "Configuración",
    settingsLanguage: "Idioma",
    settingsTheme: "Tema",
    settingsThemeToggle: "Cambiar tema",
    settingsAudio: "Audio",
    settingsAudioToggle: "Activar / desactivar voz",
  },

  ca: {
    appBrand: "Catalunya Meteo",
    interactiveWeatherMap: "Mapa Meteorològic Interactiu",
    liveData: "Dades en directe",

    interactiveMap: "Mapa interactiu",
    regions: "Comarques de Catalunya",

    humidity: "Humitat",
    wind: "Vent",
    apparent: "Sensació",
    rain: "Probabilitat de pluja",
    pressure: "Pressió",

    forecast7days: "Previsió 7 dies",
    
    settingsTitle: "Configuració",
    settingsLanguage: "Idioma",
    settingsTheme: "Tema",
    settingsThemeToggle: "Canviar tema",
    settingsAudio: "Àudio",
    settingsAudioToggle: "Activar / desactivar veu",
  }
};

const storedLanguage = getStoredLanguage();

applyLanguage(storedLanguage);

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const lang = button.dataset.lang;

    if (!translations[lang]) return;

    localStorage.setItem(LANGUAGE_KEY, lang);
    applyLanguage(lang);
  });
});

function getStoredLanguage() {
  const stored = localStorage.getItem(LANGUAGE_KEY);

  if (translations[stored]) {
    return stored;
  }

  return DEFAULT_LANGUAGE;
}

function applyLanguage(lang) {
  const t = translations[lang] || translations[DEFAULT_LANGUAGE];

  document.documentElement.lang = lang;
  document.documentElement.dataset.language = lang;

  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (!t[key]) return;

    element.textContent = t[key];
  });

  window.dispatchEvent(
    new CustomEvent("app:language-change", {
      detail: { lang }
    })
  );
}