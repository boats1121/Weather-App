const apiKey = "YOUR_API_KEY_HERE";
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const weatherDetails = document.getElementById("weather-details");
const forecastCards = document.getElementById("forecast-cards");
const searchHistory = document.getElementById("search-history");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    saveSearch(city);
    cityInput.value = "";
  }
});

function fetchWeather(city) {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

  Promise.all([
    fetch(currentUrl).then(res => res.json()),
    fetch(forecastUrl).then(res => res.json())
  ])
    .then(([currentData, forecastData]) => {
      displayCurrentWeather(currentData);
      displayForecast(forecastData);
    })
    .catch(err => {
      weatherDetails.innerHTML = `<p>Error fetching weather data.</p>`;
      forecastCards.innerHTML = "";
    });
}

function displayCurrentWeather(data) {
  if (data.cod !== 200) {
    weatherDetails.innerHTML = `<p>City not found.</p>`;
    return;
  }

  const html = `
    <p><strong>${data.name}</strong></p>
    <p>Temp: ${data.main.temp}°F</p>
    <p>Condition: ${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind: ${data.wind.speed} mph</p>
  `;
  weatherDetails.innerHTML = html;
}

function displayForecast(data) {
  if (data.cod !== "200") {
    forecastCards.innerHTML = `<p>Unable to load forecast.</p>`;
    return;
  }

  forecastCards.innerHTML = "";

  const forecastMap = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!forecastMap[date] && item.dt_txt.includes("12:00:00")) {
      forecastMap[date] = item;
    }
  });

  Object.values(forecastMap).slice(0, 5).forEach(item => {
    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <p>${new Date(item.dt_txt).toLocaleDateString()}</p>
      <p>${item.main.temp}°F</p>
      <p>${item.weather[0].main}</p>
    `;
    forecastCards.appendChild(card);
  });
}

function saveSearch(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
  history.unshift(city);
  history = history.slice(0, 5);
  localStorage.setItem("weatherHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  searchHistory.innerHTML = "";
  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => fetchWeather(city));
    searchHistory.appendChild(li);
  });
}

renderHistory();
