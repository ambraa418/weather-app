const apiKey = '4ff547d0e0204170c4b48ea3818faefa'; // Replace with your actual API key

$(document).ready(function () {
    console.log('Weather App loaded successfully!');

    // Event listener for the search button
    $('#searchBtn').click(function () {
        const city = $('#cityInput').val();
        if (city) {
            getWeather(city); // Call the function with the city name
        } else {
            alert('Please enter a city name');
        }
    });
});

// Function to fetch weather data from the API
function getWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const { lat, lon } = data.coord;
            displayWeather(data);
            getHourlyForecast(lat, lon);
            getUVIndex(lat, lon);
            getAirQuality(lat, lon);
            suggestOutfit(data.weather[0].main, data.main.temp);
        },
        error: function () {
            alert('City not found. Please try again.');
        }
    });
}

// Calculate local time
function getLocalTime(timezoneOffset) {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utcTime + timezoneOffset * 1000);
    return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Display weather data in containers
function displayWeather(data) {
    const weatherResult = $('#weatherResult');
    weatherResult.empty(); // Clear previous content

    const cityName = data.name;
    const temperature = data.main.temp;
    const feelsLike = data.main.feels_like;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const description = data.weather[0].description;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const localTime = getLocalTime(data.timezone);

    // Display weather icon at the top, making it larger
    const iconContainer = `
        <div class="weather-icon-container">
            <img src="${icon}" alt="Weather Icon">
        </div>
    `;
    weatherResult.append(iconContainer);

    // Create individual containers for each weather detail
    const temperatureCard = `
        <div class="weather-card">
            <h3>Temperature</h3>
            <p>${temperature} °C</p>
        </div>
    `;
    const feelsLikeCard = `
        <div class="weather-card">
            <h3>Feels Like</h3>
            <p>${feelsLike} °C</p>
        </div>
    `;
    const conditionCard = `
        <div class="weather-card">
            <h3>Condition</h3>
            <p>${description}</p>
        </div>
    `;
    const humidityCard = `
        <div class="weather-card">
            <h3>Humidity</h3>
            <p>${humidity}%</p>
        </div>
    `;
    const windSpeedCard = `
        <div class="weather-card">
            <h3>Wind Speed</h3>
            <p>${windSpeed} m/s</p>
        </div>
    `;
    const sunriseCard = `
        <div class="weather-card">
            <h3>Sunrise</h3>
            <p>${sunrise}</p>
        </div>
    `;
    const sunsetCard = `
        <div class="weather-card">
            <h3>Sunset</h3>
            <p>${sunset}</p>
        </div>
    `;
    const localTimeCard = `
        <div class="weather-card">
            <h3>Local Time</h3>
            <p>${localTime}</p>
        </div>
    `;

    // Append each card to the weatherResult
    weatherResult.append(temperatureCard, feelsLikeCard, conditionCard, humidityCard, windSpeedCard, sunriseCard, sunsetCard, localTimeCard);
}

// Fetch hourly forecast
function getHourlyForecast(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const hourlyData = data.list.slice(0, 5); // Get the next 5 hours
            let hourlyHTML = '<h3>Hourly Forecast</h3>';

            hourlyData.forEach((hour) => {
                const time = new Date(hour.dt * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const temp = hour.main.temp;
                const description = hour.weather[0].description;
                const icon = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`;

                hourlyHTML += `
                    <div>
                        <p><strong>${time}</strong></p>
                        <img src="${icon}" alt="Weather Icon">
                        <p>${temp} °C, ${description}</p>
                    </div>
                `;
            });

            $('#weatherResult').append(hourlyHTML);
        },
        error: function () {
            console.error('Error fetching hourly forecast.');
        }
    });
}

// Fetch UV index
function getUVIndex(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            $('#weatherResult').append(`<p>UV Index: ${data.value}</p>`);
        },
        error: function () {
            console.error('Error fetching UV index.');
        }
    });
}

// Fetch air quality index (AQI)
function getAirQuality(lat, lon) {
    const apiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            const aqi = data.list[0].main.aqi;
            const aqiDescription = getAQIDescription(aqi);
            $('#weatherResult').append(`<p>Air Quality: ${aqiDescription}</p>`);
        },
        error: function () {
            console.error('Error fetching air quality index.');
        }
    });
}

// Interpret AQI value
function getAQIDescription(aqi) {
    switch (aqi) {
        case 1: return 'Good';
        case 2: return 'Fair';
        case 3: return 'Moderate';
        case 4: return 'Poor';
        case 5: return 'Very Poor';
        default: return 'Unknown';
    }
}

// Suggest outfit based on weather
function suggestOutfit(condition, temperature) {
    let suggestion = '';

    if (temperature < 5) {
        suggestion = 'Wear a heavy coat, gloves, and a scarf.';
    } else if (temperature < 15) {
        suggestion = 'Wear a jacket or sweater.';
    } else if (temperature > 25) {
        suggestion = 'Light clothing is fine.';
    } else {
        suggestion = 'Dress in layers to stay comfortable.';
    }

    if (condition.includes('rain')) {
        suggestion += ' Don’t forget an umbrella.';
    } else if (condition.includes('snow')) {
        suggestion += ' Wear boots and warm accessories.';
    }

    $('#weatherResult').append(`<p>Outfit Suggestion: ${suggestion}</p>`);
}
