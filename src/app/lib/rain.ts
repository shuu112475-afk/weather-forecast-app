const RAINY_CONDITIONS = ["Rain", "Drizzle", "Thunderstorm", "Snow"];

export function isRainyWeather(pop: number, weatherMain: string): boolean {
  return pop >= 50 || RAINY_CONDITIONS.includes(weatherMain);
}
