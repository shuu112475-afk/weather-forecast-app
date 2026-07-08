"use client";

import type { Favorite, FavoriteQuery } from "../lib/favorites";

type FavoritesBarProps = {
  favorites: Favorite[];
  activeId: string;
  onSelect: (query: FavoriteQuery) => void;
  onRemove: (id: string) => void;
};

export default function FavoritesBar({
  favorites,
  activeId,
  onSelect,
  onRemove,
}: FavoritesBarProps) {
  if (favorites.length === 0) return null;

  return (
    <div className="flex w-full max-w-sm flex-wrap justify-center gap-2">
      {favorites.map((fav) => (
        <div
          key={fav.id}
          className={[
            "flex items-center gap-1 rounded-full px-3 py-1 text-xs",
            fav.id === activeId
              ? "bg-sky-500 text-white"
              : "bg-sky-50 text-sky-800 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20",
          ].join(" ")}
        >
          <button type="button" onClick={() => onSelect(fav.query)}>
            ★ {fav.label}
          </button>
          <button
            type="button"
            onClick={() => onRemove(fav.id)}
            aria-label={`${fav.label}をお気に入りから削除`}
            className="opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
