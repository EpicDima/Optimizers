from PySide6.QtCore import QSize, Qt
from PySide6.QtWidgets import QCheckBox, QComboBox, QGridLayout, QHBoxLayout, QLabel, QLineEdit, QVBoxLayout, QWidget

import schedulers
from schedulers.Scheduler import Scheduler


class OptimizerWidget(QWidget):
    def __init__(self, app, optimizers, optimizers_list, parent=None):
        super().__init__(parent)

        self.app = app
        self.optimizers = optimizers
        self.optimizers_list = optimizers_list

        self.vbl = QVBoxLayout()
        self.vbl.setContentsMargins(5, 5, 5, 25)

        self.combobox = QComboBox()
        self.grid = QGridLayout()

        # переключение видимости действует сразу на уже построенный график,
        # без пересчёта — удобно различать наложившиеся траектории
        self.visibility_checkbox = QCheckBox()
        self.visibility_checkbox.setChecked(True)
        self.visibility_checkbox.setToolTip("Показывать траекторию на графике")
        self.visibility_checkbox.toggled.connect(self.app.apply_optimizers_visibility)

        scheduler_tooltip = "Расписание скорости обучения (lr) по шагам"
        self.scheduler_label = QLabel("Scheduler")
        self.scheduler_label.setToolTip(scheduler_tooltip)
        self.scheduler_combobox = QComboBox()
        self.scheduler_combobox.setToolTip(scheduler_tooltip)
        self.scheduler_grid = QGridLayout()

        combobox_row = QHBoxLayout()
        combobox_row.addWidget(self.visibility_checkbox)
        combobox_row.addWidget(self.combobox, stretch=1)
        combobox_row.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.vbl.addLayout(combobox_row)
        self.vbl.addLayout(self.grid)
        scheduler_row = QHBoxLayout()
        scheduler_row.addWidget(self.scheduler_label)
        scheduler_row.addWidget(self.scheduler_combobox, stretch=1)
        scheduler_row.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.vbl.addLayout(scheduler_row)
        self.vbl.addLayout(self.scheduler_grid)
        self.setLayout(self.vbl)

        self.combobox.activated.connect(self.change_optimizer)
        self.refresh_optimizers()
        self.text_boxes_params = {}

        self.scheduler_combobox.activated.connect(self.change_scheduler)
        self.refresh_schedulers()
        self.text_boxes_scheduler_params = {}

        self.item = None
        self.change_scheduler()
        self.change_optimizer()

    def refresh_optimizers(self):
        self.combobox.clear()
        self.combobox.addItems(self.optimizers_list)

    def refresh_schedulers(self):
        schedulers_list = ["Constant"] + sorted(
            (
                name
                for name in dir(schedulers)
                if name not in ("Scheduler", "Constant")
                and isinstance(getattr(schedulers, name), type)
                and issubclass(getattr(schedulers, name), Scheduler)
            ),
            key=str.lower,
        )
        self.scheduler_combobox.clear()
        self.scheduler_combobox.addItems(schedulers_list)

    def set_item(self, item):
        self.item = item
        self.set_item_size()

    def set_item_size(self):
        if self.item is not None:
            self.item.setSizeHint(QSize(0, self.frameGeometry().height()))

    def change_optimizer(self, index=None):
        for key in self.text_boxes_params:
            self.text_boxes_params[key][0].setParent(None)
            self.text_boxes_params[key][1].setParent(None)

        self.optimizer = self.optimizers.__dict__[self.combobox.currentText()]([0, 0], self.app.function)
        self.reset_optimizer()
        self.text_boxes_params = {}
        for line, key in enumerate(self.optimizer.params):
            label = QLabel(self)
            label.setText(key)

            edit = QLineEdit(self)
            edit.setText(str(self.optimizer.params[key]))

            description = self.optimizer.param_descriptions.get(key)
            if description:
                label.setToolTip(description)
                edit.setToolTip(description)

            self.grid.addWidget(label, line, 0, Qt.AlignmentFlag.AlignTop)
            self.grid.addWidget(edit, line, 1, Qt.AlignmentFlag.AlignTop)

            self.text_boxes_params[key] = [label, edit]

        # расписание имеет смысл только для оптимизаторов с параметром lr
        has_lr = "lr" in self.optimizer.params
        self.scheduler_label.setEnabled(has_lr)
        self.scheduler_combobox.setEnabled(has_lr)

        self.update_size()

    def change_scheduler(self, index=None):
        for key in self.text_boxes_scheduler_params:
            self.text_boxes_scheduler_params[key][0].setParent(None)
            self.text_boxes_scheduler_params[key][1].setParent(None)

        self.scheduler = getattr(schedulers, self.scheduler_combobox.currentText())()
        self.text_boxes_scheduler_params = {}
        for line, key in enumerate(self.scheduler.params):
            label = QLabel(self)
            label.setText(key)

            edit = QLineEdit(self)
            edit.setText(str(self.scheduler.params[key]))

            description = self.scheduler.param_descriptions.get(key)
            if description:
                label.setToolTip(description)
                edit.setToolTip(description)

            self.scheduler_grid.addWidget(label, line, 0, Qt.AlignmentFlag.AlignTop)
            self.scheduler_grid.addWidget(edit, line, 1, Qt.AlignmentFlag.AlignTop)

            self.text_boxes_scheduler_params[key] = [label, edit]

        self.update_size()

    def update_size(self):
        rows = len(self.text_boxes_params) + len(self.text_boxes_scheduler_params)
        self.resize(self.frameGeometry().width(), 85 + rows * 25)
        self.set_item_size()

    def reset_optimizer(self):
        self.optimizer.initial_x = self.app.get_initial_coordinate(self.optimizer)
        self.optimizer.reset()

    def get_params(self):
        for key in self.optimizer.params:
            self.optimizer.params[key] = self.app.safe_input(
                self.text_boxes_params[key][1].text(),
                float,
                self.optimizer.params[key],
                f"Неправильное значение параметра {key}",
            )
        for key in self.scheduler.params:
            self.scheduler.params[key] = self.app.safe_input(
                self.text_boxes_scheduler_params[key][1].text(),
                float,
                self.scheduler.params[key],
                f"Неправильное значение параметра {key} расписания",
            )

    def get_params_in_string_form(self):
        s = self.wrap_params_line(self.optimizer.__class__.__name__ + " " + str(self.optimizer.params))
        if "lr" in self.optimizer.params and not isinstance(self.scheduler, schedulers.Constant):
            s += "\n" + self.wrap_params_line(
                "+ " + self.scheduler.__class__.__name__ + " " + str(self.scheduler.params)
            )
        return s

    @staticmethod
    def wrap_params_line(s, width=42):
        # жадный перенос по запятым, чтобы легенда не вылезала за край графика
        parts = s.replace("'", "").split(", ")
        lines = [parts[0]]
        for part in parts[1:]:
            if len(lines[-1]) + len(part) + 2 <= width:
                lines[-1] += ", " + part
            else:
                lines[-1] += ","
                lines.append(part)
        return "\n".join(lines)

    def optimize(self, steps):
        points_x = [self.optimizer.x]
        points_y = [self.optimizer.function(self.optimizer.x)]
        # расписание подменяет lr перед каждым шагом; base_lr из поля ввода
        # восстанавливается после прогона, чтобы поле не «уплывало».
        # points_lr выровнен с точками: points_lr[k] — lr шага, приведшего
        # в точку k (нулевая точка стартовая, для неё lr первого шага)
        base_lr = self.optimizer.params.get("lr")
        points_lr = None if base_lr is None else [self.scheduler.lr(0, steps, base_lr)]
        for i in range(steps):
            if base_lr is not None:
                current_lr = self.scheduler.lr(i, steps, base_lr)
                self.optimizer.params["lr"] = current_lr
                points_lr.append(current_lr)
            x, y = self.optimizer.next_point()
            points_x.append(x)
            points_y.append(y)
        if base_lr is not None:
            self.optimizer.params["lr"] = base_lr
        return points_x, points_y, points_lr
