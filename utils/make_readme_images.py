"""Генерирует скриншоты примеров для README: images/example1.png (2D) и example2.png (3D).

Окно рисуется без экрана (offscreen) в двойном масштабе, поэтому картинки
получаются большими и чёткими, а результат не зависит от монитора.

Запуск из любого места:

    uv run python utils/make_readme_images.py
"""

import importlib.util
import os
import sys
from dataclasses import dataclass, field
from importlib.machinery import SourceFileLoader
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# переменные окружения должны быть выставлены до создания QApplication
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ.setdefault("QT_SCALE_FACTOR", "2")

WINDOW_SIZE = (1250, 940)


@dataclass
class OptimizerSpec:
    name: str
    # значения параметров поверх умолчаний оптимизатора
    params: dict[str, str] = field(default_factory=dict)
    scheduler: str = "Constant"
    scheduler_params: dict[str, str] = field(default_factory=dict)


@dataclass
class Scene:
    filename: str
    preset: str
    optimizers: list[OptimizerSpec]
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
        optimizers=[
            OptimizerSpec("Lion"),
            OptimizerSpec("MARS"),
            OptimizerSpec("Sophia", scheduler="CosineWarmRestarts"),
        ],
        start=(-1.2, 1),
        steps=300,
        threedimensional=False,
        surface=False,
    ),
    Scene(
        filename="example2.png",
        preset="Функция Стыбинского-Танга",
        optimizers=[
            OptimizerSpec("Momentum", {"lr": "0.01"}, scheduler="OneCycle"),
            OptimizerSpec("Prodigy"),
            OptimizerSpec("Sophia"),
        ],
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
    for widget, spec in zip(window.optimizer_widget_list, scene.optimizers):
        widget.combobox.setCurrentText(spec.name)
        widget.change_optimizer()
        for key, value in spec.params.items():
            widget.text_boxes_params[key][1].setText(value)
        widget.scheduler_combobox.setCurrentText(spec.scheduler)
        widget.change_scheduler()
        for key, value in spec.scheduler_params.items():
            widget.text_boxes_scheduler_params[key][1].setText(value)

    window.initial_x_textedit.setText(str(scene.start[0]))
    window.initial_y_textedit.setText(str(scene.start[1]))
    window.steps_textedit.setText(str(scene.steps))
    window.tail_textedit.setText(str(scene.tail))
    # анимация включена по умолчанию, а скриншоту нужны готовые траектории
    window.animation_checkbox.setChecked(False)
    window.three_dims_checkbox.setChecked(scene.threedimensional)
    window.graphics.contour_type = not scene.surface
    window.start()


def main():
    sys.path.insert(0, str(ROOT))
    # main.pyw открывает ресурсы по относительным путям
    os.chdir(ROOT)

    from PySide6.QtWidgets import QApplication

    app = QApplication(sys.argv)
    if sys.platform == "darwin":
        # платформа offscreen просит несуществующее на macOS семейство
        # «Sans Serif», из-за чего Qt ~150 мс строит таблицу алиасов
        # шрифтов; явное указание системного шрифта (в него и разрешается
        # «Sans Serif») убирает задержку, не меняя вид скриншотов
        font = app.font()
        font.setFamily(".AppleSystemUIFont")
        app.setFont(font)
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
