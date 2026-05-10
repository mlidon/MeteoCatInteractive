import {
  weatherCodeToDescription,
  weatherCodeToIcon
} from "../utils/weatherIcons.js";

// URLs de los recursos
const MAP_URL =  `${import.meta.env.BASE_URL}maps/catalunya-comarques.json`;
const WEATHER_URL =  `${import.meta.env.BASE_URL}api/weather.json`;
const FALLBACK_IMAGE = `${import.meta.env.BASE_URL}cities/building.svg`;

// Elementos del mapa y estado
const svg = document.querySelector("#catalunya-map");
const statusEl = document.querySelector("#map-status");

// Elementos del panel de detalles
const panelComarca = document.querySelector("#panel-comarca");
const panelCapital = document.querySelector("#panel-capital");
const panelTemperature = document.querySelector("#panel-temperature");
const panelWeatherLabel = document.querySelector("#panel-weather-label");
const panelWeatherIcon = document.querySelector("#panel-weather-icon");
const panelHumidity = document.querySelector("#panel-humidity");
const panelWind = document.querySelector("#panel-wind");
const panelApparent = document.querySelector("#panel-apparent");
const panelRain = document.querySelector("#panel-rain");
const panelPressure = document.querySelector("#panel-pressure");
const panelUpdated = document.querySelector("#panel-updated");
const weatherImage = document.querySelector("#weather-image");
const weatherHourly = document.querySelector("#weather-hourly");
const weatherWeekly = document.querySelector("#weather-weekly");
const weatherPanel = document.querySelector("#weather-panel");
const mapStage = document.querySelector(".map-stage");
const mapTooltip = document.querySelector("#map-tooltip");
const tooltipComarca = document.querySelector("#tooltip-comarca");
const tooltipCapital = document.querySelector("#tooltip-capital");
const tooltipIcon = document.querySelector("#tooltip-icon");
const tooltipTemp = document.querySelector("#tooltip-temp");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const AUDIO_KEY = "catalunya-meteo-audio-enabled";

// Estado de la aplicación
let selectedPath = null;
let selectedComarcaName = null;
let weatherData = [];

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

initMap();

// Funciones principales
async function initMap() {
  try {
    const [geojson] = await Promise.all([
      loadMapData(),
      loadWeatherData()
    ]);

    if (!geojson.features || geojson.features.length === 0) {
      throw new Error("El GeoJSON no contiene features.");
    }

    renderGeoJSON(geojson);
    statusEl.textContent = loadedRegionsText(geojson.features.length);
    hideAppLoader();
  } catch (error) {
    
    console.error("[map]", error);
    statusEl.textContent = "Error cargando el mapa";
    hideAppLoader();
  }
}


async function loadMapData() {
  const response = await fetch(MAP_URL);

  if (!response.ok) {
    throw new Error(`No se pudo cargar el mapa: ${response.status}`);
  }

  return await response.json();
}

async function loadWeatherData() {
  try {
    const response = await fetch(WEATHER_URL);

    if (!response.ok) {
      throw new Error(`No se pudo cargar weather.json: ${response.status}`);
    }

    const data = await response.json();
    weatherData = data.items || [];
  } catch (error) {
    console.error("[weather]", error);
    weatherData = [];
  }
}

// Funciones de renderizado y lógica de interacción
function hideAppLoader() {
  const loader = document.querySelector("#app-loader");

  if (!loader) return;

  window.setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 250);
}


function renderGeoJSON(geojson) {
  const bounds = getBounds(geojson);
  const projection = createProjection(bounds, 1000, 1000, 20);
  const fragment = document.createDocumentFragment();

  geojson.features.forEach((feature, index) => {
    const comarcaName = getComarcaName(feature, index);
    const pathData = featureToPath(feature, projection);

    if (!pathData) return;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    path.setAttribute("d", pathData);
    path.classList.add("comarca-path");
    path.dataset.comarca = comarcaName;
    path.dataset.comarcaKey = toComarcaKey(comarcaName);
    path.setAttribute("tabindex", "0");
    path.setAttribute("role", "button");
    path.setAttribute("aria-label", comarcaName);

    path.addEventListener("mouseenter", (event) => {
      previewComarca(comarcaName);
        if (canHover) {
          showMapTooltip(event, comarcaName);
        }
    });

    path.addEventListener("mousemove", (event) => {
      if (canHover) {
        moveMapTooltip(event);
      }
    });

    path.addEventListener("mouseleave", () => {
      if (canHover) {
        hideMapTooltip();
      }
    });

    path.addEventListener("click", () => {
      selectComarca(path, comarcaName);
    });

    path.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectComarca(path, comarcaName);
      }
    });

    fragment.appendChild(path);
  });

  svg.innerHTML = "";
  svg.appendChild(fragment);

  selectRandomInitialComarca();
}

