import { useEffect, useRef } from "react";

import { BASE_TICK_MS, speedFromStep } from "./model";
import { usePlaybackStore } from "./store";

/** Ручной цикл воспроизведения на requestAnimationFrame — сознательно НЕ используем
 * Plotly frames/animate API (не годится для произвольного хвостового окна относительно
 * текущего кадра, плохо сочетается с декларативной моделью react-plotly.js). Вместо
 * этого просто тикаем `frame` в сторе, а PlotPanel уже сам перерисовывает данные
 * через Plotly.react.
 *
 * В отличие от таймера с фиксированным интервалом, requestAnimationFrame даёт
 * произвольную частоту тиков (зависит от частоты обновления монитора и текущего
 * FPS), поэтому кадры продвигаются
 * дробно и плавно: framesPerTick = elapsedMs * speed / BASE_TICK_MS, с накоплением
 * дробного остатка между тиками (иначе speed=0.125x никогда не продвинулся бы на
 * одном 16мс-тике). */
export function usePlaybackTicker(maxFrame: number): void {
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const maxFrameRef = useRef(maxFrame);
  maxFrameRef.current = maxFrame;

  useEffect(() => {
    if (!isPlaying) return;

    let rafId: number;
    let lastTime: number | null = null;
    let carry = 0;

    function tick(time: number) {
      if (lastTime === null) lastTime = time;
      const elapsedMs = time - lastTime;
      lastTime = time;

      const { speedStep, frame, setFrame, pause } = usePlaybackStore.getState();
      const speed = speedFromStep(speedStep);
      carry += (elapsedMs * speed) / BASE_TICK_MS;

      const wholeFrames = Math.floor(carry);
      if (wholeFrames > 0) {
        carry -= wholeFrames;
        const limit = maxFrameRef.current;
        const next = Math.min(frame + wholeFrames, limit);
        if (next !== frame) setFrame(next);
        if (next >= limit) {
          pause();
          return;
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);
}
