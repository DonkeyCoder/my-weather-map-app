// Import application modules
import {
  createTempChart,
  createTempCompareChart,
  createHistoryCompareChart,
  createPeriodHistoryCompareChart,
} from "./buildChart.js";

import { getLocationData, getHistoricLocationData } from "./geocoder.js";

import { waterPlants } from "./alert.js";

(async () => {
  const [WebMap, reactiveUtils] = await $arcgis.import([
    "esri/WebMap",
    "esri/core/reactiveUtils",
  ]);

  //--------------------------------------------------------------------------
  //
  //  DOM Elements
  //
  //--------------------------------------------------------------------------

  // Access the references to my elements on the page
  const mapElement = document.querySelector("#mapElement");

  const compareButtonElement = document.querySelector("#compare-rain");

  const historicCompareButtonElement =
    document.querySelector("#compare-history");

  const historicRainMapping = {
    "seven-days": -7,
    "one-month": -28,
    "six-months": -183,
    "one-year": -365,
    "two-years": -732,
    "three-years": -1097,
  };

  const timePeriodButtonElement = document.querySelector(
    ".time-period-buttons",
  );

  document.querySelectorAll(".time-period-buttons a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const value = historicRainMapping[e.target.id];
      historicRainPeriod(value);
    });
  });

  //--------------------------------------------------------------------------
  //
  //  Time elements for historic weather
  //
  //--------------------------------------------------------------------------

  // Getting current date in the required format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  // Getting historic date in the required format
  const historicYear = year - 3;

  const formattedHistoricStartDate = `${historicYear}-${month}-${day}`;

  //--------------------------------------------------------------------------
  //
  //  State
  //
  //--------------------------------------------------------------------------

  class ApplicationStateManager extends EventTarget {
    // ELEMENTS OF MY CLASS - PART 1
    // CONSTRUCTOR - Set up the object
    // Define properties (state)
    // Give the initial values
    // When a new instance of the class is created this is what it will contain
    constructor() {
      super();

      this.map = new WebMap({
        /*
        portalItem: {
          id: "9ef19efea39a48e2b21f9f0184687c8e",
        },
        */

        basemap: "topo-vector",
      });

      this.view = null;

      // App state
      this.locationCategories = [];

      // Store current weather result
      this.currentWeatherData = null;
      // Store last weather result
      this.lastWeatherData = null;

      // Store current weather result
      this.currentWeatherData = null;
      // Store last weather result
      this.lastWeatherData = null;

      // Store historic weather result
      this.historicWeatherData = null;
      // Store previous historic weather result
      this.previousHistoricWeatherData = null;

      // Store current location
      this.currentLocation = null;
      // Store last location
      this.lastLocation = null;
    }

    async load(mapElement) {
      await this.map.load();

      // Wait until the ArcGIS view is ready
      mapElement.addEventListener("arcgisViewReadyChange", () => {
        this.view = mapElement.view;

        ((this.view.center = {
          longitude: 151.19685485188586,
          latitude: -33.87396029220808,
        }),
          (this.view.zoom = 12),
          // Setup click handler after view is ready
          // The underscore signifies this method is for internal use only - i.e. don't call it from outside the class
          this._setupClickHandler());
      });

      // Find your layer
      this.layer = this.map.layers.find(
        (layer) => layer.title === "Bike share parking",
      );
    }

    // ELEMENTS OF MY CLASS - PART 2
    // METHODS - What can the object do

    // Helper function
    // Managing previous weather data just incase we want to compare previous location weather with the current location weather
    _updateWeatherState(newWeatherData, historicWeatherData) {
      // 7 Day Forecast
      this.lastWeatherData = this.currentWeatherData;
      this.currentWeatherData = newWeatherData;

      // Historic Weather
      this.previousHistoricWeatherData = this.historicWeatherData;
      this.historicWeatherData = historicWeatherData;

      if (this.lastWeatherData != null && this.lastWeatherData !== "") {
        compareButtonElement.style.display = "block";
        historicCompareButtonElement.style.display = "block";
        timePeriodButtonElement.style.display = "inline-flex";
      }
    }

    _updateLocationState(newGeocoderData) {
      this.lastLocation = this.currentLocation;
      this.currentLocation = newGeocoderData;
    }

    // Handles map clicks
    _setupClickHandler() {
      this.view.on("click", async (event) => {
        const point = event.mapPoint;

        const lat = point.latitude;
        const lon = point.longitude;

        //console.log("Clicked location:", lat, lon);

        // Fetch weather data
        const weatherData = await this._fetchWeather(lat, lon);

        // Fetch historic weather data
        const historicWeatherData = await this._fetchHistoricWeather(lat, lon);

        // Fetch geocoder data
        const geocoderData = await this._fetchGeocoder(lat, lon);

        // Use the helper function here defined above
        this._updateWeatherState(weatherData, historicWeatherData);
        this._updateLocationState(geocoderData);

        // Dispatch event with BOTH location + weather data
        this.dispatchEvent(
          new CustomEvent("mapClick", {
            detail: {
              latitude: lat,
              longitude: lon,
              mapPoint: point,
              weather: weatherData,
              previousWeather: this.lastWeatherData, // optional but useful
              location: geocoderData,
              previousLocation: this.lastLocation,
              historicWeather: this.historicWeatherData,
              previousHistoricWeather: this.previousHistoricWeatherData,
            },
          }),
        );
      });
    }

    // ELEMENTS OF MY CLASS - PART 2 cont
    // METHODS
    // Fetch weather data from Open-Meteo
    async _fetchWeather(lat, lon) {
      const tempURL =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        parseFloat(lat.toFixed(4)) +
        "&longitude=" +
        parseFloat(lon.toFixed(4)) +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min," +
        "apparent_temperature_max,apparent_temperature_min,sunrise,sunset," +
        "daylight_duration,sunshine_duration,uv_index_max," +
        "uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum," +
        "snowfall_sum,precipitation_hours,precipitation_probability_max," +
        "wind_speed_10m_max,wind_gusts_10m_max," +
        "wind_direction_10m_dominant,shortwave_radiation_sum," +
        "et0_fao_evapotranspiration" +
        "&timezone=Australia%2FSydney";

      //console.log(tempURL);

      try {
        const response = await fetch(tempURL);

        if (!response.ok) {
          throw new Error(
            "Network response was not ok: " + response.statusText,
          );
        }

        const tempData = await response.json();

        //console.log("Weather data:", tempData);

        return tempData;
      } catch (error) {
        console.error("Weather fetch failed:", error);
        return null;
      }
    }

    // Fetch historic weather data from Open-Meteo
    async _fetchHistoricWeather(lat, lon) {
      const historicRainURL =
        "https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=" +
        parseFloat(lat.toFixed(4)) +
        "&longitude=" +
        parseFloat(lon.toFixed(4)) +
        "&start_date=" +
        formattedHistoricStartDate +
        "&end_date=" +
        formattedDate +
        "&daily=temperature_2m_max,temperature_2m_min,rain_sum";

      //console.log(historicRainURL);

      try {
        const response = await fetch(historicRainURL);

        if (!response.ok) {
          throw new Error(
            "Network response was not ok: " + response.statusText,
          );
        }

        const historicRainData = await response.json();

        //console.log("Weather data:", tempData);

        return historicRainData;
      } catch (error) {
        console.error("Weather fetch failed:", error);
        return null;
      }
    }

    async _fetchGeocoder(lat, lon) {
      const geocoderURL = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=12&format=json`;

      try {
        const response = await fetch(geocoderURL);

        if (!response.ok) {
          throw new Error(
            "Network response was not ok: " + response.statusText,
          );
        }

        const geocoderData = await response.json();

        //console.log("Weather data:", tempData);

        return geocoderData;
      } catch (error) {
        console.error("Geocoder fetch failed:", error);
        return null;
      }
    }
  }

  const state = new ApplicationStateManager();
  window.stateGlobal = state;

  // This is where we start to use the 'this.dispatchEvent' data
  state.addEventListener("mapClick", (event) => {
    //const { latitude, longitude } = event.detail;
    //console.log(event.detail);
    createTempChart(event.detail.weather, event.detail.location);
    waterPlants(event.detail.historicWeather);
    //alert(`You clicked at ${latitude}, ${longitude}`);
  });

  // Button event to compare rain fall across locations
  compareButtonElement.addEventListener("click", () => {
    /*     console.log(state.lastWeatherData);
    console.log(state.currentweatherData);
    console.log(state); */
    createTempCompareChart(state.lastWeatherData, state.currentWeatherData);
    getLocationData(state.lastLocation, state.currentLocation);
  });

  // Button event to compare historic rain fall across locations
  historicCompareButtonElement.addEventListener("click", () => {
    //console.log(state.historicWeatherData);
    //console.log(state.previousHistoricWeatherData);
    //console.log(state);
    createHistoryCompareChart(
      state.previousHistoricWeatherData,
      state.historicWeatherData,
    );
    getHistoricLocationData(state.lastLocation, state.currentLocation);
  });

  // Historic rain period buttons
  function historicRainPeriod(period) {
    //console.log("Selected period:", period);
    //const prevHistRainPeriod = state.previousHistoricWeatherData.slice(period);
    //const currentHistRainPeriod = state.historicWeatherData.slice(period);
    createPeriodHistoryCompareChart(
      state.previousHistoricWeatherData,
      state.historicWeatherData,
      period,
    );
  }

  // Water plant alert

  mapElement.map = state.map;
  mapElement.constraints = {
    snapToZoom: false,
  };

  await state.load(mapElement);
})();
