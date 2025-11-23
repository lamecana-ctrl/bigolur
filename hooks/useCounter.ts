// /hooks/useCounter.ts

import { useEffect, useState } from "react";

export default function useCounter(targetValue: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = targetValue / (duration / 16); // 60 FPS

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        start = targetValue;
        clearInterval(timer);
      }
      setValue(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, [targetValue, duration]);

  return value;
}
