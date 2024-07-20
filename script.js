const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

$(document).ready(function () {
    // Show the notification
    var notification = document.getElementById("welcome-notification");
    var closeBtn = document.getElementById("close-notification");

    // Display the notification
    notification.style.display = "block";

    // Close the notification when the user clicks on <button> (x)
    closeBtn.onclick = function() {
        notification.style.display = "none";
    }

    // Automatically hide the notification after a few seconds (optional)
    setTimeout(function() {
        notification.style.display = "none";
    }, 5000); // Hide after 5 seconds

    
});

$(document).ready(function () {
    weatherFn('Barrackpore');
});

async function weatherFn(cName) {
    const weatherTemp = `${weatherUrl}?q=${cName}&appid=${apiKey}&units=metric`;
    const forecastTemp = `${forecastUrl}?q=${cName}&appid=${apiKey}&units=metric`;
    try {
        const weatherRes = await fetch(weatherTemp);
        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(forecastTemp);
        const forecastData = await forecastRes.json();

        if (weatherRes.ok && forecastRes.ok) {
            await weatherShowFn(weatherData, forecastData);
            renderChart(forecastData);
            updateMap(weatherData.coord.lat, weatherData.coord.lon);
        } else {
            alert('City not found. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function weatherShowFn(data, forecastData) {
    $('#city-name').text(data.name);
    $('#date').text(moment().format('MMMM Do YYYY, h:mm:ss a'));
    $('#temperature').html(`${data.main.temp}°C`);
    $('#description').text(data.weather[0].description);
    $('#wind-speed').html(`Wind Speed: ${data.wind.speed} m/s`);

    const sunriseTime = moment.unix(data.sys.sunrise).format('h:mm:ss a');
    const sunsetTime = moment.unix(data.sys.sunset).format('h:mm:ss a');
    $('#sunrise').html(`Sunrise: ${sunriseTime}`);
    $('#sunset').html(`Sunset: ${sunsetTime}`);
    
    $('#pressure').html(`Air Pressure: ${data.main.pressure} hPa`);
    
    // Calculate the chance of rain
    const rainChance = await calculateRainChance(data.coord.lat, data.coord.lon);
    $('#rain-chance').html(`Chance of Rain: ${rainChance}%`);

    $('#weather-info').fadeIn();
}

async function calculateRainChance(lat, lon) {
    const forecastTemp = `${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(forecastTemp);
        const forecastData = await response.json();

        // Calculate the average chance of rain
        const forecast = forecastData.list;
        let totalPop = 0;
        let count = 0;

        forecast.forEach(item => {
            if (item.pop) {
                totalPop += item.pop;
                count++;
            }
        });

        if (count > 0) {
            return Math.round((totalPop / count) * 100); // Return percentage
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        return 0;
    }
}

function renderChart(data) {
    const labels = data.list.map(item => moment(item.dt_txt).format('MMM D, hA'));
    const temperatures = data.list.map(item => item.main.temp);

    const ctx = document.getElementById('temperature-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

