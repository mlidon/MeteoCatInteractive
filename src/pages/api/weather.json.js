import { comarquesWeatherPoints } from "../../data/comarquesWeatherPoints.js";

export const prerender = true;

let cachedPayload = null;
let cachedAt = 0;

const CACHE_TTL = 1000 * 60 * 60;

export async function GET() {
  const now = Date.now();

  if (cachedPayload && now - cachedAt < CACHE_TTL) {
    return json(cachedPayload);
  }

  try {
    const weather = await fetchWeatherForComarques();

    const payload = {
      updatedAt: new Date().toISOString(),
      source: "Open-Meteo",
      cacheSeconds: CACHE_TTL / 1000,
      items: weather
    };

    cachedPayload = payload;
    cachedAt = now;

    return json(payload);
  } catch (error) {
    console.error("[weather-api]", error);

    if (cachedPayload) {
      return json({
        ...cachedPayload,
        stale: true
      });
    }

    return json(
      {
        error: "weather_fetch_failed",
        message: "No se pudo obtener la información meteorológica."
      },
      500
    );
  }
}

async function fetchWeatherForComarques() {
  const results = [];

  for (const point of comarquesWeatherPoints) {
    try {
      const latitude = Number(point.latitude);
      const longitude = Number(point.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        console.warn("[weather-api] Coordenadas inválidas:", point);
        continue;
      }

      const url = buildOpenMeteoUrl({
        ...point,
        latitude,
        longitude
      });

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("[weather-api] Open-Meteo error:", {
          comarca: point.comarca,
          status: response.status,
          body: errorText
        });
        continue;
      }

      const data = await response.json();

      results.push({
        id: point.id,
        comarca: point.comarca,
        capital: point.capital,
        latitude,
        longitude,
        image: point.image || "/cities/placeholder.webp",
        weather: normalizeWeather(data)
      });
    } catch (error) {
      console.warn("[weather-api] Error en comarca:", point.comarca, error);
    }
  }

  if (results.length === 0) {
    throw new Error("No se pudo cargar ninguna comarca.");
  }

  return results;
}

function buildOpenMeteoUrl(point) {
  const params = new URLSearchParams({
    latitude: String(point.latitude),
    longitude: String(point.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "pressure_msl"
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max"
    ].join(","),
    timezone: "Europe/Madrid"
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function normalizeWeather(data) {
  const current = data.current || {};
  const hourly = data.hourly || {};
  const daily = data.daily || {};

  return {
    temperature: round(current.temperature_2m),
    apparentTemperature: round(current.apparent_temperature),
    humidity: current.relative_humidity_2m ?? null,
    weatherCode: current.weather_code ?? null,
    windSpeed: round(current.wind_speed_10m),
    windDirection: current.wind_direction_10m ?? null,
    pressure: round(current.pressure_msl),

    today: {
      max: round(daily.temperature_2m_max?.[0]),
      min: round(daily.temperature_2m_min?.[0]),
      rainProbability: daily.precipitation_probability_max?.[0] ?? null,
      weatherCode: daily.weather_code?.[0] ?? null
    },

    hourly: normalizeHourlyForecast(hourly),

    daily: normalizeDailyForecast(daily)
  };
}

function normalizeHourlyForecast(hourly) {
  const times = hourly.time || [];
  const temperatures = hourly.temperature_2m || [];
  const weatherCodes = hourly.weather_code || [];
  const rainProbabilities = hourly.precipitation_probability || [];
  const windSpeeds = hourly.wind_speed_10m || [];

  const now = new Date();
  const currentHour = now.getHours();

  const items = times
    .map((time, index) => {
      const date = new Date(time);
      const hour = date.getHours();

      return {
        rawTime: time,
        date,
        hour,
        label: hour === currentHour ? "Ahora" : `${String(hour).padStart(2, "0")}h`,
        temperature: round(temperatures[index]),
        weatherCode: weatherCodes[index] ?? null,
        rainProbability: rainProbabilities[index] ?? null,
        windSpeed: round(windSpeeds[index])
      };
    })
    .filter((item) => item.date >= new Date(now.getTime() - 60 * 60 * 1000))
    .slice(0, 6);

  return items;
}

function normalizeDailyForecast(daily) {
  const times = daily.time || [];
  const maxTemperatures = daily.temperature_2m_max || [];
  const minTemperatures = daily.temperature_2m_min || [];
  const weatherCodes = daily.weather_code || [];
  const rainProbabilities = daily.precipitation_probability_max || [];

  return times.slice(0, 7).map((time, index) => {
    const date = new Date(time);

    return {
      rawDate: time,
      label: index === 0 ? "Hoy" : formatWeekday(date),
      min: round(minTemperatures[index]),
      max: round(maxTemperatures[index]),
      weatherCode: weatherCodes[index] ?? null,
      rainProbability: rainProbabilities[index] ?? null
    };
  });
}

function formatWeekday(date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short"
  })
    .format(date)
    .replace(".", "");
}

function round(value) {
  if (typeof value !== "number") return null;
  return Math.round(value);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}