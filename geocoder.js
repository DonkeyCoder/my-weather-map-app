export function getLocationData(lastLocation, currentLocation) {
  /**
   * Helper: Build a formatted location string from a location object
   */
  const buildLocationText = (location) => {
    const { address = {}, display_name } = location;

    // Ordered priority list of field combinations
    const pairs = [
      [address.suburb, address.city],
      [address.road, address.city],
      [address.borough, address.city],
      [address.town, address.state],
      [address.village, address.state],
      [address.hamlet, address.state],
      [address.suburb, address.state],
    ];

    // Format helper
    const format = (a, b) => `${a}${b ? `, ${b}` : ""}`;

    // Find first valid pair
    const match = pairs.find(([a, b]) => a && b);

    // Apply fallback logic
    return match
      ? format(...match)
      : address.city
        ? format(address.city)
        : format(display_name);
  };

  // Generate both values using the same logic
  const previousLocationText = buildLocationText(lastLocation);
  const currentLocationText = buildLocationText(currentLocation);

  // Remove existing label (if present)
  const existingLabel = document.getElementById("location-label");
  if (existingLabel) {
    existingLabel.remove();
  }

  // Create new label
  const locationLabel = document.createElement("div");
  locationLabel.id = "location-label";

  locationLabel.innerHTML = `
    7 day rain forecast:&nbsp;<b class="location-current">&nbsp;${currentLocationText}</b>&nbsp;VS&nbsp;<b class="location-previous">${previousLocationText}</b>`;

  // Append the newly created element to the body of the site
  document.body.appendChild(locationLabel);
}

export function getHistoricLocationData(lastLocation, currentLocation) {
  /**
   * Helper: Build a formatted location string from a location object
   */
  const buildLocationText = (location) => {
    const { address = {}, display_name } = location;

    // Ordered priority list of field combinations
    const pairs = [
      [address.suburb, address.city],
      [address.road, address.city],
      [address.borough, address.city],
      [address.town, address.state],
      [address.village, address.state],
      [address.hamlet, address.state],
      [address.suburb, address.state],
    ];

    // Format helper
    const format = (a, b) => `${a}${b ? `, ${b}` : ""}`;

    // Find first valid pair
    const match = pairs.find(([a, b]) => a && b);

    // Apply fallback logic
    return match
      ? format(...match)
      : address.city
        ? format(address.city)
        : format(display_name);
  };

  // Generate both values using the same logic
  const previousLocationText = buildLocationText(lastLocation);
  const currentLocationText = buildLocationText(currentLocation);

  // Remove existing label (if present)
  const existingLabel = document.getElementById("location-label");
  if (existingLabel) {
    existingLabel.remove();
  }

  // Create new label
  const locationLabel = document.createElement("div");
  locationLabel.id = "location-label";

  locationLabel.innerHTML = `
    Hisotric rain comparison:&nbsp;<b class="location-current">${currentLocationText}</b>&nbsp;VS&nbsp;<b class="location-previous">${previousLocationText}</b>`;

  // Append the newly created element to the body of the site
  document.body.appendChild(locationLabel);
}

/**
 * {
    "place_id": 23483644,
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
    "osm_type": "node",
    "osm_id": 5754922211,
    "lat": "-33.8788350",
    "lon": "151.2232229",
    "class": "leisure",
    "type": "playground",
    "place_rank": 30,
    "importance": 0.00008246051728079679,
    "addresstype": "leisure",
    "name": "",
    "display_name": "Liverpool Street, Darlinghurst, Sydney, New South Wales, 2010, Australia",
    "address": {
        "road": "Liverpool Street",
        "suburb": "Darlinghurst",
        "city": "Sydney",
        "state": "New South Wales",
        "ISO3166-2-lvl4": "AU-NSW",
        "postcode": "2010",
        "country": "Australia",
        "country_code": "au"
    },
    "boundingbox": [
        "-33.8788850",
        "-33.8787850",
        "151.2231729",
        "151.2232729"
    ]
}
 */
