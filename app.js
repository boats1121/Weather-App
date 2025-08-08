const apiKey = "YOUR_API_KEY_HERE";
const defaultCity = "New York";

// DOM elements
const weatherDetails = document.getElementById("weather-details");
const forecastCards = document.getElementById("forecast-cards");
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchHistory = document.getElementById("search-history");

// Build the OpenWeather API URL for a city
function buildApiUrl(city) {
  return `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;
}

// Fetch and display weather data
function fetchWeather(city, { save = false } = {}) {
  const apiUrl = buildApiUrl(city);

  // Loading indicators for both sections
  weatherDetails.innerHTML = `<div class="spinner"></div><p>Loading current weather...</p>`;
  forecastCards.innerHTML = `<div class="spinner"></div><p>Loading forecast...</p>`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch weather data");
      return response.json();
    })
    .then(data => {
      displayWeather(data);
      // Only save valid, successfully-fetched cities
      if (save) saveSearch(data.name);
      fetchForecast(city);
    })
    .catch(error => {
      console.error("Error:", error);
      weatherDetails.innerHTML = `<p>Could not retrieve weather for "${city}".</p>`;
      forecastCards.innerHTML = "";
    });
}

// Fetch forecast data
function fetchForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;

  fetch(forecastUrl)
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch forecast data");
      return response.json();
    })
    .then(data => {
      displayForecast(data);
    })
    .catch(error => {
      console.error("Forecast error:", error);
      forecastCards.innerHTML = `<p>Unable to load forecast for "${city}".</p>`;
    });
}

// Display current weather
function displayWeather(data) {
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const html = `
    <h3>${data.name}</h3>
    <img src="${iconUrl}" alt="${data.weather[0].description}" />
    <p>Temperature: ${data.main.temp}°F</p>
    <p>Feels Like: ${data.main.feels_like}°F</p>
    <p>Condition: ${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} mph</p>
  `;

  weatherDetails.innerHTML = html;

  // Update background look based on condition
  updateBackground(data.weather[0].main);
}

// Display 5-day forecast
function displayForecast(data) {
  forecastCards.innerHTML = ""; // Clear previous content

  const daily = {};
  // Pick one snapshot per day (12:00:00)
  data.list.forEach(item => {
    if (item.dt_txt.includes("12:00:00")) {
      const date = item.dt_txt.split(" ")[0];
      daily[date] = item;
    }
  });

  Object.values(daily).slice(0, 5).forEach(item => {
    const card = document.createElement("div");
    card.classList.add("forecast-card");

    const date = new Date(item.dt_txt).toLocaleDateString();
    const icon = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    card.innerHTML = `
      <p><strong>${date}</strong></p>
      <img src="${iconUrl}" alt="${item.weather[0].description}" />
      <p>${item.main.temp}°F</p>
      <p>${item.weather[0].main}</p>
    `;

    forecastCards.appendChild(card);
  });
}

// Weather-based background
function updateBackground(condition) {
  const body = document.body;
  body.className = ""; // reset

  const c = condition.toLowerCase();
  if (c.includes("cloud")) body.classList.add("cloudy");
  else if (c.includes("rain") || c.includes("drizzle")) body.classList.add("rainy");
  else if (c.includes("clear")) body.classList.add("sunny");
  else if (c.includes("snow")) body.classList.add("snowy");
  else body.classList.add("default-weather");
}


// Save city to localStorage (dedupe, cap at 5)
function saveSearch(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const normalized = city.toLowerCase();

  history = history.filter(c => c.toLowerCase() !== normalized);
  history.unshift(city);
  history = history.slice(0, 5);

  localStorage.setItem("weatherHistory", JSON.stringify(history));
  renderHistory();
}

// Render clickable history list
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  searchHistory.innerHTML = "";

  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => fetchWeather(city, { save: false }));
    searchHistory.appendChild(li);
  });
}

// Handle search form submit
searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  // Save only if fetch succeeds (handled inside fetchWeather)
  fetchWeather(city, { save: true });
  cityInput.value = "";
});

// Initial load
renderHistory();
fetchWeather(defaultCity, { save: false });
