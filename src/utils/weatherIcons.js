import clearDay from "@meteocons/svg/fill/clear-day.svg";
import partlyCloudy from "@meteocons/svg/fill/partly-cloudy-day.svg";
import cloudy from "@meteocons/svg/fill/cloudy.svg";
import fog from "@meteocons/svg/fill/fog.svg";
import drizzle from "@meteocons/svg/fill/drizzle.svg";
import rain from "@meteocons/svg/fill/rain.svg";
import snow from "@meteocons/svg/fill/snow.svg";
import thunderstormsRain from "@meteocons/svg/fill/thunderstorms-rain.svg";

const WEATHER_CODE_MAP = {
  0: {
    description: {
      es: "Despejado",
      ca: "Serè"
    },
    icon: clearDay.src
  },

  1: {
    description: {
      es: "Principalmente despejado",
      ca: "Principalment serè"
    },
    icon: partlyCloudy.src
  },

  2: {
    description: {
      es: "Parcialmente nublado",
      ca: "Parcialment ennuvolat"
    },
    icon: partlyCloudy.src
  },

  3: {
    description: {
      es: "Nublado",
      ca: "Ennuvolat"
    },
    icon: cloudy.src
  },

  45: {
    description: {
      es: "Niebla",
      ca: "Boira"
    },
    icon: fog.src
  },

  48: {
    description: {
      es: "Niebla con escarcha",
      ca: "Boira gebradora"
    },
    icon: fog.src
  },

  51: {
    description: {
      es: "Llovizna ligera",
      ca: "Plugim lleuger"
    },
    icon: drizzle.src
  },

  53: {
    description: {
      es: "Llovizna",
      ca: "Plugim"
    },
    icon: drizzle.src
  },

  55: {
    description: {
      es: "Llovizna intensa",
      ca: "Plugim intens"
    },
    icon: drizzle.src
  },

  61: {
    description: {
      es: "Lluvia ligera",
      ca: "Pluja lleugera"
    },
    icon: rain.src
  },

  63: {
    description: {
      es: "Lluvia",
      ca: "Pluja"
    },
    icon: rain.src
  },

  65: {
    description: {
      es: "Lluvia intensa",
      ca: "Pluja intensa"
    },
    icon: rain.src
  },

  71: {
    description: {
      es: "Nieve ligera",
      ca: "Neu lleugera"
    },
    icon: snow.src
  },

  73: {
    description: {
      es: "Nieve",
      ca: "Neu"
    },
    icon: snow.src
  },

  75: {
    description: {
      es: "Nieve intensa",
      ca: "Neu intensa"
    },
    icon: snow.src
  },

  77: {
    description: {
      es: "Granizo",
      ca: "Calamarsa"
    },
    icon: snow.src
  },

  80: {
    description: {
      es: "Chubascos ligeros",
      ca: "Ruixats lleugers"
    },
    icon: rain.src
  },

  81: {
    description: {
      es: "Chubascos",
      ca: "Ruixats"
    },
    icon: rain.src
  },

  82: {
    description: {
      es: "Chubascos intensos",
      ca: "Ruixats intensos"
    },
    icon: rain.src
  },

  95: {
    description: {
      es: "Tormenta",
      ca: "Tempesta"
    },
    icon: thunderstormsRain.src
  },

  96: {
    description: {
      es: "Tormenta con granizo",
      ca: "Tempesta amb calamarsa"
    },
    icon: thunderstormsRain.src
  },

  99: {
    description: {
      es: "Tormenta fuerte",
      ca: "Tempesta forta"
    },
    icon: thunderstormsRain.src
  }
};

const DEFAULT_WEATHER = {
  description: {
    es: "Condiciones variables",
    ca: "Condicions variables"
  },
  icon: cloudy.src
};

export function weatherCodeToDescription(code) {
  const weather = WEATHER_CODE_MAP[code] || DEFAULT_WEATHER;

  const language =
    document.documentElement.dataset.language || "es";

  return (
    weather.description[language] ||
    weather.description.es
  );
}

export function weatherCodeToIcon(code) {
  return (WEATHER_CODE_MAP[code] || DEFAULT_WEATHER).icon;
}