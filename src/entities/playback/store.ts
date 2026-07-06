import { create } from "zustand";

import { clamp, DEFAULT_SPEED_STEP, MAX_SPEED_STEP, MIN_SPEED_STEP } from "./model";

interface PlaybackState {
  /** Индекс текущего показанного кадра (шага траектории). */
  frame: number;
  isPlaying: boolean;
  /** Целочисленная экспонента лог2-слайдера скорости, -3..6 (см. model.ts). */
  speedStep: number;
  /** Зеркалит animation_checkbox из main.pyw — по умолчанию включено:
   * при появлении новых результатов анимация стартует с нулевого кадра сама. */
  autoPlay: boolean;
  /** Последний доступный кадр текущей партии результатов — единственный
   * источник истины и для PlotPanel (тикер), и для PlaybackControls (слайдер). */
  maxFrame: number;

  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (frame: number) => void;
  /** Внутренний сеттер для rAF-тикера — в отличие от seek() не ставит на паузу. */
  setFrame: (frame: number) => void;
  setSpeedStep: (step: number) => void;
  setAutoPlay: (enabled: boolean) => void;
  /** Новая партия результатов при включённом autoPlay: анимация с нуля. */
  startAnimationFor: (maxFrame: number) => void;
  /** Новая партия результатов при выключенном autoPlay: сразу финальный кадр
   * (зеркалит анимацию отключенной anime — статичный график без проигрывания). */
  skipToEnd: (maxFrame: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  frame: 0,
  isPlaying: false,
  speedStep: DEFAULT_SPEED_STEP,
  autoPlay: true,
  maxFrame: 0,

  play: () =>
    set((state) => {
      if (state.maxFrame <= 0) return { isPlaying: false };
      // на последнем кадре плей — это "проиграть заново", иначе тикер тут же
      // снова упрётся в maxFrame и поставит на паузу без единого видимого кадра
      return { isPlaying: true, frame: state.frame >= state.maxFrame ? 0 : state.frame };
    }),
  pause: () => set({ isPlaying: false }),
  toggle: () => (get().isPlaying ? set({ isPlaying: false }) : get().play()),
  seek: (frame) => set((state) => ({ frame: clamp(frame, 0, state.maxFrame), isPlaying: false })),
  setFrame: (frame) => set({ frame }),
  setSpeedStep: (step) => set({ speedStep: clamp(step, MIN_SPEED_STEP, MAX_SPEED_STEP) }),
  setAutoPlay: (autoPlay) => set({ autoPlay }),
  startAnimationFor: (maxFrame) => set({ maxFrame, frame: 0, isPlaying: maxFrame > 0 }),
  skipToEnd: (maxFrame) => set({ maxFrame, frame: maxFrame, isPlaying: false }),
}));
