// fromX, toX, fromY, toY
export type FunctionRange = readonly [number, number, number, number];

export interface FunctionDescriptor {
  readonly name: string;
  readonly formula: string;
  readonly range: FunctionRange;
  readonly start: readonly [number, number];
  readonly fn: (x: number, y: number) => number;
}
