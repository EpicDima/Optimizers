"""Разовая генерация web/public/colormaps.json из палитр matplotlib.

Список берётся из graphics.Graphics.colormaps. Палитры matplotlib не
меняются между запросами, поэтому это build-time артефакт, а не
рантайм-эндпоинт — запускать заново только если список палитр поменяется.

Запуск: uv run python scripts/generate_colormaps.py
"""

import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap, to_hex

from graphics.Graphics import Graphics

# ListedColormap с небольшим числом цветов — качественная палитра без
# порядка (contourf рисует ею дискретные полосы, не градиент); viridis и
# подобные тоже ListedColormap, но с N=256, поэтому неотличимы от градиента
QUALITATIVE_MAX_N = 32
CONTINUOUS_STOPS = 32

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "web" / "public" / "colormaps.json"


def build_entry(name: str) -> dict:
    cmap = plt.get_cmap(name)
    is_qualitative = isinstance(cmap, ListedColormap) and cmap.N <= QUALITATIVE_MAX_N

    if is_qualitative:
        colors = [to_hex(cmap(i)) for i in range(cmap.N)]
        stops = []
        for i, color in enumerate(colors):
            stops.append([i / cmap.N, color])
            stops.append([(i + 1) / cmap.N, color])
    else:
        stops = [[i / (CONTINUOUS_STOPS - 1), to_hex(cmap(i / (CONTINUOUS_STOPS - 1)))] for i in range(CONTINUOUS_STOPS)]

    return {"type": "qualitative" if is_qualitative else "continuous", "stops": stops}


def main() -> None:
    # Graphics.colormaps не зависит от function — реальная поверхность здесь не нужна
    instance = Graphics(function=None)
    data = {name: build_entry(name) for name in instance.colormaps}

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {len(data)} colormaps to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
