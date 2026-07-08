import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = resolve(__dirname, "..", "images");

const PORT = 47913;
const BASE = `http://localhost:${PORT}`;

const RUNS = [
  { optimizer: "Adam", optimizerParams: { lr: 0.3, beta1: 0.9, beta2: 0.999, eps: 1e-8 }, scheduler: "Constant", schedulerParams: {}, start: [-4, 4], visible: true },
  { optimizer: "Momentum", optimizerParams: { lr: 0.005, coef: 0.9 }, scheduler: "Constant", schedulerParams: {}, start: [-4, 4], visible: true },
  { optimizer: "ADOPT", optimizerParams: { lr: 0.01, beta1: 0.9, beta2: 0.9999, eps: 0.000001 }, scheduler: "Constant", schedulerParams: {}, start: [-4, 4], visible: true },
];

const SCREENSHOTS = [
  {
    file: "example1.png",
    theme: "dark" as const,
    params: new URLSearchParams({
      preset: "Функция Химмельблау",
      dim: "2d",
      mode: "contour",
      levels: "30",
      cmap: "inferno",
      start: "-4,4",
      runs: JSON.stringify(RUNS),
    }),
  },
  {
    file: "example2.png",
    theme: "light" as const,
    params: new URLSearchParams({
      preset: "Функция Стыбинского-Танга",
      range: "-5,5,-5,5",
      dim: "3d",
      mode: "contour",
      levels: "30",
      cmap: "inferno",
      start: "1,1",
      runs: JSON.stringify(RUNS.map((r) => ({ ...r, start: [1, 1] }))),
    }),
  },
];

const VIEWPORT = { width: 1400, height: 860 };

async function waitForPlotly(page: import("playwright").Page) {
  await page.waitForFunction(
    () => document.querySelector(".js-plotly-plot .plot-container") !== null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(500);
}

async function runAndWait(page: import("playwright").Page) {
  await page.click('button:has-text("Start")');

  await page.waitForFunction(() => {
    const spans = document.querySelectorAll("span.font-mono");
    for (const s of spans) {
      const m = s.textContent?.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (m && m[1] === m[2] && Number(m[1]) > 0) return true;
    }
    return false;
  }, { timeout: 60_000 });

  await page.waitForTimeout(1000);
}

async function main() {
  const browser = await chromium.launch();

  for (const shot of SCREENSHOTS) {
    console.log(`Taking ${shot.file}...`);
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      colorScheme: shot.theme,
    });

    const page = await context.newPage();

    await page.addInitScript((theme: string) => {
      localStorage.setItem("optimizers-theme", JSON.stringify({ state: { theme }, version: 0 }));
    }, shot.theme);

    const url = `${BASE}/#/main?${shot.params}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await waitForPlotly(page);
    await runAndWait(page);

    await page.screenshot({
      path: resolve(IMAGES_DIR, shot.file),
      type: "png",
    });
    console.log(`  Saved ${shot.file}`);

    await context.close();
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
