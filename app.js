const apiKey = "API_KEY_HERE";
const defaultCity = "New York";

// DOM elements
const weatherDetails = document.getElementById("weather-details");
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const forecastCards = document.getElementById("forecast-cards");


// Build the OpenWeather API URL for a city
function buildApiUrl(city) {
  return `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;
}

// Fetch and display weather data
function fetchWeather(city) {
  const apiUrl = buildApiUrl(city);

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      return response.json();
    })
    .then(data => {
      displayWeather(data);
      fetchForecast(city); // <-- NEW
    })
    .catch(error => {
      console.error("Error:", error);
      weatherDetails.innerHTML = `<p>Could not retrieve weather for "${city}".</p>`;
      forecastCards.innerHTML = "";
    });
}

function fetchForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;

  fetch(forecastUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch forecast data");
      }
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

function displayForecast(data) {
  forecastCards.innerHTML = ""; // Clear previous content

  const daily = {};

  // Extract 1 forecast per day at 12:00:00
  data.list.forEach(item => {
    if (item.dt_txt.includes("12:00:00")) {
      const date = item.dt_txt.split(" ")[0];
      daily[date] = item;
    }
  });

  // Render up to 5 days
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


// Display basic weather information in the UI
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
  updateBackground(data.weather[0].main);

}

// Handle search form submission
searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    cityInput.value = "";
  }
});

// Load default city's weather on page load
fetchWeather(defaultCity);

function updateBackground(condition) {
  const body = document.body;

  // Reset all classes
  body.className = "";

  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes("cloud")) {
    body.classList.add("cloudy");
  } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
    body.classList.add("rainy");
  } else if (conditionLower.includes("clear")) {
    body.classList.add("sunny");
  } else if (conditionLower.includes("snow")) {
    body.classList.add("snowy");
  } else {
    body.classList.add("default-weather");
  }
}
