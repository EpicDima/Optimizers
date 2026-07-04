"""Генерирует скриншоты примеров для README: images/example1.png (2D) и example2.png (3D).

Окно рисуется без экрана (offscreen) в двойном масштабе, поэтому картинки
получаются большими и чёткими, а результат не зависит от монитора.

Запуск из любого места:

    uv run python utils/make_readme_images.py
"""

import importlib.util
import os
import sys
from dataclasses import dataclass
from importlib.machinery import SourceFileLoader
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# переменные окружения должны быть выставлены до создания QApplication
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ.setdefault("QT_SCALE_FACTOR", "2")

WINDOW_SIZE = (997, 846)


@dataclass
class Scene:
    filename: str
    preset: str
    # [(имя оптимизатора, {параметр: значение поверх умолчаний})]
    optimizers: list[tuple[str, dict[str, str]]]
    start: tuple[float, float]
    steps: int
    threedimensional: bool
    # False — контуры, True — сплошная поверхность (осмысленно только в 3D)
    surface: bool
    # 0 — вся траектория, иначе показываются только последние tail шагов
    tail: int = 0


SCENES = [
    Scene(
        filename="example1.png",
        preset="Функция Розенброка",
        optimizers=[("Lion", {}), ("MARS", {}), ("Sophia", {})],
        start=(-1.2, 1),
        steps=300,
        threedimensional=False,
        surface=False,
    ),
    Scene(
        filename="example2.png",
        preset="Функция Стыбинского-Танга",
        optimizers=[("Momentum", {"lr": "0.01"}), ("Prodigy", {}), ("Sophia", {})],
        start=(4.5, -4.5),
        steps=100,
        threedimensional=True,
        surface=True,
    ),
]


def load_application_class():
    # main.pyw не импортируется обычным import из-за расширения
    spec = importlib.util.spec_from_loader("main", SourceFileLoader("main", str(ROOT / "main.pyw")))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.Application


def apply_scene(window, scene):
    window.set_standard_function(scene.preset)

    while len(window.optimizer_widget_list) < len(scene.optimizers):
        window.add_optimizer()
    while len(window.optimizer_widget_list) > len(scene.optimizers):
        window.remove_optimizer()
    for widget, (name, params) in zip(window.optimizer_widget_list, scene.optimizers):
        widget.combobox.setCurrentText(name)
        widget.change_optimizer()
        for key, value in params.items():
            widget.text_boxes_params[key][1].setText(value)

    window.initial_x_textedit.setText(str(scene.start[0]))
    window.initial_y_textedit.setText(str(scene.start[1]))
    window.steps_textedit.setText(str(scene.steps))
    window.tail_textedit.setText(str(scene.tail))
    window.three_dims_checkbox.setChecked(scene.threedimensional)
    window.graphics.contour_type = not scene.surface
    window.start()


def main():
    sys.path.insert(0, str(ROOT))
    # main.pyw открывает ресурсы по относительным путям
    os.chdir(ROOT)

    from PySide6.QtWidgets import QApplication

    app = QApplication(sys.argv)
    window = load_application_class()()
    window.resize(*WINDOW_SIZE)
    window.show()

    for scene in SCENES:
        apply_scene(window, scene)
        QApplication.processEvents()
        path = ROOT / "images" / scene.filename
        window.grab().save(str(path))
        print(f"{path.relative_to(ROOT)}: {scene.preset}")

    app.quit()


if __name__ == "__main__":
    main()
