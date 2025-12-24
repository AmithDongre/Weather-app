const apiKey = "f5b94f15b4e3165048d2cdee26fa3dd7";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");
const errorMsg = document.getElementById("errorMsg");
const loadingMsg = document.getElementById("loadingMsg");
const forecastEl = document.getElementById("forecast");
const themeToggle = document.getElementById("themeToggle");

/* =========================
   SEARCH EVENTS
========================= */
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) getWeather(city);
    }
});

/* =========================
   AUTO LOCATION (ON LOAD)
========================= */
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            getWeatherByCoords(
                position.coords.latitude,
                position.coords.longitude
            );
        });
    }
});

/* =========================
   FETCH WEATHER
========================= */
async function getWeather(city) {
    fetchData(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`,
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
}

async function getWeatherByCoords(lat, lon) {
    fetchData(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
}

async function fetchData(currentUrl, forecastUrl) {
    errorMsg.textContent = "";
    loadingMsg.style.display = "block";
    weatherCard.style.display = "none";
    forecastEl.innerHTML = "";

    try {
        const currentRes = await fetch(currentUrl);
        const currentData = await currentRes.json();

        if (currentData.cod !== 200) {
            throw new Error(currentData.message);
        }

        updateCurrentWeather(currentData);

        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();
        updateForecast(forecastData);

    } catch (error) {
        errorMsg.textContent = error.message;
    } finally {
        loadingMsg.style.display = "none";
    }
}

/* =========================
   UPDATE UI
========================= */
function updateCurrentWeather(data) {
    weatherCard.style.display = "block";
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("description").textContent = data.weather[0].description;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
    document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function updateForecast(data) {
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    daily.slice(0, 5).forEach(day => {
        const div = document.createElement("div");
        div.className = "forecast-item";
        div.innerHTML = `
            <p>${new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
            <p>${Math.round(day.main.temp)}°C</p>
        `;
        forecastEl.appendChild(div);
    });
}

/* =========================
   THEME TOGGLE
========================= */
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "🌞";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.textContent = isLight ? "🌞" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
});


