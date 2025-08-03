const apiKey = "API_KEY_HERE";
const weatherDetails = document.getElementById("weather-details");
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");

// Fetch and display weather data for a given city
function fetchWeather(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

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

// Display weather data in the UI
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

// Load default city on page load
fetchWeather("New York");
