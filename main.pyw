import importlib.util
import sys
from pathlib import Path

import numpy as np
from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QApplication,
    QFileDialog,
    QGridLayout,
    QHBoxLayout,
    QMainWindow,
    QMessageBox,
    QVBoxLayout,
)

import optimizers
from dialogs import PlotColormapDialog, PlotOptimizersDialog, PlotRangeDialog, PlotTypeDialog
from Function import Function
from graphics import Graphics, MatplotlibWidget
from optimizers.Optimizer import Optimizer
from ui_templates.ui_mainwindow import Ui_MainWindow
from widgets import OptimizerListItem, OptimizerWidget

# pyside6-uic ui_templates/optimizers_pyqt_ui.ui -o ui_templates/ui_mainwindow.py


class Application(QMainWindow, Ui_MainWindow):
    def __init__(self):
        super().__init__()
        self.setupUi(self)
        self.setWindowFlags(
            Qt.WindowType.CustomizeWindowHint
            | Qt.WindowType.WindowMinimizeButtonHint
            | Qt.WindowType.WindowMaximizeButtonHint
            | Qt.WindowType.WindowCloseButtonHint
        )
        # окно можно растягивать больше стандартного размера, но не меньше
        self.setMinimumSize(self.size())

        placeholder = self.plot_widget
        self.plot_widget = MatplotlibWidget()
        self.build_layout()
        placeholder.hide()
        placeholder.deleteLater()

        self.start_button.clicked.connect(self.start)

        self.add_button.clicked.connect(self.add_optimizer)
        self.remove_button.clicked.connect(self.remove_optimizer)

        self.list_of_optimizers = list(
            set(dir(optimizers))
            - {
                "Optimizer",
                "__builtins__",
                "__cached__",
                "__doc__",
                "__file__",
                "__loader__",
                "__name__",
                "__package__",
                "__path__",
                "__spec__",
            }
        )
        self.list_of_optimizers.sort()

        self.function = Function()
        self.graphics = Graphics(self.function)

        self.function_textedit.setText(self.function.raw_str_fx)

        self.animation_trigger_button.clicked.connect(self.change_animation_state)
        self.animation_trigger_button.hide()
        self.step_label.hide()

        self.speed_slider.valueChanged.connect(self.change_speed)
        self.change_speed(self.speed_slider.value())

        self.tail_textedit.textChanged.connect(self.change_tail)

        self.initial_x_textedit.textChanged.connect(self.preview_start_point)
        self.initial_y_textedit.textChanged.connect(self.preview_start_point)

        self.graphics.end_animation_func = self.animation_trigger_button.hide
        self.graphics.step_function = self.change_step

        self.optimizer_widget_list = []
        # стартовая пара с контрастным поведением на функции Химмельблау:
        # Adam аккуратно сходится в ближний минимум (3, 2), а Momentum
        # по инерции перелетает седло и петлёй закручивается в (3.58, -1.85)
        self.add_optimizer()
        self.add_optimizer()
        self.setup_default_optimizer(0, "Adam", {"lr": 0.3})
        self.setup_default_optimizer(1, "Momentum", {"lr": 0.005})

        self.function_check_button.clicked.connect(self.plot_function)
        self.set_standard_function("Функция Химмельблау")

        self.new_optimizer.triggered.connect(self.add_new)
        self.base_optimizer.triggered.connect(self.save_base_optimizer)
        self.example_optimizer.triggered.connect(self.save_example_optimizer)

        self.plot_range.triggered.connect(self.plot_range_dialog)
        self.plot_type.triggered.connect(self.plot_type_dialog)
        self.plot_cmap.triggered.connect(self.plot_cmap_dialog)
        self.plot_optims.triggered.connect(self.plot_optims_dialog)

        self.about.triggered.connect(self.show_about)

        for name in self.function.standard_functions:
            (
                lambda name: self.functions_menu.addAction(name).triggered.connect(
                    lambda: self.set_standard_function(name)
                )
            )(name)

    def build_layout(self):
        # виджеты из .ui расставлены абсолютными координатами и не умеют
        # растягиваться — здесь они собираются в layout'ы заново
        left = QVBoxLayout()

        # метка шага живёт в отдельной строке над графиком; место под неё
        # резервируется всегда, чтобы график не прыгал при показе анимации
        size_policy = self.step_label.sizePolicy()
        size_policy.setRetainSizeWhenHidden(True)
        self.step_label.setSizePolicy(size_policy)
        left.addWidget(self.step_label, alignment=Qt.AlignmentFlag.AlignHCenter)
        left.addWidget(self.plot_widget, stretch=1)

        controls = QGridLayout()
        controls.addWidget(self.three_dims_checkbox, 0, 0)
        controls.addWidget(self.initial_x_textedit, 0, 1)
        controls.addWidget(self.label, 0, 2)
        controls.addWidget(self.steps_textedit, 0, 3)
        controls.addWidget(self.label_3, 0, 4)
        controls.addWidget(self.tail_textedit, 0, 5)
        controls.addWidget(self.label_5, 0, 6)
        controls.addWidget(self.animation_checkbox, 1, 0)
        controls.addWidget(self.initial_y_textedit, 1, 1)
        controls.addWidget(self.label_2, 1, 2)
        controls.addWidget(self.speed_slider, 1, 3)
        controls.addWidget(self.speed_label, 1, 4)
        tail_tooltip = "Сколько последних шагов показывать на графике и в анимации (0 — все)"
        self.tail_textedit.setToolTip(tail_tooltip)
        self.label_5.setToolTip(tail_tooltip)
        # ширина резервируется под самый длинный текст, иначе колонка
        # дёргается при смене множителя скорости
        self.speed_label.setMinimumWidth(self.speed_label.fontMetrics().horizontalAdvance("Speed ×0.125"))
        controls.setColumnStretch(7, 1)
        left.addLayout(controls)

        function_row = QHBoxLayout()
        function_row.addWidget(self.function_textedit, stretch=1)
        function_row.addWidget(self.label_4)
        left.addLayout(function_row)

        for button in (
            self.remove_button,
            self.add_button,
            self.function_check_button,
            self.animation_trigger_button,
            self.start_button,
        ):
            button.setMinimumSize(120, 32)

        right = QVBoxLayout()
        self.optimizers_listview.setMinimumWidth(291)
        right.addWidget(self.optimizers_listview, stretch=1)

        list_buttons_row = QHBoxLayout()
        list_buttons_row.addWidget(self.remove_button)
        list_buttons_row.addStretch()
        list_buttons_row.addWidget(self.add_button)
        right.addLayout(list_buttons_row)

        function_check_row = QHBoxLayout()
        function_check_row.addStretch()
        function_check_row.addWidget(self.function_check_button)
        right.addLayout(function_check_row)

        # место под скрытую кнопку паузы резервируется всегда, иначе при её
        # появлении правый блок меняет геометрию
        size_policy = self.animation_trigger_button.sizePolicy()
        size_policy.setRetainSizeWhenHidden(True)
        self.animation_trigger_button.setSizePolicy(size_policy)

        start_row = QHBoxLayout()
        start_row.addWidget(self.animation_trigger_button)
        start_row.addStretch()
        start_row.addWidget(self.reset_checkbox)
        start_row.addWidget(self.start_button)
        right.addLayout(start_row)

        layout = QHBoxLayout(self.centralwidget)
        layout.addLayout(left, stretch=1)
        layout.addLayout(right)

    def show_about(self):
        msg_box = QMessageBox()
        msg_box.setIcon(QMessageBox.Icon.Information)
        msg_box.setWindowTitle("О программе")
        msg_box.setText(
            "Optimizers - программа для показа и тестирования алгоритмов нахождения минимума функции градиентными методами в трёхмерном пространстве."
        )
        msg_box.exec()

    def set_standard_function(self, function_name):
        preset = self.function.standard_functions[function_name]
        self.function.set_params((*preset.range, self.function.count))
        self.function.create_surface()
        self.initial_x_textedit.setText(str(preset.start[0]))
        self.initial_y_textedit.setText(str(preset.start[1]))
        self.function_textedit.setText(preset.formula)
        self.plot_function()

    def plot_range_dialog(self):
        self.w = PlotRangeDialog(self, self.function, self.plot_function)
        self.w.show()

    def plot_type_dialog(self):
        self.w = PlotTypeDialog(self, self.graphics, self.plot_function)
        self.w.show()

    def plot_cmap_dialog(self):
        self.w = PlotColormapDialog(self, self.graphics, self.plot_function)
        self.w.show()

    def plot_optims_dialog(self):
        self.w = PlotOptimizersDialog(self, self.graphics)
        self.w.show()

    def save_example_optimizer(self):
        code = open("optimizers/Momentum.py").read()
        self.save_optimizer(code.replace("from .Optimizer import", "from optimizers.Optimizer import", 1))

    def save_base_optimizer(self):
        self.save_optimizer(open("optimizers/Optimizer.py").read())

    def save_optimizer(self, code):
        filedialog = QFileDialog()
        filedialog.setAcceptMode(QFileDialog.AcceptMode.AcceptSave)
        filedialog.setFileMode(QFileDialog.FileMode.AnyFile)
        if filedialog.exec() == QFileDialog.DialogCode.Accepted:
            filename = filedialog.selectedFiles()[0]
            with open(filename, "w") as file:
                file.write(code)

    def add_new(self):
        filedialog = QFileDialog()
        filedialog.setAcceptMode(QFileDialog.AcceptMode.AcceptOpen)
        filedialog.setFileMode(QFileDialog.FileMode.ExistingFile)
        if filedialog.exec() == QFileDialog.DialogCode.Accepted:
            self.load_optimizer(filedialog.selectedFiles()[0])

    def load_optimizer(self, filename):
        self.statusbar.showMessage("")

        try:
            spec = importlib.util.spec_from_file_location(f"user_optimizers.{Path(filename).stem}", filename)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
        except Exception:
            self.statusbar.showMessage("Выбранный файл содержит некорректный код!")
            return

        classes = [
            obj
            for obj in vars(module).values()
            if isinstance(obj, type) and issubclass(obj, Optimizer) and obj is not Optimizer
        ]
        if len(classes) != 1:
            self.statusbar.showMessage("В файле должен быть ровно один класс-наследник Optimizer!")
            return
        optimizer_class = classes[0]
        name = optimizer_class.__name__

        if hasattr(optimizers, name):
            self.statusbar.showMessage("Оптимизатор с таким именем уже существует!")
            return

        try:
            optimizer_class(np.array([0.0, 0.0]), self.function)
        except Exception:
            self.statusbar.showMessage("Не удалось создать оптимизатор с параметрами по умолчанию!")
            return

        setattr(optimizers, name, optimizer_class)

        self.list_of_optimizers.append(name)
        self.list_of_optimizers.sort()

        for widget in self.optimizer_widget_list:
            widget.refresh_optimizers()

        self.statusbar.showMessage("Новый оптимизатор успешно добавлен!")

    def plot_function(self):
        self.stop_animation()
        self.animation_trigger_button.hide()
        self.step_label.hide()
        self.check_function()
        self.graphics.threedimensional = self.three_dims_checkbox.isChecked()

        self.plot_widget.canvas.create_subplot(self.graphics.threedimensional)
        self.graphics.draw_function_plot(self.plot_widget.canvas.ax)
        self.plot_widget.canvas.draw()
        self.preview_start_point()

    def preview_start_point(self):
        # кружок стартовой точки двигается по графику сразу при правке полей;
        # пока в поле недописанное число, маркер остаётся на прежнем месте
        x = self.safe_input(self.initial_x_textedit.text(), float, None)
        y = self.safe_input(self.initial_y_textedit.text(), float, None)
        if x is None or y is None:
            return
        self.graphics.move_start_marker(self.plot_widget.canvas.ax, x, y)
        # у идущей блит-анимации фон закеширован ещё без сдвинутого маркера,
        # и следующий кадр затёр бы маркер восстановленным фоном — сброс кеша
        # заставляет перезахватить фон после полной перерисовки
        cache = getattr(self.graphics.animation, "_blit_cache", None)
        if cache is not None:
            cache.clear()
        self.plot_widget.canvas.draw()

    def check_function(self):
        self.statusbar.showMessage("")
        code = self.function.check_function(self.function_textedit.text())
        if code == 0:
            self.statusbar.showMessage("Неправильная функция! Используется последняя корректная функция!")
        elif code == 2:
            for widget in self.optimizer_widget_list:
                widget.reset_optimizer()

    def start(self):
        self.check_function()

        steps = self.safe_input(
            self.steps_textedit.text(), int, 100, "Неправильное количество шагов (steps)! Используется 100 по умолчанию"
        )

        xs, ys, lrs = [], [], []
        names = []

        for widget in self.optimizer_widget_list:
            widget.get_params()
            if self.reset_checkbox.isChecked():
                widget.reset_optimizer()

            points_x, points_y, points_lr = widget.optimize(steps)
            xs.append(points_x)
            ys.append(points_y)
            lrs.append(points_lr)

            names.append(widget.get_params_in_string_form())

        self.plot(xs, ys, names, lrs)

    def get_initial_coordinate(self, optimizer):
        initial_x = self.safe_input(
            self.initial_x_textedit.text(), float, optimizer.initial_x[0], "Неправильное начальное значение X!"
        )
        initial_y = self.safe_input(
            self.initial_y_textedit.text(), float, optimizer.initial_x[1], "Неправильное начальное значение Y!"
        )
        return np.array([initial_x, initial_y])

    def stop_animation(self):
        # незавершённая анимация продолжает рисовать по таймеру на том же
        # холсте и накладывается на новый график; у доигравшей до конца
        # event_source уже обнулён самим matplotlib.
        # Остановки одного таймера недостаточно: у забличенной анимации
        # остаётся подписка на resize холста, которая перезапустила бы таймер
        # при изменении размера окна — _stop() отключает и её
        if self.graphics.animation is not None:
            if self.graphics.animation.event_source is not None:
                self.graphics.animation._stop()
            self.graphics.animation = None

    def change_animation_state(self):
        if self.graphics.animation is not None:
            if self.animation_trigger_button.text() == "Pause":
                self.graphics.animation.event_source.stop()
                self.animation_trigger_button.setText("Continue")
            else:
                self.graphics.animation.event_source.start()
                self.animation_trigger_button.setText("Pause")

    def change_speed(self, value):
        # замедление растягивает интервал таймера; ускорение сначала учащает
        # таймер (до ~60 кадров/с), а дальше пропускает шаги между кадрами.
        # Применяется на лету: интервал — через event_source, пропуск шагов
        # генератор кадров читает сам на каждом тике
        speed = 2.0**value
        interval = max(15, round(30 / speed))
        self.graphics.interval = interval
        self.graphics.frames_per_tick = max(1, round(speed * interval / 30))
        self.speed_label.setText(f"Speed ×{speed:g}")
        animation = self.graphics.animation
        if animation is not None and animation.event_source is not None:
            animation.event_source.interval = interval

    def change_step(self, step):
        self.step_label.setText(f"Step: {step}")

    def change_tail(self):
        # длина хвоста читается анимацией на каждом кадре, поэтому идущая
        # анимация подхватывает новое значение сразу; статичный график —
        # при следующем построении. Недописанное число молча игнорируется
        value = self.safe_input(self.tail_textedit.text(), int, None)
        if value is not None and value >= 0:
            self.graphics.not_disappearing = value

    def plot(self, xs, ys, names, lrs):
        self.stop_animation()
        self.graphics.threedimensional = self.three_dims_checkbox.isChecked()
        self.graphics.anime = self.animation_checkbox.isChecked()

        if self.graphics.anime:
            self.animation_trigger_button.setText("Pause")
            self.animation_trigger_button.show()
            self.step_label.show()
        else:
            self.animation_trigger_button.hide()
            self.step_label.hide()

        self.plot_widget.canvas.create_subplot(self.graphics.threedimensional)

        self.graphics.draw_plot(self.plot_widget.canvas.ax, np.array(xs), ys, self.plot_widget.canvas, names, lrs)
        self.apply_optimizers_visibility()

    def apply_optimizers_visibility(self):
        # скрытие/показ переключается на линиях последнего построения без
        # пересчёта; при несовпадении списков (виджет добавили или убрали
        # после построения) лишние элементы просто пропускаются
        for widget, line in zip(self.optimizer_widget_list, self.graphics.lines):
            line.set_visible(widget.visibility_checkbox.isChecked())
        # как и в preview_start_point: фон блит-анимации закеширован, после
        # полной перерисовки его нужно перезахватить
        cache = getattr(self.graphics.animation, "_blit_cache", None)
        if cache is not None:
            cache.clear()
        self.plot_widget.canvas.draw()

    def add_optimizer(self):
        self.statusbar.showMessage("")
        if len(self.optimizer_widget_list) >= len(self.graphics.colors):
            self.statusbar.showMessage(f"Максимальное количество оптимизаторов {len(self.graphics.colors)} достигнуто!")
            return
        widget = OptimizerWidget(self, optimizers, self.list_of_optimizers)
        item = OptimizerListItem(widget, self.optimizers_listview)
        self.optimizers_listview.addItem(item)
        self.optimizers_listview.setItemWidget(item, widget)
        self.optimizer_widget_list.append(widget)

    def setup_default_optimizer(self, index, name, params):
        widget = self.optimizer_widget_list[index]
        widget.combobox.setCurrentText(name)
        widget.change_optimizer()
        for key, value in params.items():
            widget.text_boxes_params[key][1].setText(str(value))

    def remove_optimizer(self):
        self.statusbar.showMessage("")
        if len(self.optimizer_widget_list) <= 1:
            self.statusbar.showMessage("Минимальное количество оптимизаторов 1 достигнуто!")
            return
        self.optimizers_listview.takeItem(len(self.optimizer_widget_list) - 1)
        self.optimizer_widget_list.pop()

    def safe_input(self, text_value, type, default, error_text=None):
        try:
            value = type(text_value)
        except ValueError:
            if error_text is not None:
                self.statusbar.showMessage(error_text)
            return default
        return value


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = Application()
    window.show()
    app.exec()
