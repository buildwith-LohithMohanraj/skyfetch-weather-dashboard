function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");
    this.forecastDisplay = document.getElementById("forecast-display");
    this.historyList = document.getElementById("history-list");
    this.clearHistoryBtn = document.getElementById("clear-history");
    this.themeToggle = document.getElementById("theme-toggle");

    this.init();
}

WeatherApp.prototype.init = function () {

    this.searchBtn.addEventListener("click", () => {
        const city = this.cityInput.value.trim();
        if (city) this.fetchWeather(city);
    });

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const city = this.cityInput.value.trim();
            if (city) this.fetchWeather(city);
        }
    });

    this.clearHistoryBtn.addEventListener("click", () => {
        localStorage.removeItem("history");
        this.renderHistory();
    });

    this.themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            this.themeToggle.textContent = "☀️ Light Mode";
            localStorage.setItem("theme", "dark");
        } else {
            this.themeToggle.textContent = "🌙 Dark Mode";
            localStorage.setItem("theme", "light");
        }
    });

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        this.themeToggle.textContent = "☀️ Light Mode";
    }

    const savedCity = localStorage.getItem("lastCity");
    if (savedCity) this.fetchWeather(savedCity);

    this.renderHistory();
};

WeatherApp.prototype.fetchWeather = async function (city) {
    try {
        this.weatherDisplay.innerHTML = '<div class="loader"></div>';
        this.forecastDisplay.innerHTML = '';

        const weatherRes = await fetch(
            `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`
        );
        const weatherData = await weatherRes.json();

        if (weatherData.cod !== 200) {
            this.weatherDisplay.innerHTML = "<p>City not found.</p>";
            return;
        }

        const forecastRes = await fetch(
            `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`
        );
        const forecastData = await forecastRes.json();

        this.displayWeather(weatherData);
        this.displayForecast(forecastData);

        localStorage.setItem("lastCity", city);
        this.saveToHistory(city);

    } catch (error) {
        this.weatherDisplay.innerHTML = "<p>Error fetching data.</p>";
    }
};

WeatherApp.prototype.displayWeather = function (data) {
    this.weatherDisplay.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
        <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
        <p><strong>Condition:</strong> ${data.weather[0].description}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
    `;
};

WeatherApp.prototype.displayForecast = function (data) {
    this.forecastDisplay.innerHTML = "";

    const dailyData = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyData.slice(0, 5).forEach(day => {
        const card = document.createElement("div");
        card.classList.add("forecast-card");

        card.innerHTML = `
            <p><strong>${new Date(day.dt_txt).toLocaleDateString()}</strong></p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
            <p>${day.main.temp}°C</p>
        `;

        this.forecastDisplay.appendChild(card);
    });
};

WeatherApp.prototype.saveToHistory = function (city) {
    let history = JSON.parse(localStorage.getItem("history")) || [];

    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("history", JSON.stringify(history));
    }

    this.renderHistory();
};

WeatherApp.prototype.renderHistory = function () {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    this.historyList.innerHTML = "";

    history.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.addEventListener("click", () => this.fetchWeather(city));
        this.historyList.appendChild(li);
    });
};

const app = new WeatherApp("e18ea202c25b3a171c5ea14161252da8");