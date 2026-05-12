export async function fetchWeather(lat, lon) {
   if (
    lat === null ||
    lat === undefined ||
    lon === null ||
    lon === undefined ||
    Number.isNaN(Number(lat)) ||
    Number.isNaN(Number(lon))
  ) {
    throw new Error(`[invalid-coordinates] lat=${lat}, lon=${lon}`);
  }
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m",
    hourly:
      "temperature_2m,weather_code,precipitation_probability",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Europe/Madrid",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
  const errorText = await response.text();

  console.error("[open-meteo-error]", {
    status: response.status,
    url,
    errorText
  });

  throw new Error(`Error loading weather: ${response.status}`);
}

  const data = await response.json();

  return normalizeWeatherData(data);
}

function normalizeWeatherData(data) {
  return {
    temperature: Math.round(data.current?.temperature_2m),
    humidity: data.current?.relative_humidity_2m,
    apparentTemperature: Math.round(data.current?.apparent_temperature),
    weatherCode: data.current?.weather_code,
    windSpeed: Math.round(data.current?.wind_speed_10m),
    pressure: Math.round(data.current?.surface_pressure),

    today: {
      rainProbability:
        data.daily?.precipitation_probability_max?.[0] ?? null,
    },

    hourly: normalizeHourly(data.hourly),
    daily: normalizeDaily(data.daily),
  };
}

function normalizeHourly(hourly) {
  if (!hourly?.time) return [];

  return hourly.time.slice(0, 24).map((time, index) => {
    return {
      label: formatHour(time),
      temperature: Math.round(hourly.temperature_2m?.[index]),
      weatherCode: hourly.weather_code?.[index],
      rainProbability:
        hourly.precipitation_probability?.[index] ?? null,
    };
  });
}

function normalizeDaily(daily) {
  if (!daily?.time) return [];

  return daily.time.slice(0, 7).map((time, index) => {
    return {
      label: formatDay(time),
      weatherCode: daily.weather_code?.[index],
      min: Math.round(daily.temperature_2m_min?.[index]),
      max: Math.round(daily.temperature_2m_max?.[index]),
      rainProbability:
        daily.precipitation_probability_max?.[index] ?? null,
    };
  });
}

function formatHour(value) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDay(value) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
  }).format(new Date(value));
}