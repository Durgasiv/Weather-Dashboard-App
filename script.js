const apiKey = "YOUR_API_KEY_HERE";

let chart;

// 🌙 Theme toggle
function toggleTheme() {
    document.body.classList.toggle("dark");
}

// 📍 Get location weather
function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        getWeatherByCoords(latitude, longitude);
    });
}

// 🌍 Fetch weather
function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) return;

    saveHistory(city);
    fetchWeatherData(`q=${city}`);
}

// 🌍 Fetch by coordinates
function getWeatherByCoords(lat, lon) {
    fetchWeatherData(`lat=${lat}&lon=${lon}`);
}

// 🔥 Core fetch function
function fetchWeatherData(query) {
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            loader.style.display = "none";

            if (data.cod !== 200) {
                alert("Error fetching data");
                return;
            }

            document.getElementById("weatherCard").style.display = "block";

            document.getElementById("cityName").innerText = data.name;
            document.getElementById("temp").innerText = data.main.temp + "°C";
            document.getElementById("desc").innerText = data.weather[0].main;
            document.getElementById("humidity").innerText = "Humidity: " + data.main.humidity + "%";
            document.getElementById("wind").innerText = "Wind: " + data.wind.speed;

            document.getElementById("weatherIcon").src =
                `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            setWeatherAnimation(data.weather[0].main);

            getForecast(query);
        });
}

// 📊 Forecast + Chart
function getForecast(query) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {

            const forecastDiv = document.getElementById("forecast");
            forecastDiv.innerHTML = "";

            const temps = [];
            const labels = [];

            data.list.filter(x => x.dt_txt.includes("12:00:00"))
                .slice(0,5)
                .forEach(day => {

                    const date = new Date(day.dt_txt);
                    const name = date.toLocaleDateString("en-US",{weekday:"short"});

                    temps.push(day.main.temp);
                    labels.push(name);

                    forecastDiv.innerHTML += `
                        <div class="forecast-card">
                            <p>${name}</p>
                            <p>${day.main.temp}°C</p>
                        </div>`;
                });

            renderChart(labels, temps);
        });
}

// 📈 Chart
function renderChart(labels, temps) {
    const ctx = document.getElementById("tempChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Temperature",
                data: temps
            }]
        }
    });
}

// 💾 Search history
function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("history", JSON.stringify(history));
    }
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const div = document.getElementById("history");

    div.innerHTML = history.map(city =>
        `<button onclick="getWeatherFromHistory('${city}')">${city}</button>`
    ).join("");
}

function getWeatherFromHistory(city) {
    document.getElementById("cityInput").value = city;
    getWeather();
}

// 🎥 Animation
function setWeatherAnimation(type) {
    const bg = document.getElementById("weatherAnimation");
    bg.className = "";

    if (type.includes("Rain")) bg.classList.add("rainy");
    else if (type.includes("Snow")) bg.classList.add("snowy");
    else bg.classList.add("sunny");
}

// Init
renderHistory();