function selectRandomInitialComarca() {
  if (!weatherData.length) return;

  const paths = Array.from(document.querySelectorAll(".comarca-path"));

  const selectablePaths = paths.filter((path) => {
    return getWeatherForComarca(path.dataset.comarca);
  });

  if (!selectablePaths.length) return;

  const randomIndex = Math.floor(Math.random() * selectablePaths.length);
  const randomPath = selectablePaths[randomIndex];

  selectComarca(randomPath, randomPath.dataset.comarca);
}

function previewComarca(comarcaName) {
  if (!selectedPath) {
    updatePanel(comarcaName);
  }
}

function selectComarca(path, comarcaName) {
  if (selectedPath) {
    selectedPath.classList.remove("is-selected");
  }

  selectedPath = path;
  selectedComarcaName = comarcaName;

  selectedPath.classList.add("is-selected");

  updatePanel(comarcaName);
  speakSelectedComarca(comarcaName);
}

function updatePanel(comarcaName) {
  startAsideAnimation();
  // weatherPanel.classList.add("is-updating");
  const item = getWeatherForComarca(comarcaName);

  if (!item) {
    renderEmptyPanel(comarcaName);
    revealAsideSections();
    return;
  }

  const weather = item.weather || {};
  const lang = getCurrentLanguage();

  panelComarca.textContent = item.comarca;
  panelCapital.textContent =  item.capital ||  WEATHER_TRANSLATIONS[lang].capitalUnavailable;

  panelTemperature.textContent = valueOrDash(weather.temperature);
  panelWeatherLabel.textContent = weatherCodeToDescription(weather.weatherCode);
  panelWeatherIcon.src = weatherCodeToIcon(weather.weatherCode);

  panelHumidity.textContent = `${valueOrDash(weather.humidity)}%`;
  panelWind.textContent = `${valueOrDash(weather.windSpeed)} km/h`;
  panelApparent.textContent = `${valueOrDash(weather.apparentTemperature)}°`;
  panelRain.textContent = `${valueOrDash(weather.today?.rainProbability)}%`;
  panelPressure.textContent = `${valueOrDash(weather.pressure)} hPa`;

  weatherImage.src = item.image || FALLBACK_IMAGE;
  weatherImage.onerror = () => {
    weatherImage.src = FALLBACK_IMAGE;
  };

  renderHourlyForecast(weather.hourly || []);
  renderWeeklyForecast(weather.daily || []);

 

  panelUpdated.textContent =  WEATHER_TRANSLATIONS[lang].updated;
  revealAsideSections();
  window.setTimeout(() => {
    weatherPanel.classList.remove("is-updating");
  }, 160);
}

function renderEmptyPanel(comarcaName) {
  console.warn("[missing-weather-data]", comarcaName);
  const lang = getCurrentLanguage();
  
  panelComarca.textContent = comarcaName;
  panelCapital.textContent =   WEATHER_TRANSLATIONS[lang].noData;
  panelTemperature.textContent = "--";
  panelWeatherLabel.textContent = WEATHER_TRANSLATIONS[lang].notFound;
  panelWeatherIcon.src = weatherCodeToIcon(null);
  panelHumidity.textContent = "--%";
  panelWind.textContent = "-- km/h";
  panelApparent.textContent = "--°";
  panelRain.textContent = "--%";
  panelPressure.textContent = "-- hPa";
  panelUpdated.textContent =  WEATHER_TRANSLATIONS[lang].reviewJson;

  weatherHourly.innerHTML = "";
  weatherWeekly.innerHTML = "";
}

function renderHourlyForecast(items) {
  weatherHourly.innerHTML = "";

  items.slice(0, 6).forEach((item) => {
    const card = document.createElement("div");
    card.className = "hourly-item";

    card.innerHTML = `
      <span class="hourly-time">${escapeHTML(item.label || "--")}</span>
      <img
        class="hourly-icon"
        src="${weatherCodeToIcon(item.weatherCode)}"
        alt=""
        width="34"
        height="34"
      />
      <strong class="hourly-temp">${valueOrDash(item.temperature)}°</strong>
    `;

    weatherHourly.appendChild(card);
  });
}

