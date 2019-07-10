import sys

import numpy as np
from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QApplication, QMainWindow, QFileDialog, QMessageBox

import optimizers
from dialogs import (
    PlotColormapDialog, PlotOptimizersDialog, PlotRangeDialog, PlotTypeDialog)
from Function import Function
from graphics import Graphics, MatplotlibWidget
from optimizers.Optimizer import Optimizer
from ui_templates.ui_mainwindow import Ui_MainWindow
from widgets import OptimizerListItem, OptimizerWidget

# pyuic5 optimizers_pyqt_ui.ui -o design.py

class Application(QMainWindow, Ui_MainWindow):
    def __init__(self):
        super().__init__()
        self.setupUi(self)
        self.setWindowFlags(Qt.CustomizeWindowHint | Qt.WindowMinimizeButtonHint | Qt.WindowCloseButtonHint)
        self.setFixedSize(self.frameGeometry().width(), self.frameGeometry().height())

        self.plot_widget = MatplotlibWidget(self.plot_widget)
        self.start_button.clicked.connect(self.start)

        self.add_button.clicked.connect(self.add_optimizer)
        self.remove_button.clicked.connect(self.remove_optimizer)

        self.list_of_optimizers = list(set(dir(optimizers)) - {"Optimizer", "__builtins__", "__cached__", "__doc__", "__file__", "__loader__", "__name__", "__package__", "__path__", "__spec__"})
        self.list_of_optimizers.sort()
        
        self.function = Function()
        self.graphics = Graphics(self.function)

        self.function_textedit.setText(self.function.raw_str_fx)

        self.animation_trigger_button.clicked.connect(self.change_animation_state)
        self.animation_trigger_button.hide()
        self.step_label.hide()

        self.graphics.end_animation_func = self.animation_trigger_button.hide
        self.graphics.step_function = self.change_step

        self.optimizer_widget_list = []
        self.add_optimizer()

        self.step_label.setParent(None)
        self.step_label.setParent(self.plot_widget)

        self.function_check_button.clicked.connect(self.plot_function)
        self.plot_function()

        self.new_optimizer.triggered.connect(self.add_new)
        self.base_optimizer.triggered.connect(self.save_base_optimizer)
        self.example_optimizer.triggered.connect(self.save_example_optimizer)

        self.plot_range.triggered.connect(self.plot_range_dialog)
        self.plot_type.triggered.connect(self.plot_type_dialog)
        self.plot_cmap.triggered.connect(self.plot_cmap_dialog)
        self.plot_optims.triggered.connect(self.plot_optims_dialog)

        self.about.triggered.connect(self.show_about)

        for name in self.function.standard_functions:
            (lambda name: self.functions_menu.addAction(name).triggered.connect(lambda: self.set_standard_function(name)))(name)

    
    def show_about(self):
        msg_box = QMessageBox()
        msg_box.setIcon(QMessageBox.Information)
        msg_box.setWindowTitle("О программе")
        msg_box.setText("Optimizers - программа для показа и тестирования алгоритмов нахождения минимума функции градиентными методами в трёхмерном пространстве.\n\n Сделал программу Дима :) Ссылка: vk.com/dddima10")
        msg_box.exec()


    def set_standard_function(self, function_name):
        self.function_textedit.setText(self.function.standard_functions[function_name])
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
        code = open("optimizers//Momentum.py", "r").read()
        self.save_optimizer(code[:5] + code[6:])


    def save_base_optimizer(self):
        self.save_optimizer(open("optimizers//Optimizer.py", "r").read())


    def save_optimizer(self, code):
        filedialog = QFileDialog()
        filedialog.setAcceptMode(QFileDialog.AcceptSave)
        filedialog.setFileMode(QFileDialog.AnyFile)
        if filedialog.exec_() == QFileDialog.Accepted:
            filename = filedialog.selectedFiles()[0]
            with open(filename, "w") as file:
                file.write(code)

    
    def add_new(self):
        filedialog = QFileDialog()
        filedialog.setAcceptMode(QFileDialog.AcceptOpen)
        filedialog.setFileMode(QFileDialog.ExistingFile)
        if filedialog.exec_() == QFileDialog.Accepted:
            filename = filedialog.selectedFiles()[0]
            self.validate(open(filename, "r").read())

    
    def validate(self, code):
        self.statusbar.showMessage("")
        if code.count("class") != 1:
            self.statusbar.showMessage("Выбранный файл содержит некорректный код!")
            return
        
        begin_idx = code.find("class")
        code = code[begin_idx:]
        begin_idx = 6
        end_idx = code.find("(")
        name = code[begin_idx:end_idx].strip()

        try:
            exec(code)
        except:
            self.statusbar.showMessage("Выбранный файл содержит некорректный код!")
            return

        try:
            list(optimizers.__dict__.keys()).index(name)
        except:
            pass
        else:
            self.statusbar.showMessage("Оптимизатор с таким именем уже существует!")
            return

        optimizers.__dict__[name] = eval(name)

        self.list_of_optimizers.append(name)
        self.list_of_optimizers.sort()

        for widget in self.optimizer_widget_list:
            widget.refresh_optimizers()

        self.statusbar.showMessage("Новый оптимизатор успешно добавлен!")


    def plot_function(self):
        self.step_label.hide()
        self.check_function()
        self.graphics.threedimensional = self.three_dims_checkbox.isChecked()

        self.plot_widget.canvas.ax.clear()
        self.plot_widget.canvas.create_subplot(self.graphics.threedimensional)
        self.graphics.draw_function_plot(self.plot_widget.canvas.ax)
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

        steps = self.safe_input(self.steps_textedit.text(), int, 100, "Неправильное количество шагов (steps)! Используется 100 по умолчанию")

        xs, ys = [], []
        names = []

        for widget in self.optimizer_widget_list:
            widget.get_params()
            if self.reset_checkbox.isChecked():
                widget.reset_optimizer()

            points_x, points_y = widget.optimize(steps)
            xs.append(points_x)
            ys.append(points_y)

            names.append(widget.get_params_in_string_form())

        self.plot(xs, ys, names)


    def get_initial_coordinate(self, optimizer):
        initial_x = self.safe_input(self.initial_x_textedit.text(), float, optimizer.initial_x[0], "Неправильное начальное значение X!")
        initial_y = self.safe_input(self.initial_y_textedit.text(), float, optimizer.initial_x[1], "Неправильное начальное значение Y!")
        return np.array([initial_x, initial_y])


    def change_animation_state(self):
        if self.graphics.animation is not None:
            if self.animation_trigger_button.text() == "Pause":
                self.graphics.animation.event_source.stop()
                self.animation_trigger_button.setText("Continue")
            else:
                self.graphics.animation.event_source.start()
                self.animation_trigger_button.setText("Pause")


    def change_step(self, step):
        self.step_label.setText("Step: {}".format(step))


    def plot(self, xs, ys, names):
        self.graphics.threedimensional = self.three_dims_checkbox.isChecked()
        self.graphics.anime = self.animation_checkbox.isChecked()
        self.graphics.animation = None

        if self.graphics.anime:
            self.animation_trigger_button.setText("Pause")
            self.animation_trigger_button.show()
            self.step_label.show()
        else:
            self.animation_trigger_button.hide()
            self.step_label.hide()

        self.plot_widget.canvas.ax.clear()
        self.plot_widget.canvas.create_subplot(self.graphics.threedimensional)

        self.graphics.draw_plot(self.plot_widget.canvas.ax, np.array(xs), ys, self.plot_widget.canvas, names)
        self.plot_widget.canvas.draw()
        

    def add_optimizer(self):
        self.statusbar.showMessage("")
        if len(self.optimizer_widget_list) >= len(self.graphics.colors):
            self.statusbar.showMessage("Максимальное количество оптимизаторов {} достигнуто!".format(len(self.graphics.colors)))
            return
        widget = OptimizerWidget(self, optimizers, self.list_of_optimizers)
        item = OptimizerListItem(widget, self.optimizers_listview)
        self.optimizers_listview.addItem(item)
        self.optimizers_listview.setItemWidget(item, widget)
        self.optimizer_widget_list.append(widget)


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
    app.exec_()
