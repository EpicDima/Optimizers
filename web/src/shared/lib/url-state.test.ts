import { describe, expect, it } from "vitest";

import { deserializeDashboardState, serializeDashboardState } from "./url-state";
import type { DashboardUrlState } from "./url-state";

describe("serializeDashboardState / deserializeDashboardState", () => {
  it("round-trips a full state", () => {
    const state: DashboardUrlState = {
      formula: "(x^2 + y - 11)^2 + (x + y^2 - 7)^2",
      presetName: "Функция Химмельблау",
      range: [-5, 5, -5, 5],
      is3D: true,
      contourMode: "mesh",
      contourLevels: 42,
      colormap: "viridis",
      colormapReversed: true,
      runs: [
        {
          optimizer: "Adam",
          optimizerParams: { lr: 0.3, beta1: 0.9 },
          scheduler: "Constant",
          schedulerParams: {},
          start: [-4, 4],
          visible: true,
        },
      ],
    };

    const params = serializeDashboardState(state);
    expect(deserializeDashboardState(params)).toEqual(state);
  });

  it("omits absent fields entirely rather than writing empty values", () => {
    const params = serializeDashboardState({ formula: "x^2" });
    expect(params.toString()).toBe("formula=x%5E2");
  });

  it("returns an empty object for an empty query string", () => {
    expect(deserializeDashboardState(new URLSearchParams(""))).toEqual({});
  });

  it("does not write a runs param when runs is an empty array", () => {
    const params = serializeDashboardState({ runs: [] });
    expect(params.has("runs")).toBe(false);
  });

  describe("presetName", () => {
    it("round-trips a preset name", () => {
      const params = serializeDashboardState({ presetName: "Функция Розенброка" });
      expect(deserializeDashboardState(params).presetName).toBe("Функция Розенброка");
    });

    it("does not write a literal 'null' when presetName is null (custom formula)", () => {
      const params = serializeDashboardState({ presetName: null as unknown as string | undefined });
      expect(params.has("preset")).toBe(false);
    });

    it("omits the preset param when presetName is undefined", () => {
      const params = serializeDashboardState({ formula: "x^2" });
      expect(params.has("preset")).toBe(false);
    });
  });

  describe("range parsing", () => {
    it("rejects a range with the wrong number of parts", () => {
      const params = new URLSearchParams({ range: "-5,5,-5" });
      expect(deserializeDashboardState(params).range).toBeUndefined();
    });

    it("rejects a range containing non-numeric parts", () => {
      const params = new URLSearchParams({ range: "-5,5,-5,oops" });
      expect(deserializeDashboardState(params).range).toBeUndefined();
    });
  });

  describe("dim / mode / cmapRev parsing", () => {
    it("ignores an invalid dim value", () => {
      const params = new URLSearchParams({ dim: "4d" });
      expect(deserializeDashboardState(params).is3D).toBeUndefined();
    });

    it("ignores an invalid contour mode", () => {
      const params = new URLSearchParams({ mode: "wireframe" });
      expect(deserializeDashboardState(params).contourMode).toBeUndefined();
    });

    it("ignores an invalid cmapRev value", () => {
      const params = new URLSearchParams({ cmapRev: "yes" });
      expect(deserializeDashboardState(params).colormapReversed).toBeUndefined();
    });
  });

  describe("contourLevels parsing", () => {
    it("rejects zero and negative values", () => {
      expect(deserializeDashboardState(new URLSearchParams({ levels: "0" })).contourLevels).toBeUndefined();
      expect(deserializeDashboardState(new URLSearchParams({ levels: "-3" })).contourLevels).toBeUndefined();
    });

    it("rejects non-integer values", () => {
      expect(deserializeDashboardState(new URLSearchParams({ levels: "3.5" })).contourLevels).toBeUndefined();
    });

    it("accepts a valid positive integer", () => {
      expect(deserializeDashboardState(new URLSearchParams({ levels: "30" })).contourLevels).toBe(30);
    });
  });

  describe("runs parsing", () => {
    it("ignores malformed JSON", () => {
      const params = new URLSearchParams({ runs: "{not json" });
      expect(deserializeDashboardState(params).runs).toBeUndefined();
    });

    it("ignores a JSON value that is not an array", () => {
      const params = new URLSearchParams({ runs: JSON.stringify({ foo: "bar" }) });
      expect(deserializeDashboardState(params).runs).toBeUndefined();
    });

    it("drops entries missing required fields and keeps valid ones", () => {
      const params = new URLSearchParams({
        runs: JSON.stringify([
          { optimizer: "Adam" },
          {
            optimizer: "Momentum",
            optimizerParams: { lr: 0.005 },
            scheduler: "Constant",
            schedulerParams: {},
            start: [0, 0],
            visible: false,
          },
        ]),
      });

      expect(deserializeDashboardState(params).runs).toEqual([
        {
          optimizer: "Momentum",
          optimizerParams: { lr: 0.005 },
          scheduler: "Constant",
          schedulerParams: {},
          start: [0, 0],
          visible: false,
        },
      ]);
    });

    it("treats an all-invalid runs array as absent", () => {
      const params = new URLSearchParams({ runs: JSON.stringify([{ optimizer: "Adam" }]) });
      expect(deserializeDashboardState(params).runs).toBeUndefined();
    });
  });
});
