/** Один слот в боковой панели: пара оптимизатор+планировщик со своими параметрами. */
export interface RunConfig {
  slotId: string;
  optimizer: string;
  optimizerParams: Record<string, number>;
  scheduler: string;
  schedulerParams: Record<string, number>;
  start: [number, number];
  color: string;
  visible: boolean;
}

/** Траектория, посчитанная бэкендом на один запуск /optimize. */
export interface RunResult {
  slotId: string;
  x: number[];
  y: number[];
  value: number[];
  lr: number[] | null;
  error: string | null;
}
