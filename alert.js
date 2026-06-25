export function waterPlants(totalRain) {
  //console.log(totalRain);
  const last10days = totalRain.daily.rain_sum.slice(-10);
  const last21days = totalRain.daily.rain_sum.slice(-21);
  //alert("Hello! I am an alert box!");

  // Avoids floating-point precision loss
  const exactTotal10Days = Math.sumPrecise(last10days);
  const exactTotal21Days = Math.sumPrecise(last21days);

  //alert("Hello! I am an alert box!");
  if (exactTotal10Days == 0 && exactTotal21Days == 0) {
    alert(
      "IMPORTANT: Water young/newly planted trees & shrubs AND established vegetation",
    );
  } else if (exactTotal10Days == 0 && exactTotal21Days > 0) {
    alert("IMPORTANT: Water young/newly planted trees & shrubs");
  }
}

/**
 * Young or Newly Planted Trees & Shrubs: Water every 7–10 days in hot weather, and every 4–7 days in mild weather.
 * They require deep, regular watering while their root systems establish.
 *
 * Established Trees & Drought-Tolerant Natives: Once established, native Australian trees and mature trees often
 * only need water every 10–14 days (or 14–21 days for deep-rooted, drought-tolerant species) during hot, dry spells.
 */
