// ================= Configuration =================
const API_KEY = 'e18ea202c25b3a171c5ea14161252da8';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');

// ================= Loading State =================
function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
}

// ================= Error Handling =================
function showError(message) {
    weatherDisplay.innerHTML = `
        <div class="error-message">
            <h2>⚠️ Error</h2>
            <p>${message}</p>
        </div>
    `;
    cityInput.focus();
}

// ================= Display Weather =================
function displayWeather(data) {
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                 alt="${data.weather[0].description}" 
                 class="weather-icon">
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <p class="description">${data.weather[0].description}</p>
        </div>
    `;

    weatherDisplay.innerHTML = weatherHTML;
    cityInput.focus();
}

// ================= Fetch Weather =================
async function getWeather(city) {

    showLoading();

    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);

    } catch (error) {
        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling.');
        } else {
            showError('Something went wrong. Please try again later.');
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = '🔍 Search';
    }
}

// ================= Search Logic =================
function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    if (city.length < 2) {
        showError('City name must be at least 2 characters.');
        return;
    }

    getWeather(city);
    cityInput.value = '';
}

searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});