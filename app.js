const apiKey = "API_KEY_HERE";
const defaultCity = "New York";

// DOM elements
const weatherDetails = document.getElementById("weather-details");
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");

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
    })
    .catch(error => {
      console.error("Error:", error);
      weatherDetails.innerHTML = `<p>Could not retrieve weather for "${city}".</p>`;
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
