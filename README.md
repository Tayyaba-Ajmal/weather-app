# weather-app
A modern, responsive weather application built with **HTML5**, **CSS3**, and **Vanilla JavaScript (ES Modules)**. It provides real-time weather information and a 5-day forecast using the OpenWeatherMap API, wrapped in a clean, minimal interface inspired by modern SaaS products.

## Features

- Search weather by city
- Get weather for your current location
- Real-time weather conditions
- 5-day weather forecast
- Animated temperature trend chart
- Clean and responsive UI
- Recent search history
- Accessible and keyboard-friendly design
- Lightweight with no frameworks or build tools

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES2020)
- ES Modules

## API

This project uses the **OpenWeatherMap API** for:

- Current weather
- 5-day forecast
- Geocoding
- Reverse geocoding

Get your free API key here:

https://openweathermap.org/api
After getting your key paste it on the app and then search the 
weather of any city.

## Getting Started

Since the project uses ES Modules, run it with a local server.

Using Python:

```bash
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

On the first launch, enter your **OpenWeatherMap API key**. It is stored locally in your browser using `localStorage`.

## Project Structure

```
├── index.html
├── css/
├── js/
│   ├── api.js
│   ├── state.js
│   ├── ui.js
│   ├── trendChart.js
│   ├── icons.js
│   └── main.js
└── assets/
```

## Browser Support

- Chrome
- Edge
- Firefox
- Safari
