"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import Image from "next/image";
import Calendar from "./components/Calendar";
import FavoritesBar from "./components/FavoritesBar";
import RainAlert from "./components/RainAlert";
import type { WeatherApiResponse } from "./api/weather/route";
import { queryToId, useFavorites, type FavoriteQuery } from "./lib/favorites";
import { getClothingAdvice } from "./lib/clothingAdvice";
import { isRainyWeather } from "./lib/rain";

const DEFAULT_CITY = "Tokyo";

export default function Home() {
  const [cityInput, setCityInput] = useState(DEFAULT_CITY);
  const [query, setQuery] = useState<{ city?: string; lat?: number; lon?: number }>({
    city: DEFAULT_CITY,
  });
  const [data, setData] = useState<WeatherApiResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.city) params.set("city", query.city);
        if (query.lat != null && query.lon != null) {
          params.set("lat", String(query.lat));
          params.set("lon", String(query.lon));
        }
        const res = await fetch(`/api/weather?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "取得に失敗しました。");
        if (cancelled) return;
        setData(json);
        setSelectedDate(json.days[0]?.date ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "エラー");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setQuery({ city: cityInput.trim() });
  }

  function handleSelectFavorite(favoriteQuery: FavoriteQuery) {
    if ("city" in favoriteQuery) {
      setCityInput(favoriteQuery.city);
      setQuery({ city: favoriteQuery.city });
    } else {
      setCityInput("");
      setQuery({ lat: favoriteQuery.lat, lon: favoriteQuery.lon });
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("このブラウザは現在地取得に対応していません。");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setCityInput("");
        setQuery({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setError("現在地を取得できませんでした。");
      }
    );
  }

  const selectedDay = data?.days.find((d) => d.date === selectedDate);
  const isToday = data?.days[0]?.date === selectedDate;

  const effectiveWeatherMain = selectedDay
    ? isToday
      ? data?.current.weather.main
      : selectedDay.weather.main
    : undefined;
  const effectiveTemp = selectedDay
    ? isToday
      ? data?.current.temp
      : (selectedDay.tempMin + selectedDay.tempMax) / 2
    : undefined;
  const clothingAdvice =
    selectedDay && effectiveTemp != null && effectiveWeatherMain != null
      ? getClothingAdvice(effectiveTemp, isRainyWeather(selectedDay.pop, effectiveWeatherMain))
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-neutral-950 dark:to-neutral-900 px-4 py-10">
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            天気予報
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            都市名または現在地の天気を、日付を選んで確認できます
          </p>
        </header>

        <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="都市名(例: Tokyo, Osaka, London)"
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-sky-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            検索
          </button>
        </form>
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="-mt-4 text-sm text-sky-600 underline hover:text-sky-700 disabled:opacity-50 dark:text-sky-400"
        >
          {locating ? "取得中..." : "現在地から取得する"}
        </button>

        <FavoritesBar
          favorites={favorites}
          activeId={queryToId(query)}
          onSelect={handleSelectFavorite}
          onRemove={removeFavorite}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        {loading && !data && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            読み込み中...
          </p>
        )}

        {data && (
          <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
            <Calendar
              availableDates={data.days.map((d) => d.date)}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />

            <div className="w-full max-w-sm rounded-xl bg-white/80 dark:bg-white/5 p-6 text-center shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="relative flex items-center justify-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {data.cityName}
                  {data.country ? `, ${data.country}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite(
                      query,
                      `${data.cityName}${data.country ? `, ${data.country}` : ""}`
                    )
                  }
                  aria-label={
                    isFavorite(query) ? "お気に入りから削除" : "お気に入りに追加"
                  }
                  className={[
                    "absolute right-0 text-xl leading-none",
                    isFavorite(query)
                      ? "text-amber-400"
                      : "text-neutral-300 hover:text-amber-300 dark:text-neutral-600",
                  ].join(" ")}
                >
                  {isFavorite(query) ? "★" : "☆"}
                </button>
              </div>
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                {selectedDate}
                {isToday && "(今日)"}
              </p>

              {selectedDay ? (
                <>
                  <Image
                    src={`https://openweathermap.org/img/wn/${selectedDay.weather.icon}@2x.png`}
                    alt={selectedDay.weather.description}
                    width={80}
                    height={80}
                    className="mx-auto h-20 w-20"
                  />
                  <p className="text-lg font-medium text-neutral-800 dark:text-neutral-100">
                    {selectedDay.weather.description}
                  </p>

                  {isToday ? (
                    <p className="mt-2 text-4xl font-bold text-neutral-900 dark:text-white">
                      {Math.round(data.current.temp)}°C
                    </p>
                  ) : (
                    <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                      {Math.round(selectedDay.tempMax)}°
                      <span className="text-neutral-400 dark:text-neutral-500">
                        {" "}
                        / {Math.round(selectedDay.tempMin)}°
                      </span>
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-500/10">
                      <p className="text-neutral-500 dark:text-neutral-400">湿度</p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {isToday ? data.current.humidity : selectedDay.humidity}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-500/10">
                      <p className="text-neutral-500 dark:text-neutral-400">
                        降水確率
                      </p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                        {selectedDay.pop}%
                      </p>
                    </div>
                  </div>

                  {effectiveWeatherMain && (
                    <div className="mt-4">
                      <RainAlert pop={selectedDay.pop} weatherMain={effectiveWeatherMain} />
                    </div>
                  )}

                  {clothingAdvice && (
                    <div className="mt-3 rounded-lg bg-amber-50 p-3 text-left text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                      <span className="mr-1">{clothingAdvice.emoji}</span>
                      {clothingAdvice.text}
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-neutral-500">
                  日付を選択してください
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
