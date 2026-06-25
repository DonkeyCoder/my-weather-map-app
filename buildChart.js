export function createTempChart(weatherData, locationData) {
  console.log(weatherData);
  //console.log(locationData);

  // Formatting reverse geocoder

  // Destructure values from locationData:
  // - address: default to empty object {} if missing (prevents errors)
  // - display_name: fallback full location string from API

  const { address = {}, display_name } = locationData;

  // Define an ordered list of preferred location field combinations.
  // Each entry is a pair [primary, secondary].
  // The order matters — earlier pairs have higher priority
  const pairs = [
    [address.suburb, address.city],
    [address.road, address.city],
    [address.borough, address.city],
    [address.town, address.state],
    [address.village, address.state],
    [address.hamlet, address.state],
    [address.suburb, address.state],
  ];

  // Helper function to format the location string consistently.
  // - `a` is the primary value (e.g. suburb, road, etc.)
  // - `b` is optional secondary value (e.g. city, state)
  // - If `b` exists, include ", b"; otherwise just show `a`

  const format = (a, b) =>
    `7 day rain forecast:&nbsp;<b class="location-current">${a}${b ? `, ${b}` : ""}</b>`;

  // Find the first pair where BOTH values exist (truthy).
  // `.find()` returns the first matching pair, or undefined if none match
  const match = pairs.find(([a, b]) => a && b);

  // Build the final location text using priority rules:
  // 1. If a valid pair was found → use it
  // 2. Otherwise, if only city exists → use that
  // 3. Otherwise, fall back to display_name (full raw string)

  const locationText = match
    ? format(...match) // spread the pair into (a, b)
    : address.city
      ? format(address.city)
      : format(display_name);

  //console.log(locationText);

  /**
   * address: 
ISO3166-2-lvl4: "AU-NSW"
building: "Essential Energy"
city: "Port Macquarie"
country: "Australia"
country_code: "au"
house_number: "8"
postcode: "2444"
road: "Buller Street"
state: "New South Wales"
   */
  // ENDS Formatting reverse geocoder

  let dailyTime = weatherData.daily.time;
  let dialyRainSum = weatherData.daily.rain_sum;
  let dailyMaxTemp = weatherData.daily.temperature_2m_max;

  // CREATING LOCATION LABEL WITH GEOCODER DATA
  // Check if the label already exists
  const existingLabel = document.getElementById("location-label");
  if (existingLabel) {
    existingLabel.remove();
  }

  // Creating a label element to show what areas are being compared
  const locationLabel = document.createElement("div");
  locationLabel.innerHTML = locationText;
  locationLabel.id = "location-label";

  // Append the newly created element to the body of the site
  document.body.appendChild(locationLabel);

  // Assuming these arrays already exist:
  // time, temperature_2m_max, temperature_2m_min, rain_sum

  // CREATING CHART
  const canvas = document.getElementById("temperatureChart");

  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById("temperatureChart").getContext("2d");

  new Chart(ctx, {
    type: "bar", // base type (we mix types below)
    data: {
      labels: dailyTime,
      datasets: [
        {
          label: "Rain (mm)",
          data: dialyRainSum,
          type: "bar",
          backgroundColor: "rgba(0, 150, 255, 0.5)",
          borderColor: "rgba(0, 150, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
        {
          label: "Max temperature (°C)",
          data: dailyMaxTemp,
          type: "line",
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          borderColor: "rgba(255, 0, 0, 1)",
          borderWidth: 1,
          yAxisID: "yTemp",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 13, // prevents overcrowding
          },
        },
        yRain: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "Rain (mm)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
        yTemp: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Max temperature (°C)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
      },
    },
  });

  // All your chart config will sit within this function
  //doSomething(chartData);
}

