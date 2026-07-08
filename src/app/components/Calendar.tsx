"use client";

type CalendarProps = {
  availableDates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export default function Calendar({
  availableDates,
  selectedDate,
  onSelect,
}: CalendarProps) {
  const availableSet = new Set(availableDates);

  const anchor = availableDates[0]
    ? new Date(`${availableDates[0]}T00:00:00`)
    : new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full max-w-sm rounded-xl bg-white/80 dark:bg-white/5 p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <p className="mb-3 text-center text-sm font-medium text-neutral-600 dark:text-neutral-300">
        {year}年{month + 1}月
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-400 dark:text-neutral-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const key = toDateKey(year, month, day);
          const isAvailable = availableSet.has(key);
          const isSelected = key === selectedDate;
          return (
            <button
              key={idx}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(key)}
              className={[
                "aspect-square rounded-lg text-sm transition-colors",
                isSelected
                  ? "bg-sky-500 text-white font-semibold"
                  : isAvailable
                  ? "bg-sky-50 text-sky-900 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20"
                  : "text-neutral-300 dark:text-neutral-700 cursor-not-allowed",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
        予報がある日付(水色)のみ選択できます
      </p>
    </div>
  );
}
