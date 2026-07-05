import type { FunctionDescriptor } from "./types";

// Порт `Function.py::standard_functions` — тот же порядок, те же имена/диапазоны/старты.
// Формулы — прямая транскрипция строк Function.py в JS-замыкания, без парсера
// (свободный ввод формулы в вебе отключён, "formula" — только для отображения).
export const functionPresets: FunctionDescriptor[] = [
  {
    name: "Функция сферы",
    formula: "x^2 + y^2",
    range: [-5, 5, -5, 5],
    start: [-4, 4],
    fn: (x, y) => x ** 2 + y ** 2,
  },
  {
    name: "Функция трёхгорбого верблюда",
    formula: "2 * x^2 - 1.05 * x^4 + x^6/6 + x*y + y^2",
    range: [-2, 2, -2, 2],
    start: [-1.6, 1.8],
    fn: (x, y) => 2 * x ** 2 - 1.05 * x ** 4 + x ** 6 / 6 + x * y + y ** 2,
  },
  {
    name: "Функция Экли",
    formula:
      "-20 * exp(-0.2 * sqrt(0.5 * (x^2 + y^2))) - exp(0.5 * (cos(2 * pi * x) + cos(2 * pi * y))) + e + 20",
    range: [-5, 5, -5, 5],
    start: [4, -4],
    fn: (x, y) =>
      -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x ** 2 + y ** 2))) -
      Math.exp(0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))) +
      Math.E +
      20,
  },
  {
    name: "Функция Розенброка",
    formula: "(1 - x)^2 + 100 * (y - x^2)^2",
    range: [-2, 2, -1, 3],
    start: [-1.2, 1],
    fn: (x, y) => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2,
  },
  {
    name: "Функция Била",
    formula: "(1.5 - x + x * y)^2 + (2.25 - x + x * y^2)^2 + (2.625 - x + x * y^3)^2",
    range: [-4.5, 4.5, -4.5, 4.5],
    start: [1, 1],
    fn: (x, y) => (1.5 - x + x * y) ** 2 + (2.25 - x + x * y ** 2) ** 2 + (2.625 - x + x * y ** 3) ** 2,
  },
  {
    name: "Функция Гольдштейна-Прайса",
    formula:
      "(1 + (x + y + 1)^2 * (19 - 14 * x + 3 * x^2 - 14 * y + 6 * x * y + 3*y^2)) * (30 + (2 * x - 3 * y)^2 * (18 - 32 * x + 12 * x^2 + 48 * y - 36 * x * y + 27 * y^2))",
    range: [-2, 2, -2, 2],
    start: [1.5, 1.5],
    fn: (x, y) =>
      (1 + (x + y + 1) ** 2 * (19 - 14 * x + 3 * x ** 2 - 14 * y + 6 * x * y + 3 * y ** 2)) *
      (30 + (2 * x - 3 * y) ** 2 * (18 - 32 * x + 12 * x ** 2 + 48 * y - 36 * x * y + 27 * y ** 2)),
  },
  {
    name: "Функция Бута",
    formula: "(x + 2 * y - 7)^2 + (2 * x + y - 5)^2",
    range: [-10, 10, -10, 10],
    start: [-8, -8],
    fn: (x, y) => (x + 2 * y - 7) ** 2 + (2 * x + y - 5) ** 2,
  },
  {
    name: "Функция Букина",
    formula: "100 * sqrt(abs(y - 0.01 * x^2)) + 0.01 * abs(x + 10)",
    range: [-15, -5, -3, 3],
    start: [-7, 2.5],
    fn: (x, y) => 100 * Math.sqrt(Math.abs(y - 0.01 * x ** 2)) + 0.01 * Math.abs(x + 10),
  },
  {
    name: "Функция Матьяса",
    formula: "0.26 * (x^2 + y^2) - 0.48 * x * y",
    range: [-10, 10, -10, 10],
    start: [-9, 9],
    fn: (x, y) => 0.26 * (x ** 2 + y ** 2) - 0.48 * x * y,
  },
  {
    name: "Функция Леви",
    formula:
      "sin(3 * pi * x)^2 + (x - 1)^2 * (1 + sin(3 * pi * y)^2) + (y - 1)^2 * (1 + sin(2 * pi * y)^2)",
    range: [-10, 10, -10, 10],
    start: [-8, -8],
    fn: (x, y) =>
      Math.sin(3 * Math.PI * x) ** 2 +
      (x - 1) ** 2 * (1 + Math.sin(3 * Math.PI * y) ** 2) +
      (y - 1) ** 2 * (1 + Math.sin(2 * Math.PI * y) ** 2),
  },
  {
    name: "Функция Химмельблау",
    formula: "(x^2 + y - 11)^2 + (x + y^2 - 7)^2",
    range: [-5, 5, -5, 5],
    start: [0, 0],
    fn: (x, y) => (x ** 2 + y - 11) ** 2 + (x + y ** 2 - 7) ** 2,
  },
  {
    name: "Функция Растригина",
    formula: "20 + (x^2 - 10 * cos(2 * pi * x)) + (y^2 - 10 * cos(2 * pi * y))",
    range: [-5.12, 5.12, -5.12, 5.12],
    start: [4.5, 4.5],
    fn: (x, y) => 20 + (x ** 2 - 10 * Math.cos(2 * Math.PI * x)) + (y ** 2 - 10 * Math.cos(2 * Math.PI * y)),
  },
  {
    name: "Функция Изома",
    formula: "-cos(x) * cos(y) * exp(-((x - pi)^2 + (y - pi)^2))",
    range: [0, 6, 0, 6],
    start: [2.5, 4],
    fn: (x, y) => -Math.cos(x) * Math.cos(y) * Math.exp(-((x - Math.PI) ** 2 + (y - Math.PI) ** 2)),
  },
  {
    name: "Функция Cross-in-tray",
    formula: "-0.0001 * (abs(sin(x) * sin(y) * exp(abs(100 - (sqrt(x^2 + y^2) / pi)))) + 1)^0.1",
    range: [-10, 10, -10, 10],
    start: [6, 3],
    fn: (x, y) =>
      -0.0001 *
      (Math.abs(Math.sin(x) * Math.sin(y) * Math.exp(Math.abs(100 - Math.sqrt(x ** 2 + y ** 2) / Math.PI))) + 1) **
        0.1,
  },
  {
    name: "Функция Хольдера",
    formula: "-abs(cos(x) * cos(y) * exp(abs(1 - (sqrt(x^2 + y^2) / pi))))",
    range: [-10, 10, -10, 10],
    start: [5, 5],
    fn: (x, y) =>
      -Math.abs(Math.cos(x) * Math.cos(y) * Math.exp(Math.abs(1 - Math.sqrt(x ** 2 + y ** 2) / Math.PI))),
  },
  {
    name: "Функция МакКормика",
    formula: "sin(x + y) + (x - y)^2 - 1.5 * x + 2.5 * y + 1",
    range: [-1.5, 4, -3, 4],
    start: [3, 3],
    fn: (x, y) => Math.sin(x + y) + (x - y) ** 2 - 1.5 * x + 2.5 * y + 1,
  },
  {
    name: "Функция Стыбинского-Танга",
    formula: "(x^4 - 16 * x^2 + 5 * x + y^4 - 16 * y^2 + 5 * y) / 2",
    range: [-5, 5, -5, 5],
    start: [1, 1],
    fn: (x, y) => (x ** 4 - 16 * x ** 2 + 5 * x + y ** 4 - 16 * y ** 2 + 5 * y) / 2,
  },
  {
    name: "Функция Шаффера",
    formula: "0.5 + (sin(x^2 - y^2)^2 - 0.5) / (1 + 0.001 * (x^2 + y^2))^2",
    range: [-5, 5, -5, 5],
    start: [-4, 2],
    fn: (x, y) => 0.5 + (Math.sin(x ** 2 - y ** 2) ** 2 - 0.5) / (1 + 0.001 * (x ** 2 + y ** 2)) ** 2,
  },
  {
    name: "Функция Шаффера N4",
    formula: "0.5 + (cos(sin(abs(x^2 - y^2)))^2 - 0.5) / (1 + 0.001 * (x^2 + y^2))^2",
    range: [-5, 5, -5, 5],
    start: [-4, 2],
    fn: (x, y) =>
      0.5 + (Math.cos(Math.sin(Math.abs(x ** 2 - y ** 2))) ** 2 - 0.5) / (1 + 0.001 * (x ** 2 + y ** 2)) ** 2,
  },
  {
    name: "Функция Гривенка",
    formula: "1 + (x^2 + y^2) / 4000 - cos(x) * cos(y / sqrt(2))",
    range: [-8, 8, -8, 8],
    start: [7, 7],
    fn: (x, y) => 1 + (x ** 2 + y ** 2) / 4000 - Math.cos(x) * Math.cos(y / Math.sqrt(2)),
  },
  {
    name: "Функция Drop-Wave",
    formula: "-(1 + cos(12 * sqrt(x^2 + y^2))) / (2 + 0.5 * (x^2 + y^2))",
    range: [-5.12, 5.12, -5.12, 5.12],
    start: [-4, -4],
    fn: (x, y) => -(1 + Math.cos(12 * Math.sqrt(x ** 2 + y ** 2))) / (2 + 0.5 * (x ** 2 + y ** 2)),
  },
  {
    name: "Функция Шуберта",
    formula:
      "(cos(2*x + 1) + 2*cos(3*x + 2) + 3*cos(4*x + 3) + 4*cos(5*x + 4) + 5*cos(6*x + 5)) * (cos(2*y + 1) + 2*cos(3*y + 2) + 3*cos(4*y + 3) + 4*cos(5*y + 4) + 5*cos(6*y + 5))",
    range: [-5.12, 5.12, -5.12, 5.12],
    start: [0, 0],
    fn: (x, y) =>
      (Math.cos(2 * x + 1) +
        2 * Math.cos(3 * x + 2) +
        3 * Math.cos(4 * x + 3) +
        4 * Math.cos(5 * x + 4) +
        5 * Math.cos(6 * x + 5)) *
      (Math.cos(2 * y + 1) +
        2 * Math.cos(3 * y + 2) +
        3 * Math.cos(4 * y + 3) +
        4 * Math.cos(5 * y + 4) +
        5 * Math.cos(6 * y + 5)),
  },
  {
    name: "Функция седловая",
    formula: "x^2 - y^2",
    range: [-5, 5, -5, 5],
    start: [4, 0.01],
    fn: (x, y) => x ** 2 - y ** 2,
  },
  {
    name: "Функция обезьянье седло",
    formula: "x^3 - 3*x*y^2",
    range: [-2, 2, -2, 2],
    start: [1.2, 0.01],
    fn: (x, y) => x ** 3 - 3 * x * y ** 2,
  },
  {
    name: "Функция шестигорбого верблюда",
    formula: "4*x^2 - 2.1*x^4 + x^6/3 + x*y - 4*y^2 + 4*y^4",
    range: [-2, 2, -1.5, 1.5],
    start: [-1.1, 1.0],
    fn: (x, y) => 4 * x ** 2 - 2.1 * x ** 4 + x ** 6 / 3 + x * y - 4 * y ** 2 + 4 * y ** 4,
  },
  {
    name: "Функция Захарова",
    formula: "x^2 + y^2 + (0.5*x + y)^2 + (0.5*x + y)^4",
    range: [-2, 2, -2, 2],
    start: [-1.5, 1.8],
    fn: (x, y) => x ** 2 + y ** 2 + (0.5 * x + y) ** 2 + (0.5 * x + y) ** 4,
  },
  {
    name: "Функция Швефеля",
    formula: "418.9829 * 2 - x * sin(sqrt(abs(x))) - y * sin(sqrt(abs(y)))",
    range: [-500, 500, -500, 500],
    start: [-100, -100],
    fn: (x, y) => 418.9829 * 2 - x * Math.sin(Math.sqrt(Math.abs(x))) - y * Math.sin(Math.sqrt(Math.abs(y))),
  },
  {
    name: "Функция Eggholder",
    formula: "-(y + 47) * sin(sqrt(abs(x / 2 + y + 47))) - x * sin(sqrt(abs(x - y - 47)))",
    range: [-512, 512, -512, 512],
    start: [0, 0],
    fn: (x, y) =>
      -(y + 47) * Math.sin(Math.sqrt(Math.abs(x / 2 + y + 47))) - x * Math.sin(Math.sqrt(Math.abs(x - y - 47))),
  },
  {
    name: "Функция Шекеля",
    formula:
      "-1/(0.1 + (x - 4)^2 + (y - 4)^2) - 1/(0.2 + (x - 1)^2 + (y - 1)^2) - 1/(0.2 + (x - 8)^2 + (y - 8)^2) - 1/(0.4 + (x - 6)^2 + (y - 6)^2) - 1/(0.4 + (x - 3)^2 + (y - 7)^2)",
    range: [0, 10, 0, 10],
    start: [2.5, 2.5],
    fn: (x, y) =>
      -1 / (0.1 + (x - 4) ** 2 + (y - 4) ** 2) -
      1 / (0.2 + (x - 1) ** 2 + (y - 1) ** 2) -
      1 / (0.2 + (x - 8) ** 2 + (y - 8) ** 2) -
      1 / (0.4 + (x - 6) ** 2 + (y - 6) ** 2) -
      1 / (0.4 + (x - 3) ** 2 + (y - 7) ** 2),
  },
  {
    name: "Функция Мишры-Бёрда",
    formula: "sin(y) * exp((1 - cos(x))^2) + cos(x) * exp((1 - sin(y))^2) + (x - y)^2",
    range: [-10, 0, -6.5, 0],
    start: [-8, -4],
    fn: (x, y) =>
      Math.sin(y) * Math.exp((1 - Math.cos(x)) ** 2) + Math.cos(x) * Math.exp((1 - Math.sin(y)) ** 2) + (x - y) ** 2,
  },
];
