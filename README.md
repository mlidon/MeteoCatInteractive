# Catalunya Meteo Map

Interactive weather application for Catalunya built with Astro and modern frontend technologies.
The project combines an interactive SVG map with real-time weather data, multilingual support, accessibility features, and responsive UI design.

<img width="820" height="557" alt="image" src="https://github.com/user-attachments/assets/9bf6d606-6436-4c4a-82b1-486fdd6eadfe" />

---

## Features

* Interactive SVG map of Catalunya regions
* Real-time weather information
* Dynamic weather tooltips
* Light / Dark mode
* Multilanguage support (ES / CA)
* Voice reader accessibility
* Responsive mobile-first layout
* Smooth UI animations
* Fully frontend architecture

---

## Tech Stack

* Astro
* JavaScript (Vanilla)
* Modern CSS
* SVG Rendering
* Open Meteo API
* Web Speech API
* Tabler Icons

---

## Preview

### Desktop

```txt id="wru7r7"
Interactive weather dashboard with animated sidebar,
SVG comarca selection and real-time forecast data.
```

### Mobile

```txt id="8xg3y6"
Optimized mobile interface with settings popover,
responsive weather cards and touch interaction support.
```

---

## Installation

### Clone repository

```bash id="piv5ix"
git clone https://github.com/yourusername/catalunya-meteo-map.git

cd catalunya-meteo-map
```

### Install dependencies

```bash id="n5a9ow"
npm install
```

### Run development server

```bash id="rmv0fe"
npm run dev
```

Application available at:

```txt id="j93k4v"
http://localhost:4321
```

---

## Project Structure

```txt id="n5yt5j"
src/
 ├── components/
 ├── pages/
 ├── scripts/
 ├── styles/
 └── utils/

public/
 ├── api/
 ├── cities/
 └── maps/
```

---

## Main Functionalities

### Interactive Map

* SVG rendering from GeoJSON
* Hover and comarca selection
* Dynamic weather tooltips
* Random initial region selection

### Weather Panel

* Current temperature
* Humidity
* Wind speed
* Thermal sensation
* Atmospheric pressure
* Rain probability
* Hourly forecast
* Weekly forecast

### Internationalization

Supported languages:

* Spanish
* Catalan

Architecture prepared for future scalability.

---

## Accessibility

* Keyboard navigation
* Voice reading system
* ARIA labels
* High contrast support
* Fully responsive layout

---

## Available Scripts

### Development

```bash id="3l0bbx"
npm run dev
```

### Production Build

```bash id="5b3htj"
npm run build
```

### Local Preview

```bash id="j0dzvv"
npm run preview
```

---

## Roadmap

### Planned Improvements

* Full modular architecture
* Advanced accessibility improvements
* PWA support
* Offline caching
* Additional languages
* Performance optimizations
* Enhanced animations

---

## Git Ignore

The project automatically ignores:

* node_modules
* dist
* .env files
* logs
* cache files
* temporary files

---

## License

MIT License

---

## Author

Developed by Marc Lidón.
