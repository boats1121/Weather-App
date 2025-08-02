const apiKey = "API_KEY_HERE";
const weatherDetails = document.getElementById("weather-details");

// Basic fetchWeather function to get data and render to UI
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
      weatherDetails.innerHTML = "<p>Failed to load weather data.</p>";
    });
}

// Render basic weather info to #weather-details
function displayWeather(data) {
  const html = `
    <p><strong>${data.name}</strong></p>
    <p>Temperature: ${data.main.temp}°F</p>
    <p>Condition: ${data.weather[0].main}</p>
  `;
  weatherDetails.innerHTML = html;
}

// Fetch weather for default city on page load
fetchWeather("New York");