function renderWeeklyForecast(items) {
  weatherWeekly.innerHTML = "";

  items.slice(0, 7).forEach((item) => {
    const card = document.createElement("div");
    card.className = "weekly-item";

    card.innerHTML = `
      <span class="weekly-day">${escapeHTML(item.label || "--")}</span>
      <img
        class="weekly-icon"
        src="${weatherCodeToIcon(item.weatherCode)}"
        alt=""
        width="32"
        height="32"
      />
      <strong class="weekly-temp">
        ${valueOrDash(item.min)}° / ${valueOrDash(item.max)}°
      </strong>
    `;

    weatherWeekly.appendChild(card);
  });
}

function getWeatherForComarca(comarcaName) {
  const key = toComarcaKey(comarcaName);

  return weatherData.find((item) => {
    return (
      toComarcaKey(item.comarca) === key ||
      toComarcaKey(item.id) === key
    );
  });
}

function getComarcaName(feature, index) {
  const props = feature.properties || {};

  return (
    props.NOMCOMAR ||
    props.NOMCOM ||
    props.COMARCA ||
    props.nomcomar ||
    props.nom_comar ||
    props.name ||
    props.NOM ||
    `Comarca ${index + 1}`
  );
}

function featureToPath(feature, project) {
  const geometry = feature.geometry;

  if (!geometry) return "";

  if (geometry.type === "Polygon") {
    return polygonToPath(geometry.coordinates, project);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((polygon) => polygonToPath(polygon, project))
      .join(" ");
  }

  return "";
}

function polygonToPath(polygon, project) {
  return polygon
    .map((ring) => {
      return (
        ring
          .map(([lng, lat], index) => {
            const [x, y] = project(lng, lat);
            return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
          })
          .join(" ") + " Z"
      );
    })
    .join(" ");
}

function getBounds(geojson) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  geojson.features.forEach((feature) => {
    if (!feature.geometry?.coordinates) return;

    walkCoordinates(feature.geometry.coordinates, ([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });
  });

  return { minLng, minLat, maxLng, maxLat };
}

function walkCoordinates(coords, callback) {
  if (typeof coords[0] === "number") {
    callback(coords);
    return;
  }

  coords.forEach((item) => walkCoordinates(item, callback));
}

function createProjection(bounds, width, height, padding) {
  const midLat = (bounds.minLat + bounds.maxLat) / 2;
  const latCorrection = Math.cos((midLat * Math.PI) / 180);

  const projectedMinX = bounds.minLng * latCorrection;
  const projectedMaxX = bounds.maxLng * latCorrection;

  const xRange = projectedMaxX - projectedMinX;
  const yRange = bounds.maxLat - bounds.minLat;

  const scale = Math.min(
    (width - padding * 2) / xRange,
    (height - padding * 2) / yRange
  );

  const mapWidth = xRange * scale;
  const mapHeight = yRange * scale;

  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  return (lng, lat) => {
    const projectedX = lng * latCorrection;

    const x = offsetX + (projectedX - projectedMinX) * scale;
    const y = offsetY + (bounds.maxLat - lat) * scale;

    return [x, y];
  };
}

