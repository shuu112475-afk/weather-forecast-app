"use client";

import { isRainyWeather } from "../lib/rain";

type RainAlertProps = {
  pop: number;
  weatherMain: string;
};

export default function RainAlert({ pop, weatherMain }: RainAlertProps) {
  if (!isRainyWeather(pop, weatherMain)) return null;

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
      <span>☔</span>
      <span>降水確率{pop}%。傘を持って出かけましょう</span>
    </div>
  );
}