export function createTempCompareChart(prevWeatherData, weatherData) {
  //console.log(weatherData);
  //console.log(prevWeatherData);

  let dailyTime = weatherData.daily.time;
  let dialyRainSum = weatherData.daily.rain_sum;
  let prevDialyRainSum = prevWeatherData.daily.rain_sum;
  let dailyMaxTemp = weatherData.daily.temperature_2m_max;
  let prevDailyMaxTemp = prevWeatherData.daily.temperature_2m_max;

  // Assuming these arrays already exist:
  // time, temperature_2m_max, temperature_2m_min, rain_sum

  const canvas = document.getElementById("temperatureChart");

  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById("temperatureChart").getContext("2d");

  new Chart(ctx, {
    type: "bar", // base type (we mix types below)
    data: {
      labels: dailyTime,
      datasets: [
        // Rain
        {
          label: "Current location: Rain (mm)",
          data: dialyRainSum,
          type: "bar",
          backgroundColor: "rgba(0, 150, 255, 0.5)",
          borderColor: "rgba(0, 150, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
        {
          label: "Previous location: Rain (mm)",
          data: prevDialyRainSum,
          type: "bar",
          backgroundColor: "rgba(150, 0, 255, 0.5)",
          borderColor: "rgba(150, 0, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
        // Temperature
        {
          label: "Current location: Max temperature (°C)",
          data: dailyMaxTemp,
          type: "line",
          backgroundColor: "rgba(0, 150, 255, 0.5)",
          borderColor: "rgba(0, 150, 255, 1)",
          borderWidth: 1,
          yAxisID: "yTemp",
        },
        {
          label: "Previous location: Max temperature (°C)",
          data: prevDailyMaxTemp,
          type: "line",
          backgroundColor: "rgba(150, 0, 255, 0.5)",
          borderColor: "rgba(150, 0, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 13, // prevents overcrowding
          },
        },
        yRain: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "Rain (mm)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
        yTemp: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Max temperature (°C)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
      },
    },
  });

  // All your chart config will sit within this function
  //doSomething(chartData);
}

export function createHistoryCompareChart(prevHistoryData, historyData) {
  //console.log(historyData);
  //console.log(prevHistoryData);

  let dailyTime = historyData.daily.time;
  let dialyRainSum = historyData.daily.rain_sum;
  let prevDialyRainSum = prevHistoryData.daily.rain_sum;
  let dailyMaxTemp = historyData.daily.temperature_2m_max;
  let prevDailyMaxTemp = prevHistoryData.daily.temperature_2m_max;

  // Assuming these arrays already exist:
  // time, temperature_2m_max, temperature_2m_min, rain_sum

  const canvas = document.getElementById("temperatureChart");

  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById("temperatureChart").getContext("2d");

  new Chart(ctx, {
    type: "bar", // base type (we mix types below)
    title: "Historic rain & max temperature",
    data: {
      labels: dailyTime,
      datasets: [
        // Rain
        {
          label: "Current location: Rain (mm)",
          data: dialyRainSum,
          type: "bar",
          backgroundColor: "rgba(0, 150, 255, 0.5)",
          borderColor: "rgba(0, 150, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
        {
          label: "Previous location: Rain (mm)",
          data: prevDialyRainSum,
          type: "bar",
          backgroundColor: "rgba(150, 0, 255, 0.5)",
          borderColor: "rgba(150, 0, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
        // Temperature
        {
          label: "Current location: Max temperature (°C)",
          data: dailyMaxTemp,
          type: "line",
          backgroundColor: "rgba(0, 150, 255, 0.5)",
          borderColor: "rgba(0, 150, 255, 1)",
          borderWidth: 1,
          yAxisID: "yTemp",
        },
        {
          label: "Previous location: Max temperature (°C)",
          data: prevDailyMaxTemp,
          type: "line",
          backgroundColor: "rgba(150, 0, 255, 0.5)",
          borderColor: "rgba(150, 0, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 13, // prevents overcrowding
          },
        },
        yRain: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "Rain (mm)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
        yTemp: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Max temperature (°C)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
      },
    },
  });

  // All your chart config will sit within this function
  //doSomething(chartData);
}

export function createPeriodHistoryCompareChart(
  prevHistoryData,
  historyData,
  timeFrame,
) {
  //console.log(historyData);
  //console.log(prevHistoryData);

  let dailyTime = historyData.daily.time.slice(timeFrame);
  let dialyRainSum = historyData.daily.rain_sum.slice(timeFrame);
  let prevDialyRainSum = prevHistoryData.daily.rain_sum.slice(timeFrame);
  let dailyMaxTemp = historyData.daily.temperature_2m_max.slice(timeFrame);
  let prevDailyMaxTemp =
    prevHistoryData.daily.temperature_2m_max.slice(timeFrame);

  // Assuming these arrays already exist:
  // time, temperature_2m_max, temperature_2m_min, rain_sum

  const canvas = document.getElementById("temperatureChart");

  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById("temperatureChart").getContext("2d");

  new Chart(ctx, {
    type: "bar", // base type (we mix types below)
    title: "Historic rain and temperature",
    data: {
      labels: dailyTime,
      datasets: [
        {
          label: "Current location: Rain (mm)",
          data: dialyRainSum,
          type: "bar",
          backgroundColor: "rgba(0, 150, 255, 0.5)",
          borderColor: "rgba(0, 150, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
        {
          label: "Previous location: Rain (mm)",
          data: prevDialyRainSum,
          type: "bar",
          backgroundColor: "rgba(150, 0, 255, 0.5)",
          borderColor: "rgba(150, 0, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
        // Temperature
        {
          label: "Current location: Max temperature (°C)",
          data: dailyMaxTemp,
          type: "line",
          backgroundColor: "rgba(0, 150, 255, 0.5)",
          borderColor: "rgba(0, 150, 255, 1)",
          borderWidth: 1,
          yAxisID: "yTemp",
        },
        {
          label: "Previous location: Max temperature (°C)",
          data: prevDailyMaxTemp,
          type: "line",
          backgroundColor: "rgba(150, 0, 255, 0.5)",
          borderColor: "rgba(150, 0, 255, 1)",
          borderWidth: 1,
          yAxisID: "yRain",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 13, // prevents overcrowding
          },
        },
        yRain: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "Rain (mm)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
        yTemp: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Max temperature (°C)",
          },
          grid: {
            drawOnChartArea: false, // keeps rain axis clean
          },
        },
      },
    },
  });

  // All your chart config will sit within this function
  //doSomething(chartData);
}