function normalize(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toComarcaKey(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`´]/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
    .trim()
    .toLowerCase();
}

function valueOrDash(value) {
  return value === null || value === undefined || value === "" ? "--" : value;
}

function getCurrentLanguage() {
  return document.documentElement.dataset.language || "es";
}

const WEATHER_TRANSLATIONS = {
  es: {
    updated: "Tiempo actualizado",
    noData: "Sin datos meteorológicos",
    notFound: "No encontrado",
    reviewJson: "Revisa el nombre de la comarca en el JSON",
    capitalUnavailable: "Capital no disponible"
  },

  ca: {
    updated: "Temps actualitzat",
    noData: "Sense dades meteorològiques",
    notFound: "No trobat",
    reviewJson: "Revisa el nom de la comarca al JSON",
    capitalUnavailable: "Capital no disponible"
  }
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return map[char];
  });
}
// Funciones relacionadas con la animación del panel lateral
function startAsideAnimation() {
  weatherPanel.classList.remove("is-revealing");
  weatherPanel.classList.add("is-updating");
}

function revealAsideSections() {
  window.setTimeout(() => {
    weatherPanel.classList.remove("is-updating");

    requestAnimationFrame(() => {
      weatherPanel.classList.add("is-revealing");
    });
  }, 120);
}

// Funciones relacionadas con el tooltip del mapa
function showMapTooltip(event, comarcaName) {
  const item = getWeatherForComarca(comarcaName);
  const selectedComarca = selectedPath?.dataset.comarca;

  if (
    !item ||
    (selectedComarca && normalize(selectedComarca) === normalize(comarcaName))
  ) {
    hideMapTooltip();
    return;
  }

  const weather = item.weather || {};

  tooltipComarca.textContent = item.comarca;
  tooltipCapital.textContent = item.capital || "Capital no disponible";
  tooltipIcon.src = weatherCodeToIcon(weather.weatherCode);
  tooltipTemp.textContent = `${valueOrDash(weather.temperature)}°`;

  moveMapTooltip(event);
  mapTooltip.classList.add("is-visible");
  mapTooltip.setAttribute("aria-hidden", "false");
}

function moveMapTooltip(event) {
  const rect = mapStage.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  mapTooltip.style.left = `${x}px`;
  mapTooltip.style.top = `${y}px`;
}

function hideMapTooltip() {
  mapTooltip.classList.remove("is-visible");
  mapTooltip.setAttribute("aria-hidden", "true");
}

function loadedRegionsText(count) {
  const lang = getCurrentLanguage();

  const map = {
    es: `${count} comarcas cargadas`,
    ca: `${count} comarques carregades`
  };

  return map[lang] || map.es;
}

window.addEventListener("app:language-change", () => {
  const count = document.querySelectorAll(".comarca-path").length;

  if (selectedComarcaName) {
    updatePanel(selectedComarcaName);
  }

  if (count > 0) {
    statusEl.textContent = loadedRegionsText(count);
  }

});


function isAudioEnabled() {
  return localStorage.getItem(AUDIO_KEY) === "true";
}

function speakSelectedComarca(comarcaName) {
  if (!isAudioEnabled()) return;
  if (!("speechSynthesis" in window)) return;

  const item = getWeatherForComarca(comarcaName);

  if (!item) return;

  const weather = item.weather || {};
  const lang = getCurrentLanguage();

  const text = buildSpeechText(item, weather, lang);

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = lang === "ca" ? "ca-ES" : "es-ES";
  utterance.voice = getPreferredVoice(lang);
  utterance.rate = 0.95;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}



function buildSpeechText(item, weather, lang) {
  if (lang === "ca") {
    return [
      `Comarca ${item.comarca}.`,
      `Capital ${item.capital}.`,
      `Temps ${weatherCodeToDescription(weather.weatherCode)}.`,
      `Temperatura ${valueOrDash(weather.temperature)} graus.`,
      `Humitat ${valueOrDash(weather.humidity)} per cent.`,
      `Vent de ${valueOrDash(weather.windSpeed)} quilòmetres per hora.`,
      `Sensació tèrmica de ${valueOrDash(weather.apparentTemperature)} graus.`,
      `Probabilitat de pluja ${valueOrDash(weather.today?.rainProbability)} per cent.`,
      `Pressió ${valueOrDash(weather.pressure)} hectopascals.`
    ].join(" ");
  }

  return [
    `Comarca ${item.comarca}.`,
    `Capital ${item.capital}.`,
    `Tiempo ${weatherCodeToDescription(weather.weatherCode)}.`,
    `Temperatura ${valueOrDash(weather.temperature)} grados.`,
    `Humedad ${valueOrDash(weather.humidity)} por ciento.`,
    `Viento de ${valueOrDash(weather.windSpeed)} kilómetros por hora.`,
    `Sensación térmica de ${valueOrDash(weather.apparentTemperature)} grados.`,
    `Probabilidad de lluvia ${valueOrDash(weather.today?.rainProbability)} por ciento.`,
    `Presión ${valueOrDash(weather.pressure)} hectopascales.`
  ].join(" ");
}

function getPreferredVoice(lang) {
  if (!("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();

  // console.log(
  //   voices.map((voice) => ({
  //     name: voice.name,
  //     lang: voice.lang
  //   }))
  // );

  if (lang === "ca") {
    return (
      voices.find((voice) =>
        voice.lang.toLowerCase() === "ca-es"
      ) ||

      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("ca")
      ) ||

      voices.find((voice) =>
        voice.name.toLowerCase().includes("catal")
      ) ||

      null
    );
  }

  return (
    voices.find((voice) =>
      voice.lang.toLowerCase() === "es-es"
    ) ||

    voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("es")
    ) ||

    null
  );
}

