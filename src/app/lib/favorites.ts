import { useCallback, useSyncExternalStore } from "react";

export type LocationQuery = { city?: string; lat?: number; lon?: number };
export type FavoriteQuery = { city: string } | { lat: number; lon: number };

export type Favorite = {
  id: string;
  label: string;
  query: FavoriteQuery;
};

const STORAGE_KEY = "weather-app-favorites";
const EMPTY_FAVORITES: Favorite[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: Favorite[] | null = null;

export function queryToId(query: LocationQuery): string {
  if (query.city) return `city:${query.city.trim().toLowerCase()}`;
  if (query.lat != null && query.lon != null) {
    return `coord:${query.lat.toFixed(2)},${query.lon.toFixed(2)}`;
  }
  return "";
}

function readFavorites(): Favorite[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): Favorite[] {
  if (cache === null) cache = readFavorites();
  return cache;
}

function getServerSnapshot(): Favorite[] {
  return EMPTY_FAVORITES;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeFavorites(next: Favorite[]) {
  cache = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback(
    (query: LocationQuery) => favorites.some((f) => f.id === queryToId(query)),
    [favorites]
  );

  const toggleFavorite = useCallback((query: LocationQuery, label: string) => {
    const id = queryToId(query);
    if (!id) return;
    const current = getSnapshot();
    if (current.some((f) => f.id === id)) {
      writeFavorites(current.filter((f) => f.id !== id));
      return;
    }
    const favoriteQuery: FavoriteQuery = query.city
      ? { city: query.city }
      : { lat: query.lat!, lon: query.lon! };
    writeFavorites([...current, { id, label, query: favoriteQuery }]);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    writeFavorites(getSnapshot().filter((f) => f.id !== id));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
