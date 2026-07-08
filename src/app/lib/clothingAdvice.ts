export type ClothingAdvice = {
  emoji: string;
  text: string;
};

export function getClothingAdvice(tempC: number, isRainy: boolean): ClothingAdvice {
  let advice: ClothingAdvice;

  if (tempC >= 30) {
    advice = { emoji: "🩳", text: "半袖・薄手の服で十分です。水分補給と日差し対策を忘れずに" };
  } else if (tempC >= 25) {
    advice = { emoji: "👕", text: "半袖Tシャツで快適に過ごせる陽気です" };
  } else if (tempC >= 18) {
    advice = { emoji: "👔", text: "長袖シャツや薄手の羽織りものがちょうど良い気温です" };
  } else if (tempC >= 10) {
    advice = { emoji: "🧥", text: "セーターやジャケットなど、しっかりめの羽織りものが必要です" };
  } else if (tempC >= 0) {
    advice = { emoji: "🧣", text: "コートとマフラーで防寒対策をしっかりと" };
  } else {
    advice = { emoji: "🥶", text: "厚手のダウンや手袋など、本格的な防寒対策が必要です" };
  }

  if (isRainy) {
    advice = { ...advice, text: `${advice.text}。傘があると安心です` };
  }

  return advice;
}
