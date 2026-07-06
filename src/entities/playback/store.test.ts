import { beforeEach, describe, expect, it } from "vitest";

import { usePlaybackStore } from "./store";

// Сброс к дефолтам между тестами — zustand-стор глобальный синглтон.
beforeEach(() => {
  usePlaybackStore.setState({ frame: 0, isPlaying: false, maxFrame: 0 });
});

describe("play", () => {
  it("resets frame to 0 when already at the last frame (replay from the start)", () => {
    usePlaybackStore.setState({ maxFrame: 99, frame: 99, isPlaying: false });

    usePlaybackStore.getState().play();

    expect(usePlaybackStore.getState()).toMatchObject({ frame: 0, isPlaying: true });
  });

  it("resumes from the current frame when paused mid-playback", () => {
    usePlaybackStore.setState({ maxFrame: 99, frame: 40, isPlaying: false });

    usePlaybackStore.getState().play();

    expect(usePlaybackStore.getState()).toMatchObject({ frame: 40, isPlaying: true });
  });

  it("does nothing when there is no trajectory to play (maxFrame === 0)", () => {
    usePlaybackStore.setState({ maxFrame: 0, frame: 0, isPlaying: false });

    usePlaybackStore.getState().play();

    expect(usePlaybackStore.getState()).toMatchObject({ frame: 0, isPlaying: false });
  });
});
