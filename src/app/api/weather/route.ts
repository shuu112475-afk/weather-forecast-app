import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

type OwmWeather = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type OwmCurrentResponse = {
  name: string;
  sys: { country: string };
  main: { temp: number; feels_like: number; humidity: number };
  weather: OwmWeather[];
  coord: { lat: number; lon: number };
};

type OwmForecastEntry = {
  dt: number;
  dt_txt: string;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  weather: OwmWeather[];
  pop: number;
};

type OwmForecastResponse = {
  city: { name: string; country: string; timezone: number };
  list: OwmForecastEntry[];
};

export type DailyForecast = {
  date: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pop: number;
  weather: OwmWeather;
};

export type WeatherApiResponse = {
  cityName: string;
  country: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    weather: OwmWeather;
  };
  days: DailyForecast[];
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "サーバーに OPENWEATHER_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!city && !(lat && lon)) {
    return NextResponse.json(
      { error: "city もしくは lat/lon を指定してください。" },
      { status: 400 }
    );
  }

  const locationQuery = city
    ? `q=${encodeURIComponent(city)}`
    : `lat=${encodeURIComponent(lat!)}&lon=${encodeURIComponent(lon!)}`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `${BASE_URL}/weather?${locationQuery}&units=metric&lang=ja&appid=${apiKey}`
      ),
      fetch(
        `${BASE_URL}/forecast?${locationQuery}&units=metric&lang=ja&appid=${apiKey}`
      ),
    ]);

    if (!currentRes.ok) {
      const body = await currentRes.json().catch(() => null);
      return NextResponse.json(
        { error: body?.message ?? "都市が見つかりませんでした。" },
        { status: currentRes.status === 404 ? 404 : 502 }
      );
    }
    if (!forecastRes.ok) {
      const body = await forecastRes.json().catch(() => null);
      return NextResponse.json(
        { error: body?.message ?? "予報の取得に失敗しました。" },
        { status: forecastRes.status === 404 ? 404 : 502 }
      );
    }

    const current: OwmCurrentResponse = await currentRes.json();
    const forecast: OwmForecastResponse = await forecastRes.json();

    const byDate = new Map<string, OwmForecastEntry[]>();
    for (const entry of forecast.list) {
      const date = entry.dt_txt.split(" ")[0];
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push(entry);
    }

    const days: DailyForecast[] = Array.from(byDate.entries())
      .slice(0, 5)
      .map(([date, entries]) => {
        const tempMin = Math.min(...entries.map((e) => e.main.temp_min));
        const tempMax = Math.max(...entries.map((e) => e.main.temp_max));
        const humidity =
          entries.reduce((sum, e) => sum + e.main.humidity, 0) /
          entries.length;
        const pop = Math.max(...entries.map((e) => e.pop));

        const representative = entries.reduce((best, e) => {
          const hour = Number(e.dt_txt.split(" ")[1].slice(0, 2));
          const bestHour = Number(best.dt_txt.split(" ")[1].slice(0, 2));
          return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? e : best;
        }, entries[0]);

        return {
          date,
          tempMin,
          tempMax,
          humidity: Math.round(humidity),
          pop: Math.round(pop * 100),
          weather: representative.weather[0],
        };
      });

    const response: WeatherApiResponse = {
      cityName: current.name || forecast.city.name,
      country: current.sys.country || forecast.city.country,
      current: {
        temp: current.main.temp,
        feelsLike: current.main.feels_like,
        humidity: current.main.humidity,
        weather: current.weather[0],
      },
      days,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "天気情報の取得中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
